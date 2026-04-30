"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
    Activity, 
    Truck, 
    Inbox, 
    FlaskConical, 
    FileCheck, 
    ArrowRight, 
    Loader2,
    Calendar,
    Clock,
    ChevronRight,
    Search,
    Plus,
    Filter
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function StaffDashboard() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("staffUser");
        if (storedUser) setUser(JSON.parse(storedUser));
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const token = localStorage.getItem("staffToken");
            const res = await fetch(getApiUrl("/api/staff/dashboard"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const d = await res.json();
            if (d.success) setData(d.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Compiling Workflow...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Greeting */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Overview</h1>
                    <p className="text-slate-500 font-bold mt-2">Welcome back, <span className="text-blue-600">{user?.name}</span>. Here's your task priority for today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* Role-Specific Task Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <TaskCard 
                    label="Assigned Tasks" 
                    value={data?.stats?.pendingCollections || 0} 
                    icon={Truck} 
                    color="blue" 
                    trend="+2 new"
                />
                <TaskCard 
                    label="Pending Reception" 
                    value={data?.stats?.pendingReception || 0} 
                    icon={Inbox} 
                    color="amber" 
                    trend="High Priority"
                />
                <TaskCard 
                    label="In Testing" 
                    value={data?.stats?.inTesting || 0} 
                    icon={FlaskConical} 
                    color="indigo" 
                    trend="On Track"
                />
                <TaskCard 
                    label="Pending Approval" 
                    value={data?.stats?.pendingApprovals || 0} 
                    icon={FileCheck} 
                    color="emerald" 
                    trend="Stat Urgent"
                />
                <TaskCard 
                    label="Dispatch Ready" 
                    value={data?.stats?.pendingDispatch || 0} 
                    icon={Activity} 
                    color="rose" 
                    trend="Evening Batch"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Active Orders / Worklist */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Workflow Worklist</h3>
                        <div className="flex items-center gap-4">
                            <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest">View All</button>
                        </div>
                    </div>

                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-50 bg-slate-50/50">
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Details</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Profile</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {data?.activeOrders?.map((order: any) => (
                                    <tr key={order._id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                                                    {order.patientName[0]}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{order.patientName}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-1">ID: {order.bookingId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-bold text-slate-600">{order.tests[0]?.name || "Diagnostic Profile"}</p>
                                            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1">{order.sourceType}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                order.status === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"
                                            )}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 text-slate-300 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions & Calendar */}
                <div className="space-y-8">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Priority Protocols</h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                        <QuickAction 
                            label="Scan Sample QR" 
                            desc="Receive & Register Sample" 
                            icon={Search} 
                            color="blue"
                            href="/staff/sampleReception"
                        />
                        <QuickAction 
                            label="Express Lab Entry" 
                            desc="Mark as In-Testing" 
                            icon={FlaskConical} 
                            color="indigo"
                            href="/staff/labTesting"
                        />
                        <QuickAction 
                            label="Instant Walk-in" 
                            desc="Register New Patient" 
                            icon={Plus} 
                            color="emerald"
                            href="/staff/walkin"
                        />
                    </div>

                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl" />
                        <div className="relative z-10">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Staff Performance</h4>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Collection Efficiency</span>
                                    <span className="text-sm font-black">94%</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[94%]" />
                                </div>
                                <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">"Keep maintaining 1-hour TAT for all stat samples."</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TaskCard({ label, value, icon: Icon, color, trend }: any) {
    const colors: any = {
        blue: "bg-blue-600 text-white shadow-blue-200",
        amber: "bg-amber-500 text-white shadow-amber-200",
        indigo: "bg-indigo-600 text-white shadow-indigo-200",
        emerald: "bg-emerald-500 text-white shadow-emerald-200",
        rose: "bg-rose-500 text-white shadow-rose-200"
    };

    const lightColors: any = {
        blue: "bg-blue-50 text-blue-600",
        amber: "bg-amber-50 text-amber-600",
        indigo: "bg-indigo-50 text-indigo-600",
        emerald: "bg-emerald-50 text-emerald-600",
        rose: "bg-rose-50 text-rose-600"
    };

    return (
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", lightColors[color])}>
                <Icon className="w-6 h-6" />
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</h4>
            <p className="text-3xl font-black text-slate-900 tracking-tight mb-4">{value}</p>
            <div className="flex items-center gap-2">
                <span className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest", trend.includes("Urgent") ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500")}>
                    {trend}
                </span>
            </div>
        </div>
    );
}

function QuickAction({ label, desc, icon: Icon, color, href }: any) {
    return (
        <Link href={href || "#"} className="flex items-center gap-5 p-6 bg-white border border-slate-100 rounded-[2rem] hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all text-left group">
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-12",
                color === "blue" ? "bg-blue-50 text-blue-600" : color === "indigo" ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
            )}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{label}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-200 ml-auto group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </Link>
    );
}
