"use client";

import { useState, useEffect } from "react";
import { Megaphone, Upload, RefreshCw, Layers, CheckCircle2 } from "lucide-react";

export default function CampaignIntelligencePage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [batchMetrics, setBatchMetrics] = useState<any>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    try {
      const res = await fetch("/api/campaigns");
      if (res.ok) {
        const json = await res.json();
        setCampaigns(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSampleBatchIngest() {
    setUploading(true);
    setBatchMetrics(null);

    try {
      const res = await fetch("/api/campaigns/batch-ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([
          {
            campaign_name: "Q3 Growth Scale — Founder UGC Hooks",
            platform: "meta",
            daily_budget: 500.0,
            total_spend: 4820.0,
            target_roas: 3.2,
            current_roas: 3.85,
            impressions: 145000,
            clicks: 4930,
            conversions: 185,
            revenue: 18557.0,
          },
          {
            campaign_name: "Retargeting — Stat-Lead Comparison",
            platform: "google",
            daily_budget: 300.0,
            total_spend: 2150.0,
            target_roas: 2.8,
            current_roas: 2.45,
            impressions: 88000,
            clicks: 2110,
            conversions: 52,
            revenue: 5267.5,
          },
          {
            campaign_name: "TikTok Gen Z Creator Blitz",
            platform: "tiktok",
            daily_budget: 200.0,
            total_spend: 890.0,
            target_roas: 2.5,
            current_roas: 1.85,
            impressions: 120000,
            clicks: 1800,
            conversions: 23,
            revenue: 1646.5,
          },
        ]),
      });

      if (res.ok) {
        const json = await res.json();
        setBatchMetrics(json.batch_metrics);
        await fetchCampaigns();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1400, margin: "0 auto", color: "var(--text)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-display)", margin: 0 }}>
            Campaign Intelligence
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14, margin: "6px 0 0 0" }}>
            Multi-channel ad performance, pacing breakdown, and RocketRide batch dataset ingestion.
          </p>
        </div>

        <button
          onClick={handleSampleBatchIngest}
          disabled={uploading}
          style={{
            background: "linear-gradient(135deg, #7c5cfc, #6366f1)", color: "#fff",
            border: "none", padding: "12px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            cursor: uploading ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 4px 12px rgba(124,92,252,0.3)"
          }}
        >
          {uploading ? <RefreshCw className="animate-spin" size={16} /> : <Upload size={16} />}
          {uploading ? "Ingesting Dataset..." : "Run Batch Ingestion Demo"}
        </button>
      </div>

      {/* Batch Results Banner */}
      {batchMetrics && (
        <div style={{
          background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)",
          borderRadius: 12, padding: 20, marginBottom: 32, color: "#34d399"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
            <CheckCircle2 size={20} />
            RocketRide Batch Ingestion Complete!
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 13, color: "var(--text)" }}>
            <span>Records Processed: <strong>{batchMetrics.records_processed}</strong></span>
            <span>Execution Time: <strong>{batchMetrics.execution_time_ms} ms</strong></span>
            <span>Approx Cost: <strong>${batchMetrics.approx_cost}</strong></span>
            <span>Escalations Queued: <strong>{batchMetrics.escalations_count}</strong></span>
          </div>
        </div>
      )}

      {/* Campaign List */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Active Campaign Registry</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>
                <th style={{ padding: "10px 12px" }}>CAMPAIGN NAME</th>
                <th style={{ padding: "10px 12px" }}>PLATFORM</th>
                <th style={{ padding: "10px 12px" }}>DAILY BUDGET</th>
                <th style={{ padding: "10px 12px" }}>TOTAL SPEND</th>
                <th style={{ padding: "10px 12px" }}>CURRENT ROAS</th>
                <th style={{ padding: "10px 12px" }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "var(--muted)" }}>
                    No campaigns ingested yet. Click "Run Batch Ingestion Demo" to populate campaigns.
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "14px 12px", fontWeight: 600 }}>{c.name}</td>
                    <td style={{ padding: "14px 12px" }}>
                      <span style={{ textTransform: "uppercase", fontSize: 11, background: "rgba(124,92,252,0.15)", color: "#a78bfa", padding: "2px 8px", borderRadius: 4 }}>
                        {c.platform}
                      </span>
                    </td>
                    <td style={{ padding: "14px 12px" }}>${c.daily_budget}/day</td>
                    <td style={{ padding: "14px 12px" }}>${c.total_spend}</td>
                    <td style={{ padding: "14px 12px", color: c.current_roas >= c.target_roas ? "#34d399" : "#f87171", fontWeight: 700 }}>
                      {c.current_roas}x
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      <span style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
