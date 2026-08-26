// app/feedback/page.tsx
"use client";

import FeedbackDashboard from "@/app/components/FeedbackDashboard";
import ErrorBoundary from "@/app/components/ErrorBoundary";

export default function FeedbackPage() {
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px" }}>
      <ErrorBoundary>
        <FeedbackDashboard />
      </ErrorBoundary>
    </div>
  );
}
