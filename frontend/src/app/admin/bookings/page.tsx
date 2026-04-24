"use client";
import React, { useState, useEffect } from "react";
import Table from "../components/Table";
import { 
    Calendar, 
    Clock, 
    User, 
    Users, 
    MoreHorizontal, 
    CheckCircle, 
    XCircle,
    MapPin,
    ArrowRight
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Booking {
    _id: string;
    bookingId: string;
    patientName: string;
    date: string;
    time: string;
    assignedStaff: { _id: string, name: string } | null;
    status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
}

const BookingsPage = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/bookings"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setBookings(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const columns = [
        { 
            header: "Encounter ID", 
            accessor: "bookingId" as const,
            render: (row: Booking) => (
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">
                    {row.bookingId}
                </span>
            )
        },
        { 
            header: "Patient Name", 
            accessor: "patientName" as const,
            render: (row: Booking) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                        <User className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-900">{row.patientName}</span>
                </div>
            )
        },
        { 
            header: "Schedule", 
            accessor: "date" as const,
            render: (row: Booking) => (
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold">{new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">{row.time}</span>
                    </div>
                </div>
            )
        },
        { 
            header: "Assigned Personnel", 
            accessor: "assignedStaff" as const,
            render: (row: Booking) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Users className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold text-slate-600">
                        {row.assignedStaff ? row.assignedStaff.name : "Unassigned"}
                    </span>
                </div>
            )
        },
        { 
            header: "Operational Status", 
            accessor: "status" as const,
            render: (row: Booking) => (
                <div className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] w-fit border",
                    row.status === 'Completed' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                    row.status === 'Cancelled' ? "bg-rose-50 text-rose-700 border-rose-100" :
                    row.status === 'In Progress' ? "bg-blue-50 text-blue-700 border-blue-100 animate-pulse" :
                    "bg-amber-50 text-amber-700 border-amber-100"
                )}>
                    {row.status}
                </div>
            )
        }
    ];

    const actions = (row: Booking) => (
        <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
        </button>
    );

    return (
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Booking Operations</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Manage appointments, staff assignments, and session statuses.</p>
                </div>
                <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                    {['Today', 'Upcoming', 'History'].map((tab) => (
                        <button 
                            key={tab} 
                            className={cn(
                                "px-6 py-2 rounded-xl text-xs font-bold transition-all",
                                tab === 'Upcoming' ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "text-slate-500 hover:text-slate-900"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <Table 
                        columns={columns} 
                        data={bookings} 
                        actions={actions}
                    />
                </div>
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Live Queue Summary</h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-300">Active Sessions</span>
                                <span className="text-2xl font-black text-white">12</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-300">Staff On Duty</span>
                                <span className="text-2xl font-black text-white">08</span>
                            </div>
                            <div className="pt-6 border-t border-white/10">
                                <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2">
                                    Broadcast Update
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingsPage;
