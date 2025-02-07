"use client";

import { useTheme } from "@/app/context/ThemeContext";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type ThemeType = "light" | "dark" | "system";

export default function ThemeToggleButton() {
  const { theme, setTheme } = useTheme(); 
  const { t } = useTranslation();
  const [showOptions, setShowOptions] = useState(false);

  const options: { value: ThemeType; label: string }[] = [
    { value: "light", label: t("theme.light") },
    { value: "dark", label: t("theme.dark") },
    { value: "system", label: t("theme.system") },
  ];

  const filteredOptions = options.filter((option) => option.value !== theme);

  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
    setShowOptions(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded"
      >
        {theme === "system" ? t("theme.system") : theme === "dark" ? t("theme.dark") : t("theme.light")}
      </button>

      {showOptions && (
        <div className="absolute top-12 left-0 bg-white text-black dark:bg-gray-700 shadow rounded p-2">
          {filteredOptions.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleThemeChange(value)}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
