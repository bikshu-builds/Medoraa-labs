"use client";
import React, { useEffect, useState } from "react";
import DashboardCard from "../components/DashboardCard";
import { 
    Users, 
    UserPlus, 
    Calendar, 
    DollarSign, 
    Activity,
    Plus,
    Clock,
    FileText,
    ArrowRight,
    Zap,
    AlertCircle,
    TrendingUp,
    ShieldCheck
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { DashboardStats } from "../types";
import { cn } from "@/lib/utils";

const AreaChart = ({ data }: { data: number[] }) => {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const max = Math.max(...data, 1);
    const height = 75;
    const width = 220;
    const xOffset = 30;
    const yOffset = 5;
    const step = width / (data.length - 1);
    const points = data.map((val, i) => `${xOffset + i * step},${yOffset + height - (val / max) * height}`).join(" ");
    const fillPath = `${xOffset},${yOffset + height} ${points} ${xOffset + width},${yOffset + height}`;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = (x - xOffset) / width;
        const closestIndex = Math.round(pct * (data.length - 1));
        if (closestIndex >= 0 && closestIndex < data.length) {
            setHoverIndex(closestIndex);
        }
    };

    return (
        <div 
            className="w-full h-28 select-none relative group/chart cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverIndex(null)}
        >
            <svg viewBox="0 0 260 100" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                </defs>
                
                {/* Horizontal gridlines */}
                {[0, 0.5, 1].map((p, index) => (
                    <line key={index} x1={xOffset} y1={yOffset + height * (1 - p)} x2={xOffset + width} y2={yOffset + height * (1 - p)} stroke="#f1f5f9" strokeWidth={1} strokeDasharray="3 3" />
                ))}

                {/* Y-Axis Labels */}
                <text x={xOffset - 6} y={yOffset + 4} textAnchor="end" className="text-[8px] font-black fill-slate-400 select-none tracking-tighter">{max}</text>
                <text x={xOffset - 6} y={yOffset + height / 2 + 3} textAnchor="end" className="text-[8px] font-black fill-slate-400 select-none tracking-tighter">{Math.round(max / 2)}</text>
                <text x={xOffset - 6} y={yOffset + height + 3} textAnchor="end" className="text-[8px] font-black fill-slate-400 select-none tracking-tighter">0</text>

                {/* X-Axis Labels */}
                {data.map((_, i) => (
                    <text key={i} x={xOffset + i * step} y={yOffset + height + 14} textAnchor="middle" className="text-[8px] font-black fill-slate-400 select-none tracking-tighter">D{i + 1}</text>
                ))}

                {/* Plot Area */}
                <polygon points={fillPath} fill="url(#areaColor)" />
                <polyline fill="none" stroke="#3b82f6" strokeWidth={2.5} points={points} className="drop-shadow-sm" />

                {/* Y Axis line */}
                <line x1={xOffset} y1={yOffset} x2={xOffset} y2={yOffset + height} stroke="#e2e8f0" strokeWidth={1} />
                
                {/* X Axis line */}
                <line x1={xOffset} y1={yOffset + height} x2={xOffset + width} y2={yOffset + height} stroke="#e2e8f0" strokeWidth={1} />

                {data.map((val, i) => (
                    <circle
                        key={i}
                        cx={xOffset + i * step}
                        cy={yOffset + height - (val / max) * height}
                        r={hoverIndex === i ? 5.5 : 3.5}
                        fill="#3b82f6"
                        stroke="#ffffff"
                        strokeWidth={hoverIndex === i ? 2 : 1.5}
                        className="transition-all duration-150"
                    />
                ))}
            </svg>
            {hoverIndex !== null && (
                <div 
                    className="absolute bg-slate-900 text-white text-[10px] font-black tracking-widest px-2 py-1 rounded shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full whitespace-nowrap z-50 animate-in fade-in duration-150"
                    style={{
                        left: `${((xOffset + hoverIndex * step) / 260) * 100}%`,
                        top: `${((yOffset + height - (data[hoverIndex] / max) * height) / 100) * 100}%`,
                        marginTop: "-14px"
                    }}
                >
                    {data[hoverIndex]} Patients
                </div>
            )}
        </div>
    );
};

const DonutChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
    const size = 100;
    const radius = 38;
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
            <div className="flex flex-col gap-1 justify-center flex-1 max-w-[130px] ml-2">
                {data.map((item, index) => (
                    <div 
                        key={index} 
                        className={cn(
                            "flex items-center justify-between text-[9px] font-black transition-all cursor-pointer",
                            hoverIndex === index ? "translate-x-1 opacity-100" : "opacity-80"
                        )}
                        onMouseEnter={() => setHoverIndex(index)}
                        onMouseLeave={() => setHoverIndex(null)}
                    >
                        <div className="flex items-center gap-1.5 truncate">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-slate-500 truncate uppercase tracking-widest">{item.label}</span>
                        </div>
                        <span className="text-slate-800 shrink-0">{item.value}</span>
                    </div>
                ))}
            </div>
            {hoverIndex !== null && (
                <div className="absolute top-1/2 left-1/2 bg-slate-900 text-white text-[10px] font-black tracking-widest px-2 py-1 rounded shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-50 animate-in fade-in duration-150 whitespace-nowrap">
                    {data[hoverIndex].label}: {Math.round((data[hoverIndex].value / total) * 100)}%
                </div>
            )}
        </div>
    );
};

const LineChart = ({ data }: { data: number[] }) => {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const max = Math.max(...data, 1);
    const height = 75;
    const width = 220;
    const xOffset = 30;
    const yOffset = 5;
    const step = width / (data.length - 1);
    const points = data.map((val, i) => `${xOffset + i * step},${height - (val / max) * height}`).join(" ");

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = (x - xOffset) / width;
        const closestIndex = Math.round(pct * (data.length - 1));
        if (closestIndex >= 0 && closestIndex < data.length) {
            setHoverIndex(closestIndex);
        }
    };

    return (
        <div 
            className="w-full h-28 select-none relative group/chart cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverIndex(null)}
        >
            <svg viewBox="0 0 260 100" className="w-full h-full overflow-visible">
                {/* Horizontal gridlines */}
                {[0, 0.5, 1].map((p, index) => (
                    <line key={index} x1={xOffset} y1={yOffset + height * (1 - p)} x2={xOffset + width} y2={yOffset + height * (1 - p)} stroke="#f1f5f9" strokeWidth={1} strokeDasharray="3 3" />
                ))}

                {/* Y-Axis Labels */}
                <text x={xOffset - 6} y={yOffset + 4} textAnchor="end" className="text-[8px] font-black fill-slate-400 select-none tracking-tighter">{max}</text>
                <text x={xOffset - 6} y={yOffset + height / 2 + 3} textAnchor="end" className="text-[8px] font-black fill-slate-400 select-none tracking-tighter">{Math.round(max / 2)}</text>
                <text x={xOffset - 6} y={yOffset + height + 3} textAnchor="end" className="text-[8px] font-black fill-slate-400 select-none tracking-tighter">0</text>

                {/* X-Axis Labels */}
                {data.map((_, i) => (
                    <text key={i} x={xOffset + i * step} y={yOffset + height + 14} textAnchor="middle" className="text-[8px] font-black fill-slate-400 select-none tracking-tighter">D{i + 1}</text>
                ))}

                {/* Plot Line */}
                <polyline fill="none" stroke="#10b981" strokeWidth={2.5} points={points} className="drop-shadow-sm" />

                {/* Y Axis line */}
                <line x1={xOffset} y1={yOffset} x2={xOffset} y2={yOffset + height} stroke="#e2e8f0" strokeWidth={1} />
                
                {/* X Axis line */}
                <line x1={xOffset} y1={yOffset + height} x2={xOffset + width} y2={yOffset + height} stroke="#e2e8f0" strokeWidth={1} />

                {data.map((val, i) => (
                    <circle
                        key={i}
                        cx={xOffset + i * step}
                        cy={yOffset + height - (val / max) * height}
                        r={hoverIndex === i ? 5.5 : 3.5}
                        fill="#10b981"
                        stroke="#ffffff"
                        strokeWidth={hoverIndex === i ? 2 : 1.5}
                        className="transition-all duration-150"
                    />
                ))}
            </svg>
            {hoverIndex !== null && (
                <div 
                    className="absolute bg-slate-900 text-white text-[10px] font-black tracking-widest px-2 py-1 rounded shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full whitespace-nowrap z-50 animate-in fade-in duration-150"
                    style={{
                        left: `${((xOffset + hoverIndex * step) / 260) * 100}%`,
                        top: `${((yOffset + height - (data[hoverIndex] / max) * height) / 100) * 100}%`,
                        marginTop: "-14px"
                    }}
                >
                    {data[hoverIndex]} Patients
                </div>
            )}
        </div>
    );
};

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [liveStats, setLiveStats] = useState<any>(null);
    const [referralAnalytics, setReferralAnalytics] = useState<any>(null);
    const [patients, setPatients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) {
                window.location.href = "/admin/login";
                return;
            }

            const [sRes, lRes, rRes, pRes] = await Promise.all([
                fetch(getApiUrl("/api/admin/dashboard"), { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(getApiUrl("/api/admin/live-dashboard"), { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(getApiUrl("/api/admin/referral-analytics"), { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(getApiUrl("/api/admin/patients"), { headers: { "Authorization": `Bearer ${token}` } })
            ]);
            
            const sData = await sRes.json();
            const lData = await lRes.json();
            const rData = await rRes.json();
            const pData = await pRes.json();
            
            if (sData.success) setStats(sData.data);
            if (lData.success) setLiveStats(lData.data);
            if (rData.success) setReferralAnalytics(rData.data);
            if (pData.success) setPatients(pData.data);
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Auto refresh every 30s
        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Intelligence...</p>
            </div>
        );
    }

    const displayStats = stats || {
        totalPatients: 0,
        totalDoctors: 0,
        totalEmployees: 0,
        homeCollectionRequests: 0,
        monthlyRevenue: 0,
        pendingReports: 0,
        sourceCounts: []
    };

    return (
        <div className="space-y-6 font-sans animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
                    <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-slate-500 text-sm font-medium">Real-time laboratory operational intelligence.</p>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Live Sync</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => window.location.href = '/admin/activityLogs'}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200/60 rounded-xl text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all shadow-sm"
                    >
                        Audit Logs
                    </button>
                    <button 
                        onClick={() => window.location.href = '/admin/patients?new=true'}
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        New Registration
                    </button>
                </div>
            </div>

            {/* Live Metrics Pulse */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                        <Zap className="w-20 h-20 text-blue-600" />
                    </div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
                            <Zap className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Workload</span>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 leading-none">{liveStats?.activePatients || 0}</h3>
                        <p className="text-[11px] font-bold text-slate-400 mt-1.5 flex items-center gap-1 leading-tight">
                            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                            Active Clinical Cases
                        </p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                        <Calendar className="w-20 h-20 text-indigo-600" />
                    </div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Schedule</span>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 leading-none">{liveStats?.todayBookings || 0}</h3>
                        <p className="text-[11px] font-bold text-slate-400 mt-1.5 flex items-center gap-1 leading-tight">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            Confirmed Appointments
                        </p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                        <Activity className="w-20 h-20 text-emerald-600" />
                    </div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
                            <Activity className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Collections</span>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 leading-none">{liveStats?.ongoingCollections || 0}</h3>
                        <p className="text-[11px] font-bold text-emerald-600 mt-1.5 flex items-center gap-1 leading-tight">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            In Progress
                        </p>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <DashboardCard title="Total Patients" value={displayStats.totalPatients} icon={Users} color="blue" description="YTD Growth" />
                <DashboardCard title="Medical Partners" value={displayStats.totalDoctors} icon={UserPlus} color="emerald" description="Active Doctors" />
                <DashboardCard title="Laboratory Staff" value={displayStats.totalEmployees} icon={Calendar} color="purple" description="Departmental total" />
                <DashboardCard title="Monthly Revenue" value={`₹${displayStats.monthlyRevenue.toLocaleString()}`} icon={DollarSign} color="amber" description="Current Month" />
            </div>

            {/* Compressed Graph Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
                    <div className="mb-2">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Weekly Patient Trend</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Clinical workflow tracking</p>
                    </div>
                    <AreaChart data={[3, 5, 2, 8, 4, 11, displayStats.totalPatients || 8]} />
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
                    <div className="mb-2">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Status Breakdown</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Active Case Allocations</p>
                    </div>
                    <DonutChart data={[
                        { label: "Active", value: liveStats?.activePatients || 4, color: "#3b82f6" },
                        { label: "Booked", value: liveStats?.todayBookings || 5, color: "#6366f1" },
                        { label: "Ongoing", value: liveStats?.ongoingCollections || 2, color: "#10b981" }
                    ]} />
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
                    <div className="mb-2">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Inflow Progression</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Total case monitoring</p>
                    </div>
                    <LineChart data={[1, 4, 2, 7, displayStats.totalPatients || 8]} />
                </div>
            </div>

            {/* Referral Intelligence */}
            <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            Referral & Acquisition Intelligence
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Growth breakdown by acquisition source</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Top Acquisition Channels</h3>
                        <div className="grid grid-cols-1 gap-2.5">
                            {referralAnalytics?.sourceDistribution?.slice(0, 5).map((source: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl border border-slate-100 hover:border-blue-200/50 hover:bg-white transition-all duration-300">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs border border-blue-100">
                                            {i + 1}
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">{source._id || 'Direct'}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-slate-900">{source.count} Patients</p>
                                        <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">₹{source.revenue?.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Top Performing Doctors</h3>
                        <div className="grid grid-cols-1 gap-2.5">
                            {referralAnalytics?.doctorPerformance?.slice(0, 5).map((doc: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl border border-slate-100 hover:border-blue-200/50 hover:bg-white transition-all duration-300">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-black text-[10px] border border-slate-200">
                                            DR
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-700 uppercase tracking-tight leading-tight">{doc.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{doc.hospital}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-slate-900">{doc.patientCount} Ref.</p>
                                        <div className="flex items-center gap-1 justify-end mt-0.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Tier 1</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Table */}
                <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-blue-600" />
                                Inflow Monitoring
                            </h2>
                            <button 
                                onClick={() => window.location.href = '/admin/patients'}
                                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 flex items-center gap-2 transition-all"
                            >
                                Full Registry
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        
                        <div className="divide-y divide-slate-50 min-h-[220px] flex flex-col justify-center">
                            {patients.length > 0 ? (
                                patients.slice(-5).reverse().map((patient: any, i: number) => (
                                    <div key={patient._id || i} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-all duration-200 cursor-default group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-black border border-slate-100 text-[10px] group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-all duration-300">
                                                #{i + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-700">{patient.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{patient.sourceType || "Direct Visit"}</span>
                                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                    <span className="text-[10px] font-bold text-blue-500 uppercase">{patient.testStatus || "Processing"}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100/80 px-3 py-1.5 rounded-lg">
                                                {patient.date ? new Date(patient.date).toLocaleDateString() : "Today"}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center text-xs font-bold text-slate-400 select-none uppercase tracking-widest">
                                    No Active Clinical Cases
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status Panels */}
                <div className="space-y-6">
                    <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6">
                        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                            Health Status
                            <AlertCircle className="w-4 h-4 text-slate-300" />
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-600">Throughput Efficiency</span>
                                    <span className="text-xs font-black text-blue-600">82%</span>
                                </div>
                                <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100">
                                    <div className="bg-blue-600 h-full w-[82%] rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-600">Collection Accuracy</span>
                                    <span className="text-xs font-black text-emerald-600">94%</span>
                                </div>
                                <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100">
                                    <div className="bg-emerald-600 h-full w-[94%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                </div>
                            </div>

                            <div className="pt-5 border-t border-slate-100 grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Queue</p>
                                    <p className="text-2xl font-black text-slate-900 leading-none">{displayStats.homeCollectionRequests}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending</p>
                                    <p className="text-2xl font-black text-slate-900 leading-none">{displayStats.pendingReports}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 p-6 opacity-10 transform translate-x-1/4 translate-y-1/4">
                            <Zap className="w-32 h-32 text-blue-400" />
                        </div>
                        <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 relative z-10">Advanced Controls</h2>
                        <div className="space-y-2.5 relative z-10">
                            <button 
                                onClick={() => window.location.href = '/admin/bookings'}
                                className="flex items-center justify-between w-full p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left group/btn duration-300"
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-200">Dispatch Home Team</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-600 group-hover/btn:text-white transition-colors" />
                            </button>
                            <button 
                                onClick={() => window.location.href = '/admin/activityLogs'}
                                className="flex items-center justify-between w-full p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left group/btn duration-300"
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-200">Security Audit</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-600 group-hover/btn:text-white transition-colors" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
