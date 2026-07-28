"use client";
import React, { useState, useEffect } from "react";
import { X, Building2, Phone, User, Trash2, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HospitalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (hospitalData: any) => Promise<void>;
    hospital?: any | null;
}

const HospitalModal: React.FC<HospitalModalProps> = ({ isOpen, onClose, onSave, hospital }) => {
    const [formData, setFormData] = useState({
        hospitalName: "",
        branch: "",
        pocName: "",
        telephoneNumber: "",
        stateName: "",
        district: "",
        city: "",
        village: "",
        doorNo: "",
        pincode: "",
        completeAddress: ""
    });
    const [labs, setLabs] = useState<string[]>([""]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (hospital) {
            setFormData({
                hospitalName: hospital.hospitalName || "",
                branch: hospital.branch || "",
                pocName: hospital.pocName || "",
                telephoneNumber: hospital.telephoneNumber || "",
                stateName: hospital.address?.state || "",
                district: hospital.address?.district || "",
                city: hospital.address?.city || "",
                village: hospital.address?.village || "",
                doorNo: hospital.address?.doorNo || "",
                pincode: hospital.address?.pincode || "",
                completeAddress: hospital.address?.completeAddress || ""
            });
            setLabs(hospital.labs && hospital.labs.length > 0 
                ? hospital.labs.map((lab: any) => typeof lab === 'object' && lab !== null ? lab.labName : lab) 
                : [""]);
        } else {
            setFormData({
                hospitalName: "",
                branch: "",
                pocName: "",
                telephoneNumber: "",
                stateName: "",
                district: "",
                city: "",
                village: "",
                doorNo: "",
                pincode: "",
                completeAddress: ""
            });
            setLabs([""]);
        }
        setError("");
    }, [hospital, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        try {
            if (formData.telephoneNumber && formData.telephoneNumber.replace(/\D/g, "").length !== 10) {
                throw new Error("Telephone number must be exactly 10 digits");
            }
            const payload = {
                hospitalName: formData.hospitalName,
                branch: formData.branch,
                pocName: formData.pocName,
                telephoneNumber: formData.telephoneNumber,
                address: {
                    state: formData.stateName,
                    district: formData.district,
                    city: formData.city,
                    village: formData.village,
                    doorNo: formData.doorNo,
                    pincode: formData.pincode,
                    completeAddress: formData.completeAddress
                },
                labs: labs.filter(l => l.trim() !== "")
            };
            await onSave(payload);
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to save hospital details");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="relative bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden font-sans border border-slate-200 animate-in fade-in zoom-in duration-250">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                            {hospital ? "Update Hospital Details" : "Register New Hospital"}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {hospital ? `Ref ID: ${hospital._id}` : "Add new hospital branch partner"}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-xs font-semibold animate-in fade-in duration-200">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Column 1: Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Basic Information</h3>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hospital Name (*)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        placeholder="Hospital Name"
                                        value={formData.hospitalName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, hospitalName: e.target.value }))}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Branch (*)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. City Center, Jubilee Hills"
                                        value={formData.branch}
                                        onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Point of Contact Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="POC Name"
                                        value={formData.pocName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, pocName: e.target.value }))}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Telephone Number</label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        placeholder="Telephone Number"
                                        value={formData.telephoneNumber}
                                        onChange={(e) => setFormData(prev => ({ ...prev, telephoneNumber: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800"
                                    />
                                </div>
                            </div>

                            {/* Labs facilities */}
                            <div className="space-y-3 pt-2 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Lab Facilities</h4>
                                    <button
                                        type="button"
                                        onClick={() => setLabs([...labs, ""])}
                                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                    >
                                        + Add Another Lab
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                                    {labs.map((lab, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                placeholder={`Lab Name ${index + 1}`}
                                                value={lab}
                                                onChange={(e) => {
                                                    const newLabs = [...labs];
                                                    newLabs[index] = e.target.value;
                                                    setLabs(newLabs);
                                                }}
                                                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
                                            />
                                            {labs.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setLabs(labs.filter((_, i) => i !== index))}
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

                        {/* Column 2: Address Details */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Address Details</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">State (*)</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="State"
                                        value={formData.stateName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, stateName: e.target.value }))}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">District (*)</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="District"
                                        value={formData.district}
                                        onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">City</label>
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={formData.city}
                                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Village</label>
                                    <input
                                        type="text"
                                        placeholder="Village"
                                        value={formData.village}
                                        onChange={(e) => setFormData(prev => ({ ...prev, village: e.target.value }))}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Door Number</label>
                                    <input
                                        type="text"
                                        placeholder="Door Number"
                                        value={formData.doorNo}
                                        onChange={(e) => setFormData(prev => ({ ...prev, doorNo: e.target.value }))}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pincode</label>
                                    <input
                                        type="text"
                                        placeholder="Pincode"
                                        value={formData.pincode}
                                        onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Complete Address</label>
                                <textarea
                                    placeholder="Enter complete address..."
                                    rows={3}
                                    value={formData.completeAddress}
                                    onChange={(e) => setFormData(prev => ({ ...prev, completeAddress: e.target.value }))}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none resize-none text-slate-800"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded text-xs transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded text-xs transition-all active:scale-95 shadow-md shadow-blue-500/10"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Details"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HospitalModal;
