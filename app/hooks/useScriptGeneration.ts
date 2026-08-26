// app/hooks/useScriptGeneration.ts
// Posts to /api/generate-script; handles quota_exceeded (402) as a distinct state.

import { useState } from "react";
import type { Hook, Metrics, VideoRecord } from "@/lib/types";

export type QuotaExceeded = {
  type: "quota_exceeded";
  used: number;
  limit: number;
  plan: string;
};

export function useScriptGeneration() {
  const [scripts, setScripts]       = useState<Hook[]>([]);
  const [metrics, setMetrics]       = useState<Metrics | undefined>();
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [quotaError, setQuotaError] = useState<QuotaExceeded | null>(null);

  async function generate(params: {
    trend: string;
    format: string;
    tone: string;
    duration: number;
  }) {
    setIsLoading(true);
    setError(null);
    setQuotaError(null);

    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (res.status === 401) {
        if (typeof window !== "undefined") {
          window.location.href = '/login?redirectTo=/dashboard&tab=pipeline';
        }
        return;
      }

      if (res.status === 429) {
        try {
          const data = await res.json();
          if (data.error === 'quota_exceeded') {
            setQuotaError({
              type:  "quota_exceeded",
              used:  data.used,
              limit: data.limit,
              plan:  data.plan,
            });
            return;
          }
        } catch { }

        setError('AI is busy right now — please wait 10 seconds and try again.');
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Script generation failed");

      setScripts(data.hooks ?? []);
      setMetrics({
        hook_score:  data.hook_score,
        est_ctr:     data.est_ctr,
        retention:   data.retention,
        viral_score: data.viral_score,
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate script");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  function loadFromHistory(record: VideoRecord) {
    if (record.hook) {
      setScripts([{ ...record.hook, label: "Restored Hook" }]);
    }
    setMetrics(record.metrics);
    setError(null);
    setQuotaError(null);
  }

  function clear() {
    setScripts([]);
    setMetrics(undefined);
    setError(null);
    setQuotaError(null);
  }

  return { scripts, metrics, isLoading, error, quotaError, generate, loadFromHistory, clear };
}
