import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { toast } from "sonner";

export interface CartItem {
  id: string | number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  unit?: string; // 'piece' | 'box' | 'slab' | 'unit'
  specs?: string;
  dimensions?: string;
  finish?: string;
  category?: string;
  totalSqft?: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalCount: number;
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "mubarak_luxury_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // storage unavailable
    }
  }, [cart]);

  const addToCart = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    const qtyToAdd = item.quantity && item.quantity > 0 ? item.quantity : 1;
    setCart((prev) => {
      const existingIdx = prev.findIndex((i) => String(i.id) === String(item.id));
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + qtyToAdd,
        };
        return next;
      }
      return [...prev, { ...item, quantity: qtyToAdd }];
    });

    toast.success(`Added ${item.name} to Cart`, {
      description: `Quantity: ${qtyToAdd} ${item.unit || "unit"} · Total: ₹${((item.price || 0) * qtyToAdd).toLocaleString("en-IN")}`,
      duration: 3500,
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string | number) => {
    setCart((prev) => {
      const item = prev.find((i) => String(i.id) === String(id));
      if (item) {
        toast.info(`Removed ${item.name} from Cart`, { duration: 3500 });
      }
      return prev.filter((i) => String(i.id) !== String(id));
    });
  };

  const updateQuantity = (id: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (String(i.id) === String(id) ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const openCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };
  const closeCheckout = () => setIsCheckoutOpen(false);

  const totalCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const gstAmount = useMemo(() => Math.round(subtotal * 0.18), [subtotal]);
  const totalAmount = useMemo(() => subtotal + gstAmount, [subtotal, gstAmount]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        totalCount,
        subtotal,
        gstAmount,
        totalAmount,
        isCheckoutOpen,
        openCheckout,
        closeCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
