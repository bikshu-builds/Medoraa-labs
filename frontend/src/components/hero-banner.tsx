"use client";

import Image from "next/image";
import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, ShieldCheck, FlaskConical, ClipboardList, Heart } from "lucide-react";
import { Playfair_Display, Great_Vibes } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-playfair",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-great-vibes",
});

const BRAND = "#015971";

const Leaf = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 40 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    <path
      d="M20 54C20 54 4 40 4 22C4 10 12 2 20 2C28 2 36 10 36 22C36 40 20 54 20 54Z"
      fill="#7CB98A"
      fillOpacity="0.9"
    />
    <path d="M20 52V8" stroke="#2F6B3C" strokeWidth="1.2" strokeLinecap="round" />
    <path
      d="M20 18C14 20 10 26 8 32M20 28C26 30 30 36 32 42"
      stroke="#2F6B3C"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

const features = [
  { icon: ShieldCheck, title: "Accurate Results", subtitle: "You Can Trust" },
  { icon: FlaskConical, title: "Modern", subtitle: "Laboratory" },
  { icon: ClipboardList, title: "Doctor Preferred", subtitle: "Diagnostics" },
] as const;

export default function HeroBanner() {
  const [query, setQuery] = useState("");

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className={`${playfair.variable} ${greatVibes.variable} relative isolate overflow-hidden bg-white`}
    >
      {/* Soft mint blobs — scaled down with the tighter hero */}
      <div
        className="pointer-events-none absolute -left-24 top-16 h-[320px] w-[320px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(180,232,230,0.5) 0%, rgba(180,232,230,0) 68%)",
        }}
      />
      <div
        className="pointer-events-none absolute left-[38%] top-[8%] h-[400px] w-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(168,228,225,0.65) 0%, rgba(168,228,225,0.18) 42%, transparent 68%)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-12 -top-8 h-36 w-36 rounded-full"
        style={{ background: BRAND, opacity: 0.1 }}
      />
      <div
        className="pointer-events-none absolute right-10 top-4 h-7 w-7 rounded-full"
        style={{ background: BRAND }}
      />

      {/* ~3/4 viewport hero */}
      <div className="relative mx-auto grid min-h-0 max-h-[75vh] max-w-7xl grid-cols-1 items-center gap-6 px-5 pb-10 pt-[4.5rem] sm:px-8 lg:grid-cols-2 lg:gap-6 lg:pb-12 lg:pt-16 xl:px-10">
        {/* Left — logo lives in sticky nav; reserve space so layout matches */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col items-start"
        >
          {/* Spacer matching sticky brand height while on banner */}
          <div className="mb-5 h-[52px] w-full sm:mb-6 sm:h-[58px]" aria-hidden />

          <p
            className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] sm:text-[11px]"
            style={{ color: BRAND }}
          >
            Trusted Diagnostic Partner
          </p>

          <h1
            className="font-[family-name:var(--font-playfair)] text-[1.85rem] font-semibold leading-[1.12] tracking-tight sm:text-[2.35rem] lg:text-[2.75rem]"
            style={{ color: BRAND }}
          >
            Because
            <br />
            Better Care
            <br />
            Starts with
            <br />
            Accurate Tests
          </h1>

          <p className="mt-3 max-w-md text-[13px] leading-relaxed text-[#5A7A82] sm:text-sm">
            Advanced diagnostics. Reliable reports. Recommended by doctors.
            Trusted by families.
          </p>

          <form
            onSubmit={onSearch}
            className="mt-5 flex w-full max-w-lg items-center gap-2 rounded-full border border-[#D5E6EA] bg-white py-1 pl-3.5 pr-1 shadow-[0_10px_32px_rgba(1,89,113,0.09)] sm:mt-6 sm:pl-4"
          >
            <Search className="h-4 w-4 shrink-0 text-[#7A9AA3]" strokeWidth={2} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for tests (e.g. CBC, Thyroid, Vitamin D...)"
              className="min-w-0 flex-1 bg-transparent py-1.5 text-[13px] text-[#015971] outline-none placeholder:text-[#9BB0B7]"
              aria-label="Search for tests"
            />
            <button
              type="submit"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition hover:brightness-110 sm:h-10 sm:w-10"
              style={{ background: BRAND }}
              aria-label="Search"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="pointer-events-none absolute -bottom-5 left-0 flex items-end gap-0.5 lg:-bottom-7">
            <Leaf className="h-11 w-8 -rotate-[18deg]" />
            <Leaf className="mb-2 h-8 w-6 rotate-[14deg]" />
          </div>
        </motion.div>

        {/* Right — compact HD photo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mx-auto w-full max-w-[420px] lg:mx-0 lg:max-w-[460px] lg:justify-self-end"
        >
          <div className="relative mx-auto h-[min(52vh,420px)] w-full max-w-[380px]">
            <div
              className="pointer-events-none absolute -bottom-3 -left-8 -z-10 h-[70%] w-[75%]"
              style={{
                borderRadius: "54% 46% 48% 52% / 42% 48% 52% 58%",
                background: "linear-gradient(165deg, #A8E4E1 0%, #D4F2F0 55%, #EAF9F8 100%)",
              }}
            />

            <div
              className="absolute inset-x-[3%] inset-y-0 overflow-hidden shadow-[0_22px_50px_rgba(1,89,113,0.22)] ring-1 ring-white/40"
              style={{
                borderRadius: "46% 54% 48% 52% / 36% 40% 60% 64%",
              }}
            >
              <Image
                src="/images/scientist-microscope.png"
                alt="Scientist examining samples under a microscope"
                fill
                priority
                quality={100}
                sizes="(max-width: 768px) 92vw, 760px"
                className="object-cover object-[58%_22%] contrast-[1.06] saturate-[1.08] brightness-[1.02]"
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 55% 35%, transparent 42%, rgba(1,89,113,0.12) 100%)",
                }}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="absolute -right-1 bottom-[14%] z-20 w-[min(100%,200px)] rounded-2xl border border-white bg-white p-3 shadow-[0_14px_40px_rgba(1,89,113,0.14)] sm:right-0 sm:w-[210px] sm:p-3.5"
            >
              <ul className="flex flex-col gap-2.5">
                {features.map(({ icon: Icon, title, subtitle }) => (
                  <li key={title} className="flex items-start gap-2.5">
                    <span
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                      style={{ background: "rgba(1,89,113,0.1)", color: BRAND }}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
                    </span>
                    <div>
                      <p className="text-[13px] font-bold leading-tight" style={{ color: BRAND }}>
                        {title}
                      </p>
                      <p className="text-[11px] text-[#6B8A92]">{subtitle}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

            <div className="absolute -bottom-0.5 right-0 z-20 flex items-center gap-1 sm:right-2">
              <Leaf className="h-6 w-4 -rotate-12" />
              <p
                className="font-[family-name:var(--font-great-vibes)] text-xl leading-none sm:text-[1.45rem]"
                style={{ color: BRAND }}
              >
                Care Through Accuracy
              </p>
              <Heart className="h-3 w-3 fill-[#E11D48] text-[#E11D48]" />
              <Leaf className="h-5 w-4 rotate-[16deg]" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
