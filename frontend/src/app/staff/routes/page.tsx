"use client";
import React from "react";
import { 
    Navigation, 
    MapPin, 
    Truck, 
    Clock, 
    ChevronRight, 
    Activity,
    Flag,
    ArrowRight,
    Search,
    Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StaffRoutes() {
    const activeRoute = {
        name: "Route South-Alpha",
        assignedStaff: "Alice Collector",
        stops: [
            { id: 1, patient: "Rahul Sharma", address: "42, Medoraa Tower, Bangalore", time: "09:00 AM", status: "Completed" },
            { id: 2, patient: "Anita Devi", address: "88, West End Park, Bangalore", time: "11:00 AM", status: "On the way" },
            { id: 3, patient: "Sumit Kumar", address: "12, Green Glen Layout, Bangalore", time: "01:00 PM", status: "Pending" },
            { id: 4, patient: "Priya Singh", address: "55, Electronic City, Bangalore", time: "03:00 PM", status: "Pending" }
        ]
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                        <Navigation className="w-10 h-10 text-blue-600" />
                        Route Logistics
                    </h1>
                    <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-widest">Optimized Collection Paths & Real-time Tracking</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3">
                        <Filter className="w-4 h-4 text-slate-400" /> Optimize Path
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                {/* Route Map Preview */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="aspect-video bg-slate-100 rounded-[4rem] border-4 border-white shadow-2xl relative overflow-hidden group">
                        {/* Simulated Map */}
                        <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/77.5946,12.9716,12,0/800x450?access_token=pk.mock')] bg-cover bg-center grayscale opacity-50 group-hover:grayscale-0 transition-all duration-700" />
                        
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-600/20 rounded-full animate-ping" />
                                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl relative z-10">
                                    <Truck className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        {/* Floating Info */}
                        <div className="absolute bottom-10 left-10 right-10 bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-2xl flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <Activity className="w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">{activeRoute.name}</h4>
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">4 Stops • 22.4 KM Total Distance</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8 text-right px-8 border-l border-slate-100">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">E.T.A Next Stop</p>
                                    <p className="text-lg font-black text-slate-900 uppercase">18 Mins</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-8 bg-blue-600 rounded-[3rem] text-white shadow-xl shadow-blue-200">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-60">Fuel & Logistics</h4>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl font-black tracking-tighter">₹840.00</span>
                                <span className="text-[10px] font-black uppercase bg-white/10 px-3 py-1 rounded-full">Projected</span>
                            </div>
                            <p className="text-[10px] font-bold text-blue-100">Estimated fuel cost for current optimized path.</p>
                        </div>
                        <div className="p-8 bg-slate-900 rounded-[3rem] text-white shadow-xl shadow-slate-200">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-60">Route Efficiency</h4>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl font-black tracking-tighter">98.2%</span>
                                <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">Excellent</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400">Path optimization has saved 4.2 KM today.</p>
                        </div>
                    </div>
                </div>

                {/* Timeline: Stops */}
                <div className="space-y-8">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Scheduled Stops</h3>
                    
                    <div className="relative pl-10 space-y-12">
                        {/* Timeline Line */}
                        <div className="absolute left-4 top-0 bottom-0 w-1 bg-slate-100 rounded-full" />

                        {activeRoute.stops.map((stop, i) => (
                            <div key={stop.id} className="relative">
                                {/* Dot */}
                                <div className={cn(
                                    "absolute -left-[30px] top-1.5 w-5 h-5 rounded-full border-4 border-white shadow-md z-10 transition-all duration-500",
                                    stop.status === "Completed" ? "bg-emerald-500 scale-125" : 
                                    stop.status === "On the way" ? "bg-blue-600 animate-pulse scale-150" : "bg-slate-200"
                                )} />

                                <div className={cn(
                                    "p-6 rounded-[2rem] border transition-all group",
                                    stop.status === "On the way" ? "bg-white border-blue-600 shadow-xl shadow-blue-900/5 ring-4 ring-blue-50" : "bg-white border-slate-50 hover:border-slate-200"
                                )}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{stop.id}</span>
                                            <div className="w-px h-3 bg-slate-100" />
                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{stop.time}</span>
                                        </div>
                                        <span className={cn(
                                            "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                                            stop.status === "Completed" ? "bg-emerald-50 text-emerald-600" : 
                                            stop.status === "On the way" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                                        )}>{stop.status}</span>
                                    </div>
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight mb-2 group-hover:text-blue-600 transition-colors">{stop.patient}</h4>
                                    <div className="flex items-start gap-2 text-slate-400">
                                        <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                                        <p className="text-[10px] font-bold leading-relaxed line-clamp-2">{stop.address}</p>
                                    </div>
                                    
                                    {stop.status === "On the way" && (
                                        <button className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                                            <Navigation className="w-3 h-3" /> Get Directions <ArrowRight className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        {/* Finish Flag */}
                        <div className="relative">
                            <div className="absolute -left-[30px] top-1.5 w-5 h-5 rounded-full bg-slate-900 border-4 border-white shadow-md z-10 flex items-center justify-center">
                                <Flag className="w-2.5 h-2.5 text-white" />
                            </div>
                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100/50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Route Endpoint</p>
                                <p className="text-xs font-black text-slate-900 uppercase mt-1">Main Facility Hub</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
