"use client";

import { useTheme } from "@/app/context/ThemeContext";
import { JSX, useState } from "react";
import { useTranslation } from "react-i18next";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";

type ThemeType = "light" | "dark" | "system";

export default function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [showOptions, setShowOptions] = useState(false);

  const themeOptions: { value: ThemeType; label: string; icon: JSX.Element }[] = [
    { value: "light", label: t("theme.light"), icon: <Sun size={16} className="text-yellow-500" /> },
    { value: "dark", label: t("theme.dark"), icon: <Moon size={16} className="text-gray-900 dark:text-gray-300" /> },
    { value: "system", label: t("theme.system"), icon: <Monitor size={16} className="text-blue-500" /> },
  ];

  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
    localStorage.setItem("user-theme", newTheme);
    document.documentElement.classList.remove("light", "dark");
    if (newTheme !== "system") {
      document.documentElement.classList.add(newTheme);
    }
    setShowOptions(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition duration-300"
      >
        {themeOptions.find((option) => option.value === theme)?.icon}
        {themeOptions.find((option) => option.value === theme)?.label}
        <ChevronDown size={14} />
      </button>

      {showOptions && (
        <div className="absolute left-0 mt-2 w-36 bg-black dark:bg-gray-800 shadow-lg rounded-md overflow-hidden">
          {themeOptions
            .filter((option) => option.value !== theme)
            .map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => handleThemeChange(value)}
                className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-200 text-white dark:hover:bg-red-700 transition duration-200"
              >
                {icon} {label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
