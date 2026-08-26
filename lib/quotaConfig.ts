export const TTS_QUOTA = {
  GLOBAL_MONTHLY_BUDGET:   18_000,  // 18K of 20K free (10% safety buffer)
  USER_MONTHLY_LIMIT_FREE: 2_000,   // per user, free plan
  USER_MONTHLY_LIMIT_PRO:  8_000,   // per user, pro plan  
  MAX_CHARS_PER_REQUEST:   840,     // Allow up to ~60s of audio (60s * 14 chars/sec)
  RATE_LIMIT_SECONDS:      30,      // min time between calls per user
  CACHE_TTL_DAYS:          7,       // how long to cache audio files
  WARNING_THRESHOLD_PCT:   70,      // show warning banner above this %
  CRITICAL_THRESHOLD_PCT:  90,      // show red banner above this %
} as const
