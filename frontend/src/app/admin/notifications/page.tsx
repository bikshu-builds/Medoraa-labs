"use client";
import React, { useState, useEffect } from "react";
import { 
    Bell, 
    Check, 
    Trash2, 
    Info, 
    AlertTriangle, 
    CheckCircle, 
    XCircle,
    MoreVertical,
    Clock
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    readStatus: boolean;
    createdAt: string;
}

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/notifications"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setNotifications(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/notifications/read"), {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) fetchNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'error': return <XCircle className="w-5 h-5 text-rose-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Internal system updates and real-time alerts.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={markAsRead}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Check className="w-4 h-4 text-emerald-500" />
                        Mark All Read
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {notifications.length > 0 ? (
                    notifications.map((n) => (
                        <div 
                            key={n._id} 
                            className={cn(
                                "p-6 rounded-[1.5rem] border transition-all flex items-start gap-5 relative group",
                                n.readStatus 
                                ? "bg-white border-slate-100 opacity-70" 
                                : "bg-white border-blue-100 shadow-xl shadow-blue-600/5 ring-1 ring-blue-50"
                            )}
                        >
                            {!n.readStatus && (
                                <div className="absolute top-6 right-6 w-2 h-2 bg-blue-600 rounded-full" />
                            )}
                            <div className={cn(
                                "p-3 rounded-2xl shrink-0",
                                n.type === 'success' ? "bg-emerald-50" :
                                n.type === 'warning' ? "bg-amber-50" :
                                n.type === 'error' ? "bg-rose-50" : "bg-blue-50"
                            )}>
                                {getIcon(n.type)}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Clock className="w-3 h-3" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">{n.message}</p>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-slate-900 transition-all">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Bell className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-bold text-sm">No notifications found.</p>
                        <p className="text-slate-400 text-xs mt-1">Everything is up to date.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
