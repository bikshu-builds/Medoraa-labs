"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValueEvent } from "framer-motion";
import React, { useRef, useState } from "react";
import { ShieldCheck, Activity, Droplets, FlaskConical, Microscope, Sun, X, Sparkles } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { ScrollNavigationMenu } from "@/components/scroll-navigation-menu";
import { TestimonialsColumn } from "@/components/testimonials-columns-1";
import RuixenBentoCards from "@/components/ui/ruixen-bento-cards";
import { ElasticGallery } from "@/components/ui/elastic-gallery";
import { CheckupCategories } from "@/components/ui/checkup-categories";
import { PopularCheckupPackages } from "@/components/ui/popular-checkup-packages";
import { VitalBodySystems } from "@/components/ui/vital-body-systems";
import Footer from "@/components/footer";

const RecentActivityNotification = () => {
  const activities = [
    { name: "Raju", action: "booked a CBC Test", time: "2 mins ago" },
    { name: "Sita", action: "got her reports online", time: "5 mins ago" },
    { name: "Amit", action: "scheduled a Home Collection", time: "12 mins ago" },
    { name: "Priya", action: "booked a Full Body Checkup", time: "1 min ago" },
    { name: "Vikram", action: "consulted a doctor online", time: "8 mins ago" },
    { name: "Kiran", action: "booked a Thyroid Test", time: "3 mins ago" },
{ name: "Anjali", action: "downloaded her lab reports", time: "6 mins ago" },
{ name: "Rahul", action: "booked a Vitamin D Test", time: "9 mins ago" },
{ name: "Sneha", action: "scheduled a Blood Test", time: "4 mins ago" },
{ name: "Arjun", action: "booked a Health Checkup Package", time: "11 mins ago" },
  ];

  const [index, setIndex] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 3000);
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % activities.length);
        setIsVisible(true);
      }, 500);
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.9 }}
          className="fixed bottom-4 left-4 right-4 sm:right-auto sm:bottom-6 sm:left-6 z-[9999] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-2xl flex items-center gap-3 sm:gap-4 max-w-full sm:max-w-sm"
        >
          <div className="w-12 h-12 rounded-full bg-[#015971] flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {activities[index].name}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {activities[index].action}
            </p>
            <span className="text-[10px] text-gray-400 mt-1">{activities[index].time}</span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface FloatingBadgeProps {
  avatar: string;
  name: string;
  role: string;
  className?: string;
  delay?: number;
}

const FloatingBadge = ({ avatar, name, role, className, delay = 0 }: FloatingBadgeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: delay,
        ease: [0.23, 1, 0.32, 1],
      }}
      className={`absolute z-20 flex items-center gap-3 p-2 pr-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-white/20 dark:border-neutral-800/50 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] ${className}`}
    >
      <div className="relative">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-neutral-800 shadow-sm">
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        </div>
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-neutral-900 rounded-full"></div>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-[#015971] dark:text-cyan-400 leading-tight">
          {name}
        </span>
        <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 leading-tight">
          {role}
        </span>
      </div>
    </motion.div>
  );
};



