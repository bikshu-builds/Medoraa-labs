"use client";
import React, { useState, useEffect } from "react";
import { 
    Map, 
    Calendar, 
    Filter, 
    ArrowUpRight, 
    Activity, 
    Clock, 
    Users,
    MousePointer2
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

const HeatmapPage = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchHeatmap = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/heatmap"), {
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

    useEffect(() => {
        fetchHeatmap();
    }, []);

    const getIntensity = (day: number, hour: number) => {
        const item = data.find(d => d._id.day === day + 1 && d._id.hour === hour);
        const count = item ? item.count : 0;
        if (count === 0) return "bg-slate-50";
        if (count < 3) return "bg-blue-100";
        if (count < 6) return "bg-blue-300";
        if (count < 10) return "bg-blue-500";
        return "bg-blue-700";
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Load Density Analytics</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Temporal heatmaps analyzing laboratory intake patterns and peak hours.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-4 bg-white px-6 py-2 rounded-2xl border border-slate-200 shadow-sm mr-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-slate-100" />
                            <span className="text-[10px] font-bold text-slate-400">Low</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-blue-700" />
                            <span className="text-[10px] font-bold text-slate-400">Peak</span>
                        </div>
                    </div>
                    <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Map className="w-64 h-64 text-blue-600" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex mb-4">
                        <div className="w-20 shrink-0" />
                        <div className="flex-1 flex justify-between px-2">
                            {hours.map(h => (
                                <span key={h} className="text-[10px] font-black text-slate-400 uppercase w-full text-center">{h}h</span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        {days.map((day, dIdx) => (
                            <div key={day} className="flex items-center">
                                <div className="w-20 shrink-0 text-[10px] font-black text-slate-500 uppercase tracking-widest">{day}</div>
                                <div className="flex-1 flex gap-1 h-10">
                                    {hours.map(hour => (
                                        <div 
                                            key={`${dIdx}-${hour}`}
                                            className={cn(
                                                "flex-1 rounded-sm transition-all hover:ring-2 hover:ring-blue-600 cursor-help group relative",
                                                getIntensity(dIdx, hour)
                                            )}
                                        >
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[9px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20">
                                                {day}, {hour}:00 - {hour}:59
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mb-6 shadow-xl shadow-blue-600/40">
                        <Clock className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Peak Activity Window</h4>
                    <p className="text-2xl font-black text-white">Mon - Wed</p>
                    <p className="text-xs font-bold text-blue-400 mt-2">09:00 AM - 11:30 AM</p>
                </div>
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-6">
                        <Users className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Personnel Requirement</h4>
                    <p className="text-2xl font-black text-slate-900">+4 Support Staff</p>
                    <p className="text-xs font-bold text-slate-400 mt-2">Recommended for Morning Shifts</p>
                </div>
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-6">
                        <MousePointer2 className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Interactive Audit</h4>
                    <p className="text-2xl font-black text-slate-900">88.4% Accuracy</p>
                    <p className="text-xs font-bold text-slate-400 mt-2">Based on historical 6-month data</p>
                </div>
            </div>
        </div>
    );
};

export default HeatmapPage;
