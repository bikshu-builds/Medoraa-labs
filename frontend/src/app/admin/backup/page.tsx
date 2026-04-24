"use client";
import React, { useState } from "react";
import { 
    Database, 
    Download, 
    Upload, 
    RefreshCcw, 
    Clock, 
    FileArchive, 
    ShieldCheck,
    ChevronRight,
    Search,
    HardDrive
} from "lucide-react";
import { cn } from "@/lib/utils";

const BackupPage = () => {
    const backups = [
        { id: "BK-2024-04-20", size: "142 MB", date: "2024-04-20 02:00 AM", status: "Success", type: "Automatic" },
        { id: "BK-2024-04-19", size: "138 MB", date: "2024-04-19 02:00 AM", status: "Success", type: "Automatic" },
        { id: "BK-2024-04-18", size: "139 MB", date: "2024-04-18 02:00 AM", status: "Success", type: "Automatic" },
        { id: "BK-MANUAL-01", size: "135 MB", date: "2024-04-15 11:30 AM", status: "Success", type: "Manual" },
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Disaster Recovery</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Database snapshots, point-in-time recovery, and archival systems.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-xs text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                        <Upload className="w-4 h-4" />
                        Restore Snapshot
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95">
                        <RefreshCcw className="w-4 h-4" />
                        Initiate Manual Backup
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                <FileArchive className="w-5 h-5 text-blue-600" />
                                Available Snapshots
                            </h2>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Retention: 30 Days</span>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {backups.map((bk) => (
                                <div key={bk.id} className="p-6 hover:bg-slate-50/50 transition-all group flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                            <Database className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900">{bk.id}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bk.size}</span>
                                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bk.type}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-slate-700">{bk.date}</p>
                                            <div className="flex items-center gap-1.5 justify-end mt-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{bk.status}</span>
                                            </div>
                                        </div>
                                        <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all group-hover:shadow-lg">
                                            <Download className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-1/4 -translate-y-1/4">
                            <HardDrive className="w-40 h-40 text-blue-400" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Storage Quota</h3>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-end mb-3">
                                        <span className="text-xs font-bold text-slate-300">AWS S3 Utilization</span>
                                        <span className="text-lg font-black text-white">42.8 GB</span>
                                    </div>
                                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-blue-500 h-full w-[42%]" />
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-white/10">
                                    <div className="flex items-center gap-3 text-emerald-400">
                                        <ShieldCheck className="w-5 h-5" />
                                        <span className="text-xs font-bold">End-to-End Encrypted (AES-256)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-8">
                        <h4 className="text-sm font-black text-blue-900 flex items-center gap-2 mb-4">
                            <Clock className="w-5 h-5" />
                            Next Scheduled Cycle
                        </h4>
                        <p className="text-xs font-bold text-blue-700 leading-relaxed">System-wide automated snapshot will initiate in 14 hours (02:00 AM UTC).</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackupPage;
