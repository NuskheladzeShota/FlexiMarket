"use client";

import { useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";

export default function CreateBlogPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const ensureUserProfile = async () => {
    if (!user) return false;

    const { error } = await supabase.from("profiles").select("id").eq("id", user.id).single();

    if (error) {
      console.warn("🚨 Profile not found, creating a new one...");
      const { error: insertError } = await supabase.from("profiles").insert([{ id: user.id, email: user.email }]);
      if (insertError) {
        console.error("🚨 Error creating profile:", insertError);
        toast.error(t("FailedToCreateUserProfile"));
        return false;
      }
    }
    return true;
  };

  const handleImageUpload = async () => {
    const uploadedImages: string[] = [];

    if (images.length === 0) return uploadedImages;

    for (const image of images) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `blog_images/${fileName}`;

      const { error } = await supabase.storage.from("blog_images").upload(filePath, image);

      if (error) {
        console.error("🚨 Image Upload Error:", error);
        toast.error(t("failedToUploadImage"));
        return [];
      }

      const { data } = supabase.storage.from("blog_images").getPublicUrl(filePath);
      uploadedImages.push(data.publicUrl);
    }

    return uploadedImages;
  };

  const handleCreateBlog = async () => {
    if (!user) {
      toast.error(("youMustBeLoggedInToCreateABlog"));
      return;
    }

    setLoading(true);

    const hasProfile = await ensureUserProfile();
    if (!hasProfile) {
      setLoading(false);
      return;
    }

    const imageUrls = await handleImageUpload();

    const { error } = await supabase.from("blogs").insert([
      {
        author_id: user.id,
        title,
        content,
        images: imageUrls,
      },
    ]);

    if (error) {
      console.error("🚨 Error creating blog:", error);
      toast.error(t("failedToCreateBlog"));
      setLoading(false);
      return;
    }

    toast.success(t("blogCreatedSuccessfully"));
    router.push("/blogs");
  };

  return (
    <div className="max-w-2xl mx-auto mt-32 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">{t("createBlog")}</h1>

      <input
        type="text"
        placeholder={t("title")}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-gray-700 p-2 border rounded-lg mb-4"
      />

      <textarea
        placeholder={t("content")}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full text-gray-700 p-2 border rounded-lg mb-4"
        rows={5}
      />

      <input type="file" multiple onChange={(e) => setImages(Array.from(e.target.files || []))} className="mb-4" />

      <button
        onClick={handleCreateBlog}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
      >
        {loading ? t("creating") : t("createBlog")}
      </button>
    </div>
  );
}
