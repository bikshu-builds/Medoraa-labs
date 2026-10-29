"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Search,
  X,
  Plus,
  Check,
  ShoppingBag,
  FlaskConical,
  Clock,
  Activity,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import samplesData from "@/data/samples_categorized.json";

export interface RawSampleTest {
  sl_no: number;
  organ: string;
  category: string;
  test_name: string;
  method?: string;
  container?: string;
  sample?: string;
  report_time?: string;
  units?: string;
  reference_range?: string;
  lab_price?: number;
  patient_price?: number;
  suitable_for?: string[];
}

type DemographicKey = "women" | "seniors" | "men" | "kids";

interface CategoryMeta {
  id: DemographicKey;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  badgeBg: string;
  badgeBorder: string;
  badgeIconColor: string;
  archBg: string;
  buttonBg: string;
  buttonHoverBg: string;
  buttonColor: string;
  activeTabBg: string;
  activeTextColor: string;
  accentBorder: string;
}

const CATEGORIES: CategoryMeta[] = [
  {
    id: "women",
    title: "Women",
    subtitle: "Complete care\nfor her health",
    description:
      "Comprehensive diagnostic screenings for hormonal balance, thyroid function, bone health, vitamin deficiencies, and reproductive wellness across every age.",
    image: "/images/women.png",
    archBg: "bg-[#fde2e8]",
    badgeBg: "bg-[#fef2f4]",
    badgeBorder: "border-[#fbcfe8]",
    badgeIconColor: "text-[#f43f5e]",
    buttonBg: "bg-[#fde2e8]",
    buttonHoverBg: "hover:bg-[#f43f5e] hover:text-white hover:shadow-rose-400/30",
    buttonColor: "text-[#f43f5e]",
    activeTabBg: "bg-[#f43f5e] text-white shadow-rose-500/25",
    activeTextColor: "text-[#f43f5e]",
    accentBorder: "border-rose-200 dark:border-rose-900/50",
  },
  {
    id: "seniors",
    title: "Seniors",
    subtitle: "Stay healthy\nin your golden years",
    description:
      "Specialized geriatric profiles targeting cardiac health, blood sugar control, kidney & liver function, joint density, and essential metabolic stability.",
    image: "/images/senior.png",
    archBg: "bg-[#e0f2fe]",
    badgeBg: "bg-[#f0f9ff]",
    badgeBorder: "border-[#bae6fd]",
    badgeIconColor: "text-[#0284c7]",
    buttonBg: "bg-[#dff0fb]",
    buttonHoverBg: "hover:bg-[#0284c7] hover:text-white hover:shadow-sky-400/30",
    buttonColor: "text-[#0284c7]",
    activeTabBg: "bg-[#0284c7] text-white shadow-sky-500/25",
    activeTextColor: "text-[#0284c7]",
    accentBorder: "border-sky-200 dark:border-sky-900/50",
  },
  {
    id: "men",
    title: "Men",
    subtitle: "Stay strong\nstay active",
    description:
      "Targeted health screenings focused on cardiovascular risk markers, vitality, liver health, lipid breakdown, and lifestyle stress diagnostics.",
    image: "/images/men.png",
    archBg: "bg-[#ede9fe]",
    badgeBg: "bg-[#f5f3ff]",
    badgeBorder: "border-[#ddd6fe]",
    badgeIconColor: "text-[#7c3aed]",
    buttonBg: "bg-[#ede9fe]",
    buttonHoverBg: "hover:bg-[#7c3aed] hover:text-white hover:shadow-violet-400/30",
    buttonColor: "text-[#7c3aed]",
    activeTabBg: "bg-[#7c3aed] text-white shadow-violet-500/25",
    activeTextColor: "text-[#7c3aed]",
    accentBorder: "border-violet-200 dark:border-violet-900/50",
  },
  {
    id: "kids",
    title: "Kids",
    subtitle: "Healthy kids\nhappier tomorrows",
    description:
      "Gentle pediatric diagnostics monitoring growth milestones, childhood anemia, infection markers, allergy profiles, and essential nutrition.",
    image: "/images/kids.png",
    archBg: "bg-[#fef2dc]",
    badgeBg: "bg-[#fffbeb]",
    badgeBorder: "border-[#fde68a]",
    badgeIconColor: "text-[#d97706]",
    buttonBg: "bg-[#fef2dc]",
    buttonHoverBg: "hover:bg-[#d97706] hover:text-white hover:shadow-amber-400/30",
    buttonColor: "text-[#d97706]",
    activeTabBg: "bg-[#d97706] text-white shadow-amber-500/25",
    activeTextColor: "text-[#d97706]",
    accentBorder: "border-amber-200 dark:border-amber-900/50",
  },
];

