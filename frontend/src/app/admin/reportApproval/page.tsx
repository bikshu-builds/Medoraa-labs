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
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
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
                    <span className="text-xs font-bold text-slate-700">{row.patientName}</span>
                    <span className="text-[10px] font-medium text-slate-400">{row.testName}</span>
                </div>
            )
        },
        { 
            header: "Analyst", 
            accessor: "generatedBy" as const,
            render: (row: Report) => (
                <span className="text-xs font-bold text-slate-500">{row.generatedBy}</span>
            )
        }
    ];

    const actions = (row: Report) => (
        <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                <Eye className="w-4 h-4" />
            </button>
            <button 
                onClick={() => handleAction(row._id, 'approve')}
                className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all"
            >
                <CheckCircle className="w-3.5 h-3.5" />
                Approve
            </button>
            <button 
                onClick={() => handleAction(row._id, 'reject')}
                className="flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
            >
                <XCircle className="w-3.5 h-3.5" />
                Reject
            </button>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Report Verification</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Final clinical validation of laboratory findings before patient release.</p>
                </div>
                <div className="p-1 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-1">
                    <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Pending Approval ({reports.length})</button>
                    <button className="px-4 py-2 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all">Validated Logs</button>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-2">
                <Table 
                    columns={columns} 
                    data={reports} 
                    actions={actions}
                />
            </div>

            <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white flex items-center justify-between overflow-hidden relative">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[80px] -translate-y-1/2 translate-x-1/4" />
                <div className="relative z-10 flex items-center gap-8">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight">Security Protocol Active</h2>
                        <p className="text-blue-100 text-sm font-medium mt-1 max-w-md">Approved reports are digitally signed and immutable. All validations are recorded in the audit trail.</p>
                    </div>
                </div>
                <div className="relative z-10">
                    <button className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all">
                        Bulk Validation Mode
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportApprovalPage;
