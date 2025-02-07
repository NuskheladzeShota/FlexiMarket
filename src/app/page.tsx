"use client";

import { useTranslation } from "react-i18next";
import { useAuth } from "./context/AuthContext";
import Header from "./components/common/Header";

export default function Home() {
  const { t } = useTranslation();
  const { loading } = useAuth();

  if (loading) return <div className="flex justify-center items-center min-h-screen text-xl font-semibold">Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <Header />
      <h1 className="text-4xl font-extrabold sm:text-6xl">{t("landing_title")}</h1>
      <p className="mt-4 text-lg sm:text-xl text-gray-600 dark:text-gray-400">
        {t("landing_subtitle")}
      </p>
      <h1 className="text-3xl font-bold">{t("greeting")}</h1>
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-xl font-semibold">{t("feature_1_title")}</h3>
          <p className="text-gray-600 dark:text-gray-400">{t("feature_1_desc")}</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-xl font-semibold">{t("feature_2_title")}</h3>
          <p className="text-gray-600 dark:text-gray-400">{t("feature_2_desc")}</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-xl font-semibold">{t("feature_3_title")}</h3>
          <p className="text-gray-600 dark:text-gray-400">{t("feature_3_desc")}</p>
        </div>
      </div>
    </div>
  );
}
