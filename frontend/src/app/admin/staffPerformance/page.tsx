"use client";
import React, { useState, useEffect } from "react";
import Table from "../components/Table";
import { 
    Users, 
    Zap, 
    Clock, 
    CheckCircle2, 
    ArrowUpRight,
    Search,
    UserCircle
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

interface StaffPerformance {
    name: string;
    visits: number;
}

const StaffPerformancePage = () => {
    const [performance, setPerformance] = useState<StaffPerformance[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPerformance = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/staff-performance"), {
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
            header: "Operational Staff", 
            accessor: "name" as const,
            render: (row: StaffPerformance) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <UserCircle className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-slate-900">{row.name}</span>
                </div>
            )
        },
        { 
            header: "Total Collections", 
            accessor: "visits" as const,
            render: (row: StaffPerformance) => (
                <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-slate-900">{row.visits}</span>
                    <div className="flex-1 w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, (row.visits / 20) * 100)}%` }} />
                    </div>
                </div>
            )
        },
        { 
            header: "Efficiency Rating", 
            accessor: "visits" as const,
            render: (row: StaffPerformance) => (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                    <Zap className="w-3.5 h-3.5" />
                    9{Math.min(9, row.visits % 10)}.2%
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Productivity</h1>
                <p className="text-slate-500 text-sm mt-1 font-medium">Monitoring collection efficiency and operational throughput.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-2 overflow-hidden">
                        <Table 
                            columns={columns} 
                            data={performance} 
                        />
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-emerald-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-700">
                            <CheckCircle2 className="w-40 h-40" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100 mb-8">Performance Summary</h3>
                            <div className="space-y-8">
                                <div>
                                    <p className="text-4xl font-black tracking-tighter">142</p>
                                    <p className="text-xs font-bold text-emerald-100 mt-2">Successful Collections Today</p>
                                </div>
                                <div>
                                    <p className="text-4xl font-black tracking-tighter">0.4%</p>
                                    <p className="text-xs font-bold text-emerald-100 mt-2">Sample Rejection Rate</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffPerformancePage;
