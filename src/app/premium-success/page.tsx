"use client";

import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function PremiumSuccess() {
    const { user } = useAuth();
    const router = useRouter();
    const { t } = useTranslation();

    useEffect(() => {
        if (!user) return;

        const markPremium = async () => {
            await supabase.from("premium_users").insert([{ user_id: user.id }]);
        };

        markPremium();
        router.push("/blogs");
    }, [user, router]);

    return <div className="text-center text-xl mt-32">{t("paymentSuccessful!Redirecting")}</div>;
}
