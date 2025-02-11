"use client";

import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../utils/supabaseClient";
import toast from "react-hot-toast";

export default function SubscribePage() {
    const { user } = useAuth();
    const [isPremium, setIsPremium] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        if (!user) return;
        const checkPremium = async () => {
            const { data } = await supabase
                .from("premium_users")
                .select("user_id")
                .eq("user_id", user.id)
                .maybeSingle();

            if (data) {
                setIsPremium(true);
            }
        };

        checkPremium();
    }, [user]);

    const handleSubscribe = async () => {
        if (!user) {
            toast.error(t("youMustBeLoggedInToSubscribe"));
            return;
        }
        
        const response = await fetch("/api/create-premium-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id }),
        });

        const data = await response.json();
        if (data.url) {
            window.location.href = data.url;
        } else {
            toast.error(t("failedToCreateStripeSession"));
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-32 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">

            {isPremium ? (
                <p className="text-green-500 text-xl">{t("youAlreadyHaveAPremiumSubscription")}</p>
            ) : (
                <>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t("premiumSubscription")}</h1>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{t("unlockPremiumFeaturesForJust$100")}</p>
                    <button
                        onClick={handleSubscribe}
                        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
                    >
                        {t("buyPremium$100")}
                    </button>
                </>
            )}
        </div>
    );
}
