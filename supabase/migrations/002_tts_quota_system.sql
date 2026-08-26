-- Per-user TTS usage tracking
create table if not exists public.tts_usage (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  chars_used    int  not null,
  voice         text,
  month         text not null,  -- 'YYYY-MM'
  created_at    timestamptz not null default now()
);

create index idx_tts_usage_user_month
  on public.tts_usage (user_id, month, created_at desc);

-- Aggregate view for quota dashboard
create or replace view public.tts_monthly_stats as
  select
    month,
    count(distinct user_id)   as unique_users,
    sum(chars_used)           as total_chars,
    count(*)                  as total_requests,
    avg(chars_used)           as avg_chars_per_request
  from public.tts_usage
  group by month
  order by month desc;

-- Per-user monthly usage view
create or replace view public.tts_user_stats as
  select
    user_id,
    month,
    sum(chars_used)  as chars_used,
    count(*)         as request_count
  from public.tts_usage
  group by user_id, month;

-- RLS
alter table public.tts_usage enable row level security;

create policy "users_read_own_tts_usage"
  on public.tts_usage for select
  using (auth.uid() = user_id);

create policy "service_role_all_tts_usage"
  on public.tts_usage for all
  using (auth.role() = 'service_role');

-- Global monthly budget tracking
create table if not exists public.tts_global_budget (
  month         text primary key,  -- 'YYYY-MM'
  total_chars   int  not null default 0,
  budget_chars  int  not null default 18000,  -- 18K = 90% of 20K free
  is_exhausted  boolean not null default false,
  updated_at    timestamptz not null default now()
);

-- Insert current month on first use (function)
create or replace function public.increment_tts_usage(
  p_user_id   uuid,
  p_chars     int,
  p_voice     text default null
)
returns jsonb language plpgsql security definer as $$
declare
  v_month        text := to_char(now(), 'YYYY-MM');
  v_global_used  int;
  v_user_used    int;
  v_budget       int;
begin
  -- Get or create global budget row
  insert into public.tts_global_budget (month, total_chars, budget_chars)
  values (v_month, 0, 18000)
  on conflict (month) do nothing;

  -- Get current global usage
  select total_chars, budget_chars
  into v_global_used, v_budget
  from public.tts_global_budget
  where month = v_month;

  -- Check if already exhausted
  if v_global_used + p_chars > v_budget then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'global_budget_exhausted',
      'global_used', v_global_used,
      'global_budget', v_budget,
      'chars_requested', p_chars
    );
  end if;

  -- Get user's monthly usage
  select coalesce(sum(chars_used), 0)
  into v_user_used
  from public.tts_usage
  where user_id = p_user_id and month = v_month;

  -- Per-user limit: 2000 chars/month on free plan
  -- Prevents single user burning everyone's quota
  if v_user_used + p_chars > 2000 then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'user_limit_exhausted',
      'user_used', v_user_used,
      'user_limit', 2000,
      'chars_requested', p_chars
    );
  end if;

  -- Insert usage record
  insert into public.tts_usage (user_id, chars_used, voice, month)
  values (p_user_id, p_chars, p_voice, v_month);

  -- Update global total
  update public.tts_global_budget
  set total_chars = total_chars + p_chars,
      is_exhausted = (total_chars + p_chars >= budget_chars),
      updated_at = now()
  where month = v_month;

  return jsonb_build_object(
    'allowed', true,
    'global_used', v_global_used + p_chars,
    'global_budget', v_budget,
    'user_used', v_user_used + p_chars,
    'user_limit', 2000
  );
end;
$$;

create table if not exists public.tts_cache (
  id          uuid primary key default uuid_generate_v4(),
  cache_key   text not null unique,  -- hash of text + voice
  audio_url   text not null,         -- Supabase Storage URL
  char_count  int  not null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default (now() + interval '7 days')
);

alter table public.tts_cache enable row level security;

create policy "authenticated_read_tts_cache"
  on public.tts_cache for select
  using (auth.role() = 'authenticated');

create policy "service_role_write_tts_cache"
  on public.tts_cache for all
  using (auth.role() = 'service_role');
