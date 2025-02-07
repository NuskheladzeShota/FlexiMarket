"use client";

import { useTranslation } from "react-i18next";
import i18n from "@/i18";
import { useCallback } from "react";
import { LanguageButton } from "../components/common/LanguageButton";

export default function Home() {
  const { t } = useTranslation();

  const handleLanguageChange = useCallback((lng: string) => {
    i18n.changeLanguage(lng);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-3xl font-bold">{t("greeting")}</h1>
      <div className="flex gap-4">
        {[
          { code: "en", label: "English" },
          { code: "ka", label: "ქართული" },
        ].map(({ code, label }) => (
          <LanguageButton key={code} language={code} label={label} onClick={handleLanguageChange} />
        ))}
      </div>
    </div>
  );
}
