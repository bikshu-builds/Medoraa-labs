"use client";

import { motion } from "framer-motion";
import React from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { ScrollNavigationMenu } from "@/components/scroll-navigation-menu";
import { ScrollingCards } from "./homepagecomponents/scrolling-cards";

export default function Home() {
  return (
    <>
      <ScrollNavigationMenu />
      <AuroraBackground>
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.2,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="relative flex flex-col gap-12 items-center justify-center px-4 max-w-7xl mx-auto pt-24"
        >

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            <div className="flex flex-col gap-8 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A3263] border border-[#1A3263]/20 text-white dark:text-blue-400 text-sm font-semibold w-fit">
                NABL Accredited Laboratory
              </div>

              <h1 className="text-5xl md:text-7xl font-bold dark:text-white tracking-tight leading-[1.1]">
                Advanced Diagnostics <br />
                <span className="text-[#406093] dark:text-[#124170]">Expert Care.</span>
              </h1>

              <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed max-w-xl">
                Experience world-class laboratory services with cutting-edge technology and certified pathology experts. Accurate results delivered to your doorstep.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-[#1A3263] hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl px-8 py-4 font-bold text-lg transition-all shadow-xl shadow-blue-500/25">
                  Book A Test
                </button>
                <button className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500 text-neutral-900 dark:text-white rounded-xl px-8 py-4 font-bold text-lg transition-all">
                  Our Services
                </button>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-neutral-900 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-bold">
                      {i === 4 ? "+5k" : "MD"}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  Trusted by <span className="font-bold text-neutral-900 dark:text-white">5,000+</span> patients this month
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 bg-blue-500/20 rounded-[2rem] blur-3xl group-hover:bg-blue-500/30 transition-all duration-500"></div>
              <div className="relative aspect-square md:aspect-[4/3] rounded-[2rem] overflow-hidden border border-white/20 shadow-2xl">
                <img
                  src="/images/lab.png"
                  alt="Medical Laboratory"
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                <div className="absolute bottom-6 left-6 right-6 p-4 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">Certified Results</div>
                      <div className="text-white/70 text-xs">Pathologist Reviewed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AuroraBackground>
      <ScrollingCards />
    </>
  );
}
