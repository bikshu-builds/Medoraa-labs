"use client";
import React, { useState } from "react";
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
    FlaskConical
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function SampleReception() {
    const [isScanning, setIsScanning] = useState(false);
    const [sampleId, setSampleId] = useState("");
    const [sampleData, setSampleData] = useState<any>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleScan = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!sampleId) return;

        setStatus("loading");
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
            }
        } catch (err) {
            setStatus("error");
            setMessage("Connection failure. Check scanner connection.");
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                    <Inbox className="w-10 h-10 text-blue-600" />
                    Central Reception
                </h1>
                <p className="text-slate-500 font-bold mt-2">Scan incoming samples to register them for laboratory processing.</p>
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
                                    Register
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
                                <h3 className="text-lg font-black text-slate-400 uppercase tracking-tight">Awaiting Scan</h3>
                                <p className="text-xs font-bold text-slate-400 mt-2">Validated samples will appear here for review.</p>
                            </div>
                        </div>
                    )}

                    {status === "loading" && (
                        <div className="h-[600px] bg-white rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-6">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authenticating Sample ID...</p>
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
                                    <DataPoint label="Received At" value={new Date().toLocaleTimeString()} icon={Clock} />
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
                                    onClick={() => setStatus("idle")}
                                    className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl shadow-slate-900/10"
                                >
                                    Done: Next Sample
                                </button>
                            </div>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="bg-rose-50 rounded-[3.5rem] border border-rose-100 p-12 text-center space-y-6 animate-in shake-in">
                            <XCircle className="w-20 h-20 text-rose-500 mx-auto" />
                            <div>
                                <h3 className="text-2xl font-black text-rose-900">Verification Failed</h3>
                                <p className="text-rose-600 font-bold mt-2">{message}</p>
                            </div>
                            <button 
                                onClick={() => setStatus("idle")}
                                className="px-10 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-rose-600/20"
                            >
                                Retry Scanning
                            </button>
                        </div>
                    )}
                </div>
            </div>

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
