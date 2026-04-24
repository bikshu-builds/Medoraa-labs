"use client";
import React, { useEffect, useState } from "react";
import { 
    BarChart3, 
    TrendingUp, 
    Users, 
    Clock, 
    ArrowUpRight, 
    Calendar,
    Filter,
    Activity,
    LineChart as LineChartIcon
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

const Analytics: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregating Global Metrics...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Analytics</h1>
                    <p className="text-slate-500 font-medium mt-1">Deep-dive into laboratory throughput and staff performance</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-700 shadow-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        Last 30 Days
                    </div>
                    <button className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                        <Filter className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <BarChart3 className="w-6 h-6 text-blue-600" />
                                    Test Volume Trends
                                </h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Daily throughput analysis</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">Daily</div>
                                <div className="px-3 py-1 hover:bg-slate-50 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-transparent">Weekly</div>
                            </div>
                        </div>
                        
                        <div className="h-[300px] flex items-end justify-between gap-4 px-4">
                            {[40, 65, 45, 90, 65, 80, 55, 70, 85, 60, 75, 95].map((val, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar">
                                    <div className="w-full relative h-[200px] flex items-end">
                                        <div 
                                            className="w-full bg-slate-100 rounded-t-xl group-hover/bar:bg-blue-100 transition-all duration-500 cursor-pointer relative"
                                            style={{ height: `${val}%` }}
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                                {val * 10}
                                            </div>
                                            {i === 11 && <div className="absolute inset-0 bg-blue-600 rounded-t-xl shadow-[0_0_20px_rgba(37,99,235,0.4)]" />}
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">M{i+1}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-sm group">
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-7 h-7" />
                                </div>
                                <span className="text-emerald-500 font-black text-sm flex items-center gap-1">
                                    +18.4%
                                    <ArrowUpRight className="w-4 h-4" />
                                </span>
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-1">94.2%</h3>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Average Turnaround Accuracy</p>
                        </div>

                        <div className="bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-sm group">
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 group-hover:scale-110 transition-transform">
                                    <Clock className="w-7 h-7" />
                                </div>
                                <span className="text-purple-500 font-black text-sm flex items-center gap-1">
                                    -12m
                                    <Activity className="w-4 h-4" />
                                </span>
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-1">3.4h</h3>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Mean Time to Report (MTTR)</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                        <h2 className="text-xl font-black mb-8 relative z-10 tracking-tight">Resource Utilization</h2>
                        <div className="space-y-8 relative z-10">
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Equipment Load</span>
                                    <span className="text-sm font-black text-blue-400">72%</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                    <div className="bg-blue-400 h-full w-[72%] rounded-full shadow-[0_0_15px_rgba(96,165,250,0.4)] transition-all duration-1000" />
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Staff Capacity</span>
                                    <span className="text-sm font-black text-emerald-400">89%</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                    <div className="bg-emerald-400 h-full w-[89%] rounded-full shadow-[0_0_15px_rgba(52,211,153,0.4)] transition-all duration-1000" />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Reagent Stock</span>
                                    <span className="text-sm font-black text-amber-400">45%</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                    <div className="bg-amber-400 h-full w-[45%] rounded-full shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all duration-1000" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <LineChartIcon className="w-5 h-5 text-blue-600" />
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Efficiency Matrix</h2>
                        </div>
                        <div className="space-y-6">
                            {[
                                { label: "Peak Load (10 AM)", value: "Critical", color: "text-rose-500" },
                                { label: "Min TAT", value: "1.2h", color: "text-emerald-500" },
                                { label: "Max Throughput", value: "1.2k/day", color: "text-blue-500" },
                                { label: "System Health", value: "99.9%", color: "text-emerald-500" }
                            ].map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500">{item.label}</span>
                                    <span className={cn("text-xs font-black uppercase tracking-widest", item.color)}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analytics;
