"use client";
import React, { useState, useEffect } from "react";
import { X, User, Building2, Phone, Mail, Calendar, CheckCircle2, Loader2, Users } from "lucide-react";
import { Doctor } from "../types";
import { cn } from "@/lib/utils";
import { getApiUrl } from "@/lib/api";

interface DoctorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (doctorData: Partial<Doctor>) => Promise<void>;
    doctor?: Doctor | null;
}

interface FormDataType extends Partial<Omit<Doctor, 'referralPercentage'>> {
    degree?: string;
    referralPercentage?: number | string;
}

const DoctorModal: React.FC<DoctorModalProps> = ({ isOpen, onClose, onSave, doctor }) => {
    const [formData, setFormData] = useState<FormDataType>({
        doctorName: "",
        hospitalId: "",
        degree: "",
        specialization: "",
        dateOfBirth: "",
        gender: "Male",
        mobileNumber: "",
        email: "",
        reportDeliveryMethod: "MAIL",
        status: "ACTIVE",
        referralPercentage: 0,
        periodType: "WEEKLY",
        periodStartDate: "",
        periodEndDate: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                const token = localStorage.getItem("adminToken");
                const res = await fetch(getApiUrl("/api/admin/hospitals"), {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setHospitals(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch hospitals", err);
            }
        };
        fetchHospitals();
    }, []);

    useEffect(() => {
        if (doctor) {
            setFormData({
                ...doctor,
                hospitalId: (typeof doctor.hospitalId === 'object' && doctor.hospitalId !== null) ? (doctor.hospitalId as any)._id : (doctor.hospitalId || ""),
                dateOfBirth: doctor.dateOfBirth ? new Date(doctor.dateOfBirth).toISOString().split('T')[0] : "",
                degree: doctor.degree || "",
                specialization: doctor.specialization || "",
                referralPercentage: doctor.referralPercentage || 0,
                periodType: doctor.periodType || "WEEKLY",
                periodStartDate: doctor.periodStartDate ? new Date(doctor.periodStartDate).toISOString().split('T')[0] : "",
                periodEndDate: doctor.periodEndDate ? new Date(doctor.periodEndDate).toISOString().split('T')[0] : ""
            });
        } else {
            setFormData({
                doctorName: "",
                hospitalId: "",
                degree: "",
                specialization: "",
                dateOfBirth: "",
                gender: "Male",
                mobileNumber: "",
                email: "",
                reportDeliveryMethod: "MAIL",
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

    const handlePeriodChange = (field: 'periodType' | 'periodStartDate', value: string) => {
        setFormData(prev => {
            const nextData = { ...prev, [field]: value };
            const type = nextData.periodType || "WEEKLY";
            const start = nextData.periodStartDate || "";
            
            if (start) {
                const startDate = new Date(start);
                if (!isNaN(startDate.getTime())) {
                    const endDate = new Date(startDate);
                    if (type === 'WEEKLY') {
                        endDate.setUTCDate(startDate.getUTCDate() + 7);
                    } else if (type === 'FIFTEEN_DAYS') {
                        endDate.setUTCDate(startDate.getUTCDate() + 15);
                    } else if (type === 'MONTHLY') {
                        endDate.setUTCMonth(startDate.getUTCMonth() + 1);
                    }
                    nextData.periodEndDate = endDate.toISOString().split('T')[0];
                }
            }
            return nextData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        try {
            const cleanData = {
                ...formData,
                referralPercentage: formData.referralPercentage === "" ? 0 : Number(formData.referralPercentage)
            };
            await onSave(cleanData);
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to save partner details");
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
                            {doctor && doctor.doctorCode ? `Ref: ${doctor.doctorCode}` : "New Doctor Registration"}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form id="doctor-modal-form" onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-xs font-semibold animate-in fade-in duration-200">
                            {error}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Section 1: Affiliation */}
                        <div className="md:col-span-2">
                            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Affiliation & Branch</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hospital Name (*)</label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={typeof formData.hospitalId === 'object' && formData.hospitalId !== null ? formData.hospitalId._id : (formData.hospitalId || "")}
                                            onChange={(e) => setFormData({...formData, hospitalId: e.target.value})}
                                            className="w-full pl-4 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none"
                                        >
                                            <option value="" disabled>Select Hospital First</option>
                                            {hospitals.map(h => (
                                                <option key={h._id} value={h._id}>{h.hospitalName}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {formData.hospitalId && (
                            <>
                                {/* Section 2: Identity */}
                                <div className="md:col-span-2 pt-2">
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
                                                    value={formData.doctorName}
                                                    onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
                                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Degree (*)</label>
                                            <input 
                                                type="text" 
                                                placeholder="MBBS / MD / MS" 
                                                required
                                                value={formData.degree}
                                                onChange={(e) => setFormData({...formData, degree: e.target.value})}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Specialization (*)</label>
                                            <input 
                                                type="text" 
                                                placeholder="Cardiology / General Physician" 
                                                required
                                                value={formData.specialization}
                                                onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date of Birth</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input 
                                                    type="date" 
                                                    value={formData.dateOfBirth}
                                                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gender</label>
                                            <div className="relative">
                                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <select 
                                                    value={formData.gender}
                                                    onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
                                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                                                >
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                    <option value="Prefer not to say">Prefer not to say</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Contact */}
                                <div className="md:col-span-2 pt-2">
                                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Contact & Communication</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mobile Number (*)</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input 
                                                    type="tel" 
                                                    placeholder="+91 00000 00000" 
                                                    required
                                                    value={formData.mobileNumber}
                                                    onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
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
                                                value={formData.reportDeliveryMethod}
                                                onChange={(e) => setFormData({...formData, reportDeliveryMethod: e.target.value as any})}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                                            >
                                                <option value="MAIL">Direct Email (MAIL)</option>
                                                <option value="WHATSAPP">WhatsApp Message</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Account Status</label>
                                            <select 
                                                value={formData.status}
                                                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                                            >
                                                <option value="ACTIVE">Active</option>
                                                <option value="INACTIVE">Inactive</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 4: Referral Details */}
                                <div className="md:col-span-2 pt-2 border-t border-slate-100 mt-4">
                                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Referral Agreement Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Referral Percentage (%) (*)</label>
                                            <input 
                                                type="number" 
                                                required
                                                min="0"
                                                max="100"
                                                placeholder="e.g. 15"
                                                value={formData.referralPercentage ?? ""}
                                                onChange={(e) => setFormData({...formData, referralPercentage: e.target.value})}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Time Period Type (*)</label>
                                            <select 
                                                value={formData.periodType}
                                                onChange={(e) => handlePeriodChange('periodType', e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                                            >
                                                <option value="WEEKLY">Weekly</option>
                                                <option value="FIFTEEN_DAYS">15 Days</option>
                                                <option value="MONTHLY">Monthly</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Period Start Date (*)</label>
                                            <input 
                                                type="date" 
                                                required
                                                value={formData.periodStartDate}
                                                onChange={(e) => handlePeriodChange('periodStartDate', e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Period End Date (*)</label>
                                            <input 
                                                type="date" 
                                                required
                                                value={formData.periodEndDate}
                                                onChange={(e) => setFormData({...formData, periodEndDate: e.target.value})}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
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
                        form="doctor-modal-form"
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
