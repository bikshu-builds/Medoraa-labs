"use client";
import React, { useState } from "react";
import { 
    Activity, 
    Lock, 
    User, 
    ArrowRight, 
    Loader2,
    ShieldCheck,
    AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/api";

export default function StaffLogin() {
    const [staffId, setStaffId] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch(getApiUrl("/api/staff/login"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ staffId, password })
            });
            const d = await res.json();
            if (d.success) {
                localStorage.setItem("staffToken", d.token);
                localStorage.setItem("staffUser", JSON.stringify(d.data));
                router.push("/staff/dashboard");
            } else {
                setError(d.message);
            }
        } catch (err) {
            setError("Connection failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                {/* Left Side - Visual */}
                <div className="hidden lg:flex flex-col gap-12 bg-slate-900 p-16 rounded-[4rem] text-white relative overflow-hidden h-[700px] justify-between">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-16">
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                                <Activity className="w-7 h-7" />
                            </div>
                            <h1 className="text-2xl font-black tracking-tighter">MEDORAA LABS</h1>
                        </div>
                        <h2 className="text-6xl font-black leading-[1.1] tracking-tight mb-8">Clinical <br />Workflow <br />Optimized.</h2>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm">Access your assigned tasks, manage laboratory workflows, and deliver verified clinical reports with precision.</p>
                    </div>

                    <div className="relative z-10 flex items-center gap-6 p-8 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
                        <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-black uppercase tracking-widest text-white mb-1">Authorized Access Only</p>
                            <p className="text-xs font-bold text-slate-500">Protocol-compliant secure workstation environment.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full max-w-md mx-auto space-y-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 lg:hidden mb-12">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                                <Activity className="w-6 h-6" />
                            </div>
                            <h1 className="text-xl font-black">MEDORAA</h1>
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tight">Staff Portal</h3>
                        <p className="text-slate-400 font-bold">Please authenticate to access your diagnostic workflow.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-8">
                        {error && (
                            <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 text-rose-600 animate-in fade-in zoom-in">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p className="text-xs font-black uppercase tracking-widest">{error}</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Staff Identification</label>
                                <div className="relative group">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="STF-0000"
                                        value={staffId}
                                        onChange={(e) => setStaffId(e.target.value)}
                                        className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100/50 outline-none transition-all placeholder:text-slate-300"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Secure Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                    <input 
                                        type="password" 
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100/50 outline-none transition-all placeholder:text-slate-300"
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-900 hover:bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:bg-slate-300"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Authenticate Access</>}
                        </button>
                    </form>

                    <div className="pt-8 border-t border-slate-100">
                        <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest leading-loose">
                            Security Protocol: Session expires after 12 hours of inactivity. <br />
                            Forgot ID? Contact Lab Administrator.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
