"use client";
import React, { useState } from "react";
import { 
    HelpCircle, 
    MessageSquare, 
    Phone, 
    Mail, 
    ArrowRight, 
    LifeBuoy,
    CheckCircle2,
    Loader2,
    Send,
    ChevronRight
} from "lucide-react";
import { getApiUrl } from "@/lib/api";

export default function PatientSupport() {
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setSubmitted(true);
        }, 1500);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Support Center</h1>
                    <p className="text-slate-500 font-bold mt-1">We're here to help you with any queries or issues.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-black text-slate-900">+91 1800 200 300</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    {submitted ? (
                        <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm text-center space-y-6">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900">Ticket Raised Successfully!</h2>
                            <p className="text-slate-400 font-medium max-w-sm mx-auto">Our support team will review your query and get back to you within 4-6 business hours.</p>
                            <button 
                                onClick={() => setSubmitted(false)}
                                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
                            >
                                Raise Another Ticket
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">New Support Ticket</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Category</label>
                                    <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none">
                                        <option>Booking Issue</option>
                                        <option>Report Delay</option>
                                        <option>Payment Query</option>
                                        <option>Home Collection</option>
                                        <option>General Feedback</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Subject</label>
                                    <input 
                                        type="text" 
                                        placeholder="Brief summary of issue"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Detailed Description</label>
                                    <textarea 
                                        placeholder="Describe your concern in detail..."
                                        className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all min-h-[160px]"
                                        required
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Submit Query</>}
                            </button>
                        </form>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-900/20">
                        <LifeBuoy className="w-10 h-10 text-blue-500 mb-6" />
                        <h3 className="text-xl font-black mb-2">Live Assistance</h3>
                        <p className="text-slate-400 text-xs font-medium mb-8 leading-relaxed">Our clinical experts are available 24/7 to help you understand your reports or assist with bookings.</p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-blue-400">
                                <MessageSquare className="w-5 h-5" />
                                <span className="text-sm font-black">Live Chat</span>
                            </div>
                            <div className="flex items-center gap-4 text-blue-400">
                                <Mail className="w-5 h-5" />
                                <span className="text-sm font-black">support@medoraa.com</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Frequently Asked</h4>
                        <div className="space-y-4">
                            {["How to download reports?", "Fasting requirements", "Reschedule policy"].map((q, i) => (
                                <button key={i} className="w-full flex items-center justify-between text-left group">
                                    <span className="text-xs font-black text-slate-700 group-hover:text-blue-600 transition-colors">{q}</span>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
