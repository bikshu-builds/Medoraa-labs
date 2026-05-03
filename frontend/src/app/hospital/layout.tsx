"use client";
import React, { useEffect, useState } from "react";
import HospitalSidebar from "./components/HospitalSidebar";

interface HospitalLayoutProps {
    children: React.ReactNode;
}

export default function HospitalLayout({ children }: HospitalLayoutProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const token = localStorage.getItem("hospitalToken");
        if (!token) {
            window.location.href = "/signin";
        }
    }, []);

    if (!isMounted) return null;

    return (
        <div className="flex h-screen bg-slate-50/50 overflow-hidden font-sans antialiased text-slate-900">
            <HospitalSidebar />
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
                <header className="h-20 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
                    <div>
                        <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider">Hospital B2B Partner Portal</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl">Secure Login</span>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-300">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
