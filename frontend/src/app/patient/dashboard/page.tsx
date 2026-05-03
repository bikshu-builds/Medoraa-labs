"use client";
import React, { useEffect, useState } from "react";
import { 
    ClipboardList, 
    Clock, 
    FileText, 
    Truck, 
    Plus,
    Activity,
    Bell,
    User,
    ShieldCheck,
    Calendar,
    ArrowUpRight,
    ArrowRight,
    Zap
} from "lucide-react";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function PatientDashboard() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const token = localStorage.getItem("patientToken");
                const res = await fetch(getApiUrl("/api/patient/dashboard"), {
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
        fetchDashboard();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-8 h-8 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Synchronizing...</p>
            </div>
        );
    }

    return (
        <div className="h-full max-w-[1600px] mx-auto flex flex-col gap-5 animate-in fade-in duration-700 pb-6">
            {/* Top Row: Welcome & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Welcome Card */}
                <div className="lg:col-span-5 bg-[#1e293b] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                            <Zap className="w-3.5 h-3.5" />
                            Dashboard Overview
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {getGreeting()}, <span className="text-blue-400">{data?.patientName?.split(' ')[0] || 'Patient'}</span>
                        </h1>
                        <p className="text-slate-400 text-xs mt-1 font-medium italic">You have {data?.stats?.pendingReports || 0} pending reports to review today.</p>
                    </div>
                    <div className="flex items-center gap-3 relative z-10 pt-4">
                        <Link href="/patient/tests" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20">
                            <Plus className="w-3.5 h-3.5" /> New Booking
                        </Link>
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider ml-2">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        </div>
                    </div>
                </div>

                {/* Stats Bento */}
                <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatsCard title="Bookings" value={data?.stats?.bookings || 0} icon={ClipboardList} color="blue" />
                    <StatsCard title="Pending" value={data?.stats?.pendingReports || 0} icon={Clock} color="amber" />
                    <StatsCard title="Completed" value={data?.stats?.completedTests || 0} icon={FileText} color="emerald" />
                    <StatsCard title="Home Visit" value={data?.stats?.homeCollections || 0} icon={Truck} color="indigo" />
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
                {/* Reports Section */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-500" />
                            Recent Reports
                        </h2>
                        <Link href="/patient/reports" className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 uppercase tracking-wider">
                            Explore <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="flex-1 overflow-auto no-scrollbar">
                        {data?.recentReports?.length > 0 ? (
                            <div className="divide-y divide-slate-50">
                                {data.recentReports.map((report: any) => (
                                    <div key={report._id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center transition-all">
                                                <FileText className="w-4.5 h-4.5" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-800">{report.test.name}</h3>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] text-slate-400 font-medium">#{report.reportId}</span>
                                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                    <span className="text-[10px] text-slate-400 font-medium">{new Date(report.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border",
                                                report.status === 'Ready' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                            )}>
                                                {report.status}
                                            </span>
                                            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-10 opacity-40">
                                <FileText className="w-10 h-10 mb-2" />
                                <p className="text-[10px] font-bold uppercase tracking-wider">No active reports</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Side Bento Column */}
                <div className="lg:col-span-4 flex flex-col gap-5">
                    {/* Notifications */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col flex-1 min-h-0">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <Bell className="w-4 h-4 text-amber-500" />
                                Notifications
                            </h2>
                            <span className="bg-amber-50 text-amber-600 text-[9px] font-black px-1.5 py-0.5 rounded">
                                {data?.latestNotifications?.length || 0} NEW
                            </span>
                        </div>
                        <div className="space-y-4 overflow-auto no-scrollbar pr-1">
                            {data?.latestNotifications?.length > 0 ? (
                                data.latestNotifications.map((notif: any) => (
                                    <div key={notif._id} className="relative pl-4 border-l-2 border-slate-100 hover:border-blue-500 transition-all group">
                                        <h4 className="text-[12px] font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{notif.title}</h4>
                                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 font-medium">{notif.message}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 opacity-30">
                                    <Bell className="w-8 h-8 mx-auto mb-2" />
                                    <p className="text-[9px] font-bold uppercase tracking-widest">Inbox Empty</p>
                                </div>
                            )}
                        </div>
                        <button className="w-full mt-auto pt-4 border-t border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors text-left">
                            Dismiss All
                        </button>
                    </div>

                    {/* Security Compact */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-[11px] font-bold tracking-wider uppercase">Secure Access</h3>
                                <p className="text-[9px] text-slate-400 font-medium leading-tight mt-0.5">End-to-end encrypted medical data protection.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon: Icon, color }: any) {
    const colors: any = {
        blue: "text-blue-600 bg-blue-50",
        amber: "text-amber-600 bg-amber-50",
        emerald: "text-emerald-600 bg-emerald-50",
        indigo: "text-indigo-600 bg-indigo-50"
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-slate-200 transition-all cursor-default">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-all", colors[color])}>
                <Icon className="w-4.5 h-4.5" />
            </div>
            <div className="mt-3">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{value}</h3>
            </div>
        </div>
    );
}

