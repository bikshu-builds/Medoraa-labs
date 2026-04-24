"use client";
import React, { useState, useEffect } from "react";
import { X, User, ShieldCheck, Phone, Mail, Calendar, CheckCircle2, Loader2, Camera } from "lucide-react";
import { Employee } from "../types";
import { cn } from "@/lib/utils";

interface EmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (employeeData: Partial<Employee>) => Promise<void>;
    employee?: Employee | null;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, onSave, employee }) => {
    const [formData, setFormData] = useState<Partial<Employee>>({
        name: "",
        employeeId: "",
        role: "Lab Staff",
        phoneNumber: "",
        email: "",
        joiningDate: new Date().toISOString().split('T')[0],
        status: "active",
        profileImage: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (employee) {
            // Ensure date is in YYYY-MM-DD format for input[type="date"]
            const date = employee.joiningDate ? new Date(employee.joiningDate).toISOString().split('T')[0] : "";
            setFormData({ ...employee, joiningDate: date });
        } else {
            setFormData({
                name: "",
                employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
                role: "Lab Staff",
                phoneNumber: "",
                email: "",
                joiningDate: new Date().toISOString().split('T')[0],
                status: "active",
                profileImage: ""
            });
        }
    }, [employee, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave(formData);
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="relative bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden font-sans border border-slate-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                            {employee ? "Update Employee Profile" : "Register Team Member"}
                        </h2>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {employee ? `ID: ${employee.employeeId}` : "New Staff Onboarding"}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="flex justify-center mb-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-300 overflow-hidden">
                                {formData.profileImage ? (
                                    <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10" />
                                )}
                            </div>
                            <button type="button" className="absolute bottom-0 right-0 p-1.5 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-blue-600 shadow-sm">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="space-y-4 md:col-span-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Name</label>
                            <input 
                                type="text" 
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                placeholder="E.g. Anita Sharma"
                            />
                        </div>

                        {/* ID & Role */}
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee ID</label>
                            <input 
                                type="text" 
                                required
                                value={formData.employeeId}
                                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Departmental Role</label>
                            <select 
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                            >
                                <option value="Lab Staff">Laboratory Staff</option>
                                <option value="Marketing Team">Marketing & Field</option>
                                <option value="Admin">Administrative</option>
                            </select>
                        </div>

                        {/* Contact */}
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Primary Contact</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="tel" 
                                    required
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="+91"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Official Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="email" 
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="user@medoraa.com"
                                />
                            </div>
                        </div>

                        {/* Joining & Status */}
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Joining Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="date" 
                                    required
                                    value={formData.joiningDate}
                                    onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registry Status</label>
                            <select 
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                            >
                                <option value="active">Active On-Duty</option>
                                <option value="inactive">Resigned / Inactive</option>
                            </select>
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
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded text-xs transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4" />
                        )}
                        {employee ? "Commit Profile" : "Register Personnel"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmployeeModal;
