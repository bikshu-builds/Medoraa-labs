"use client";
import React, { useState, useEffect } from "react";
import { X, User, Building2, Phone, Mail, Calendar, CheckCircle2, Loader2, Users, Trash2 } from "lucide-react";
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
        affiliationType: "HOSPITAL",
        hospitalId: "",
        labId: "",
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

    // Local select states for cascaded dropdowns
    const [selectedHospitalName, setSelectedHospitalName] = useState("");
    const [selectedBranchId, setSelectedBranchId] = useState("");
    const [isAddingHospital, setIsAddingHospital] = useState(false);
    const [newHospitalData, setNewHospitalData] = useState({
        hospitalName: "",
        branch: "",
        pocName: "",
        telephoneNumber: "",
        stateName: "",
        district: "",
        city: "",
        pincode: "",
        village: "",
        doorNo: "",
        completeAddress: ""
    });
    const [newHospitalLabs, setNewHospitalLabs] = useState<string[]>([""]);

    const uniqueHospitalNames = Array.from(new Set(hospitals.map(h => h.hospitalName))).sort();
    const branchesForSelectedHospital = hospitals.filter(h => h.hospitalName === selectedHospitalName);

    const handleHospitalNameChange = (name: string) => {
        setSelectedHospitalName(name);
        setSelectedBranchId("");
        setFormData(prev => ({ ...prev, hospitalId: "" }));
    };

    const handleBranchChange = (branchId: string) => {
        setSelectedBranchId(branchId);
        setFormData(prev => ({ ...prev, hospitalId: branchId }));
    };

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
            const hospId = (typeof doctor.hospitalId === 'object' && doctor.hospitalId !== null) ? (doctor.hospitalId as any)._id : (doctor.hospitalId || "");
            const labIdVal = (typeof doctor.labId === 'object' && doctor.labId !== null) ? (doctor.labId as any)._id : (doctor.labId || "");
            const affType = doctor.affiliationType || "HOSPITAL";

            setFormData({
                ...doctor,
                affiliationType: affType,
                hospitalId: hospId,
                labId: labIdVal,
                dateOfBirth: doctor.dateOfBirth ? new Date(doctor.dateOfBirth).toISOString().split('T')[0] : "",
                degree: doctor.degree || "",
                specialization: doctor.specialization || "",
                referralPercentage: doctor.referralPercentage || 0,
                periodType: doctor.periodType || "WEEKLY",
                periodStartDate: doctor.periodStartDate ? new Date(doctor.periodStartDate).toISOString().split('T')[0] : "",
                periodEndDate: doctor.periodEndDate ? new Date(doctor.periodEndDate).toISOString().split('T')[0] : ""
            });

            if (affType === "HOSPITAL") {
                if (hospitals.length > 0 && hospId) {
                    const foundHosp = hospitals.find(h => h._id === hospId);
                    if (foundHosp) {
                        setSelectedHospitalName(foundHosp.hospitalName || "");
                        setSelectedBranchId(hospId);
                    }
                } else {
                    setSelectedBranchId(hospId);
                }
            } else {
                setSelectedHospitalName("");
                setSelectedBranchId("");
            }
        } else {
            setFormData({
                doctorName: "",
                affiliationType: "HOSPITAL",
                hospitalId: "",
                labId: "",
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
            setSelectedHospitalName("");
            setSelectedBranchId("");
        }
        setIsAddingHospital(false);
        setNewHospitalData({
            hospitalName: "",
            branch: "",
            pocName: "",
            telephoneNumber: "",
            stateName: "",
            district: "",
            city: "",
            pincode: "",
            village: "",
            doorNo: "",
            completeAddress: ""
        });
        setNewHospitalLabs([""]);
        setError("");
    }, [doctor, isOpen, hospitals]);

    if (!isOpen) return null;



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        try {
            let finalHospitalId = selectedBranchId;

            if (isAddingHospital) {
                if (!newHospitalData.hospitalName.trim()) {
                    throw new Error("Hospital Name is required to add a new hospital");
                }
                const token = localStorage.getItem("adminToken");
                const res = await fetch(getApiUrl("/api/admin/hospitals"), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        hospitalName: newHospitalData.hospitalName,
                        branch: newHospitalData.branch,
                        pocName: newHospitalData.pocName,
                        telephoneNumber: newHospitalData.telephoneNumber,
                        address: {
                            state: newHospitalData.stateName,
                            district: newHospitalData.district,
                            city: newHospitalData.city,
                            pincode: newHospitalData.pincode,
                            village: newHospitalData.village,
                            doorNo: newHospitalData.doorNo,
                            completeAddress: newHospitalData.completeAddress
                        },
                        labs: newHospitalLabs.filter(l => l.trim() !== "")
                    })
                });
                const data = await res.json();
                if (!data.success) {
                    throw new Error(data.message || "Failed to create new hospital");
                }
                finalHospitalId = data.data._id;
            }

            if (!finalHospitalId) {
                throw new Error("Please select a hospital branch or add a new one");
            }

            const cleanData = {
                ...formData,
                affiliationType: "HOSPITAL" as const,
                hospitalId: finalHospitalId,
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
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Affiliation & Branch</h3>
                                <button
                                    type="button"
                                    onClick={() => setIsAddingHospital(prev => !prev)}
                                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider flex items-center gap-1 transition-all"
                                >
                                    {isAddingHospital ? "× Cancel Add" : "+ Add Hospital"}
                                </button>
                            </div>

                            {isAddingHospital ? (
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-6 animate-in fade-in duration-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                        {/* Left Column: Basic Info & Lab Facilities */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Basic Information</h4>
                                            
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-slate-700">Hospital Name *</label>
                                                <input
                                                    type="text"
                                                    required={isAddingHospital}
                                                    placeholder="Hospital Name"
                                                    value={newHospitalData.hospitalName}
                                                    onChange={(e) => setNewHospitalData(prev => ({ ...prev, hospitalName: e.target.value }))}
                                                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-slate-700">Branch</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. City Center, Jubilee Hills"
                                                    value={newHospitalData.branch}
                                                    onChange={(e) => setNewHospitalData(prev => ({ ...prev, branch: e.target.value }))}
                                                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-slate-700">Point of Contact Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="POC Name"
                                                    value={newHospitalData.pocName}
                                                    onChange={(e) => setNewHospitalData(prev => ({ ...prev, pocName: e.target.value }))}
                                                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-slate-700">Telephone Number</label>
                                                <input
                                                    type="tel"
                                                    placeholder="Telephone Number"
                                                    value={newHospitalData.telephoneNumber}
                                                    onChange={(e) => setNewHospitalData(prev => ({ ...prev, telephoneNumber: e.target.value }))}
                                                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
                                                />
                                            </div>

                                            {/* Lab Facilities */}
                                            <div className="space-y-2 pt-2 border-t border-slate-100">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Lab Facilities</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => setNewHospitalLabs([...newHospitalLabs, ""])}
                                                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                                    >
                                                        + Add Another Lab
                                                    </button>
                                                </div>
                                                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                                                    {newHospitalLabs.map((lab, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder={`Lab Name ${index + 1}`}
                                                                value={lab}
                                                                onChange={(e) => {
                                                                    const newLabs = [...newHospitalLabs];
                                                                    newLabs[index] = e.target.value;
                                                                    setNewHospitalLabs(newLabs);
                                                                }}
                                                                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
                                                            />
                                                            {newHospitalLabs.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setNewHospitalLabs(newHospitalLabs.filter((_, i) => i !== index))}
                                                                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column: Address Details */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Address Details</h4>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[11px] font-bold text-slate-700">State *</label>
                                                    <input
                                                        type="text"
                                                        required={isAddingHospital}
                                                        placeholder="State"
                                                        value={newHospitalData.stateName}
                                                        onChange={(e) => setNewHospitalData(prev => ({ ...prev, stateName: e.target.value }))}
                                                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[11px] font-bold text-slate-700">District *</label>
                                                    <input
                                                        type="text"
                                                        required={isAddingHospital}
                                                        placeholder="District"
                                                        value={newHospitalData.district}
                                                        onChange={(e) => setNewHospitalData(prev => ({ ...prev, district: e.target.value }))}
                                                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[11px] font-bold text-slate-700">City</label>
                                                    <input
                                                        type="text"
                                                        placeholder="City"
                                                        value={newHospitalData.city}
                                                        onChange={(e) => setNewHospitalData(prev => ({ ...prev, city: e.target.value }))}
                                                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[11px] font-bold text-slate-700">Village</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Village"
                                                        value={newHospitalData.village}
                                                        onChange={(e) => setNewHospitalData(prev => ({ ...prev, village: e.target.value }))}
                                                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[11px] font-bold text-slate-700">Door Number</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Door Number"
                                                        value={newHospitalData.doorNo}
                                                        onChange={(e) => setNewHospitalData(prev => ({ ...prev, doorNo: e.target.value }))}
                                                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[11px] font-bold text-slate-700">Pincode</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Pincode"
                                                        value={newHospitalData.pincode}
                                                        onChange={(e) => setNewHospitalData(prev => ({ ...prev, pincode: e.target.value }))}
                                                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-slate-700">Complete Address</label>
                                                <textarea
                                                    placeholder="Enter complete address..."
                                                    rows={2}
                                                    value={newHospitalData.completeAddress}
                                                    onChange={(e) => setNewHospitalData(prev => ({ ...prev, completeAddress: e.target.value }))}
                                                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none resize-none text-slate-800"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hospital Name (*)</label>
                                        <div className="relative">
                                            <select
                                                required={!isAddingHospital}
                                                value={selectedHospitalName}
                                                onChange={(e) => handleHospitalNameChange(e.target.value)}
                                                className="w-full pl-4 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none text-slate-800"
                                            >
                                                <option value="" disabled>Select Hospital</option>
                                                {uniqueHospitalNames.map(name => (
                                                    <option key={name} value={name}>{name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Branch (*)</label>
                                        <div className="relative">
                                            <select
                                                required={!isAddingHospital}
                                                value={selectedBranchId}
                                                onChange={(e) => handleBranchChange(e.target.value)}
                                                disabled={!selectedHospitalName}
                                                className={cn(
                                                    "w-full pl-4 pr-4 py-2 border rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none text-slate-800",
                                                    selectedHospitalName ? "bg-slate-50 border-slate-200" : "bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed"
                                                )}
                                            >
                                                <option value="" disabled>
                                                    {selectedHospitalName ? "Select Branch" : "Select Hospital First"}
                                                </option>
                                                {branchesForSelectedHospital.map(h => (
                                                    <option key={h._id} value={h._id}>
                                                        {h.branch || "Main Branch"}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>


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
                                                onChange={(e) => setFormData({...formData, periodType: e.target.value as any})}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                                            >
                                                <option value="WEEKLY">Weekly</option>
                                                <option value="FIFTEEN_DAYS">15 Days</option>
                                                <option value="MONTHLY">Monthly</option>
                                            </select>
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
