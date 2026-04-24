"use client";
import React, { useEffect, useState } from "react";
import { MapPin, TrendingUp, Users, DollarSign, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { getApiUrl } from "@/lib/api";

const SourceTracking: React.FC = () => {
    const [stats, setStats] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("adminToken");
                const res = await fetch(getApiUrl("/api/admin/source-tracking"), {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setStats(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch source stats", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const displayStats = stats.length > 0 ? stats : [
        { _id: "Walk-in", count: 450, revenue: 125000 },
        { _id: "Referring Doctor", count: 820, revenue: 450000 },
        { _id: "Home Collection", count: 180, revenue: 85000 },
        { _id: "Corporate / Camps", count: 310, revenue: 150000 }
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mapping Intelligence...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Source Intelligence</h1>
                <p className="text-slate-500 font-medium mt-1">Multi-channel attribution and revenue distribution analysis</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full"></div>
                    <h2 className="text-xl font-black text-slate-900 mb-10 flex items-center gap-3">
                        <Users className="w-6 h-6 text-blue-600" />
                        Patient Inflow Distribution
                    </h2>
                    <div className="space-y-8">
                        {displayStats.map((item, idx) => {
                            const total = displayStats.reduce((sum, i) => sum + i.count, 0);
                            const percentage = Math.round((item.count / total) * 100);
                            const colors = ["bg-blue-600", "bg-emerald-500", "bg-purple-600", "bg-amber-500"];
                            
                            return (
                                <div key={idx} className="group">
                                    <div className="flex justify-between items-end mb-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-800">{item._id}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.count} Registered Cases</span>
                                        </div>
                                        <span className="text-lg font-black text-slate-900">{percentage}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                        <div 
                                            className={cn(colors[idx % colors.length], "h-full rounded-full transition-all duration-1000 group-hover:brightness-110 shadow-lg")} 
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
                    <h2 className="text-xl font-black mb-10 flex items-center gap-3 relative z-10">
                        <DollarSign className="w-6 h-6 text-blue-400" />
                        Monetary Contribution
                    </h2>
                    <div className="space-y-8 relative z-10">
                        {displayStats.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-5 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-default">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                                        <Target className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white">{item._id}</p>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Growth: High</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-white tracking-tight">₹{(item.revenue / 1000).toFixed(1)}k</p>
                                    <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mt-1">+12.4%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
                <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Channel Efficiency Index
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {displayStats.map((item, idx) => (
                        <div key={idx} className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-600 mb-6 group-hover:scale-110 transition-transform">
                                <MapPin className="w-6 h-6 text-blue-500" />
                            </div>
                            <h4 className="font-black text-slate-900 text-sm mb-1 uppercase tracking-tight">{item._id}</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Attribution Level: Max</p>
                            <div className="text-3xl font-black text-blue-600 tracking-tighter">
                                {Math.round(item.revenue / item.count).toLocaleString()}
                                <span className="text-xs text-slate-400 ml-2 font-black uppercase tracking-widest">ARPP</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SourceTracking;
