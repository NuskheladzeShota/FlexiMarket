import { useTranslation } from "react-i18next";

export function Loading() {
    const { t } = useTranslation();
    return (
        <div className="flex justify-center items-center min-h-screen text-xl font-semibold">
            {t("loading...")}
        </div>
    )
}