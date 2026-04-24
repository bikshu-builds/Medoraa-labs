"use client";
import React, { useEffect, useState } from "react";
import { 
    CreditCard, 
    Download, 
    ChevronRight, 
    CheckCircle2, 
    Clock, 
    XCircle,
    Loader2,
    DollarSign
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function PatientBilling() {
    const [bills, setBills] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const token = localStorage.getItem("patientToken");
                const res = await fetch(getApiUrl("/api/patient/billing"), {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const d = await res.json();
                if (d.success) setBills(d.data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBills();
    }, []);

    if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Records</h1>
                    <p className="text-slate-500 font-bold mt-1">Manage your invoices, payments, and billing history.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {bills.length > 0 ? (
                    bills.map((bill) => (
                        <div key={bill._id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/40 transition-all group flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                                        <CreditCard className="w-7 h-7" />
                                    </div>
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                        bill.status === 'Paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                        bill.status === 'Failed' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                        "bg-amber-50 text-amber-600 border-amber-100"
                                    )}>
                                        {bill.status}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">INV-{bill.invoiceId}</h3>
                                <div className="flex items-center gap-3 text-slate-400 mb-8">
                                    <span className="text-[10px] font-black uppercase tracking-widest">{new Date(bill.createdAt).toLocaleDateString()}</span>
                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{bill.paymentMethod}</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</span>
                                    <span className="text-2xl font-black text-slate-900">₹{bill.totalAmount}</span>
                                </div>
                                <button className="p-4 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl transition-all shadow-sm">
                                    <Download className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm text-center">
                        <CreditCard className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-slate-900">No invoices yet</h3>
                        <p className="text-slate-400 font-bold mt-2">When you book a test, your invoices will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