function CategoryIcon({ type }: { type: DemographicKey }) {
  if (type === "women") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-3.5 h-3.5 text-[#f43f5e]"
      >
        <circle cx="12" cy="8.5" r="5" />
        <line x1="12" y1="13.5" x2="12" y2="21" />
        <line x1="8.5" y1="17.5" x2="15.5" y2="17.5" />
      </svg>
    );
  }

  if (type === "seniors") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-3.5 h-3.5 text-[#0284c7]"
      >
        <path d="M12 21.5s7.5-3.8 7.5-9.5V5.2L12 2.5 4.5 5.2V12c0 5.7 7.5 9.5 7.5 9.5z" />
        <line x1="12" y1="8" x2="12" y2="14" />
        <line x1="9" y1="11" x2="15" y2="11" />
      </svg>
    );
  }

  if (type === "men") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-3.5 h-3.5 text-[#7c3aed]"
      >
        <circle cx="10" cy="14" r="5" />
        <line x1="13.5" y1="10.5" x2="19" y2="5" />
        <polyline points="14.5 5 19 5 19 9.5" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5 text-[#d97706]"
    >
      <circle cx="6.5" cy="7.5" r="2.2" fill="currentColor" fillOpacity="0.2" />
      <circle cx="17.5" cy="7.5" r="2.2" fill="currentColor" fillOpacity="0.2" />
      <circle cx="12" cy="14" r="6.2" />
      <circle cx="9.8" cy="12.8" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="14.2" cy="12.8" r="0.8" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="15.5" rx="2.4" ry="1.7" />
      <path d="M11.2 15h1.6" />
      <path d="M12 15v1" />
    </svg>
  );
}

