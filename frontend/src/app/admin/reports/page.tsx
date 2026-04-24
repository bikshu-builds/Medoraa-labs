"use client";
import React from "react";
import { 
    FileText, 
    Download, 
    Filter, 
    FileSpreadsheet, 
    Activity,
    TrendingUp,
    Home,
    Search,
    ChevronRight,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

const Reports: React.FC = () => {
    const reportCategories = [
        { 
            title: "Financial Reports", 
            description: "Revenue analysis, monthly collections, and tax summaries.",
            icon: FileSpreadsheet,
            color: "text-blue-600 bg-blue-50 border-blue-100",
            reports: ["Monthly Revenue Report", "Doctor Payout Summary", "GST/Tax Collection"]
        },
        { 
            title: "Operational Reports", 
            description: "Staff performance, TAT analysis, and equipment usage.",
            icon: Activity,
            color: "text-emerald-600 bg-emerald-50 border-emerald-100",
            reports: ["Employee Attendance Report", "Average TAT Analysis", "Test Volume Report"]
        },
        { 
            title: "Marketing Reports", 
            description: "Referral performance, source tracking, and conversion data.",
            icon: TrendingUp,
            color: "text-purple-600 bg-purple-50 border-purple-100",
            reports: ["Doctor Referral Analysis", "Source Distribution Report", "Campaign Performance"]
        },
        { 
            title: "Collection Reports", 
            description: "Home collection logs, GPS tracking summaries, and proof logs.",
            icon: Home,
            color: "text-amber-600 bg-amber-50 border-amber-100",
            reports: ["Home Visit Completion Log", "Staff GPS History", "Collection Status Audit"]
        }
    ];

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reports Central</h1>
                    <p className="text-slate-500 font-medium mt-1">Generate, export, and manage your laboratory records</p>
                </div>
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search for report name..." 
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/80 rounded-2xl text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {reportCategories.map((cat, idx) => (
                    <div key={idx} className="bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                        <div className="flex items-start justify-between mb-8">
                            <div className={cn("p-4 rounded-2xl border transition-all duration-500 group-hover:scale-110 shadow-sm", cat.color)}>
                                <cat.icon className="w-8 h-8" />
                            </div>
                            <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                                <Filter className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <h2 className="text-xl font-black text-slate-900 mb-2 tracking-tight">{cat.title}</h2>
                        <p className="text-sm text-slate-500 font-medium mb-10 leading-relaxed">{cat.description}</p>
                        
                        <div className="space-y-3">
                            {cat.reports.map((report, rIdx) => (
                                <div key={rIdx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-white hover:shadow-md hover:border-slate-100 border border-transparent transition-all cursor-pointer group/item">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover/item:text-blue-600 transition-colors shadow-sm">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">{report}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Download className="w-4 h-4 text-slate-300 group-hover/item:text-blue-600 transition-colors" />
                                        <ChevronRight className="w-4 h-4 text-slate-200 group-hover/item:text-blue-600 translate-x-0 group-hover/item:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-slate-900 p-12 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Enterprise Feature</span>
                    </div>
                    <h2 className="text-3xl font-black mb-2 tracking-tight">Schedule Automated Reports</h2>
                    <p className="text-slate-400 font-medium max-w-md">Receive high-intelligence monthly summaries directly in your executive email every 1st of the month.</p>
                </div>
                <button className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[2rem] shadow-2xl shadow-blue-600/20 transition-all active:scale-95 whitespace-nowrap relative z-10 group/btn">
                    Set Up Automation
                    <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover/btn:scale-x-100 origin-left transition-transform duration-500 rounded-[2rem]"></div>
                </button>
            </div>
        </div>
    );
}

export default Reports;
