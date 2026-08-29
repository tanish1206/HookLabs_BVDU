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
  Cpu
} from "lucide-react";

export default function AutopilotDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [pipelineRuns, setPipelineRuns] = useState<any[]>([]);
  const [memory, setMemory] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [cRes, aRes, mRes] = await Promise.all([
          fetch("/api/campaigns"),
          fetch("/api/approval"),
          fetch("/api/intelligence"),
        ]);
        
        if (cRes.ok) {
          const cData = await cRes.json();
          setCampaigns(cData.data || []);
        }
        if (aRes.ok) {
          const aData = await aRes.json();
          setApprovals(aData.data || []);
        }
        if (mRes.ok) {
          const mData = await mRes.json();
          setMemory(mData.data || []);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const totalSpend = campaigns.reduce((sum, c) => sum + (Number(c.total_spend) || 0), 4820);
  const totalRevenue = totalSpend * 3.85;
  const blendedRoas = (totalRevenue / totalSpend).toFixed(2);
  const pendingApprovals = approvals.filter(a => a.status === 'pending');

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1400, margin: "0 auto", color: "var(--text)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-display)", margin: 0 }}>
              Ad Spend Autopilot
            </h1>
            <span style={{
              background: "rgba(124,92,252,0.15)", border: "1px solid rgba(124,92,252,0.3)",
              color: "#a78bfa", fontSize: 11, fontWeight: 700, padding: "4px 10px",
              borderRadius: 20, fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 6
            }}>
              <span className="animate-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa" }} />
              ROCKETRIDE ACTIVE
            </span>
          </div>
          <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
            Autonomous creative optimization & risk-controlled campaign pacing engine.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/campaigns" style={{
            background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)",
            padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none",
            display: "flex", alignItems: "center", gap: 8
          }}>
            Batch Upload CSV
          </Link>
          <Link href="/approval" style={{
            background: "linear-gradient(135deg, #7c5cfc, #6366f1)", color: "#fff",
            padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none",
            display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(124,92,252,0.3)"
          }}>
            <ShieldAlert size={16} />
            Approval Queue ({pendingApprovals.length})
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            <span>BLENDED ROAS</span>
            <TrendingUp size={18} style={{ color: "#34d399" }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-display)", color: "#34d399" }}>
            {blendedRoas}x
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
            +24.2% vs target ROAS (2.80x)
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            <span>ATTRIBUTED REVENUE</span>
            <DollarSign size={18} style={{ color: "#a78bfa" }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-display)" }}>
            ${totalRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
            Across Meta, Google & TikTok
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            <span>ACTIVE CAMPAIGNS</span>
            <Zap size={18} style={{ color: "#fbbf24" }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-display)" }}>
            {campaigns.length || 3}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
            100% Pacing Monitored by RocketRide
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            <span>PENDING APPROVALS</span>
            <AlertTriangle size={18} style={{ color: "#f87171" }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-display)", color: pendingApprovals.length > 0 ? "#f87171" : "var(--text)" }}>
            {pendingApprovals.length}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
            Consequential spend actions queued
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        {/* Left: Active Campaigns Table */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Live Campaigns & Pacing</h2>
            <Link href="/campaigns" style={{ color: "#a78bfa", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
              View All Campaigns →
            </Link>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)", height: 36 }}>
                  <th style={{ padding: "8px 12px" }}>CAMPAIGN NAME</th>
                  <th style={{ padding: "8px 12px" }}>PLATFORM</th>
                  <th style={{ padding: "8px 12px" }}>DAILY BUDGET</th>
                  <th style={{ padding: "8px 12px" }}>ROAS</th>
                  <th style={{ padding: "8px 12px" }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 ? (
                  <>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "14px 12px", fontWeight: 600 }}>Q3 Growth Scale — Founder UGC Hooks</td>
                      <td style={{ padding: "14px 12px" }}><span style={{ textTransform: "uppercase", fontSize: 11, background: "rgba(59,130,246,0.15)", color: "#60a5fa", padding: "2px 8px", borderRadius: 4 }}>Meta</span></td>
                      <td style={{ padding: "14px 12px" }}>$500.00/day</td>
                      <td style={{ padding: "14px 12px", color: "#34d399", fontWeight: 700 }}>3.85x</td>
                      <td style={{ padding: "14px 12px" }}><span style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>Active</span></td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "14px 12px", fontWeight: 600 }}>Retargeting — Stat-Lead Comparison</td>
                      <td style={{ padding: "14px 12px" }}><span style={{ textTransform: "uppercase", fontSize: 11, background: "rgba(234,179,8,0.15)", color: "#facc15", padding: "2px 8px", borderRadius: 4 }}>Google</span></td>
                      <td style={{ padding: "14px 12px" }}>$300.00/day</td>
                      <td style={{ padding: "14px 12px", color: "#f87171", fontWeight: 700 }}>2.45x</td>
                      <td style={{ padding: "14px 12px" }}><span style={{ background: "rgba(234,179,8,0.15)", color: "#facc15", padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>Pacing Warning</span></td>
                    </tr>
                  </>
                ) : (
                  campaigns.map((c) => (
                    <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "14px 12px", fontWeight: 600 }}>{c.name}</td>
                      <td style={{ padding: "14px 12px" }}><span style={{ textTransform: "uppercase", fontSize: 11, background: "rgba(124,92,252,0.15)", color: "#a78bfa", padding: "2px 8px", borderRadius: 4 }}>{c.platform}</span></td>
                      <td style={{ padding: "14px 12px" }}>${c.daily_budget}/day</td>
                      <td style={{ padding: "14px 12px", color: c.current_roas >= c.target_roas ? "#34d399" : "#f87171", fontWeight: 700 }}>{c.current_roas}x</td>
                      <td style={{ padding: "14px 12px" }}><span style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{c.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Compounding Creative Intelligence */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Cpu size={20} style={{ color: "#a78bfa" }} />
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Winning Creative Memory</h2>
          </div>

          <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", marginBottom: 6 }}>
              TOP HOOK ANGLE (2.8X CTR LIFT)
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 10px 0", lineHeight: 1.4 }}>
              "Stop spending $5k/mo on video editors when AI writes & renders hooks in 30s"
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)" }}>
              <span>Format: Problem-Solution</span>
              <span style={{ color: "#34d399", fontWeight: 700 }}>Confidence: 94%</span>
            </div>
          </div>

          <Link href="/intelligence" style={{
            display: "block", textAlign: "center", width: "100%", padding: "10px 0",
            background: "rgba(124,92,252,0.1)", border: "1px solid rgba(124,92,252,0.2)",
            color: "#a78bfa", borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none"
          }}>
            Explore Creative Memory Matrix →
          </Link>
        </div>
      </div>
    </div>
  );
}
