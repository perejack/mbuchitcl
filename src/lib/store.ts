import { supabase } from "@/integrations/supabase/client";
import { queryOptions } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;

export const PHONE_DISPLAY = "+254 789 638 352";
export const PHONE_E164 = "+254789638352";
export const PHONE_DIGITS = "254789638352";
export const TEL_LINK = `tel:${PHONE_E164}`;

export const CATEGORIES = ["TVs", "Soundbars", "Refrigerators", "Washing Machines"] as const;

export function whatsappLink(message: string) {
  return `https://wa.me/${PHONE_DIGITS}?text=${encodeURIComponent(message)}`;
}

export function orderMessage(p: Pick<Product, "name" | "price">, qty = 1) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  return `Hello TCL Kenya! I'd like to order:\n\n• ${p.name}\n• Qty: ${qty}\n• Price: ${formatKsh(Number(p.price))}\n\n${url}\n\nPlease confirm availability & delivery.`;
}

export function formatKsh(n: number) {
  return `KSh ${n.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}

export function discount(p: Pick<Product, "price" | "old_price">) {
  if (!p.old_price || Number(p.old_price) <= Number(p.price)) return 0;
  return Math.round((1 - Number(p.price) / Number(p.old_price)) * 100);
}

export const productsQuery = () =>
  queryOptions({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
