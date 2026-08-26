// app/abtest/page.tsx
"use client";

import AbTestPanel from "@/app/components/AbTestPanel";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import { useScriptGeneration } from "@/app/hooks/useScriptGeneration";

export default function AbTestPage() {
  const { scripts, metrics } = useScriptGeneration(); 
  // In a real app we'd load this from a global store or context if we wanted to persist it across tabs,
  // but for now it renders the empty state or we'll pass mocked data to demonstrate the panel.
  
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px" }}>
      <ErrorBoundary>
        <AbTestPanel 
          scripts={scripts} 
          metrics={metrics}
        />
      </ErrorBoundary>
    </div>
  );
}
