"use client";
import React, { useState, useEffect } from "react";
import { 
    Inbox, 
    Scan, 
    CheckCircle2, 
    XCircle, 
    Loader2,
    Search,
    QrCode,
    Activity,
    Clock,
    User,
    ShieldCheck,
    FlaskConical,
    Plus,
    ArrowRight,
    MoreVertical,
    History
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function SampleReception() {
    const [view, setView] = useState<"list" | "scan">("list");
    const [isScanning, setIsScanning] = useState(false);
    const [sampleId, setSampleId] = useState("");
    const [sampleData, setSampleData] = useState<any>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [receivedSamples, setReceivedSamples] = useState<any[]>([]);

    const [errorData, setErrorData] = useState<any>(null);

    const fetchReceivedSamples = async () => {
        setStatus("loading");
        try {
            const token = localStorage.getItem("staffToken");
            const res = await fetch(getApiUrl("/api/staff/received-samples"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const d = await res.json();
            if (d.success) {
                setReceivedSamples(d.data);
                setStatus("idle");
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (view === "list") fetchReceivedSamples();
    }, [view]);

    const handleScan = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!sampleId) return;

        setStatus("loading");
        setErrorData(null);
        try {
            const token = localStorage.getItem("staffToken");
            const res = await fetch(getApiUrl("/api/staff/sample-received"), {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ sampleId })
            });
            const d = await res.json();
            if (d.success) {
                setSampleData(d.data);
                setStatus("success");
                setMessage("Sample successfully registered in the facility.");
            } else {
                setStatus("error");
                setMessage(d.message);
                if (d.isAlreadyVerified) setErrorData({ isAlreadyVerified: true });
            }
        } catch (err) {
            setStatus("error");
            setMessage("Connection failure. Check scanner connection.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {view === "list" ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm shadow-slate-200/20">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[1.8rem] bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-200">
                                <Inbox className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Central Reception</h1>
                                <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Verified incoming samples for laboratory processing</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={fetchReceivedSamples}
                                className="p-5 bg-slate-50 text-slate-400 rounded-[1.5rem] hover:bg-slate-100 transition-all border border-slate-100"
                            >
                                <History className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => { setView("scan"); setStatus("idle"); setSampleId(""); }}
                                className="px-10 py-5 bg-slate-900 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-4"
                            >
                                <Plus className="w-5 h-5" /> Start Verification
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        {status === "loading" && receivedSamples.length === 0 ? (
                            <div className="p-40 flex flex-col items-center justify-center gap-6 text-slate-400 font-black uppercase tracking-widest text-xs">
                                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                                Synchronizing Data...
                            </div>
                        ) : (
                            <div className="overflow-x-auto no-scrollbar">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-50 bg-slate-50/50">
                                            <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Sample ID</th>
                                            <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Details</th>
                                            <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Profile</th>
                                            <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Received At</th>
                                            <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                            <th className="px-10 py-8 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {receivedSamples.map((s) => (
                                            <tr key={s._id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-3">
                                                        <QrCode className="w-4 h-4 text-blue-600" />
                                                        <span className="text-xs font-black text-slate-900 font-mono tracking-widest">{s.sampleId}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{s.patient?.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{s.patient?.patientId}</p>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-3">
                                                        <FlaskConical className="w-4 h-4 text-slate-400" />
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.test?.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <Clock className="w-3 h-3" />
                                                        <span className="text-[10px] font-bold">{new Date(s.receptionTime).toLocaleString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="inline-flex px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                                        {s.status}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <button className="p-3 hover:bg-white rounded-2xl border border-transparent hover:border-slate-100 hover:shadow-sm transition-all">
                                                        <MoreVertical className="w-5 h-5 text-slate-400" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {receivedSamples.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-10 py-20 text-center">
                                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No samples received in this session</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-12 animate-in slide-in-from-right-12 duration-700">
                    {/* Sub Header */}
                    <div className="flex items-center justify-between">
                        <button 
                            onClick={() => setView("list")}
                            className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors"
                        >
                            <ArrowRight className="w-4 h-4 rotate-180" /> Back to History
                        </button>
                        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
                            <History className="w-4 h-4 text-blue-600" />
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Verification Session</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        {/* Scanner Interface */}
                        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-10">
                            <div className="relative aspect-square bg-slate-900 rounded-[3rem] overflow-hidden group cursor-pointer" onClick={() => setIsScanning(!isScanning)}>
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent opacity-50" />
                                
                                {isScanning ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                                        <div className="w-64 h-64 border-2 border-blue-500 rounded-[2rem] relative animate-pulse">
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-[scan_2s_infinite]" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <QrCode className="w-32 h-32 text-white/20" />
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] animate-pulse">Align QR Code Within Frame</p>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-slate-500">
                                        <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <Scan className="w-10 h-10" />
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Click to Initialize Camera</p>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleScan} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Manual ID Entry</label>
                                    <div className="flex gap-4">
                                        <div className="relative flex-1 group">
                                            <QrCode className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                            <input 
                                                type="text" 
                                                placeholder="SMP-000000"
                                                className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100/50 outline-none transition-all"
                                                value={sampleId}
                                                onChange={(e) => setSampleId(e.target.value)}
                                            />
                                        </div>
                                        <button 
                                            type="submit"
                                            className="bg-slate-900 hover:bg-blue-600 text-white px-10 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-slate-900/10"
                                        >
                                            Verify
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Result Section */}
                        <div className="space-y-8">
                            {status === "idle" && (
                                <div className="h-[600px] bg-slate-50 rounded-[3.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-12 gap-6 opacity-60">
                                    <Inbox className="w-16 h-16 text-slate-300" />
                                    <div>
                                        <h3 className="text-lg font-black text-slate-400 uppercase tracking-tight">Ready for Verification</h3>
                                        <p className="text-xs font-bold text-slate-400 mt-2">Scan sample barcodes to update their processing status.</p>
                                    </div>
                                </div>
                            )}

                            {status === "loading" && (
                                <div className="h-[600px] bg-white rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-6">
                                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cross-referencing Sample ID...</p>
                                </div>
                            )}

                            {status === "success" && (
                                <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden animate-in zoom-in duration-500">
                                    <div className="bg-emerald-500 p-8 text-white flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <CheckCircle2 className="w-8 h-8" />
                                            <div>
                                                <h3 className="text-lg font-black tracking-tight">Sample Verified</h3>
                                                <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest">{message}</p>
                                            </div>
                                        </div>
                                        <QrCode className="w-10 h-10 opacity-20" />
                                    </div>

                                    <div className="p-10 space-y-10">
                                        <div className="grid grid-cols-2 gap-8">
                                            <DataPoint label="Patient" value={sampleData?.patient?.name || "N/A"} icon={User} />
                                            <DataPoint label="Test Code" value={sampleData?.test?.name || "N/A"} icon={FlaskConical} />
                                            <DataPoint label="Verified At" value={new Date().toLocaleTimeString()} icon={Clock} />
                                            <DataPoint label="Container" value={sampleData?.containerType || "Standard Vial"} icon={ShieldCheck} />
                                        </div>

                                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-white hover:border-blue-200 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                                                    <Activity className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Processing Priority</p>
                                                    <p className="text-xs font-black text-slate-900 uppercase">Standard (TAT: 24hrs)</p>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-[8px] font-black uppercase tracking-widest">Update</span>
                                        </div>

                                        <button 
                                            onClick={() => { setStatus("idle"); setSampleId(""); }}
                                            className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl shadow-slate-900/10"
                                        >
                                            Verify Next Sample
                                        </button>
                                    </div>
                                </div>
                            )}

                            {status === "error" && (
                                <div className={cn(
                                    "rounded-[3.5rem] border p-12 text-center space-y-6 animate-in zoom-in duration-300",
                                    errorData?.isAlreadyVerified ? "bg-amber-50 border-amber-100" : "bg-rose-50 border-rose-100"
                                )}>
                                    {errorData?.isAlreadyVerified ? (
                                        <ShieldCheck className="w-20 h-20 text-amber-500 mx-auto" />
                                    ) : (
                                        <XCircle className="w-20 h-20 text-rose-500 mx-auto" />
                                    )}
                                    <div>
                                        <h3 className={cn(
                                            "text-2xl font-black",
                                            errorData?.isAlreadyVerified ? "text-amber-900" : "text-rose-900"
                                        )}>
                                            {errorData?.isAlreadyVerified ? "Already Verified" : "Verification Failed"}
                                        </h3>
                                        <p className={cn(
                                            "font-bold mt-2",
                                            errorData?.isAlreadyVerified ? "text-amber-600" : "text-rose-600"
                                        )}>{message}</p>
                                    </div>
                                    <button 
                                        onClick={() => setStatus("idle")}
                                        className={cn(
                                            "px-10 py-4 text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg",
                                            errorData?.isAlreadyVerified ? "bg-amber-600 shadow-amber-600/20" : "bg-rose-600 shadow-rose-600/20"
                                        )}
                                    >
                                        Try Different Sample
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes scan {
                    0%, 100% { top: 0; }
                    50% { top: 100%; }
                }
            `}</style>
        </div>
    );
}

function DataPoint({ label, value, icon: Icon }: any) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400">
                <Icon className="w-3 h-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{value}</p>
        </div>
    );
}
