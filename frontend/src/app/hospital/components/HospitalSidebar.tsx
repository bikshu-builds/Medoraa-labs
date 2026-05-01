"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FilePlus,
    Activity,
    ClipboardCheck,
    DollarSign,
    LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const HospitalSidebar: React.FC = () => {
    const pathname = usePathname();

    const menuItems = [
        {
            group: "Workspace", items: [
                { name: "Dashboard", icon: LayoutDashboard, path: "/hospital/dashboard" },
                { name: "Orders & Requests", icon: FilePlus, path: "/hospital/orders" },
                { name: "Sample Processing", icon: Activity, path: "/hospital/samples" },
                { name: "Pathology Review", icon: ClipboardCheck, path: "/hospital/approvals" },
                { name: "Invoices & Billing", icon: DollarSign, path: "/hospital/billing" },
            ]
        },
    ];

    return (
        <aside className="flex flex-col h-full bg-[#1A2536] text-slate-300 w-64 font-sans shrink-0 border-r border-slate-800">
            {/* Logo Section */}
            <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <ActivityIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-lg tracking-tight">Medoraa B2B</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-6 no-scrollbar">
                {menuItems.map((group, gIdx) => (
                    <div key={gIdx} className="mb-8">
                        <h3 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                            {group.group}
                        </h3>
                        <ul className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = pathname === item.path;
                                return (
                                    <li key={item.path}>
                                        <Link
                                            href={item.path}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                                                isActive
                                                    ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20"
                                                    : "hover:bg-slate-800/60 hover:text-white"
                                            )}
                                        >
                                            <item.icon className={cn(
                                                "w-4 h-4",
                                                isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                                            )} />
                                            {item.name}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-slate-800/50">
                <button
                    onClick={() => {
                        localStorage.removeItem("hospitalToken");
                        localStorage.removeItem("hospitalUser");
                        window.location.href = "/signin";
                    }}
                    className="flex items-center gap-3 w-full px-3 py-3 text-slate-400 hover:bg-slate-800/60 hover:text-white rounded-xl text-sm transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    Logout Portal
                </button>
            </div>
        </aside>
    );
};

function ActivityIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
    )
}

export default HospitalSidebar;
