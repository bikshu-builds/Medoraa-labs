"use client";
import React, { useState, useEffect } from "react";
import Table from "../components/Table";
import { 
    Clock, 
    Search, 
    Filter, 
    ShieldAlert, 
    User,
    Globe,
    Terminal
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Log {
    _id: string;
    adminName: string;
    action: string;
    module: string;
    timestamp: string;
    ipAddress: string;
    description: string;
}

const ActivityLogsPage = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<string>("All");

    const tabs = ["All", "Admin", "Staff", "Patient", "Hospital"];

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/activity-logs"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setLogs(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => {
        const matchesSearch = 
            log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.module.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;
        if (activeTab === "All") return true;

        const module = (log.module || "").toLowerCase();
        const desc = (log.description || "").toLowerCase();

        if (activeTab === "Admin") {
            return module.includes("role") || module.includes("setting") || module.includes("notification") || 
                module.includes("alert") || module.includes("commission") || module.includes("source-tracking") || 
                desc.includes("role") || desc.includes("setting") || desc.includes("notification") || desc.includes("commission");
        }
        if (activeTab === "Staff") {
            return module.includes("staff") || module.includes("employee") || module.includes("doctor") || 
                module.includes("home-collection") || module.includes("homecollection") || 
                desc.includes("staff") || desc.includes("employee") || desc.includes("doctor");
        }
        if (activeTab === "Patient") {
            return module.includes("patient") || module.includes("booking") || module.includes("billing") || 
                module.includes("report") || module.includes("package") || module.includes("test") || 
                desc.includes("patient") || desc.includes("booking") || desc.includes("billing") || 
                desc.includes("report") || desc.includes("test");
        }
        if (activeTab === "Hospital") {
            return module.includes("hospital") || desc.includes("hospital");
        }
        return true;
    });

    const columns = [
        { 
            header: "Admin / Executor", 
            accessor: "adminName" as const,
            render: (row: Log) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                        <User className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-900">{row.adminName}</span>
                </div>
            )
        },
        { 
            header: "Action Details", 
            accessor: "description" as const,
            render: (row: Log) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border",
                            row.action === 'CREATE' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                            row.action === 'DELETE' ? "bg-rose-50 text-rose-700 border-rose-100" :
                            "bg-blue-50 text-blue-700 border-blue-100"
                        )}>
                            {row.action}
                        </span>
                        <span className="text-xs font-bold text-slate-700">{row.module}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium truncate max-w-[300px]">{row.description}</p>
                </div>
            )
        },
        { 
            header: "Connectivity", 
            accessor: "ipAddress" as const,
            render: (row: Log) => (
                <div className="flex items-center gap-2 text-slate-400">
                    <Globe className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono font-bold tracking-tight">{row.ipAddress || "127.0.0.1"}</span>
                </div>
            )
        },
        { 
            header: "Timestamp", 
            accessor: "timestamp" as const,
            render: (row: Log) => (
                <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold">{new Date(row.timestamp).toLocaleString()}</span>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Trail</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Complete immutable history of all administrative operations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Filter by admin or action..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-1 focus:ring-blue-500 transition-all w-64"
                        />
                    </div>
                    <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-colors">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex items-center justify-between overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-blue-400">
                        <ShieldAlert className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight">Real-time Compliance Monitoring</h2>
                        <p className="text-slate-400 text-sm font-medium">All sessions are currently being tracked and recorded under protocol v2.4</p>
                    </div>
                </div>
                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">System Secure</span>
                        <span className="text-[10px] font-mono text-slate-500">Node_Ref: MED-LAB-01</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-slate-200/60 gap-1 select-none overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-6 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all whitespace-nowrap",
                            activeTab === tab
                                ? "border-blue-600 text-blue-600 bg-blue-50/30"
                                : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <Table 
                columns={columns} 
                data={filteredLogs} 
            />
        </div>
    );
};

export default ActivityLogsPage;
