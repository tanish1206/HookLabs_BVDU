// app/history/page.tsx
"use client";

import VideoHistoryPanel from "@/app/components/VideoHistoryPanel";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import { useRouter } from "next/navigation";
import type { VideoRecord } from "@/lib/types";

export default function HistoryPage() {
  const router = useRouter();

  function handleReuse(record: VideoRecord) {
    // Ideally set this in a global store. For now, navigate back to pipeline.
    router.push("/");
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px" }}>
      <ErrorBoundary>
        <VideoHistoryPanel onReuse={handleReuse} />
      </ErrorBoundary>
    </div>
  );
}
