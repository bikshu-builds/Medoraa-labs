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

interface FormDataType extends Partial<Doctor> {
    periodType?: 'WEEKLY' | 'FIFTEEN_DAYS' | 'MONTHLY';
    periodStartDate?: string;
    periodEndDate?: string;
    totalReferralAmount?: number | string;
    paidAmount?: number | string;
    dueAmount?: number;
    paymentStatus?: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';
    paymentCompletedDate?: string;
}

const DoctorModal: React.FC<DoctorModalProps> = ({ isOpen, onClose, onSave, doctor }) => {
    const [formData, setFormData] = useState<FormDataType>({
        doctorName: "",
        hospitalId: "",
        specialization: "",
        dateOfBirth: "",
        gender: "Male",
        mobileNumber: "",
        email: "",
        reportDeliveryMethod: "MAIL",
        status: "ACTIVE",
        periodType: "WEEKLY",
        periodStartDate: "",
        periodEndDate: "",
        totalReferralAmount: 0,
        paidAmount: 0,
        dueAmount: 0,
        paymentStatus: "PENDING",
        paymentCompletedDate: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hospitals, setHospitals] = useState<any[]>([]);

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
                periodType: doctor.payment?.periodType || "WEEKLY",
                periodStartDate: doctor.payment?.periodStartDate ? new Date(doctor.payment.periodStartDate).toISOString().split('T')[0] : "",
                periodEndDate: doctor.payment?.periodEndDate ? new Date(doctor.payment.periodEndDate).toISOString().split('T')[0] : "",
                totalReferralAmount: doctor.payment?.totalReferralAmount || 0,
                paidAmount: doctor.payment?.paidAmount || 0,
                dueAmount: (doctor.payment?.totalReferralAmount || 0) - (doctor.payment?.paidAmount || 0),
                paymentStatus: doctor.payment?.paymentStatus || "PENDING",
                paymentCompletedDate: doctor.payment?.paymentCompletedDate ? new Date(doctor.payment.paymentCompletedDate).toISOString().split('T')[0] : ""
            });
        } else {
            setFormData({
                doctorName: "",
                hospitalId: "",
                specialization: "",
                dateOfBirth: "",
                gender: "Male",
                mobileNumber: "",
                email: "",
                reportDeliveryMethod: "MAIL",
                status: "ACTIVE",
                periodType: "WEEKLY",
                periodStartDate: "",
                periodEndDate: "",
                totalReferralAmount: 0,
                paidAmount: 0,
                dueAmount: 0,
                paymentStatus: "PENDING",
                paymentCompletedDate: ""
            });
        }
    }, [doctor, isOpen]);

    if (!isOpen) return null;

    const handleNumberChange = (field: 'totalReferralAmount' | 'paidAmount', valStr: string) => {
        setFormData(prev => {
            const nextData = { ...prev };
            if (valStr === "") {
                nextData[field] = "" as any;
            } else {
                nextData[field] = Number(valStr);
            }
            const total = Number(nextData.totalReferralAmount) || 0;
            const paid = Number(nextData.paidAmount) || 0;
            nextData.dueAmount = total - paid;
            return nextData;
        });
    };

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
        try {
            const cleanData = {
                ...formData,
                totalReferralAmount: formData.totalReferralAmount === "" ? 0 : Number(formData.totalReferralAmount),
                paidAmount: formData.paidAmount === "" ? 0 : Number(formData.paidAmount),
                dueAmount: Number(formData.dueAmount) || 0
            };
            await onSave(cleanData);
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
                            {doctor && doctor.doctorCode ? `Ref: ${doctor.doctorCode}` : "New Doctor Registration"}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
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

                                {/* Section 4: Payment Details */}
                                <div className="md:col-span-2 pt-2 border-t border-slate-100 mt-4">
                                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Payment & Referral Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Billing Period (*)</label>
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
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Payment Status</label>
                                            <select 
                                                value={formData.paymentStatus}
                                                onChange={(e) => setFormData({...formData, paymentStatus: e.target.value as any})}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="PARTIALLY_PAID">Partially Paid</option>
                                                <option value="PAID">Paid</option>
                                                <option value="CANCELLED">Cancelled</option>
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
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Referral Amount (*)</label>
                                            <input 
                                                type="number" 
                                                required
                                                min="0"
                                                value={formData.totalReferralAmount ?? ""}
                                                onChange={(e) => handleNumberChange('totalReferralAmount', e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Paid Amount (*)</label>
                                            <input 
                                                type="number" 
                                                required
                                                min="0"
                                                value={formData.paidAmount ?? ""}
                                                onChange={(e) => handleNumberChange('paidAmount', e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Due Amount</label>
                                            <input 
                                                type="number" 
                                                readOnly
                                                value={formData.dueAmount ?? ""}
                                                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded text-sm font-semibold text-slate-600 outline-none"
                                            />
                                        </div>
                                        {(formData.paymentStatus === 'PAID' || formData.paymentStatus === 'PARTIALLY_PAID') && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Payment Completed Date (*)</label>
                                                <input 
                                                    type="date" 
                                                    required
                                                    value={formData.paymentCompletedDate}
                                                    onChange={(e) => setFormData({...formData, paymentCompletedDate: e.target.value})}
                                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                                />
                                            </div>
                                        )}
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
