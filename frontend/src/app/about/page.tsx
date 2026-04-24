"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, ShieldCheck, Award, Users } from "lucide-react";
import { ScrollNavigationMenu } from "@/components/scroll-navigation-menu";
import Image from "next/image";
import Footer from "@/components/footer"

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white dark:bg-black">
            {/* ── NAVIGATION ── */}
            <ScrollNavigationMenu />

            {/* ── HERO SECTION ── */}
            <section className="relative pt-20 pb-12 overflow-hidden bg-[#1A3263] mt-28">
                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] shadow-inner" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold text-white mb-6"
                    >
                        About Medoraa Labs
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-blue-100 text-xl max-w-3xl mx-auto leading-relaxed"
                    >
                        Leading the way in medical diagnostics with precision, speed, and compassionate care.
                        Your health is our primary mission.
                    </motion.p>
                </div>
            </section>

            {/* ── MISSION & VISION ── */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            {
                                title: "Our Mission",
                                desc: "To provide accurate, reliable, and timely diagnostic results to every patient, empowering them to take control of their health journey.",
                                icon: <ShieldCheck className="w-8 h-8" />
                            },
                            {
                                title: "Our Vision",
                                desc: "To become the most trusted and technologically advanced diagnostic network, setting global benchmarks in medical testing.",
                                icon: <Award className="w-8 h-8" />
                            },
                            {
                                title: "Expert Team",
                                desc: "Led by world-class pathologists and experienced technicians dedicated to clinical excellence and patient safety.",
                                icon: <Users className="w-8 h-8" />
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="p-8 rounded-3xl bg-[#F8FAFC] dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-center group hover:border-[#1A3263]/20 transition-all"
                            >
                                <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-[#1A3263] mx-auto mb-6 shadow-sm group-hover:bg-[#1A3263] group-hover:text-white transition-all">
                                    {item.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-[#1A3263] dark:text-white mb-4">{item.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CONTACT & LOCATION SECTION ── */}
            <section className="py-20 bg-zinc-50 dark:bg-zinc-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Contact Info */}
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold text-[#1A3263] dark:text-white mb-8">Get In Touch</h2>
                            <div className="space-y-8">
                                <div className="flex gap-6">
                                    <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-xl flex items-center justify-center text-[#1A3263] shadow-sm flex-shrink-0">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-1">Call Us</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">+91 90140 93137</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-xl flex items-center justify-center text-[#1A3263] shadow-sm flex-shrink-0">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-1">Email Us</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">support@medoraalabs.com</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-xl flex items-center justify-center text-[#1A3263] shadow-sm flex-shrink-0">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-1">Visit Us</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                                            Y.V.R. Estate, Gollapudi,<br />
                                            Vijayawada, Andhra Pradesh 521225
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-xl flex items-center justify-center text-[#1A3263] shadow-sm flex-shrink-0">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-1">Working Hours</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">Mon - Sat: 7:00 AM - 9:00 PM<br />Sun: 7:00 AM - 2:00 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Google Map */}
                        <div className="rounded-3xl overflow-hidden border-4 border-white dark:border-zinc-900 shadow-2xl h-[500px]">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825.143242044814!2d80.59850027514338!3d16.518888984218683!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35f1f96440263f%3A0xc682390a18712a23!2sGollapudi%2C%20Vijayawada%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1714041490212!5m2!1sen!2sin"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />

        </main>
    );
}
