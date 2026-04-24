"use client";
import React, { useEffect, useState } from "react";
import { 
    ClipboardList, 
    Clock, 
    FileText, 
    Truck, 
    ArrowRight, 
    Plus,
    Activity,
    Bell,
    ChevronRight,
    Search,
    User,
    ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";

export default function PatientDashboard() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const token = localStorage.getItem("patientToken");
                const res = await fetch(getApiUrl("/api/patient/dashboard"), {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const d = await res.json();
                if (d.success) setData(d.data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const quickActions = [
        { title: "Book a Test", icon: Search, href: "/patient/tests", color: "blue" },
        { title: "View Reports", icon: FileText, href: "/patient/reports", color: "emerald" },
        { title: "Home Visit", icon: Truck, href: "/patient/homeCollection", color: "purple" },
        { title: "Edit Profile", icon: User, href: "/patient/profile", color: "amber" },
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Accessing Health Vault...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Health Overview</h1>
                    <p className="text-slate-500 font-bold mt-1">Good morning, John! Here's your health summary.</p>
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Medoraa Secure Access</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Total Bookings" value={data?.stats?.bookings || 0} icon={ClipboardList} color="blue" />
                <StatsCard title="Pending Reports" value={data?.stats?.pendingReports || 0} icon={Clock} color="amber" />
                <StatsCard title="Completed Tests" value={data?.stats?.completedTests || 0} icon={FileText} color="emerald" />
                <StatsCard title="Home Collections" value={0} icon={Truck} color="purple" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {quickActions.map((action, i) => (
                    <Link 
                        key={i} 
                        href={action.href}
                        className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all group"
                    >
                        <div className={`w-12 h-12 rounded-2xl bg-${action.color}-50 text-${action.color}-600 flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                            <action.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-black text-slate-900">{action.title}</h3>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                            Go to Section <ChevronRight className="w-3 h-3" />
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Reports */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <h2 className="text-lg font-black text-slate-900 flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Recent Reports
                        </h2>
                        <Link href="/patient/reports" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-2">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {data?.recentReports?.length > 0 ? (
                            data.recentReports.map((report: any) => (
                                <div key={report._id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-all group cursor-pointer">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-black border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <Activity className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-slate-900">{report.test.name}</h3>
                                            <p className="text-xs font-bold text-slate-400 mt-1">{new Date(report.createdAt).toLocaleDateString()} • {report.reportId}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${report.status === 'Ready' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                            {report.status}
                                        </span>
                                        <ChevronRight className="w-5 h-5 text-slate-300" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                    <FileText className="w-8 h-8 text-slate-300" />
                                </div>
                                <p className="text-slate-400 font-bold text-sm">No recent reports found.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col">
                    <h2 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3">
                        <Bell className="w-5 h-5 text-blue-600" />
                        Updates
                    </h2>
                    <div className="space-y-6 flex-1">
                        {data?.latestNotifications?.length > 0 ? (
                            data.latestNotifications.map((notif: any) => (
                                <div key={notif._id} className="flex gap-4 group cursor-pointer">
                                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0 opacity-0 group-hover:opacity-100 transition-all" />
                                    <div>
                                        <h4 className="text-sm font-black text-slate-800 leading-tight">{notif.title}</h4>
                                        <p className="text-xs font-medium text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-50 py-12">
                                <Bell className="w-12 h-12 text-slate-200 mb-2" />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">All Clear</p>
                            </div>
                        )}
                    </div>
                    <button className="w-full mt-8 py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 transition-all">
                        View All Notifications
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon: Icon, color }: any) {
    const colorClasses: any = {
        blue: "bg-blue-600 shadow-blue-600/20",
        amber: "bg-amber-500 shadow-amber-500/20",
        emerald: "bg-emerald-600 shadow-emerald-600/20",
        purple: "bg-purple-600 shadow-purple-600/20"
    };

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 translate-x-1/4 -translate-y-1/4 rounded-full opacity-5 group-hover:scale-110 transition-transform ${colorClasses[color]}`} />
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl ${colorClasses[color]}`}>
                <Icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
        </div>
    );
}
