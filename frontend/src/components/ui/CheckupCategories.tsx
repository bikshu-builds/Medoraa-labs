"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Phone, X, Shield, Sparkles } from "lucide-react";

interface CheckupItem {
  name: string;
  parameters: string;
  originalPrice: number;
  offerPrice: number;
  highlight?: boolean;
}

interface CategoryData {
  id: string;
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
  iconType: "women" | "seniors" | "men" | "kids";
  packages: CheckupItem[];
}

const CATEGORIES: CategoryData[] = [
  {
    id: "women",
    title: "Women",
    subtitle: "Complete care\nfor her health",
    description:
      "Comprehensive screenings curated for hormonal balance, bone density, thyroid, and vital organs across every life stage.",
    image: "/images/women.png",
    archBg: "bg-[#fde2e8]",
    badgeBg: "bg-[#fef2f4]",
    badgeBorder: "border-[#fbcfe8]",
    badgeIconColor: "text-[#f43f5e]",
    buttonBg: "bg-[#fde2e8]",
    buttonHoverBg: "hover:bg-[#f43f5e] hover:text-white hover:shadow-rose-400/30",
    buttonColor: "text-[#f43f5e]",
    iconType: "women",
    packages: [
      {
        name: "Well-Woman Advanced Profile",
        parameters: "74 Tests (CBC, Thyroid, Iron, Calcium, Vitamins D & B12)",
        originalPrice: 2499,
        offerPrice: 1199,
        highlight: true,
      },
      {
        name: "PCOD / Hormonal Health Screen",
        parameters: "LH, FSH, Prolactin, Testosterone, Fasting Insulin & Glucose",
        originalPrice: 1999,
        offerPrice: 999,
      },
      {
        name: "Women Bone & Anemia Shield",
        parameters: "Serum Ferritin, Iron Profile, Calcium, Phosphorus & Vitamin D3",
        originalPrice: 1599,
        offerPrice: 799,
      },
      {
        name: "Pregnancy & Prenatal Care Panel",
        parameters: "Complete Hemogram, Blood Grouping, Urine Culture, Sugar, Rubella",
        originalPrice: 2199,
        offerPrice: 1099,
      },
    ],
  },
  {
    id: "seniors",
    title: "Seniors",
    subtitle: "Stay healthy\nin your golden years",
    description:
      "In-depth vital organ checks, heart care markers, diabetes management, and joint/bone health for elders.",
    image: "/images/senior.png",
    archBg: "bg-[#e0f2fe]",
    badgeBg: "bg-[#f0f9ff]",
    badgeBorder: "border-[#bae6fd]",
    badgeIconColor: "text-[#0284c7]",
    buttonBg: "bg-[#dff0fb]",
    buttonHoverBg: "hover:bg-[#0284c7] hover:text-white hover:shadow-sky-400/30",
    buttonColor: "text-[#0284c7]",
    iconType: "seniors",
    packages: [
      {
        name: "Senior Citizen Comprehensive Panel",
        parameters: "82 Tests (Cardiac Lipid, Kidney LFT, Liver KFT, HbA1c, Bone Health)",
        originalPrice: 2999,
        offerPrice: 1399,
        highlight: true,
      },
      {
        name: "Diabetes & Heart Shield Checkup",
        parameters: "HbA1c, Fasting Blood Sugar, Lipid Profile, Urine Microalbumin, ECG",
        originalPrice: 1899,
        offerPrice: 899,
      },
      {
        name: "Arthritis & Bone Density Profile",
        parameters: "Vitamin D3, Serum Calcium, Uric Acid, RA Factor, CRP Quantitative",
        originalPrice: 1799,
        offerPrice: 849,
      },
      {
        name: "Kidney & Electrolyte Vitality Check",
        parameters: "Creatinine, Blood Urea Nitrogen, Sodium, Potassium, Chloride, Urine R/M",
        originalPrice: 1399,
        offerPrice: 699,
      },
    ],
  },
  {
    id: "men",
    title: "Men",
    subtitle: "Stay strong\nstay active",
    description:
      "Targeted diagnostics for cardiovascular fitness, liver health, energy levels, and lifestyle-related risks.",
    image: "/images/men.png",
    archBg: "bg-[#ede9fe]",
    badgeBg: "bg-[#f5f3ff]",
    badgeBorder: "border-[#ddd6fe]",
    badgeIconColor: "text-[#7c3aed]",
    buttonBg: "bg-[#ede9fe]",
    buttonHoverBg: "hover:bg-[#7c3aed] hover:text-white hover:shadow-violet-400/30",
    buttonColor: "text-[#7c3aed]",
    iconType: "men",
    packages: [
      {
        name: "Executive Men Health Profile",
        parameters: "76 Tests (Lipid Risk, Liver Profile, Kidney Screen, HbA1c, Vitamins)",
        originalPrice: 2699,
        offerPrice: 1299,
        highlight: true,
      },
      {
        name: "Cardiac Health & Lipid Marker",
        parameters: "Complete Lipid Profile, hs-CRP, Apolipoprotein, Sugar Fasting",
        originalPrice: 1899,
        offerPrice: 899,
      },
      {
        name: "Liver & Kidney Detox Screening",
        parameters: "SGOT, SGPT, Bilirubin, Albumin, Urea, Creatinine, Electrolytes",
        originalPrice: 1499,
        offerPrice: 749,
      },
      {
        name: "Men Vitality & Testosterone Panel",
        parameters: "Total Testosterone, Vitamin D, Vitamin B12, Thyroid (TSH), Zinc",
        originalPrice: 2299,
        offerPrice: 1149,
      },
    ],
  },
  {
    id: "kids",
    title: "Kids",
    subtitle: "Healthy kids\nhappier tomorrows",
    description:
      "Gentle, child-friendly checkups monitoring growth milestones, immunity, nutrition, and anemia.",
    image: "/images/kids.png",
    archBg: "bg-[#fef2dc]",
    badgeBg: "bg-[#fffbeb]",
    badgeBorder: "border-[#fde68a]",
    badgeIconColor: "text-[#d97706]",
    buttonBg: "bg-[#fef2dc]",
    buttonHoverBg: "hover:bg-[#d97706] hover:text-white hover:shadow-amber-400/30",
    buttonColor: "text-[#d97706]",
    iconType: "kids",
    packages: [
      {
        name: "Pediatric Growth & Immunity Panel",
        parameters: "45 Tests (Complete Hemogram, Blood Grouping, Vitamin D, Calcium, Iron)",
        originalPrice: 1999,
        offerPrice: 899,
        highlight: true,
      },
      {
        name: "Childhood Anemia & Nutrition Check",
        parameters: "CBC with ESR, Serum Iron, Ferritin, TIBC, Protein Total",
        originalPrice: 1499,
        offerPrice: 699,
      },
      {
        name: "Allergy & Infection Screening",
        parameters: "Absolute Eosinophil Count, Total IgE, CRP, Urine Routine Examination",
        originalPrice: 1799,
        offerPrice: 849,
      },
      {
        name: "School Health & Vital Check",
        parameters: "Routine Urine, Blood Sugar Random, Blood Group, Peripheral Smear",
        originalPrice: 999,
        offerPrice: 499,
      },
    ],
  },
];

