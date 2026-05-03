"use client";
import React from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { usePathname } from "next/navigation";

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/admin/login";

    if (isLoginPage) {
        return (
            <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center p-6">
                {children}
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-white overflow-hidden font-sans antialiased text-slate-900">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
                <main className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-8 max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
