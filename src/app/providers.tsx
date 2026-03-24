"use client";

import { AnalyticsTracker } from "@/components/AnalyticsTracker/AnalyticsTracker";
import { CartProvider } from "@/context/CartContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <AnalyticsTracker />
      {children}
    </CartProvider>
  );
}
