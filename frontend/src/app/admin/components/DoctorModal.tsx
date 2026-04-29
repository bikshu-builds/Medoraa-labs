"use client";
import React, { useState, useEffect } from "react";
import { X, User, Building2, Phone, Mail, Percent, CheckCircle2, Loader2 } from "lucide-react";
import { Doctor } from "../types";
import { cn } from "@/lib/utils";

interface DoctorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (doctorData: Partial<Doctor>) => Promise<void>;
    doctor?: Doctor | null;
}

const DoctorModal: React.FC<DoctorModalProps> = ({ isOpen, onClose, onSave, doctor }) => {
    const [formData, setFormData] = useState<Partial<Doctor>>({
        name: "",
        hospitalName: "",
        branch: "",
        phoneNumber: "",
        email: "",
        commissionPercentage: 10,
        status: "active",
        specialty: "",
        registrationNumber: "",
        preferredCommunication: "Email",
        referralCategory: "General",
        notes: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (doctor) {
            setFormData(doctor);
        } else {
            setFormData({
                name: "",
                hospitalName: "",
                branch: "",
                phoneNumber: "",
                email: "",
                commissionPercentage: 10,
                status: "active",
                specialty: "",
                registrationNumber: "",
                preferredCommunication: "Email",
                referralCategory: "General",
                notes: ""
            });
        }
    }, [doctor, isOpen]);

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
            
            <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden font-sans border border-slate-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                            {doctor ? "Update Partner Details" : "Onboard Medical Partner"}
                        </h2>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {doctor ? `Ref: ${doctor._id.slice(-8).toUpperCase()}` : "New Doctor Registration"}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Section 1: Identity */}
                        <div className="md:col-span-2">
                            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Professional Identity</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name (*)</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Dr. Rajesh Kumar" 
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Specialty</label>
                                    <input 
                                        type="text" 
                                        placeholder="Cardiology / General Physician" 
                                        value={formData.specialty}
                                        onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Registration Number</label>
                                    <input 
                                        type="text" 
                                        placeholder="MCI-000000" 
                                        value={formData.registrationNumber}
                                        onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Referral Category</label>
                                    <select 
                                        value={formData.referralCategory}
                                        onChange={(e) => setFormData({...formData, referralCategory: e.target.value as any})}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                                    >
                                        <option value="General">General Partner</option>
                                        <option value="Specialist">Specialist</option>
                                        <option value="Corporate">Corporate / Hospital</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Affiliation */}
                        <div className="md:col-span-2 pt-2">
                            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Affiliation & Branch</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hospital Name (*)</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            type="text" 
                                            placeholder="City Hospital" 
                                            required
                                            value={formData.hospitalName}
                                            onChange={(e) => setFormData({...formData, hospitalName: e.target.value})}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Branch / Locality (*)</label>
                                    <input 
                                        type="text" 
                                        placeholder="Main Branch / South Extension" 
                                        required
                                        value={formData.branch}
                                        onChange={(e) => setFormData({...formData, branch: e.target.value})}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Contact */}
                        <div className="md:col-span-2 pt-2">
                            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Contact & Communication</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Number (*)</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            type="tel" 
                                            placeholder="+91 00000 00000" 
                                            required
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address (*)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            type="email" 
                                            placeholder="doctor@medoraa.com" 
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Report Delivery Method</label>
                                    <select 
                                        value={formData.preferredCommunication}
                                        onChange={(e) => setFormData({...formData, preferredCommunication: e.target.value as any})}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                                    >
                                        <option value="Email">Direct Email</option>
                                        <option value="WhatsApp">WhatsApp Message</option>
                                        <option value="SMS">SMS Link</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Finance & Status */}
                        <div className="md:col-span-2 pt-2">
                            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Financials & Status</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Commission (%) (*)</label>
                                    <div className="relative">
                                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            type="number" 
                                            min="0" max="100" required
                                            value={formData.commissionPercentage}
                                            onChange={(e) => setFormData({...formData, commissionPercentage: Number(e.target.value)})}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Account Status</label>
                                    <select 
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                                    >
                                        <option value="active">Active Registry</option>
                                        <option value="inactive">Inactive / Blacklisted</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 5: Internal Notes */}
                        <div className="md:col-span-2 pt-2">
                            <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] block mb-4">Internal Notes / Remarks</label>
                            <textarea 
                                placeholder="Add any special instructions or referral history notes here..."
                                value={formData.notes}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
                            />
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
                        {doctor ? "Update Registry" : "Confirm Onboarding"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoctorModal;