function CategoryIcon({ type }: { type: CategoryData["iconType"] }) {
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
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);

  const handleBookNow = (categoryName: string, packageName: string, price: number) => {
    const text = encodeURIComponent(
      `Hello Medoraa Labs, I want to book the ${categoryName} Checkup: "${packageName}" (₹${price}). Please share appointment availability and home collection slot.`
    );
    window.open(`https://wa.me/918074122114?text=${text}`, "_blank");
  };

  return (
    <section className="relative w-full py-5 sm:py-6 lg:py-8 overflow-hidden bg-gradient-to-b from-[#eef7fd] via-[#f7fbfe] to-[#ffffff] dark:from-zinc-950 dark:via-zinc-900 dark:to-black">
      {/* ── BACKGROUND MEDICAL DECORATIONS ── */}
      {/* Top Left Medical Cross (+) */}
      <div className="absolute top-3 left-3 sm:left-6 pointer-events-none opacity-50 text-[#c2e2f6] dark:text-sky-950/40 select-none">
        <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
          <rect x="36" y="8" width="28" height="84" rx="14" fill="currentColor" />
          <rect x="8" y="36" width="84" height="28" rx="14" fill="currentColor" />
        </svg>
      </div>

      {/* Floating Soft Blue Circles (Top Left) */}
      <div className="absolute top-16 left-3 w-2 h-2 rounded-full bg-[#badef7]/70 pointer-events-none" />
      <div className="absolute top-10 left-28 sm:left-36 w-3 h-3 rounded-full bg-[#cce8fb]/60 pointer-events-none" />

      {/* Floating Soft Blue Circles (Bottom Left) */}
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

      {/* Bottom Right Medical Cross (+) */}
      <div className="absolute -bottom-3 right-4 sm:right-10 pointer-events-none opacity-30 text-[#c2e2f6] dark:text-sky-950/40 select-none">
        <svg width="48" height="48" viewBox="0 0 100 100" fill="none">
          <rect x="36" y="8" width="28" height="84" rx="14" fill="currentColor" />
          <rect x="8" y="36" width="84" height="28" rx="14" fill="currentColor" />
        </svg>
      </div>

      {/* Bottom Soft Wave */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none leading-none opacity-20 dark:opacity-10 select-none">
        <svg
          className="w-full h-8 text-[#cae6f8] dark:text-zinc-900"
          viewBox="0 0 1440 120"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0,45 C320,105 520,15 840,65 C1160,115 1320,35 1440,60 L1440,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* ── HEADER CONTENT ── */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center mb-4 sm:mb-5">
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="text-[10px] font-semibold tracking-[0.2em] text-[#556987] dark:text-sky-400 uppercase mb-0.5"
        >
          HEALTH CHECKUP
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[#0f2942] dark:text-white"
        >
          Checkup <span className="text-[#0284c7] dark:text-sky-400">Categories</span>
        </motion.h2>

        {/* Small cyan/blue rounded bar below title */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="w-7 h-0.5 bg-[#0284c7] dark:bg-sky-400 rounded-full mx-auto mt-1.5 mb-1.5"
        />

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="text-[#64748b] dark:text-slate-300 text-xs sm:text-xs font-normal max-w-xs sm:max-w-sm mx-auto"
        >
          Select a category to view recommended health checkups
        </motion.p>
      </div>

      {/* ── 4 CATEGORY CARDS ── */}
      <div className="relative z-10 max-w-3xl lg:max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
          {CATEGORIES.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedCategory(cat)}
              className="group cursor-pointer bg-white dark:bg-zinc-900 rounded-[28px] sm:rounded-[34px] p-2 sm:p-2.5 pb-3 sm:pb-3.5 shadow-[0_8px_24px_rgba(2,132,199,0.06),0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-[0_14px_35px_rgba(2,132,199,0.14)] dark:shadow-none dark:border dark:border-zinc-800 flex flex-col items-center justify-between transition-all duration-300 relative border border-blue-50/80"
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
                <CategoryIcon type={cat.iconType} />
              </div>

              {/* Category Title */}
              <h3 className="text-sm sm:text-base font-bold text-[#0f2942] dark:text-white mt-1 sm:mt-1.5 text-center tracking-tight">
                {cat.title}
              </h3>

              {/* Category Subtitle */}
              <p className="text-[10px] sm:text-[11px] text-[#64748b] dark:text-slate-400 text-center mt-0.5 leading-tight whitespace-pre-line font-medium min-h-[1.75rem] flex items-center justify-center">
                {cat.subtitle}
              </p>

              {/* Bottom Action Arrow Button */}
              <div
                className={`mt-2 sm:mt-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm ${cat.buttonBg} ${cat.buttonColor} ${cat.buttonHoverBg}`}
              >
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.4} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── RECOMMENDED HEALTH CHECKUPS MODAL ── */}
      <AnimatePresence>
        {selectedCategory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCategory(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden z-10 my-auto"
            >
              {/* Header Banner */}
              <div
                className={`relative p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 ${selectedCategory.archBg}/40`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-zinc-800 shadow-md border ${selectedCategory.badgeBorder}`}
                  >
                    <CategoryIcon type={selectedCategory.iconType} />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-[#556987] dark:text-slate-400">
                      Recommended Packages
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-[#0f2942] dark:text-white">
                      {selectedCategory.title} Health Checkups
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCategory(null)}
                  className="w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-500 transition-colors shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body: Packages List */}
              <div className="p-4 sm:p-5 max-h-[50vh] overflow-y-auto space-y-2.5">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  {selectedCategory.description}
                </p>

                {selectedCategory.packages.map((pkg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                      pkg.highlight
                        ? "bg-sky-50/70 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800 shadow-sm"
                        : "bg-slate-50/70 dark:bg-zinc-800/50 border-slate-200/70 dark:border-zinc-700/60 hover:border-slate-300"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        {pkg.highlight && (
                          <span className="inline-flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-wider bg-[#0284c7] text-white px-1.5 py-0.5 rounded-full">
                            <Sparkles className="w-2 h-2" /> Popular
                          </span>
                        )}
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {pkg.name}
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 flex-shrink-0" />
                        {pkg.parameters}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2.5 flex-shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-zinc-700">
                      <div className="text-right">
                        <span className="text-[9px] line-through text-slate-400 block">
                          ₹{pkg.originalPrice}
                        </span>
                        <span className="text-sm font-extrabold text-[#015971] dark:text-sky-400 block leading-none">
                          ₹{pkg.offerPrice}
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          handleBookNow(selectedCategory.title, pkg.name, pkg.offerPrice)
                        }
                        className="px-2.5 py-1 bg-[#015971] hover:bg-[#0284c7] text-white text-[11px] font-semibold rounded-lg flex items-center gap-1 shadow-sm transition-all active:scale-95"
                      >
                        <Phone className="w-3 h-3" /> Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/80 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[10px] text-slate-500">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  <span>Free Home Collection & Reports in 6 Hours</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    const el = document.getElementById("services");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="font-semibold text-[#0284c7] hover:underline"
                >
                  View All Lab Tests &rarr;
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default CheckupCategories;
