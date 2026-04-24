"use client";
import React, { useState, useEffect } from "react";
import { X, User, Phone, Calendar, Loader2, CheckCircle2, HeartPulse, UserPlus, DollarSign, Tag } from "lucide-react";
import { Patient, Doctor } from "../types";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

interface PatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (patientData: Partial<Patient>) => Promise<void>;
    patient?: Patient | null;
}

const PatientModal: React.FC<PatientModalProps> = ({ isOpen, onClose, onSave, patient }) => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [formData, setFormData] = useState<Partial<Patient>>({
        name: "",
        patientId: "",
        age: 0,
        gender: "Male",
        phoneNumber: "",
        sourceType: "Walk-in",
        doctorReferral: "",
        testStatus: "Pending",
        revenue: 0,
        date: new Date().toISOString()
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const token = localStorage.getItem("adminToken");
                const res = await fetch(getApiUrl("/api/admin/doctors"), {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) setDoctors(data.data);
            } catch (err) {
                console.error("Failed to fetch doctors", err);
            }
        };
        fetchDoctors();
    }, []);

    useEffect(() => {
        if (patient) {
            setFormData({
                ...patient,
                doctorReferral: typeof patient.doctorReferral === 'object' ? patient.doctorReferral?._id : patient.doctorReferral
            });
        } else {
            setFormData({
                name: "",
                patientId: `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
                age: 0,
                gender: "Male",
                phoneNumber: "",
                sourceType: "Walk-in",
                doctorReferral: "",
                testStatus: "Pending",
                revenue: 0,
                date: new Date().toISOString()
            });
        }
    }, [patient, isOpen]);

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
                            {patient ? "Update Patient Case" : "Register New Patient"}
                        </h2>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {patient ? `ID: ${patient.patientId}` : "Laboratory Intake Registry"}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Identity */}
                        <div className="space-y-4 md:col-span-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Patient Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Enter full name"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Age & Gender</label>
                            <div className="flex gap-3">
                                <input 
                                    type="number" 
                                    required
                                    value={formData.age}
                                    onChange={(e) => setFormData({...formData, age: Number(e.target.value)})}
                                    className="w-20 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Age"
                                />
                                <select 
                                    value={formData.gender}
                                    onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
                                    className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Number</label>
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

                        {/* Referral Source */}
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Traffic Source</label>
                            <select 
                                value={formData.sourceType}
                                onChange={(e) => setFormData({...formData, sourceType: e.target.value as any})}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                            >
                                <option value="Walk-in">Direct Walk-in</option>
                                <option value="Referring Doctor">Physician Referral</option>
                                <option value="Home Collection">Mobile Collection</option>
                            </select>
                        </div>

                        {formData.sourceType === "Referring Doctor" && (
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Referring Physician</label>
                                <select 
                                    required
                                    value={formData.doctorReferral as string}
                                    onChange={(e) => setFormData({...formData, doctorReferral: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                                >
                                    <option value="">Select Doctor</option>
                                    {doctors.map(doc => (
                                        <option key={doc._id} value={doc._id}>{doc.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Operational Status */}
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Clinical Status</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select 
                                    value={formData.testStatus}
                                    onChange={(e) => setFormData({...formData, testStatus: e.target.value as any})}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                                >
                                    <option value="Pending">Pending Intake</option>
                                    <option value="Processing">In Laboratory</option>
                                    <option value="Completed">Report Ready</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Billable Amount (₹)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="number" 
                                    required
                                    value={formData.revenue}
                                    onChange={(e) => setFormData({...formData, revenue: Number(e.target.value)})}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                />
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
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4" />
                        )}
                        {patient ? "Apply Updates" : "Create Case"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PatientModal;
