"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CartLine } from "@/lib/types";
import {
  fetchServerCart,
  pingVisitor,
  syncServerCart,
} from "@/lib/api";
import { getOrCreateVisitorId } from "@/lib/visitor";

const STORAGE_KEY = "marcelo-cart";

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  addItem: (payload: {
    productId: string;
    title: string;
    price: number;
    size: string;
    imageColor?: string;
    imageUrl?: string;
    quantity?: number;
  }) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function lineIdOf(productId: string, size: string) {
  return `${productId}::${size}`;
}

function readStorage(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as CartLine[];
  } catch {
    return [];
  }
}

function writeStorage(lines: CartLine[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const visitorRef = useRef<string | null>(null);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (typeof window !== "undefined" && visitorRef.current === null) {
    visitorRef.current = getOrCreateVisitorId();
  }

  useEffect(() => {
    const vid = visitorRef.current || getOrCreateVisitorId();
    visitorRef.current = vid;
    let cancelled = false;
    const local = readStorage();

    (async () => {
      try {
        await pingVisitor(vid);
        const remote = await fetchServerCart(vid);
        if (cancelled) return;
        if (remote.length > 0) {
          setLines(remote);
          writeStorage(remote);
        } else if (local.length > 0) {
          setLines(local);
          await syncServerCart(vid, local);
        }
      } catch {
        if (!cancelled) setLines(local);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeStorage(lines);
    window.dispatchEvent(new Event("marcelo-cart"));

    const vid = visitorRef.current;
    if (!vid) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      void syncServerCart(vid, lines);
    }, 500);

    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [lines, ready]);

  const addItem = useCallback(
    (payload: {
      productId: string;
      title: string;
      price: number;
      size: string;
      imageColor?: string;
      imageUrl?: string;
      quantity?: number;
    }) => {
      const qty = payload.quantity ?? 1;
      const lineId = lineIdOf(payload.productId, payload.size);
      setLines((prev) => {
        const idx = prev.findIndex((l) => l.lineId === lineId);
        if (idx === -1) {
          return [
            ...prev,
            {
              lineId,
              productId: payload.productId,
              title: payload.title,
              price: payload.price,
              size: payload.size,
              quantity: qty,
              imageColor: payload.imageColor,
              imageUrl: payload.imageUrl,
            },
          ];
        }
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: next[idx].quantity + qty,
          imageColor: next[idx].imageColor || payload.imageColor,
          imageUrl: next[idx].imageUrl || payload.imageUrl,
        };
        return next;
      });
    },
    []
  );

  const setQuantity = useCallback((lineId: string, quantity: number) => {
    if (quantity < 1) {
      setLines((prev) => prev.filter((l) => l.lineId !== lineId));
      return;
    }
    setLines((prev) =>
      prev.map((l) => (l.lineId === lineId ? { ...l, quantity } : l))
    );
  }, []);

  const removeLine = useCallback((lineId: string) => {
    setLines((prev) => prev.filter((l) => l.lineId !== lineId));
  }, []);

  const clearCart = useCallback(() => {
    setLines([]);
  }, []);

  const itemCount = useMemo(
    () => lines.reduce((n, l) => n + l.quantity, 0),
    [lines]
  );

  const value = useMemo(
    () => ({
      lines,
      itemCount,
      addItem,
      setQuantity,
      removeLine,
      clearCart,
    }),
    [lines, itemCount, addItem, setQuantity, removeLine, clearCart]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
