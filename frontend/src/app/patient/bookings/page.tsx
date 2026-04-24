"use client";
import React, { useEffect, useState } from "react";
import { 
    ClipboardList, 
    Calendar, 
    Clock, 
    MapPin, 
    MoreVertical, 
    ArrowRight,
    Loader2,
    CheckCircle2,
    XCircle,
    Activity
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function PatientBookings() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem("patientToken");
                const res = await fetch(getApiUrl("/api/patient/bookings"), {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const d = await res.json();
                if (d.success) setBookings(d.data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBookings();
    }, []);

    if (isLoading) {
        return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Booking History</h1>
                    <p className="text-slate-500 font-bold mt-1">Track your active appointments and past clinical sessions.</p>
                </div>
            </div>

            <div className="space-y-6">
                {bookings.length > 0 ? (
                    bookings.map((booking) => (
                        <div key={booking._id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group relative overflow-hidden">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-black border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                        <Activity className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-xl font-black text-slate-900">{booking.tests.map((t: any) => t.name).join(", ")}</h3>
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                booking.status === 'Completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                booking.status === 'Cancelled' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                "bg-blue-50 text-blue-600 border-blue-100"
                                            )}>
                                                {booking.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-slate-400">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{new Date(booking.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{booking.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 md:text-right">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Billing Total</span>
                                        <span className="text-2xl font-black text-slate-900">₹{booking.totalAmount}</span>
                                    </div>
                                    <button className="p-4 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl transition-all shadow-sm">
                                        <ArrowRight className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="mt-8 pt-8 border-t border-slate-50 flex flex-wrap gap-6 items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type: {booking.bookingType}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${booking.paymentStatus === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment: {booking.paymentStatus}</span>
                                </div>
                                <span className="ml-auto text-[10px] font-black text-slate-300 uppercase tracking-widest">Ref: {booking.bookingId}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm text-center">
                        <ClipboardList className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-slate-900">No active bookings</h3>
                        <p className="text-slate-400 font-bold mt-2">Ready for a health check? Browse our catalog.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
