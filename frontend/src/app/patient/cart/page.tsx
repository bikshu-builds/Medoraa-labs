"use client";
import React, { useEffect, useState } from "react";
import { 
    ShoppingCart, 
    Trash2, 
    Plus, 
    Minus, 
    ArrowRight, 
    ChevronLeft,
    ShieldCheck,
    CreditCard,
    Ticket,
    Info,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import { appEvents } from "@/lib/events";

export default function PatientCart() {
    const [cart, setCart] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCart().then(() => appEvents.emit("cartUpdated"));
    }, []);

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem("patientToken");
            const res = await fetch(getApiUrl("/api/patient/cart"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const d = await res.json();
            if (d.success) setCart(d.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const removeFromCart = async (testId: string) => {
        try {
            const token = localStorage.getItem("patientToken");
            const res = await fetch(getApiUrl(`/api/patient/cart/${testId}`), {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const d = await res.json();
            if (d.success) {
                fetchCart();
                appEvents.emit("cartUpdated");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const total = cart?.items?.reduce((acc: number, item: any) => acc + item.test.price, 0) || 0;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Preparing your bucket...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                        <ShoppingCart className="w-8 h-8 text-blue-600" />
                        My Health Cart
                    </h1>
                    <p className="text-slate-500 font-bold mt-1">Review your tests and packages before booking.</p>
                </div>
                <Link href="/patient/tests" className="hidden md:flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">
                    <Plus className="w-4 h-4" /> Add More Tests
                </Link>
            </div>

            {cart?.items?.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.items.map((item: any) => (
                            <div key={item.test._id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
                                        <Info className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-1">
                                        <h3 className="text-lg font-black text-slate-900 truncate">{item.test.name}</h3>
                                        <span className="text-xl font-black text-slate-900 ml-4">₹{item.test.price}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase tracking-widest">{item.test.category}</span>
                                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                                        <span className="text-[10px] font-bold text-slate-400">Preparation: {item.test.preparationInstructions}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => removeFromCart(item.test._id)}
                                    className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Summary Card */}
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Booking Summary</h3>
                            
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                                    <span>Subtotal ({cart.items.length} Tests)</span>
                                    <span>₹{total}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                                    <span>Home Collection Fee</span>
                                    <span className="text-emerald-500 uppercase text-[10px] font-black">Free</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                                    <span>Health Tax (GST)</span>
                                    <span>₹0</span>
                                </div>
                                <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                                    <span className="text-lg font-black text-slate-900">Final Amount</span>
                                    <span className="text-2xl font-black text-blue-600">₹{total}</span>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-3 mb-8">
                                <Ticket className="w-5 h-5 text-blue-600" />
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Apply Coupon</p>
                                    <p className="text-[10px] font-bold text-blue-400">Save up to 20% on packages</p>
                                </div>
                                <ChevronLeft className="w-4 h-4 text-blue-300 rotate-180" />
                            </div>

                            <Link 
                                href="/patient/checkout"
                                className="w-full bg-slate-900 hover:bg-blue-600 text-white py-5 rounded-[1.25rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                Proceed to Checkout
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>

                        <div className="flex items-center gap-3 justify-center text-slate-400 opacity-60">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">256-bit SSL Secure Payment</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm text-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-slate-50">
                        <ShoppingCart className="w-12 h-12 text-slate-200" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your cart is empty</h2>
                    <p className="text-slate-400 font-bold mt-2 max-w-sm mx-auto">Looks like you haven't added any diagnostic tests to your cart yet.</p>
                    <Link href="/patient/tests" className="mt-10 inline-flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 active:scale-95 transition-all">
                        Browse Catalog
                    </Link>
                </div>
            )}
        </div>
    );
}
