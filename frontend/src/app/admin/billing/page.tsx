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

interface BillingRecord {
    _id: string;
    invoiceId: string;
    patientName: string;
    testName: string;
    totalAmount: number;
    paymentMethod: string;
    status: 'Paid' | 'Pending' | 'Failed';
    paymentDate: string;
}

const BillingPage = () => {
    const [records, setRecords] = useState<BillingRecord[]>([]);
    const [stats, setStats] = useState({ totalRevenue: 0, pendingPayments: 0 });
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
                    "bg-amber-50 text-amber-700 border-amber-100"
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
                <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-[1.25rem] font-bold text-xs hover:bg-slate-800 transition-all active:scale-95 shadow-2xl shadow-slate-900/20">
                    <Download className="w-4 h-4" />
                    Consolidated Export
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-blue-600/5 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-20 h-20 text-blue-600" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Gross Revenue</p>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">₹{stats.totalRevenue.toLocaleString()}</h2>
                        <div className="mt-4 flex items-center gap-2 text-emerald-500">
                            <ArrowUpRight className="w-4 h-4" />
                            <span className="text-[11px] font-bold">+12.4% vs last month</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-amber-600/5 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock className="w-20 h-20 text-amber-600" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Unsettled Balance</p>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">₹{stats.pendingPayments.toLocaleString()}</h2>
                        <div className="mt-4 flex items-center gap-2 text-amber-500">
                            <ArrowUpRight className="w-4 h-4" />
                            <span className="text-[11px] font-bold">14 invoices pending</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-2 overflow-hidden">
                <Table 
                    columns={columns} 
                    data={records} 
                />
            </div>
        </div>
    );
};

export default BillingPage;
