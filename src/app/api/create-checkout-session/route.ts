import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "../../utils/supabaseClient";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("🚨 STRIPE_SECRET_KEY is missing in environment variables.");
}

if (!process.env.NEXT_PUBLIC_APP_URL) {
  throw new Error("🚨 NEXT_PUBLIC_APP_URL is missing in environment variables.");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-01-27.acacia",
});

type CartItem = {
  id: string;
  name: string;
  price: number;
  images: string[];
  quantity: number;
};

export async function POST(req: NextRequest) {
  console.log("🚀 [API] /api/create-checkout-session called");

  try {
    const { cart, userId, totalPrice } = await req.json();
    console.log("🛒 Cart Data:", cart);
    console.log("👤 User ID:", userId);
    console.log("💲 Total Price:", totalPrice);

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const lineItems = cart.map((item: CartItem) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.images ? [item.images[0]] : [],
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity || 1,
    }));

    console.log("✅ Stripe Line Items:", lineItems);

    console.log("🔗 NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL);
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/success`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/cancel`;

    console.log("✅ Success URL:", successUrl);
    console.log("✅ Cancel URL:", cancelUrl);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: userId,
      },
    });

    console.log("✅ Checkout Session Created:", session);


    if (userId) {
      console.log("📥 Saving order to Supabase...");
      await saveOrderToSupabase(userId, cart, totalPrice);
    } else {
      console.error("❌ Error: No user ID provided.");
    }

    return NextResponse.json({ url: session.url, message: "Checkout session created successfully" });
  } catch (error: any) {
    console.error("🚨 Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

const saveOrderToSupabase = async (userId: string, cart: CartItem[], totalPrice?: number) => {
  console.log("💾 Trying to save order...");

  const sanitizedPrice = totalPrice ?? cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  console.log("💲 Final Total Price:", sanitizedPrice);

  const { error } = await supabase
    .from("orders")
    .insert([
      {
        user_id: userId,
        items: cart, 
        total_price: sanitizedPrice,
        status: "pending",
      },
    ])
    .select()

  if (error) {
    console.error("🚨 Error saving order:", error);
  } else {
    console.log("✅ Order successfully saved to Supabase");
  }
};
