"use client";
import React, { useEffect, useState } from "react";
import {
    Search,
    ShoppingCart,
    Info,
    Clock,
    Zap,
    Star,
    Loader2,
    ShieldCheck,
    Plus,
    Minus,
    FlaskConical,
    Trash2,
    Check,
    X,
    FileText,
    Activity,
    FlaskRound
} from "lucide-react";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import { appEvents } from "@/lib/events";

export default function TestBrowsing() {
    const [tests, setTests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [cart, setCart] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [selectedTest, setSelectedTest] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
        fetchCart().then(() => appEvents.emit("cartUpdated"));
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
                if (d.data?.items) {
                    setCart(d.data.items);
                } else {
                    fetchCart();
                }
                appEvents.emit("cartUpdated");
            }
        } catch (err) {
            console.error(err);
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
                if (d.data?.items) {
                    setCart(d.data.items);
                } else {
                    fetchCart(); // Fallback if data is missing
                }
                appEvents.emit("cartUpdated");
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

    const isInCart = (testId: string) => {
        return cart.some((c: any) => (c.test?._id || c.test) === testId);
    };

    const openDetails = (test: any) => {
        setSelectedTest(test);
        setIsModalOpen(true);
    };

    const closeDetails = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedTest(null), 300); // Wait for animation
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Hero Search Section */}
            <div
                className="pt-10 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden shadow-sm"
                style={{
                    backgroundColor: "#1A3263",
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/black-thread.png")',
                    backgroundBlendMode: 'multiply'
                }}
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#4295A5]/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                        Find Your Diagnostic Test
                    </h1>
                    <p className="text-blue-100 text-base mb-8 font-medium">
                        Search from our comprehensive catalog of 200+ certified tests
                    </p>

                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/10 focus-within:bg-white/20 transition-all max-w-2xl mx-auto">
                        <Search className="w-5 h-5 text-blue-200 ml-3 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search tests... e.g. Thyroid, CBC, Diabetes"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm font-medium w-full text-white placeholder:text-blue-200/60 py-2"
                        />
                        <button className="bg-[#406093] hover:bg-[#124170] text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors shrink-0">
                            Search
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
                {/* Suggestions Section */}
                {suggestions.length > 0 && (
                    <div className="mb-10 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {suggestions.map((test) => (
                                <div
                                    key={test._id}
                                    onClick={() => openDetails(test)}
                                    className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50 hover:shadow-[0_12px_30px_rgb(0,0,0,0.06)] transition-all duration-500 flex flex-col group relative cursor-pointer mt-4"
                                >
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-[#1A3263] rounded-full shadow-md text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                                            <Star className="w-3 h-3 fill-[#1A3263]" /> Recommended For You
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <img
                                            src="https://i.pinimg.com/736x/d0/6a/13/d06a13ce1f4da8d86989657faabf6276.jpg"
                                            alt="Test Icon"
                                            className="w-12 h-12 object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <h3 className="font-bold text-[#1A3263] text-sm mb-1 leading-tight">{test.name}</h3>
                                    <p className="text-[10px] text-gray-400 mb-4 line-clamp-1">{test.description}</p>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                        <span className="font-bold text-[#1A3263] text-base">₹{test.price}</span>
                                        {isInCart(test._id) ? (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeFromCart(test._id); }}
                                                className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-all active:scale-90"
                                                title="Remove from Cart"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); addToCart(test._id); }}
                                                className="w-9 h-9 rounded-xl bg-[#1A3263] hover:bg-[#124170] text-white flex items-center justify-center shadow-md shadow-[#1A3263]/10 transition-all active:scale-90"
                                                title="Add to Cart"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Categories */}
                <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-3 mb-6">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                                "px-5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
                                activeCategory === cat
                                    ? "bg-[#1A3263] text-white border-[#1A3263] shadow-md shadow-[#1A3263]/20"
                                    : "bg-white text-gray-400 border-gray-200 hover:border-[#1A3263]/30 hover:text-[#1A3263]"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Test Grid - Homepage Card Style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-16">
                    {isLoading ? (
                        Array(8).fill(0).map((_, i) => (
                            <div key={i} className="bg-white rounded-xl h-72 border border-gray-100 animate-pulse" />
                        ))
                    ) : filteredTests.length > 0 ? (
                        filteredTests.map((test) => (
                            <div
                                key={test._id}
                                className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-50 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:border-[#1A3263]/10 transition-all duration-500 flex flex-col group relative"
                            >
                                {/* Category Badge */}
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 bg-[#E8F6F8] text-[#4295A5] rounded-full text-[9px] font-bold uppercase tracking-wider">
                                        {test.category || "General"}
                                    </span>
                                </div>

                                {/* Safe Icon */}
                                <div className="absolute top-4 right-4">
                                    <ShieldCheck className="w-4 h-4 text-[#00D084]" />
                                </div>

                                {/* Icon Section */}
                                <div className="mt-4 mb-6 flex justify-center">
                                    <img
                                        src="https://i.pinimg.com/736x/d0/6a/13/d06a13ce1f4da8d86989657faabf6276.jpg"
                                        alt={test.name}
                                        className="w-16 h-16 object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>

                                {/* Content Section */}
                                <div className="flex-1 text-center mb-6">
                                    <h3 className="text-[15px] font-bold text-[#1A3263] leading-tight mb-2 line-clamp-2 min-h-[2.5rem]">
                                        {test.name}
                                    </h3>
                                    <div className="flex items-center justify-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {test.tat || "24h"}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-gray-200" />
                                        <span className="flex items-center gap-1">
                                            <Activity className="w-3 h-3" /> {test.sampleType || "Blood"}
                                        </span>
                                    </div>
                                </div>

                                {/* Price Section */}
                                <div className="flex items-center justify-between mb-6 pt-4 border-t border-gray-50">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Price</span>
                                        <span className="text-xl font-bold text-[#1A3263]">₹{test.price}</span>
                                    </div>
                                    <button
                                        onClick={() => openDetails(test)}
                                        className="text-[11px] font-bold text-[#4295A5] hover:text-[#1A3263] transition-colors underline underline-offset-4"
                                    >
                                        View Details
                                    </button>
                                </div>

                                {/* Action Button */}
                                {isInCart(test._id) ? (
                                    <button
                                        onClick={() => removeFromCart(test._id)}
                                        className="w-full py-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Remove from Cart
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => addToCart(test._id)}
                                        className="w-full py-3 rounded-xl bg-[#1A3263] text-white text-xs font-bold hover:bg-[#124170] shadow-lg shadow-[#1A3263]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Add to Cart
                                    </button>
                                )}
                            </div>
                        ))

                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-20 h-20 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-[#1A3263] mb-2">No tests found</h3>
                            <p className="text-gray-400 text-sm">
                                Try adjusting your search or browse a different category.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Test Details Modal */}
            {isModalOpen && selectedTest && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-[#1A3263]/40 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={closeDetails}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-300">
                        {/* Close Button */}
                        <button
                            onClick={closeDetails}
                            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8">
                            {/* Header Section */}
                            <div className="flex flex-col sm:flex-row gap-6 mb-8">
                                <div className="w-24 h-24 rounded-3xl bg-[#F8FAFC] flex items-center justify-center shrink-0 shadow-inner">
                                    <img
                                        src="https://i.pinimg.com/736x/d0/6a/13/d06a13ce1f4da8d86989657faabf6276.jpg"
                                        alt={selectedTest.name}
                                        className="w-16 h-16 object-contain"
                                    />
                                </div>
                                <div className="flex-1 pt-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-3 py-1 bg-[#E8F6F8] text-[#4295A5] rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                            {selectedTest.category}
                                        </span>
                                        {selectedTest.isPopular && (
                                            <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                                Popular
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-bold text-[#1A3263] leading-tight">{selectedTest.name}</h2>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-[#4295A5]" />
                                    About this Test
                                </h3>
                                <p className="text-sm text-gray-500 leading-relaxed bg-[#F8FAFC] p-4 rounded-2xl border border-gray-50">
                                    {selectedTest.description || "Comprehensive diagnostic analysis provided by Medoraa Labs certified professionals."}
                                </p>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                <div className="p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Report TAT</p>
                                        <p className="text-sm font-bold text-[#1A3263]">{selectedTest.tat || "24-48 Hours"}</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                        <Activity className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sample Type</p>
                                        <p className="text-sm font-bold text-[#1A3263]">{selectedTest.sampleType || "Blood"}</p>
                                    </div>
                                </div>
                                <div className="sm:col-span-2 p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                        <FlaskRound className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Preparation Instructions</p>
                                        <p className="text-sm font-bold text-[#1A3263]">{selectedTest.preparationInstructions || "No special preparation needed. Overnight fasting may be required for some tests."}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-gray-100">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Price</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl font-bold text-[#1A3263]">₹{selectedTest.price}</span>
                                        {selectedTest.originalPrice && selectedTest.originalPrice > selectedTest.price && (
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-400 line-through">₹{selectedTest.originalPrice}</span>
                                                <span className="text-[10px] font-bold text-[#00D084]">{Math.round(((selectedTest.originalPrice - selectedTest.price) / selectedTest.originalPrice) * 100)}% OFF</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="w-full sm:w-auto">
                                    {isInCart(selectedTest._id) ? (
                                        <button
                                            onClick={() => { removeFromCart(selectedTest._id); closeDetails(); }}
                                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                            Remove from Cart
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => { addToCart(selectedTest._id); closeDetails(); }}
                                            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-[#1A3263] text-white font-bold hover:bg-[#122850] shadow-xl shadow-[#1A3263]/20 transition-all active:scale-[0.98]"
                                        >
                                            Add to Cart
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
