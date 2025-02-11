import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "../../utils/supabaseClient";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("🚨 STRIPE_SECRET_KEY is missing in environment variables.");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-01-27.acacia",
});

const saveSubscriptionToSupabase = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from("subscriptions")
    .insert([{ user_id: userId, status: "active" }]);

  if (error) {
    console.error("🚨 Error saving subscription:", error);
  } else {
    console.log("✅ Subscription saved for user:", userId);
  }
};

interface RequestBody {
  userId: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: RequestBody = await req.json();

    if (!body.userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    console.log("👤 User ID:", body.userId);

    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/premium-success`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/cancel`;

    console.log("✅ Success URL:", successUrl);
    console.log("✅ Cancel URL:", cancelUrl);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Premium Subscription",
            },
            recurring: {
              interval: "month",
            },
            unit_amount: 10000, 
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: body.userId,
        type: "subscription",
      },
    });

    console.log("✅ Subscription Checkout Created:", session);

    await saveSubscriptionToSupabase(body.userId);

    return NextResponse.json({ url: session.url, message: "Subscription session created successfully" });
  } catch (error) {
    if (error instanceof Error) {
      console.error("🚨 Stripe Subscription Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("🚨 Unknown Error occurred");
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
