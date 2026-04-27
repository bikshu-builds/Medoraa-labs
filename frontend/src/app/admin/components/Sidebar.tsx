"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    UserPlus,
    Users,
    UserCheck,
    MapPin,
    CircleDollarSign,
    Home,
    BarChart3,
    FileText,
    LogOut,
    Clock,
    Bell,
    Calendar,
    ShieldCheck,
    StickyNote,
    Wallet,
    LineChart,
    Map,
    Sparkles,
    Shield,
    AlertTriangle,
    Database,
    Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const Sidebar: React.FC = () => {
    const pathname = usePathname();

    const menuItems = [
        {
            group: "Main", items: [
                { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
                { name: "Activity Logs", icon: Clock, path: "/admin/activityLogs" },
                { name: "Notifications", icon: Bell, path: "/admin/notifications" },
            ]
        },
        {
            group: "Operations", items: [
                { name: "Bookings", icon: Calendar, path: "/admin/bookings" },
                { name: "Report Approval", icon: ShieldCheck, path: "/admin/reportApproval" },
                { name: "Internal Notes", icon: StickyNote, path: "/admin/internalNotes" },
            ]
        },
        {
            group: "Directory", items: [
                { name: "Doctors", icon: UserPlus, path: "/admin/doctors" },
                { name: "Employees", icon: Users, path: "/admin/employees" },
                { name: "Patients", icon: UserCheck, path: "/admin/patients" },
            ]
        },
        {
            group: "Financials", items: [
                { name: "Billing & Revenue", icon: CircleDollarSign, path: "/admin/billing" },
                { name: "Commissions", icon: Wallet, path: "/admin/commissions" },
            ]
        },
        {
            group: "Analytics", items: [
                { name: "Doctor Performance", icon: BarChart3, path: "/admin/doctorPerformance" },
                { name: "Staff Performance", icon: LineChart, path: "/admin/staffPerformance" },
                { name: "Heatmap", icon: Map, path: "/admin/heatmap" },
                { name: "AI Insights", icon: Sparkles, path: "/admin/insights" },
            ]
        },
        {
            group: "System", items: [
                { name: "Roles & Permissions", icon: Shield, path: "/admin/roles" },
                { name: "Alerts Center", icon: AlertTriangle, path: "/admin/alerts" },
                { name: "Database Backup", icon: Database, path: "/admin/backup" },
                { name: "Settings", icon: Settings, path: "/admin/settings" },
            ]
        },
    ];

    return (
        <aside className="flex flex-col h-full bg-[#1e293b] text-slate-300 w-64 font-sans shrink-0">
            {/* Logo Section */}
            <div className="h-20 flex items-center px-6 border-b border-slate-700/50">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center mr-3">
                    <ActivityIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-lg tracking-tight">Medoraa Labs</span>
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
                                                "flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                                isActive
                                                    ? "bg-blue-600 text-white"
                                                    : "hover:bg-slate-800 hover:text-white"
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
            <div className="p-4 border-t border-slate-700/50">
                <div className="flex items-center gap-3 px-2 py-2 mb-2">
                    <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                        AD
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white truncate">Administrator</span>
                        <span className="text-[10px] text-slate-500 truncate">admin@medoraa.com</span>
                    </div>
                </div>
                <button
                    onClick={() => {
                        localStorage.removeItem("adminToken");
                        window.location.href = "/signin";
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-md text-sm transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
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

export default Sidebar;
