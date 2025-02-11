"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../utils/supabaseClient";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";

type Blog = {
    id: string;
    title: string;
    content: string;
    images: string[];
    created_at: string;
    author_id: string;
    author: {
        first_name: string | null;
        last_name: string | null;
        email: string;
    };
};

export default function BlogDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        if (!id) {
            toast.error("Invalid blog ID.");
            router.push("/blogs");
            return;
        }

        const fetchBlog = async () => {
            setLoading(true);

            const { data, error } = await supabase
                .from("blogs")
                .select(`
                    id,
                    title,
                    content,
                    images,
                    created_at,
                    author_id,
                    profiles:profiles!blogs_author_id_fkey(first_name, last_name, email)
                `)
                .eq("id", id)
                .maybeSingle();

            if (error || !data) {
                toast.error(t("blogNotFound"));
                router.push("/blogs");
                return;
            }

            const authorData = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
            
            const author = authorData
                ? {
                      first_name: authorData.first_name || null,
                      last_name: authorData.last_name || null,
                      email: authorData.email,
                  }
                : { first_name: null, last_name: null, email: "Unknown Email" };

            setBlog({
                ...data,
                images: Array.isArray(data.images) ? data.images : [],
                author,
            });

            setLoading(false);
        };

        fetchBlog();
    }, [id, router]);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen text-xl">{t("loading")}</div>;
    }

    if (!blog) {
        return <div className="flex justify-center items-center min-h-screen text-xl">{t("blogNotFound")}</div>;
    }

    return (
        <div className="max-w-2xl mx-auto mt-32 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">{blog.title}</h1>

            <p className="text-center text-gray-600 dark:text-gray-300">
                By{" "}
                {blog.author.first_name && blog.author.last_name
                    ? `${blog.author.first_name} ${blog.author.last_name}`
                    : blog.author.email}
            </p>

            <p className="text-gray-700 dark:text-gray-300 mt-4">{blog.content}</p>

            {blog.images.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-4">
                    {blog.images.map((image, index) => (
                        <img key={index} src={image} alt={`Blog Image ${index + 1}`} className="w-40 h-40 object-cover rounded-lg shadow" />
                    ))}
                </div>
            )}

            <button
                className="mt-6 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition"
                onClick={() => router.push("/blogs")}
            >
                {t("backToBlogs")}
            </button>
        </div>
    );
}
