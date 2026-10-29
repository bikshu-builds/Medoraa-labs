"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  id: string;
  name: string;
  category?: string;
  organ?: string;
  sample?: string;
  reportTime?: string;
  method?: string;
  type?: "test" | "package";
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: CartItem) => void;
  isInCart: (id: string) => boolean;
  clearCart: () => void;
  totalCount: number;
  sendWhatsAppRequest: (patientInfo?: { name?: string; phone?: string; address?: string }) => void;
  sendSingleTestWhatsApp: (testName: string, category?: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const WHATSAPP_NUMBER = "916301851252";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("medoraa_cart");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load cart from storage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("medoraa_cart", JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to storage", e);
    }
  }, [items, isLoaded]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const toggleItem = (item: CartItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) {
        return prev.filter((i) => i.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const isInCart = (id: string) => {
    return items.some((i) => i.id === id);
  };

  const clearCart = () => {
    setItems([]);
  };

  const sendWhatsAppRequest = (patientInfo?: { name?: string; phone?: string; address?: string }) => {
    if (items.length === 0) return;

    let msg = `*Medoraa Labs - Home Sample Collection Request*\n\n`;
    msg += `Hello Medoraa Labs, I want to book a Home Sample Collection for the following test(s):\n\n`;

    items.forEach((item, index) => {
      msg += `${index + 1}. *${item.name}*`;
      if (item.category) msg += ` [${item.category}]`;
      if (item.sample) msg += ` (${item.sample})`;
      msg += `\n`;
    });

    if (patientInfo?.name || patientInfo?.phone || patientInfo?.address) {
      msg += `\n*Patient Details:*`;
      if (patientInfo.name?.trim()) msg += `\n- Name: ${patientInfo.name.trim()}`;
      if (patientInfo.phone?.trim()) msg += `\n- Contact: ${patientInfo.phone.trim()}`;
      if (patientInfo.address?.trim()) msg += `\n- Address / Area: ${patientInfo.address.trim()}`;
    }

    msg += `\n\nPlease confirm availability and the nearest home collection time slot.`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const sendSingleTestWhatsApp = (testName: string, category?: string) => {
    let msg = `Hello Medoraa Labs, I want to request a Home Sample Collection for "*${testName}*"`;
    if (category) {
      msg += ` [${category}]`;
    }
    msg += `. Please share the available appointment time slots.`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        toggleItem,
        isInCart,
        clearCart,
        totalCount: items.length,
        sendWhatsAppRequest,
        sendSingleTestWhatsApp,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
