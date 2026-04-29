"use client";
import React, { useState, useEffect } from "react";
import { 
    X, 
    User, 
    Calendar, 
    Clock, 
    FlaskConical,
    Activity,
    CreditCard,
    Printer,
    Download,
    Loader2,
    CheckCircle2
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";

export default function BookingDetailsModal({ bookingId, isOpen, onClose }: { bookingId: string | null; isOpen: boolean; onClose: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && bookingId) {
            fetchDetails();
        } else {
            setData(null);
            setError(null);
        }
    }, [isOpen, bookingId]);

    const fetchDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("staffToken");
            const res = await fetch(getApiUrl(`/api/staff/booking-details/${bookingId}`), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const d = await res.json();
            if (d.success) {
                setData(d.data);
            } else {
                setError(d.message || "Failed to load booking details");
            }
        } catch (err: any) {
            console.error(err);
            setError("Connection Error: Could not reach server");
        } finally {
            setIsLoading(false);
        }
    };

    const downloadLabels = () => {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: [100, 150]
        });

        data.samples.forEach((sample: any, index: number) => {
            if (index !== 0) doc.addPage();
            
            doc.setFontSize(10);
            doc.text("MEDORAA LABS - SAMPLE LABEL", 50, 10, { align: "center" });
            doc.setLineWidth(0.5);
            doc.line(10, 12, 90, 12);

            doc.setFontSize(8);
            doc.text(`Patient: ${data.booking.patient.name}`, 10, 20);
            doc.text(`ID: ${data.booking.patient.patientId}`, 10, 25);
            doc.text(`Test: ${sample.test.name}`, 10, 30);
            
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(sample.sampleId, 50, 45, { align: "center" });

            // Mock barcode
            doc.setLineWidth(1);
            for (let i = 0; i < 30; i++) {
                if (Math.random() > 0.2) {
                    doc.line(20 + i * 2, 50, 20 + i * 2, 65);
                }
            }
        });

        doc.save(`Labels_${data.booking.bookingId}.pdf`);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />
            
            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in zoom-in duration-300">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    </div>
                ) : data ? (
                    <>
                        {/* Header */}
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                                    <Activity className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Booking Record: {data.booking.bookingId}</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Source: {data.booking.sourceType} • Date: {new Date(data.booking.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={downloadLabels}
                                    className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10"
                                >
                                    <Download className="w-4 h-4" /> Download Labels
                                </button>
                                <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-200">
                                    <X className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar p-10 space-y-12">
                            {/* Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                {/* Left Col: Patient & Payment */}
                                <div className="space-y-10">
                                    <section className="space-y-6">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Patient Profile</h3>
                                        <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-blue-600 font-black shadow-sm">
                                                    {data.booking.patient.name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{data.booking.patient.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">PID: {data.booking.patient.patientId}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Age / Gender</p>
                                                    <p className="text-[10px] font-bold text-slate-700">{data.booking.patient.age}Y / {data.booking.patient.gender}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                                                    <p className="text-[10px] font-bold text-slate-700">{data.booking.patient.phoneNumber}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="space-y-6">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Financial Audit</h3>
                                        <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                                <CreditCard className="w-20 h-20 text-emerald-600" />
                                            </div>
                                            <div className="relative z-10 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Amount Paid</span>
                                                    <span className="text-2xl font-black text-emerald-900 tracking-tighter">₹{data.booking.totalAmount}</span>
                                                </div>
                                                <div className="flex justify-between items-center pt-4 border-t border-emerald-100/50">
                                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{data.booking.paymentMethod}</span>
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">SUCCESS</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* Right Col: Barcode Labels */}
                                <div className="lg:col-span-2 space-y-8">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Generated Sample Labels</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {data.samples.map((sample: any, i: number) => (
                                            <div key={i} className="bg-white border-2 border-slate-50 rounded-[2rem] p-6 space-y-4 hover:border-blue-100 transition-all shadow-sm">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{sample.test.name}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Tube: Primary Container</p>
                                                    </div>
                                                    <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                                        {sample.sampleId}
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-slate-50 p-4 rounded-xl flex flex-col items-center gap-2 border border-slate-100">
                                                    <div className="flex items-end gap-0.5 h-8 w-full justify-center">
                                                        {[...Array(40)].map((_, j) => (
                                                            <div key={j} className="bg-slate-900 rounded-full" style={{ width: Math.random() > 0.7 ? '3px' : '1px', height: `${30 + Math.random() * 40}%` }} />
                                                        ))}
                                                    </div>
                                                    <p className="text-[8px] font-black font-mono tracking-[0.4em] text-slate-400">{sample.sampleId}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-6">
                        <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500">
                            <Activity className="w-10 h-10 opacity-20" />
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-slate-900 font-black uppercase tracking-widest text-xs">Data Access Error</p>
                            <p className="text-slate-400 font-bold text-sm max-w-xs">{error || "The requested booking record could not be retrieved."}</p>
                        </div>
                        <button 
                            onClick={fetchDetails}
                            className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                        >
                            Retry Loading
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
