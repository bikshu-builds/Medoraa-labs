"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Trash2, Clock, FlaskConical, MapPin, User, Phone, CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

export const CartDrawer: React.FC = () => {
  const { items, isOpen, closeCart, openCart, removeItem, clearCart, totalCount, sendWhatsAppRequest } = useCart();
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientAddress, setPatientAddress] = useState("");

  const handleBook = () => {
    sendWhatsAppRequest({
      name: patientName,
      phone: patientPhone,
      address: patientAddress,
    });
    clearCart();
    setPatientName("");
    setPatientPhone("");
    setPatientAddress("");
    closeCart();
  };

  return (
    <>
      {/* ── FLOATING TRIGGER BUTTON (When items exist in cart) ── */}
      <AnimatePresence>
        {totalCount > 0 && !isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-[90]"
          >
            <motion.button
              onClick={openCart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex items-center gap-2.5 bg-[#015971] text-white px-5 py-3.5 rounded-full shadow-[0_10px_25px_rgba(1,89,113,0.35)] hover:bg-[#01475a] transition-all font-semibold text-sm border-2 border-white/20"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-white" />
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {totalCount}
                </span>
              </div>
              <span className="font-bold">Collection Cart</span>
              <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full text-white font-medium">
                {totalCount} {totalCount === 1 ? "test" : "tests"}
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CART DRAWER MODAL / SLIDE-OVER ── */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[110] flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCart}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Slide-over panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 dark:border-zinc-800"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-[#015971]/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#015971]/10 flex items-center justify-center text-[#015971] dark:text-cyan-400">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Sample Collection Cart
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {totalCount} {totalCount === 1 ? "test" : "tests"} selected for pickup
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeCart}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                  aria-label="Close cart"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                      <ShoppingBag className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                      Your collection cart is empty
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Explore tests from Women, Seniors, Men, or Kids categories and click &quot;Add to Cart&quot;.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Selected Tests
                      </span>
                      <button
                        onClick={clearCart}
                        className="text-xs text-rose-500 hover:text-rose-600 font-semibold"
                      >
                        Clear All
                      </button>
                    </div>

                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 flex items-start justify-between gap-3 hover:border-slate-300 transition-all"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            {item.name}
                          </h4>

                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {item.category && (
                              <span className="inline-flex items-center text-[10px] font-medium bg-[#015971]/10 text-[#015971] dark:text-cyan-300 px-2 py-0.5 rounded-md">
                                {item.category}
                              </span>
                            )}
                            {item.sample && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-300 bg-white dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 px-2 py-0.5 rounded-md">
                                <FlaskConical className="w-2.5 h-2.5 text-rose-500" />
                                {item.sample}
                              </span>
                            )}
                            {item.reportTime && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-300 bg-white dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 px-2 py-0.5 rounded-md">
                                <Clock className="w-2.5 h-2.5 text-sky-500" />
                                {item.reportTime}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors flex-shrink-0"
                          title="Remove test"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {/* Patient Collection Information (Optional) */}
                    <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-2.5">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#015971]" />
                        Patient Details (Optional)
                      </p>

                      <div className="space-y-2">
                        <div className="relative">
                          <input
                            type="text"
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            placeholder="Patient Full Name"
                            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#015971]"
                          />
                        </div>

                        <div className="relative">
                          <input
                            type="tel"
                            value={patientPhone}
                            onChange={(e) => setPatientPhone(e.target.value)}
                            placeholder="Phone Number (e.g., 9876543210)"
                            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#015971]"
                          />
                        </div>

                        <div className="relative">
                          <input
                            type="text"
                            value={patientAddress}
                            onChange={(e) => setPatientAddress(e.target.value)}
                            placeholder="Collection Address / Landmark"
                            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#015971]"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer CTA */}
              {items.length > 0 && (
                <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200/60 dark:border-emerald-900/50">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                    <span>Free home sample collection • Certified phlebotomist</span>
                  </div>

                  <button
                    onClick={handleBook}
                    className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z" />
                    </svg>
                    <span>Ask for Sample Collection</span>
                  </button>
                  <p className="text-[10px] text-center text-slate-400">
                    Sends test list directly to Medoraa Labs WhatsApp (+91 6301851252)
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartDrawer;
