"use client";
import React, { useEffect, useState } from "react";
import {
    Bell,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Trash2,
    Search,
    Loader2
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { appEvents } from "@/lib/events";

export default function PatientNotifications() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("patientToken");
            const res = await fetch(getApiUrl("/api/patient/notifications"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const d = await res.json();
            if (d.success) setNotifications(d.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications().then(() => appEvents.emit("notificationsUpdated"));
    }, []);

    const deleteNotification = async (id: string) => {
        try {
            const token = localStorage.getItem("patientToken");
            await fetch(getApiUrl(`/api/patient/notifications/${id}`), {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            setNotifications(prev => prev.filter(n => n._id !== id));
            appEvents.emit("notificationsUpdated");
        } catch (err) {
            console.error(err);
        }
    };

    const markAllRead = async () => {
        try {
            const token = localStorage.getItem("patientToken");
            await fetch(getApiUrl("/api/patient/notifications/mark-all-read"), {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
            appEvents.emit("notificationsUpdated");
        } catch (err) {
            console.error(err);
        }
    };

    if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notification Center</h1>
                    <p className="text-slate-500 font-bold mt-1">Stay updated with your reports and appointments.</p>
                </div>
                <button onClick={markAllRead} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Mark all as read</button>
            </div>

            <div className="space-y-4">
                {notifications.length > 0 ? (
                    notifications.map((notif) => (
                        <div key={notif._id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-start gap-6 hover:shadow-xl hover:shadow-slate-200/40 transition-all group">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                <Bell className="w-7 h-7" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-base font-black text-slate-900 truncate">{notif.title}</h3>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-4 whitespace-nowrap">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed">{notif.message}</p>
                            </div>
                            <button onClick={() => deleteNotification(notif._id)} className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm text-center">
                        <Bell className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-slate-900">All caught up!</h3>
                        <p className="text-slate-400 font-bold mt-2">You don't have any new notifications at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
