"use client";

import Image from "next/image";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [ loading, setLoading ] = useState(false);

  const { t } = useTranslation();
  const handleCheckout = async () => {
    if (!user) {
      console.error("🚨 User is not logged in! Cannot proceed to checkout.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          cart,
          userId: user?.id,
          totalPrice: cart.reduce((sum, item) => sum + item.price * item.quantity, 0), }),
      });
  
      console.log("Server Response:", response); 
      const data = await response.json();
      console.log("Response Data:", data);
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session.");
      }
  
      window.location.href = data.url; 
    } catch (error) {
      console.error("Checkout Error:", error);
    } finally {
      setLoading(false);
    }
  };

  console.log("🛒 Current cart value:", cart);
  console.log("🛒 Cart type:", typeof cart);
  

  return (
    <div className="max-w-2xl mx-auto mt-32 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">{t("yourCart")}</h1>

      {cart.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-300">{t("yourCartIsEmpty")}.</p>
      ) : (
        <div>
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b py-4">
              <div className="relative w-20 h-20"> 
                <Image 
                  src={item.images[0]} 
                  alt={item.name} 
                  layout="fill"
                  objectFit="cover" 
                  className="rounded-lg"
                />
              </div>
              <div className="flex-1 ml-4">
                <p className="font-semibold">{item.name}</p>
                <p className="text-gray-600 dark:text-gray-300">${item.price.toFixed(2)}</p>
              </div>
              <button
                className="bg-red-500 text-white py-1 px-3 rounded-lg"
                onClick={() => removeFromCart(item.id)}
              >
                {t("remove")}
              </button>
            </div>
          ))}
          <button 
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg w-full"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? t("Processing...") : t(" processToCheckout")}
          </button>
          <button 
            className="mt-4 bg-gray-500 text-white py-2 px-4 rounded-lg w-full"
            onClick={clearCart}
          >
            {t("clearCart")}
          </button>
        </div>
      )}

      <button className="mt-4 bg-gray-500 text-white py-2 px-4 rounded-lg" onClick={() => router.push("/products")}>
        {t("backToProducts")}
      </button>
    </div>
  );
}