"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";
import {
    Activity,
    Clipboard,
    FileCheck,
    AlertCircle,
    ArrowRight,
    TrendingUp,
    RefreshCw
} from "lucide-react";

interface DashboardStats {
    totalOrders: number;
    pendingReports: number;
    completedReports: number;
    pendingBilling: number;
    monthlyRevenue: number;
    recentRequests: any[];
}

export default function HospitalDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("hospitalToken");
            const res = await fetch(getApiUrl("/api/hospital/dashboard"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (err) {
            console.error("Failed to load dashboard stats", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-12 bg-slate-200 rounded-xl w-48"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Top greeting */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        Welcome Back B2B Partner <SparklesIcon className="w-6 h-6 text-yellow-500" />
                    </h1>
                    <p className="text-sm font-bold text-slate-500 mt-1">Manage your patient orders, track sample collection, and view diagnostic billing.</p>
                </div>
                <button
                    onClick={fetchStats}
                    className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-700 active:scale-95 transition-all"
                >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
            </div>

            {/* Widgets Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Total Orders Widget */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full translate-x-1/3 -translate-y-1/3 blur-xl group-hover:scale-110 transition-transform" />
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Requests</span>
                            <h3 className="text-4xl font-black text-slate-900 mt-2 tracking-tight">{stats?.totalOrders || 0}</h3>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <Clipboard className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs text-blue-600 font-bold">
                        <TrendingUp className="w-3.5 h-3.5" /> Live sample tracking
                    </div>
                </div>

                {/* Pending Reports */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full translate-x-1/3 -translate-y-1/3 blur-xl group-hover:scale-110 transition-transform" />
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending Reports</span>
                            <h3 className="text-4xl font-black text-slate-900 mt-2 tracking-tight">{stats?.pendingReports || 0}</h3>
                        </div>
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                            <Activity className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs text-amber-600 font-bold">
                        <AlertCircle className="w-3.5 h-3.5" /> Awaiting testing phase
                    </div>
                </div>

                {/* Completed Reports */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full translate-x-1/3 -translate-y-1/3 blur-xl group-hover:scale-110 transition-transform" />
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ready Reports</span>
                            <h3 className="text-4xl font-black text-slate-900 mt-2 tracking-tight">{stats?.completedReports || 0}</h3>
                        </div>
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                            <FileCheck className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs text-emerald-600 font-bold">
                        <FileCheck className="w-3.5 h-3.5" /> Approved by Pathologist
                    </div>
                </div>

                {/* Outstanding Billing */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full translate-x-1/3 -translate-y-1/3 blur-xl group-hover:scale-110 transition-transform" />
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unpaid Billing</span>
                            <h3 className="text-4xl font-black text-slate-900 mt-2 tracking-tight">₹{stats?.pendingBilling || 0}</h3>
                        </div>
                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                            <DollarSignIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs text-rose-600 font-bold">
                        <AlertCircle className="w-3.5 h-3.5" /> Current outstanding cycle
                    </div>
                </div>
            </div>

            {/* Main Action Links and Recent Requests */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Action panel */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Quick Actions</h3>
                        <p className="text-slate-500 font-bold text-xs mt-1">Start submitting requests and managing test samples.</p>
                        <div className="space-y-3 mt-6">
                            <Link href="/hospital/orders" className="flex items-center justify-between p-4 bg-slate-50/80 hover:bg-blue-50/50 hover:border-blue-100 border border-transparent rounded-2xl transition-all group">
                                <div>
                                    <h4 className="font-black text-xs uppercase tracking-wider text-slate-700 group-hover:text-blue-600">Create New Request</h4>
                                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">Submit sample order and view progress</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                            </Link>
                            <Link href="/hospital/samples" className="flex items-center justify-between p-4 bg-slate-50/80 hover:bg-blue-50/50 hover:border-blue-100 border border-transparent rounded-2xl transition-all group">
                                <div>
                                    <h4 className="font-black text-xs uppercase tracking-wider text-slate-700 group-hover:text-blue-600">Enter Results Draft</h4>
                                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">Technician interface for testing results</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recent Requests Summary Table */}
                <div className="xl:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent B2B Orders</h3>
                            <p className="text-slate-500 font-bold text-xs mt-1">Your newest patient diagnostic requests.</p>
                        </div>
                        <Link href="/hospital/orders" className="text-xs font-black text-blue-600 hover:underline flex items-center gap-1">
                            View All <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Booking ID</th>
                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Patient</th>
                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Test</th>
                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Status</th>
                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {stats?.recentRequests && stats.recentRequests.length > 0 ? (
                                    stats.recentRequests.map(order => (
                                        <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3.5 px-4 text-xs font-bold font-mono text-blue-600">{order.bookingId}</td>
                                            <td className="py-3.5 px-4 text-xs font-black text-slate-700">{order.patientName}</td>
                                            <td className="py-3.5 px-4 text-xs font-bold text-slate-500">
                                                {order.tests && order.tests[0] ? order.tests[0].name : "General Test"}
                                            </td>
                                            <td className="py-3.5 px-4 text-xs">
                                                <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider ${
                                                    order.status === "Report Ready" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                    order.status === "Processing" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                                    "bg-slate-100 text-slate-600 border border-slate-200"
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-xs font-bold text-slate-400">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-slate-400 font-bold text-sm">
                                            No requests created yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SparklesIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
        </svg>
    );
}

function DollarSignIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    )
}
