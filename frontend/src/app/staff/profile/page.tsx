"use client";
import React, { useEffect, useState } from "react";
import { 
    User, 
    Mail, 
    Phone, 
    ShieldCheck, 
    Lock, 
    Camera, 
    Briefcase,
    Activity,
    Award,
    Calendar,
    Settings,
    ChevronRight,
    LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StaffProfile() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("staffUser");
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("staffToken");
        window.location.href = "/staff/login";
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Header / Banner */}
            <div className="relative h-64 rounded-[4rem] bg-slate-900 overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent opacity-50" />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent" />
                
                <div className="absolute -bottom-16 left-12 flex items-end gap-10">
                    <div className="relative group">
                        <div className="w-40 h-40 rounded-[3rem] bg-white p-2 shadow-2xl">
                            <div className="w-full h-full rounded-[2.5rem] bg-slate-100 flex items-center justify-center text-slate-300 relative overflow-hidden group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                <User className="w-20 h-20" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-4 right-4 w-10 h-10 bg-blue-600 rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-xl">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mb-20">
                        <h1 className="text-4xl font-black text-white tracking-tight uppercase leading-none mb-3">{user?.name || "Staff Member"}</h1>
                        <div className="flex items-center gap-4 text-blue-400">
                            <Briefcase className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest">{user?.role || "Medical Professional"}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-16">
                {/* Left Column: Info */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                        <div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Contact Credentials</h3>
                            <div className="space-y-6">
                                <InfoItem icon={Mail} label="Official Email" value={user?.email || "N/A"} />
                                <InfoItem icon={Phone} label="Work Mobile" value={user?.phoneNumber || "N/A"} />
                                <InfoItem icon={ShieldCheck} label="Staff ID" value={user?.staffId || "N/A"} />
                            </div>
                        </div>

                        <div className="pt-10 border-t border-slate-50">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">System Access</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <Lock className="w-4 h-4 text-slate-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Password</span>
                                    </div>
                                    <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Update</button>
                                </div>
                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-100 group hover:bg-rose-600 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <LogOut className="w-4 h-4 text-rose-600 group-hover:text-white" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 group-hover:text-white">Sign Out</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-rose-200 group-hover:text-white" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Experience & Stats */}
                <div className="lg:col-span-2 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ProfileStat label="Samples Processed" value="1,240" icon={Activity} color="blue" />
                        <ProfileStat label="TAT Compliance" value="99.4%" icon={Award} color="emerald" />
                    </div>

                    <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Work Experience & Records</h3>
                            <Settings className="w-5 h-5 text-slate-200 cursor-pointer hover:text-blue-600 transition-all" />
                        </div>

                        <div className="space-y-8">
                            <RecordItem 
                                title="Senior Pathologist Appointment" 
                                date="March 2022 - Present" 
                                desc="Managing diagnostic workflow for clinical hematology and biochemistry departments."
                            />
                            <RecordItem 
                                title="Specialized Hematology Training" 
                                date="Jan 2024" 
                                desc="Completed advanced training on robotic automated sample processing units."
                            />
                            <RecordItem 
                                title="Employee of the Month" 
                                date="Oct 2023" 
                                desc="Awarded for maintaining zero-error clinical reporting for 12 consecutive months."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon: Icon, label, value }: any) {
    return (
        <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{value}</p>
            </div>
        </div>
    );
}

function ProfileStat({ label, value, icon: Icon, color }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-900/5",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-900/5"
    };

    return (
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex items-center gap-8 group hover:border-blue-200 transition-all">
            <div className={cn("w-16 h-16 rounded-[2rem] flex items-center justify-center transition-transform group-hover:scale-110", colors[color])}>
                <Icon className="w-8 h-8" />
            </div>
            <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</h4>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
            </div>
        </div>
    );
}

function RecordItem({ title, date, desc }: any) {
    return (
        <div className="relative pl-10 border-l-2 border-slate-50 pb-2">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm" />
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{title}</h4>
                    <span className="px-3 py-1 bg-slate-50 rounded-lg text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> {date}
                    </span>
                </div>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
