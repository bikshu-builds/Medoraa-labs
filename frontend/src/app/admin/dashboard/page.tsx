"use client";
import React, { useEffect, useState } from "react";
import DashboardCard from "../components/DashboardCard";
import { 
    Users, 
    UserPlus, 
    Calendar, 
    DollarSign, 
    Activity,
    Plus,
    Clock,
    FileText,
    ArrowRight,
    Zap,
    AlertCircle,
    TrendingUp,
    ShieldCheck
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { DashboardStats } from "../types";
import { cn } from "@/lib/utils";

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [liveStats, setLiveStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) {
                window.location.href = "/admin/login";
                return;
            }

            const [sRes, lRes] = await Promise.all([
                fetch(getApiUrl("/api/admin/dashboard"), { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(getApiUrl("/api/admin/live-dashboard"), { headers: { "Authorization": `Bearer ${token}` } })
            ]);
            
            const sData = await sRes.json();
            const lData = await lRes.json();
            
            if (sData.success) setStats(sData.data);
            if (lData.success) setLiveStats(lData.data);
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Auto refresh every 30s
        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Intelligence...</p>
            </div>
        );
    }

    const displayStats = stats || {
        totalPatients: 0,
        totalDoctors: 0,
        totalEmployees: 0,
        homeCollectionRequests: 0,
        monthlyRevenue: 0,
        pendingReports: 0,
        sourceCounts: []
    };

    return (
        <div className="space-y-10 font-sans animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Executive Dashboard</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-slate-500 text-sm font-medium">Real-time laboratory operational intelligence.</p>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Live Sync</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => window.location.href = '/admin/activityLogs'}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all shadow-sm"
                    >
                        Audit Logs
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 shadow-xl shadow-slate-900/10 transition-all active:scale-95">
                        <Plus className="w-4 h-4" />
                        New Registration
                    </button>
                </div>
            </div>

            {/* Live Metrics Pulse */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-600 p-8 rounded-[2rem] text-white flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-1000">
                        <Zap className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 mb-2">Live Workload</p>
                        <h3 className="text-3xl font-black">{liveStats?.activePatients || 0}</h3>
                        <p className="text-xs font-bold text-blue-100 mt-2 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Active Clinical Cases
                        </p>
                    </div>
                </div>
                <div className="bg-slate-900 p-8 rounded-[2rem] text-white flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-1000">
                        <Calendar className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Today's Schedule</p>
                        <h3 className="text-3xl font-black">{liveStats?.todayBookings || 0}</h3>
                        <p className="text-xs font-bold text-slate-400 mt-2 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Confirmed Appointments
                        </p>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Activity className="w-32 h-32 text-blue-600" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Home Collections</p>
                        <h3 className="text-3xl font-black text-slate-900">{liveStats?.ongoingCollections || 0}</h3>
                        <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            In Progress
                        </p>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="Total Patients" value={displayStats.totalPatients} icon={Users} color="blue" description="YTD Growth" />
                <DashboardCard title="Medical Partners" value={displayStats.totalDoctors} icon={UserPlus} color="emerald" description="Active Doctors" />
                <DashboardCard title="Laboratory Staff" value={displayStats.totalEmployees} icon={Calendar} color="purple" description="Departmental total" />
                <DashboardCard title="Monthly Revenue" value={`₹${displayStats.monthlyRevenue.toLocaleString()}`} icon={DollarSign} color="amber" description="Current Month" />
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Table */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-600" />
                            Inflow Monitoring
                        </h2>
                        <button 
                            onClick={() => window.location.href = '/admin/patients'}
                            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 flex items-center gap-2 transition-all"
                        >
                            Full Registry
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    
                    <div className="divide-y divide-slate-50">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-all cursor-default group">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-black border border-slate-100 text-[10px] group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                                        #{1000 + i}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">Patient Case {1000 + i}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hospital Branch Referral</span>
                                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                                            <span className="text-[10px] font-bold text-blue-500 uppercase">Processing</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg">{i * 20}m ago</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Panels */}
                <div className="space-y-8">
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm p-8">
                        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center justify-between">
                            Health Status
                            <AlertCircle className="w-4 h-4 text-slate-300" />
                        </h2>
                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-slate-600">Throughput Efficiency</span>
                                    <span className="text-xs font-black text-blue-600">82%</span>
                                </div>
                                <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100">
                                    <div className="bg-blue-600 h-full w-[82%] rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-slate-600">Collection Accuracy</span>
                                    <span className="text-xs font-black text-emerald-600">94%</span>
                                </div>
                                <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100">
                                    <div className="bg-emerald-600 h-full w-[94%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Queue</p>
                                    <p className="text-2xl font-black text-slate-900">{displayStats.homeCollectionRequests}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending</p>
                                    <p className="text-2xl font-black text-slate-900">{displayStats.pendingReports}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-xl p-8 text-white relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 p-6 opacity-10 transform translate-x-1/4 translate-y-1/4">
                            <Zap className="w-32 h-32 text-blue-400" />
                        </div>
                        <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 relative z-10">Advanced Controls</h2>
                        <div className="space-y-3 relative z-10">
                            <button 
                                onClick={() => window.location.href = '/admin/bookings'}
                                className="flex items-center justify-between w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left group/btn"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-200">Dispatch Home Team</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-600 group-hover/btn:text-white transition-colors" />
                            </button>
                            <button 
                                onClick={() => window.location.href = '/admin/activityLogs'}
                                className="flex items-center justify-between w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left group/btn"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-200">Security Audit</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-600 group-hover/btn:text-white transition-colors" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
