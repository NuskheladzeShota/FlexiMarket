"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Search, Trash2, PlusCircle } from "lucide-react";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  user_id: string;
  created_at: string;
  images: string[];
  quantity: number;
};

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      if (!data) {
        console.warn("No products found.");
        setProducts([]);
        return;
      }

      const productsWithImages = await Promise.all(
        data.map(async (product) => {
          const imageUrls = Array.isArray(product.images)
            ? await Promise.all(
                product.images.map(async (fileName: string) => {
                  if (fileName.startsWith("https://")) {
                    return fileName;
                  }

                  const { data: signedUrlData, error } = await supabase
                    .storage
                    .from("productimage")
                    .createSignedUrl(`products/${fileName}`, 60 * 60);

                  if (error) {
                    console.error("Error generating signed URL:", fileName, error);
                    return "";
                  }

                  return signedUrlData?.signedUrl || "";
                })
              )
            : [];

          return { ...product, images: imageUrls, quantity: 1 };
        })
      );

      setProducts(productsWithImages);
      setFilteredProducts(productsWithImages);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerCaseQuery) ||
        product.description.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (productId: string) => {
    if (!user) {
      toast.error(t("authRequired"));
      return;
    }

    setDeleting(productId);

    try {
      const res = await fetch("/api/products/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, userId: user.id }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete product");
      }

      await fetchProducts();
      toast.success(t("productDeleted"));
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(t("deleteError"));
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-xl">{t("loading...")}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto mt-32 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("products")}</h1>
        <Link href="/addProduct">
          <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition">
            <PlusCircle size={18} /> {t("addProduct")}
          </button>
        </Link>
      </div>
      <div className="relative mb-6">
        <input
          type="text"
          placeholder={t("searchProducts")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 pl-10 border text-black rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        />
        <Search className="absolute top-3 left-3 text-black dark:text-gray-400" size={20} />
      </div>
      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-600 ">{t("noProductsAvailable")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="relative p-4 border rounded-lg shadow bg-white dark:bg-gray-900">
              <Link href={`/products/${product.id}`} passHref>
                <div className="cursor-pointer hover:shadow-lg transition">
                  {product.images.length > 0 && (
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-40 object-cover rounded-lg mb-2 transition-transform hover:scale-105"
                      />
                    </div>
                  )}
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{product.name}</h2>
                  <p className="text-gray-700 dark:text-gray-300">{product.description || t("noDescription")}</p>
                  <p className="mt-2 font-bold text-lg text-blue-600 dark:text-blue-400">${product.price.toFixed(2)}</p>
                </div>
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("owner")}: {product.user_id}</p>

              {user && user.id === product.user_id && (
                <button
                  onClick={() => handleDelete(product.id)}
                  disabled={deleting === product.id}
                  className={`absolute top-3 right-3 flex items-center gap-2 px-3 py-2 text-white rounded-lg transition ${
                    deleting === product.id ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  <Trash2 size={16} />
                  {deleting === product.id ? t("deleting") : t("delete")}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
