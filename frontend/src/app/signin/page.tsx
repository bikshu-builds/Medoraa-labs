"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
    Phone,
    Lock,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
    Activity,
    Mail,
    Loader2,
    Users,
    UserCog,
    User
} from "lucide-react";
import { getApiUrl } from "@/lib/api";

type Role = "patient" | "staff" | "admin";

export default function UnifiedSignIn() {
    const [role, setRole] = useState<Role>("patient");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Form States
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    // Patient Family Selection States
    const [patientStep, setPatientStep] = useState<1 | 2>(1);
    const [foundPatients, setFoundPatients] = useState<any[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // Adjust endpoint based on role
            const endpoint = `/api/${role}/login`;
            const payload = role === "patient" ? { identifier, password, specificPatientId: selectedPatientId } : { email: identifier, password };

            const res = await fetch(getApiUrl(endpoint), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem(`${role}Token`, data.token);
                if (data.data) localStorage.setItem("staffUser", JSON.stringify(data.data));
                if (data.admin) localStorage.setItem("adminUser", JSON.stringify(data.admin));
                window.location.href = `/${role}/dashboard`;
            } else {
                setError(data.message || "Invalid credentials");
            }
        } catch (err) {
            setError("Connection failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleIdentify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch(getApiUrl("/api/patient/identify"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber: identifier })
            });
            const data = await res.json();

            if (data.success) {
                if (data.exists && data.patients.length > 0) {
                    setFoundPatients(data.patients);
                    if (data.patients.length === 1) {
                        setSelectedPatientId(data.patients[0]._id);
                    }
                    setPatientStep(2);
                } else {
                    setError("No account found with this phone number. Please sign up.");
                }
            } else {
                setError(data.message || "Failed to identify patient.");
            }
        } catch (err) {
            setError("Connection failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="h-screen flex flex-col md:flex-row bg-[#F8FAFC] overflow-hidden">
            {/* Branding Side */}
            <div
                className="hidden md:flex flex-col justify-between w-1/2 bg-[#1A3263] p-16 text-white relative overflow-hidden h-full"
                style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/arabesque.png")` }}
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3 mb-16 hover:opacity-90 transition-opacity w-fit">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#1A3263] shadow-xl">
                            <Activity className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black tracking-tight">Medoraa Labs</span>
                    </Link>

                    <h1 className="text-5xl font-black leading-tight mb-6">
                        Your Health,<br />
                        <span className="text-blue-300">Our Priority.</span>
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
                    <div className="w-px h-10 bg-blue-400/30" />
                    <div className="flex flex-col">
                        <span className="text-3xl font-black text-white">200+</span>
                        <span className="text-xs font-bold uppercase tracking-widest">Diagnostic Tests</span>
                    </div>
                </div>
            </div>

            {/* Login Form Side */}
            <div className="flex-1 flex items-start justify-center p-4 sm:p-8 overflow-y-auto h-full">
                <div className="w-full max-w-md space-y-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-[#1A3263] transition-colors mb-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                    <div className="text-center md:text-left mb-2">
                        <div className="md:hidden flex justify-center mb-6">
                            <Link href="/">
                                <div className="w-12 h-12 bg-[#1A3263] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#1A3263]/20">
                                    <Activity className="w-7 h-7" />
                                </div>
                            </Link>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
                        <p className="text-slate-500 font-bold mt-2">Sign in to your account</p>
                    </div>

                    {/* Role Selection Tabs */}
                    <div className="flex p-1 bg-white rounded-2xl shadow-sm border border-slate-200 w-full mb-4">
                        <button
                            onClick={() => { setRole("patient"); setIdentifier(""); setPassword(""); setError(""); setPatientStep(1); setSelectedPatientId(""); }}
                            className={`flex-1 py-3 px-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${role === "patient" ? "bg-[#1A3263] text-white shadow-md" : "text-slate-500 hover:text-[#1A3263]"}`}
                        >
                            <User className="w-4 h-4" /> <span className="hidden sm:inline">Patient</span>
                        </button>
                        <button
                            onClick={() => { setRole("staff"); setIdentifier(""); setPassword(""); setError(""); }}
                            className={`flex-1 py-3 px-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${role === "staff" ? "bg-[#1A3263] text-white shadow-md" : "text-slate-500 hover:text-[#1A3263]"}`}
                        >
                            <Users className="w-4 h-4" /> <span className="hidden sm:inline">Staff</span>
                        </button>
                        <button
                            onClick={() => { setRole("admin"); setIdentifier(""); setPassword(""); setError(""); }}
                            className={`flex-1 py-3 px-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${role === "admin" ? "bg-[#1A3263] text-white shadow-md" : "text-slate-500 hover:text-[#1A3263]"}`}
                        >
                            <UserCog className="w-4 h-4" /> <span className="hidden sm:inline">Admin</span>
                        </button>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 relative overflow-hidden">

                        {error && (
                            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold animate-in shake duration-300">
                                <Lock className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        {/* Login Form */}
                        {role === "patient" && patientStep === 1 ? (
                            <form onSubmit={handleIdentify} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Phone Number</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1A3263] transition-colors" />
                                        <input
                                            type="tel"
                                            placeholder="+91 00000 00000"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1A3263]/20 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-[#1A3263] hover:bg-[#2A4273] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#1A3263]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Next <ArrowRight className="w-4 h-4" /></>}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleLogin} className="space-y-6">
                                {role === "patient" && patientStep === 2 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => { setPatientStep(1); setPassword(""); setSelectedPatientId(""); }}
                                            className="text-[10px] font-black uppercase tracking-widest text-[#1A3263] hover:underline mb-2 flex items-center gap-1"
                                        >
                                            <ArrowLeft className="w-3 h-3" /> Change Phone Number
                                        </button>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Select Patient</label>
                                            <select
                                                value={selectedPatientId}
                                                onChange={(e) => setSelectedPatientId(e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1A3263]/20 outline-none transition-all appearance-none"
                                                required
                                            >
                                                <option value="" disabled>Choose patient profile...</option>
                                                {foundPatients.map(p => (
                                                    <option key={p._id} value={p._id}>{p.name} ({p.age}y, {p.gender})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}

                                {role !== "patient" && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Email</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1A3263] transition-colors" />
                                            <input
                                                type="email"
                                                placeholder="name@example.com"
                                                value={identifier}
                                                onChange={(e) => setIdentifier(e.target.value)}
                                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                {(!foundPatients.length || selectedPatientId || role !== "patient") && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1A3263] transition-colors" />
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1A3263]/20 outline-none transition-all"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading || (role === "patient" && !selectedPatientId)}
                                    className="w-full bg-[#1A3263] hover:bg-[#2A4273] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#1A3263]/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Only show Sign Up link for Patients */}
                    <div className="text-center h-10">
                        {role === "patient" ? (
                            <p className="text-slate-500 font-bold text-sm animate-in fade-in duration-300">
                                Don't have an account?{" "}
                                <Link href="/patient/register" className="text-[#1A3263] hover:underline">Create One</Link>
                            </p>
                        ) : (
                            <p className="text-slate-400 font-medium text-xs animate-in fade-in duration-300">
                                {role === "staff" ? "Staff" : "Admin"} portal is restricted. Contact IT for access.
                            </p>
                        )}
                    </div>

                    <div className="pt-4 border-t border-slate-200 flex items-center justify-center gap-6 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all duration-700">
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