export function CheckupCategories() {
  const [selectedDemographic, setSelectedDemographic] = useState<DemographicKey | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("All");
  const [visibleCount, setVisibleCount] = useState(40);

  const { isInCart, toggleItem, sendSingleTestWhatsApp, totalCount, openCart } = useCart();

  const typedSamples = samplesData as Record<DemographicKey, RawSampleTest[]>;

  // Current category metadata
  const currentMeta = useMemo(() => {
    return CATEGORIES.find((c) => c.id === selectedDemographic) || CATEGORIES[0];
  }, [selectedDemographic]);

  // List of all tests for current demographic
  const demographicTests = useMemo(() => {
    if (!selectedDemographic) return [];
    return typedSamples[selectedDemographic] || [];
  }, [selectedDemographic, typedSamples]);

  // Distinct subcategories with counts
  const subCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    demographicTests.forEach((t) => {
      const cat = t.category?.trim() || "General";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const sortedCats = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    return {
      all: demographicTests.length,
      categories: sortedCats.map((cat) => ({ name: cat, count: counts[cat] })),
    };
  }, [demographicTests]);

  // Filtered tests based on search and subcategory
  const filteredTests = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return demographicTests.filter((test) => {
      // Subcategory filter
      if (selectedSubCategory !== "All") {
        const cat = test.category?.trim() || "General";
        if (cat !== selectedSubCategory) return false;
      }

      // Search filter
      if (q) {
        const nameMatch = test.test_name?.toLowerCase().includes(q);
        const organMatch = test.organ?.toLowerCase().includes(q);
        const catMatch = test.category?.toLowerCase().includes(q);
        const methodMatch = test.method?.toLowerCase().includes(q);
        return nameMatch || organMatch || catMatch || methodMatch;
      }

      return true;
    });
  }, [demographicTests, selectedSubCategory, searchQuery]);

  const handleOpenDemographic = (id: DemographicKey) => {
    setSelectedDemographic(id);
    setSelectedSubCategory("All");
    setSearchQuery("");
    setVisibleCount(40);
  };

  const handleClose = () => {
    setSelectedDemographic(null);
  };

  return (
    <section id="tests" className="relative w-full py-6 sm:py-8 lg:py-10 overflow-hidden bg-gradient-to-b from-[#eef7fd] via-[#f7fbfe] to-[#ffffff] dark:from-zinc-950 dark:via-zinc-900 dark:to-black">
      {/* ── BACKGROUND MEDICAL DECORATIONS ── */}
      <div className="absolute top-3 left-3 sm:left-6 pointer-events-none opacity-50 text-[#c2e2f6] dark:text-sky-950/40 select-none">
        <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
          <rect x="36" y="8" width="28" height="84" rx="14" fill="currentColor" />
          <rect x="8" y="36" width="84" height="28" rx="14" fill="currentColor" />
        </svg>
      </div>

      <div className="absolute top-16 left-3 w-2 h-2 rounded-full bg-[#badef7]/70 pointer-events-none" />
      <div className="absolute top-10 left-28 sm:left-36 w-3 h-3 rounded-full bg-[#cce8fb]/60 pointer-events-none" />
      <div className="absolute bottom-8 left-4 w-3 h-3 rounded-full bg-[#badef7]/60 pointer-events-none" />

      {/* Top Right Stethoscope Illustration */}
      <div className="absolute top-1 right-2 sm:right-6 pointer-events-none opacity-40 sm:opacity-55 dark:opacity-20 select-none">
        <svg
          width="160"
          height="140"
          viewBox="0 0 280 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-28 h-24 sm:w-36 sm:h-30"
        >
          <path
            d="M215 16 C215 10 208 6 200 6 C192 6 186 10 186 16 L186 50 C186 72 200 88 222 94 L222 98 C222 120 245 132 260 150 C274 166 268 190 246 204 C222 218 188 210 176 184 C166 162 176 138 194 130 C210 122 218 108 214 94"
            stroke="#80c6f8"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M242 16 C242 10 248 6 256 6 C264 6 270 10 270 16 L270 50 C270 72 256 88 224 94"
            stroke="#80c6f8"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="200" cy="8" r="5" fill="#4fa3e3" />
          <circle cx="256" cy="8" r="5" fill="#4fa3e3" />
          <circle cx="174" cy="180" r="16" stroke="#80c6f8" strokeWidth="4.5" fill="#ffffff" fillOpacity="0.5" />
          <circle cx="174" cy="180" r="7.5" fill="#80c6f8" />
          <circle cx="132" cy="154" r="15" fill="#bde0fe" fillOpacity="0.35" />
          <circle cx="132" cy="154" r="6" fill="#60a5fa" fillOpacity="0.7" />
        </svg>
      </div>

      {/* ── HEADER CONTENT ── */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center mb-5 sm:mb-6">
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-[#015971] dark:text-sky-400 uppercase mb-1"
        >
          HEALTH CHECKUP
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0f2942] dark:text-white"
        >
          Checkup <span className="text-[#0284c7] dark:text-sky-400">Categories</span>
        </motion.h2>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="w-10 h-1 bg-[#0284c7] dark:bg-sky-400 rounded-full mx-auto mt-2 mb-2"
        />

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="text-[#64748b] dark:text-slate-300 text-xs sm:text-sm font-normal max-w-sm sm:max-w-md mx-auto"
        >
          Select a category to view recommended health checkups, add to collection cart, or ask for doorstep collection.
        </motion.p>
      </div>

      {/* ── 4 CATEGORY CARDS ── */}
      <div className="relative z-10 max-w-3xl lg:max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {CATEGORIES.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              whileHover={{ y: -5 }}
              onClick={() => handleOpenDemographic(cat.id)}
              className="group cursor-pointer bg-white dark:bg-zinc-900 rounded-[28px] sm:rounded-[34px] p-2.5 sm:p-3 pb-3.5 sm:pb-4 shadow-[0_8px_24px_rgba(2,132,199,0.06),0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_36px_rgba(2,132,199,0.16)] dark:shadow-none dark:border dark:border-zinc-800 flex flex-col items-center justify-between transition-all duration-300 relative border border-blue-50/80"
            >
              {/* Top Arch Image Dome */}
              <div
                className={`relative w-full aspect-[1/0.95] max-h-36 rounded-t-[22px] sm:rounded-t-[26px] rounded-b-[18px] sm:rounded-b-[20px] overflow-hidden ${cat.archBg} flex items-center justify-center`}
              >
                <Image
                  src={cat.image}
                  alt={`${cat.title} Health Checkup`}
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 18vw"
                  priority={index < 2}
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>

              {/* Floating Overlapping Badge */}
              <div
                className={`-mt-4 relative z-10 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-zinc-800 shadow-md border-[1.5px] ${cat.badgeBorder} ${cat.badgeBg} transition-transform duration-300 group-hover:scale-110`}
              >
                <CategoryIcon type={cat.id} />
              </div>

              {/* Category Title */}
              <h3 className="text-sm sm:text-base font-bold text-[#0f2942] dark:text-white mt-1.5 text-center tracking-tight">
                {cat.title}
              </h3>

              {/* Category Subtitle */}
              <p className="text-[10px] sm:text-[11px] text-[#64748b] dark:text-slate-400 text-center mt-0.5 leading-tight whitespace-pre-line font-medium min-h-[1.75rem] flex items-center justify-center">
                {cat.subtitle}
              </p>

              {/* Bottom Action Arrow Button */}
              <div
                className={`mt-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm ${cat.buttonBg} ${cat.buttonColor} ${cat.buttonHoverBg}`}
              >
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.4} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── INTERACTIVE CATEGORIZED TESTS EXPLORER MODAL ── */}
      <AnimatePresence>
        {selectedDemographic && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm"
            />

            {/* Modal Dialog Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden z-10 my-auto max-h-[92vh] flex flex-col"
            >
              {/* ── TOP HEADER (EXCLUSIVELY FOR SELECTED CATEGORY) ── */}
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-white dark:bg-zinc-800 shadow-sm border ${currentMeta.badgeBorder}`}>
                      <CategoryIcon type={currentMeta.id} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#015971] dark:text-cyan-400 block leading-tight">
                        Medoraa Diagnostic Lab
                      </span>
                      <h3 className="text-lg sm:text-xl font-extrabold text-[#0f2942] dark:text-white leading-tight">
                        {currentMeta.title} Tests & Checkups
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {currentMeta.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {totalCount > 0 && (
                      <button
                        onClick={openCart}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#015971]/10 text-[#015971] dark:text-cyan-300 hover:bg-[#015971] hover:text-white text-xs font-bold transition-all shadow-sm"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Cart ({totalCount})</span>
                      </button>
                    )}

                    <button
                      onClick={handleClose}
                      className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 flex items-center justify-center transition-colors shadow-sm"
                      aria-label="Close modal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── SEARCH & CATEGORY FILTER BAR ── */}
              <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setVisibleCount(40);
                    }}
                    placeholder={`Search among ${demographicTests.length} tests (e.g., CBC, Thyroid, Vitamin, Glucose)...`}
                    className="w-full text-xs sm:text-sm pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#015971] focus:bg-white dark:focus:bg-zinc-800 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Categorization Pills (Horizontal Filter) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                  <button
                    onClick={() => {
                      setSelectedSubCategory("All");
                      setVisibleCount(40);
                    }}
                    className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                      selectedSubCategory === "All"
                        ? "bg-[#015971] text-white shadow-sm"
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    <span>All</span>
                    <span className="text-[10px] opacity-80">({subCategoryCounts.all})</span>
                  </button>

                  {subCategoryCounts.categories.map((cat) => {
                    const isSelected = selectedSubCategory === cat.name;
                    return (
                      <button
                        key={cat.name}
                        onClick={() => {
                          setSelectedSubCategory(cat.name);
                          setVisibleCount(40);
                        }}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
                          isSelected
                            ? "bg-[#015971] text-white shadow-sm font-bold"
                            : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className={`text-[10px] ${isSelected ? "text-cyan-200" : "text-slate-400"}`}>
                          ({cat.count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── TESTS LIST GRID ── */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-50/40 dark:bg-zinc-950/40">
                {filteredTests.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <FlaskConical className="w-10 h-10 mx-auto text-slate-300 dark:text-zinc-700 mb-2" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300 text-sm">
                      No matching tests found
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try searching with a different test name or select &quot;All&quot; categories.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3 px-1 text-xs text-slate-500 font-medium">
                      <span>
                        Showing {Math.min(visibleCount, filteredTests.length)} of {filteredTests.length} tests in{" "}
                        <strong className="text-slate-700 dark:text-slate-200">{selectedSubCategory}</strong>
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Doorstep Sample Collection
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                      {filteredTests.slice(0, visibleCount).map((test) => {
                        const inCart = isInCart(`test-${test.sl_no}`);

                        return (
                          <div
                            key={test.sl_no}
                            className={`p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between bg-white dark:bg-zinc-900 ${
                              inCart
                                ? "border-emerald-300 dark:border-emerald-800 shadow-md shadow-emerald-500/5 bg-emerald-50/20"
                                : "border-slate-200/80 dark:border-zinc-800 hover:border-[#015971]/40 hover:shadow-md"
                            }`}
                          >
                            <div>
                              {/* Top Tags */}
                              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                                {test.category && (
                                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#015971]/10 text-[#015971] dark:text-cyan-300">
                                    {test.category}
                                  </span>
                                )}
                                {test.organ && (
                                  <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md truncate max-w-[180px]">
                                    {test.organ}
                                  </span>
                                )}
                              </div>

                              {/* Test Name */}
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                                {test.test_name}
                              </h4>

                              {/* Specimen & Report turnaround */}
                              <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 dark:text-slate-400 flex-wrap">
                                {test.sample && (
                                  <span className="flex items-center gap-1">
                                    <FlaskConical className="w-2.5 h-2.5 text-rose-500" />
                                    {test.sample}
                                  </span>
                                )}
                                {test.report_time && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5 text-sky-500" />
                                    {test.report_time}
                                  </span>
                                )}
                                {test.method && (
                                  <span className="text-[9px] text-slate-400">
                                    Method: {test.method}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons: Add to Cart & Ask for Sample Collection (NO PRICES SHOWN) */}
                            <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800">
                              <button
                                onClick={() =>
                                  toggleItem({
                                    id: `test-${test.sl_no}`,
                                    name: test.test_name,
                                    category: test.category,
                                    organ: test.organ,
                                    sample: test.sample,
                                    reportTime: test.report_time,
                                    method: test.method,
                                    type: "test",
                                  })
                                }
                                className={`flex-1 py-1.5 px-2.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 transition-all active:scale-95 ${
                                  inCart
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "bg-[#015971]/10 hover:bg-[#015971] text-[#015971] hover:text-white"
                                }`}
                              >
                                {inCart ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Added to Cart</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add to Cart</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => sendSingleTestWhatsApp(test.test_name, test.category)}
                                title="Ask for Sample Collection on WhatsApp (+91 6301851252)"
                                className="py-1.5 px-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-[11px] rounded-xl flex items-center gap-1 shadow-sm transition-all active:scale-95 flex-shrink-0"
                              >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z" />
                                </svg>
                                <span className="hidden sm:inline">Ask for Collection</span>
                                <span className="sm:hidden">Book</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Show More Button if more tests exist */}
                    {visibleCount < filteredTests.length && (
                      <div className="text-center mt-5">
                        <button
                          onClick={() => setVisibleCount((prev) => prev + 40)}
                          className="px-4 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-[#015971] text-xs font-bold text-[#015971] dark:text-cyan-300 rounded-xl shadow-sm transition-all"
                        >
                          Load More Tests ({filteredTests.length - visibleCount} remaining)
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ── STICKY MODAL FOOTER ── */}
              <div className="p-3 sm:p-4 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Free doorstep collection • NABL certified accuracy</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={openCart}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-[#015971] hover:bg-[#01475a] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-[#015971]/20 transition-all"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>View Collection Cart ({totalCount})</span>
                  </button>

                  <button
                    onClick={handleClose}
                    className="px-3 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default CheckupCategories;
