"use client";
import React, { useEffect, useState } from "react";
import { 
    FileText, 
    Download, 
    Send, 
    MessageCircle, 
    Mail, 
    CheckCircle2, 
    Clock, 
    Search, 
    Filter,
    Loader2,
    Eye,
    ChevronRight,
    ArrowUpRight,
    Users
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function StaffReports() {
    const [reports, setReports] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem("staffToken");
            // Mocking data for now
            setReports([
                { _id: "1", reportId: "REP-90210", patientName: "Rahul Sharma", testName: "Full Body Profile", status: "Ready", dispatchStatus: "Sent", date: "2024-03-20" },
                { _id: "2", reportId: "REP-88291", patientName: "Anita Devi", testName: "Thyroid Profile", status: "Ready", dispatchStatus: "Pending", date: "2024-03-21" },
                { _id: "3", reportId: "REP-77211", patientName: "Sumit Kumar", testName: "Diabetes Profile", status: "Ready", dispatchStatus: "Pending", date: "2024-03-21" }
            ]);
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
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Report Dispatch</h1>
                    <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-widest">Multi-Channel Delivery & Archive Management</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-95 transition-all">
                        <Users className="w-4 h-4" /> Bulk Dispatch
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard label="Today Generated" value="48" icon={FileText} color="blue" />
                <StatCard label="Pending Dispatch" value="12" icon={Clock} color="amber" />
                <StatCard label="Delivered" value="36" icon={CheckCircle2} color="emerald" />
            </div>

            {/* Search & Filter */}
            <div className="flex items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex-1 flex items-center gap-4 px-6 py-2 bg-slate-50 rounded-2xl group focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all border border-transparent focus-within:border-blue-100">
                    <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                    <input type="text" placeholder="Search by Patient Name, ID or Phone..." className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 w-full placeholder:text-slate-400 uppercase tracking-widest" />
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-600 transition-all">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Reports List */}
            <div className="grid grid-cols-1 gap-6">
                {reports.map((report) => (
                    <div key={report._id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group flex flex-col md:flex-row items-center gap-8">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                            <FileText className="w-8 h-8" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight truncate">{report.patientName}</h3>
                                <span className={cn(
                                    "px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                    report.dispatchStatus === "Sent" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                )}>
                                    {report.dispatchStatus}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-400">
                                <span className="text-[10px] font-black uppercase tracking-widest">{report.testName}</span>
                                <div className="w-px h-3 bg-slate-100" />
                                <span className="text-[10px] font-black uppercase tracking-widest">ID: {report.reportId}</span>
                                <div className="w-px h-3 bg-slate-100" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{report.date}</span>
                            </div>
                        </div>

                        {/* Dispatch Channels */}
                        <div className="flex items-center gap-2">
                            <ChannelButton icon={MessageCircle} color="emerald" label="WhatsApp" active={report.dispatchStatus === "Sent"} />
                            <ChannelButton icon={Mail} color="blue" label="Email" active={report.dispatchStatus === "Sent"} />
                            <ChannelButton icon={Eye} color="slate" label="Portal" active={true} />
                        </div>

                        <div className="flex items-center gap-3 pl-8 border-l border-slate-100">
                            <button className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-slate-900 transition-all shadow-lg shadow-blue-100 active:scale-95">
                                <Download className="w-5 h-5" />
                            </button>
                            <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-white hover:text-blue-600 hover:shadow-md transition-all border border-transparent hover:border-slate-100">
                                <ArrowUpRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100"
    };

    return (
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex items-center gap-8 group hover:border-blue-200 transition-all">
            <div className={cn("w-16 h-16 rounded-[2rem] flex items-center justify-center transition-transform group-hover:scale-110", colors[color])}>
                <Icon className="w-8 h-8" />
            </div>
            <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</h4>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
            </div>
        </div>
    );
}

function ChannelButton({ icon: Icon, color, label, active }: any) {
    const colors: any = {
        emerald: "text-emerald-500 bg-emerald-50 border-emerald-100",
        blue: "text-blue-500 bg-blue-50 border-blue-100",
        slate: "text-slate-500 bg-slate-50 border-slate-100"
    };

    return (
        <div className="relative group cursor-pointer">
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all",
                active ? colors[color] : "bg-white border-slate-50 text-slate-200 grayscale opacity-40 hover:grayscale-0 hover:opacity-100"
            )}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">
                {label} {active ? "Sent" : "Pending"}
            </div>
        </div>
    );
}
