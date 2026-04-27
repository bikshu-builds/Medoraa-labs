"use client";
import React, { useEffect, useState } from "react";
import {
    Search,
    Filter,
    ShoppingCart,
    Info,
    Clock,
    Zap,
    ArrowRight,
    Star,
    ChevronDown,
    Plus,
    X,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function TestBrowsing() {
    const [tests, setTests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [cart, setCart] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<any[]>([]);

    const categories = [
        "All",
        "Diabetes / Sugar",
        "Liver (Hepatic)",
        "Kidney / Renal",
        "Heart / Cardiac",
        "Thyroid / Hormones",
        "Infections / Fever",
        "Immunology / Autoimmune",
        "Microbiology",
        "General Health Profiles",
        "Cancer Markers",
        "Bone / Mineral",
        "Urine / Stool"
    ];

    useEffect(() => {
        fetchTests();
        fetchCart();
        fetchSuggestions();
    }, []);

    const fetchTests = async () => {
        try {
            const res = await fetch(getApiUrl("/api/patient/tests"));
            const d = await res.json();
            if (d.success) setTests(d.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem("patientToken");
            if (!token) return;
            const res = await fetch(getApiUrl("/api/patient/cart"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const d = await res.json();
            if (d.success && d.data?.items) setCart(d.data.items);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSuggestions = async () => {
        try {
            const token = localStorage.getItem("patientToken");
            if (!token) return;
            const res = await fetch(getApiUrl("/api/patient/suggestions"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const d = await res.json();
            if (d.success) setSuggestions(d.data);
        } catch (err) {
            console.error(err);
        }
    };

    const addToCart = async (testId: string) => {
        try {
            const token = localStorage.getItem("patientToken");
            const res = await fetch(getApiUrl("/api/patient/cart"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ testId })
            });
            const d = await res.json();
            if (d.success) {
                setCart(d.data.items);
                // Simple toast or animation
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredTests = tests.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === "All" || t.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Search & Header */}
            <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-4xl font-black tracking-tight mb-4">Find Your Diagnostic Test</h1>
                    <p className="text-slate-400 font-bold mb-8">Search from over 200+ specialized tests and packages at competitive prices.</p>

                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-3xl border border-white/10 group focus-within:bg-white focus-within:border-white transition-all shadow-2xl">
                        <div className="flex-1 flex items-center gap-4 px-4 py-2">
                            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600" />
                            <input
                                type="text"
                                placeholder="E.g. Full Body Checkup, Thyroid..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm font-bold w-full text-slate-100 group-focus-within:text-slate-900 placeholder:text-slate-500"
                            />
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-[1.25rem] font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-blue-600/20">
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Suggestions Section */}
            {suggestions.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        <h2 className="text-lg font-black text-slate-900">Recommended For You</h2>
                    </div>
                    <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-4">
                        {suggestions.map((test) => (
                            <div key={test._id} className="min-w-[300px] bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-6 rounded-[2rem] shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-black text-slate-900 leading-tight">{test.name}</h3>
                                    <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
                                        <Star className="w-4 h-4 fill-amber-500" />
                                    </div>
                                </div>
                                <p className="text-[10px] font-bold text-slate-500 mb-4 line-clamp-1">{test.description}</p>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="font-black text-lg">₹{test.price}</span>
                                    {cart.some((c: any) => (c.test?._id || c.test) === test._id) ? (
                                        <button disabled className="px-4 py-2 bg-white/50 text-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-amber-200">Added</button>
                                    ) : (
                                        <button
                                            onClick={() => addToCart(test._id)}
                                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95"
                                        >
                                            Add to Cart
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Categories Scroll */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                            "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
                            activeCategory === cat
                                ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20"
                                : "bg-white text-slate-400 border-slate-100 hover:border-blue-200 hover:text-blue-600"
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {isLoading ? (
                    Array(8).fill(0).map((_, i) => (
                        <div key={i} className="bg-white rounded-[2.5rem] h-80 border border-slate-100 animate-pulse" />
                    ))
                ) : filteredTests.length > 0 ? (
                    filteredTests.map((test) => (
                        <div key={test._id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all group flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                        {test.category}
                                    </div>
                                    {test.isPopular && (
                                        <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
                                            <Star className="w-4 h-4 fill-amber-500" />
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">{test.name}</h3>
                                <p className="text-xs font-bold text-slate-400 line-clamp-2 mb-6">{test.description}</p>

                                <div className="flex items-center gap-4 text-slate-400 mb-8">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{test.tat}</span>
                                    </div>
                                    <div className="w-px h-3 bg-slate-100" />
                                    <div className="flex items-center gap-1.5">
                                        <Zap className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{test.sampleType}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</span>
                                    <span className="text-2xl font-black text-slate-900">₹{test.price}</span>
                                </div>
                                {cart.some((c: any) => (c.test?._id || c.test) === test._id) ? (
                                    <button
                                        disabled
                                        className="px-4 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xs cursor-not-allowed"
                                    >
                                        Added
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => addToCart(test._id)}
                                        className="w-12 h-12 rounded-2xl bg-blue-600 hover:bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 transition-all active:scale-90 group"
                                        title="Add to Cart"
                                    >
                                        <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-slate-100">
                            <Search className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900">No tests found</h3>
                        <p className="text-slate-400 font-bold mt-2">Try searching for something else or browse categories.</p>
                    </div>
                )}
            </div>

            {/* Sticky Cart Button */}
            {cart.length > 0 && (
                <Link href="/patient/checkout" className="fixed bottom-10 right-10 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-600/40 z-50 hover:scale-110 transition-transform">
                    <ShoppingCart className="w-7 h-7" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-rose-500 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-black">{cart.length}</span>
                </Link>
            )}
        </div>
    );
}