// ── TESTIMONIALS DATA ──
const testimonials = [
  {
    text: "I got my blood test results within hours! The online report access made it so convenient. Highly recommend this lab for their speed and accuracy.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    name: "Briana Patton",
    role: "Verified Patient",
  },
  {
    text: "Booking my tests online was super easy, and the home sample collection service saved me so much time. Reports were accurate and delivered right on time.",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    name: "Bilal Ahmed",
    role: "Verified Patient",
  },
  {
    text: "The staff was incredibly polite and professional. My reports came with a detailed breakdown that my doctor truly appreciated. Will always use this lab!",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    name: "Saman Malik",
    role: "Verified Patient",
  },
  {
    text: "I was nervous about my MRI scan, but the technicians were so reassuring and gentle. The facility was spotless and the results were crystal clear.",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "Omar Raza",
    role: "Verified Patient",
  },
  {
    text: "Affordable pricing with no compromise on quality. My full body checkup package was thorough and the doctor consultation included was a great bonus!",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    name: "Zainab Hussain",
    role: "Verified Patient",
  },
  {
    text: "The phlebotomist was gentle and skilled — I barely felt the blood draw! Reports were available on the app within 4 hours. Absolutely flawless experience.",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "Aliza Khan",
    role: "Verified Patient",
  },
  {
    text: "I use this lab for all my family's health checkups. The WhatsApp report delivery and friendly reminders for follow-up tests are features I truly love.",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "Farhan Siddiqui",
    role: "Verified Patient",
  },
  {
    text: "Visited for a thyroid panel and was impressed by how organized everything was. Zero wait time, clean environment, and my results matched my specialist's expectations perfectly.",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "Sana Sheikh",
    role: "Verified Patient",
  },
  {
    text: "The home collection team arrived right on schedule and were extremely professional. Getting my diabetes test done from home was a game changer for me.",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    name: "Hassan Ali",
    role: "Verified Patient",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export default function Home() {
  const sharedIconUrl = "https://i.pinimg.com/736x/d0/6a/13/d06a13ce1f4da8d86989657faabf6276.jpg";

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchSticky, setIsSearchSticky] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      if (!searchContainerRef.current) return;
      const rect = searchContainerRef.current.getBoundingClientRect();
      setIsSearchSticky(rect.top <= 16);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Ref for scroll-linked timeline
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"],
  });

  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <>
      <ScrollNavigationMenu />

      

      <AuroraBackground className="justify-start min-h-0 pt-20 sm:pt-24 pb-8">
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-0">
          {/* ── 2-COLUMN HERO: TEXT & SEARCH ON LEFT, CIRCULAR BANNER IMAGE ON RIGHT ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading, Subtext, Search, Popular Searches */}
            <motion.div
              initial={{ opacity: 0.0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.15,
                duration: 0.6,
                ease: "easeInOut",
              }}
              className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left"
            >
              {/* Accredited Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#015971]/10 border border-[#015971]/20 text-[#015971] dark:text-cyan-300 dark:bg-[#015971]/20 dark:border-[#015971]/40 text-sm font-semibold mb-5"
              >
                <span className="w-2 h-2 rounded-full bg-[#015971] dark:bg-cyan-400 inline-block animate-pulse" />
                Your Accredited Diagnostic Lab
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 dark:text-white leading-[1.1] tracking-tight mb-4"
              >
                Your Health,{" "}
                <span className="block text-[#015971] dark:text-[#22d3ee]">Our Priority</span>
              </motion.h1>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.6 }}
                className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-xl mb-6 leading-relaxed"
              >
                Accurate lab tests, trusted reports and home sample collection
                <br className="hidden sm:block" /> — for you and your family.
              </motion.p>

              {/* Search Bar with seamless scroll-to-sticky animation */}
              <div
                ref={searchContainerRef}
                className="w-full max-w-xl mb-5 min-h-[58px]"
              >
                <div
                  className={cn(
                    "w-full transition-all duration-300 ease-out",
                    isSearchSticky
                      ? "fixed top-4 left-0 right-0 z-40 mx-auto max-w-[calc(100%-80px)] sm:max-w-2xl px-4 pointer-events-auto"
                      : "relative max-w-xl"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center gap-0 rounded-2xl transition-all duration-300",
                      isSearchSticky
                        ? "bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-neutral-200/90 dark:border-zinc-700/80 shadow-xl shadow-[#015971]/10 px-3 sm:px-4 py-2 sm:py-2.5"
                        : "bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-700 shadow-lg shadow-[#015971]/5 dark:shadow-zinc-900/50 px-3 sm:px-4 py-2 sm:py-3 focus-within:ring-2 focus-within:ring-[#015971]/30 focus-within:border-[#015971]/50"
                    )}
                  >
                    <div className="flex items-center text-[#015971] dark:text-cyan-400 mr-2 sm:mr-2.5 flex-shrink-0">
                      <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      id="unified-search"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tests by name, category, or health condition..."
                      className="flex-1 bg-transparent outline-none text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-sm sm:text-base min-w-0"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="p-1 mr-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      id="unified-search-btn"
                      className={cn(
                        "flex-shrink-0 bg-[#015971] hover:bg-[#01475a] text-white font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md hover:shadow-lg",
                        isSearchSticky
                          ? "text-xs sm:text-sm px-3.5 sm:px-5 py-2"
                          : "text-xs sm:text-base px-3.5 sm:px-5 py-2 sm:py-2.5 ml-2 sm:ml-3"
                      )}
                    >
                      <span>Search</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Popular Searches */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-6 lg:mb-2"
              >
                <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Popular Searches:</span>
                {["CBC", "Thyroid", "Vitamin D", "Diabetes", "LFT", "Lipid Profile"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSearchQuery(tag)}
                    id={`popular-search-${tag.toLowerCase().replace(" ", "-")}`}
                    className="text-sm font-medium text-[#015971] dark:text-cyan-300 bg-white/70 dark:bg-zinc-800/60 hover:bg-[#015971] hover:text-white dark:hover:bg-[#015971] border border-[#015971]/25 dark:border-[#015971]/40 rounded-full px-3.5 py-1 transition-all backdrop-blur-sm"
                  >
                    {tag}
                  </button>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Column: Circular Banner Image Seamlessly Synced to Application */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88, x: 25 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{
                delay: 0.35,
                duration: 0.75,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center relative my-4 lg:my-0 select-none max-w-full"
            >
              {/* Outer Glowing Ambient Aura */}
              <div className="absolute -inset-3 sm:-inset-6 bg-gradient-to-tr from-[#015971]/30 via-cyan-400/25 to-teal-300/20 rounded-full blur-2xl sm:blur-3xl -z-10 scale-100 sm:scale-110 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 bg-cyan-400/20 rounded-full blur-2xl -z-10 pointer-events-none" />

              {/* Concentric Decorative Orbital Rings */}
              <div className="absolute -inset-2.5 sm:-inset-6 rounded-full border-2 border-dashed border-[#015971]/25 dark:border-cyan-400/30 pointer-events-none animate-[spin_70s_linear_infinite]" />
              <div className="absolute -inset-1 sm:-inset-2 rounded-full border border-[#015971]/15 dark:border-cyan-400/20 pointer-events-none" />

              {/* Main Circular Portal with Multi-layered Glassmorphism */}
              <div className="relative w-56 h-56 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[410px] lg:h-[410px] xl:w-[440px] xl:h-[440px] rounded-full p-2.5 sm:p-3.5 bg-gradient-to-tr from-white/95 via-cyan-50/60 to-white/90 dark:from-zinc-900/90 dark:via-zinc-800/90 dark:to-zinc-900/90 shadow-[0_25px_60px_-15px_rgba(1,89,113,0.3)] border-2 border-white/90 dark:border-cyan-500/30 ring-4 ring-[#015971]/10 dark:ring-cyan-400/10 backdrop-blur-xl group flex items-center justify-center">
                <div className="relative w-full h-full rounded-full overflow-hidden shadow-inner">
                  {/* Banner Image with targeted microscope focal point */}
                  <Image
                    src="/images/banner.jpg"
                    alt="Medoraa Labs Precision Diagnostics"
                    fill
                    priority
                    sizes="(max-width: 768px) 260px, 450px"
                    className="object-cover object-[68%_36%] group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Inner feathering radial shadow to eliminate hard cutout look */}
                  <div className="absolute inset-0 rounded-full shadow-[inset_0_0_45px_rgba(1,89,113,0.45)] pointer-events-none" />

                  {/* Soft brand color overlay to harmonize lighting with application */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#015971]/35 via-transparent to-cyan-400/20 mix-blend-color pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#015971]/50 via-transparent to-transparent pointer-events-none" />

                  {/* Glass light reflection highlight */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />

                  {/* Signature Dual-Wave Swoosh Accent at Bottom of Portal (inspired by reference banner) */}
                  <div className="absolute bottom-0 left-0 right-0 w-full h-14 sm:h-16 pointer-events-none overflow-hidden">
                    <svg viewBox="0 0 400 90" preserveAspectRatio="none" className="w-full h-full">
                      <path
                        d="M0,45 C120,80 280,10 400,50 L400,90 L0,90 Z"
                        fill="#22d3ee"
                        fillOpacity="0.55"
                      />
                      <path
                        d="M0,60 C140,85 260,25 400,65 L400,90 L0,90 Z"
                        fill="#015971"
                        fillOpacity="0.8"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Floating Quality Badge (Top-Left) */}
              <motion.div
                initial={{ opacity: 0, x: -15, scale: 0.85 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute -top-1.5 left-0 sm:top-4 sm:-left-4 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-white/80 dark:border-zinc-700/80 rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2.5 shadow-[0_12px_30px_rgba(1,89,113,0.18)] flex items-center gap-2 sm:gap-3"
              >
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accredited</p>
                  <p className="text-xs sm:text-sm font-extrabold text-[#015971] dark:text-cyan-300">NABL Quality</p>
                </div>
              </motion.div>

              {/* Floating Speed & Technology Badge (Bottom-Right) */}
              <motion.div
                initial={{ opacity: 0, x: 15, scale: 0.85 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 0.95, duration: 0.6 }}
                className="absolute -bottom-1.5 right-0 sm:bottom-4 sm:-right-4 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-white/80 dark:border-zinc-700/80 rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2.5 shadow-[0_12px_30px_rgba(1,89,113,0.18)] flex items-center gap-2 sm:gap-3"
              >
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-[#015971]/10 text-[#015971] dark:text-cyan-400 flex items-center justify-center">
                  <Microscope className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Automated</p>
                  <p className="text-xs sm:text-sm font-extrabold text-[#015971] dark:text-cyan-300">Precision Labs</p>
                </div>
              </motion.div>

              {/* Live Status Indicator Pill (Top-Right) */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="absolute -top-2.5 right-2 sm:top-1 sm:right-6 z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-[#015971]/20 rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 shadow-md flex items-center gap-1.5 sm:gap-2"
              >
                <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500" />
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#015971] dark:text-cyan-300 tracking-wide">
                  Testing Active
                </span>
              </motion.div>
            </motion.div>
          </div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.7 }}
            className="w-full max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 sm:pt-12 pb-10"
          >
            {[
              {
                icon: (
                  <svg className="w-7 h-7 text-[#015971] dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                ),
                title: "Home Sample Collection",
                subtitle: "At your doorstep",
              },
              {
                icon: (
                  <svg className="w-7 h-7 text-[#015971] dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: "Accurate Reports",
                subtitle: "Trusted & on time",
              },
              {
                icon: (
                  <svg className="w-7 h-7 text-[#015971] dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "NABL Certified Lab",
                subtitle: "Quality you can trust",
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(1,89,113,0.14)" }}
                className="flex items-center gap-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-white/60 dark:border-zinc-700/50 rounded-2xl p-4 shadow-md cursor-default transition-all"
              >
                <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-[#015971]/10 dark:bg-zinc-800 flex items-center justify-center">
                  {card.icon}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-[#015971] dark:text-white leading-tight">{card.title}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{card.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AuroraBackground>

      {/* ── ELASTIC GALLERY SECTION ── */}
      <section id="gallery" className="relative w-full bg-slate-50/60 dark:bg-black/50 py-4">
        <ElasticGallery />
      </section>

      {/* ── HEALTH CHECKUP CATEGORIES SECTION ── */}
      <CheckupCategories />

      {/* ── POPULAR HEALTH CHECKUP PACKAGES SECTION ── */}
      <PopularCheckupPackages />

      {/* ── VITAL BODY SYSTEMS SECTION ── */}
      <VitalBodySystems />

      {/* ── SCROLLING CARDS SECTION ── */}
      {/* ── CLASSIC SERVICES SECTION ── */}
      <section id="services" className="py-10 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#015971] dark:text-white mb-3">
              Our Core Services
            </h2>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto font-medium">
              We offer a wide range of diagnostic services designed to provide accurate and timely insights into your health.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
              {
                title: "Sugar Test (Diabetes)",
                desc: "Precise glucose monitoring to track and manage your blood sugar levels accurately.",
                icon: <Activity className="w-6 h-6" />,
              },
              {
                title: "Urine Analysis",
                desc: "Detailed chemical and microscopic examination to detect underlying kidney and urinary issues.",
                icon: <Droplets className="w-6 h-6" />,
              },
              {
                title: "Complete Blood Count",
                desc: "Essential screening to monitor overall health and detect disorders like anemia or infection.",
                icon: <FlaskConical className="w-6 h-6" />,
              },
              {
                title: "Thyroid Profile",
                desc: "Accurate testing of T3, T4, and TSH levels to ensure your metabolic health is optimal.",
                icon: <Sun className="w-6 h-6" />,
              },
              {
                title: "Lipid Profile",
                desc: "Analysis of cholesterol and triglycerides to monitor heart health and cardiovascular risk.",
                icon: <ShieldCheck className="w-6 h-6" />,
              },
              {
                title: "Kidney Function Test",
                desc: "Assessment of urea and creatinine levels to evaluate your renal health and function.",
                icon: <Microscope className="w-6 h-6" />,
              },
              {
                title: "Liver Function Test",
                desc: "Evaluation of enzymes and proteins to monitor liver health and detect potential disorders.",
                icon: <Activity className="w-6 h-6" />,
              },
              {
                title: "Vitamin D & B12",
                desc: "Essential screenings to check for deficiencies that affect bone health and energy levels.",
                icon: <Sun className="w-6 h-6" />,
              },
              {
                title: "Iron Studies",
                desc: "Tests to measure iron levels and detect conditions like anemia or iron overload.",
                icon: <Droplets className="w-6 h-6" />,
              },
              {
                title: "HBA1C Test",
                desc: "Long-term blood sugar monitoring to evaluate diabetes control over the past 3 months.",
                icon: <Activity className="w-6 h-6" />,
              },
              {
                title: "CRP (Inflammation)",
                desc: "Sensitive marker to detect inflammation and potential infection risk in the body.",
                icon: <Activity className="w-6 h-6" />,
              },
              {
                title: "Pregnancy Tests",
                desc: "Reliable screenings for pregnancy detection and early prenatal health monitoring.",
                icon: <Activity className="w-6 h-6" />,
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-zinc-900 border border-transparent hover:border-[#015971]/20 hover:bg-white dark:hover:bg-black transition-all hover:shadow-xl hover:shadow-[#015971]/5 group"
              >
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-[#015971] dark:text-cyan-400 mb-5 shadow-sm group-hover:bg-[#015971] group-hover:text-white transition-colors">
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold text-[#015971] dark:text-white mb-3">
                  {service.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                  {service.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <div id="features">
        <RuixenBentoCards />
      </div>



      {/* ── PROCESS TIMELINE SECTION ── */}
      <section id="process" ref={timelineRef} className="pt-8 pb-12 bg-white dark:bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              How It Works
            </h2>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto font-medium">
              A simple and seamless process for your health checkup.
            </p>
          </motion.div>

          <div className="relative">
            {/* Vertical Line Animation - Now scroll-linked and responsive */}
            <div className="absolute left-6 md:left-1/2 transform -translate-x-1/2 h-full w-1 bg-neutral-100 dark:bg-neutral-800" />
            <motion.div
              className="absolute left-6 md:left-1/2 transform -translate-x-1/2 w-1 bg-[#015971] origin-top"
              style={{ height: "100%", scaleY }}
            />

            <div className="flex flex-col gap-8 md:gap-16">
              {/* Step 1 */}
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-0">
                <div className="w-full md:w-[45%] text-left md:text-right pl-16 md:pl-0">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-lg md:text-2xl font-bold text-[#015971] dark:text-white mb-1 md:mb-2">Book Appointment</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed">
                      Select your required tests from our wide range of packages and book a convenient time slot that fits your schedule.
                    </p>
                  </motion.div>
                </div>

                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#015971] border-4 border-white dark:border-black flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-xl">
                  1
                </div>

                <div className="w-full md:w-[45%] hidden md:block" />
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-0">
                <div className="w-full md:w-[45%] hidden md:block" />

                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#015971] border-4 border-white dark:border-black flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-xl">
                  2
                </div>

                <div className="w-full md:w-[45%] text-left pl-16 md:pl-0">
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-lg md:text-2xl font-bold text-[#015971] dark:text-white mb-1 md:mb-2">Sample Collection</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed">
                      Our certified phlebotomist will visit your home or you can visit our nearest center for a quick and painless sample collection.
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-0">
                <div className="w-full md:w-[45%] text-left md:text-right pl-16 md:pl-0">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-lg md:text-2xl font-bold text-[#015971] dark:text-white mb-1 md:mb-2">Get Reports Online</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed">
                      Receive accurate digital reports via WhatsApp or email within 24 hours. Consult with our experts for a detailed explanation.
                    </p>
                  </motion.div>
                </div>

                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#015971] border-4 border-white dark:border-black flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-xl">
                  3
                </div>

                <div className="w-full md:w-[45%] hidden md:block" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ── */}
      <section id="testimonials" className="bg-background pt-0 pb-20 relative">
        <div className="container z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center max-w-[540px] mx-auto px-4"
          >
            <div className="flex justify-center">
              <div className="border py-1 px-4 rounded-lg">Testimonials</div>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mt-5 text-center">
              What our users say
            </h2>
            <p className="text-center mt-5 opacity-75">
              See what our customers have to say about us.
            </p>
          </motion.div>

          <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
            <TestimonialsColumn testimonials={firstColumn} duration={15} />
            <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
            <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
          </div>
        </div>
      </section>
      <Footer />

      <RecentActivityNotification />
    </>
  );
}
