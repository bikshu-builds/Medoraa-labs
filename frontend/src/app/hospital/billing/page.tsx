"use client";
import React, { useEffect, useState } from "react";
import { getApiUrl } from "@/lib/api";
import {
    Activity,
    DollarSign,
    FileText,
    TrendingUp,
    RefreshCw,
    Download,
    CheckCircle2,
    XCircle,
    Loader2
} from "lucide-react";

interface OrderItem {
    _id: string;
    bookingId: string;
    patientName: string;
    patientAge: number;
    patientGender: string;
    status: string;
    invoiceAmount: number;
    invoiceStatus: string;
    createdAt: string;
}

export default function BillingHistoryPage() {
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("hospitalToken");
            const res = await fetch(getApiUrl("/api/hospital/orders"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setOrders(data.data);
            }
        } catch (err) {
            console.error("Error loading billing history", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePayInvoice = async (id: string) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("hospitalToken");
            const res = await fetch(getApiUrl(`/api/hospital/orders/invoice-status/${id}`), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ invoiceStatus: "Paid" })
            });
            const data = await res.json();
            if (data.success) {
                alert("Invoice payment status updated to Paid!");
                loadOrders();
            } else {
                alert(data.message || "Failed to update invoice payment status");
            }
        } catch (err) {
            console.error("Failed completing invoice payment", err);
            alert("Error updating invoice status. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    let totalPaid = 0;
    let totalUnpaid = 0;
    orders.forEach(order => {
        if (order.invoiceStatus === "Paid") {
            totalPaid += order.invoiceAmount || 0;
        } else {
            totalUnpaid += order.invoiceAmount || 0;
        }
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-blue-600" /> B2B Partner Billing Summary
                    </h1>
                    <p className="text-sm font-bold text-slate-500 mt-1">Review testing invoices, check monthly utilization, and manage credit cycles.</p>
                </div>
                <button
                    onClick={loadOrders}
                    className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-700 active:scale-95 transition-all"
                >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
                </button>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-start">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Billed Usage</span>
                        <h3 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">₹{totalPaid + totalUnpaid}</h3>
                        <span className="text-xs text-blue-600 font-bold block mt-2 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Cumulative total
                        </span>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <DollarSign className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-start">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Paid</span>
                        <h3 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">₹{totalPaid}</h3>
                        <span className="text-xs text-emerald-600 font-bold block mt-2 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> All clear invoices
                        </span>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-start">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Outstanding Balance</span>
                        <h3 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">₹{totalUnpaid}</h3>
                        <span className="text-xs text-rose-600 font-bold block mt-2 flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Unpaid dues
                        </span>
                    </div>
                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                        <XCircle className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Invoices Detailed Grid / List */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Invoice Transaction History</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Invoice Ref</th>
                                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Patient Details</th>
                                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Status</th>
                                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Invoice Amount</th>
                                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Created Date</th>
                                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {orders.length > 0 ? (
                                orders.map(order => (
                                    <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3.5 px-4 text-xs font-bold font-mono text-blue-600">{order.bookingId}</td>
                                        <td className="py-3.5 px-4 text-xs font-black text-slate-800">
                                            {order.patientName} <span className="font-bold text-slate-400">({order.patientAge}y, {order.patientGender})</span>
                                        </td>
                                        <td className="py-3.5 px-4 text-xs">
                                            <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider ${
                                                order.invoiceStatus === "Paid" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                                            }`}>
                                                {order.invoiceStatus}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-xs font-black text-slate-800">₹{order.invoiceAmount}</td>
                                        <td className="py-3.5 px-4 text-xs font-bold text-slate-400">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-3.5 px-4 text-xs text-center">
                                            {order.invoiceStatus !== "Paid" && (
                                                <button
                                                    onClick={() => handlePayInvoice(order._id)}
                                                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm transition-all flex items-center gap-1 mx-auto active:scale-95"
                                                >
                                                    <CheckCircle2 className="w-3 h-3" /> Mark paid
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-400 font-bold text-sm">
                                        No invoices recorded.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
