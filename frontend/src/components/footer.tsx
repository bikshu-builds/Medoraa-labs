"use client"
import React from "react";
import Image from "next/image";

export default function Footer() {
    return (
        <div>
            <footer className="bg-[#1A3263] text-white pt-12 pb-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                        {/* Column 1: Brand */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                                    <div className="w-5 h-5 bg-[#1A3263] rounded-sm" />
                                </div>
                                <span className="text-xl font-bold tracking-tight text-white">Medoraa Labs</span>
                            </div>
                            <p className="text-blue-100/70 text-sm leading-relaxed">
                                Empowering your health journey with world-class diagnostic expertise and cutting-edge technology. NABL Accredited and trusted by 5000+ patients.
                            </p>
                            <div className="flex items-center gap-3">
                                {["facebook", "twitter", "instagram", "linkedin"].map((social) => (
                                    <a
                                        key={social}
                                        href="#"
                                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                                    >
                                        <Image
                                            src={`https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${social}.svg`}
                                            alt={social}
                                            width={16}
                                            height={16}
                                            className="invert"
                                        />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Column 2: Quick Links */}
                        <div>
                            <h4 className="text-base font-bold mb-4">Quick Links</h4>
                            <ul className="flex flex-col gap-2">
                                {["Home", "Health Tests", "Book Appointment", "About Us", "Contact Us"].map((link) => (
                                    <li key={link}>
                                        <a href="#" className="text-blue-100/70 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                                            <div className="w-1 h-1 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 3: Services */}
                        <div>
                            <h4 className="text-base font-bold mb-4">Services</h4>
                            <ul className="flex flex-col gap-2">
                                {["Full Body Checkup", "Diabetes Screening", "Heart Care Packages", "Home Sample Collection", "Corporate Wellness"].map((service) => (
                                    <li key={service}>
                                        <a href="#" className="text-blue-100/70 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                                            <div className="w-1 h-1 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            {service}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 4: Contact */}
                        <div>
                            <h4 className="text-base font-bold mb-4">Get in Touch</h4>
                            <ul className="flex flex-col gap-4">
                                <li className="flex gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-blue-100/70 text-sm">
                                        123 Diagnostic Lane, Medical Square, Cityville, State 560001
                                    </span>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <span className="text-blue-100/70 text-sm">+91 90140 93137</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-blue-100/50 text-xs">
                            © {new Date().getFullYear()} Medoraa Labs. All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            <a href="#" className="text-blue-100/50 hover:text-white text-xs transition-colors">Privacy Policy</a>
                            <a href="#" className="text-blue-100/50 hover:text-white text-xs transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}