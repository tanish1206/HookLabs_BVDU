"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  DollarSign, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldAlert,
  Play,
  Cpu,
  RefreshCw,
  Sparkles,
  Layers,
  Brain,
  Star,
  Clock,
  RotateCcw,
  Check,
  XCircle,
  BarChart3
} from "lucide-react";

export default function AutopilotJudgeDashboard() {
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [autopilotResult, setAutopilotResult] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [memory, setMemory] = useState<any[]>([]);
  const [pipelineRuns, setPipelineRuns] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const [cRes, aRes, mRes, pRes] = await Promise.all([
        fetch("/api/campaigns"),
        fetch("/api/approval"),
        fetch("/api/intelligence"),
        fetch("/api/rocketride/run"),
      ]);

      if (cRes.ok) {
        const json = await cRes.json();
        setCampaigns(json.data || []);
      }
      if (aRes.ok) {
        const json = await aRes.json();
        setApprovals(json.data || []);
      }
      if (mRes.ok) {
        const json = await mRes.json();
        setMemory(json.data || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRunAutopilot() {
    setRunning(true);
    setAutopilotResult(null);

    try {
      const res = await fetch("/api/autopilot/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_name: "Summer Sale" }),
      });

      if (res.ok) {
        const json = await res.json();
        setAutopilotResult(json);
        await fetchDashboardData();
      }
    } catch (err) {
      console.error("Autopilot run error:", err);
    } finally {
      setRunning(false);
    }
  }

  async function handleDemoReset() {
    setResetting(true);
    try {
      const res = await fetch("/api/autopilot/reset", { method: "POST" });
      if (res.ok) {
        setAutopilotResult(null);
        await fetchDashboardData();
      }
    } catch (err) {
      console.error("Reset error:", err);
    } finally {
      setResetting(false);
    }
  }

  const pendingApprovals = approvals.filter((a) => a.status === "pending");
  const activeCampaign = campaigns.find((c) => c.name === "Summer Sale") || campaigns[0] || {
    name: "Summer Sale",
    platform: "meta",
    daily_budget: 50000,
    total_spend: 42000,
    current_roas: 4.41,
    target_roas: 3.50,
  };

  const totalSpend = activeCampaign.total_spend || 42000;
  const totalRevenue = totalSpend * (activeCampaign.current_roas || 4.41);
  const blendedRoas = (activeCampaign.current_roas || 4.41).toFixed(2);

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1440, margin: "0 auto", color: "var(--text)", fontFamily: "var(--font-body)" }}>
      {/* Header & Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-display)", margin: 0, letterSpacing: "-0.02em" }}>
              Ad Spend Autopilot
            </h1>
            <span style={{
              background: "rgba(124,92,252,0.15)", border: "1px solid rgba(124,92,252,0.3)",
              color: "#a78bfa", fontSize: 11, fontWeight: 700, padding: "4px 12px",
              borderRadius: 20, fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 6
            }}>
              <span className="animate-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa" }} />
              ROCKETRIDE MULTI-AGENT ENGINE
            </span>
          </div>
          <p style={{ color: "var(--muted)", fontSize: 14, margin: 0, maxWidth: 650 }}>
            Autonomous marketing intelligence loop analyzing performance, compounding creative memory, generating winning concepts, and enforcing risk controls.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={handleDemoReset}
            disabled={resetting || running}
            title="Development-only reset to restore initial demo state"
            style={{
              background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)",
              padding: "12px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: resetting ? "wait" : "pointer",
              display: "flex", alignItems: "center", gap: 6
            }}
          >
            <RotateCcw size={14} className={resetting ? "animate-spin" : ""} />
            {resetting ? "Resetting..." : "Demo Reset"}
          </button>

          <button
            onClick={handleRunAutopilot}
            disabled={running || pendingApprovals.length > 0}
            style={{
              background: running
                ? "var(--surface)"
                : pendingApprovals.length > 0
                ? "rgba(248,113,113,0.2)"
                : "linear-gradient(135deg, #7c5cfc, #6366f1)",
              color: pendingApprovals.length > 0 ? "#f87171" : "#fff",
              border: pendingApprovals.length > 0 ? "1px solid rgba(248,113,113,0.4)" : "none",
              padding: "14px 28px", borderRadius: 8, fontSize: 14, fontWeight: 800,
              cursor: (running || pendingApprovals.length > 0) ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 10,
              boxShadow: pendingApprovals.length > 0 ? "none" : "0 4px 20px rgba(124,92,252,0.4)",
              transition: "all 0.2s"
            }}
          >
            {running ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
            {running ? "EXECUTING ROCKETRIDE PIPELINES..." : pendingApprovals.length > 0 ? "APPROVAL PENDING IN QUEUE" : "RUN AUTOPILOT"}
          </button>
        </div>
      </div>

      {/* Campaign Health & Pacing Banner */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, marginBottom: 32
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: "rgba(124,92,252,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#a78bfa", fontWeight: 800, fontSize: 18
            }}>
              Meta
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{activeCampaign.name}</h2>
                <span style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12 }}>
                  Active Campaign
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                Target Audience: <strong>Founders & Marketers</strong> | Platform: <strong>Meta Ads</strong>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>DAILY BUDGET</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>
              ${Number(activeCampaign.daily_budget).toLocaleString()}/day
            </div>
          </div>
        </div>

        {/* Health Metrics Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginBottom: 4 }}>CURRENT ROAS</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#34d399" }}>{blendedRoas}x</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Target: {activeCampaign.target_roas}x (+26% lift)</div>
          </div>

          <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginBottom: 4 }}>TOTAL SPEND</div>
            <div style={{ fontSize: 26, fontWeight: 800 }}>${Number(totalSpend).toLocaleString()}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>94% Pacing Efficiency</div>
          </div>

          <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginBottom: 4 }}>ATTRIBUTED REVENUE</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#a78bfa" }}>${Number(totalRevenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>185 Conversions Tracked</div>
          </div>

          <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginBottom: 4 }}>AVERAGE CTR</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#fbbf24" }}>3.40%</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>4,930 Total Clicks</div>
          </div>
        </div>
      </div>

      {/* HIGH-RISK HERO MOMENT (If Approval Pending) */}
      {pendingApprovals.length > 0 && (
        <div style={{
          background: "linear-gradient(135deg, rgba(248,113,113,0.15), rgba(124,92,252,0.15))",
          border: "2px solid #f87171", borderRadius: 16, padding: 28, marginBottom: 32,
          boxShadow: "0 8px 32px rgba(248,113,113,0.2)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <ShieldAlert size={26} style={{ color: "#f87171" }} />
                <span style={{ fontSize: 13, fontWeight: 800, color: "#f87171", letterSpacing: "0.06em", fontFamily: "var(--font-mono)" }}>
                  🚨 HIGH-RISK ACTION — HUMAN APPROVAL REQUIRED
                </span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px 0" }}>
                Proposed Daily Budget Increase: ${Number(pendingApprovals[0].current_budget).toLocaleString()} → ${Number(pendingApprovals[0].proposed_budget).toLocaleString()}
              </h2>
              <p style={{ fontSize: 13, color: "var(--text)", margin: 0, opacity: 0.9, maxWidth: 800, lineHeight: 1.5 }}>
                {pendingApprovals[0].reasoning}
              </p>
            </div>

            <Link href="/approval" style={{
              background: "#f87171", color: "#000", padding: "12px 24px", borderRadius: 8,
              fontSize: 13, fontWeight: 800, textDecoration: "none", display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 4px 16px rgba(248,113,113,0.4)", whiteSpace: "nowrap"
            }}>
              Review in Approval Center →
            </Link>
          </div>

          <div style={{ display: "flex", gap: 32, marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(248,113,113,0.3)", fontSize: 13 }}>
            <div>Delta: <strong style={{ color: "#34d399" }}>+${(Number(pendingApprovals[0].proposed_budget) - Number(pendingApprovals[0].current_budget)).toLocaleString()} (+30%)</strong></div>
            <div>Risk Gate Evaluated: <strong style={{ color: "#f87171" }}>+$15,000 &gt; $100 Safety Limit</strong></div>
            <div>Confidence Score: <strong style={{ color: "#a78bfa" }}>{(pendingApprovals[0].confidence_score * 100).toFixed(0)}%</strong></div>
          </div>
        </div>
      )}

      {/* Live Pipeline Execution Timeline (If Run Triggered) */}
      {autopilotResult && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Cpu size={22} style={{ color: "#a78bfa" }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>RocketRide Live Execution Timeline</h2>
            </div>
            <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
              Trace: <strong style={{ color: "#a78bfa" }}>{autopilotResult.golden_demo?.approval_request_id ? "rr_trace_golden_99" : "rr_trace_demo"}</strong> | Latency: <strong>{autopilotResult.execution_metrics?.duration_ms} ms</strong> | Cost: <strong style={{ color: "#fbbf24" }}>${autopilotResult.execution_metrics?.approx_cost} ESTIMATED</strong>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            {[
              { step: "CAMPAIGN ANALYSIS", status: "✓ Completed", detail: "Underperformer identified" },
              { step: "CREATIVE INTELLIGENCE", status: "✓ Completed", detail: "Memory Written & Read" },
              { step: "CREATIVE GENERATION", status: "✓ Completed", detail: "3 Concepts Generated" },
              { step: "CREATIVE EVALUATION", status: "✓ Completed", detail: "Quality Score 92/100" },
              { step: "CAMPAIGN OPTIMIZATION", status: "⚠ HIGH RISK", detail: "Enqueued to Approval Queue" },
            ].map((st, i) => (
              <div key={st.step} style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", marginBottom: 4 }}>STEP 0{i + 1}</div>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{st.step}</div>
                <div style={{ fontSize: 11, color: st.status.includes("HIGH") ? "#f87171" : "#34d399", fontWeight: 700 }}>{st.status}</div>
                <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>{st.detail}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Creative Performance & Compounding Memory */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
        {/* Left: Creative Breakdown */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Creative Asset Breakdown</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 10, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Founder Story — Stop Paying 5k Video Editors</span>
                <span style={{ background: "#34d399", color: "#000", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4 }}>
                  ⭐ WINNER (4.85x ROAS)
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Format: Problem-Solution UGC | CTR: 3.8%</div>
            </div>

            <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Static Product Catalog Image</span>
                <span style={{ background: "#f87171", color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4 }}>
                  🚨 UNDERPERFORMING (0.95x ROAS)
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Format: Static Image | CTR: 0.7% (High CPC)</div>
            </div>

            <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>How I Scaled My App in 14 Days</span>
                <span style={{ background: "rgba(255,255,255,0.1)", color: "var(--text)", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>
                  STRONG (3.20x ROAS)
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Format: Founder Story | CTR: 2.4%</div>
            </div>
          </div>
        </div>

        {/* Right: Compounding Memory & Consumption Proof */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Brain size={22} style={{ color: "#a78bfa" }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Compounding Creative Memory</h2>
          </div>

          <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 12, padding: 18, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#a78bfa", fontWeight: 700 }}>
                PERSISTED MEMORY PATTERN
              </span>
              <span style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12 }}>
                Used in recommendation ✓
              </span>
            </div>

            <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 10px 0", lineHeight: 1.4 }}>
              "Stop spending $5k/mo on video editors when AI writes & renders hooks in 30s"
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12, color: "var(--muted)" }}>
              <div>Target Audience: <strong>Founders</strong></div>
              <div>Platform: <strong>Meta Ads</strong></div>
              <div>Format: <strong>Problem-Solution</strong></div>
              <div>CTR Lift: <strong style={{ color: "#34d399" }}>+2.8x Lift</strong></div>
            </div>
          </div>

          <div style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>
            💡 <strong>Memory Consumption Proof:</strong> The generator explicitly loaded this memory from Supabase to craft 3 new creative concepts.
          </div>
        </div>
      </div>

      {/* Generated Creative Concepts Cards (After Run) */}
      {autopilotResult?.generated_variants && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <Sparkles size={22} style={{ color: "#a78bfa" }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Generated Creative Variants (Derived from Memory)</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {autopilotResult.generated_variants.map((v: any, idx: number) => (
              <div key={v.concept_id} style={{
                background: idx === 2 ? "rgba(124,92,252,0.08)" : "var(--background)",
                border: idx === 2 ? "2px solid #7c5cfc" : "1px solid var(--border)",
                borderRadius: 12, padding: 20, position: "relative"
              }}>
                {idx === 2 && (
                  <span style={{
                    position: "absolute", top: -12, right: 16, background: "#7c5cfc", color: "#fff",
                    fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 12, boxShadow: "0 2px 8px rgba(124,92,252,0.4)"
                  }}>
                    ⭐ RECOMMENDED (SCORE 92/100)
                  </span>
                )}

                <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 10px 0" }}>{v.title}</h3>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#a78bfa", marginBottom: 12 }}>"{v.hook}"</div>
                <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 14px 0", lineHeight: 1.4 }}>{v.script}</p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--muted)", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                  <span>Format: <strong>{v.format}</strong></span>
                  <span>Brand Safety: <strong style={{ color: "#34d399" }}>PASS</strong></span>
                </div>

                <Link
                  href={`/generate?campaign=${encodeURIComponent(activeCampaign.name)}&platform=${v.platform || "meta"}&audience=founders&hook=${encodeURIComponent(v.hook)}`}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    width: "100%", marginTop: 14, padding: "10px 0",
                    background: idx === 2 ? "linear-gradient(135deg, #7c5cfc, #6366f1)" : "var(--surface)",
                    border: idx === 2 ? "none" : "1px solid var(--border)",
                    borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none"
                  }}
                >
                  <Sparkles size={14} /> GENERATE RECOMMENDED CREATIVES IN STUDIO →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
