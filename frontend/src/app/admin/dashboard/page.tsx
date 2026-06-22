"use client";
import React, { useEffect, useState } from "react";
import DashboardCard from "../components/DashboardCard";
import { 
    Users, 
    UserPlus, 
    Home,
    DollarSign, 
    Activity,
    Plus,
    Clock,
    FileText,
    ArrowRight,
    Zap,
    TrendingUp,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Wallet
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

interface DashboardStats {
    totalDoctors: number;
    totalHospitals: number;
    totalAdmins: number;
    totalReferral: number;
    totalPaid: number;
    totalDue: number;
    hospitalDistribution: { name: string; count: number }[];
    topDoctors: { _id: string; name: string; totalEarnings: number; paid: number; due: number }[];
    recentPayments: {
        _id: string;
        doctorName: string;
        hospitalName: string;
        totalReferralAmount: number;
        paidAmount: number;
        dueAmount: number;
        paymentStatus: string;
        createdAt: string;
    }[];
}

const DonutChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
    const size = 110;
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return (
        <div className="w-full flex items-center justify-between select-none relative group/chart">
            <svg width={size} height={size} className="transform -rotate-90">
                {data.map((item, index) => {
                    const strokeDasharray = circumference;
                    const strokeDashoffset = circumference - (item.value / total) * circumference;
                    const currentOffset = offset;
                    offset += strokeDashoffset;
                    return (
                        <circle
                            key={index}
                            r={radius}
                            cx={size / 2}
                            cy={size / 2}
                            fill="transparent"
                            stroke={item.color}
                            strokeWidth={hoverIndex === index ? 14 : 11}
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={currentOffset}
                            className="transition-all duration-300 cursor-pointer"
                            onMouseEnter={() => setHoverIndex(index)}
                            onMouseLeave={() => setHoverIndex(null)}
                        />
                    );
                })}
            </svg>
            <div className="flex flex-col gap-1 justify-center flex-1 max-w-[150px] ml-4">
                {data.map((item, index) => (
                    <div 
                        key={index} 
                        className={cn(
                            "flex items-center justify-between text-[10px] font-black transition-all cursor-pointer",
                            hoverIndex === index ? "translate-x-1 opacity-100" : "opacity-80"
                        )}
                        onMouseEnter={() => setHoverIndex(index)}
                        onMouseLeave={() => setHoverIndex(null)}
                    >
                        <div className="flex items-center gap-1.5 truncate">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-slate-500 truncate uppercase tracking-wider">{item.label}</span>
                        </div>
                        <span className="text-slate-800 shrink-0 ml-1">{item.value}</span>
                    </div>
                ))}
            </div>
            {hoverIndex !== null && (
                <div className="absolute top-1/2 left-[55px] bg-slate-900 text-white text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-50 animate-in fade-in duration-150 whitespace-nowrap">
                    {Math.round((data[hoverIndex].value / total) * 100)}%
                </div>
            )}
        </div>
    );
};

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) {
                window.location.href = "/signin";
                return;
            }

            const res = await fetch(getApiUrl("/api/admin/dashboard"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (data.success) {
                setStats(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Analytics Dashboard...</p>
            </div>
        );
    }

    const defaultStats: DashboardStats = {
        totalDoctors: 0,
        totalHospitals: 0,
        totalAdmins: 0,
        totalReferral: 0,
        totalPaid: 0,
        totalDue: 0,
        hospitalDistribution: [],
        topDoctors: [],
        recentPayments: []
    };

    const activeStats = stats || defaultStats;

    const donutColors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6"];
    const hospitalChartData = (activeStats.hospitalDistribution || []).length > 0
        ? (activeStats.hospitalDistribution || []).map((h, i) => ({
            label: h.name,
            value: h.count,
            color: donutColors[i % donutColors.length]
          }))
        : [{ label: "No Doctors Yet", value: 1, color: "#e2e8f0" }];

    return (
        <div className="space-y-6 font-sans animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Administrative Dashboard</h1>
                    <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-slate-500 text-sm font-medium">This is admin dashbard</p>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Live Sync</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => window.location.href = '/admin/doctors'}
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Manage Doctors
                    </button>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <DashboardCard title="Total Hospitals" value={activeStats.totalHospitals || 0} icon={Home} color="blue" description="Registered Branches" />
                <DashboardCard title="Total Doctors" value={activeStats.totalDoctors || 0} icon={UserPlus} color="emerald" description="Associated Partners" />
                <DashboardCard title="Administrators" value={activeStats.totalAdmins || 0} icon={ShieldCheck} color="purple" description="System Operators" />
                <DashboardCard title="Total Referrals" value={`₹${(activeStats.totalReferral || 0).toLocaleString()}`} icon={DollarSign} color="amber" description="All-time Payouts" />
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-300">
                    <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Allocated Payouts</span>
                        <h3 className="text-2xl font-black text-slate-950">₹{(activeStats.totalReferral || 0).toLocaleString()}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
                        <Wallet className="w-5 h-5" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-300">
                    <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Paid Out</span>
                        <h3 className="text-2xl font-black text-emerald-600">₹{(activeStats.totalPaid || 0).toLocaleString()}</h3>
                    </div>
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-300">
                    <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Outstanding Balance Due</span>
                        <h3 className="text-2xl font-black text-rose-500">₹{(activeStats.totalDue || 0).toLocaleString()}</h3>
                    </div>
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Content Section: Hospital Distribution & Top Earners */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Hospital Donut Chart */}
                <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Doctors by Hospital</h3>
                        <p className="text-xs font-semibold text-slate-400 mb-6 uppercase tracking-wider">Hospital distribution density</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center py-4">
                        <DonutChart data={hospitalChartData} />
                    </div>
                </div>

                {/* Top Performing Doctors (Leaderboard) */}
                <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6">
                    <div>
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Top Earning Physicians</h3>
                        <p className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider">Ranked by total referral commissions</p>
                    </div>
                    <div className="space-y-2.5">
                        {(activeStats.topDoctors || []).length > 0 ? (
                            (activeStats.topDoctors || []).map((doc, idx) => (
                                <div key={doc._id || idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-black text-xs">
                                            #{idx + 1}
                                        </span>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 uppercase tracking-tight">{doc.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-slate-900">₹{doc.totalEarnings.toLocaleString()}</p>
                                        <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                            Paid: ₹{doc.paid.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                No Doctor Earnings Recorded
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Payments Registry */}
            <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-600" />
                            Recent Payment Transactions
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Latest referral commissions posted</p>
                    </div>
                    <button 
                        onClick={() => window.location.href = '/admin/doctors'}
                        className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 flex items-center gap-2 transition-all"
                    >
                        View Doctor Registry
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Doctor</th>
                                <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Hospital</th>
                                <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Referral Amount</th>
                                <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Paid</th>
                                <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Due</th>
                                <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {(activeStats.recentPayments || []).length > 0 ? (
                                (activeStats.recentPayments || []).map((p, idx) => (
                                    <tr key={p._id || idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 text-xs font-medium text-slate-500">
                                            {new Date(p.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 text-xs font-bold text-slate-800 uppercase tracking-tight">{p.doctorName}</td>
                                        <td className="py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-[10px]">{p.hospitalName}</td>
                                        <td className="py-3 text-xs font-bold text-slate-900">₹{p.totalReferralAmount.toLocaleString()}</td>
                                        <td className="py-3 text-xs font-bold text-emerald-600">₹{p.paidAmount.toLocaleString()}</td>
                                        <td className="py-3 text-xs font-bold text-rose-500">₹{p.dueAmount.toLocaleString()}</td>
                                        <td className="py-3 text-right">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border",
                                                p.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                p.paymentStatus === "PARTIALLY_PAID" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                "bg-rose-50 text-rose-500 border-rose-100"
                                            )}>
                                                {p.paymentStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        No Recent Payments Found
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

export default Dashboard;
