"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const cards = [
  {
    id: 1,
    title: "AI Development",
    description: "Building state-of-the-art neural networks and machine learning models tailored for your business needs.",
    image: "/images/card1.png",
    color: "from-blue-500 to-purple-600",
  },
  {
    id: 2,
    title: "Cloud Solutions",
    description: "Scale your infrastructure globally with our high-performance cloud architecture and serverless deployments.",
    image: "/images/card2.png",
    color: "from-teal-400 to-emerald-500",
  },
  {
    id: 3,
    title: "Premium Design",
    description: "Crafting beautiful, intuitive interfaces that wow your users and define your brand identity.",
    image: "/images/card3.png",
    color: "from-orange-400 to-rose-500",
  },
  {
    id: 4,
    title: "Data Analytics",
    description: "Turning raw data into actionable insights with our advanced visualization and reporting tools.",
    image: "/images/card1.png",
    color: "from-indigo-500 to-cyan-500",
  },
];

// Duplicate cards for infinite scroll
const duplicatedCards = [...cards, ...cards];

export function ScrollingCards() {
  return (
    <section className="py-24 px-4 overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Core Expertise
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience innovation through our premium technological solutions and state-of-the-art designs.
          </p>
        </motion.div>

        <div className="relative flex overflow-hidden group">
          <motion.div
            className="flex gap-8 py-4"
            animate={{
              x: ["0%", "-50%"],
            }}
            transition={{
              duration: 30,
              ease: "linear",
              repeat: Infinity,
            }}
            whileHover={{ transition: { duration: 60 } }} // Slow down on hover
          >
            {duplicatedCards.map((card, index) => (
              <motion.div
                key={`${card.id}-${index}`}
                className="relative flex-shrink-0 w-64 h-80 rounded-2xl overflow-hidden cursor-pointer shadow-xl"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-b ${card.color} opacity-30 mix-blend-overlay`} />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl transition-all duration-500 group-hover:bg-white/20">
                    <h3 className="text-xl font-bold text-white mb-1">{card.title}</h3>
                    <p className="text-white/80 text-xs line-clamp-2 group-hover:line-clamp-none transition-all duration-500">
                      {card.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Fade gradients at edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
        </div>
      </div>
    </section>
  );
}
