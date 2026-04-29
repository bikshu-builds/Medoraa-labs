"use client";
import React, { useState, useRef } from "react";
import { 
    X, 
    User, 
    Stethoscope, 
    FileText, 
    CreditCard, 
    QrCode, 
    Printer,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    collection: any;
    onUpdate: (data: any) => Promise<void>;
}

export default function CollectionWorkflowModal({ isOpen, onClose, collection, onUpdate }: ModalProps) {
    const [step, setStep] = useState(1);
    const [doctorRef, setDoctorRef] = useState("");
    const [notes, setNotes] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"UPI" | "Cash" | "Card">("Cash");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    if (!isOpen || !collection) return null;

    const handleSaveDetails = async () => {
        setIsSubmitting(true);
        const signature = canvasRef.current?.toDataURL();
        await onUpdate({
            collectionId: collection._id,
            status: "Sample Collected",
            doctorReference: doctorRef,
            medicalNotes: notes,
            patientSignature: signature
        });
        setStep(2);
        setIsSubmitting(false);
    };

    const handleCompletePayment = async () => {
        setIsSubmitting(true);
        await onUpdate({
            collectionId: collection._id,
            status: "Payment Completed",
            paymentMethod,
            paymentAmount: collection.booking.totalAmount
        });
        setStep(3);
        setIsSubmitting(false);
    };

    const handlePrintLabel = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Collection Point</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Order ID: {collection.booking.bookingId}</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="flex h-1.5 bg-slate-100">
                    <div className={cn("transition-all duration-500 bg-blue-600", step >= 1 ? "w-1/3" : "w-0")} />
                    <div className={cn("transition-all duration-500 bg-blue-600", step >= 2 ? "w-1/3" : "w-0")} />
                    <div className={cn("transition-all duration-500 bg-blue-600", step >= 3 ? "w-1/3" : "w-0")} />
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {step === 1 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center gap-4 p-6 bg-blue-50 rounded-[2rem] border border-blue-100/50">
                                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-blue-600 font-black text-xl shadow-sm border border-blue-100">
                                    {collection.booking.patientName[0]}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase leading-none mb-2">{collection.booking.patientName}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verify identity before collection</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Doctor Reference</label>
                                    <div className="relative">
                                        <Stethoscope className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            value={doctorRef}
                                            onChange={(e) => setDoctorRef(e.target.value)}
                                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold focus:bg-white focus:border-blue-600 transition-all outline-none" 
                                            placeholder="Dr. Name / Hospital"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Medical Notes</label>
                                    <div className="relative">
                                        <FileText className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold focus:bg-white focus:border-blue-600 transition-all outline-none" 
                                            placeholder="Fasting status, etc."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Patient Signature</label>
                                <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-4 relative h-40">
                                    <canvas 
                                        ref={canvasRef}
                                        className="w-full h-full cursor-crosshair"
                                        onMouseDown={(e) => {
                                            const canvas = canvasRef.current;
                                            if (!canvas) return;
                                            const ctx = canvas.getContext('2d');
                                            if (!ctx) return;
                                            ctx.lineWidth = 2;
                                            ctx.lineCap = 'round';
                                            ctx.strokeStyle = '#000';
                                            ctx.beginPath();
                                            ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                                            canvas.onmousemove = (ev) => {
                                                ctx.lineTo(ev.offsetX, ev.offsetY);
                                                ctx.stroke();
                                            };
                                        }}
                                        onMouseUp={() => {
                                            const canvas = canvasRef.current;
                                            if (canvas) canvas.onmousemove = null;
                                        }}
                                    />
                                    <button 
                                        onClick={() => {
                                            const canvas = canvasRef.current;
                                            if (canvas) canvas.getContext('2d')?.clearRect(0,0, canvas.width, canvas.height);
                                        }}
                                        className="absolute bottom-4 right-4 px-4 py-2 bg-white text-[9px] font-black uppercase tracking-widest rounded-xl border border-slate-100 shadow-sm"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-black text-slate-900 uppercase">Payment Collection</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount to collect: ₹{collection.booking.totalAmount}</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {["UPI", "Cash", "Card"].map((m: any) => (
                                    <button 
                                        key={m}
                                        onClick={() => setPaymentMethod(m)}
                                        className={cn(
                                            "flex flex-col items-center gap-4 p-8 rounded-[2rem] border transition-all",
                                            paymentMethod === m ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200" : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-white"
                                        )}
                                    >
                                        <CreditCard className="w-8 h-8" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{m}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100/50 flex gap-4">
                                <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                                <p className="text-[11px] font-bold text-amber-700 leading-relaxed">Ensure payment is received before marking as completed. For UPI, please verify the transaction on your app.</p>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-in zoom-in duration-500 text-center py-10">
                            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase">Collection Complete</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest max-w-[200px] mx-auto">Samples collected and payment verified successfully.</p>

                            <div className="mt-12 bg-slate-50 p-8 rounded-[3rem] border border-slate-100 space-y-6">
                                <div className="flex items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                                    <QrCode className="w-24 h-24 text-slate-900" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[14px] font-black text-slate-900 tracking-tight uppercase">SMP-{Math.floor(100000 + Math.random()*900000)}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Unique Sample ID</p>
                                </div>
                                <button 
                                    onClick={handlePrintLabel}
                                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    <Printer className="w-4 h-4" /> Print Sample Labels
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-slate-100 flex gap-4">
                    {step === 1 && (
                        <button 
                            onClick={handleSaveDetails}
                            disabled={isSubmitting}
                            className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isSubmitting ? "Saving..." : "Save & Proceed to Payment"}
                        </button>
                    )}
                    {step === 2 && (
                        <button 
                            onClick={handleCompletePayment}
                            disabled={isSubmitting}
                            className="flex-1 bg-emerald-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isSubmitting ? "Processing..." : "Confirm Payment & Finish"}
                        </button>
                    )}
                    {step === 3 && (
                        <button 
                            onClick={onClose}
                            className="flex-1 bg-slate-100 text-slate-900 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all"
                        >
                            Close Dashboard
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
