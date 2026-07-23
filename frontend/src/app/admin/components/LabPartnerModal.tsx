"use client";
import React, { useState, useEffect } from "react";
import { X, User, Phone, Mail, Calendar, CheckCircle2, Loader2, Activity } from "lucide-react";
import { Doctor } from "../types";
import { cn } from "@/lib/utils";
import { getApiUrl } from "@/lib/api";

interface LabPartnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (doctorData: Partial<Doctor>) => Promise<void>;
    doctor?: Doctor | null;
}

interface FormDataType extends Partial<Omit<Doctor, 'referralPercentage'>> {
    referralPercentage?: number | string;
}

const LabPartnerModal: React.FC<LabPartnerModalProps> = ({ isOpen, onClose, onSave, doctor }) => {
    const [formData, setFormData] = useState<FormDataType>({
        doctorName: "",
        affiliationType: "LAB",
        labName: "",
        branch: "",
        completeAddress: "",
        mobileNumber: "",
        email: "",
        status: "ACTIVE",
        referralPercentage: 0,
        periodType: "WEEKLY",
        periodStartDate: "",
        periodEndDate: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (doctor) {
            setFormData({
                ...doctor,
                affiliationType: "LAB",
                labName: doctor.labName || "",
                branch: doctor.branch || "",
                completeAddress: doctor.completeAddress || "",
                referralPercentage: doctor.referralPercentage || 0,
                periodType: doctor.periodType || "WEEKLY",
                periodStartDate: doctor.periodStartDate ? new Date(doctor.periodStartDate).toISOString().split('T')[0] : "",
                periodEndDate: doctor.periodEndDate ? new Date(doctor.periodEndDate).toISOString().split('T')[0] : ""
            });
        } else {
            setFormData({
                doctorName: "",
                affiliationType: "LAB",
                labName: "",
                branch: "",
                completeAddress: "",
                mobileNumber: "",
                email: "",
                status: "ACTIVE",
                referralPercentage: 0,
                periodType: "WEEKLY",
                periodStartDate: "",
                periodEndDate: ""
            });
        }
        setError("");
    }, [doctor, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        try {
            const cleanData = {
                ...formData,
                affiliationType: "LAB" as const,
                hospitalId: undefined,
                labId: undefined,
                referralPercentage: formData.referralPercentage === "" ? 0 : Number(formData.referralPercentage)
            };
            await onSave(cleanData);
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to save lab partner details");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden font-sans border border-slate-200 animate-in fade-in zoom-in duration-250">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                            {doctor ? "Update Lab Partner Details" : "Onboard Lab Partner"}
                        </h2>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {doctor && doctor.doctorCode ? `Ref: ${doctor.doctorCode}` : "New Lab Partner Registration"}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form id="lab-partner-modal-form" onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-xs font-semibold animate-in fade-in duration-200">
                            {error}
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Section 1: Lab Details */}
                        <div className="md:col-span-2">
                            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Lab Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lab Name (*)</label>
                                    <input
                                        type="text"
                                        placeholder="Diagnostic Lab Name"
                                        required
                                        value={formData.labName || ""}
                                        onChange={(e) => setFormData({...formData, labName: e.target.value})}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Branch</label>
                                    <input
                                        type="text"
                                        placeholder="Branch Name (e.g. Vijayawada)"
                                        value={formData.branch || ""}
                                        onChange={(e) => setFormData({...formData, branch: e.target.value})}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Complete Address</label>
                                    <textarea
                                        placeholder="Complete Lab Address"
                                        rows={2}
                                        value={formData.completeAddress || ""}
                                        onChange={(e) => setFormData({...formData, completeAddress: e.target.value})}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none text-slate-800"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Contact Person */}
                        <div className="md:col-span-2 pt-2">
                            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Representative Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Representative Name (*)</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Representative Name" 
                                            required
                                            value={formData.doctorName}
                                            onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
                                    <div className="relative">
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                                            className="w-full pl-4 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none text-slate-800 animate-none"
                                        >
                                            <option value="ACTIVE">Active</option>
                                            <option value="INACTIVE">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Contact Details */}
                        <div className="md:col-span-2 pt-2">
                            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Contact Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mobile Number (*)</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            type="tel" 
                                            placeholder="9876543210" 
                                            required
                                            value={formData.mobileNumber}
                                            onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            type="email" 
                                            placeholder="representative@email.com" 
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Referral Agreement */}
                        <div className="md:col-span-2 pt-2">
                            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Referral Agreement</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Referral Commission (%)</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="15" 
                                            value={formData.referralPercentage}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === "" || /^[0-9]*$/.test(val)) {
                                                    setFormData({...formData, referralPercentage: val});
                                                }
                                            }}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Payout Cycle Period (*)</label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.periodType}
                                            onChange={(e) => setFormData({...formData, periodType: e.target.value as any})}
                                            className="w-full pl-4 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none text-slate-800"
                                        >
                                            <option value="WEEKLY">Weekly</option>
                                            <option value="FIFTEEN_DAYS">15 Days</option>
                                            <option value="MONTHLY">Monthly</option>
                                        </select>
                                    </div>
                                </div>
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
                        type="submit"
                        form="lab-partner-modal-form"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-600/20"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4" />
                        )}
                        {doctor ? "Update Registry" : "Confirm Onboarding"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LabPartnerModal;
