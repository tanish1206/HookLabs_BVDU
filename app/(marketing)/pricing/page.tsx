// app/pricing/page.tsx
"use client";

import { Button, Card, Badge } from "@/app/components/ui";
import { useState } from "react";

const PLANS = [
  { name: "Free",     price: "$0",    videos: "5 videos/mo",  features: ["Standard voices", "Watermarked export", "Basic analytics"] },
  { name: "Pro",      price: "$19",   videos: "100 videos/mo", features: ["Premium ElevenLabs voices", "HD export (No watermark)", "Advanced AI analysis"], popular: true },
  { name: "Team",     price: "$49",   videos: "Unlimited",    features: ["4 team members", "Custom voice cloning", "Priority rendering"] },
];

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function handleSubscribe(planName: string) {
    if (planName === "Free") return;
    setLoadingPlan(planName);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planName.toLowerCase() }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Failed to start checkout process. Please check your Stripe keys.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 48, marginTop: 40 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 800, marginBottom: 16 }}>
          Simple, transparent pricing
        </h1>
        <p style={{ fontSize: 16, color: "var(--muted)", maxWidth: 600, margin: "0 auto" }}>
          Generate viral hooks, high-quality voiceovers, and dynamic videos without breaking the bank.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {PLANS.map((plan) => (
          <Card key={plan.name} glow={plan.popular} style={{ position: "relative", padding: 32, display: "flex", flexDirection: "column" }}>
            {plan.popular && (
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)" }}>
                <Badge color="var(--accent2)">MOST POPULAR</Badge>
              </div>
            )}
            
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{plan.name}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
              <span style={{ fontSize: 36, fontWeight: 800 }}>{plan.price}</span>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>/month</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--accent)", fontFamily: "var(--font-mono)", marginBottom: 24 }}>
              {plan.videos}
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1, display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {plan.features.map(f => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <span style={{ color: "var(--green)" }}>✓</span> {f}
                </li>
              ))}
            </ul>

            <Button 
              variant={plan.popular ? "primary" : "secondary"} 
              style={{ width: "100%", justifyContent: "center" }}
              loading={loadingPlan === plan.name}
              onClick={() => handleSubscribe(plan.name)}
            >
              {plan.name === "Free" ? "Get Started" : "Subscribe"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
