import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface CartItem {
  bookId: string;
  title: string;
  author: string;
  price: number;
  coverImage: string;
  stock: number;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (bookId: string, quantity: number) => void;
  removeItem: (bookId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "libraria-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem: CartContextValue["addItem"] = (item, quantity = 1) => {
    setItems((prev) => {
      const index = prev.findIndex((i) => i.bookId === item.bookId);
      if (index >= 0) {
        const copy = [...prev];
        const nextQty = Math.min(copy[index].quantity + quantity, item.stock);
        copy[index] = { ...copy[index], quantity: nextQty };
        return copy;
      }
      return [...prev, { ...item, quantity: Math.min(quantity, item.stock) }];
    });
  };

  const setQuantity: CartContextValue["setQuantity"] = (bookId, quantity) => {
    setItems((prev) =>
      prev
        .map((i) => (i.bookId === bookId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (bookId: string) => setItems((prev) => prev.filter((i) => i.bookId !== bookId));
  const clear = () => setItems([]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  return (
    <CartContext.Provider value={{ items, itemCount, subtotal, addItem, setQuantity, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
