"use client";
import React from "react";
import { 
    X, 
    User, 
    Phone, 
    Calendar, 
    Activity, 
    DollarSign, 
    Tag, 
    MapPin, 
    UserCircle2,
    Clock,
    ShieldCheck,
    Stethoscope
} from "lucide-react";
import { Patient } from "../types";
import { cn } from "@/lib/utils";

interface PatientViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
}

const PatientViewModal: React.FC<PatientViewModalProps> = ({ isOpen, onClose, patient }) => {
    if (!isOpen || !patient) return null;

    const infoGroups = [
        {
            title: "Identity Details",
            items: [
                { label: "Full Name", value: patient.name, icon: User },
                { label: "Age", value: `${patient.age} Years`, icon: Calendar },
                { label: "Gender", value: patient.gender, icon: UserCircle2 },
                { label: "Patient ID", value: patient.patientId, icon: ShieldCheck },
            ]
        },
        {
            title: "Contact & Source",
            items: [
                { label: "Phone Number", value: patient.phoneNumber, icon: Phone },
                { label: "Traffic Source", value: patient.sourceType, icon: MapPin },
                { 
                    label: "Referral", 
                    value: typeof patient.doctorReferral === 'object' ? `Dr. ${patient.doctorReferral.name}` : "Direct Intake", 
                    icon: Stethoscope 
                },
            ]
        },
        {
            title: "Clinical Status",
            items: [
                { label: "Test Status", value: patient.testStatus, icon: Activity, highlight: true },
                { label: "Registration Date", value: new Date(patient.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), icon: Clock },
                { label: "Billing Amount", value: `₹${patient.revenue.toLocaleString()}`, icon: DollarSign },
            ]
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />
            
            <div className="relative bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden font-sans border border-slate-200">
                {/* Header Profile Section */}
                <div className="relative h-32 bg-slate-900 flex items-end px-8 pb-6">
                    <div className="absolute top-0 right-0 p-6">
                        <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex items-center gap-6 z-10">
                        <div className="w-20 h-20 rounded-2xl bg-blue-600 border-4 border-white flex items-center justify-center text-white shadow-xl translate-y-10">
                            <UserCircle2 className="w-12 h-12" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-black text-white tracking-tight">{patient.name}</h2>
                            <p className="text-blue-400 text-xs font-bold uppercase tracking-[0.2em]">{patient.patientId}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-16 pb-8 px-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {infoGroups.map((group, gIdx) => (
                            <div key={gIdx} className={cn("space-y-6", gIdx === infoGroups.length - 1 && "md:col-span-2")}>
                                <div className="flex items-center gap-3">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{group.title}</h3>
                                    <div className="flex-1 h-[1px] bg-slate-100" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {group.items.map((item, iIdx) => (
                                        <div key={iIdx} className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <item.icon className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                                            </div>
                                            <div className={cn(
                                                "text-sm font-bold text-slate-900 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100",
                                                item.highlight && patient.testStatus === "Completed" && "bg-emerald-50 text-emerald-700 border-emerald-100",
                                                item.highlight && patient.testStatus === "Processing" && "bg-blue-50 text-blue-700 border-blue-100"
                                            )}>
                                                {item.value}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Action */}
                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            patient.testStatus === "Completed" ? "bg-emerald-500" : "bg-blue-500 animate-pulse"
                        )} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            System Verified Record
                        </span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="px-8 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-all active:scale-95"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PatientViewModal;
