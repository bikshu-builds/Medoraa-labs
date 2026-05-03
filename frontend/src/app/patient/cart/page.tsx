"use client";
import React, { useEffect, useState } from "react";
import {
    ShoppingCart,
    Trash2,
    Plus,
    ArrowRight,
    Loader2,
    CheckCircle2,
    Circle,
    Ticket,
    ShieldCheck,
    Info
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import { appEvents } from "@/lib/events";

export default function PatientCart() {
    const [cart, setCart] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const router = useRouter();

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
                setSelectedIds(prev => {
                    const next = new Set(prev);
                    next.delete(testId);
                    return next;
                });
                fetchCart();
                appEvents.emit("cartUpdated");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const toggleSelect = (testId: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(testId)) next.delete(testId);
            else next.add(testId);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (!cart?.items) return;
        if (selectedIds.size === cart.items.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(cart.items.map((i: any) => i.test._id)));
        }
    };

    const selectedItems = cart?.items?.filter((item: any) => selectedIds.has(item.test._id)) || [];
    const selectedTotal = selectedItems.reduce((acc: number, item: any) => acc + item.test.price, 0);

    const handlePlaceOrder = () => {
        if (selectedItems.length === 0) return;
        const ids = encodeURIComponent(selectedItems.map((i: any) => i.test._id).join(","));
        router.push(`/patient/checkout?tests=${ids}`);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-[#1A3263] animate-spin" />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Preparing your cart...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#1A3263] flex items-center gap-3">
                        <ShoppingCart className="w-7 h-7" />
                        My Health Cart
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Select the tests you want to book</p>
                </div>
                <Link
                    href="/patient/tests"
                    className="inline-flex items-center gap-2 bg-[#1A3263] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#124170] transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add More Tests
                </Link>
            </div>

            {cart?.items?.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Items List */}
                    <div className="lg:col-span-2">
                        {/* Select All Bar */}
                        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-5 py-3 mb-4">
                            <label className="flex items-center gap-3 cursor-pointer" onClick={toggleSelectAll}>
                                <div className="w-5 h-5 flex items-center justify-center">
                                    {selectedIds.size === cart.items.length && cart.items.length > 0 ? (
                                        <CheckCircle2 className="w-5 h-5 text-[#1A3263]" />
                                    ) : (
                                        <Circle className="w-5 h-5 text-gray-300" />
                                    )}
                                </div>
                                <span className="text-sm font-semibold text-gray-700">
                                    {selectedIds.size === cart.items.length ? "Deselect All" : "Select All"}
                                </span>
                            </label>
                            <span className="text-sm text-gray-400 font-medium">
                                {selectedIds.size} of {cart.items.length} selected
                            </span>
                        </div>

                        <div className="space-y-3">
                            {cart.items.map((item: any) => {
                                const isSelected = selectedIds.has(item.test._id);
                                return (
                                    <div
                                        key={item.test._id}
                                        className={cn(
                                            "bg-white border rounded-lg p-5 flex items-center gap-4 transition-all",
                                            isSelected
                                                ? "border-[#1A3263] bg-[#F1F5F9]"
                                                : "border-gray-200 hover:border-gray-300"
                                        )}
                                    >
                                        {/* Checkbox */}
                                        <button
                                            onClick={() => toggleSelect(item.test._id)}
                                            className="shrink-0 w-5 h-5 flex items-center justify-center"
                                        >
                                            {isSelected ? (
                                                <CheckCircle2 className="w-5 h-5 text-[#1A3263]" />
                                            ) : (
                                                <Circle className="w-5 h-5 text-gray-300" />
                                            )}
                                        </button>

                                        {/* Icon */}
                                        <div className="w-12 h-12 bg-[#F1F5F9] rounded-lg flex items-center justify-center shrink-0">
                                            <Info className="w-6 h-6 text-[#406093]" />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className="text-base font-bold text-gray-900">{item.test.name}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="px-2 py-0.5 bg-[#E8F6F8] text-[#4295A5] rounded text-[10px] font-bold uppercase tracking-wide">
                                                            {item.test.category}
                                                        </span>
                                                        <span className="text-[11px] text-gray-400">
                                                            Prep: {item.test.preparationInstructions}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="text-lg font-bold text-[#1A3263] shrink-0">₹{item.test.price}</span>
                                            </div>
                                        </div>

                                        {/* Delete */}
                                        <button
                                            onClick={() => removeFromCart(item.test._id)}
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-8">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em] mb-6">Order Summary</h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 font-medium">Selected Tests</span>
                                    <span className="font-bold text-gray-900">{selectedItems.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 font-medium">Subtotal</span>
                                    <span className="font-bold text-gray-900">₹{selectedTotal}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 font-medium">Home Collection</span>
                                    <span className="text-[#4295A5] font-bold text-xs uppercase">Free</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 font-medium">GST</span>
                                    <span className="font-bold text-gray-900">₹0</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3 flex justify-between">
                                    <span className="text-base font-bold text-gray-900">Total Payable</span>
                                    <span className="text-xl font-bold text-[#1A3263]">₹{selectedTotal}</span>
                                </div>
                            </div>



                            <button
                                onClick={handlePlaceOrder}
                                disabled={selectedItems.length === 0}
                                className="w-full bg-[#1A3263] hover:bg-[#124170] disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                            >
                                Place Order ({selectedItems.length})
                                <ArrowRight className="w-4 h-4" />
                            </button>

                            <div className="flex items-center justify-center gap-2 mt-4">
                                <ShieldCheck className="w-4 h-4 text-[#4295A5]" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">256-bit SSL Secure</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Empty State */
                <div className="bg-white border border-gray-200 rounded-xl py-20 px-6 text-center">
                    <div className="w-20 h-20 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingCart className="w-10 h-10 text-gray-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#1A3263] mb-2">Your cart is empty</h2>
                    <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
                        Looks like you haven't added any diagnostic tests to your cart yet.
                    </p>
                    <Link
                        href="/patient/tests"
                        className="inline-flex items-center gap-2 bg-[#1A3263] text-white px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-[#124170] transition-colors"
                    >
                        Browse Catalog
                    </Link>
                </div>
            )}
        </div>
    );
}
