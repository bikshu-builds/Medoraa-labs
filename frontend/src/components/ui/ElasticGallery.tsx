"use client";

import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ElasticItemProps {
    id: string;
    title: string;
    src: string;
    alt: string;
}

function ElasticGallery() {
    const items: ElasticItemProps[] = [
        {
            id: "01",
            title: "Track it with a Full Body Checkup",
            src: "/images/card1.png",
            alt: "Track it with a Full Body Checkup",
        },
        {
            id: "02",
            title: "Get tested with Fever Profile",
            src: "/images/card2.png",
            alt: "Get tested with Fever Profile",
        },
        {
            id: "03",
            title: "Hair Fall Checkups",
            src: "/images/card3.png",
            alt: "Hair Fall Checkups",
        },
        {
            id: "04",
            title: "Get Ultra Full Body Checkup",
            src: "/images/card4.png",
            alt: "Get Ultra Full Body Checkup",
        },
    ];

    const [activeId, setActiveId] = useState<string | null>(null);

    const handleCardClick = (item: ElasticItemProps) => {
        const text = encodeURIComponent(
            `Hello Medoraa Labs, I am interested in "${item.title}". Please share appointment slots and package details.`
        );
        window.open(`https://wa.me/916301851252?text=${text}`, "_blank");
    };

    return (
        <div className="w-full py-4 dark:bg-black md:py-6">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                {/* ── MOBILE VIEW: 2x2 Responsive Card Grid (< md) ── */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:hidden">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleCardClick(item)}
                            className="group relative h-[220px] sm:h-[270px] w-full cursor-pointer overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-md active:scale-[0.98] transition-transform duration-200"
                        >
                            {/* Background Image Layer */}
                            <div className="absolute inset-0 h-full w-full">
                                <Image
                                    src={item.src}
                                    alt={item.alt}
                                    fill
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                />
                                {/* Bottom dark gradient for text legibility */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                            </div>

                            {/* Bottom Dark Frosted Overlay Card */}
                            <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 sm:bottom-3 sm:left-3 sm:right-3">
                                <div className="rounded-xl bg-black/65 p-2.5 sm:p-3 backdrop-blur-md border border-white/10 shadow-lg">
                                    <div className="flex items-start justify-between gap-1.5">
                                        <h3 className="text-xs sm:text-sm font-semibold text-white leading-snug line-clamp-2">
                                            {item.title}
                                        </h3>
                                        <div className="flex h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-white group-hover:bg-[#015971] transition-colors">
                                            <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} />
                                        </div>
                                    </div>
                                    <p className="mt-1 text-[10px] sm:text-xs font-medium text-cyan-300">
                                        Book via WhatsApp
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── DESKTOP VIEW: Interactive Elastic Expandable Gallery (md+) ── */}
                <div
                    onMouseLeave={() => setActiveId(null)}
                    className="hidden md:flex h-[360px] w-full flex-row gap-3.5"
                >
                    {items.map((item) => {
                        const isHovered = activeId === item.id;

                        return (
                            <div
                                key={item.id}
                                onMouseEnter={() => setActiveId(item.id)}
                                onClick={() => handleCardClick(item)}
                                className={cn(
                                    "group relative cursor-pointer overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950",
                                    "transition-[flex,filter,transform] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]",
                                    isHovered ? "flex-[2.6]" : "flex-[1]"
                                )}
                            >
                                {/* Background Image Layer */}
                                <div className="absolute inset-0 h-full w-full">
                                    <Image
                                        src={item.src}
                                        alt={item.alt}
                                        fill
                                        sizes="33vw"
                                        className={cn(
                                            "object-cover transition-all duration-700",
                                            isHovered
                                                ? "scale-105 brightness-100"
                                                : "scale-100 brightness-[0.92] group-hover:brightness-100"
                                        )}
                                    />
                                    {/* Soft gradient at bottom for text overlay contrast */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                                </div>

                                {/* Bottom Dark Frosted Overlay Card */}
                                <div className="absolute bottom-3 left-3 right-3 z-10">
                                    <div className="rounded-2xl bg-black/60 p-3.5 backdrop-blur-md border border-white/10 shadow-lg transition-all duration-300">
                                        <div className="flex items-start justify-between gap-2">
                                            {/* Card Title */}
                                            <h3 className="text-sm md:text-base font-semibold text-white leading-snug tracking-tight">
                                                {item.title}
                                            </h3>

                                            {/* Circular Dark Arrow Button */}
                                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-black/80 border border-white/20 text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-[#015971]">
                                                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
                                            </div>
                                        </div>

                                        {/* Action Reveal on Hover */}
                                        <div
                                            className={cn(
                                                "flex items-center gap-1.5 transition-all duration-300 ease-out",
                                                isHovered
                                                    ? "mt-2 opacity-100 max-h-8 translate-y-0"
                                                    : "mt-0 opacity-0 max-h-0 overflow-hidden -translate-y-1 pointer-events-none"
                                            )}
                                        >
                                            <span className="text-xs font-medium text-cyan-300">
                                                Book Checkup • WhatsApp
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export { ElasticGallery };
