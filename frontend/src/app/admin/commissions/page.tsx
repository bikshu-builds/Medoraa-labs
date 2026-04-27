"use client";
import React, { useEffect, useState } from "react";
import Table from "../components/Table";
import { CircleDollarSign, Calendar, TrendingUp, Download, CheckCircle, Clock, Wallet, FileText } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { Commission } from "../types";
import { cn } from "@/lib/utils";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const CommissionManagement: React.FC = () => {
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCommissions = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/commission"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setCommissions(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch commissions", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCommissions();
    }, []);

    const handleMarkPaid = async (row: Commission) => {
        if (row.status === "Paid") return;
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl(`/api/admin/commission/pay/${row.doctor._id}`), {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    month: row.month,
                    totalCommission: row.totalCommission,
                    patientCount: row.patientCount,
                    commissionPercentage: row.commissionPercentage
                })
            });
            if (res.ok) {
                fetchCommissions(); // Refresh data
            }
        } catch (err) {
            console.error("Failed to mark as paid", err);
        }
    };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(commissions.map(r => ({
            "Medical Partner": r.doctor.name,
            "Referral Count": r.patientCount,
            "Incentive Rate": `${r.commissionPercentage}%`,
            "Net Payable": `₹${r.totalCommission}`,
            "Billing Period": r.month,
            "Payout Status": r.status
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger");
        XLSX.writeFile(workbook, "Commission_Ledger.xlsx");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Settlements & Payouts Ledger", 14, 15);
        autoTable(doc, {
            head: [['Medical Partner', 'Referral Count', 'Incentive Rate', 'Net Payable', 'Billing Period', 'Payout Status']],
            body: commissions.map(r => [
                r.doctor.name,
                r.patientCount,
                `${r.commissionPercentage}%`,
                `Rs. ${r.totalCommission}`,
                r.month,
                r.status
            ]),
            startY: 20
        });
        doc.save("Commission_Ledger.pdf");
    };

    const columns = [
        { 
            header: "Medical Partner", 
            accessor: "doctor" as const,
            render: (row: Commission) => (
                <div className="flex flex-col">
                    <span className="font-black text-slate-900 tracking-tight text-base leading-none mb-1">{row.doctor.name}</span>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Preferred Physician</span>
                </div>
            )
        },
        { 
            header: "Referral Count", 
            accessor: "patientCount" as const,
            render: (row: Commission) => (
                <div className="flex items-center gap-3">
                    <span className="font-black text-slate-800 text-base">{row.patientCount}</span>
                    <div className="bg-emerald-50 p-1 rounded-lg border border-emerald-100">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                </div>
            )
        },
        { 
            header: "Incentive Rate", 
            accessor: "commissionPercentage" as const,
            render: (row: Commission) => (
                <div className="flex items-center gap-2 font-black text-slate-600 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {row.commissionPercentage}%
                </div>
            )
        },
        { 
            header: "Net Payable", 
            accessor: "totalCommission" as const,
            render: (row: Commission) => (
                <span className="text-lg font-black text-slate-900 tracking-tight">₹{row.totalCommission.toLocaleString()}</span>
            )
        },
        { 
            header: "Billing Period", 
            accessor: "month" as const,
            render: (row: Commission) => (
                <div className="flex items-center gap-2 text-slate-500 font-bold text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 w-fit">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {row.month}
                </div>
            )
        },
        { 
            header: "Payout Status", 
            accessor: "status" as const,
            render: (row: Commission) => (
                <button 
                    onClick={() => handleMarkPaid(row)}
                    disabled={row.status === "Paid"}
                    className={cn(
                        "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit transition-all",
                        row.status === "Paid" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100 opacity-100 cursor-default" 
                        : "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100 active:scale-95 cursor-pointer"
                    )}
                >
                    {row.status === "Paid" ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {row.status === "Paid" ? "Paid" : "Mark as Paid"}
                </button>
            )
        }
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculating Settlements...</p>
            </div>
        );
    }

    const stats = {
        totalOutstanding: commissions.filter(c => c.status !== 'Paid').reduce((acc, curr) => acc + curr.totalCommission, 0),
        settled: commissions.filter(c => c.status === 'Paid').reduce((acc, curr) => acc + curr.totalCommission, 0),
        avgPayoutRate: commissions.length > 0 ? (commissions.reduce((acc, curr) => acc + curr.commissionPercentage, 0) / commissions.length).toFixed(1) : 0
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Settlements & Payouts</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Manage monthly physician incentives and referral performance audit</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleExportExcel} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-sm hover:bg-slate-50 transition-all active:scale-95">
                        <Download className="w-3.5 h-3.5" />
                        Export Excel
                    </button>
                    <button onClick={handleExportPDF} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95">
                        <FileText className="w-3.5 h-3.5" />
                        Export PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-rose-200 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                        </div>
                        <TrendingUp className="w-6 h-6 text-slate-100 group-hover:text-rose-50 transition-colors" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Outstanding</p>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">₹{stats.totalOutstanding.toLocaleString()}</h2>
                    <div className="mt-2 flex items-center gap-1.5 text-rose-600">
                        <span className="text-[9px] font-bold">Pending Verification</span>
                    </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-200 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <CircleDollarSign className="w-4 h-4" />
                        </div>
                        <TrendingUp className="w-6 h-6 text-slate-100 group-hover:text-blue-50 transition-colors" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Average Payout Rate</p>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{stats.avgPayoutRate}%</h2>
                    <div className="mt-2 flex items-center gap-1.5 text-blue-600">
                        <span className="text-[9px] font-bold">Platform Standard</span>
                    </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 text-emerald-400 flex items-center justify-center">
                            <Wallet className="w-4 h-4" />
                        </div>
                        <CheckCircle className="w-6 h-6 text-slate-800 group-hover:text-slate-700 transition-colors" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Settled this month</p>
                    <h2 className="text-xl font-black text-white tracking-tight">₹{stats.settled.toLocaleString()}</h2>
                    <div className="mt-2 flex items-center gap-1.5 text-emerald-400">
                        <span className="text-[9px] font-bold">Payment Accuracy: 100%</span>
                    </div>
                </div>
            </div>

            <Table 
                columns={columns} 
                data={commissions} 
            />
        </div>
    );
}

export default CommissionManagement;
