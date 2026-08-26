// app/api/stripe/webhook/route.ts
// Handles Stripe subscription webhook events and updates Supabase users_metadata

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
  });

  const body      = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[stripe/webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { createAdminClient } = await import("@/lib/supabase/server");
  const admin = await createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId  = session.metadata?.user_id;
      const plan    = session.metadata?.plan ?? "pro";

      if (userId) {
        await admin.from("users_metadata").upsert({
          user_id:                  userId,
          plan,
          stripe_customer_id:       session.customer as string,
          stripe_subscription_id:   session.subscription as string,
          videos_used_this_month:   0,
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const { data: meta } = await admin
        .from("users_metadata")
        .select("user_id")
        .eq("stripe_subscription_id", sub.id)
        .single();

      if (meta) {
        const plan = sub.status === "active" ? "pro" : "free";
        await admin.from("users_metadata").update({ plan }).eq("user_id", meta.user_id);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const { data: meta } = await admin
        .from("users_metadata")
        .select("user_id")
        .eq("stripe_subscription_id", sub.id)
        .single();

      if (meta) {
        await admin
          .from("users_metadata")
          .update({ plan: "free", stripe_subscription_id: null })
          .eq("user_id", meta.user_id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
