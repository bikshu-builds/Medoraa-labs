"use client";
import React, { useEffect, useState } from "react";
import { 
    FileText, 
    Download, 
    Search, 
    Filter, 
    ArrowRight, 
    ChevronRight,
    Activity,
    ShieldCheck,
    Loader2,
    Eye
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function PatientReports() {
    const [reports, setReports] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const token = localStorage.getItem("patientToken");
                const res = await fetch(getApiUrl("/api/patient/reports"), {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const d = await res.json();
                if (d.success) setReports(d.data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReports();
    }, []);

    if (isLoading) {
        return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Reports</h1>
                    <p className="text-slate-500 font-bold mt-1">Access and download your verified laboratory results.</p>
                </div>
                <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Search by test name..." className="outline-none text-xs font-bold text-slate-600 bg-transparent" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reports.length > 0 ? (
                    reports.map((report) => (
                        <div key={report._id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all group flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                        <FileText className="w-7 h-7" />
                                    </div>
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                        report.status === 'Ready' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                    )}>
                                        {report.status}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">{report.test.name}</h3>
                                <div className="flex items-center gap-3 text-slate-400 mb-8">
                                    <span className="text-[10px] font-black uppercase tracking-widest">{new Date(report.createdAt).toLocaleDateString()}</span>
                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">ID: {report.reportId}</span>
                                </div>
                            </div>

                            <div className="space-y-3 pt-6 border-t border-slate-50">
                                <button className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-slate-900/10">
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </button>
                                <button className="w-full py-4 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all">
                                    <Eye className="w-4 h-4" />
                                    View Digital Copy
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm text-center">
                        <FileText className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-slate-900">No reports available yet</h3>
                        <p className="text-slate-400 font-bold mt-2 max-w-sm mx-auto">Once your samples are processed, your verified reports will appear here.</p>
                    </div>
                )}
            </div>

            <div className="bg-blue-600 rounded-[3rem] p-12 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-8">
                        <div className="w-20 h-20 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shrink-0">
                            <ShieldCheck className="w-10 h-10" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Verified Health Vault</h2>
                            <p className="text-blue-100 font-medium mt-2 max-w-md leading-relaxed">All reports are digitally signed and securely archived for lifetime access. Your privacy is protected with enterprise-grade encryption.</p>
                        </div>
                    </div>
                    <button className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/20 active:scale-95 transition-all">
                        Request Original Hardcopy
                    </button>
                </div>
            </div>
        </div>
    );
}
