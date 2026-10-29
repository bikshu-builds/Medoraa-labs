"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Phone, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BodySystem {
  id: string;
  name: string;
  image: string;
  description: string;
  popularTests: { name: string; price: number; time: string }[];
}

const BODY_SYSTEMS: BodySystem[] = [
  {
    id: "blood",
    name: "Blood",
    image: "/images/organs/Blood.png",
    description: "Evaluates red and white blood cells, platelets, hemoglobin, and cellular health to diagnose anemia and infections.",
    popularTests: [
      { name: "Complete Blood Count (CBC - 24 parameters)", price: 350, time: "4 hours" },
      { name: "Erythrocyte Sedimentation Rate (ESR)", price: 150, time: "3 hours" },
      { name: "Peripheral Smear for Malarial Parasite", price: 200, time: "4 hours" },
      { name: "Blood Grouping & Rh Factor", price: 150, time: "2 hours" },
    ],
  },
  {
    id: "heart",
    name: "Heart",
    image: "/images/organs/Heart.png",
    description: "Assesses cardiovascular health, lipid balance, and markers for heart attack risk.",
    popularTests: [
      { name: "Complete Lipid Profile (Cholesterol & Triglycerides)", price: 650, time: "6 hours" },
      { name: "High Sensitivity CRP (hs-CRP Cardiac Risk)", price: 750, time: "6 hours" },
      { name: "Cardiac Troponin I", price: 1200, time: "4 hours" },
      { name: "Serum Apolipoprotein A1 & B", price: 950, time: "8 hours" },
    ],
  },
  {
    id: "kidney",
    name: "Kidney",
    image: "/images/organs/Kidney.png",
    description: "Measures filtration capacity, urea, creatinine, and electrolytes to ensure optimal renal function.",
    popularTests: [
      { name: "Kidney Function Test (KFT / RFT)", price: 700, time: "6 hours" },
      { name: "Serum Creatinine", price: 200, time: "3 hours" },
      { name: "Blood Urea Nitrogen (BUN)", price: 200, time: "3 hours" },
      { name: "Urine Routine & Microscopic Examination", price: 180, time: "3 hours" },
    ],
  },
  {
    id: "liver",
    name: "Liver",
    image: "/images/organs/Liver.png",
    description: "Monitors essential enzymes, bilirubin levels, and liver metabolism to identify liver stress or disease.",
    popularTests: [
      { name: "Liver Function Test (LFT - 12 parameters)", price: 650, time: "6 hours" },
      { name: "SGOT (AST) & SGPT (ALT)", price: 300, time: "3 hours" },
      { name: "Serum Bilirubin (Total, Direct & Indirect)", price: 250, time: "3 hours" },
      { name: "Serum Albumin & Globulin (A/G Ratio)", price: 250, time: "4 hours" },
    ],
  },
  {
    id: "thyroid",
    name: "Thyroid",
    image: "/images/organs/Thyroid.png",
    description: "Screens for hypothyroidism or hyperthyroidism by measuring TSH, Total/Free T3, and T4.",
    popularTests: [
      { name: "Thyroid Profile Total (T3, T4, TSH)", price: 450, time: "4 hours" },
      { name: "Ultra-sensitive TSH", price: 250, time: "4 hours" },
      { name: "Free T3 & Free T4 Panel", price: 750, time: "6 hours" },
      { name: "Anti-TPO (Thyroid Peroxidase Antibody)", price: 1100, time: "8 hours" },
    ],
  },
  {
    id: "hormonal",
    name: "Hormonal",
    image: "/images/organs/Hormonal.png",
    description: "Evaluates reproductive hormones, stress hormones, testosterone, and insulin balance.",
    popularTests: [
      { name: "PCOD Hormonal Profile (LH, FSH, Prolactin)", price: 1200, time: "8 hours" },
      { name: "Total Testosterone (Male & Female)", price: 650, time: "6 hours" },
      { name: "Serum Prolactin", price: 450, time: "5 hours" },
      { name: "Fasting Serum Insulin", price: 650, time: "6 hours" },
    ],
  },
  {
    id: "nutrition",
    name: "Nutrition",
    image: "/images/organs/Nutrition.png",
    description: "Screens for vital micronutrients, vitamins, and minerals that drive daily energy and immunity.",
    popularTests: [
      { name: "Vitamin D3 (25-Hydroxy)", price: 850, time: "6 hours" },
      { name: "Vitamin B12 (Cobalamin)", price: 750, time: "6 hours" },
      { name: "Serum Calcium & Phosphorus", price: 300, time: "4 hours" },
      { name: "Iron Deficiency Profile (Iron, Ferritin, TIBC)", price: 750, time: "6 hours" },
    ],
  },
  {
    id: "bone",
    name: "Bone",
    image: "/images/organs/Bone.png",
    description: "Monitors bone mineral density, joint health, uric acid, and inflammation markers for arthritis.",
    popularTests: [
      { name: "Serum Calcium Total", price: 180, time: "3 hours" },
      { name: "Serum Uric Acid (Gout Screening)", price: 200, time: "3 hours" },
      { name: "Alkaline Phosphatase (ALP)", price: 200, time: "3 hours" },
      { name: "Rheumatoid Factor (RA Factor)", price: 450, time: "6 hours" },
    ],
  },
  {
    id: "immunity",
    name: "Immunity",
    image: "/images/organs/Immunity.png",
    description: "Tests antibodies, infection markers, and allergy indicators that safeguard your immune system.",
    popularTests: [
      { name: "Total Serum IgE (Allergy Marker)", price: 650, time: "6 hours" },
      { name: "C-Reactive Protein (CRP Quantitative)", price: 400, time: "4 hours" },
      { name: "Absolute Eosinophil Count (AEC)", price: 150, time: "3 hours" },
      { name: "Widal Test (Typhoid Screen)", price: 250, time: "3 hours" },
    ],
  },
  {
    id: "aerobic",
    name: "Aerobic",
    image: "/images/organs/Lungs.png",
    description: "Focuses on respiratory wellness, lung ventilation, oxygenation capacity, and pulmonary biomarkers.",
    popularTests: [
      { name: "Chest & Pulmonary Allergy Panel", price: 950, time: "8 hours" },
      { name: "Serum Immunoglobulin E (IgE)", price: 650, time: "6 hours" },
      { name: "D-Dimer (Thrombosis & Pulmonary Check)", price: 1100, time: "4 hours" },
      { name: "Routine Sputum Examination", price: 300, time: "6 hours" },
    ],
  },
  {
    id: "digestive",
    name: "Digestive",
    image: "/images/organs/Digestive.png",
    description: "Assesses gut health, digestive enzymes, gastric absorption, and bowel function.",
    popularTests: [
      { name: "Serum Amylase & Lipase", price: 750, time: "5 hours" },
      { name: "Stool Routine & Microscopic", price: 200, time: "3 hours" },
      { name: "Stool Occult Blood (FOBT)", price: 300, time: "4 hours" },
      { name: "H. Pylori Antigen Detection", price: 850, time: "6 hours" },
    ],
  },
  {
    id: "dna",
    name: "Genetics",
    image: "/images/organs/DNA.png",
    description: "Advanced molecular and genetic screenings identifying inherited predisposition to vital conditions.",
    popularTests: [
      { name: "Hereditary Cancer Risk Panel", price: 4500, time: "48 hours" },
      { name: "Karyotyping Chromosomal Analysis", price: 2800, time: "72 hours" },
      { name: "Thalassemia Screening Profile", price: 1200, time: "24 hours" },
      { name: "DNA Molecular Mutation Screen", price: 3500, time: "48 hours" },
    ],
  },
];

