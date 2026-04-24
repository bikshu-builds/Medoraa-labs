"use client";
import React, { useState } from "react";
import Link from "next/link";
import { 
    User, 
    Mail, 
    Phone, 
    Lock, 
    Calendar, 
    MapPin, 
    ArrowRight, 
    Activity,
    Loader2,
    CheckCircle2
} from "lucide-react";
import { getApiUrl } from "@/lib/api";

export default function PatientRegister() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    
    // Form States
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
        age: "",
        gender: "Male"
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch(getApiUrl("/api/patient/register"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem("patientToken", data.token);
                window.location.href = "/patient/dashboard";
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Branding Side */}
            <div className="hidden md:flex flex-col justify-between w-2/5 bg-slate-900 p-16 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                
                <div className="relative z-10">
                    <Link href="/patient/login" className="flex items-center gap-3 mb-16 group w-fit">
                        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20 transition-transform group-hover:scale-110">
                            <Activity className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-black tracking-tight">Medoraa</span>
                    </Link>
                    
                    <h1 className="text-4xl font-black leading-tight mb-8">
                        Join the <span className="text-blue-500">Future</span> of<br />Healthcare.
                    </h1>
                    
                    <div className="space-y-8">
                        {[
                            { title: "Instant Access", desc: "View reports the moment they are ready.", icon: CheckCircle2 },
                            { title: "Family Booking", desc: "Manage health for your loved ones in one app.", icon: CheckCircle2 },
                            { title: "Home Collection", desc: "Professional phlebotomists at your doorstep.", icon: CheckCircle2 }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="p-1 bg-blue-600/20 rounded-full text-blue-500 mt-1">
                                    <item.icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-black text-sm text-slate-100">{item.title}</h4>
                                    <p className="text-xs text-slate-400 font-medium mt-1">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 p-8 bg-blue-600 rounded-[2.5rem] mt-12 shadow-2xl shadow-blue-600/20">
                    <p className="text-sm font-bold text-blue-100 italic">"The easiest diagnostic experience I've ever had. Everything from booking to report download was seamless."</p>
                    <div className="flex items-center gap-3 mt-4">
                        <div className="w-8 h-8 rounded-full bg-blue-400/30 border border-blue-300/30" />
                        <div>
                            <p className="text-xs font-black text-white">Sarah Jenkins</p>
                            <p className="text-[10px] font-bold text-blue-200">Verified Patient</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Registration Form Side */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
                <div className="w-full max-w-xl space-y-10 py-12">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Create Account</h2>
                        <p className="text-slate-500 font-bold mt-2">Start your personalized health journey today.</p>
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold">
                            <Activity className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Full Identity</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input 
                                    type="text" 
                                    name="name"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input 
                                    type="email" 
                                    name="email"
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Phone Number</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input 
                                    type="tel" 
                                    name="phoneNumber"
                                    placeholder="+91 00000 00000"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Age</label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input 
                                    type="number" 
                                    name="age"
                                    placeholder="Enter age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Gender</label>
                            <select 
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input 
                                    type="password" 
                                    name="password"
                                    placeholder="Create password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Confirm Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input 
                                    type="password" 
                                    name="confirmPassword"
                                    placeholder="Repeat password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="md:col-span-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Complete Registration <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </form>

                    <div className="text-center">
                        <p className="text-slate-500 font-bold text-sm">
                            Already have an account?{" "}
                            <Link href="/patient/login" className="text-blue-600 hover:underline">Sign In Instead</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
