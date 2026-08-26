// app/api/stripe/checkout/route.ts
// POST { plan } → creates a Stripe Checkout session and returns { url }

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
  });

  try {
    const { plan } = await req.json();
    const priceId = plan === "team"
      ? process.env.STRIPE_TEAM_PRICE_ID
      : process.env.STRIPE_PRO_PRICE_ID;

    if (!priceId) {
      return NextResponse.json({ error: "Plan price not configured" }, { status: 503 });
    }

    // Get the authenticated user's email for Stripe
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const session = await stripe.checkout.sessions.create({
      mode:                "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email:       user?.email ?? undefined,
      metadata: {
        user_id: user?.id ?? "",
        plan,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/pricing?cancelled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[api/stripe/checkout]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
