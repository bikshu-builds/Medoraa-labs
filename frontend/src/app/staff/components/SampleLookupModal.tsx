"use client";
import React, { useState } from "react";
import { 
    Search, 
    X, 
    Activity, 
    User, 
    Calendar, 
    Clock, 
    FlaskConical,
    FileText,
    ArrowRight,
    Loader2
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function SampleLookupModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query) return;

        setIsLoading(true);
        setError("");
        setResult(null);

        try {
            const token = localStorage.getItem("staffToken");
            const res = await fetch(getApiUrl(`/api/staff/lookup/${query}`), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const d = await res.json();
            if (d.success) {
                setResult(d);
            } else {
                setError(d.message || "Record not found");
            }
        } catch (err) {
            setError("Connection error");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />
            
            <div className="bg-white w-full max-w-4xl h-[80vh] rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in zoom-in duration-300">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                            <Search className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Identity Lookup</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Scan barcode or enter Sample ID / Patient ID</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-all">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-10">
                    {/* Search Input */}
                    <form onSubmit={handleSearch} className="mb-12">
                        <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100 transition-all">
                            <Search className="w-6 h-6 text-slate-300" />
                            <input 
                                type="text" 
                                placeholder="Scan Barcode now..." 
                                className="bg-transparent border-none outline-none text-xl font-black text-slate-900 w-full placeholder:text-slate-200 uppercase tracking-widest"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                autoFocus
                            />
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                            ) : (
                                <button type="submit" className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all">
                                    Lookup
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Result Area */}
                    {error && (
                        <div className="py-20 text-center space-y-4">
                            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
                                <X className="w-8 h-8" />
                            </div>
                            <p className="text-sm font-bold text-slate-500">{error}</p>
                        </div>
                    )}

                    {result?.type === "Sample" && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Sample Info */}
                                <div className="space-y-8">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sample Intelligence</h3>
                                    <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">
                                                {result.data.sampleId}
                                            </div>
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                                {result.data.status}
                                            </span>
                                        </div>
                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Test</p>
                                                <p className="text-lg font-black text-slate-900 leading-tight">{result.data.test.name}</p>
                                            </div>
                                            <div className="flex items-center gap-10">
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p>
                                                    <p className="text-xs font-bold text-slate-700">{result.data.test.category}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Price</p>
                                                    <p className="text-xs font-bold text-slate-700">₹{result.data.test.price}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Patient Info */}
                                <div className="space-y-8">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Demographic Context</h3>
                                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
                                        <div className="flex items-center gap-6 mb-8">
                                            <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl">
                                                {result.data.patient.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-slate-900 uppercase tracking-tight">{result.data.patient.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">PID: {result.data.patient.patientId}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Age / Gender</p>
                                                <p className="text-xs font-bold text-slate-700">{result.data.patient.age}Y / {result.data.patient.gender}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                                                <p className="text-xs font-bold text-slate-700">{result.data.patient.phoneNumber}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline / Booking Info */}
                            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-10 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                                    <Clock className="w-40 h-40" />
                                </div>
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Clinical Timeline</p>
                                        <div className="flex items-center gap-10">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="w-4 h-4 text-blue-400" />
                                                <span className="text-xs font-bold text-slate-300">{new Date(result.data.booking.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Clock className="w-4 h-4 text-blue-400" />
                                                <span className="text-xs font-bold text-slate-300">{result.data.booking.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Booking ID</p>
                                        <p className="text-xl font-black text-blue-400">{result.data.booking.bookingId}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
