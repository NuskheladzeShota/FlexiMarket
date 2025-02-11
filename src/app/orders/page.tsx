"use client";

import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import Image from "next/image";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  images: string[];
}

interface Order {
  id: string;
  items: OrderItem[];
  total_price: number;
  created_at: string;
  status: string;
}

export default function OrdersPage() {
  const { user, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      setLoadingOrders(true);

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("🚨 Error fetching orders:", error);
      } else {
        setOrders(data);
      }

      setLoadingOrders(false);
    };

    fetchOrders();
  }, [user]);

  if (isLoading || loadingOrders) {
    return <div className="text-center text-xl mt-10">{t("loadingOrders")}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {t("noOrdersYet")}
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-32 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
        {t("yourOrders")}
      </h1>

      {orders.map((order) => (
        <div key={order.id} className="mb-8 p-4 border rounded-lg shadow-sm bg-gray-100 dark:bg-gray-900">
          <h2 className="text-lg text-black font-bold">
            {t("orderID")} {order.id}
          </h2>
          <p className="text-sm text-gray-500">📅 {new Date(order.created_at).toLocaleString()}</p>
          <p className="text-sm text-gray-500">{t("total")} ${order.total_price.toFixed(2)}</p>
          <p className="text-sm text-gray-500">{t("status")} {order.status}</p>

          <div className="mt-4 space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 p-2 border rounded-md bg-white dark:bg-gray-800">
                {item.images.length > 0 && (
                  <Image src={item.images[0]} alt={item.name} width={60} height={60} className="rounded-md" />
                )}
                <div>
                  <p className="font-semibold text-black">{item.name}</p>
                  <p className="text-gray-600 dark:text-gray-300">${item.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
