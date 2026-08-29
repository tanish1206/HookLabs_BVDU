"use client";

import { useState, useEffect } from "react";
import { Cpu, Play, CheckCircle2, AlertTriangle, RefreshCw, Layers } from "lucide-react";

export default function RocketRidePipelinePage() {
  const [pipelineRuns, setPipelineRuns] = useState<any[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetchPipelineRuns();
  }, []);

  async function fetchPipelineRuns() {
    try {
      const res = await fetch("/api/rocketride/run");
      if (res.ok) {
        // Fetch runs telemetry
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function triggerTestPipeline() {
    setRunning(true);
    try {
      const res = await fetch("/api/rocketride/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pipeline_name: "test_pipeline",
          payload: {
            message: "Manual trigger from RocketRide Pipeline Monitor UI",
            campaign_id: "camp_manual_101",
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        alert(`Pipeline Execution Success!\nTrace ID: ${json.trace_id}\nLatency: ${json.execution_time_ms}ms`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1400, margin: "0 auto", color: "var(--text)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <Cpu size={28} style={{ color: "#a78bfa" }} />
            <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-display)", margin: 0 }}>
              RocketRide Agent Execution Monitor
            </h1>
          </div>
          <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
            Live observability telemetry, trace logs, batch processing latency, and model cost tracking for RocketRide .pipe workflows.
          </p>
        </div>

        <button
          onClick={triggerTestPipeline}
          disabled={running}
          style={{
            background: "linear-gradient(135deg, #7c5cfc, #6366f1)", color: "#fff",
            border: "none", padding: "12px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            cursor: running ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 4px 12px rgba(124,92,252,0.3)"
          }}
        >
          {running ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
          {running ? "Executing Workflow..." : "Trigger Test Pipeline"}
        </button>
      </div>

      {/* Load-Bearing Pipelines Showcase */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Load-Bearing `.pipe` Workflow Registries</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { name: "campaign_analysis.pipe", role: "Performance & Pacing Agent", status: "Active" },
            { name: "creative_intelligence.pipe", role: "Audience & Memory Compounding", status: "Active" },
            { name: "creative_generation.pipe", role: "Strategy, Hook & Script Copywriter", status: "Active" },
            { name: "creative_evaluation.pipe", role: "Ad Quality & Brand Safety Critic", status: "Active" },
            { name: "campaign_optimization.pipe", role: "Decision Agent & Risk Escalation Gate", status: "Active" },
            { name: "attribution_report.pipe", role: "Multi-Touch Revenue Synthesizer", status: "Active" },
          ].map((p) => (
            <div key={p.name} style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#a78bfa" }}>
                  {p.name}
                </span>
                <span style={{ fontSize: 10, background: "rgba(52,211,153,0.15)", color: "#34d399", padding: "2px 6px", borderRadius: 4 }}>
                  {p.status}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{p.role}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
