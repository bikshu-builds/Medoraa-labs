"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  HeartPulse,
  Activity,
  CalendarCheck,
  Target,
  Users,
  ShieldCheck,
  Timer,
  TestTubes,
  ClipboardCheck,
  Stethoscope,
  Sparkles,
  ArrowUpRight,
  TestTube,
} from "lucide-react";

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  accentGlow: string;
}

const featureCards: FeatureCard[] = [
  {
    title: "Quick & Reliable Reports",
    description: "Get your test results on time, every time.",
    icon: <Timer className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600" />,
    iconBg: "bg-gradient-to-br from-cyan-50 to-teal-100/70 border-cyan-200/70 text-cyan-600",
    accentGlow: "from-cyan-500/10 via-teal-500/5 to-transparent",
  },
  {
    title: "Home Sample Collection",
    description: "Safe, convenient and hygienic sample pickup at your doorstep.",
    icon: (
      <svg
        className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5z" />
        <path d="M12 11v6" />
        <path d="M9 14h6" />
      </svg>
    ),
    iconBg: "bg-gradient-to-br from-amber-50 to-orange-100/70 border-amber-200/70 text-amber-600",
    accentGlow: "from-amber-500/10 via-orange-500/5 to-transparent",
  },
  {
    title: "Comprehensive Test Range",
    description: "From routine checkups to advanced health packages — all in one place.",
    icon: <TestTubes className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />,
    iconBg: "bg-gradient-to-br from-purple-50 to-indigo-100/70 border-indigo-200/70 text-indigo-600",
    accentGlow: "from-indigo-500/10 via-purple-500/5 to-transparent",
  },
  {
    title: "Preventive Health Packages",
    description: "Curated checkup plans for every age and lifestyle.",
    icon: <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500" />,
    iconBg: "bg-gradient-to-br from-rose-50 to-pink-100/70 border-rose-200/70 text-rose-500",
    accentGlow: "from-rose-500/10 via-pink-500/5 to-transparent",
  },
  {
  title: "Laboratory Testing",
  description: "Get accurate diagnostic tests with reliable results and professional laboratory care.",
  icon: <TestTube className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />,
  iconBg: "bg-gradient-to-br from-teal-50 to-cyan-100/70 border-teal-200/70 text-teal-600",
  accentGlow: "from-teal-500/10 via-cyan-500/5 to-transparent",
},
  {
    title: "Trusted & Secure",
    description: "Your health data is kept private, safe and fully confidential.",
    icon: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />,
    iconBg: "bg-gradient-to-br from-emerald-50 to-teal-100/70 border-emerald-200/70 text-emerald-600",
    accentGlow: "from-emerald-500/10 via-teal-500/5 to-transparent",
  },
];

const highlights = [
  {
    icon: <CalendarCheck className="w-3.5 h-3.5 text-[#015971]" />,
    label: "Same-Day Reports",
  },
  {
    icon: <Target className="w-3.5 h-3.5 text-teal-600" />,
    label: "High Accuracy",
  },
  {
    icon: <Users className="w-3.5 h-3.5 text-cyan-700" />,
    label: "Patient-First Care",
  },
  {
    icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />,
    label: "Trusted & Confidential",
  },
];

export default function RuixenBentoCards() {
  return (
    <section className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 bg-gradient-to-b from-[#F2F9FB] via-white to-[#F8FAFC] overflow-hidden">
      {/* Soft luminous ambient glows */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-cyan-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-24 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-blue-100/35 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Upper Tier: Headline, Highlights & Hero Scientist Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center mb-8 sm:mb-10">
          {/* Left Column: Heading, Subtitle & 4 Key Highlights */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50/90 border border-cyan-200/80 shadow-xs w-fit mb-3.5">
              <span className="w-4 h-4 rounded-full bg-[#015971] flex items-center justify-center text-white shrink-0">
                <HeartPulse className="w-2.5 h-2.5 text-cyan-200" />
              </span>
              <span className="text-[11px] font-bold text-[#015971] tracking-wide uppercase">
                Why Choose Us
              </span>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-slate-900 tracking-tight leading-[1.14]">
              Next-Gen Diagnostics. <br />
              <span className="bg-gradient-to-r from-[#015971] via-teal-700 to-cyan-600 bg-clip-text text-transparent relative inline-block">
                Personalized Care.
                <svg
                  className="absolute -bottom-1.5 left-0 w-full h-2.5 text-cyan-400"
                  viewBox="0 0 220 12"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 7C50 14 160 14 218 4"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>

            {/* Subtitle / Paragraph */}
            <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed max-w-xl mt-3.5 mb-5">
              Blending advanced medical technology with a patient-first approach for faster, more accurate and reliable health insights.
            </p>

            {/* 4 Compact Pill Highlights */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 border border-slate-200/70 shadow-xs hover:border-cyan-300 hover:bg-cyan-50/30 transition-all text-xs font-bold text-slate-700"
                >
                  <div className="w-5 h-5 rounded-md bg-teal-50 border border-teal-200/60 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <span className="leading-none">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Hero Diagnostic Lab Image in Curved Organic Frame */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Floating pulse wave icon at top-left corner */}
              <div className="absolute -top-2.5 -left-2.5 z-20 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-cyan-200/80 text-[#015971]">
                <Activity className="w-4 h-4 text-cyan-600 animate-pulse" />
              </div>

              {/* Organic curved frame with gradient border and ambient glow */}
              <div className="relative p-1 sm:p-1.5 rounded-[2.2rem] sm:rounded-[3rem] bg-gradient-to-tr from-cyan-400 via-teal-300 to-sky-200 shadow-[0_16px_40px_-10px_rgba(1,89,113,0.22)]">
                <div className="relative w-full aspect-[16/10] sm:aspect-[16/10] rounded-[2rem] sm:rounded-[2.8rem] overflow-hidden bg-slate-100">
                  <Image
                    src="/images/lab test.png"
                    alt="Next-Gen Diagnostics & Advanced Medical Technology"
                    fill
                    sizes="(max-width: 768px) 100vw, 42vw"
                    className="object-cover object-center"
                    priority
                  />
                  {/* Subtle top-corner gradient overlay matching the teal theme */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/15 via-transparent to-white/10 pointer-events-none" />

                  {/* Floating Live Badge inside image */}
                  <div className="absolute bottom-3 left-3 z-10 hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-white/60 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-3.5" />
                    <span className="text-[10px] font-extrabold text-slate-800 tracking-tight">
                      99.8% Precision Rate
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Lower Tier: 6 Feature Cards in 3x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {featureCards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.04 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="group relative bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-100/90 shadow-[0_3px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(1,89,113,0.1)] hover:border-cyan-300/80 transition-all duration-300 overflow-hidden"
            >
              {/* Subtle hover gradient wash inside card */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
                  card.accentGlow
                )}
              />

              <div className="relative z-10 flex items-start gap-3.5">
                <div
                  className={cn(
                    "w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-300 group-hover:scale-105",
                    card.iconBg
                  )}
                >
                  {card.icon}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-sm sm:text-[14.5px] font-extrabold text-slate-900 group-hover:text-[#015971] transition-colors leading-snug truncate">
                      {card.title}
                    </h3>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#015971] opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1 group-hover:translate-x-0 shrink-0" />
                  </div>
                  <p className="text-[11.5px] sm:text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    {card.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
