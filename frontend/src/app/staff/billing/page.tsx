"use client";
import React, { useEffect, useState } from "react";
import { 
    CreditCard, 
    Search, 
    Filter, 
    Download, 
    CheckCircle2, 
    Clock, 
    Loader2,
    Activity,
    User,
    ArrowUpRight,
    TrendingUp,
    Wallet,
    ShieldCheck
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function StaffBilling() {
    const [billings, setBillings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetchBilling();
    }, []);

    const fetchBilling = async () => {
        try {
            const token = localStorage.getItem("staffToken");
            const res = await fetch(getApiUrl("/api/staff/billing"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const d = await res.json();
            if (d.success) {
                setBillings(d.data);
                setStats(d.stats);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>;

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Revenue & Billing</h1>
                    <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-widest">Financial Records & Collection Management</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-95 transition-all flex items-center gap-3">
                        <TrendingUp className="w-4 h-4" /> Collection Report
                    </button>
                </div>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <FinCard label="Daily Collection" value={`₹${stats?.dailyCollection || 0}`} icon={Wallet} color="blue" trend="+12% from yesterday" />
                <FinCard label="Cash in Hand" value={stats?.cashInHand || 0} icon={Activity} color="indigo" trend="Invoices" />
                <FinCard label="Digital Payments" value={stats?.digitalPayments || 0} icon={ShieldCheck} color="emerald" trend="UPI / Card" />
                <FinCard label="Outstanding" value={stats?.outstanding || 0} icon={Clock} color="rose" trend="Action Required" />
            </div>

            {/* Filter Section */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 flex items-center gap-4 bg-slate-50 px-8 py-4 rounded-3xl group focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100/50 transition-all border border-transparent focus-within:border-blue-100">
                    <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600" />
                    <input type="text" placeholder="Search Invoices, Patients or Amount..." className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 w-full placeholder:text-slate-300 uppercase tracking-widest" />
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
                        <Filter className="w-4 h-4 text-slate-400" /> Advanced Filter
                    </button>
                </div>
            </div>

            {/* Billing Table */}
            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Ref</th>
                            <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Details</th>
                            <th className="px-10 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                            <th className="px-10 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Mode</th>
                            <th className="px-10 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {billings.map((bill) => (
                            <tr key={bill._id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{bill.invoiceId}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{bill.date}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-3">
                                        <User className="w-4 h-4 text-slate-300" />
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{bill.patientName}</p>
                                    </div>
                                </td>
                                <td className="px-10 py-8 text-center">
                                    <p className="text-base font-black text-slate-900 tracking-tighter">₹{bill.amount}</p>
                                </td>
                                <td className="px-10 py-8 text-center">
                                    <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest">{bill.method}</span>
                                </td>
                                <td className="px-10 py-8 text-center">
                                    <div className={cn(
                                        "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                        bill.status === "Paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                    )}>
                                        <div className={cn("w-1.5 h-1.5 rounded-full", bill.status === "Paid" ? "bg-emerald-500" : "bg-rose-500")} />
                                        {bill.status}
                                    </div>
                                </td>
                                <td className="px-10 py-8 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <button className="p-3 text-slate-300 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button className="p-3 text-slate-300 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                                            <ArrowUpRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function FinCard({ label, value, icon: Icon, color, trend }: any) {
    const colors: any = {
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
        rose: "text-rose-600 bg-rose-50 border-rose-100"
    };

    return (
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm group hover:border-blue-200 transition-all">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:rotate-12", colors[color])}>
                <Icon className="w-7 h-7" />
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</h4>
            <p className="text-3xl font-black text-slate-900 tracking-tight mb-4">{value}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{trend}</p>
        </div>
    );
}
