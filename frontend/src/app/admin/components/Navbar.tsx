"use client";
import React, { useState, useEffect } from "react";
import { Bell, Search, User, Settings, HelpCircle, ChevronDown, Moon, Sun } from "lucide-react";

const Navbar: React.FC = () => {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        if (localStorage.getItem("theme") === "dark") {
            setDarkMode(true);
            document.documentElement.classList.add("dark");
        }
    }, []);

    const toggleDarkMode = () => {
        if (darkMode) {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
            setDarkMode(false);
        } else {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
            setDarkMode(true);
        }
    };

    return (
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8 sticky top-0 z-10 font-sans shadow-sm transition-colors">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search records..." 
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 dark:text-slate-200"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={toggleDarkMode}
                        className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all"
                    >
                        {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <button className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                    </button>
                    <button className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-800 cursor-pointer group">
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">Super Admin</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-1">Medoraa HQ</p>
                    </div>
                    <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                        <User className="w-4 h-4" />
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
            </div>
        </header>
    );
};

export default Navbar;
