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
    Activity,
    ShieldCheck,
    FlaskConical,
    Receipt
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function PatientBookings() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const iconUrl = "https://i.pinimg.com/736x/d0/6a/13/d06a13ce1f4da8d86989657faabf6276.jpg";

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
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-[#1A3263] animate-spin" />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Retrieving your bookings...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#1A3263] tracking-tight">Health History</h1>
                    <p className="text-gray-500 font-medium mt-1">Track your diagnostic journey and reports.</p>
                </div>
                <Link 
                    href="/patient/tests"
                    className="inline-flex items-center gap-2 bg-[#1A3263] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#124170] transition-all shadow-lg shadow-[#1A3263]/20"
                >
                    Book New Test
                </Link>
            </div>

            <div className="space-y-5">
                {bookings.length > 0 ? (
                    bookings.map((booking) => (
                        <div 
                            key={booking._id} 
                            className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] transition-all duration-500 group relative overflow-hidden"
                        >
                            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                                {/* Date Block */}
                                <div className="flex items-center gap-5 shrink-0">
                                    <div className="w-16 h-20 rounded-2xl bg-[#F8FAFC] border border-gray-100 flex flex-col items-center justify-center shadow-sm">
                                        <span className="text-[10px] font-bold text-[#4295A5] uppercase tracking-wider">
                                            {new Date(booking.date).toLocaleDateString('en-IN', { month: 'short' })}
                                        </span>
                                        <span className="text-2xl font-black text-[#1A3263]">
                                            {new Date(booking.date).toLocaleDateString('en-IN', { day: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="w-px h-12 bg-gray-100 hidden sm:block" />
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                                            <Clock className="w-3.5 h-3.5" />
                                            {booking.time}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[#4295A5] font-bold text-[10px] uppercase tracking-widest">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            Verified
                                        </div>
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 flex gap-6 items-center min-w-0">
                                    <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                        <img src={iconUrl} alt="Booking" className="w-10 h-10 object-contain" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-lg font-bold text-[#1A3263] truncate mb-1">
                                            {booking.tests.map((t: any) => t.name).join(", ")}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                                                <Receipt className="w-3.5 h-3.5" />
                                                ID: {booking.bookingId}
                                            </span>
                                            <span className="px-2.5 py-0.5 bg-[#F1F5F9] text-[#406093] rounded-md text-[9px] font-bold uppercase tracking-wide">
                                                {booking.sourceType}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Amount */}
                                <div className="flex items-center justify-between lg:justify-end w-full lg:w-auto gap-8 pt-6 lg:pt-0 border-t lg:border-t-0 border-gray-50">
                                    <div className="flex flex-col lg:items-end">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Paid</span>
                                        <span className="text-xl font-bold text-[#1A3263]">₹{booking.totalAmount}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-colors",
                                            booking.status === 'Completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                            booking.status === 'Cancelled' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                            "bg-[#E8F6F8] text-[#4295A5] border-[#E8F6F8]"
                                        )}>
                                            {booking.status}
                                        </div>
                                        <button className="w-10 h-10 rounded-xl bg-[#F8FAFC] hover:bg-[#1A3263] hover:text-white transition-all flex items-center justify-center text-[#1A3263] shadow-sm">
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-24 bg-white rounded-[32px] border border-gray-50 shadow-sm text-center">
                        <div className="w-20 h-20 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-6">
                            <ClipboardList className="w-10 h-10 text-gray-200" />
                        </div>
                        <h3 className="text-xl font-bold text-[#1A3263]">No bookings found</h3>
                        <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">You haven't scheduled any tests yet. Your health history will appear here.</p>
                        <Link 
                            href="/patient/tests"
                            className="inline-flex items-center gap-2 bg-[#1A3263] text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-[#124170] transition-all shadow-lg shadow-[#1A3263]/20 mt-8"
                        >
                            Browse Catalog
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
