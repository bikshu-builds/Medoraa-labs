"use client";
import React, { useState } from "react";
import Link from "next/link";
import { 
    Phone, 
    Lock, 
    ArrowRight, 
    ShieldCheck, 
    Activity,
    Mail,
    ChevronRight,
    Loader2
} from "lucide-react";
import { getApiUrl } from "@/lib/api";

export default function PatientLogin() {
    const [loginType, setLoginType] = useState<"password" | "otp">("password");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    
    // Form States
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState("");

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch(getApiUrl("/api/patient/login"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier, password })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem("patientToken", data.token);
                window.location.href = "/patient/dashboard";
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Connection failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch(getApiUrl("/api/patient/send-otp"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber: identifier })
            });
            const data = await res.json();
            if (data.success) {
                setOtpSent(true);
                alert(`OTP for demo: ${data.otp}`);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to send OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch(getApiUrl("/api/patient/verify-otp"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber: identifier, code: otpCode })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem("patientToken", data.token);
                window.location.href = "/patient/dashboard";
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("OTP verification failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Branding Side */}
            <div className="hidden md:flex flex-col justify-between w-1/2 bg-blue-600 p-16 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-xl">
                            <Activity className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black tracking-tight">Medoraa Labs</span>
                    </div>
                    
                    <h1 className="text-5xl font-black leading-tight mb-6">
                        Your Health,<br />
                        <span className="text-blue-200">Our Priority.</span>
                    </h1>
                    <p className="text-xl text-blue-100 max-w-md font-medium leading-relaxed">
                        Access world-class diagnostics, track your reports, and book home collections with ease.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-8 text-blue-200">
                    <div className="flex flex-col">
                        <span className="text-3xl font-black text-white">50k+</span>
                        <span className="text-xs font-bold uppercase tracking-widest">Happy Patients</span>
                    </div>
                    <div className="w-px h-10 bg-blue-400" />
                    <div className="flex flex-col">
                        <span className="text-3xl font-black text-white">200+</span>
                        <span className="text-xs font-bold uppercase tracking-widest">Diagnostic Tests</span>
                    </div>
                </div>
            </div>

            {/* Login Form Side */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center md:text-left">
                        <div className="md:hidden flex justify-center mb-6">
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                                <Activity className="w-7 h-7" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
                        <p className="text-slate-500 font-bold mt-2">Enter your details to access your portal</p>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 relative overflow-hidden">
                        {/* Tab Switch */}
                        <div className="flex p-1 bg-slate-50 rounded-2xl mb-8 border border-slate-100">
                            <button 
                                onClick={() => { setLoginType("password"); setOtpSent(false); }}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${loginType === "password" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}
                            >
                                Password
                            </button>
                            <button 
                                onClick={() => setLoginType("otp")}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${loginType === "otp" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}
                            >
                                OTP Login
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold animate-in shake duration-300">
                                <Lock className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        {loginType === "password" ? (
                            <form onSubmit={handlePasswordLogin} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Identifier</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                        <input 
                                            type="text" 
                                            placeholder="Email or Phone Number"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Security Key</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                        <input 
                                            type="password" 
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={otpSent ? handleVerifyOTP : handleSendOTP} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Phone Number</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                        <input 
                                            type="tel" 
                                            placeholder="+91 00000 00000"
                                            value={identifier}
                                            disabled={otpSent}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all disabled:opacity-50"
                                            required
                                        />
                                    </div>
                                </div>
                                {otpSent && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">OTP Verification</label>
                                        <input 
                                            type="text" 
                                            placeholder="Enter 4-digit code"
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value)}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-center text-lg font-black tracking-[1em] text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                            maxLength={4}
                                            required
                                        />
                                    </div>
                                )}
                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{otpSent ? "Verify & Proceed" : "Send One-Time Pass"} <ArrowRight className="w-4 h-4" /></>}
                                </button>
                                {otpSent && (
                                    <button 
                                        type="button" 
                                        onClick={() => setOtpSent(false)}
                                        className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all"
                                    >
                                        Change Phone Number
                                    </button>
                                )}
                            </form>
                        )}
                    </div>

                    <div className="text-center">
                        <p className="text-slate-500 font-bold text-sm">
                            Don't have an account?{" "}
                            <Link href="/patient/register" className="text-blue-600 hover:underline">Create One</Link>
                        </p>
                    </div>

                    <div className="pt-8 border-t border-slate-200 flex items-center justify-center gap-6 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                        <div className="flex items-center gap-2 text-slate-600 font-black text-[10px] uppercase tracking-widest">
                            <ShieldCheck className="w-4 h-4" />
                            Secure End-to-End
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
