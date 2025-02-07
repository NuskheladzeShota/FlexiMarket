"use client";

import { useTranslation } from "react-i18next";
import i18n from "@/i18";
import { useCallback, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { LanguageButton } from "./LanguageButton";
import { languages } from "../../config/languages";
import ThemeToggleButton from "../ThemeToggleButton";
import { Menu, X } from "lucide-react";
import { toast } from "react-hot-toast";

export default function Header() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLanguageChange = useCallback((lng: string) => {
    i18n.changeLanguage(lng);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred.");
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white dark:bg-gray-900 shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-500 transition"
          >
            🏠 {t("site_name")}
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 dark:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <Link
            href="/products"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-500 transition"
          >
            {t("products")}
          </Link>
          <Link
            href="/addProduct"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-500 transition"
          >
            {t("addProduct")}
          </Link>
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          {languages.map(({ code, label }) => (
            <LanguageButton
              key={code}
              language={code}
              label={label}
              onClick={handleLanguageChange}
            />
          ))}
          <ThemeToggleButton />

          {user ? (
            <>
              <span className="text-gray-700 dark:text-white hidden lg:block">
                {user.email}
              </span>
              <Link href="/cart">
                <button className="relative px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition flex items-center gap-2">
                  🛒 {t("cart")}
                </button>
              </Link>
              <Link href="/profile">
                <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
                  {t("profile")}
                </button>
              </Link>
              <Link href="/orders">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                📜 My Orders
              </button>
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                {t("logout")}
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                  {t("login")}
                </button>
              </Link>
              <Link href="/auth/register">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                  {t("get_started")}
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <nav className="md:hidden bg-white dark:bg-gray-800 shadow-md py-4 px-6">
          <ul className="space-y-4 text-center">
            <li>
              <Link
                href="/products"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-500 transition"
              >
                {t("products")}
              </Link>
            </li>
            <li>
              <Link
                href="/addProduct"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-500 transition"
              >
                {t("add_product")}
              </Link>
            </li>
            <li className="flex justify-center gap-4">
              {languages.map(({ code, label }) => (
                <LanguageButton
                  key={code}
                  language={code}
                  label={label}
                  onClick={handleLanguageChange}
                />
              ))}
            </li>
            <li className="flex justify-center">
              <ThemeToggleButton />
            </li>
            {user ? (
              <>
                <li className="text-gray-700 dark:text-white">{user.email}</li>
                <li>
                  <Link href="/cart">
                    <button className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition">
                      🛒 {t("cart")}
                    </button>
                  </Link>
                </li>
                <li>
                  <Link href="/profile">
                    <button className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
                      {t("profile")}
                    </button>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    {t("logout")}
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/auth/login">
                    <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                      {t("login")}
                    </button>
                  </Link>
                </li>
                <li>
                  <Link href="/auth/register">
                    <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                      {t("get_started")}
                    </button>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
