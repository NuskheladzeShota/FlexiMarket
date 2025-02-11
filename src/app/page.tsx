"use client";

import { useTranslation } from "react-i18next";
import { useAuth } from "./context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "./utils/supabaseClient";
import Header from "./components/common/Header";
import Link from "next/link";

export default function Home() {
  const { t } = useTranslation();
  const { isLoading, user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkPremium = async () => {
      const { data } = await supabase
        .from("premium_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) setIsPremium(true);
    };

    checkPremium();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl font-semibold">
        {t("loading")}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white">
      <Header />

      <div className="flex flex-col items-center justify-center pt-20 px-6 text-center">
        <h1 className="text-5xl sm:text-7xl font-extrabold drop-shadow-lg">{t("landing_title")}</h1>
        <p className="mt-4 text-lg sm:text-2xl text-gray-200">{t("landing_subtitle")}</p>

        {user && isPremium && (
          <p className="mt-2 text-lg text-yellow-300 font-semibold bg-white/10 px-4 py-2 rounded-lg">
            {t("premium_welcome")}
          </p>
        )}
      </div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl mx-auto px-6">
        <FeatureCard
          title={t("products_title")}
          description={t("products_desc")}
          link="/products"
          buttonText={t("view_products")}
          color="bg-blue-500"
        />

        <FeatureCard
          title={t("blogs_title")}
          description={t("blogs_desc")}
          link="/blogs"
          buttonText={t("view_blogs")}
          color="bg-green-500"
        />

        {!isPremium && (
          <FeatureCard
            title={t("premium_title")}
            description={t("premium_desc")}
            link="/subscribe"
            buttonText={t("get_premium")}
            color="bg-yellow-500"
          />
        )}

        <FeatureCard title={t("language_title")} description={t("language_desc")} color="bg-purple-500" />

        <FeatureCard title={t("theme_title")} description={t("theme_desc")} color="bg-gray-500" />

        <FeatureCard title={t("cart_title")} description={t("cart_desc")} color="bg-pink-500" />

        <FeatureCard title={t("profile_title")} description={t("profile_desc")} color="bg-teal-500" />

        <FeatureCard title={t("orders_title")} description={t("orders_desc")} color="bg-orange-500" />

        <FeatureCard title={t("search_title")} description={t("search_desc")} color="bg-red-500" />
      </div>

      <div className="mt-16 flex flex-wrap justify-center gap-6 pb-12">
        <CTAButton link="/products" text={t("view_products")} color="bg-blue-600" />
        <CTAButton link="/blogs" text={t("view_blogs")} color="bg-green-600" />
        {!isPremium && <CTAButton link="/subscribe" text={t("get_premium")} color="bg-yellow-500" />}
      </div>
    </div>
  );
}

// FeatureCard კომპონენტის ტიპიზაცია
interface FeatureCardProps {
  title: string;
  description: string;
  link?: string;
  buttonText?: string;
  color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, link, buttonText, color }) => {
  return (
    <div className="relative p-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg text-center transition hover:scale-105 hover:bg-white/20">
      <h3 className="text-xl font-semibold text-white drop-shadow-md">{title}</h3>
      <p className="mt-2 text-gray-200">{description}</p>
      {link && buttonText && (
        <Link href={link}>
          <button className={`mt-4 px-6 py-3 text-white rounded-lg shadow-lg hover:brightness-110 transition ${color}`}>
            {buttonText}
          </button>
        </Link>
      )}
    </div>
  );
};

// CTAButton კომპონენტის ტიპიზაცია
interface CTAButtonProps {
  link: string;
  text: string;
  color: string;
}

const CTAButton: React.FC<CTAButtonProps> = ({ link, text, color }) => {
  return (
    <Link href={link}>
      <button className={`px-6 py-3 text-white rounded-lg shadow-lg hover:brightness-110 transition ${color}`}>
        {text}
      </button>
    </Link>
  );
};
