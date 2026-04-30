"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Truck,
    UserPlus,
    Building2,
    Inbox,
    FlaskConical,
    FileCheck,
    FileText,
    CreditCard,
    Bell,
    User,
    LogOut,
    ChevronRight,
    Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StaffSidebar({ onClose }: { onClose?: () => void }) {
    const pathname = usePathname();

    const [role, setRole] = useState<string>("");

    useEffect(() => {
        const storedUser = localStorage.getItem("staffUser");
        console.log("Stored User Data:", storedUser);
        if (storedUser) {
            const user = JSON.parse(storedUser);
            console.log("Current Staff Role:", user.role);
            setRole(user.role);
        }
    }, []);

    const allMenuItems = [
        { name: "Dashboard", icon: LayoutDashboard, href: "/staff/dashboard", roles: ["all"] },
        { name: "Collections", icon: Truck, href: "/staff/collections", roles: ["Sample Collection Team", "Admin Staff"] },
        { name: "Walk-In Entry", icon: UserPlus, href: "/staff/walkin", roles: ["Reception", "Admin Staff", "Sample Collection Team"] },
        // { name: "Hospital Orders", icon: Building2, href: "/staff/hospitals", roles: ["Dispatch Team", "Admin Staff", "Sample Collection Team"] },
        { name: "Sample Reception", icon: Inbox, href: "/staff/sampleReception", roles: ["Reception", "Sample Processing Team", "Admin Staff", "Sample Collection Team"] },
        { name: "Lab Testing", icon: FlaskConical, href: "/staff/labTesting", roles: ["Sample Processing Team", "Admin Staff", "Sample Collection Team"] },
        { name: "Approvals", icon: FileCheck, href: "/staff/approvals", roles: ["Report Approval Team", "Admin Staff", "Sample Collection Team"] },
        { name: "Reports", icon: FileText, href: "/staff/reports", roles: ["all"] },
        { name: "Billing", icon: CreditCard, href: "/staff/billing", roles: ["Reception", "Admin Staff", "Sample Collection Team"] },
        { name: "Notifications", icon: Bell, href: "/staff/notifications", roles: ["all"] },
        { name: "Profile", icon: User, href: "/staff/profile", roles: ["all"] },
    ];

    const menuItems = allMenuItems.filter(item => 
        item.roles.includes("all") || 
        item.roles.includes(role) || 
        role === "Sample Collection Team" // Direct bypass for this role
    );

    const handleLogout = () => {
        localStorage.removeItem("staffToken");
        window.location.href = "/signin";
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Logo */}
            <div className="p-8">
                <Link href="/staff/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">MEDORAA</h1>
                        <p className="text-[10px] font-black text-blue-600 tracking-[0.2em] uppercase mt-1">Staff Portal</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto no-scrollbar">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                                "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group",
                                isActive
                                    ? "bg-blue-50 text-blue-600 shadow-sm"
                                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <item.icon className={cn(
                                    "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                                )} />
                                <span className={cn(
                                    "text-[11px] font-black uppercase tracking-widest",
                                    isActive ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"
                                )}>
                                    {item.name}
                                </span>
                            </div>
                            {isActive && <ChevronRight className="w-4 h-4 text-blue-400" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-6 border-t border-slate-50">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all font-black text-[11px] uppercase tracking-widest"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </div>
    );
}
