"use client";
import React, { useState, useEffect } from "react";
import { X, Truck, Building2, CheckSquare, Square, Send, Loader2, Phone, User, Tag, FileText, Printer } from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface TestItem {
    _id?: string;
    testName?: string;
    name?: string;
    category?: string;
    organ?: string;
    patientPrice?: number | string;
}

interface PatientRecord {
    _id: string;
    registrationNumber: string;
    patientName: string;
    age?: { value: number; type: string };
    gender?: string;
    tests?: TestItem[];
    sampleTransfer?: any;
}

interface SampleTransferModalProps {
    record: PatientRecord | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (updatedRecord: any) => void;
}

export default function SampleTransferModal({ record, isOpen, onClose, onSuccess }: SampleTransferModalProps) {
    const [labsList, setLabsList] = useState<string[]>([]);
    const [loadingLabs, setLoadingLabs] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form States
    const [modeOfTransfer, setModeOfTransfer] = useState("Courier");
    const [selectedRefLab, setSelectedRefLab] = useState("");
    const [customRefLab, setCustomRefLab] = useState("");
    const [contactPersonName, setContactPersonName] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [vehicleNumber, setVehicleNumber] = useState("");
    const [courierAgency, setCourierAgency] = useState("");
    const [docketNumber, setDocketNumber] = useState("");
    const [remarks, setRemarks] = useState("");

    // Selected Test IDs state
    const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen && record) {
            const existingTransfer = record.sampleTransfer;
            const allTestIds = (record.tests || []).map(t => t._id || t.testName || "");
            
            if (existingTransfer) {
                setModeOfTransfer(existingTransfer.modeOfTransfer || "Courier");
                setSelectedRefLab(existingTransfer.referenceLab || "");
                setContactPersonName(existingTransfer.contactPersonName || "");
                setContactNumber(existingTransfer.contactNumber || "");
                setVehicleNumber(existingTransfer.vehicleNumber || "");
                setCourierAgency(existingTransfer.courierAgency || "");
                setDocketNumber(existingTransfer.docketNumber || "");
                setRemarks(existingTransfer.remarks || "");
                if (existingTransfer.transferredTestIds && existingTransfer.transferredTestIds.length > 0) {
                    setSelectedTestIds(existingTransfer.transferredTestIds);
                } else {
                    setSelectedTestIds(allTestIds);
                }
            } else {
                setSelectedTestIds(allTestIds);
            }

            fetchReferenceLabs();
        }
    }, [isOpen, record]);

    const fetchReferenceLabs = async () => {
        setLoadingLabs(true);
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/hospitals"), {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                const names: string[] = [];
                data.data.forEach((hosp: any) => {
                    if (hosp.hospitalName) names.push(hosp.hospitalName);
                    if (Array.isArray(hosp.labs)) {
                        hosp.labs.forEach((l: any) => {
                            if (l.labName && !names.includes(l.labName)) {
                                names.push(l.labName);
                            }
                        });
                    }
                });
                setLabsList(names);
                if (names.length > 0 && !selectedRefLab) {
                    setSelectedRefLab(names[0]);
                }
            }
        } catch (err) {
            console.error("Failed loading reference labs", err);
        } finally {
            setLoadingLabs(false);
        }
    };

    if (!isOpen || !record) return null;

    const availableTests = record.tests || [];

    const toggleTestSelect = (idOrName: string) => {
        setSelectedTestIds(prev =>
            prev.includes(idOrName) ? prev.filter(item => item !== idOrName) : [...prev, idOrName]
        );
    };

    const toggleSelectAll = () => {
        if (selectedTestIds.length === availableTests.length) {
            setSelectedTestIds([]);
        } else {
            setSelectedTestIds(availableTests.map(t => t._id || t.testName || ""));
        }
    };

    const finalReferenceLab = selectedRefLab === "CUSTOM" ? customRefLab : selectedRefLab;

    const handlePrintTransferLabel = () => {
        if (!record) return;
        const url = getApiUrl(`/api/admin/registrations/${record._id}/transfer-label-pdf`);
        window.open(url, "_blank");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!finalReferenceLab.trim()) {
            alert("Please select or enter a Reference Laboratory name.");
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("adminToken");
            const transferredTestNames: string[] = [];
            const testStatuses: { testName: string; status: string }[] = [];

            availableTests.forEach(t => {
                const key = t._id || t.testName || "";
                const name = t.testName || t.name || "Test";
                const isSelected = selectedTestIds.includes(key);

                if (isSelected) {
                    transferredTestNames.push(name);
                    testStatuses.push({ testName: name, status: `Transferred to ${finalReferenceLab}` });
                } else {
                    testStatuses.push({ testName: name, status: "At Lab" });
                }
            });

            const payload = {
                modeOfTransfer,
                referenceLab: finalReferenceLab,
                contactPersonName,
                contactNumber,
                vehicleNumber,
                courierAgency,
                docketNumber,
                remarks,
                transferredTestIds: selectedTestIds,
                transferredTestNames,
                testStatuses
            };

            const res = await fetch(getApiUrl(`/api/admin/registrations/${record._id}/transfer-sample`), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                if (onSuccess) onSuccess(data.data);
                window.open(getApiUrl(`/api/admin/registrations/${record._id}/transfer-label-pdf`), "_blank");
                onClose();
            } else {
                alert(data.message || "Failed saving sample transfer details.");
            }
        } catch (err: any) {
            console.error("Error submitting sample transfer", err);
            alert("Network error saving sample transfer: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[300] flex items-center justify-center p-4 font-sans">
            <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white max-w-2xl w-full rounded-lg shadow-xl overflow-hidden flex flex-col border border-slate-300 dark:border-slate-800 my-auto animate-in fade-in duration-150">
                
                {/* Classic Header */}
                <div className="px-5 py-3.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md">
                            <Truck className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Outsource Sample Transfer Form</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Patient: <span className="font-semibold text-slate-700 dark:text-slate-200">{record.patientName}</span> ({record.registrationNumber})
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-md transition-colors cursor-pointer"
                        title="Close Modal"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                    
                    {/* Primary Transfer Parameters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Mode of Transfer */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5 text-slate-500" />
                                Mode of Transfer <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={modeOfTransfer}
                                onChange={(e) => setModeOfTransfer(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
                                required
                            >
                                <option value="Courier">Courier / Logistics</option>
                                <option value="Employee">Internal Staff / Employee</option>
                                <option value="Person">Authorized Person</option>
                                <option value="Bus">Bus Service</option>
                                <option value="Vehicle">Dedicated Vehicle</option>
                                <option value="Other">Other Mode</option>
                            </select>
                        </div>

                        {/* Reference Laboratory */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                Reference Laboratory <span className="text-red-500">*</span>
                            </label>
                            {loadingLabs ? (
                                <div className="flex items-center gap-2 py-1.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs text-slate-500">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading Reference Labs...
                                </div>
                            ) : (
                                <select
                                    value={selectedRefLab}
                                    onChange={(e) => setSelectedRefLab(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
                                    required
                                >
                                    {labsList.length > 0 ? (
                                        labsList.map((labName, i) => (
                                            <option key={i} value={labName}>{labName}</option>
                                        ))
                                    ) : (
                                        <option value="Medoraa Central Reference Lab">Medoraa Central Reference Lab</option>
                                    )}
                                    <option value="CUSTOM">+ Add Custom Reference Lab...</option>
                                </select>
                            )}

                            {selectedRefLab === "CUSTOM" && (
                                <input
                                    type="text"
                                    placeholder="Enter Reference Lab Name..."
                                    value={customRefLab}
                                    onChange={(e) => setCustomRefLab(e.target.value)}
                                    className="w-full mt-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-medium outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                                    required
                                />
                            )}
                        </div>
                    </div>

                    {/* Prescribed Tests Checkbox Table/List */}
                    <div className="border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden bg-slate-50/50 dark:bg-slate-800/40">
                        <div className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                                <Tag className="w-3.5 h-3.5 text-slate-500" />
                                Prescribed Test Outsourcing Status
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                <span className="font-semibold text-slate-600 dark:text-slate-300">
                                    Sending {selectedTestIds.length} of {availableTests.length} Tests
                                </span>
                                <button
                                    type="button"
                                    onClick={toggleSelectAll}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-semibold cursor-pointer underline"
                                >
                                    {selectedTestIds.length === availableTests.length ? "Deselect All" : "Select All"}
                                </button>
                            </div>
                        </div>

                        {/* Test Rows */}
                        <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-36 overflow-y-auto bg-white dark:bg-slate-900">
                            {availableTests.map((test, index) => {
                                const key = test._id || test.testName || `test-${index}`;
                                const testNameStr = test.testName || test.name || "Diagnostic Parameter";
                                const isChecked = selectedTestIds.includes(key);

                                return (
                                    <div
                                        key={key}
                                        onClick={() => toggleTestSelect(key)}
                                        className="flex items-center justify-between px-3.5 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => {}}
                                                className="w-3.5 h-3.5 rounded border-slate-300 text-slate-800 focus:ring-slate-500 cursor-pointer"
                                            />
                                            <span className={`font-medium ${isChecked ? "text-slate-900 dark:text-white" : "text-slate-500 line-through"}`}>
                                                {testNameStr}
                                            </span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                            isChecked
                                                ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600"
                                                : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                                        }`}>
                                            {isChecked ? "Transferred" : "At Lab"}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Dispatch & Contact Information */}
                    <div className="space-y-3 pt-1">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-1">
                            Dispatch & Logistics Information
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Contact Person Name */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Contact Person Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Lab Coordinator Name"
                                    value={contactPersonName}
                                    onChange={(e) => setContactPersonName(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-medium outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                                />
                            </div>

                            {/* Contact Number */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Contact Mobile Number
                                </label>
                                <input
                                    type="tel"
                                    placeholder="10-digit mobile number"
                                    value={contactNumber}
                                    onChange={(e) => setContactNumber(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-medium outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                                />
                            </div>

                            {/* Vehicle Number */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Vehicle Number (if applicable)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. AP 39 AB 1234"
                                    value={vehicleNumber}
                                    onChange={(e) => setVehicleNumber(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-medium outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                                />
                            </div>

                            {/* Courier / Logistics Agency */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Courier / Logistics Agency
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. BlueDart / DTDC"
                                    value={courierAgency}
                                    onChange={(e) => setCourierAgency(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-medium outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                                />
                            </div>
                        </div>

                        {/* Docket / AWB Number */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Docket / Consignment / AWB Tracking Number
                            </label>
                            <input
                                type="text"
                                placeholder="Enter tracking / AWB number..."
                                value={docketNumber}
                                onChange={(e) => setDocketNumber(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-mono font-medium outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                            />
                        </div>

                        {/* Remarks */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Remarks / Special Dispatch Instructions
                            </label>
                            <textarea
                                rows={2}
                                placeholder="Enter transport instructions or temperature notes..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-medium outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 resize-none"
                            />
                        </div>
                    </div>

                    {/* Classic Footer */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                        {record.sampleTransfer ? (
                            <button
                                type="button"
                                onClick={handlePrintTransferLabel}
                                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-md text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                                <Printer className="w-3.5 h-3.5 text-amber-400" />
                                Print Thermal Label
                            </button>
                        ) : <div />}

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-xs font-semibold transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-3.5 h-3.5" />
                                        Save & Dispatch Sample
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}
