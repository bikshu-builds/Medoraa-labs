"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical,
  FileText,
  Star,
  Sparkles,
  ShieldCheck,
  Heart,
  Check,
  Plus,
  Phone,
  Info,
  X,
} from "lucide-react";

interface PackageCard {
  id: string;
  badgeType: "pulse";
  badgeText: string;
  tagIcon: "star" | "sparkles" | "shield" | "heart";
  tagText: string;
  title: string;
  subtitle: string;
  parametersCount: number;
  parametersLabel: string;
  reportsTime: string;
  originalPrice: number;
  discountPercent: number;
  finalPrice: number;
  testsList: string[];
}

const SAMPLE_PACKAGES: PackageCard[] = [
  {
    id: "pkg-1",
    badgeType: "pulse",
    badgeText: "HEALTH CHECKUP",
    tagIcon: "star",
    tagText: "Most Popular",
    title: "Full Body Checkup - Essential",
    subtitle: "A complete health assessment for a healthier you.",
    parametersCount: 90,
    parametersLabel: "Parameters",
    reportsTime: "6 hours",
    originalPrice: 5998,
    discountPercent: 73,
    finalPrice: 1599,
    testsList: [
      "Complete Blood Count (CBC - 24 Tests)",
      "Liver Function Test (LFT - 12 Tests)",
      "Kidney Function Test (KFT - 10 Tests)",
      "Lipid Profile (Cholesterol & Triglycerides - 8 Tests)",
      "Fasting Blood Sugar (Glucose)",
      "Thyroid Profile (TSH)",
      "Complete Urine Examination (22 Tests)",
      "Erythrocyte Sedimentation Rate (ESR)",
    ],
  },
  {
    id: "pkg-2",
    badgeType: "pulse",
    badgeText: "HEALTH CHECKUP",
    tagIcon: "sparkles",
    tagText: "Best Value",
    title: "Full Body Checkup - Comprehensive",
    subtitle: "Advanced screening including Cardiac Risk, Vitamins D & B12.",
    parametersCount: 108,
    parametersLabel: "Parameters",
    reportsTime: "6 hours",
    originalPrice: 7998,
    discountPercent: 70,
    finalPrice: 2399,
    testsList: [
      "All 90 Essential Parameters Included",
      "Vitamin D3 (25-Hydroxy)",
      "Vitamin B12 (Cobalamin)",
      "HbA1c (Glycated Hemoglobin - 3 Months Sugar)",
      "High Sensitivity CRP (hs-CRP Cardiac Risk)",
      "Serum Iron & Ferritin Profile",
      "Serum Calcium & Phosphorus",
      "Serum Uric Acid",
    ],
  },
  {
    id: "pkg-3",
    badgeType: "pulse",
    badgeText: "HEALTH CHECKUP",
    tagIcon: "shield",
    tagText: "Senior Care",
    title: "Senior Citizen Active Care Package",
    subtitle: "Tailored for joint health, diabetes, cardiac & renal monitoring.",
    parametersCount: 86,
    parametersLabel: "Parameters",
    reportsTime: "6 hours",
    originalPrice: 6498,
    discountPercent: 69,
    finalPrice: 1999,
    testsList: [
      "Complete Hemogram & ESR",
      "Cardiac Health & Lipid Marker",
      "Glycosylated Hemoglobin (HbA1c)",
      "Renal Function (Urea, Creatinine, Electrolytes)",
      "Liver Health & Enzymes",
      "Calcium & Alkaline Phosphatase",
      "Serum Uric Acid (Arthritis Screening)",
      "Urine Routine & Microalbumin",
    ],
  },
  {
    id: "pkg-4",
    badgeType: "pulse",
    badgeText: "HEALTH CHECKUP",
    tagIcon: "heart",
    tagText: "Recommended",
    title: "Women Complete Wellness Screening",
    subtitle: "Specialized checkup for hormones, thyroid, calcium & anemia.",
    parametersCount: 96,
    parametersLabel: "Parameters",
    reportsTime: "6 hours",
    originalPrice: 6898,
    discountPercent: 71,
    finalPrice: 1999,
    testsList: [
      "Complete Hemogram with Peripheral Smear",
      "Thyroid Profile (Total T3, Total T4, TSH)",
      "Iron Deficiency Anemia Profile (Ferritin, Iron, TIBC)",
      "Vitamin D3 & Calcium",
      "Liver & Kidney Wellness Panel",
      "Lipid & Cholesterol Balance",
      "Fasting Blood Sugar",
      "Urine Microscopic Analysis",
    ],
  },
];

