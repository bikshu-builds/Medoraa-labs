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
    Bell,
    Truck,
    User,
    HelpCircle,
    LogOut,
    PlusCircle,
    X,
    Activity
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
        { name: "Home Collection", icon: Truck, path: "/patient/homeCollection" },
        { name: "Notifications", icon: Bell, path: "/patient/notifications" },
        { name: "Profile", icon: User, path: "/patient/profile" },
        { name: "Support", icon: HelpCircle, path: "/patient/support" },
    ];

    return (
        <div className="flex flex-col h-full bg-white text-slate-600 font-sans">
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-8 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                        <Activity className="w-5 h-5" />
                    </div>
                    <span className="font-black text-slate-900 text-lg tracking-tight">Medoraa</span>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-lg md:hidden">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar">
                <ul className="space-y-1.5">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <li key={item.path}>
                                <Link
                                    href={item.path}
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all group",
                                        isActive
                                            ? "bg-blue-50 text-blue-600 shadow-sm"
                                            : "hover:bg-slate-50 text-slate-500 hover:text-slate-900"
                                    )}
                                >
                                    <item.icon className={cn(
                                        "w-5 h-5 transition-colors",
                                        isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                                    )} />
                                    {item.name}
                                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100">
                <button
                    onClick={() => {
                        localStorage.removeItem("patientToken");
                        window.location.href = "/signin";
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-2xl text-sm font-bold transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
