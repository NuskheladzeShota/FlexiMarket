"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { createClient } from "@supabase/supabase-js";
import { toast } from "react-hot-toast";
import { Upload, Loader2 } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AddProductPage() {
  const { user } = useAuth();
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { t } = useTranslation();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);
    }
  };

  const uploadImages = async (): Promise<string[] | null> => {
    const uploadedUrls: string[] = [];
  
    for (const file of images) {
      if (!file.type.startsWith("image/")) {
        toast.error("Only images are allowed.");
        continue;
      }
  
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit.");
        continue;
      }
  
      const filePath = `products/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("productimage")
        .upload(filePath, file);
  
      if (error) {
        toast.error("Image upload failed!");
        return null;
      }
  
      const { data: signedUrlData, error: signedError } = await supabase
        .storage
        .from("productimage")
        .createSignedUrl(filePath, 60 * 60 * 60);
  
      if (signedError) {
        toast.error("Error generating signed URL.");
        return null;
      }
  
      uploadedUrls.push(signedUrlData?.signedUrl || "");
    }
  
    if (uploadedUrls.length === 0) {
      toast.error("No images were uploaded.");
      return null;
    }
  
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to add a product.");
      return;
    }

    setLoading(true);
    toast.loading("Uploading images...");

    const imageUrls = await uploadImages();
    if (!imageUrls) {
      setLoading(false);
      return;
    }

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        images: imageUrls,
        price: parseFloat(price),
        user_id: user.id,
      }),
    });

    if (res.ok) {
      toast.success("Product added successfully!");
      router.push("/products");
    } else {
      const errorData = await res.json();
      toast.error("Failed to add product: " + errorData.error);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-32 p-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        {t("addProduct")}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("name")}
          </label>
          <input
            type="text"
            className="mt-1 block w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("description")}
          </label>
          <textarea
            className="mt-1 block w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:text-white"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("price")} ($)
          </label>
          <input
            type="number"
            className="mt-1 block w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:text-white"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("uploadImages")}
          </label>
          <label className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 dark:border-gray-600">
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="w-8 h-8 text-gray-500 dark:text-gray-300" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Click or drag files here to upload
              </span>
            </div>
          </label>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              {t("adding...")}
            </>
          ) : (
            t("addProduct")
          )}
        </button>
      </form>
    </div>
  );
}
