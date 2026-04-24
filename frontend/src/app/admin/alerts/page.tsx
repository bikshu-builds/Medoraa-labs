"use client";
import React, { useState, useEffect } from "react";
import { 
    AlertTriangle, 
    ShieldAlert, 
    Activity, 
    Bell, 
    CheckCircle, 
    Clock, 
    MoreHorizontal,
    Zap,
    Wind
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Alert {
    _id: string;
    type: string;
    message: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Active' | 'Resolved';
    createdAt: string;
}

const AlertsPage = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAlerts = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/alerts"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setAlerts(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Sentinel</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Critical system monitors, latency alerts, and infrastructure health.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                    <Activity className="w-4 h-4 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Global Watch Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Health Cards */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-1000">
                            <Zap className="w-40 h-40 text-blue-400" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-10">Node Health</h3>
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-300">Database Latency</span>
                                    <span className="text-lg font-black text-emerald-400">12ms</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-300">API Throughput</span>
                                    <span className="text-lg font-black text-white">4.2k/m</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-300">Memory Load</span>
                                    <span className="text-lg font-black text-amber-400">62%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alert Feed */}
                <div className="lg:col-span-2 space-y-4">
                    {alerts.length > 0 ? (
                        alerts.map((alert) => (
                            <div 
                                key={alert._id}
                                className={cn(
                                    "p-6 rounded-[2rem] border transition-all flex items-center gap-6",
                                    alert.priority === 'Critical' ? "bg-rose-50 border-rose-100" :
                                    alert.priority === 'High' ? "bg-amber-50 border-amber-100" :
                                    "bg-white border-slate-100"
                                )}
                            >
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
                                    alert.priority === 'Critical' ? "bg-white text-rose-600 shadow-xl shadow-rose-600/10" :
                                    alert.priority === 'High' ? "bg-white text-amber-600 shadow-xl shadow-amber-600/10" :
                                    "bg-slate-50 text-slate-400"
                                )}>
                                    <AlertTriangle className="w-7 h-7" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-sm font-black text-slate-900">{alert.type}</h3>
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border",
                                            alert.priority === 'Critical' ? "bg-rose-600 text-white border-rose-600" :
                                            alert.priority === 'High' ? "bg-amber-500 text-white border-amber-500" :
                                            "bg-slate-100 text-slate-500 border-slate-200"
                                        )}>
                                            {alert.priority}
                                        priority</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500">{alert.message}</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1.5 text-slate-400 justify-end mb-1">
                                        <Clock className="w-3 h-3" />
                                        <span className="text-[10px] font-bold">{new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700">Acknowledge</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 py-20">
                            <ShieldAlert className="w-16 h-16 text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold">No active threats detected.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AlertsPage;
