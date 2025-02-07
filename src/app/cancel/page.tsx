"use client";

import { useRouter } from "next/navigation";

export default function CancelPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center">
      <h1 className="text-3xl font-bold text-red-500">Payment Canceled ❌</h1>
      <p className="text-lg text-gray-700">Your payment was not completed.</p>
      <button 
        className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold"
        onClick={() => router.push("/cart")}
      >
        Try Again
      </button>
    </div>
  );
}