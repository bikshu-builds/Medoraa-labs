"use client";
import React, { useEffect, useState } from "react";
import { 
    FileCheck, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Eye, 
    Loader2,
    ShieldCheck,
    MessageSquare,
    User,
    FlaskConical,
    Activity,
    ArrowRight
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function StaffApprovals() {
    const [pending, setPending] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedResult, setSelectedResult] = useState<any>(null);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const token = localStorage.getItem("staffToken");
            const res = await fetch(getApiUrl("/api/staff/pending-approvals"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const d = await res.json();
            if (d.success) setPending(d.data);
            else setPending([]);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproval = async (status: string) => {
        try {
            const token = localStorage.getItem("staffToken");
            const res = await fetch(getApiUrl("/api/staff/approve-report"), {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    resultId: selectedResult._id,
                    status,
                    comments: "Verified by Clinical Pathologist."
                })
            });
            const d = await res.json();
            if (d.success) {
                setSelectedResult(null);
                fetchPending();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                        <FileCheck className="w-9 h-9 text-blue-600" />
                        Clinical Approvals
                    </h1>
                    <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-widest">Verification Workbench for Senior Pathologists</p>
                </div>
                <div className="px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Digitally Signed Protocol Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* List of Pending */}
                <div className="lg:col-span-1 space-y-4">
                    {pending.map((item) => (
                        <button 
                            key={item._id}
                            onClick={() => setSelectedResult(item)}
                            className={cn(
                                "w-full p-8 bg-white rounded-[2.5rem] border transition-all text-left group relative overflow-hidden",
                                selectedResult?._id === item._id ? "border-blue-600 shadow-xl shadow-blue-900/5 bg-blue-50/20" : "border-slate-100 hover:border-blue-200"
                            )}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                    selectedResult?._id === item._id ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400"
                                )}>
                                    <FlaskConical className="w-6 h-6" />
                                </div>
                                <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-amber-100">Pending Review</span>
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none mb-2">{item.booking.patientName}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{item.test.name}</p>
                            
                            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                                <div className="flex items-center gap-2">
                                    <User className="w-3 h-3" /> {item.examiner.name}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> 2h ago
                                </div>
                            </div>

                            {selectedResult?._id === item._id && <div className="absolute top-0 right-0 w-2 h-full bg-blue-600" />}
                        </button>
                    ))}

                    {pending.length === 0 && (
                        <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 opacity-60">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Queue Clear. No pending approvals.</p>
                        </div>
                    )}
                </div>

                {/* Verification Detail */}
                <div className="lg:col-span-2">
                    {selectedResult ? (
                        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden animate-in slide-in-from-right duration-500">
                            <div className="bg-slate-900 p-10 text-white flex items-center justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
                                <div className="relative z-10 flex items-center gap-8">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                                        <FileCheck className="w-9 h-9" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tight">{selectedResult.booking.patientName}</h2>
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Verification Profile • ID: {selectedResult.sample.sampleId}</p>
                                    </div>
                                </div>
                                <button className="relative z-10 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                                    <Eye className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-12 space-y-12">
                                {/* Parameters Table */}
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Observed Parameters</h4>
                                    <div className="bg-slate-50 rounded-[2rem] border border-slate-100/50 overflow-hidden">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-slate-100 bg-slate-100/30">
                                                    <th className="px-8 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Parameter</th>
                                                    <th className="px-8 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Value</th>
                                                    <th className="px-8 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Unit</th>
                                                    <th className="px-8 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Ref Range</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {selectedResult.parameters.map((p: any, i: number) => (
                                                    <tr key={i}>
                                                        <td className="px-8 py-5 text-xs font-black text-slate-900 uppercase tracking-tight">{p.name}</td>
                                                        <td className={cn(
                                                            "px-8 py-5 text-center text-sm font-black",
                                                            p.isAbnormal ? "text-rose-500" : "text-emerald-600"
                                                        )}>
                                                            {p.value} {p.isAbnormal && "↑"}
                                                        </td>
                                                        <td className="px-8 py-5 text-center text-[10px] font-bold text-slate-400 uppercase">{p.unit}</td>
                                                        <td className="px-8 py-5 text-right text-[10px] font-black text-slate-900 uppercase tracking-widest">{p.range}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Examiner Notes */}
                                <div className="p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100/50 flex items-start gap-6">
                                    <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-2">Examiner Observations</h4>
                                        <p className="text-xs font-medium text-blue-800 leading-relaxed italic">"Patient shows slightly elevated TSH levels. All other parameters within healthy reference range. No history of thyroid medication noted."</p>
                                    </div>
                                </div>

                                {/* Approval Actions */}
                                <div className="pt-10 border-t border-slate-50 grid grid-cols-2 gap-6">
                                    <button 
                                        onClick={() => handleApproval("Retest")}
                                        className="py-5 bg-white border border-slate-200 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-50 hover:border-rose-100 active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        <XCircle className="w-4 h-4" /> Reject / Hold
                                    </button>
                                    <button 
                                        onClick={() => handleApproval("Approved")}
                                        className="py-5 bg-emerald-600 hover:bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/10 active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Approve & Sign
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[600px] bg-slate-50 rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-center p-20 gap-8 opacity-60">
                            <Activity className="w-20 h-20 text-slate-200" />
                            <div>
                                <h3 className="text-2xl font-black text-slate-300 tracking-tight uppercase">Decision Workbench</h3>
                                <p className="text-slate-400 font-bold mt-2 max-w-sm mx-auto uppercase text-[10px] tracking-widest leading-loose">Select a clinical profile from the pending queue to perform senior level verification and digital signature.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
