import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch quota metrics
  const { data: meta } = await supabase
    .from('users_metadata')
    .select('plan, videos_used_this_month, reset_date, words_used_this_month')
    .eq('user_id', user.id)
    .single();

  const wordsUsed = (meta as any)?.words_used_this_month || 0;
  const wordLimit = 2000;

  return (
    <div style={{ padding: '40px', color: 'var(--text)', background: 'var(--background)', minHeight: '100vh', marginLeft: '260px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', marginBottom: '24px' }}>Settings</h1>
      
      <div style={{ maxWidth: '600px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--accent)' }}>Account Quotas</h2>
        
        <div style={{ marginBottom: '24px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span>AI Script Words Generated</span>
              <span>{wordsUsed} / {wordLimit}</span>
           </div>
           <div style={{ width: '100%', height: '8px', background: 'var(--surface2)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (wordsUsed / wordLimit) * 100)}%`, height: '100%', background: 'var(--accent)' }} />
           </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
           <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
              <strong>Current Plan:</strong> {meta?.plan || 'Free'}
           </p>
           <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
              <strong>Quota Reset Date:</strong> {new Date(meta?.reset_date || new Date()).toLocaleDateString()}
           </p>
        </div>

        <button style={{ 
          background: 'transparent', border: '1px solid var(--border)', 
          padding: '8px 16px', borderRadius: 'var(--radius-sm)', color: 'var(--text)', cursor: 'pointer' 
        }}>
          Manage Subscription
        </button>
      </div>
    </div>
  );
}
