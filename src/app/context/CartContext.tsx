"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../utils/supabaseClient";
import { toast } from "react-hot-toast";

type CartItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (items: CartItem | CartItem[]) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    if (isLoading || !user) return;

    const fetchCart = async () => {
      console.log("🛒 Fetching cart for user:", user.id);

      const { data, error } = await supabase
        .from("carts")
        .select("items")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("🚨 Error fetching cart:", error);
        return;
      }

      let cartItems = data?.items || [];

      if (!Array.isArray(cartItems)) {
        console.warn("🚨 `cartItems` is not an array. Fixing...");
        cartItems = [];
      }

      setCart(cartItems);
    };

    fetchCart();
  }, [user, isLoading]); 

  const saveCartToSupabase = async (updatedCart: CartItem[]) => {
    if (!user) return;

    console.log("💾 Saving updated cart to Supabase:", updatedCart);

    const { error } = await supabase
      .from("carts")
      .update({ items: updatedCart })
      .eq("user_id", user.id);

    if (error) {
      console.error("🚨 Error saving cart to Supabase:", error);
    } else {
      console.log("✅ Cart successfully saved to Supabase!");
    }
  };

  const addToCart = async (items: CartItem | CartItem[]) => {
    setCart((prevCart) => {
      let updatedCart = [...prevCart];

      const itemsArray = Array.isArray(items) ? items : [items];

      itemsArray.forEach((item) => {
        const existingItem = updatedCart.find((cartItem) => cartItem.id === item.id);

        if (existingItem) {
          existingItem.quantity += item.quantity || 1; 
        } else {
          updatedCart.push({ ...item, quantity: item.quantity || 1 });
        }
      });

      if (user) {
        saveCartToSupabase(updatedCart);
      } else {
        localStorage.setItem("cart", JSON.stringify(updatedCart)); 
      }

      return updatedCart;
    });

    toast.success("✅ Items added to cart!");
  };

  const removeFromCart = async (id: string) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item.id !== id);

      if (user) {
        saveCartToSupabase(updatedCart);
      } else {
        localStorage.setItem("cart", JSON.stringify(updatedCart));
      }

      return updatedCart;
    });

    toast.success("🗑 Product removed from cart.");
  };

  const clearCart = async () => {
    setCart([]);
    if (user) {
      saveCartToSupabase([]);
    } else {
      localStorage.removeItem("cart");
    }
    toast.success("🛒 Cart cleared.");
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    console.error("🚨 useCart must be used within a CartProvider");
    return { cart: [], addToCart: () => {}, removeFromCart: () => {}, clearCart: () => {} };
  }
  return context;
}
