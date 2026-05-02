"use client";
import React, { useState, useEffect } from "react";
import Table from "../components/Table";
import { 
    UserPlus, 
    BarChart3, 
    TrendingUp, 
    Award, 
    Star, 
    ChevronRight,
    Search,
    Stethoscope,
    Briefcase
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Performance {
    name: string;
    patientCount: number;
    totalRevenue: number;
}

const DoctorPerformancePage = () => {
    const [performance, setPerformance] = useState<Performance[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPerformance = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/doctor-performance"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setPerformance(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPerformance();
    }, []);

    const columns = [
        { 
            header: "Medical Professional", 
            accessor: "name" as const,
            render: (row: Performance) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs border border-white/10 shadow-md shrink-0">
                        {row.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <span className="font-bold text-slate-900 block leading-tight text-sm">{row.name}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Board Certified</span>
                    </div>
                </div>
            )
        },
        { 
            header: "Clinical Volume", 
            accessor: "patientCount" as const,
            render: (row: Performance) => (
                <div className="flex flex-col gap-1 select-none">
                    <span className="text-xs font-black text-slate-800">{row.patientCount} Patients</span>
                    <div className="w-24 bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full" style={{ width: `${Math.min(100, (row.patientCount / 50) * 100)}%` }} />
                    </div>
                </div>
            )
        },
        { 
            header: "Revenue Impact", 
            accessor: "totalRevenue" as const,
            render: (row: Performance) => (
                <div className="flex items-center gap-1.5 select-none">
                    <span className="text-xs font-black text-slate-800">₹{row.totalRevenue.toLocaleString()}</span>
                    <div className="p-1 rounded bg-emerald-50 text-emerald-600">
                        <TrendingUp className="w-3 h-3" />
                    </div>
                </div>
            )
        },
        { 
            header: "Performance Tier", 
            accessor: "patientCount" as const,
            render: (row: Performance) => (
                <div className={cn(
                    "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit select-none",
                    row.patientCount > 30 ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-slate-50 text-slate-600 border-slate-100"
                )}>
                    {row.patientCount > 30 ? <Star className="w-3 h-3 fill-amber-500" /> : <Award className="w-3 h-3" />}
                    {row.patientCount > 30 ? "Premium Partner" : "Standard Tier"}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Referral Analytics</h1>
                    <p className="text-slate-500 text-sm mt-0.5 font-medium">Tracking doctor contributions and referral efficiency.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200/60 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                        Quarterly Summary
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/10 active:scale-95">
                        <UserPlus className="w-3.5 h-3.5" />
                        Partner Onboarding
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                    { label: "Active Partners", value: performance.length, icon: Stethoscope, color: "blue" },
                    { label: "Total Case Volume", value: performance.reduce((acc, p) => acc + p.patientCount, 0), icon: Briefcase, color: "indigo" },
                    { label: "Retention Rate", value: "94.2%", icon: TrendingUp, color: "emerald" }
                ].map((item, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all select-none">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-slate-100/60",
                            item.color === 'blue' ? "bg-blue-50/60 text-blue-600 border-blue-100/50" :
                            item.color === 'indigo' ? "bg-indigo-50/60 text-indigo-600 border-indigo-100/50" :
                            "bg-emerald-50/60 text-emerald-600 border-emerald-100/50"
                        )}>
                            <item.icon className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-relaxed">{item.label}</p>
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{item.value}</h3>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <Table 
                    columns={columns} 
                    data={performance} 
                />
            </div>
        </div>
    );
};

export default DoctorPerformancePage;
