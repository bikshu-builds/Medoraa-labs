"use client";
import React, { useState, useEffect } from "react";
import Table from "../components/Table";
import { 
    DollarSign, 
    CreditCard, 
    TrendingUp, 
    Clock, 
    FileText, 
    Search, 
    Download,
    ArrowUpRight,
    ArrowDownRight,
    Wallet
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface BillingRecord {
    _id: string;
    invoiceId: string;
    patientName: string;
    testName: string;
    totalAmount: number;
    paymentMethod: string;
    status: 'Paid' | 'Pending' | 'Failed' | 'Unpaid' | 'Partially Paid';
    paymentDate: string;
}

const BillingPage = () => {
    const [records, setRecords] = useState<BillingRecord[]>([]);
    const [stats, setStats] = useState<any>({ bySource: { "Walk-in": 0, "Referring Doctor": 0, "Home Collection": 0 } });
    const [isLoading, setIsLoading] = useState(true);

    const fetchBilling = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const [bRes, sRes] = await Promise.all([
                fetch(getApiUrl("/api/admin/billing"), { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(getApiUrl("/api/admin/revenue"), { headers: { "Authorization": `Bearer ${token}` } })
            ]);
            const bData = await bRes.json();
            const sData = await sRes.json();
            if (bData.success) setRecords(bData.data);
            if (sData.success) setStats(sData.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBilling();
    }, []);

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(records.map(r => ({
            "Invoice Reference": r.invoiceId,
            "Financial Details": `₹${r.totalAmount} (${r.paymentMethod})`,
            "Patient / Subject": `${r.patientName} (${r.testName})`,
            "Settlement Status": r.status,
            "Transaction Date": new Date(r.paymentDate).toLocaleDateString('en-IN')
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Billing Records");
        XLSX.writeFile(workbook, "Billing_Records.xlsx");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Financial Dashboard - Billing Records", 14, 15);
        autoTable(doc, {
            head: [['Invoice Reference', 'Financial Details', 'Patient / Subject', 'Settlement Status', 'Transaction Date']],
            body: records.map(r => [
                r.invoiceId,
                `Rs. ${r.totalAmount} (${r.paymentMethod})`,
                `${r.patientName}\n(${r.testName})`,
                r.status,
                new Date(r.paymentDate).toLocaleDateString('en-IN')
            ]),
            startY: 20
        });
        doc.save("Billing_Records.pdf");
    };

    const columns = [
        { 
            header: "Invoice Reference", 
            accessor: "invoiceId" as const,
            render: (row: BillingRecord) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                        <FileText className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-900">{row.invoiceId}</span>
                </div>
            )
        },
        { 
            header: "Financial Details", 
            accessor: "totalAmount" as const,
            render: (row: BillingRecord) => (
                <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900">₹{row.totalAmount.toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.paymentMethod}</span>
                </div>
            )
        },
        { 
            header: "Patient / Subject", 
            accessor: "patientName" as const,
            render: (row: BillingRecord) => (
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">{row.patientName}</span>
                    <span className="text-[10px] font-medium text-slate-400 truncate max-w-[150px]">{row.testName}</span>
                </div>
            )
        },
        { 
            header: "Settlement Status", 
            accessor: "status" as const,
            render: (row: BillingRecord) => (
                <div className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] w-fit border",
                    row.status === 'Paid' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                    row.status === 'Failed' ? "bg-rose-50 text-rose-700 border-rose-100" :
                    (row.status === 'Unpaid' || row.status === 'Pending') ? "bg-amber-50 text-amber-700 border-amber-100" :
                    "bg-blue-50 text-blue-700 border-blue-100" // E.g., Partially Paid
                )}>
                    {row.status}
                </div>
            )
        },
        { 
            header: "Transaction Date", 
            accessor: "paymentDate" as const,
            render: (row: BillingRecord) => (
                <span className="text-xs font-bold text-slate-500">
                    {row.paymentDate ? new Date(row.paymentDate).toLocaleDateString('en-IN') : "-"}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Revenue oversight, payment settlement, and invoice tracking.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                        <Download className="w-3.5 h-3.5" />
                        Export Excel
                    </button>
                    <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all active:scale-95 shadow-sm">
                        <FileText className="w-3.5 h-3.5" />
                        Export PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 p-4 rounded-xl shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center">
                            <Wallet className="w-4 h-4" />
                        </div>
                        <TrendingUp className="w-6 h-6 text-slate-800 group-hover:text-slate-700 transition-colors" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Revenue</p>
                    <h2 className="text-xl font-black text-white tracking-tight">₹{((stats.totalRevenue) || Object.values(stats.bySource || {}).reduce((a: any, b: any) => a + b, 0) || 0).toLocaleString()}</h2>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-200 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                        </div>
                        <TrendingUp className="w-6 h-6 text-slate-100 group-hover:text-blue-50 transition-colors" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Walk-in Revenue</p>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">₹{(stats.bySource?.["Walk-in"] || 0).toLocaleString()}</h2>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-200 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                            <CreditCard className="w-4 h-4" />
                        </div>
                        <TrendingUp className="w-6 h-6 text-slate-100 group-hover:text-amber-50 transition-colors" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Doctor Referral</p>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">₹{(stats.bySource?.["Referring Doctor"] || 0).toLocaleString()}</h2>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-200 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <DollarSign className="w-4 h-4" />
                        </div>
                        <TrendingUp className="w-6 h-6 text-slate-100 group-hover:text-emerald-50 transition-colors" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Mobile Collection</p>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">₹{(stats.bySource?.["Home Collection"] || 0).toLocaleString()}</h2>
                </div>
            </div>

            <div className="pt-4">
                <Table 
                    columns={columns} 
                    data={records} 
                />
            </div>
        </div>
    );
};

export default BillingPage;
