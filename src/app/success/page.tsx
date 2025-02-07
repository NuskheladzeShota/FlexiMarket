"use client";

import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center">
      <h1 className="text-3xl font-bold text-green-500">Payment Successful! 🎉</h1>
      <p className="text-lg text-gray-700">Thank you for your purchase.</p>
      <button 
        className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold"
        onClick={() => router.push("/products")}
      >
        Continue Shopping
      </button>
    </div>
  );
}