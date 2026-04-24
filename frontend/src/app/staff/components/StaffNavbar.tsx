"use client";
import React from "react";
import { 
    Menu, 
    Search, 
    Bell, 
    Settings,
    User,
    ChevronDown,
    Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StaffNavbar({ onMenuClick }: { onMenuClick: () => void }) {
    return (
        <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-30">
            {/* Mobile Menu Toggle */}
            <button 
                onClick={onMenuClick}
                className="md:hidden p-3 hover:bg-slate-50 rounded-2xl transition-all"
            >
                <Menu className="w-6 h-6 text-slate-600" />
            </button>

            {/* Search - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl w-96 group focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all border border-transparent focus-within:border-blue-200">
                <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                <input 
                    type="text" 
                    placeholder="Search patients, samples or tests..." 
                    className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 w-full placeholder:text-slate-400 uppercase tracking-widest"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
                {/* Notifications */}
                <button className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 relative group transition-all">
                    <Bell className="w-5 h-5 group-hover:text-blue-600" />
                    <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                </button>

                <div className="w-px h-8 bg-slate-100 mx-2" />

                {/* Profile Toggle */}
                <button className="flex items-center gap-4 p-1.5 hover:bg-slate-50 rounded-2xl transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100 font-black text-xs">
                        JD
                    </div>
                    <div className="hidden lg:block text-left mr-2">
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">John Doe</p>
                        <p className="text-[9px] font-bold text-blue-600 uppercase tracking-[0.15em]">Lab Pathologist</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </button>
            </div>
        </header>
    );
}
