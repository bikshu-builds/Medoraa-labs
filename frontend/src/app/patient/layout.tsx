"use client";
import React, { useState } from "react";
import PatientNavbar from "./components/PatientNavbar";
import Sidebar from "./components/Sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function PatientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const isAuthPage = pathname.includes("/login") || pathname.includes("/register");

    if (isAuthPage) {
        return <div className="min-h-screen bg-slate-50 font-sans">{children}</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row">
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-72 shrink-0 h-screen sticky top-0 bg-[#1e293b] border-r border-slate-700/30">
                <Sidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-all"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <div className={`fixed inset-y-0 left-0 w-72 bg-[#1e293b] z-50 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out md:hidden border-r border-slate-700/30`}>
                <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                <PatientNavbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 p-4 md:p-8 pb-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
