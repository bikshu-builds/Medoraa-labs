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

    const categories = [
        "All", "Blood Tests", "Diabetes", "Thyroid", "Vitamins", "Women Health", "Men Health", "Full Body Checkup"
    ];

    useEffect(() => {
        fetchTests();
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
                                <button 
                                    onClick={() => addToCart(test._id)}
                                    className="w-12 h-12 rounded-2xl bg-blue-600 hover:bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 transition-all active:scale-90"
                                >
                                    <Plus className="w-6 h-6" />
                                </button>
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

            {/* Sticky Cart Button (Mobile) */}
            <Link href="/patient/cart" className="md:hidden fixed bottom-28 right-6 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-600/40 z-50 animate-bounce">
                <ShoppingCart className="w-7 h-7" />
                <span className="absolute top-0 right-0 w-6 h-6 bg-rose-500 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-black">2</span>
            </Link>
        </div>
    );
}
