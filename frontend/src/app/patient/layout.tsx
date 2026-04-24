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
            <div className="hidden md:block w-72 shrink-0 h-screen sticky top-0 bg-white border-r border-slate-200">
                <Sidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-all"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <div className={`fixed inset-y-0 left-0 w-72 bg-white z-50 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out md:hidden border-r border-slate-200`}>
                <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                <PatientNavbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
                    {children}
                </main>

                {/* Mobile Sticky Bottom Nav */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-40">
                    <BottomNavItem icon="home" label="Home" href="/patient/dashboard" active={pathname === "/patient/dashboard"} />
                    <BottomNavItem icon="search" label="Tests" href="/patient/tests" active={pathname === "/patient/tests"} />
                    <BottomNavItem icon="clipboard" label="Bookings" href="/patient/bookings" active={pathname === "/patient/bookings"} />
                    <BottomNavItem icon="user" label="Profile" href="/patient/profile" active={pathname === "/patient/profile"} />
                </div>
            </div>
        </div>
    );
}

function BottomNavItem({ icon, label, href, active }: any) {
    return (
        <Link href={href} className={`flex flex-col items-center gap-1 ${active ? "text-blue-600" : "text-slate-400"}`}>
            <div className="w-6 h-6 flex items-center justify-center">
                {icon === "home" && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
                {icon === "search" && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>}
                {icon === "clipboard" && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>}
                {icon === "user" && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        </Link>
    );
}
