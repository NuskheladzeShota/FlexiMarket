import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "../utils/supabaseClient";

if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("🚨 Missing STRIPE keys in environment variables.");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  try {
    const event = stripe.webhooks.constructEvent(payload, signature!, process.env.STRIPE_WEBHOOK_SECRET!);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;

      if (session.metadata?.type === "subscription" && userId) {
        console.log("📥 Creating premium subscription in Supabase...");
        await supabase.from("subscriptions").insert([{ user_id: userId }]);
        console.log("✅ Subscription saved!");
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("🚨 Webhook Error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 });
  }
}