export function VitalBodySystems() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [selectedSystem, setSelectedSystem] = useState<BodySystem | null>(null);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 15);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const offset = direction === "left" ? -320 : 320;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  const handleBookTest = (systemName: string, testName: string, price: number) => {
    const text = encodeURIComponent(
      `Hello Medoraa Labs, I want to book "${testName}" (₹${price}) under ${systemName} system. Please share appointment details and home collection availability.`
    );
    window.open(`https://wa.me/918074122114?text=${text}`, "_blank");
  };

  return (
    <section className="relative w-full py-8 sm:py-10 bg-white dark:bg-black overflow-hidden border-t border-slate-100 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-5 sm:mb-6">
          <p className="text-xs sm:text-xs font-bold tracking-[0.18em] text-slate-400 dark:text-slate-500 uppercase mb-1">
            FOR YOUR
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0f172a] dark:text-white tracking-tight">
            Vital Body Systems
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Scroll Left Button */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-8 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-700/85 hover:bg-neutral-800 text-white flex items-center justify-center shadow-lg backdrop-blur-sm transition-all duration-200 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
            </button>
          )}

          {/* Scroll Right Button (Matches screenshot) */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-8 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-700/85 hover:bg-neutral-800 text-white flex items-center justify-center shadow-lg backdrop-blur-sm transition-all duration-200 active:scale-95"
            >
              <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
            </button>
          )}

          {/* Horizontal Scrollable Row */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex items-start gap-4 sm:gap-6 lg:gap-7 overflow-x-auto scroll-smooth py-3 px-1 no-scrollbar"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {BODY_SYSTEMS.map((system) => (
              <div
                key={system.id}
                onClick={() => setSelectedSystem(system)}
                className="flex flex-col items-center flex-shrink-0 cursor-pointer group text-center select-none"
              >
                {/* Organ Circle Container - Image's circular border is the final border */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 rounded-full flex items-center justify-center group-hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  <Image
                    src={system.image}
                    alt={system.name}
                    fill
                    sizes="(max-width: 640px) 80px, 104px"
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Organ Label */}
                <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mt-2 sm:mt-2.5 group-hover:text-[#015971] dark:group-hover:text-cyan-400 group-hover:font-semibold transition-colors">
                  {system.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail / Test Booking Modal */}
      <AnimatePresence>
        {selectedSystem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSystem(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden z-10 p-5 sm:p-6 my-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden relative flex-shrink-0">
                    <Image
                      src={selectedSystem.image}
                      alt={selectedSystem.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#015971] dark:text-sky-400">
                      Organ Diagnostics
                    </span>
                    <h3 className="text-xl font-bold text-[#0c2340] dark:text-white">
                      {selectedSystem.name} System Tests
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedSystem(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-slate-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 dark:text-slate-400 py-3 leading-relaxed">
                {selectedSystem.description}
              </p>

              {/* Test List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedSystem.popularTests.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {t.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Report in {t.time}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-extrabold text-[#015971] dark:text-sky-400">
                        ₹{t.price}
                      </span>
                      <button
                        onClick={() => handleBookTest(selectedSystem.name, t.name, t.price)}
                        className="px-3 py-1.5 rounded-lg bg-[#015971] hover:bg-[#0284c7] text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all active:scale-95"
                      >
                        <Phone className="w-3 h-3" /> Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="pt-3.5 mt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500">
                <span>Free Home Sample Collection in Vijayawada</span>
                <button
                  onClick={() => {
                    setSelectedSystem(null);
                    const el = document.getElementById("services");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="font-semibold text-[#015971] dark:text-sky-400 hover:underline flex items-center gap-1"
                >
                  All Services <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default VitalBodySystems;
