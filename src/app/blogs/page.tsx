"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { PlusCircle, Search, Trash2, Edit3 } from "lucide-react";

interface Author {
    first_name: string | null;
    last_name: string | null;
    email: string;
  }

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

export default function BlogsListPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [blogs, setBlogs] = useState<Blog[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();
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

    const handleCreateBlog = () => {
        if (isPremium) {
            router.push("/blogs/create");
        } else {
            router.push("/subscribe");
        }
    };

    useEffect(() => {
        const fetchBlogs = async () => {
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
                .order("created_at", { ascending: false });

            if (error) {
                console.error("🚨 Error fetching blogs:", error);
                toast.error(t("fetchBlogs"));
                return;
            }

            const formattedBlogs: Blog[] = data.map((blog: Record<string, unknown>) => {
                const author: Author = blog.profiles
                  ? {
                      first_name: (blog.profiles as Record<string, unknown>).first_name as string | null,
                      last_name: (blog.profiles as Record<string, unknown>).last_name as string | null,
                      email: (blog.profiles as Record<string, unknown>).email as string,
                    }
                  : { first_name: null, last_name: null, email: "Unknown Email" };
        
                return {
                  id: blog.id as string,
                  title: blog.title as string,
                  content: blog.content as string,
                  images: Array.isArray(blog.images) ? (blog.images as string[]) : [],
                  created_at: blog.created_at as string,
                  author_id: blog.author_id as string,
                  author,
                };
              });

            setBlogs(formattedBlogs);
            setLoading(false);
        };

        fetchBlogs();
    }, []);

    const handleDelete = async (blogId: string) => {
        toast((toastInstance: { id: string | undefined }) => (
            <div className="flex flex-col items-center">
                <p className="text-gray-900 dark:text-white text-sm font-semibold">
                    {t("areYouSureYouWantToDeleteThisBlog")}
                </p>
                <div className="mt-3 flex gap-3">
                    <button
                        onClick={() => {
                            toast.dismiss(toastInstance.id);
                            deleteBlog(blogId);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                    >
                        {t("yesDelete")}
                    </button>
                    <button
                        onClick={() => toast.dismiss(toastInstance.id)}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
                    >
                        {t("cancel")}
                    </button>
                </div>
            </div>
        ), {
            id: `delete-${blogId}`,
            position: "top-center",
            duration: 6000,
        });
    };

    const deleteBlog = async (blogId: string) => {
        const { error } = await supabase.from("blogs").delete().eq("id", blogId);

        if (error) {
            console.error("🚨 Error deleting blog:", error);
            toast.error(t("deleteBlogError"));
            return;
        }

        setBlogs((prevBlogs) => prevBlogs?.filter((blog) => blog.id !== blogId) || []);
        toast.success(t("deleteBlog"), { position: "top-center" });
    };

    const filteredBlogs = blogs
        ? blogs.filter((blog) =>
              blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (blog.author.first_name && blog.author.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (blog.author.last_name && blog.author.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
              blog.author.email.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : [];

    return (
        <div className="max-w-6xl mx-auto mt-32 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("blogs")}</h1>
                <button
                    onClick={handleCreateBlog}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                >
                    <PlusCircle size={18} /> {t("createBlog")}
                </button>
            </div>

            <div className="relative mb-6">
                <input
                    type="text"
                    placeholder={t("searchBlogs")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-black p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <Search className="absolute top-3 left-3 text-gray-500 dark:text-gray-400" size={20} />
            </div>

            {loading ? (
                <p className="text-center text-gray-600 dark:text-gray-300">{t("loading")}</p>
            ) : filteredBlogs.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-300">{t("noBlogsFound")}</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBlogs.map((blog) => (
                        <div key={blog.id} className="relative p-4 border rounded-lg shadow bg-white dark:bg-gray-900">
                            {blog.images.length > 0 && (
                                <div className="relative overflow-hidden rounded-lg">
                                    <img
                                        src={blog.images[0]}
                                        alt={blog.title}
                                        className="w-full h-40 object-cover rounded-lg mb-2 transition-transform hover:scale-105"
                                    />
                                </div>
                            )}
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{blog.title}</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                By {blog.author.first_name || blog.author.email}
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 mt-2">{blog.content.slice(0, 100)}...</p>
                            <div className="mt-3 flex gap-4">
                                <Link href={`/blogs/${blog.id}`} className="text-blue-500 hover:underline">
                                    {t("readMore")}
                                </Link>

                                {user?.id === blog.author_id && (
                                    <div className="flex gap-2">
                                        <button onClick={() => router.push(`/blogs/edit/${blog.id}`)} className="text-yellow-500 hover:underline flex items-center gap-1">
                                            <Edit3 size={16} /> {t("edit")}
                                        </button>
                                        <button onClick={() => handleDelete(blog.id)} className="text-red-500 hover:underline flex items-center gap-1">
                                            <Trash2 size={16} /> {t("delete")}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
