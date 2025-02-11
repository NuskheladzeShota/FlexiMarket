"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";


export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signIn(email, password);
      toast.success(t("loggedInSuccessfully"));
      router.push("/");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t("anUnknownErrorOccurred"));
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">{t("login")}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
        <input
          type="email"
          placeholder={t("email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded text-black"
          required
        />
        <input
          type="password"
          placeholder={t("password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded text-black"
          required
        />
        <button type="submit" className="px-4 py-2 bg-green-500 text-black rounded">
          {t("logIn")}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
