"use client";
import React from "react";
import { 
    Bell, 
    Clock, 
    AlertCircle, 
    Info, 
    CheckCircle2, 
    MoreHorizontal,
    Search,
    Filter,
    Activity,
    FlaskConical,
    Truck
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StaffNotifications() {
    const notifications = [
        { id: 1, type: "Urgent", title: "New Stat Sample Received", desc: "Patient: Rahul Sharma (SMP-782104) requires immediate analysis.", time: "10 mins ago", icon: FlaskConical, color: "rose" },
        { id: 2, type: "Task", title: "Collection Route Assigned", desc: "You have 4 new home collection requests in South Zone.", time: "45 mins ago", icon: Truck, color: "blue" },
        { id: 3, type: "System", title: "Report Dispatch Successful", desc: "Anita Devi's thyroid profile has been sent via Email/WhatsApp.", time: "2 hours ago", icon: CheckCircle2, color: "emerald" },
        { id: 4, type: "Info", title: "Monthly Performance Ready", desc: "Your clinical accuracy report for March is now available.", time: "1 day ago", icon: Info, color: "indigo" }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                        <Bell className="w-10 h-10 text-blue-600" />
                        Staff Alerts
                    </h1>
                    <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-widest">Real-time Clinical & Operational Updates</p>
                </div>
                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-6 py-3 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-all">
                    Mark All Read
                </button>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-fit">
                {["All", "Urgent", "Tasks", "System"].map((f) => (
                    <button 
                        key={f}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            f === "All" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-4">
                {notifications.map((notif) => (
                    <div key={notif.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group flex items-start gap-8 relative overflow-hidden">
                        <div className={cn(
                            "w-16 h-16 rounded-[2rem] flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg",
                            notif.color === "rose" ? "bg-rose-50 text-rose-500 shadow-rose-900/5" :
                            notif.color === "blue" ? "bg-blue-50 text-blue-600 shadow-blue-900/5" :
                            notif.color === "emerald" ? "bg-emerald-50 text-emerald-500 shadow-emerald-900/5" :
                            "bg-indigo-50 text-indigo-600 shadow-indigo-900/5"
                        )}>
                            <notif.icon className="w-8 h-8" />
                        </div>

                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{notif.title}</h3>
                                <div className="flex items-center gap-2 text-slate-300">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{notif.time}</span>
                                </div>
                            </div>
                            <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-2xl">{notif.desc}</p>
                            <div className="pt-4 flex items-center gap-4">
                                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline underline-offset-4">View Task</button>
                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Dismiss</button>
                            </div>
                        </div>

                        <button className="p-3 text-slate-200 hover:text-slate-400 transition-all">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
