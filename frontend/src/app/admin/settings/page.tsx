"use client";
import React, { useState, useEffect } from "react";
import { 
    Settings, 
    Globe, 
    Mail, 
    Phone, 
    MapPin, 
    Shield, 
    Bell, 
    Save, 
    Database,
    Image as ImageIcon
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

const SettingsPage = () => {
    const [settings, setSettings] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/settings"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setSettings(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const tabs = [
        { name: "General", icon: Globe },
        { name: "Communication", icon: Mail },
        { name: "Security", icon: Shield },
        { name: "Notifications", icon: Bell },
        { name: "Infrastructure", icon: Database },
    ];

    const [activeTab, setActiveTab] = useState("General");

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Configuration</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Global parameters, identity settings, and service integrations.</p>
                </div>
                <button className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold text-xs hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-600/20">
                    <Save className="w-4 h-4" />
                    Commit Changes
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-64 shrink-0 space-y-2">
                    {tabs.map((tab) => (
                        <button 
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                                activeTab === tab.name 
                                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" 
                                : "text-slate-500 hover:bg-white hover:text-slate-900"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.name}
                        </button>
                    ))}
                </div>

                <div className="flex-1 space-y-6">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-black text-slate-900 mb-8 border-b border-slate-50 pb-6">{activeTab} Parameters</h2>
                        
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Laboratory Identity</label>
                                    <input 
                                        type="text" 
                                        defaultValue="Medoraa Labs & Diagnostics"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[1.25rem] text-sm font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Official Contact</label>
                                    <input 
                                        type="email" 
                                        defaultValue="ops@medoraa.com"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[1.25rem] text-sm font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Corporate Address</label>
                                <textarea 
                                    rows={3}
                                    defaultValue="Medoraa Tower, 4th Floor, Tech Park, Bangalore, KA - 560001"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[1.25rem] text-sm font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all outline-none resize-none"
                                />
                            </div>

                            <div className="pt-6 border-t border-slate-50">
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:bg-white hover:border-blue-300 transition-all cursor-pointer">
                                        <ImageIcon className="w-6 h-6" />
                                        <span className="text-[8px] font-black uppercase tracking-widest">Update Logo</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">Brand Identity</h4>
                                        <p className="text-xs text-slate-400 font-medium mt-1">Recommended size: 512x512px. SVG or Transparent PNG preferred.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
