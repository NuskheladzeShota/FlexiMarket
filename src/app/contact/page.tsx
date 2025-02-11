"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import i18next from "i18next";

export default function ContactPage() {
  const { t } = useTranslation();
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  useEffect(() => {
    setHydrated(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      toast.success(i18next.isInitialized ? t("success") : t("messageSentSuccessfully"));
      setFormData({ name: "", email: "", message: "" });
    }, 2000);
  };

  if (!hydrated) return null;

  return (
    <div className="container mt-32 mx-auto rounded-md bg-white px-4 py-12">
      <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
        {i18next.isInitialized ? t("title") : "Contact Us"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {i18next.isInitialized ? t("info") : "Contact Information"}
          </h2>
          <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Mail size={20} className="text-blue-500" /> contact@gmail.com
          </p>
          <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Phone size={20} className="text-green-500" /> +995 555 123 456
          </p>
          <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <MapPin size={20} className="text-red-500" /> {t("tbilisi")}, {t("georgia")}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {i18next.isInitialized ? t("form") : "Send us a message"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder={i18next.isInitialized ? t("name") : "Your Name"}
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 text-black border rounded-md focus:ring focus:ring-blue-300 dark:focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
              required
            />
            <input
              type="email"
              name="email"
              placeholder={i18next.isInitialized ? t("email") : "Your Email"}
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 text-black border rounded-md focus:ring focus:ring-blue-300 dark:focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
              required
            />
            <textarea
              name="message"
              rows={4}
              placeholder={i18next.isInitialized ? t("message") : "Your Message"}
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-2 border text-black rounded-md focus:ring focus:ring-blue-300 dark:focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={18} />}
              {loading ? (i18next.isInitialized ? t("sending") : "Sending...") : (i18next.isInitialized ? t("send") : "Send")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
