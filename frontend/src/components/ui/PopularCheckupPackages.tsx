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
  Info,
  X,
  Phone,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

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
  const { isInCart, toggleItem, sendSingleTestWhatsApp } = useCart();
  const [selectedDetail, setSelectedDetail] = useState<PackageCard | null>(null);

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
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-1">
            Doctor-curated preventive health packages with free home sample collection and prompt digital reports.
          </p>
        </div>

        {/* 4 Cards Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {SAMPLE_PACKAGES.map((pkg, index) => {
            const isAdded = isInCart(pkg.id);

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className="group relative bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 border border-slate-200/80 dark:border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(1,89,113,0.1)] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges Row */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="inline-flex items-center gap-1 bg-[#015971]/10 text-[#015971] dark:text-cyan-300 text-[9px] font-extrabold px-2 py-0.5 rounded-full tracking-wider uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#015971] dark:bg-cyan-400 animate-pulse" />
                      {pkg.badgeText}
                    </span>

                    <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full">
                      {renderTagIcon(pkg.tagIcon)}
                      {pkg.tagText}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-sm sm:text-base font-bold text-[#0c2340] dark:text-white leading-snug group-hover:text-[#015971] dark:group-hover:text-cyan-400 transition-colors">
                    {pkg.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal line-clamp-2">
                    {pkg.subtitle}
                  </p>

                  {/* Middle Stats Card */}
                  <div className="mt-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 bg-[#f8fbfe] dark:bg-zinc-800/40 p-2">
                    <div className="grid grid-cols-2 divide-x divide-slate-200/70 dark:divide-zinc-700 text-center">
                      <div className="pr-1">
                        <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">
                          INCLUDES
                        </span>
                        <span className="block text-xs font-bold text-[#0c2340] dark:text-white">
                          {pkg.parametersCount} {pkg.parametersLabel}
                        </span>
                      </div>
                      <div className="pl-1">
                        <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">
                          REPORTS
                        </span>
                        <span className="block text-xs font-bold text-[#0c2340] dark:text-white whitespace-nowrap">
                          {pkg.reportsTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Trust Badge & Actions (NO PRICES SHOWN) */}
                <div className="mt-2.5 rounded-xl bg-[#f0f8fa] dark:bg-zinc-800/60 p-2 sm:p-2.5 px-2.5 sm:px-3 flex items-center justify-between gap-1.5">
                  <div className="leading-tight">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> NABL Certified
                    </span>
                    <span className="text-[11px] font-bold text-[#0c2340] dark:text-white block mt-0.5">
                      Home Pickup Available
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => setSelectedDetail(pkg)}
                      title="View package tests"
                      className="p-1.5 rounded-full text-slate-500 hover:text-[#015971] hover:bg-white dark:hover:bg-zinc-700 transition-colors"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() =>
                        toggleItem({
                          id: pkg.id,
                          name: pkg.title,
                          category: "Health Package",
                          reportTime: pkg.reportsTime,
                          sample: `${pkg.parametersCount} Parameters`,
                          type: "package",
                        })
                      }
                      className={`px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1 transition-all duration-200 active:scale-95 shadow-sm ${
                        isAdded
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                          : "bg-[#015971] hover:bg-[#01475a] text-white shadow-[#015971]/20"
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
                    Package Details ({selectedDetail.parametersCount} Parameters)
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
                  Comprehensive preventive screening includes:
                </p>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
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

              {/* Modal Footer with No Prices and WhatsApp / Add to Cart */}
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Free Doorstep Pickup</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      toggleItem({
                        id: selectedDetail.id,
                        name: selectedDetail.title,
                        category: "Health Package",
                        reportTime: selectedDetail.reportsTime,
                        sample: `${selectedDetail.parametersCount} Parameters`,
                        type: "package",
                      });
                      setSelectedDetail(null);
                    }}
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border border-[#015971] text-[#015971] hover:bg-[#015971] hover:text-white font-bold text-xs transition-all"
                  >
                    {isInCart(selectedDetail.id) ? "✓ Added" : "+ Add to Cart"}
                  </button>

                  <button
                    onClick={() => {
                      sendSingleTestWhatsApp(selectedDetail.title, "Health Package");
                      setSelectedDetail(null);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Ask for Collection</span>
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

export default PopularCheckupPackages;
