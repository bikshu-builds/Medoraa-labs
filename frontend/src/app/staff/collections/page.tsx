"use client";
import React, { useEffect, useState } from "react";
import { 
    Truck, 
    MapPin, 
    User, 
    Phone, 
    ChevronRight, 
    CheckCircle2, 
    Clock, 
    Navigation, 
    MoreVertical,
    Search,
    Loader2,
    Calendar,
    Activity,
    CreditCard
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function StaffCollections() {
    const [collections, setCollections] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("Assigned");

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            const token = localStorage.getItem("staffToken");
            const res = await fetch(getApiUrl("/api/staff/collections"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const d = await res.json();
            if (d.success) setCollections(d.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            const token = localStorage.getItem("staffToken");
            const res = await fetch(getApiUrl("/api/staff/update-collection"), {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ collectionId: id, status })
            });
            const d = await res.json();
            if (d.success) fetchCollections();
        } catch (err) {
            console.error(err);
        }
    };

    if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Home Collections</h1>
                    <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-widest">Assigned Routes & Patient Appointments</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-1">
                        {["Assigned", "On the way", "Collected"].map((s) => (
                            <button 
                                key={s}
                                onClick={() => setFilter(s)}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    filter === s ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Collection Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {collections.filter(c => filter === "All" || c.status === filter).map((item) => (
                    <div key={item._id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all flex flex-col group overflow-hidden">
                        {/* Map Preview / Visual */}
                        <div className="h-40 bg-slate-100 relative overflow-hidden">
                            <div className="absolute inset-0 bg-blue-600/5 flex items-center justify-center">
                                <Navigation className="w-12 h-12 text-blue-200 animate-pulse" />
                            </div>
                            <div className="absolute top-6 right-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 border border-white shadow-sm flex items-center gap-2">
                                <Clock className="w-3 h-3 text-blue-600" />
                                {item.timeSlot}
                            </div>
                            <div className="absolute bottom-6 left-6 flex items-center gap-2">
                                <span className={cn(
                                    "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg",
                                    item.status === "Assigned" ? "bg-blue-600 text-white" : 
                                    item.status === "On the way" ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
                                )}>
                                    {item.status}
                                </span>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Patient Info */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-lg shadow-sm border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        {item.booking.patientName[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none mb-2">{item.booking.patientName}</h3>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Phone className="w-3 h-3" />
                                            <span className="text-[10px] font-black tracking-widest">{item.booking.patient?.phoneNumber || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-all">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Address & Tests */}
                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                                    <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                    <p className="text-[11px] font-bold text-slate-500 leading-relaxed">42, Medoraa Tower, Tech Park, Whitefield, Bangalore - 560066</p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {item.booking.tests.map((test: any) => (
                                        <span key={test._id} className="px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                                            {test.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-8 border-t border-slate-50 flex items-center gap-4">
                                {item.status === "Assigned" && (
                                    <button 
                                        onClick={() => updateStatus(item._id, "On the way")}
                                        className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        <Navigation className="w-4 h-4" /> Start Trip
                                    </button>
                                )}
                                {item.status === "On the way" && (
                                    <button 
                                        onClick={() => updateStatus(item._id, "Collected")}
                                        className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Mark Collected
                                    </button>
                                )}
                                {item.status === "Collected" && (
                                    <div className="flex-1 flex items-center justify-center gap-2 py-4 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                                        <CheckCircle2 className="w-4 h-4" /> Successfully Collected
                                    </div>
                                )}
                                <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-white hover:text-blue-600 hover:shadow-md transition-all border border-transparent hover:border-slate-100">
                                    <Activity className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
