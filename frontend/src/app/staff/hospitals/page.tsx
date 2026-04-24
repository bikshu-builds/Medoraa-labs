"use client";
import React, { useEffect, useState } from "react";
import { 
    Building2, 
    Search, 
    Plus, 
    ChevronRight, 
    Loader2,
    Activity,
    User,
    ArrowUpRight,
    Briefcase,
    MapPin,
    Phone,
    FileText,
    Clock
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function StaffHospitals() {
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchHospitals();
    }, []);

    const fetchHospitals = async () => {
        try {
            const token = localStorage.getItem("staffToken");
            // Mocking B2B hospital data
            setHospitals([
                { _id: "1", name: "City Care Hospital", code: "HOS-001", orders: 12, billing: 45000, status: "Active", contact: "Dr. Sharma" },
                { _id: "2", name: "Lifeline Clinic", code: "HOS-002", orders: 8, billing: 22000, status: "Active", contact: "Dr. Anita" },
                { _id: "3", name: "Wellness Center", code: "HOS-003", orders: 5, billing: 12500, status: "Pending", contact: "Mr. Gupta" }
            ]);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>;

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Hospital Partnerships</h1>
                    <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-widest">B2B Order Management & Institutional Billing</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-95 transition-all flex items-center gap-3">
                        <Plus className="w-4 h-4" /> Register Hospital
                    </button>
                </div>
            </div>

            {/* B2B Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <B2BStat label="Total Partners" value="24" icon={Building2} color="blue" />
                <B2BStat label="Monthly Orders" value="156" icon={FileText} color="indigo" />
                <B2BStat label="Total B2B Revenue" value="₹4.2L" icon={Activity} color="emerald" />
            </div>

            {/* Hospital List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {hospitals.map((hospital) => (
                    <div key={hospital._id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group relative overflow-hidden">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                    <Building2 className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{hospital.name}</h3>
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{hospital.code}</p>
                                </div>
                            </div>
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                hospital.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                            )}>
                                {hospital.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="p-4 bg-slate-50 rounded-2xl">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Orders</p>
                                <p className="text-lg font-black text-slate-900">{hospital.orders}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Billing</p>
                                <p className="text-lg font-black text-slate-900">₹{hospital.billing}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                            <div className="flex items-center gap-4 text-slate-400">
                                <div className="flex items-center gap-2">
                                    <User className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{hospital.contact}</span>
                                </div>
                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">L.O: 2h ago</span>
                                </div>
                            </div>
                            <button className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:translate-x-1 transition-all">
                                Manage Dashboard <ArrowUpRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function B2BStat({ label, value, icon: Icon, color }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100"
    };

    return (
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex items-center gap-8 group hover:border-blue-200 transition-all">
            <div className={cn("w-16 h-16 rounded-[2rem] flex items-center justify-center transition-transform group-hover:scale-110", colors[color])}>
                <Icon className="w-8 h-8" />
            </div>
            <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</h4>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
            </div>
        </div>
    );
}
