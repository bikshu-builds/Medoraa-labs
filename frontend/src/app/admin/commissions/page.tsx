"use client";
import React, { useEffect, useState } from "react";
import Table from "../components/Table";
import { CircleDollarSign, Calendar, TrendingUp, Download, CheckCircle, Clock, Wallet } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { Commission } from "../types";
import { cn } from "@/lib/utils";

const CommissionManagement: React.FC = () => {
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
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

        fetchCommissions();
    }, []);

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
                <div className={cn(
                    "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit",
                    row.status === "Paid" 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                    : "bg-amber-50 text-amber-700 border-amber-100"
                )}>
                    {row.status === "Paid" ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {row.status}
                </div>
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

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Settlements & Payouts</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage monthly physician incentives and referral performance audit</p>
                </div>
                <button className="flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 hover:bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-slate-900/10 transition-all active:scale-95 group">
                    <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                    Export Ledger
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border-2 border-blue-50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-[40px] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Outstanding</p>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-4">₹2,84,500</h3>
                    <div className="flex items-center gap-2 text-rose-600 text-[10px] font-black bg-rose-50 px-3 py-1 rounded-lg border border-rose-100 w-fit uppercase tracking-widest">
                        Pending Verification
                    </div>
                </div>
                
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm flex flex-col justify-between group">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Average Payout Rate</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">12.5%</h3>
                    <p className="text-[10px] text-slate-500 font-bold mt-4 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        Platform Standard
                    </p>
                </div>

                <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-600/10 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                    <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest mb-1">Settled this month</p>
                    <h3 className="text-3xl font-black tracking-tight">₹8.42L</h3>
                    <div className="mt-4 flex items-center gap-2 text-emerald-200 text-xs font-bold">
                        <Wallet className="w-4 h-4" />
                        Payment Accuracy: 100%
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
