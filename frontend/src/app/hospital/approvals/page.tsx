"use client";
import React, { useEffect, useState } from "react";
import { getApiUrl } from "@/lib/api";
import {
    Activity,
    ClipboardCheck,
    RefreshCw,
    Search,
    Loader2,
    CheckCircle2,
    ShieldAlert
} from "lucide-react";

interface OrderItem {
    _id: string;
    bookingId: string;
    patientName: string;
    patientAge: number;
    patientGender: string;
    status: string;
    tests: any[];
    testResults: any[];
    approvalStatus?: string;
    approvalComments?: string;
    approvedBy?: string;
}

export default function ApprovalsPortalPage() {
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [activeOrder, setActiveOrder] = useState<OrderItem | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Approval inputs
    const [approvalStatus, setApprovalStatus] = useState("Final Approval");
    const [approvalComments, setApprovalComments] = useState("");
    const [approvedBy, setApprovedBy] = useState("");

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
            console.error("Error loading sample data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const handleOpenOrder = (order: OrderItem) => {
        setActiveOrder(order);
        setApprovalStatus(order.approvalStatus || "Final Approval");
        setApprovalComments(order.approvalComments || "Reviewed and validated by examiner.");
        setApprovedBy(order.approvedBy || "Senior Pathologist");
    };

    const handlePathologyAction = async () => {
        if (!activeOrder) return;
        setIsSaving(true);
        try {
            const token = localStorage.getItem("hospitalToken");
            const res = await fetch(getApiUrl(`/api/hospital/orders/approve/${activeOrder._id}`), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ approvalStatus, approvalComments, approvedBy })
            });
            const data = await res.json();
            if (data.success) {
                alert("Approval status updated successfully!");
                setActiveOrder(data.data);
                await loadOrders();
            } else {
                alert(data.message || "Failed to save approval status");
            }
        } catch (err) {
            console.error("Approval action failed", err);
            alert("Error updating status. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredOrders = orders.filter(o =>
        o.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.bookingId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <ClipboardCheck className="w-6 h-6 text-blue-600" /> Pathology Approvals Layer
                    </h1>
                    <p className="text-xs font-bold text-slate-500 mt-1">Paths, reviewers, and pathologists sign-off and authenticate findings.</p>
                </div>
                <button
                    onClick={loadOrders}
                    className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-700 active:scale-95 transition-all"
                >
                    <RefreshCw className="w-3.5 h-3.5" /> Reload Portal
                </button>
            </div>

            {/* Main Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Orders list */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search Patient name or Booking..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 text-xs bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2 h-[550px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map(order => (
                                <button
                                    key={order._id}
                                    onClick={() => handleOpenOrder(order)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col justify-between h-32 ${
                                        activeOrder?._id === order._id ? "bg-blue-50/50 border-blue-200 shadow-sm" : "bg-white border-slate-100 hover:border-slate-200"
                                    }`}
                                >
                                    <div className="flex justify-between items-start w-full">
                                        <div>
                                            <span className="text-[10px] font-bold font-mono text-blue-600 block">{order.bookingId}</span>
                                            <h4 className="text-sm font-black text-slate-800 tracking-tight mt-1">{order.patientName}</h4>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                                            order.status === "Report Ready" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                            order.status === "Processing" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                            "bg-slate-100 text-slate-600 border border-slate-200"
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="text-[11px] font-bold text-slate-400 mt-2 truncate max-w-full">
                                        Approval: {order.approvalStatus || "Technician Reviewed"}
                                    </div>
                                </button>
                            ))
                        ) : (
                            <p className="text-xs text-slate-400 text-center py-12 font-bold">No samples match filtering criteria.</p>
                        )}
                    </div>
                </div>

                {/* Main Approval Action Workspace */}
                <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                    {activeOrder ? (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* Panel header */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
                                <div>
                                    <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-xl uppercase tracking-wider">Approval Review Session</span>
                                    <h3 className="text-xl font-black text-slate-900 mt-2 tracking-tight">Patient: {activeOrder.patientName}</h3>
                                    <p className="text-xs font-bold text-slate-500 mt-1">
                                        Age: {activeOrder.patientAge}y &bull; Gender: {activeOrder.patientGender} &bull; Booking ID: <span className="font-mono text-blue-600 font-bold">{activeOrder.bookingId}</span>
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${
                                    activeOrder.approvalStatus === "Final Approval" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                    activeOrder.approvalStatus === "Hold" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                    "bg-slate-50 text-slate-500 border-slate-200"
                                }`}>
                                    {activeOrder.approvalStatus || "Technician Reviewed"}
                                </span>
                            </div>

                            {/* Testing Results Preview Panel */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Technician Result Preview</h4>
                                {activeOrder.testResults && activeOrder.testResults.length > 0 ? (
                                    <div className="border border-slate-100 p-4 rounded-2xl bg-slate-50/50">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-slate-200">
                                                        <th className="py-2 text-[9px] font-black uppercase tracking-wider text-slate-400">Parameter</th>
                                                        <th className="py-2 text-[9px] font-black uppercase tracking-wider text-slate-400">Value</th>
                                                        <th className="py-2 text-[9px] font-black uppercase tracking-wider text-slate-400">Unit</th>
                                                        <th className="py-2 text-[9px] font-black uppercase tracking-wider text-slate-400">Ref Range</th>
                                                        <th className="py-2 text-[9px] font-black uppercase tracking-wider text-slate-400">Flag</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {activeOrder.testResults.map((r, i) => (
                                                        <tr key={i} className="text-xs font-bold text-slate-600">
                                                            <td className="py-2 font-black text-slate-800">{r.parameterName}</td>
                                                            <td className="py-2">{r.value}</td>
                                                            <td className="py-2 font-medium">{r.unit}</td>
                                                            <td className="py-2 font-medium">{r.referenceRange}</td>
                                                            <td className="py-2">
                                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                                                                    r.criticalFlag === "Normal" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                                                }`}>
                                                                    {r.criticalFlag}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 font-bold bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        No findings added by technician yet.
                                    </p>
                                )}
                            </div>

                            {/* Path Action Form */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Set Approval Status</h4>
                                    
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status Layer</label>
                                        <select
                                            value={approvalStatus}
                                            onChange={(e) => setApprovalStatus(e.target.value)}
                                            className="w-full px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm text-slate-700"
                                        >
                                            <option value="Final Approval">Final Pathologist Approval</option>
                                            <option value="Pathologist Reviewed">Pathologist Reviewed</option>
                                            <option value="Hold">Hold / Send Back</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pathologist Name</label>
                                        <input
                                            type="text"
                                            value={approvedBy}
                                            onChange={(e) => setApprovedBy(e.target.value)}
                                            placeholder="Doctor name & signature..."
                                            className="w-full px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm text-slate-700"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Conclusion Comments</h4>
                                    
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Approval / Hold Comments</label>
                                        <textarea
                                            value={approvalComments}
                                            onChange={(e) => setApprovalComments(e.target.value)}
                                            className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs focus:bg-white outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={handlePathologyAction}
                                    disabled={isSaving}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Action & Update Report Status"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[450px] flex items-center justify-center text-slate-400 flex-col gap-2 font-bold">
                            <ClipboardCheck className="w-12 h-12 stroke-slate-300 stroke-[1.5] animate-pulse" />
                            <span>Select an active order to begin the review process</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
