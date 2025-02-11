"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../utils/supabaseClient";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { Loader2, Save } from "lucide-react";

export default function EditBlogPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { id } = useParams();
    const [blog, setBlog] = useState<{ title: string; content: string; images: string[] }>({
        title: "",
        content: "",
        images: [],
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchBlog = async () => {
            if (!id) return;

            const { data, error } = await supabase
                .from("blogs")
                .select("*")
                .eq("id", id)
                .single();

            if (error || !data) {
                toast.error("🚨 Blog not found", { position: "top-center" });
                router.push("/blogs");
                return;
            }

            if (data.author_id !== user?.id) {
                toast.error("🚫 Unauthorized", { position: "top-center" });
                router.push("/blogs");
                return;
            }

            setBlog({ title: data.title, content: data.content, images: data.images || [] });
            setFetching(false);
        };

        if (id && user) {
            fetchBlog();
        }
    }, [id, user, router]);

    const handleUpdate = async () => {
        if (!blog.title.trim() || !blog.content.trim()) {
            toast.error("⚠️ Please fill all fields", { position: "top-center" });
            return;
        }

        setLoading(true);

        const { error } = await supabase
            .from("blogs")
            .update({ title: blog.title, content: blog.content, images: blog.images })
            .eq("id", id);

        setLoading(false);

        if (error) {
            toast.error("❌ Failed to update blog", { position: "top-center" });
        } else {
            toast.success("✅ Blog updated successfully!", { position: "top-center" });
            router.push(`/blogs`);
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto mt-20 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t("editBlog")}</h1>

            <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 font-medium">{t("title")}</label>
                <input
                    type="text"
                    value={blog.title}
                    onChange={(e) => setBlog({ ...blog, title: e.target.value })}
                    className="w-full text-black p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 font-medium">{t("content")}</label>
                <textarea
                    value={blog.content}
                    onChange={(e) => setBlog({ ...blog, content: e.target.value })}
                    rows={5}
                    className="w-full text-black p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <button
                onClick={handleUpdate}
                disabled={loading}
                className={`flex items-center justify-center w-full px-4 py-2 text-white rounded-lg transition ${loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                       {t("updating")}
                    </>
                ) : (
                    <>
                        <Save className="w-5 h-5 mr-2" /> {t("updateBlog")}
                    </>
                )}
            </button>
        </div>
    );
}
