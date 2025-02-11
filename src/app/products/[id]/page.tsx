"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  user_id: string;
  images: string[];
};

export default function ProductDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const productId = params?.id;
    if (!productId) {
      toast.error("Invalid product ID.");
      router.push("/products");
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
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

      setProduct(data);
      setLoading(false);
    };

    fetchProduct();
  }, [params?.id, router]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-xl">{t("Loading...")}</div>;
  }

  if (!product) {
    return <div className="flex justify-center items-center min-h-screen text-xl">{t("productNotFound")}</div>;
  }

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("You need to be logged in to add items to cart.");
      return;
    }
  
    const cartItem = { ...product, quantity: 1 };
  
    const { data, error } = await supabase
      .from("carts")
      .select("items")
      .eq("user_id", user.id)
      .maybeSingle();
  
    if (error) {
      console.error("🚨 Error fetching cart:", error);
      toast.error("Failed to fetch cart.");
      return;
    }
  
    let updatedCart = [];
    
    if (!data) {
      console.log("🛒 No cart found. Creating new cart...");
      updatedCart = [cartItem];
  
      const { error: insertError } = await supabase.from("carts").insert([
        {
          user_id: user.id,
          items: updatedCart,
        },
      ]);
  
      if (insertError) {
        console.error("🚨 Error creating new cart:", insertError);
        toast.error("Failed to create cart.");
        return;
      }
  
      toast.success(`✅ ${product.name} added to cart!`);
      return;
    } 
  
    const existingCart = Array.isArray(data.items) ? data.items : [];
    const existingItemIndex = existingCart.findIndex((item: Product) => item.id === product.id);
  
    if (existingItemIndex !== -1) {
      existingCart[existingItemIndex].quantity += 1;
    } else {
      existingCart.push(cartItem);
    }
    updatedCart = existingCart;
  
    const { error: updateError } = await supabase
      .from("carts")
      .update({ items: updatedCart })
      .eq("user_id", user.id);
  
    if (updateError) {
      console.error("🚨 Error updating cart:", updateError);
      toast.error("Failed to update cart.");
      return;
    }
  
    toast.success(`✅ ${product.name} added to cart!`);
  };
  

  const handleEditProduct = () => {
    router.push(`/editProduct/${product.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto mt-32 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">{product.name}</h1>

      <div className="relative flex overflow-x-auto space-x-4 pb-4">
        {product.images.length > 0 ? (
          product.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${product.name} image ${index + 1}`}
              className="w-40 h-40 object-cover rounded-lg shadow transition hover:scale-105"
            />
          ))
        ) : (
          <p className="text-gray-400">{t("noImagesAvailable")}</p>
        )}
      </div>

      <p className="text-lg text-gray-700 dark:text-gray-300 mt-4">{product.description}</p>
      <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">${product.price.toFixed(2)}</p>

      <div className="mt-6 flex gap-4">
        <button
          className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition"
          onClick={handleAddToCart}
        >
          {t("addToCart")}
        </button>

        {user?.id === product.user_id && (
          <button
            className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition"
            onClick={handleEditProduct}
          >
            {t("editProduct")}
          </button>
        )}

        <button
          className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition"
          onClick={() => router.push("/products")}
        >
          {t("backToProducts")}
        </button>
      </div>
    </div>
  );
}
