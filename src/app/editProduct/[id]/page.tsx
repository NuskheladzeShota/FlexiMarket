"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { Loader2, Upload } from "lucide-react";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  user_id: string;
  created_at: string;
  images: string[];
};

export default function EditProductPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);

  useEffect(() => {
    if (!productId) {
      toast.error("Invalid product ID.");
      router.push("/products");
      return;
    }

    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error || !data) {
        toast.error("Product not found.");
        router.push("/products");
        return;
      }

      if (data.user_id !== user?.id) {
        toast.error("You are not authorized to edit this product.");
        router.push("/products");
        return;
      }

      setProduct(data);
      setLoading(false);
    };

    fetchProduct();
  }, [productId, user, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages(Array.from(e.target.files));
    }
  };

  const uploadImages = async (): Promise<string[] | null> => {
    const uploadedUrls: string[] = [];

    for (const file of newImages) {
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
        .createSignedUrl(filePath, 60 * 60);

      if (signedError) {
        toast.error("Error generating signed URL.");
        return null;
      }

      uploadedUrls.push(signedUrlData?.signedUrl || "");
    }

    return uploadedUrls.length > 0 ? uploadedUrls : null;
  };

  const handleUpdateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product) return;

    setUpdating(true);

    let updatedImages = product.images;
    if (newImages.length > 0) {
      const imageUrls = await uploadImages();
      if (imageUrls) {
        updatedImages = imageUrls;
      }
    }

    const updatedPrice = parseFloat(product.price.toString());
    if (isNaN(updatedPrice) || updatedPrice <= 0) {
      toast.error("Invalid price value.");
      setUpdating(false);
      return;
    }

    const { error } = await supabase
      .from("products")
      .update({
        name: product.name.trim(),
        description: product.description.trim(),
        price: updatedPrice,
        images: updatedImages,
      })
      .eq("id", product.id);

    if (error) {
      toast.error("Failed to update product.");
    } else {
      toast.success("Product updated successfully!");
      router.push(`/products/${product.id}`);
    }

    setUpdating(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-xl">Loading...</div>;
  }

  return (
    <div className="max-w-lg mx-auto mt-32 p-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">Edit Product</h1>
      <form onSubmit={handleUpdateProduct} className="space-y-6">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:text-white"
            value={product?.name}
            onChange={(e) => setProduct((prev) => prev ? { ...prev, name: e.target.value } : prev)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:text-white"
            value={product?.description}
            onChange={(e) => setProduct((prev) => prev ? { ...prev, description: e.target.value } : prev)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Price ($)</label>
          <input
            type="number"
            className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:text-white"
            value={product?.price}
            onChange={(e) =>
              setProduct((prev) => prev ? { ...prev, price: parseFloat(e.target.value) } : prev)
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Current Images</label>
          <div className="flex overflow-x-auto space-x-4">
            {product?.images.map((image, index) => (
              <Image
                key={index}
                src={image}
                alt={`Product image ${index + 1}`}
                width={96}
                height={96}
                className="rounded-lg shadow object-cover"
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Upload New Images</label>
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
          className="w-full flex items-center justify-center bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition disabled:opacity-50"
          disabled={updating}
        >
          {updating ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : "Update Product"}
        </button>
      </form>
    </div>
  );
}
