"use client";
import React from "react";
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

interface NavbarProps {
    onMenuClick: () => void;
}

const PatientNavbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
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
                <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl w-96 group focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
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
                <Link href="/patient/cart" className="p-3 hover:bg-slate-50 rounded-2xl text-slate-600 relative group transition-all">
                    <ShoppingCart className="w-5 h-5 group-hover:text-blue-600" />
                    <span className="absolute top-2 right-2 w-4 h-4 bg-blue-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">0</span>
                </Link>
                
                <Link href="/patient/notifications" className="p-3 hover:bg-slate-50 rounded-2xl text-slate-600 relative group transition-all">
                    <Bell className="w-5 h-5 group-hover:text-blue-600" />
                    <div className="absolute top-3 right-3.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                </Link>

                <div className="h-8 w-px bg-slate-100 mx-1 hidden md:block" />

                <Link href="/patient/profile" className="flex items-center gap-3 p-1.5 hover:bg-slate-50 rounded-2xl transition-all group">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-all">
                        JD
                    </div>
                    <div className="hidden md:flex flex-col items-start mr-1">
                        <span className="text-xs font-black text-slate-900 leading-tight">John Doe</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Premium Patient</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
                </Link>
            </div>
        </header>
    );
};

export default PatientNavbar;
