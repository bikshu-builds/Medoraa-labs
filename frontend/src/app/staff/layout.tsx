"use client";
import React, { useState, useEffect } from "react";
import StaffNavbar from "./components/StaffNavbar";
import StaffSidebar from "./components/StaffSidebar";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function StaffLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const isLoginPage = pathname === "/staff/login";

    useEffect(() => {
        const token = localStorage.getItem("staffToken");
        if (!token && !isLoginPage) {
            router.push("/staff/login");
        }
    }, [pathname, isLoginPage, router]);

    if (isLoginPage) {
        return <div className="min-h-screen bg-slate-50 font-sans">{children}</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row overflow-hidden h-screen">
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-72 shrink-0 h-screen sticky top-0 bg-white border-r border-slate-100 shadow-sm">
                <StaffSidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-all animate-in fade-in"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <div className={`fixed inset-y-0 left-0 w-80 bg-white z-50 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) md:hidden border-r border-slate-100 shadow-2xl`}>
                <StaffSidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen">
                <StaffNavbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-10 bg-slate-50/50">
                    <div className="max-w-7xl mx-auto pb-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
