"use client";
import React, { useEffect, useState } from "react";
import DashboardCard from "../components/DashboardCard";
import {
    CheckCircle2,
    AlertCircle,
    Search,
    Filter,
    ShieldCheck,
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
    MessageSquare,
    Loader2,
    Building2,
    Calendar,
    Stethoscope,
    FlaskConical,
    Save,
    ArrowLeft,
    Printer,
    Sparkles,
    FileCheck,
    CheckSquare,
    Phone,
    MapPin,
    ShieldAlert,
    Pencil,
    Trash2,
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

export default function AuthorizationDashboard() {
    const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [registrations, setRegistrations] = useState<PatientTestRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    const [selectedRecord, setSelectedRecord] = useState<PatientTestRecord | null>(null);
    const [editableResults, setEditableResults] = useState<TestResultEntry[]>([]);
    const [pendingTests, setPendingTests] = useState<TestResultEntry[]>([]);
    const [pathologistNotes, setPathologistNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Official Pathology Report Modal State
    const [reportModalRecord, setReportModalRecord] = useState<PatientTestRecord | null>(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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


    // Initial fallback data
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
            notes: "Elevated fasting glucose. Retest advised."
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

            // Gather all tests associated with this registration
            const allTestsList: TestResultEntry[] = [];
            const seenNames = new Set<string>();

            if (selectedRecord.testResults && selectedRecord.testResults.length > 0) {
                selectedRecord.testResults.forEach((t) => {
                    allTestsList.push(t);
                    seenNames.add(t.testName.trim().toLowerCase());
                });
            }

            if (selectedRecord.tests && selectedRecord.tests.length > 0) {
                selectedRecord.tests.forEach((t: any) => {
                    const tName = typeof t === "string" ? t : (t.testName || t.name || "Diagnostic Test");
                    if (!seenNames.has(tName.trim().toLowerCase())) {
                        allTestsList.push({
                            testId: t._id || t,
                            testName: tName,
                            resultValue: "",
                            unit: "",
                            referenceRange: typeof t === "object" ? (t.referenceRange || "-") : "-",
                            flag: "Normal" as const
                        });
                        seenNames.add(tName.trim().toLowerCase());
                    }
                });
            }

            // Only tests where the Examiner has entered results are shown in Authorization
            const entered = allTestsList.filter(t => t.resultValue && String(t.resultValue).trim() !== "");
            // Remaining tests stay pending
            const pending = allTestsList.filter(t => !t.resultValue || String(t.resultValue).trim() === "");

            setEditableResults(entered);
            setPendingTests(pending);
            setPathologistNotes(selectedRecord.notes || "");
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

    const handleUpdateStatus = async (id: string, newStatus: "AUTHORIZED" | "FLAGGED" | "REJECTED", remark?: string) => {
        setIsSubmitting(true);
        setSuccessMessage("");

        try {
            const token = localStorage.getItem("adminToken");
            const combinedTestResults = [...editableResults, ...pendingTests];

            const payload = {
                patientName: patientForm.patientName,
                age: { value: Number(patientForm.ageValue) || 0, type: patientForm.ageType },
                gender: patientForm.gender,
                mobileNumber: patientForm.mobileNumber,
                address: patientForm.address,
                testResults: combinedTestResults,
                authorizationStatus: newStatus,
                notes: remark !== undefined ? remark : pathologistNotes,
                authorizedBy: user?.name || "Medical Pathologist"
            };

            const res = await fetch(getApiUrl(`/api/admin/registrations/${id}/authorization`), {
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
                updatedList = registrations.map(item => item._id === id ? data.data : item);
            } else {
                updatedList = registrations.map(item => {
                    if (item._id === id) {
                        return {
                            ...item,
                            patientName: patientForm.patientName,
                            age: { value: Number(patientForm.ageValue) || 0, type: patientForm.ageType },
                            gender: patientForm.gender,
                            mobileNumber: patientForm.mobileNumber,
                            address: patientForm.address,
                            authorizationStatus: newStatus,
                            testResults: combinedTestResults,
                            authorizedBy: user?.name || "Medical Pathologist",
                            authorizedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            notes: remark !== undefined ? remark : pathologistNotes
                        };
                    }
                    return item;
                });
            }

            setRegistrations(updatedList);
            localStorage.setItem("medoraa_shared_registrations", JSON.stringify(updatedList));

            const remainingCount = pendingTests.length;
            if (newStatus === "AUTHORIZED") {
                if (remainingCount > 0) {
                    setSuccessMessage(`Entered tests authorized! (${remainingCount} test${remainingCount > 1 ? 's' : ''} still pending in Examination Desk)`);
                } else {
                    setSuccessMessage("Pathology report fully authorized & clinically signed off!");
                }
            } else {
                setSuccessMessage("Report flagged for review.");
            }

            setTimeout(() => {
                setSelectedRecord(null);
                setSuccessMessage("");
            }, 1200);
        } catch (err) {
            console.error("Failed to persist authorization", err);
            const combinedTestResults = [...editableResults, ...pendingTests];
            const fallbackList = registrations.map(item => {
                if (item._id === id) {
                    return {
                        ...item,
                        patientName: patientForm.patientName,
                        age: { value: Number(patientForm.ageValue) || 0, type: patientForm.ageType },
                        gender: patientForm.gender,
                        mobileNumber: patientForm.mobileNumber,
                        address: patientForm.address,
                        authorizationStatus: newStatus,
                        testResults: combinedTestResults,
                        authorizedBy: user?.name || "Medical Pathologist",
                        authorizedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        notes: remark !== undefined ? remark : pathologistNotes
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

    const handleBulkApprove = async () => {
        // Only bulk approve pending records that have entered test results
        const pendingItems = registrations.filter(r => 
            r.authorizationStatus === "PENDING" && 
            r.testResults && 
            r.testResults.some(t => t.resultValue && t.resultValue.trim() !== "")
        );
        if (pendingItems.length === 0) {
            alert("No pending reports with entered test results in worklist to authorize.");
            return;
        }
        if (window.confirm(`Authorize all ${pendingItems.length} pending patient reports with digital sign-off?`)) {
            setIsSubmitting(true);
            const token = localStorage.getItem("adminToken");

            for (const item of pendingItems) {
                try {
                    await fetch(getApiUrl(`/api/admin/registrations/${item._id}/authorization`), {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            authorizationStatus: "AUTHORIZED",
                            authorizedBy: user?.name || "Medical Pathologist"
                        })
                    });
                } catch (e) {
                    console.error(e);
                }
            }
            await fetchRegistrations();
            setIsSubmitting(false);
        }
    };

    const filteredRecords = registrations.filter(r => {
        const matchesSearch =
            r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.referredBy || "").toLowerCase().includes(searchTerm.toLowerCase());

        const hasEntered = r.testResults && r.testResults.some(t => t.resultValue && t.resultValue.trim() !== "");

        if (statusFilter === "ALL") return matchesSearch;
        if (statusFilter === "PENDING") {
            return matchesSearch && r.authorizationStatus === "PENDING" && hasEntered;
        }
        return matchesSearch && r.authorizationStatus === statusFilter;
    });

    const pendingCount = registrations.filter(r => 
        r.authorizationStatus === "PENDING" && 
        r.testResults && 
        r.testResults.some(t => t.resultValue && t.resultValue.trim() !== "")
    ).length;
    const authorizedCount = registrations.filter(r => r.authorizationStatus === "AUTHORIZED").length;
    const flaggedCount = registrations.filter(r => r.authorizationStatus === "FLAGGED" || r.authorizationStatus === "REJECTED").length;
    const totalCount = registrations.length;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 font-sans">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-amber-600 rounded-full animate-spin" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Pathology Sign-Off Workspace...</p>
            </div>
        );
    }

    // =========================================================================
    // 1. FULL PAGE CLINICAL VERIFICATION & SIGN-OFF WORKSPACE
    // =========================================================================
    if (selectedRecord) {
        const currentStatus = selectedRecord.authorizationStatus || "PENDING";

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

                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm shrink-0">
                                <User className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-sm font-black text-slate-900 truncate">
                                        {patientForm.patientName || selectedRecord.patientName}
                                    </h1>
                                    <button
                                        onClick={() => setIsEditingPatient(!isEditingPatient)}
                                        className="p-1 rounded-full hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
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

                        {/* Right Side: Pathologist Action Toolbar */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => {
                                    setReportModalRecord({
                                        ...selectedRecord,
                                        patientName: patientForm.patientName,
                                        age: { value: Number(patientForm.ageValue) || 0, type: patientForm.ageType },
                                        gender: patientForm.gender,
                                        mobileNumber: patientForm.mobileNumber,
                                        address: patientForm.address,
                                        testResults: editableResults,
                                        notes: pathologistNotes
                                    });
                                    setIsReportModalOpen(true);
                                }}
                                disabled={currentStatus !== "AUTHORIZED" || editableResults.length === 0}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 border text-xs font-bold transition-all shrink-0",
                                    currentStatus === "AUTHORIZED" && editableResults.length > 0
                                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 cursor-pointer active:scale-95"
                                        : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                                )}
                                title={
                                    currentStatus !== "AUTHORIZED"
                                        ? "Report must be authorized before printing"
                                        : editableResults.length === 0
                                        ? "No entered test results to print"
                                        : `Download / Print Official Pathology Report (${editableResults.length} entered result${editableResults.length > 1 ? "s" : ""})`
                                }
                            >
                                <Download className="w-3.5 h-3.5" />
                                Download Report
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(selectedRecord._id, "FLAGGED", pathologistNotes)}
                                disabled={isSubmitting}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer active:scale-95"
                            >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Flag / Retest
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(selectedRecord._id, "AUTHORIZED", pathologistNotes)}
                                disabled={isSubmitting || editableResults.length === 0}
                                className={cn(
                                    "flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold transition-all shadow-sm active:scale-95",
                                    editableResults.length === 0
                                        ? "bg-slate-200 text-slate-400 border border-slate-200 cursor-not-allowed"
                                        : "bg-amber-600 hover:bg-amber-700 text-white border border-amber-600 cursor-pointer"
                                )}
                                title={editableResults.length === 0 ? "No entered tests to authorize" : "Approve & Authorize Report"}
                            >
                                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                                {pendingTests.length > 0 
                                    ? `Authorize Entered Tests (${editableResults.length})` 
                                    : "Approve & Authorize Report"}
                            </button>
                        </div>
                    </div>

                    {/* Inline Patient Edit Drawer */}
                    {isEditingPatient && (
                        <div className="mt-3 pt-3 border-t border-slate-200 bg-slate-50/80 p-3.5 border border-slate-200 space-y-3 animate-in fade-in">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <Pencil className="w-3.5 h-3.5 text-amber-600" /> Edit Patient Demographics
                                </h3>
                                <button
                                    type="button"
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
                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 font-bold text-slate-900 outline-none focus:ring-1 focus:ring-amber-500 text-xs rounded-none"
                                    />
                                </div>
                                <div className="flex gap-1">
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Age</label>
                                        <input
                                            type="number"
                                            value={patientForm.ageValue}
                                            onChange={(e) => setPatientForm({ ...patientForm, ageValue: e.target.value })}
                                            className="w-full px-2 py-1.5 bg-white border border-slate-200 font-bold text-slate-900 outline-none focus:ring-1 focus:ring-amber-500 text-xs rounded-none"
                                        />
                                    </div>
                                    <div className="w-16">
                                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Unit</label>
                                        <select
                                            value={patientForm.ageType}
                                            onChange={(e) => setPatientForm({ ...patientForm, ageType: e.target.value })}
                                            className="w-full px-1.5 py-1.5 bg-white border border-slate-200 font-bold text-slate-900 outline-none focus:ring-1 focus:ring-amber-500 text-xs rounded-none"
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
                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 font-bold text-slate-900 outline-none focus:ring-1 focus:ring-amber-500 text-xs rounded-none"
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
                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 font-bold text-slate-900 outline-none focus:ring-1 focus:ring-amber-500 text-xs rounded-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Address</label>
                                    <input
                                        type="text"
                                        value={patientForm.address}
                                        onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 font-bold text-slate-900 outline-none focus:ring-1 focus:ring-amber-500 text-xs rounded-none"
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
                                    className="flex items-center gap-1 px-3.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-xs transition-all cursor-pointer"
                                >
                                    <Check className="w-3 h-3" />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {successMessage && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        {successMessage}
                    </div>
                )}

                {/* Patient Diagnostic Observations View & Sign-Off Table (Entered Tests Only) */}
                <div className="bg-white border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-amber-600" />
                                Diagnostic Observations Clinical Verification
                            </h2>
                            <p className="text-slate-500 text-xs font-semibold mt-0.5">
                                Only entered test results from the Examiner are displayed here for clinical verification.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {editableResults.length} Entered Test{editableResults.length !== 1 ? 's' : ''}
                            </span>
                            {pendingTests.length > 0 && (
                                <span className="px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    {pendingTests.length} Pending
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse font-sans">
                            <thead>
                                <tr className="bg-slate-100/90 border-b border-slate-200 font-black text-slate-700 text-xs uppercase tracking-wider">
                                    <th className="py-3.5 px-4 w-[30%]">Test Parameter Name</th>
                                    <th className="py-3.5 px-4 w-[25%]">Recorded Value</th>
                                    <th className="py-3.5 px-4 w-[15%]">Unit</th>
                                    <th className="py-3.5 px-4 w-[20%]">Reference Range</th>
                                    <th className="py-3.5 px-4 w-[10%] text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {editableResults.length > 0 ? (
                                    editableResults.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="py-3 px-3">
                                                <input
                                                    type="text"
                                                    value={item.testName}
                                                    onChange={(e) => handleResultChange(idx, "testName", e.target.value)}
                                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-none text-xs font-bold text-slate-900 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 shadow-xs"
                                                />
                                            </td>

                                            <td className="py-3 px-3">
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 13.5"
                                                    value={item.resultValue}
                                                    onChange={(e) => handleResultChange(idx, "resultValue", e.target.value)}
                                                    className="w-full px-3.5 py-2.5 bg-amber-50/50 border-2 border-amber-200 rounded-none text-xs font-black text-amber-950 outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600 shadow-xs placeholder:text-amber-300"
                                                />
                                            </td>

                                            <td className="py-3 px-3">
                                                <input
                                                    type="text"
                                                    placeholder="e.g. mg/dL"
                                                    value={item.unit}
                                                    onChange={(e) => handleResultChange(idx, "unit", e.target.value)}
                                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-none text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 shadow-xs"
                                                />
                                            </td>

                                            <td className="py-3 px-3">
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 70 - 100 mg/dL"
                                                    value={item.referenceRange}
                                                    onChange={(e) => handleResultChange(idx, "referenceRange", e.target.value)}
                                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-none text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 shadow-xs"
                                                />
                                            </td>

                                            <td className="py-3 px-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTestRow(idx)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-none transition-colors cursor-pointer"
                                                    title="Remove parameter"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-10 text-center bg-slate-50/70 text-slate-500">
                                            <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-80" />
                                            <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">No Test Results Entered Yet</p>
                                            <p className="text-[11px] text-slate-400 mt-1">Observations for this patient have not yet been recorded by the Examiner.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pathologist Clinical Remarks */}
                    <div className="pt-4 space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                            Pathologist Clinical Comments & Sign-Off Remarks
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Enter clinical interpretation or remarks to append to the final pathology report..."
                            value={pathologistNotes}
                            onChange={(e) => setPathologistNotes(e.target.value)}
                            className="w-full p-3.5 bg-amber-50/30 border border-amber-200 rounded-none text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
                        />
                    </div>
                </div>

                {/* Remaining Tests Pending Entry in Examination Desk */}
                {pendingTests.length > 0 && (
                    <div className="bg-amber-50/30 border border-amber-200/80 p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-600" />
                                <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                                    Remaining Tests Pending in Examination Desk ({pendingTests.length})
                                </h3>
                            </div>
                            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                                Pending Entry
                            </span>
                        </div>
                        <p className="text-xs text-amber-800/80 font-medium">
                            The following registered tests have not yet had analytical results entered by the Examiner. They will appear for authorization once the Examiner records observations.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                            {pendingTests.map((test, idx) => (
                                <div key={idx} className="p-3 bg-white border border-amber-200/70 shadow-xs flex items-center justify-between">
                                    <div className="min-w-0 flex-1 pr-2">
                                        <span className="text-xs font-bold text-slate-900 block truncate">
                                            {test.testName}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                                            Reference: {test.referenceRange || "-"}
                                        </span>
                                    </div>
                                    <span className="shrink-0 px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-extrabold uppercase tracking-wider border border-slate-200">
                                        Pending
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        );
    }

    // =========================================================================
    // 2. PATHOLOGY AUTHORIZATION WORKLIST DASHBOARD VIEW
    // =========================================================================
    return (
        <div className="space-y-6 font-sans animate-in fade-in duration-500">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 border border-slate-200/80 shadow-sm">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-amber-50 text-amber-600 border border-amber-100">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pathology Authorization & Sign-Off Desk</h1>
                            <p className="text-slate-500 text-xs font-semibold mt-0.5">Review recorded test observations and grant clinical report authorization</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200">
                        <User className="w-4 h-4 text-slate-400" />
                        <div className="flex flex-col text-left">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Medical Officer</span>
                            <span className="text-xs font-black text-slate-800">{user?.name || "Pathologist"}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleBulkApprove}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                    >
                        <ClipboardCheck className="w-4 h-4" />
                        Bulk Sign Off ({pendingCount})
                    </button>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <DashboardCard
                    title="Awaiting Sign-Off"
                    value={pendingCount}
                    icon={AlertTriangle}
                    color="amber"
                    description="Requires clinical sign-off"
                />
                <DashboardCard
                    title="Authorized Today"
                    value={authorizedCount}
                    icon={BadgeCheck}
                    color="emerald"
                    description="Approved & dispatched"
                />
                <DashboardCard
                    title="Flagged Reports"
                    value={flaggedCount}
                    icon={XCircle}
                    color="rose"
                    description="Returned for re-test"
                />
                <DashboardCard
                    title="Total Verified"
                    value={totalCount}
                    icon={Zap}
                    color="blue"
                    description="Cumulative test batch"
                />
            </div>

            {/* Worklist Section */}
            <div className="bg-white border border-slate-200/80 shadow-sm p-6 overflow-hidden space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative w-full md:w-[350px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search patient, reg no, or doctor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-none text-xs font-semibold outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-900"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 w-fit">
                        {[
                            { label: "All Work", value: "ALL" },
                            { label: `Pending Sign-Off (${pendingCount})`, value: "PENDING" },
                            { label: `Authorized (${authorizedCount})`, value: "AUTHORIZED" },
                            { label: `Flagged (${flaggedCount})`, value: "FLAGGED" }
                        ].map(tab => (
                            <button
                                key={tab.value}
                                onClick={() => setStatusFilter(tab.value)}
                                className={cn(
                                    "px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer",
                                    statusFilter === tab.value
                                        ? "bg-white text-slate-900 shadow-xs font-extrabold"
                                        : "text-slate-500 hover:text-slate-800"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-slate-100">
                    <table className="w-full text-left border-collapse font-sans">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reg No / Date</th>
                                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient Info</th>
                                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Referred By</th>
                                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recorded Test Observations</th>
                                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredRecords.length > 0 ? (
                                filteredRecords.map((row) => {
                                    const status = row.authorizationStatus || "PENDING";
                                    const enteredTests = (row.testResults || []).filter(tr => tr.resultValue && String(tr.resultValue).trim() !== "");
                                    const totalTestsCount = row.testResults?.length || (row.tests?.length || 0);
                                    const pendingTestsCount = Math.max(0, totalTestsCount - enteredTests.length);

                                    const displayTests = enteredTests.length > 0
                                        ? enteredTests.map(tr => `${tr.testName}: ${tr.resultValue} ${tr.unit}`).join(", ")
                                        : "No observations recorded yet (Pending Examination)";

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

                                            <td className="py-3.5 px-4">
                                                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                                    <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                                                    {row.referredBy || "Self"}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 max-w-[280px]">
                                                <div className="flex flex-col gap-1">
                                                    <span className={cn("text-xs font-bold line-clamp-2", enteredTests.length > 0 ? "text-slate-900" : "text-slate-400 italic")}>
                                                        {displayTests}
                                                    </span>
                                                    {enteredTests.length > 0 && pendingTestsCount > 0 && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 w-fit border border-amber-200">
                                                            <Clock className="w-2.5 h-2.5" />
                                                            {pendingTestsCount} test{pendingTestsCount > 1 ? 's' : ''} pending in Examiner
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider border",
                                                    status === "AUTHORIZED" && pendingTestsCount === 0 && "bg-emerald-50 text-emerald-700 border-emerald-200",
                                                    status === "AUTHORIZED" && pendingTestsCount > 0 && "bg-teal-50 text-teal-700 border-teal-200",
                                                    status === "PENDING" && enteredTests.length > 0 && "bg-amber-50 text-amber-700 border-amber-200 animate-pulse",
                                                    status === "PENDING" && enteredTests.length === 0 && "bg-slate-100 text-slate-500 border-slate-200",
                                                    status === "FLAGGED" && "bg-rose-50 text-rose-700 border-rose-200"
                                                )}>
                                                    {status === "AUTHORIZED" && <Check className="w-3 h-3" />}
                                                    {status === "PENDING" && enteredTests.length > 0 && <Clock className="w-3 h-3" />}
                                                    {status === "FLAGGED" && <AlertTriangle className="w-3 h-3" />}
                                                    {status === "AUTHORIZED" 
                                                        ? (pendingTestsCount > 0 ? `Partial Auth (${enteredTests.length}/${totalTestsCount})` : "Authorized")
                                                        : (enteredTests.length > 0 ? (pendingTestsCount > 0 ? `Pending (${enteredTests.length}/${totalTestsCount})` : "Pending Sign-Off") : "Awaiting Examiner")}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        disabled={status !== "AUTHORIZED" || enteredTests.length === 0}
                                                        onClick={() => {
                                                            if (status === "AUTHORIZED" && enteredTests.length > 0) {
                                                                setReportModalRecord({ ...row, testResults: enteredTests });
                                                                setIsReportModalOpen(true);
                                                            }
                                                        }}
                                                        className={cn(
                                                            "p-2 rounded-full transition-all cursor-pointer border",
                                                            status === "AUTHORIZED" && enteredTests.length > 0
                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-xs"
                                                                : "bg-slate-50 text-slate-300 border-slate-200 opacity-40 cursor-not-allowed"
                                                        )}
                                                        title={
                                                            status !== "AUTHORIZED"
                                                                ? "Download disabled — Awaiting Pathologist Authorization"
                                                                : enteredTests.length === 0
                                                                ? "Download disabled — No test results entered yet"
                                                                : `Download / Print Official Pathology Report (${enteredTests.length} entered result${enteredTests.length > 1 ? "s" : ""})`
                                                        }
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedRecord(row)}
                                                        disabled={enteredTests.length === 0 && status !== "AUTHORIZED"}
                                                        className={cn(
                                                            "px-3.5 py-2 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5",
                                                            enteredTests.length === 0 && status !== "AUTHORIZED"
                                                                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                                                                : "text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/10 cursor-pointer"
                                                        )}
                                                        title={enteredTests.length === 0 && status !== "AUTHORIZED" ? "Examiner has not entered results yet" : "Review & Sign Off"}
                                                    >
                                                        <ShieldCheck className="w-3.5 h-3.5" />
                                                        {enteredTests.length === 0 && status !== "AUTHORIZED"
                                                            ? "Awaiting Entry"
                                                            : `Review & Sign Off${pendingTestsCount > 0 ? ` (${enteredTests.length})` : ''}`}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        No reports awaiting authorization.
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
