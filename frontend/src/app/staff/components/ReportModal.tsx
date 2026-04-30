"use client";
import React from "react";
import { 
    X, 
    Download, 
    Printer, 
    ShieldCheck, 
    FlaskConical, 
    User, 
    Calendar,
    FileText,
    Activity,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportModalProps {
    report: any;
    isOpen: boolean;
    onClose: () => void;
}

export default function ReportModal({ report, isOpen, onClose }: ReportModalProps) {
    if (!isOpen || !report) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-slate-900 p-8 text-white flex items-center justify-between relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                            <FileText className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight uppercase">Clinical Report Preview</h2>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Status: {report.status} • {report.dispatchStatus}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="relative z-10 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
                    {/* Patient info card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient Name</p>
                                <p className="text-lg font-black text-slate-900 uppercase tracking-tight">{report.patientName}</p>
                            </div>
                        </div>
                        <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Generated Date</p>
                                <p className="text-lg font-black text-slate-900 uppercase tracking-tight">{report.date}</p>
                            </div>
                        </div>
                    </div>

                    {/* Report Content */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between ml-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{report.testName} Parameters</h4>
                            <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3" /> Digitally Verified
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Test Parameter</th>
                                        <th className="px-8 py-5 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Result Value</th>
                                        <th className="px-8 py-5 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Units</th>
                                        <th className="px-8 py-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Normal Range</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {report.parameters?.map((p: any, i: number) => (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{p.name}</p>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <p className={cn(
                                                    "text-sm font-black",
                                                    p.isAbnormal ? "text-rose-500" : "text-emerald-600"
                                                )}>
                                                    {p.value} {p.isAbnormal && "↑"}
                                                </p>
                                            </td>
                                            <td className="px-8 py-6 text-center text-[10px] font-bold text-slate-400">
                                                {p.unit}
                                            </td>
                                            <td className="px-8 py-6 text-right text-[10px] font-black text-slate-900 uppercase tracking-widest">
                                                {p.referenceRange}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer / Notes */}
                    <div className="p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100/50 flex items-start gap-6">
                        <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm shrink-0">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-2">Clinical Interpretation</h4>
                            <p className="text-xs font-medium text-blue-800 leading-relaxed italic">
                                {report.observations || "Results are within expected clinical thresholds. Correlation with clinical findings recommended."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Report Finalized</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Digitally Signed by Pathologist</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                            <Printer className="w-4 h-4" /> Print Report
                        </button>
                        <button className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-blue-500/10">
                            <Download className="w-4 h-4" /> Download PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
