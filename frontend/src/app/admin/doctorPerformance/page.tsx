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
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-xs border border-white/10 shadow-lg">
                        {row.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <span className="font-bold text-slate-900 block">{row.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Board Certified</span>
                    </div>
                </div>
            )
        },
        { 
            header: "Clinical Volume", 
            accessor: "patientCount" as const,
            render: (row: Performance) => (
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-black text-slate-900">{row.patientCount} Patients</span>
                    <div className="w-32 bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full" style={{ width: `${Math.min(100, (row.patientCount / 50) * 100)}%` }} />
                    </div>
                </div>
            )
        },
        { 
            header: "Revenue Impact", 
            accessor: "totalRevenue" as const,
            render: (row: Performance) => (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900">₹{row.totalRevenue.toLocaleString()}</span>
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
                    "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit",
                    row.patientCount > 30 ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-slate-50 text-slate-600 border-slate-100"
                )}>
                    {row.patientCount > 30 ? <Star className="w-3 h-3 fill-amber-500" /> : <Award className="w-3 h-3" />}
                    {row.patientCount > 30 ? "Premium Partner" : "Standard Tier"}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Referral Analytics</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Tracking doctor contributions and referral efficiency.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-xs text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                        Quarterly Summary
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95">
                        <UserPlus className="w-4 h-4" />
                        Partner Onboarding
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: "Active Partners", value: performance.length, icon: Stethoscope, color: "blue" },
                    { label: "Total Case Volume", value: performance.reduce((acc, p) => acc + p.patientCount, 0), icon: Briefcase, color: "indigo" },
                    { label: "Retention Rate", value: "94.2%", icon: TrendingUp, color: "emerald" }
                ].map((item, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center mb-6",
                            item.color === 'blue' ? "bg-blue-50 text-blue-600" :
                            item.color === 'indigo' ? "bg-indigo-50 text-indigo-600" :
                            "bg-emerald-50 text-emerald-600"
                        )}>
                            <item.icon className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{item.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{item.value}</h3>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-2">
                <Table 
                    columns={columns} 
                    data={performance} 
                />
            </div>
        </div>
    );
};

export default DoctorPerformancePage;
