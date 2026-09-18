"use client";
import React, { useEffect, useState } from "react";
import DashboardCard from "../components/DashboardCard";
import {
    CheckCircle2,
    AlertCircle,
    Search,
    Filter,
    FileText,
    AlertTriangle,
    BadgeCheck,
    Zap,
    ClipboardCheck,
    User,
    Clock,
    RotateCcw,
    Eye,
    XCircle,
    Check,
    Loader2,
    Calendar,
    Stethoscope,
    FlaskConical,
    Save,
    ArrowLeft,
    Printer,
    Trash2,
    Phone,
    ShieldAlert,
    Send,
    Pencil,
    MapPin,
    Download
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import PathologyReportModal from "../components/PathologyReportModal";

interface TestResultEntry {
    testId?: string;
    testName: string;
    resultValue: string;
    unit: string;
    referenceRange: string;
    flag: "Normal" | "Abnormal" | "Critical" | "";
    notes?: string;
}

interface PatientTestRecord {
    _id: string;
    registrationNumber: string;
    patientName: string;
    age: { value: number; type: string };
    gender: string;
    mobileNumber: string;
    address?: string;
    referredBy: string;
    registrationDate: string;
    registrationTime: string;
    sampleReceived?: any;
    tests?: any[];
    testResults?: TestResultEntry[];
    authorizationStatus?: "PENDING" | "AUTHORIZED" | "FLAGGED" | "REJECTED";
    authorizedBy?: string;
    authorizedAt?: string;
    notes?: string;
}

export default function ExaminerDashboard() {
    const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [registrations, setRegistrations] = useState<PatientTestRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    // Full page view state for active result entry workspace
    const [selectedRecord, setSelectedRecord] = useState<PatientTestRecord | null>(null);
    const [editableResults, setEditableResults] = useState<TestResultEntry[]>([]);
    const [examinerNotes, setExaminerNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Official Pathology Report Modal State
    const [reportModalRecord, setReportModalRecord] = useState<PatientTestRecord | null>(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);


    // Initial mock data as fallback
    const demoWorklist: PatientTestRecord[] = [
        {
            _id: "demo-1",
            registrationNumber: "REG-2026-091",
            patientName: "Dr. Ananya Sharma",
            age: { value: 34, type: "Years" },
            gender: "Female",
            mobileNumber: "9876543210",
            address: "Bandhavgarh, MP",
            referredBy: "Self / Apollo Clinic",
            registrationDate: "25-07-2026",
            registrationTime: "10:15 AM",
            tests: [{ testName: "Complete Blood Count (CBC)", referenceRange: "4.5 - 11.0 k/uL" }],
            testResults: [
                { testName: "Hemoglobin (Hb)", resultValue: "13.2", unit: "g/dL", referenceRange: "12.0 - 15.5 g/dL", flag: "Normal" },
                { testName: "Total WBC Count", resultValue: "6.8", unit: "k/uL", referenceRange: "4.5 - 11.0 k/uL", flag: "Normal" }
            ],
            authorizationStatus: "PENDING"
        },
        {
            _id: "demo-2",
            registrationNumber: "REG-2026-092",
            patientName: "Rajesh Kumar",
            age: { value: 48, type: "Years" },
            gender: "Male",
            mobileNumber: "9812345678",
            address: "Civil Lines, Nagpur",
            referredBy: "Dr. V. K. Gupta",
            registrationDate: "25-07-2026",
            registrationTime: "10:40 AM",
            tests: [{ testName: "Fasting Blood Sugar", referenceRange: "70 - 99 mg/dL" }],
            testResults: [
                { testName: "Fasting Blood Glucose", resultValue: "145", unit: "mg/dL", referenceRange: "70 - 99 mg/dL", flag: "Abnormal" }
            ],
            authorizationStatus: "FLAGGED",
            notes: "Please re-check glucose values before final sign-off."
        }
    ];

    const fetchRegistrations = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/registrations"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                const formatted = data.data.map((r: any) => ({
                    ...r,
                    authorizationStatus: r.authorizationStatus || "PENDING"
                }));
                setRegistrations(formatted);
                localStorage.setItem("medoraa_shared_registrations", JSON.stringify(formatted));
            } else {
                const cached = localStorage.getItem("medoraa_shared_registrations");
                if (cached) {
                    try {
                        setRegistrations(JSON.parse(cached));
                    } catch {
                        setRegistrations(demoWorklist);
                    }
                } else {
                    setRegistrations(demoWorklist);
                }
            }
        } catch (err) {
            console.error("Failed to fetch registrations", err);
            const cached = localStorage.getItem("medoraa_shared_registrations");
            if (cached) {
                try {
                    setRegistrations(JSON.parse(cached));
                } catch {
                    setRegistrations(demoWorklist);
                }
            } else {
                setRegistrations(demoWorklist);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("adminUser");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error(e);
            }
        }
        fetchRegistrations();
    }, []);

    // Patient Demographic Editing State
    const [isEditingPatient, setIsEditingPatient] = useState(false);
    const [patientForm, setPatientForm] = useState({
        patientName: "",
        ageValue: "",
        ageType: "Years",
        gender: "Male",
        mobileNumber: "",
        address: "",
        referredBy: ""
    });



    useEffect(() => {
        if (selectedRecord) {
            let aVal = "";
            let aType = "Years";
            if (typeof selectedRecord.age === "object" && selectedRecord.age !== null) {
                aVal = String(selectedRecord.age.value || "");
                aType = selectedRecord.age.type || "Years";
            } else {
                aVal = String(selectedRecord.age || "");
            }

            setPatientForm({
                patientName: selectedRecord.patientName || "",
                ageValue: aVal,
                ageType: aType,
                gender: selectedRecord.gender || "Male",
                mobileNumber: selectedRecord.mobileNumber || "",
                address: selectedRecord.address || "",
                referredBy: selectedRecord.referredBy || ""
            });
            setIsEditingPatient(false);

            if (selectedRecord.testResults && selectedRecord.testResults.length > 0) {
                const results = [...selectedRecord.testResults];
                // Check if any ordered tests from selectedRecord.tests are missing in testResults
                if (selectedRecord.tests && Array.isArray(selectedRecord.tests)) {
                    selectedRecord.tests.forEach((t: any) => {
                        const tName = typeof t === "string" ? t : (t.testName || t.name);
                        const tId = typeof t === "object" ? (t._id || t.id) : t;
                        const exists = results.some(item =>
                            (tId && item.testId && String(item.testId) === String(tId)) ||
                            (tName && item.testName && item.testName.toLowerCase().trim() === tName.toLowerCase().trim())
                        );
                        if (!exists && tName) {
                            results.push({
                                testId: tId,
                                testName: tName,
                                resultValue: "",
                                unit: typeof t === "object" ? (t.units || t.unit || "") : "",
                                referenceRange: typeof t === "object" ? (t.referenceRange || "-") : "-",
                                flag: "Normal" as const
                            });
                        }
                    });
                }
                setEditableResults(results);
            } else if (selectedRecord.tests && selectedRecord.tests.length > 0) {
                const initial = selectedRecord.tests.map((t: any) => ({
                    testId: t._id || t,
                    testName: typeof t === "string" ? t : (t.testName || "Diagnostic Test"),
                    resultValue: "",
                    unit: typeof t === "object" ? (t.units || t.unit || "") : "",
                    referenceRange: typeof t === "object" ? (t.referenceRange || "-") : "-",
                    flag: "Normal" as const
                }));
                setEditableResults(initial);
            } else {
                setEditableResults([
                    { testName: "Routine Pathology Parameter", resultValue: "", unit: "", referenceRange: "-", flag: "Normal" }
                ]);
            }
            setExaminerNotes(selectedRecord.notes || "");
            setSuccessMessage("");
        }
    }, [selectedRecord]);

    const handleApplyPatientChanges = () => {
        if (!selectedRecord) return;
        const updatedAge = { value: Number(patientForm.ageValue) || 0, type: patientForm.ageType };
        const updatedRecord = {
            ...selectedRecord,
            patientName: patientForm.patientName,
            age: updatedAge,
            gender: patientForm.gender,
            mobileNumber: patientForm.mobileNumber,
            address: patientForm.address,
            referredBy: patientForm.referredBy
        };
        setSelectedRecord(updatedRecord);
        setIsEditingPatient(false);
    };

    const handleResultChange = (index: number, field: keyof TestResultEntry, value: string) => {
        setEditableResults(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value };
            return copy;
        });
    };



    const handleRemoveTestRow = (index: number) => {
        setEditableResults(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveResults = async (submitForAuth: boolean = false) => {
        if (!selectedRecord) return;

        const enteredCount = editableResults.filter(t => t.resultValue && String(t.resultValue).trim() !== "").length;
        const pendingCount = editableResults.length - enteredCount;

        if (submitForAuth && enteredCount === 0) {
            alert("Please enter observation values for at least one test before submitting to Authorization.");
            return;
        }

        setIsSubmitting(true);
        setSuccessMessage("");

        try {
            const token = localStorage.getItem("adminToken");
            const newStatus = submitForAuth ? "PENDING" : (selectedRecord.authorizationStatus || "PENDING");
            
            const payload = {
                patientName: patientForm.patientName,
                age: { value: Number(patientForm.ageValue) || 0, type: patientForm.ageType },
                gender: patientForm.gender,
                mobileNumber: patientForm.mobileNumber,
                address: patientForm.address,
                referredBy: patientForm.referredBy,
                testResults: editableResults,
                authorizationStatus: newStatus,
                notes: examinerNotes,
                authorizedBy: selectedRecord.authorizedBy || ""
            };

            const res = await fetch(getApiUrl(`/api/admin/registrations/${selectedRecord._id}/authorization`), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            let updatedList: PatientTestRecord[] = [];
            if (data.success && data.data) {
                updatedList = registrations.map(item => item._id === selectedRecord._id ? data.data : item);
            } else {
                updatedList = registrations.map(item => {
                    if (item._id === selectedRecord._id) {
                        return {
                            ...item,
                            patientName: patientForm.patientName,
                            age: { value: Number(patientForm.ageValue) || 0, type: patientForm.ageType },
                            gender: patientForm.gender,
                            mobileNumber: patientForm.mobileNumber,
                            address: patientForm.address,
                            referredBy: patientForm.referredBy,
                            testResults: editableResults,
                            notes: examinerNotes,
                            authorizationStatus: newStatus
                        };
                    }
                    return item;
                });
            }

            setRegistrations(updatedList);
            localStorage.setItem("medoraa_shared_registrations", JSON.stringify(updatedList));

            if (submitForAuth) {
                if (pendingCount > 0) {
                    setSuccessMessage(`${enteredCount} test result(s) submitted to Authorization Desk! (${pendingCount} test${pendingCount > 1 ? 's' : ''} remaining pending)`);
                } else {
                    setSuccessMessage(`All ${enteredCount} test result(s) submitted for Pathologist Authorization!`);
                }
            } else {
                setSuccessMessage(`Test observations saved as draft (${enteredCount} entered, ${pendingCount} pending).`);
            }

            setTimeout(() => {
                setSelectedRecord(null);
                setSuccessMessage("");
            }, 1400);
        } catch (err) {
            console.error("Failed to save test results", err);
            const fallbackList = registrations.map(item => {
                if (item._id === selectedRecord._id) {
                    return {
                        ...item,
                        patientName: patientForm.patientName,
                        age: { value: Number(patientForm.ageValue) || 0, type: patientForm.ageType },
                        gender: patientForm.gender,
                        mobileNumber: patientForm.mobileNumber,
                        address: patientForm.address,
                        referredBy: patientForm.referredBy,
                        testResults: editableResults,
                        notes: examinerNotes,
                        authorizationStatus: submitForAuth ? "PENDING" : (item.authorizationStatus || "PENDING")
                    };
                }
                return item;
            });
            setRegistrations(fallbackList);
            localStorage.setItem("medoraa_shared_registrations", JSON.stringify(fallbackList));
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredRecords = registrations.filter(r => {
        const matchesSearch =
            r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.referredBy || "").toLowerCase().includes(searchTerm.toLowerCase());

        if (statusFilter === "ALL") return matchesSearch;
        return matchesSearch && r.authorizationStatus === statusFilter;
    });

    const pendingCount = registrations.filter(r => (!r.testResults || r.testResults.length === 0 || r.testResults.some(t => !t.resultValue || !String(t.resultValue).trim()))).length;
    const recordedCount = registrations.filter(r => r.testResults && r.testResults.length > 0 && r.testResults.some(t => t.resultValue && String(t.resultValue).trim() !== "")).length;
    const flaggedCount = registrations.filter(r => r.authorizationStatus === "FLAGGED").length;
    const totalCount = registrations.length;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 font-sans">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Examination Desk...</p>
            </div>
        );
    }

    // =========================================================================
    // 1. FULL PAGE RESULT ENTRY WORKSPACE
    // =========================================================================
    if (selectedRecord) {
        const currentEnteredCount = editableResults.filter(t => t.resultValue && String(t.resultValue).trim() !== "").length;
        const currentPendingCount = editableResults.length - currentEnteredCount;

        return (
            <div className="space-y-6 font-sans animate-in fade-in duration-300">
                {/* UNIFIED CLASSIC HEADER TOOLBAR & PATIENT PROFILE BAR (SHARP EDGES) */}
                <div className="bg-white p-4 border border-slate-200 shadow-sm sticky top-0 z-30 space-y-3">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Left Side: Back Arrow & Classic Patient Profile Avatar */}
                        <div className="flex items-center gap-3 min-w-0">
                            <button
                                onClick={() => setSelectedRecord(null)}
                                className="p-1 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
                                title="Back to Worklist"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>

                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm shrink-0">
                                <User className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-sm font-black text-slate-900 truncate">
                                        {patientForm.patientName || selectedRecord.patientName}
                                    </h1>
                                    <button
                                        onClick={() => setIsEditingPatient(!isEditingPatient)}
                                        className="p-1 rounded-full hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                                        title="Edit Patient Details"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 text-[11px] font-bold border border-slate-200">
                                        {patientForm.ageValue ? `${patientForm.ageValue} ${patientForm.ageType}` : "N/A"} / {patientForm.gender}
                                    </span>
                                    {patientForm.mobileNumber && (
                                        <>
                                            <span className="text-slate-300">•</span>
                                            <span className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                                                <Phone className="w-3 h-3 text-slate-400" />
                                                {patientForm.mobileNumber}
                                            </span>
                                        </>
                                    )}
                                    {patientForm.address && (
                                        <>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-[11px] text-slate-500 truncate max-w-[220px]" title={patientForm.address}>
                                                {patientForm.address}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                disabled={selectedRecord.authorizationStatus !== "AUTHORIZED" || currentEnteredCount === 0}
                                onClick={() => {
                                    if (selectedRecord.authorizationStatus === "AUTHORIZED" && currentEnteredCount > 0) {
                                        const enteredOnly = editableResults.filter(t => t.resultValue && String(t.resultValue).trim() !== "");
                                        setReportModalRecord({
                                            ...selectedRecord,
                                            patientName: patientForm.patientName,
                                            age: { value: Number(patientForm.ageValue) || 0, type: patientForm.ageType },
                                            gender: patientForm.gender,
                                            mobileNumber: patientForm.mobileNumber,
                                            address: patientForm.address,
                                            testResults: enteredOnly,
                                            notes: examinerNotes
                                        });
                                        setIsReportModalOpen(true);
                                    }
                                }}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-2 border text-xs font-bold transition-all shrink-0",
                                    selectedRecord.authorizationStatus === "AUTHORIZED" && currentEnteredCount > 0
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 cursor-pointer active:scale-95"
                                        : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                                )}
                                title={
                                    selectedRecord.authorizationStatus !== "AUTHORIZED"
                                        ? "Report must be authorized before printing"
                                        : currentEnteredCount === 0
                                        ? "No entered test results to print"
                                        : `Print / Download Official Report (${currentEnteredCount} entered result${currentEnteredCount > 1 ? "s" : ""})`
                                }
                            >
                                <Download className="w-4 h-4" />
                                Download Report
                            </button>
                            <button
                                onClick={() => handleSaveResults(false)}
                                disabled={isSubmitting}
                                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold transition-all cursor-pointer"
                            >
                                <Save className="w-4 h-4" />
                                Save Draft
                            </button>
                            <button
                                onClick={() => handleSaveResults(true)}
                                disabled={isSubmitting}
                                className={cn(
                                    "flex items-center gap-2 px-5 py-2 text-white text-xs font-extrabold shadow-sm active:scale-95 transition-all cursor-pointer",
                                    currentEnteredCount > 0
                                        ? "bg-indigo-600 hover:bg-indigo-700"
                                        : "bg-slate-400 hover:bg-slate-500 opacity-70"
                                )}
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                {currentEnteredCount > 0
                                    ? `Submit ${currentEnteredCount} Test${currentEnteredCount > 1 ? "s" : ""} to Authorization`
                                    : "Submit to Authorization"}
                            </button>
                        </div>
                    </div>

                    {/* Collapsible Compact Patient Edit Drawer */}
                    {isEditingPatient && (
                        <div className="bg-slate-50/90 p-3 border border-indigo-200 space-y-3 animate-in fade-in duration-200 pt-3 border-t border-slate-200">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                    <Pencil className="w-3.5 h-3.5 text-indigo-600" />
                                    Edit Patient Demographic Profile
                                </span>
                                <button
                                    onClick={() => setIsEditingPatient(false)}
                                    className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Patient Name</label>
                                    <input
                                        type="text"
                                        value={patientForm.patientName}
                                        onChange={(e) => setPatientForm({ ...patientForm, patientName: e.target.value })}
                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 font-bold text-slate-900 outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                                    />
                                </div>
                                <div className="flex gap-1">
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Age</label>
                                        <input
                                            type="number"
                                            value={patientForm.ageValue}
                                            onChange={(e) => setPatientForm({ ...patientForm, ageValue: e.target.value })}
                                            className="w-full px-2 py-1.5 bg-white border border-slate-200 font-bold text-slate-900 outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                                        />
                                    </div>
                                    <div className="w-16">
                                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Unit</label>
                                        <select
                                            value={patientForm.ageType}
                                            onChange={(e) => setPatientForm({ ...patientForm, ageType: e.target.value })}
                                            className="w-full px-1.5 py-1.5 bg-white border border-slate-200 font-bold text-slate-900 outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                                        >
                                            <option value="Years">Yrs</option>
                                            <option value="Months">Mo</option>
                                            <option value="Days">Days</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Gender</label>
                                    <select
                                        value={patientForm.gender}
                                        onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 font-bold text-slate-900 outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Mobile Contact</label>
                                    <input
                                        type="text"
                                        value={patientForm.mobileNumber}
                                        onChange={(e) => setPatientForm({ ...patientForm, mobileNumber: e.target.value })}
                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 font-bold text-slate-900 outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Address</label>
                                    <input
                                        type="text"
                                        value={patientForm.address}
                                        onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 font-bold text-slate-900 outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60">
                                <button
                                    type="button"
                                    onClick={() => setIsEditingPatient(false)}
                                    className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleApplyPatientChanges}
                                    className="flex items-center gap-1 px-3.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-xs transition-all cursor-pointer"
                                >
                                    <Check className="w-3 h-3" />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Parameter Entry Table */}
                <div className="bg-white border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <FlaskConical className="w-5 h-5 text-indigo-600" />
                                Test Parameter & Result Entry Table
                            </h2>
                            <p className="text-slate-500 text-xs font-semibold mt-0.5">
                                Only entered tests will appear in Pathologist Authorization. Unentered tests remain pending.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                {currentEnteredCount} Entered
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                {currentPendingCount} Pending
                            </span>
                        </div>
                    </div>

                    <div className="border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse font-sans">
                            <thead>
                                <tr className="bg-slate-100/90 border-b border-slate-200 font-black text-slate-700 text-xs uppercase tracking-wider">
                                    <th className="py-3.5 px-4 w-[28%]">Test Parameter Name</th>
                                    <th className="py-3.5 px-4 w-[22%]">Observed Value</th>
                                    <th className="py-3.5 px-4 w-[14%]">Unit</th>
                                    <th className="py-3.5 px-4 w-[18%]">Reference Range</th>
                                    <th className="py-3.5 px-4 w-[10%] text-center">Status</th>
                                    <th className="py-3.5 px-4 w-[8%] text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {editableResults.map((item, idx) => {
                                    const isEntered = Boolean(item.resultValue && String(item.resultValue).trim() !== "");
                                    return (
                                        <tr key={idx} className={cn("transition-colors", isEntered ? "bg-emerald-50/20 hover:bg-emerald-50/40" : "hover:bg-slate-50/70")}>
                                            <td className="py-3 px-3">
                                                <input
                                                    type="text"
                                                    value={item.testName}
                                                    onChange={(e) => handleResultChange(idx, "testName", e.target.value)}
                                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-none text-xs font-bold text-slate-900 outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs"
                                                />
                                            </td>

                                            <td className="py-3 px-3">
                                                <input
                                                    type="text"
                                                    placeholder="Enter value (e.g. 13.5)"
                                                    value={item.resultValue}
                                                    onChange={(e) => handleResultChange(idx, "resultValue", e.target.value)}
                                                    className={cn(
                                                        "w-full px-3.5 py-2.5 rounded-none text-xs outline-none shadow-xs transition-all",
                                                        isEntered
                                                            ? "bg-emerald-50/60 border-2 border-emerald-400 font-black text-emerald-950 focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
                                                            : "bg-indigo-50/30 border border-indigo-200 font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600"
                                                    )}
                                                />
                                            </td>

                                            <td className="py-3 px-3">
                                                <input
                                                    type="text"
                                                    placeholder="e.g. mg/dL"
                                                    value={item.unit}
                                                    onChange={(e) => handleResultChange(idx, "unit", e.target.value)}
                                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-none text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs"
                                                />
                                            </td>

                                            <td className="py-3 px-3">
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 70 - 100 mg/dL"
                                                    value={item.referenceRange}
                                                    onChange={(e) => handleResultChange(idx, "referenceRange", e.target.value)}
                                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-none text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs"
                                                />
                                            </td>

                                            <td className="py-3 px-3 text-center">
                                                {isEntered ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                                        Entered
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                                                        Pending
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3 px-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTestRow(idx)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-none transition-colors"
                                                    title="Remove parameter"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Examiner Notes */}
                    <div className="pt-4 space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Examiner Observations & Technical Notes</label>
                        <textarea
                            rows={3}
                            placeholder="Add internal observations, reagent lot numbers, or sample quality notes for the Pathologist..."
                            value={examinerNotes}
                            onChange={(e) => setExaminerNotes(e.target.value)}
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-none text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                        />
                    </div>
                </div>


            </div>
        );
    }

    // =========================================================================
    // 2. EXAMINER WORKLIST DASHBOARD VIEW
    // =========================================================================
    return (
        <div className="space-y-6 font-sans animate-in fade-in duration-500">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
                            <FlaskConical className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pathology Examination Desk</h1>
                            <p className="text-slate-500 text-xs font-semibold mt-0.5">Select a patient sample to enter test observation values & metrics</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                        <User className="w-4 h-4 text-slate-400" />
                        <div className="flex flex-col text-left">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Examiner</span>
                            <span className="text-xs font-black text-slate-800">{user?.name || "Lab Technician"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <DashboardCard
                    title="Pending Result Entry"
                    value={pendingCount}
                    icon={Clock}
                    color="amber"
                    description="Awaiting value recording"
                />
                <DashboardCard
                    title="Results Recorded"
                    value={recordedCount}
                    icon={BadgeCheck}
                    color="indigo"
                    description="Submitted / Ready for Auth"
                />
                <DashboardCard
                    title="Flagged / Re-test"
                    value={flaggedCount}
                    icon={AlertTriangle}
                    color="rose"
                    description="Re-verification requested"
                />
                <DashboardCard
                    title="Total Workload"
                    value={totalCount}
                    icon={Zap}
                    color="blue"
                    description="Assigned patient batch"
                />
            </div>

            {/* Worklist Section */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 overflow-hidden space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative w-full md:w-[350px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search patient, reg no, or doctor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-none text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-fit">
                        {[
                            { label: "All Work", value: "ALL" },
                            { label: `Pending Entry (${pendingCount})`, value: "PENDING" },
                            { label: `Flagged (${flaggedCount})`, value: "FLAGGED" }
                        ].map(tab => (
                            <button
                                key={tab.value}
                                onClick={() => setStatusFilter(tab.value)}
                                className={cn(
                                    "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
                                    statusFilter === tab.value
                                        ? "bg-white text-slate-900 shadow-sm font-extrabold"
                                        : "text-slate-500 hover:text-slate-800"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                    <table className="w-full text-left border-collapse font-sans">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reg No / Date</th>
                                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient Info</th>
                                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Tests</th>
                                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recorded Values</th>
                                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredRecords.length > 0 ? (
                                filteredRecords.map((row) => {
                                    const status = row.authorizationStatus || "PENDING";
                                    const enteredResults = row.testResults ? row.testResults.filter(t => t.resultValue && String(t.resultValue).trim() !== "") : [];
                                    const enteredCount = enteredResults.length;
                                    const totalTests = row.testResults && row.testResults.length > 0
                                        ? row.testResults.length
                                        : (row.tests && row.tests.length > 0 ? row.tests.length : 0);
                                    const pendingTestsCount = Math.max(0, totalTests - enteredCount);
                                    
                                    const displayTests = row.tests && row.tests.length > 0
                                        ? row.tests.map((t: any) => typeof t === "string" ? t : t.testName || t.name).join(", ")
                                        : "Routine Test Panel";

                                    const displayResults = enteredCount > 0
                                        ? enteredResults.map(tr => `${tr.testName}: ${tr.resultValue} ${tr.unit || ""}`.trim()).join(", ")
                                        : "No values recorded yet";

                                    return (
                                        <tr key={row._id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-extrabold text-slate-900">{row.registrationNumber}</span>
                                                    <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                                                        <Clock className="w-3 h-3" /> {row.registrationDate} ({row.registrationTime})
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-800">{row.patientName}</span>
                                                    <span className="text-[10px] font-medium text-slate-500">
                                                        {row.age?.value} {row.age?.type} • {row.gender}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 max-w-[220px]">
                                                <span className="text-xs font-semibold text-slate-700 line-clamp-1">
                                                    {displayTests}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 max-w-[280px]">
                                                <div className="flex flex-col gap-1">
                                                    <span className={cn(
                                                        "text-xs font-bold line-clamp-1",
                                                        enteredCount > 0 ? "text-indigo-900" : "text-slate-400 italic"
                                                    )}>
                                                        {displayResults}
                                                    </span>
                                                    {pendingTestsCount > 0 && enteredCount > 0 && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded w-fit">
                                                            +{pendingTestsCount} test{pendingTestsCount > 1 ? "s" : ""} pending
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {status === "AUTHORIZED" ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md border bg-emerald-50 text-emerald-700 border-emerald-200">
                                                        {pendingTestsCount > 0 ? `Partial Auth (${enteredCount}/${totalTests})` : "Authorized"}
                                                    </span>
                                                ) : status === "FLAGGED" ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md border bg-rose-50 text-rose-700 border-rose-200">
                                                        Flagged
                                                    </span>
                                                ) : enteredCount > 0 && pendingTestsCount > 0 ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md border bg-amber-50 text-amber-800 border-amber-300">
                                                        Partial ({enteredCount} Entered, {pendingTestsCount} Pending)
                                                    </span>
                                                ) : enteredCount > 0 && pendingTestsCount === 0 ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md border bg-indigo-50 text-indigo-700 border-indigo-200">
                                                        Submitted for Auth ({enteredCount})
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md border bg-slate-100 text-slate-600 border-slate-200">
                                                        Pending Entry ({totalTests || 1})
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        disabled={status !== "AUTHORIZED" || enteredCount === 0}
                                                        onClick={() => {
                                                            if (status === "AUTHORIZED" && enteredCount > 0) {
                                                                setReportModalRecord({ ...row, testResults: enteredResults });
                                                                setIsReportModalOpen(true);
                                                            }
                                                        }}
                                                        className={cn(
                                                            "p-2 transition-all cursor-pointer border rounded-full",
                                                            status === "AUTHORIZED" && enteredCount > 0
                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-xs"
                                                                : "bg-slate-50 text-slate-300 border-slate-200 opacity-40 cursor-not-allowed"
                                                        )}
                                                        title={
                                                            status !== "AUTHORIZED"
                                                                ? "Download disabled — Awaiting Pathologist Authorization"
                                                                : enteredCount === 0
                                                                ? "Download disabled — No test results entered yet"
                                                                : `Download / Print Official Pathology Report (${enteredCount} entered result${enteredCount > 1 ? "s" : ""})`
                                                        }
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedRecord(row)}
                                                        className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/10 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer rounded-none"
                                                    >
                                                        <FlaskConical className="w-3.5 h-3.5" />
                                                        Enter / Edit Results
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        No patient samples found for examination.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Official Pathology Report Modal */}
            <PathologyReportModal
                record={reportModalRecord}
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
            />
        </div>
    );
}
