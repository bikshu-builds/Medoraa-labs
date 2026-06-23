"use client";
import React, { useState, useEffect } from "react";
import { X, User, Phone, Mail, CheckCircle2, Loader2, KeyRound } from "lucide-react";
import { Staff } from "../types";
import { cn } from "@/lib/utils";

interface StaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (staffData: any) => Promise<void>;
    staff?: Staff | null;
}

const StaffModal: React.FC<StaffModalProps> = ({ isOpen, onClose, onSave, staff }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobileNumber: "",
        password: "",
        role: "registration",
        status: "active"
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (staff) {
            setFormData({
                name: staff.name || "",
                email: staff.email || "",
                mobileNumber: staff.mobileNumber || "",
                password: "", // blank password for editing
                role: staff.role || "registration",
                status: staff.status || "active"
            });
        } else {
            setFormData({
                name: "",
                email: "",
                mobileNumber: "",
                password: "",
                role: "registration",
                status: "active"
            });
        }
        setError("");
    }, [staff, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        try {
            // Validate password for new user
            if (!staff && !formData.password) {
                setError("Password is required for new staff accounts");
                setIsSubmitting(false);
                return;
            }

            const payload: any = { ...formData };
            // If editing and password is empty, don't submit password
            if (staff && !formData.password) {
                delete payload.password;
            }

            await onSave(payload);
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to save staff details");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="relative bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden font-sans border border-slate-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                            {staff ? "Update Staff Details" : "Register New Staff Member"}
                        </h2>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {staff ? `Ref ID: ${staff._id.slice(-6).toUpperCase()}` : "Create new staff profile"}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-xs font-semibold">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name (*)</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Jane Doe" 
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address (*)</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="email" 
                                    placeholder="jane.doe@medoraa.com" 
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800"
                                />
                            </div>
                        </div>

                        {/* Mobile Number */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mobile Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="tel" 
                                    placeholder="+91 98765 43210" 
                                    value={formData.mobileNumber}
                                    onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                {staff ? "New Password (leave blank to keep current)" : "Password (*)"}
                            </label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    required={!staff}
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800"
                                />
                            </div>
                        </div>

                        {/* Role & Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Role (*)</label>
                                <select 
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                                >
                                    <option value="registration">Registration</option>
                                    <option value="authorization">Authorization</option>
                                    <option value="inventory">Inventory</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status (*)</label>
                                <select 
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-all uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-600/20"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4" />
                        )}
                        {staff ? "Update Staff" : "Register Staff"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StaffModal;
