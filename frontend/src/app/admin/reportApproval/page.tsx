"use client";
import React, { useState, useEffect } from "react";
import Table from "../components/Table";
import { 
    FileText, 
    CheckCircle, 
    XCircle, 
    Eye, 
    MessageSquare,
    Search,
    Filter,
    ShieldCheck
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Report {
    _id: string;
    reportId: string;
    patientName: string;
    testName: string;
    generatedBy: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}

const ReportApprovalPage = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"Pending" | "Validated">("Pending");

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/reports/pending"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setReports(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl(`/api/admin/reports/${action}/${id}`), {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) fetchReports();
        } catch (err) {
            console.error(err);
        }
    };

    const columns = [
        { 
            header: "Report Identity", 
            accessor: "reportId" as const,
            render: (row: Report) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/60">
                        <FileText className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-900">{row.reportId}</span>
                </div>
            )
        },
        { 
            header: "Clinical Details", 
            accessor: "testName" as const,
            render: (row: Report) => (
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700 leading-snug">{row.patientName}</span>
                    <span className="text-[10px] font-bold text-slate-400 leading-snug">{row.testName}</span>
                </div>
            )
        },
        { 
            header: "Analyst", 
            accessor: "generatedBy" as const,
            render: (row: Report) => (
                <span className="text-xs font-bold text-slate-500 leading-snug">{row.generatedBy}</span>
            )
        }
    ];

    const actions = (row: Report) => (
        <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                <Eye className="w-4 h-4" />
            </button>
            {row.status === "Pending" ? (
                <>
                    <button 
                        onClick={() => handleAction(row._id, 'approve')}
                        className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100/50"
                    >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve
                    </button>
                    <button 
                        onClick={() => handleAction(row._id, 'reject')}
                        className="flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100/50"
                    >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                    </button>
                </>
            ) : (
                <span className={cn(
                    "px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border",
                    row.status === "Approved" 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                        : "bg-rose-50 text-rose-600 border-rose-100"
                )}>
                    {row.status}
                </span>
            )}
        </div>
    );

    const filteredReports = reports.filter(r => {
        if (activeTab === "Pending") return r.status === "Pending";
        return r.status === "Approved" || r.status === "Rejected";
    });

    const pendingCount = reports.filter(r => r.status === "Pending").length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Report Verification</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Final clinical validation of laboratory findings before patient release.</p>
                </div>
                <div className="p-1 bg-white border border-slate-200/60 rounded-2xl shadow-sm flex items-center gap-1 w-fit">
                    <button 
                        onClick={() => setActiveTab("Pending")}
                        className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                            activeTab === "Pending" 
                                ? "bg-slate-900 text-white shadow-sm" 
                                : "text-slate-500 hover:bg-slate-50"
                        )}
                    >
                        Pending Approval ({pendingCount})
                    </button>
                    <button 
                        onClick={() => setActiveTab("Validated")}
                        className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                            activeTab === "Validated" 
                                ? "bg-slate-900 text-white shadow-sm" 
                                : "text-slate-500 hover:bg-slate-50"
                        )}
                    >
                        Validated Logs
                    </button>
                </div>
            </div>

            <div className="overflow-hidden bg-white border border-slate-200/60 rounded-2xl shadow-sm">
                <Table 
                    columns={columns} 
                    data={filteredReports} 
                    actions={actions}
                />
            </div>

            
        </div>
    );
};

export default ReportApprovalPage;
