"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
    Menu,
    Search,
    ShoppingCart,
    Bell,
    User,
    ChevronDown,
    Activity
} from "lucide-react";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";
import { appEvents } from "@/lib/events";

interface NavbarProps {
    onMenuClick: () => void;
}

interface PatientData {
    name: string;
    patientId?: string;
}

const PatientNavbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
    const [patient, setPatient] = useState<PatientData | null>(null);
    const [cartCount, setCartCount] = useState(0);
    const [notifCount, setNotifCount] = useState(0);

    const fetchCounts = useCallback(async () => {
        const token = localStorage.getItem("patientToken");
        if (!token) return;

        try {
            const [cartRes, notifRes] = await Promise.all([
                fetch(getApiUrl("/api/patient/cart"), {
                    headers: { "Authorization": `Bearer ${token}` }
                }),
                fetch(getApiUrl("/api/patient/notifications"), {
                    headers: { "Authorization": `Bearer ${token}` }
                })
            ]);

            const cartData = await cartRes.json();
            if (cartData.success) {
                const count = cartData.data?.items?.length || 0;
                setCartCount(count);
                console.log("[Navbar] Cart count:", count, "items:", cartData.data?.items);
            }

            const notifData = await notifRes.json();
            if (notifData.success) {
                const count = (notifData.data?.filter((n: any) => !n.readStatus).length) || 0;
                setNotifCount(count);
                console.log("[Navbar] Unread notifications:", count);
            }
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("patientToken");
            if (!token) return;
            try {
                const profileRes = await fetch(getApiUrl("/api/patient/profile"), {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const profileData = await profileRes.json();
                if (profileData.success) setPatient(profileData.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchProfile();
        fetchCounts();

        const unsubCart = appEvents.on("cartUpdated", fetchCounts);
        const unsubNotif = appEvents.on("notificationsUpdated", fetchCounts);

        const onStorage = (e: StorageEvent) => {
            if (e.key === "patientToken" && !e.newValue) {
                setCartCount(0);
                setNotifCount(0);
                setPatient(null);
            }
        };
        window.addEventListener("storage", onStorage);

        return () => {
            unsubCart();
            unsubNotif();
            window.removeEventListener("storage", onStorage);
        };
    }, [fetchCounts]);

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="h-20 bg-white border-b border-slate-100 sticky top-0 z-30 flex items-center px-6 md:px-10 justify-between">
            {/* Mobile Menu & Logo */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2.5 hover:bg-slate-50 rounded-xl md:hidden text-slate-600 transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="md:hidden flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                        <Activity className="w-5 h-5" />
                    </div>
                </div>

                {/* Desktop Search */}
                <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg w-96 group focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100/50 transition-all">
                    <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                    <input
                        type="text"
                        placeholder="Search for blood tests, health packages..."
                        className="bg-transparent border-none outline-none text-sm font-medium w-full text-slate-700 placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-5">
                <Link href="/patient/cart" className="p-2.5 hover:bg-slate-50 rounded-lg text-slate-600 relative group transition-all">
                    <ShoppingCart className="w-5 h-5 group-hover:text-blue-600" />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-blue-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">
                            {cartCount}
                        </span>
                    )}
                </Link>

                <Link href="/patient/notifications" className="p-2.5 hover:bg-slate-50 rounded-lg text-slate-600 relative group transition-all">
                    <Bell className="w-5 h-5 group-hover:text-blue-600" />
                    {notifCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">
                            {notifCount}
                        </span>
                    )}
                </Link>

                <div className="h-8 w-px bg-slate-100 mx-1 hidden md:block" />

                <Link href="/patient/profile" className="flex items-center gap-3 p-1.5 hover:bg-slate-50 rounded-lg transition-all group border border-transparent hover:border-slate-200">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {patient ? getInitials(patient.name) : "??"}
                    </div>
                    <div className="hidden md:flex flex-col items-start mr-1">
                        <span className="text-xs font-bold text-slate-900 leading-tight">{patient?.name || "Patient"}</span>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{patient?.patientId || "P-XXXXXX"}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
                </Link>
            </div>
        </header>
    );
};

export default PatientNavbar;
