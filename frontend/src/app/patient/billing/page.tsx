"use client";
import React, { useEffect, useState } from "react";
import { 
    CreditCard, 
    Download, 
    CheckCircle2, 
    Clock, 
    XCircle,
    Loader2,
    DollarSign,
    Receipt,
    Search,
    Filter,
    Calendar,
    FileText
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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
                if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
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

    const downloadInvoice = (bill: any) => {
        const doc = new jsPDF() as any;
        
        // Header
        doc.setFillColor(30, 41, 59);
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("MEDORAA LABS", 20, 25);
        
        doc.setFontSize(10);
        doc.text("Diagnostic Excellence & Care", 20, 32);
        
        doc.setTextColor(255, 255, 255);
        doc.text("INVOICE", 170, 25);
        
        // Bill Info
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        doc.text("Billed To:", 20, 55);
        doc.setFont("helvetica", "bold");
        doc.text(bill.patientName || "Patient", 20, 62);
        
        doc.setFont("helvetica", "normal");
        doc.text("Invoice ID:", 140, 55);
        doc.text(`INV-${bill.invoiceId}`, 170, 55);
        
        doc.text("Date:", 140, 62);
        doc.text(new Date(bill.createdAt).toLocaleDateString(), 170, 62);
        
        doc.text("Status:", 140, 69);
        doc.text(bill.status, 170, 69);

        // Table
        autoTable(doc, {
            startY: 85,
            head: [['Description', 'Amount']],
            body: [
                ['Diagnostic Services / Lab Tests', `INR ${bill.totalAmount}`],
            ],
            theme: 'striped',
            headStyles: { fillColor: [30, 41, 59] },
        });

        const finalY = (doc as any).lastAutoTable?.finalY || 100;

        doc.setFont("helvetica", "bold");
        doc.text("Total Amount:", 140, finalY + 20);
        doc.text(`INR ${bill.totalAmount}`, 180, finalY + 20);

        // Footer
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("This is a computer-generated invoice. No signature required.", 105, 280, { align: "center" });
        doc.text("Thank you for choosing Medoraa Labs.", 105, 285, { align: "center" });

        doc.save(`Invoice_${bill.invoiceId}.pdf`);
    };

    const totalSpent = bills.reduce((acc, curr) => curr.status === "Paid" ? acc + curr.totalAmount : acc, 0);
    const pendingAmount = bills.reduce((acc, curr) => curr.status === "Pending" ? acc + curr.totalAmount : acc, 0);

    if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;

    return (
        <div className="h-full animate-in fade-in duration-500 max-w-[1400px] mx-auto flex flex-col gap-6 pb-10">
            {/* Header & Stats Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2 bg-[#1e293b] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-center min-h-[160px]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight mb-1 relative z-10">Financial Overview</h1>
                        <p className="text-slate-400 text-xs font-medium relative z-10">Manage your payments and invoices securely.</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Total Paid</span>
                    </div>
                    <div className="mt-4">
                        <p className="text-2xl font-bold text-slate-900">₹{totalSpent.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">Across {bills.filter(b => b.status === "Paid").length} Invoices</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">Pending</span>
                    </div>
                    <div className="mt-4">
                        <p className="text-2xl font-bold text-slate-900">₹{pendingAmount.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">{bills.filter(b => b.status === "Pending").length} Unpaid bills</p>
                    </div>
                </div>
            </div>

            {/* History Table Section */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex-1 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Receipt className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">Transaction History</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search Invoice ID..."
                                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-100 outline-none w-48 transition-all"
                            />
                        </div>
                        <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-all">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto no-scrollbar">
                    {bills.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 sticky top-0 z-10 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoice</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Method</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {bills.map((bill) => (
                                    <tr key={bill._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">INV-{bill.invoiceId}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">ID: {bill._id.slice(-8).toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span className="text-xs font-semibold">{new Date(bill.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-xs font-semibold text-slate-600">{bill.paymentMethod}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5",
                                                bill.status === 'Paid' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                bill.status === 'Failed' ? "bg-rose-50 text-rose-600 border border-rose-100" :
                                                "bg-amber-50 text-amber-600 border border-amber-100"
                                            )}>
                                                {bill.status === 'Paid' ? <CheckCircle2 className="w-3 h-3" /> : bill.status === 'Failed' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-slate-900">₹{bill.totalAmount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => downloadInvoice(bill)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all inline-flex items-center gap-2"
                                            >
                                                <Download className="w-4 h-4" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider hidden md:block">Invoice</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200 mb-4">
                                <CreditCard className="w-8 h-8" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900">No Transaction Records</h3>
                            <p className="text-xs text-slate-400 font-medium mt-1 max-w-[200px]">When you book a test, your invoices will be listed here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
