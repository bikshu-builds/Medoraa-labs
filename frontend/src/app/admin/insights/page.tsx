"use client";
import React, { useState, useEffect } from "react";
import { 
    Sparkles, 
    TrendingUp, 
    Zap, 
    BrainCircuit, 
    ArrowRight, 
    ChevronRight,
    LineChart,
    PieChart,
    Target,
    Activity
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

const InsightsPage = () => {
    const [insights, setInsights] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchInsights = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/insights"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setInsights(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInsights();
    }, []);

    const indicators = [
        { label: "Operational Efficiency", value: "88%", delta: "+4.2%", icon: Zap, color: "blue" },
        { label: "Predicted Revenue Growth", value: "15.4%", delta: "Projected", icon: TrendingUp, color: "emerald" },
        { label: "Resource Optimization", value: "Low Waste", delta: "Optimal", icon: Target, color: "amber" },
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-1000">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        Cognitive Insights
                        <div className="px-2 py-0.5 bg-blue-600 text-white rounded text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/30">Beta v1.0</div>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">AI-driven predictive analytics and business intelligence modeling.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs hover:bg-slate-800 transition-all active:scale-95">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    Regenerate Forecast
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {indicators.map((item, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center mb-6",
                            item.color === 'blue' ? "bg-blue-50 text-blue-600" :
                            item.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                            "bg-amber-50 text-amber-600"
                        )}>
                            <item.icon className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{item.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{item.value}</h3>
                        <p className="mt-4 text-[11px] font-bold text-slate-500 flex items-center gap-2">
                            <span className={cn(
                                item.color === 'emerald' ? "text-emerald-500" : "text-slate-400"
                            )}>{item.delta}</span>
                            since last evaluation
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <BrainCircuit className="w-64 h-64 text-blue-400" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-400 mb-12">Core Business Intelligence</h3>
                        
                        <div className="space-y-10">
                            <div className="flex items-start gap-6">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                    <Target className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">Trend Detection: Doctor Referral Increase</h4>
                                    <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">Referral volume from specialized clinics has increased by 18% in the last 14 days. Suggests potential for strategic partnership expansion.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                    <LineChart className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">Revenue Prediction: Upside Expected</h4>
                                    <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">Based on current booking trends, next month's revenue is likely to hit a 12-month high. Recommend optimizing sample processing capacity.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                    <Activity className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">Resource Alert: Potential Bottleneck</h4>
                                    <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">Evening collection requests are peaking between 6PM-8PM. Increasing field staff for this window could improve conversion by 9%.</p>
                                </div>
                            </div>
                        </div>

                        <button className="mt-12 flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                            Download Detailed AI Audit
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-black text-slate-900 mb-8 flex items-center justify-between">
                            Predictive Workload Model
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Current Cycle</span>
                        </h3>
                        <div className="space-y-8">
                            {[
                                { label: "Sample Processing", val: 82, color: "blue" },
                                { label: "Home Collections", val: 94, color: "emerald" },
                                { label: "Report Delivery", val: 78, color: "indigo" },
                                { label: "Resource Utilization", val: 65, color: "amber" },
                            ].map((bar, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-bold text-slate-600">{bar.label}</span>
                                        <span className="text-xs font-black text-slate-900">{bar.val}%</span>
                                    </div>
                                    <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100">
                                        <div className={cn(
                                            "h-full rounded-full transition-all duration-1000",
                                            bar.color === 'blue' ? "bg-blue-600" :
                                            bar.color === 'emerald' ? "bg-emerald-500" :
                                            bar.color === 'indigo' ? "bg-indigo-600" : "bg-amber-500"
                                        )} style={{ width: `${bar.val}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InsightsPage;
