"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function CancelPage() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center">
      <h1 className="text-3xl font-bold text-red-500">{t("paymentCanceled ❌")}</h1>
      <p className="text-lg text-gray-700">{t("yourPaymentWasNotCompleted")}</p>
      <button 
        className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold"
        onClick={() => router.push("/cart")}
      >
        {t("tryAgain")}
      </button>
    </div>
  );
}