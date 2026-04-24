"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, ShieldCheck } from "lucide-react";
import { getApiUrl } from "@/lib/api";

const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch(getApiUrl("/api/admin/login"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (data.success) {
                localStorage.setItem("adminToken", data.token);
                localStorage.setItem("adminData", JSON.stringify(data.admin));
                router.push("/admin/dashboard");
            } else {
                setError(data.message || "Authentication failed. Please verify your credentials.");
            }
        } catch (err) {
            setError("Service connection error. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm font-sans">
            <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-xl">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Medoraa Labs</h1>
                    <p className="text-xs font-medium text-slate-500 mt-1">Administrative Control Center</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-rose-50 border border-rose-100 rounded text-rose-600 text-[11px] font-bold text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-0.5">Corporate Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-10 py-2.5 text-sm font-medium text-slate-900 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="name@medoraalabs.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-0.5">Secure Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-10 py-2.5 text-sm font-medium text-slate-900 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button 
                        disabled={isLoading}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                    </button>
                </form>
            </div>
            <p className="mt-6 text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">
                Protected by Enterprise-grade Security
            </p>
        </div>
    );
};

export default AdminLogin;
