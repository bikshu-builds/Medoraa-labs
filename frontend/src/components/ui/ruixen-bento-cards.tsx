"use client"

import Image from "next/image"
import React from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { FlaskConical, Home, Microscope, Activity, ShieldCheck } from "lucide-react"

const cardContents = [
  {
    title: "NABL Accredited Labs",
    description:
      "Our laboratories are fully accredited by NABL, ensuring the highest standards of accuracy and reliability for every medical test we perform.",
    icon: <FlaskConical className="w-10 h-10 text-[#1A3263]" />,
  },
  {
    title: "Home Collection",
    description:
      "Skip the wait. Our certified professionals provide seamless, painless sample collection from the comfort of your home.",
    icon: <Home className="w-10 h-10 text-[#1A3263]" />,
  },
  {
    title: "Advanced Imaging & Diagnostics",
    description:
      "From high-resolution MRI and CT scans to advanced pathology, we use state-of-the-art diagnostic technology to provide deep insights into your health. Our facility is equipped with the latest imaging systems that ensure minimal radiation and maximum precision. Whether it's a routine checkup or specialized screening, our expert radiologists and pathologists work together to deliver comprehensive results that you and your doctor can trust.",
    icon: <Microscope className="w-10 h-10 text-[#1A3263]" />,
  },  
  {
    title: "24/7 Expert Care",
    description:
      "Our team of medical experts and pathologists are available around the clock to ensure your health never takes a backseat.",
    icon: <Activity className="w-10 h-10 text-[#1A3263]" />,
  },
  {
    title: "Fast & Secure Reports",
    description:
      "Receive your digitally signed reports securely via WhatsApp or Email within 24 hours of sample collection.",
    icon: <ShieldCheck className="w-10 h-10 text-[#1A3263]" />,
  },
]


const PlusCard: React.FC<{
  className?: string
  title: string
  description: string
  icon?: React.ReactNode
}> = ({
  className = "",
  title,
  description,
  icon,
}) => {
  return (
    <div
      className={cn(
        "relative border border-dashed border-zinc-300 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-950 min-h-[200px] transition-all hover:border-[#1A3263] group overflow-hidden",
        "flex flex-col justify-between",
        className
      )}
    >
      <CornerPlusIcons />
      
      {/* Icon Background Decoration */}
      <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        {icon}
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-3">
        <div className="p-2 bg-[#F1F5F9] dark:bg-zinc-900 rounded-lg w-fit text-[#1A3263] [&>svg]:w-8 [&>svg]:h-8">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#1A3263] dark:text-gray-100 mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

const CornerPlusIcons = () => (
  <>
    <PlusIcon className="absolute -top-3 -left-3" />
    <PlusIcon className="absolute -top-3 -right-3" />
    <PlusIcon className="absolute -bottom-3 -left-3" />
    <PlusIcon className="absolute -bottom-3 -right-3" />
  </>
)

const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width={24}
    height={24}
    strokeWidth="1"
    stroke="currentColor"
    className={`text-black dark:text-white size-6 ${className}`}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
  </svg>
)

export default function RuixenBentoCards() {
  return (
    <section className="bg-[#F8FAFC] dark:bg-black py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-[#1A3263] dark:text-white mb-4 tracking-tight">
            Advanced Technology. <br />
            <span className="text-[#406093]">Compassionate Care.</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium leading-relaxed">
            Medoraa Labs combines world-class diagnostic expertise with cutting-edge technology to give you accurate insights into your health journey.
          </p>
        </div>

        {/* Responsive Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 auto-rows-auto gap-6">
          <PlusCard {...cardContents[0]} className="lg:col-span-3 lg:row-span-1" />
          <PlusCard {...cardContents[1]} className="lg:col-span-3 lg:row-span-1" />
          <PlusCard {...cardContents[2]} className="lg:col-span-4 lg:row-span-1" />
          <PlusCard {...cardContents[3]} className="lg:col-span-2 lg:row-span-1" />
          <PlusCard {...cardContents[4]} className="lg:col-span-6 lg:row-span-1" />
        </div>
      </div>
    </section>
  )
}