export function PopularCheckupPackages() {
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [selectedDetail, setSelectedDetail] = useState<PackageCard | null>(null);

  const toggleAdd = (pkg: PackageCard) => {
    const isCurrentlyAdded = !!addedItems[pkg.id];
    setAddedItems((prev) => ({
      ...prev,
      [pkg.id]: !isCurrentlyAdded,
    }));

    if (!isCurrentlyAdded) {
      const text = encodeURIComponent(
        `Hello Medoraa Labs, I want to book "${pkg.title}" (Special Offer: ₹${pkg.finalPrice}). Please share available home collection slots.`
      );
      window.open(`https://wa.me/918074122114?text=${text}`, "_blank");
    }
  };

  const renderTagIcon = (type: PackageCard["tagIcon"]) => {
    switch (type) {
      case "star":
        return <Star className="w-3 h-3 text-[#015971] fill-current" />;
      case "sparkles":
        return <Sparkles className="w-3 h-3 text-[#015971]" />;
      case "shield":
        return <ShieldCheck className="w-3 h-3 text-[#015971]" />;
      case "heart":
        return <Heart className="w-3 h-3 text-[#015971] fill-current" />;
    }
  };

  return (
    <section className="relative w-full py-6 sm:py-8 bg-slate-50/70 dark:bg-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-5 sm:mb-6">
          <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-[#015971] dark:text-sky-400 uppercase mb-1">
            POPULAR PACKAGES
          </p>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[#0c2340] dark:text-white">
            Featured Health Checkup Packages
          </h2>
          <div className="w-6 h-0.5 bg-[#015971] dark:bg-sky-400 rounded-full mx-auto mt-1.5 mb-1.5" />
          <p className="text-slate-500 dark:text-slate-400 text-xs font-normal max-w-md mx-auto">
            Accredited diagnostic profiles with transparent pricing, certified digital reports, and free home sample collection.
          </p>
        </div>

        {/* 4 Cards Side by Side (Single Row on Desktop: grid-cols-4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 xl:gap-4.5">
          {SAMPLE_PACKAGES.map((pkg, index) => {
            const isAdded = !!addedItems[pkg.id];

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-zinc-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(1,89,113,0.09)] transition-all duration-300 flex flex-col justify-between h-full"
              >
                <div>
                  {/* Top Badges Row */}
                  <div className="flex items-center justify-between gap-1.5 mb-2.5">
                    {/* Health Checkup Pill with Pulse */}
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e8f7f9] dark:bg-sky-950/40 text-[#015971] dark:text-sky-300 text-[10px] font-bold tracking-wider">
                      <svg
                        className="w-3 h-3 text-[#015971] dark:text-sky-400 flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                      </svg>
                      <span className="truncate">{pkg.badgeText}</span>
                    </div>

                    {/* Tag Badge */}
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e8f7f9] dark:bg-sky-950/40 text-[#015971] dark:text-sky-300 text-[10px] font-semibold flex-shrink-0">
                      {renderTagIcon(pkg.tagIcon)}
                      <span>{pkg.tagText}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-bold text-[#0c2340] dark:text-white tracking-tight leading-snug min-h-[2.5rem] flex items-center">
                    {pkg.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed min-h-[2rem] line-clamp-2">
                    {pkg.subtitle}
                  </p>

                  {/* Parameters & Reports Within Row */}
                  <div className="flex items-center justify-between my-2.5 py-1.5 border-y border-slate-100 dark:border-zinc-800/80">
                    {/* Left: Includes Parameters */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-8 h-8 rounded-full bg-[#e8f7f9] dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                        <FlaskConical className="w-3.5 h-3.5 text-[#015971] dark:text-sky-400" />
                      </div>
                      <div className="leading-tight">
                        <span className="block text-[8.5px] font-semibold text-slate-400 uppercase tracking-wider">
                          INCLUDES
                        </span>
                        <span className="block text-xs font-bold text-[#0c2340] dark:text-white whitespace-nowrap">
                          {pkg.parametersCount} Params
                        </span>
                      </div>
                    </div>

                    {/* Vertical Divider */}
                    <div className="h-6 w-px bg-slate-200 dark:bg-zinc-700 mx-1.5" />

                    {/* Right: Reports Within */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-8 h-8 rounded-full bg-[#e8f7f9] dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-3.5 h-3.5 text-[#015971] dark:text-sky-400" />
                      </div>
                      <div className="leading-tight">
                        <span className="block text-[8.5px] font-semibold text-slate-400 uppercase tracking-wider">
                          REPORTS
                        </span>
                        <span className="block text-xs font-bold text-[#0c2340] dark:text-white whitespace-nowrap">
                          {pkg.reportsTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Pricing & CTA Button */}
                <div className="mt-2 rounded-xl bg-[#f0f8fa] dark:bg-zinc-800/60 p-2 sm:p-2.5 px-2.5 sm:px-3 flex items-center justify-between gap-1.5">
                  {/* Pricing Info */}
                  <div className="leading-tight">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 line-through text-[11px] font-bold">
                        ₹{pkg.originalPrice.toLocaleString()}
                      </span>
                      <span className="bg-[#d7f7ef] text-[#059669] text-[9px] font-bold px-1.5 py-0.2 rounded-full leading-tight">
                        {pkg.discountPercent}% Off
                      </span>
                    </div>
                    <span className="text-base sm:text-lg font-extrabold text-[#0c2340] dark:text-white block mt-0.5">
                      ₹{pkg.finalPrice.toLocaleString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setSelectedDetail(pkg)}
                      title="View package tests"
                      className="p-1 rounded-full text-slate-400 hover:text-[#015971] hover:bg-white dark:hover:bg-zinc-700 transition-colors"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => toggleAdd(pkg)}
                      className={`px-3 sm:px-3.5 py-1.5 rounded-full font-bold text-xs flex items-center gap-1 transition-all duration-200 active:scale-95 shadow-sm ${
                        isAdded
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                          : "bg-[#ff5e00] hover:bg-[#e65500] text-white shadow-orange-500/20"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3 h-3" strokeWidth={2.5} />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" strokeWidth={2.5} />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Package Detail Modal */}
      <AnimatePresence>
        {selectedDetail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDetail(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden z-10 p-5 my-auto"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-[#015971] uppercase">
                    Package Details
                  </span>
                  <h3 className="text-lg font-bold text-[#0c2340] dark:text-white">
                    {selectedDetail.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDetail(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-slate-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="py-3">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                  This package includes comprehensive diagnostic screening tests:
                </p>
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {selectedDetail.testsList.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/60 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#015971]" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs line-through text-slate-400 mr-1.5">
                    ₹{selectedDetail.originalPrice}
                  </span>
                  <span className="text-lg font-extrabold text-[#0c2340] dark:text-white">
                    ₹{selectedDetail.finalPrice}
                  </span>
                </div>
                <button
                  onClick={() => {
                    toggleAdd(selectedDetail);
                    setSelectedDetail(null);
                  }}
                  className="px-5 py-2 rounded-full bg-[#ff5e00] hover:bg-[#e65500] text-white font-bold text-xs flex items-center gap-1 shadow-md"
                >
                  <Phone className="w-3 h-3" />
                  <span>Book via WhatsApp</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default PopularCheckupPackages;
