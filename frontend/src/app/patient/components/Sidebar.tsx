"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Search,
    ClipboardList,
    FileText,
    CreditCard,
    LogOut,
    PlusCircle,
    X,
    Activity,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
    const pathname = usePathname();

    const menuItems = [
        { name: "Dashboard", icon: LayoutDashboard, path: "/patient/dashboard" },
        { name: "Book Test", icon: PlusCircle, path: "/patient/tests" },
        { name: "My Bookings", icon: ClipboardList, path: "/patient/bookings" },
        { name: "Test Reports", icon: FileText, path: "/patient/reports" },
        { name: "Billing", icon: CreditCard, path: "/patient/billing" },
    ];

    const accountItems = [
        { name: "My Profile", icon: User, path: "/patient/profile" },
    ];

    return (
        <div className="flex flex-col h-full bg-[#1e293b] text-slate-300 font-sans shadow-xl">
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-700/50 bg-[#1e293b]">
                <Link href="/patient/dashboard" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-white text-lg tracking-tight leading-none">Medoraa</span>
                        <span className="text-[10px] text-slate-400 font-semibold tracking-[0.2em] uppercase mt-1">Patient Portal</span>
                    </div>
                </Link>
                {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg md:hidden text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Menu Sections */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8 no-scrollbar">
                {/* Main Menu */}
                <div>
                    <p className="px-4 mb-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Main Menu</p>
                    <ul className="space-y-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <li key={item.path}>
                                    <Link
                                        href={item.path}
                                        onClick={onClose}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
                                            isActive
                                                ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                                                : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                                        )}
                                    >
                                        <item.icon className={cn(
                                            "w-4 h-4 transition-colors",
                                            isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                                        )} />
                                        {item.name}
                                        {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-blue-300" />}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Account Section */}
                <div>
                    <p className="px-4 mb-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Account</p>
                    <ul className="space-y-1">
                        {accountItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <li key={item.path}>
                                    <Link
                                        href={item.path}
                                        onClick={onClose}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
                                            isActive
                                                ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                                                : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                                        )}
                                    >
                                        <item.icon className={cn(
                                            "w-4 h-4 transition-colors",
                                            isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                                        )} />
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700/50 bg-[#1e293b]">
                <button
                    onClick={() => {
                        localStorage.removeItem("patientToken");
                        window.location.href = "/signin";
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg text-sm font-medium transition-all group"
                >
                    <LogOut className="w-4 h-4 group-hover:text-rose-400" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;

