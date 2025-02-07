"use client";

import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { toast } from "react-hot-toast";

export default function Checkout() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.success("You must be logged in to proceed with checkout.");
        return;
      }

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supabaseAccessToken: session.access_token }),
      });

      if (!res.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await res.json();
      window.location.href = url;
      
    } catch (error) {
      console.error("❌ Checkout Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400"
      >
        {loading ? "Processing..." : "Checkout"}
      </button>
    </div>
  );
}
