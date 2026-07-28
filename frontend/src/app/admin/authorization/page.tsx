"use client";
import React, { useEffect, useState } from "react";
import DashboardCard from "../components/DashboardCard";
import {
    Activity,
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
    Plus,
    Trash2,
    X,
    ShoppingCart,
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

    // Full page view state for active clinical sign-off workspace
    const [selectedRecord, setSelectedRecord] = useState<PatientTestRecord | null>(null);
    const [editableResults, setEditableResults] = useState<TestResultEntry[]>([]);
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

    // Master Test Catalog Selection Modal State
    const [showCatalogModal, setShowCatalogModal] = useState(false);
    const [availableSamples, setAvailableSamples] = useState<any[]>([]);
    const [isLoadingSamples, setIsLoadingSamples] = useState(false);
    const [catalogSearchQuery, setCatalogSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedOrgan, setSelectedOrgan] = useState("All");
    const [sidebarView, setSidebarView] = useState<"category" | "organ">("category");
    const [selectedCatalogTestIds, setSelectedCatalogTestIds] = useState<string[]>([]);

    const fetchSamplesCatalog = async () => {
        try {
            setIsLoadingSamples(true);
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/samples"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setAvailableSamples(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch samples catalog", err);
        } finally {
            setIsLoadingSamples(false);
        }
    };

    const handleOpenCatalogModal = () => {
        setShowCatalogModal(true);
        fetchSamplesCatalog();
        if (availableSamples.length > 0) {
            const existingNames = editableResults.map(r => r.testName.trim().toLowerCase());
            const preSelected = availableSamples
                .filter(s => existingNames.includes((s.testName || "").trim().toLowerCase()))
                .map(s => s._id);
            setSelectedCatalogTestIds(preSelected);
        }
    };

    const toggleCatalogTestSelection = (sampleId: string) => {
        setSelectedCatalogTestIds(prev =>
            prev.includes(sampleId) ? prev.filter(id => id !== sampleId) : [...prev, sampleId]
        );
    };

    const handleAddCatalogTestsToResults = () => {
        const selectedSamples = availableSamples.filter(s => selectedCatalogTestIds.includes(s._id));

        setEditableResults(prev => {
            const existingNames = new Set(prev.map(item => item.testName.trim().toLowerCase()));
            const newRows: TestResultEntry[] = [];

            selectedSamples.forEach(sample => {
                if (!existingNames.has(sample.testName.trim().toLowerCase())) {
                    let unit = sample.unit || "";
                    if (!unit && sample.referenceRange) {
                        const parts = sample.referenceRange.trim().split(" ");
                        if (parts.length > 1) {
                            const last = parts[parts.length - 1];
                            if (/\/[a-zA-Z]|%|mm|mg|g|iu|u|mmol|mol/i.test(last)) {
                                unit = last;
                            }
                        }
                    }
                    newRows.push({
                        testId: sample._id,
                        testName: sample.testName,
                        resultValue: "",
                        unit: unit,
                        referenceRange: sample.referenceRange || "-",
                        flag: "Normal"
                    });
                }
            });

            return [...prev, ...newRows];
        });

        setShowCatalogModal(false);
    };

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

            if (selectedRecord.testResults && selectedRecord.testResults.length > 0) {
                setEditableResults(selectedRecord.testResults);
            } else if (selectedRecord.tests && selectedRecord.tests.length > 0) {
                const initial = selectedRecord.tests.map((t: any) => ({
                    testId: t._id || t,
                    testName: typeof t === "string" ? t : (t.testName || "Diagnostic Test"),
                    resultValue: "",
                    unit: "",
                    referenceRange: typeof t === "object" ? (t.referenceRange || "-") : "-",
                    flag: "Normal" as const
                }));
                setEditableResults(initial);
            } else {
                setEditableResults([
                    { testName: "Routine Pathology Parameter", resultValue: "", unit: "", referenceRange: "-", flag: "Normal" }
                ]);
            }
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
            const payload = {
                patientName: patientForm.patientName,
                age: { value: Number(patientForm.ageValue) || 0, type: patientForm.ageType },
                gender: patientForm.gender,
                mobileNumber: patientForm.mobileNumber,
                address: patientForm.address,
                testResults: editableResults,
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
                            testResults: editableResults,
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

            setSuccessMessage(newStatus === "AUTHORIZED" 
                ? "Pathology report authorized & clinically signed off!" 
                : "Report flagged for review."
            );

            setTimeout(() => {
                setSelectedRecord(null);
                setSuccessMessage("");
            }, 1200);
        } catch (err) {
            console.error("Failed to persist authorization", err);
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
                        testResults: editableResults,
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
        const pendingItems = registrations.filter(r => r.authorizationStatus === "PENDING");
        if (pendingItems.length === 0) {
            alert("No pending reports in worklist to authorize.");
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

        if (statusFilter === "ALL") return matchesSearch;
        return matchesSearch && r.authorizationStatus === statusFilter;
    });

    const pendingCount = registrations.filter(r => r.authorizationStatus === "PENDING").length;
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
                                disabled={currentStatus !== "AUTHORIZED"}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 border text-xs font-bold transition-all shrink-0",
                                    currentStatus === "AUTHORIZED"
                                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 cursor-pointer active:scale-95"
                                        : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                                )}
                                title={currentStatus === "AUTHORIZED" ? "Print / Download Report" : "Report must be authorized before printing"}
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
                                disabled={isSubmitting}
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white border border-amber-600 text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                            >
                                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                                Approve & Authorize Report
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

                {/* Patient Diagnostic Observations View & Sign-Off Table */}
                <div className="bg-white border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-amber-600" />
                                Diagnostic Observations Clinical Verification
                            </h2>
                            <p className="text-slate-500 text-xs font-semibold mt-0.5">
                                Review and edit observation values, units, and reference ranges prior to clinical sign-off.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleOpenCatalogModal}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                            >
                                <Activity className="w-4 h-4" />
                                Select from Test Catalog
                            </button>
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
                                {editableResults.map((item, idx) => (
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
                                ))}
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

                {/* TEST CATALOG SELECTION MODAL */}
                {showCatalogModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 w-full max-w-5xl rounded-none shadow-2xl overflow-hidden flex flex-col h-[85vh]">

                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 shrink-0">
                                <div>
                                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-blue-600" />
                                        Select Pathology Tests from Master Catalog
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                        Patient: {selectedRecord?.patientName} | Reg No: {selectedRecord?.registrationNumber}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setShowCatalogModal(false)}
                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-500 cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">

                                {/* Left Sidebar: Categories / Organs */}
                                <div className="w-full lg:w-52 bg-slate-50 dark:bg-slate-950/40 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 flex flex-col shrink-0">
                                    <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
                                        <div className="flex bg-slate-200/60 dark:bg-slate-800/80 p-0.5 border border-slate-200/40 dark:border-slate-700/50">
                                            <button
                                                onClick={() => {
                                                    setSidebarView("category");
                                                    setSelectedCategory("All");
                                                    setSelectedOrgan("All");
                                                }}
                                                className={cn(
                                                    "flex-1 py-1.5 text-[9px] font-black uppercase transition-all cursor-pointer",
                                                    sidebarView === "category"
                                                        ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs font-bold"
                                                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
                                                )}
                                            >
                                                Categories
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSidebarView("organ");
                                                    setSelectedCategory("All");
                                                    setSelectedOrgan("All");
                                                }}
                                                className={cn(
                                                    "flex-1 py-1.5 text-[9px] font-black uppercase transition-all cursor-pointer",
                                                    sidebarView === "organ"
                                                        ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs font-bold"
                                                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
                                                )}
                                            >
                                                Organs
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-x-auto lg:overflow-y-auto p-2 flex flex-row lg:flex-col gap-1.5 lg:space-y-1 no-scrollbar shrink-0 lg:shrink">
                                        {sidebarView === "category" ? (
                                            ["All", ...Array.from(new Set(availableSamples.map(s => s.category || "General").filter(c => c && c !== "-")))].map((cat) => {
                                                const catCount = availableSamples.filter(s => (s.category || "General") === cat && cat !== "All").length;
                                                const isSelected = selectedCategory === cat;
                                                return (
                                                    <button
                                                        key={cat}
                                                        onClick={() => setSelectedCategory(cat)}
                                                        className={cn(
                                                            "w-auto lg:w-full shrink-0 text-left px-3 py-2 text-xs font-bold transition-all flex items-center justify-between cursor-pointer whitespace-nowrap gap-1.5",
                                                            isSelected
                                                                ? "bg-blue-600 text-white shadow-md shadow-blue-600/15"
                                                                : "hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400"
                                                        )}
                                                    >
                                                        <span className="truncate text-left">{cat}</span>
                                                        {cat !== "All" && (
                                                            <span className={cn(
                                                                "text-[9px] px-1.5 py-0.5 shrink-0 font-bold ml-1.5",
                                                                isSelected ? "bg-blue-700 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                                                            )}>
                                                                {catCount}
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            ["All", ...Array.from(new Set(availableSamples.map(s => s.organ).filter(Boolean).filter(o => o && o !== "-")))].map((org) => {
                                                const orgCount = availableSamples.filter(s => s.organ === org && org !== "All").length;
                                                const isSelected = selectedOrgan === org;
                                                return (
                                                    <button
                                                        key={org}
                                                        onClick={() => setSelectedOrgan(org)}
                                                        className={cn(
                                                            "w-auto lg:w-full shrink-0 text-left px-3 py-2 text-xs font-bold transition-all flex items-center justify-between cursor-pointer whitespace-nowrap gap-1.5",
                                                            isSelected
                                                                ? "bg-blue-600 text-white shadow-md shadow-blue-600/15"
                                                                : "hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400"
                                                        )}
                                                    >
                                                        <span className="truncate text-left">{org}</span>
                                                        {org !== "All" && (
                                                            <span className={cn(
                                                                "text-[9px] px-1.5 py-0.5 shrink-0 font-bold ml-1.5",
                                                                isSelected ? "bg-blue-700 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                                                            )}>
                                                                {orgCount}
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* Middle Content: Test Catalog Grid */}
                                <div className="flex-1 flex flex-col min-w-0">
                                    {/* Search Bar */}
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-white dark:bg-slate-900 shrink-0">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search test names, organ, method or container..."
                                                value={catalogSearchQuery}
                                                onChange={(e) => setCatalogSearchQuery(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-none text-xs outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium text-slate-800 dark:text-slate-100"
                                            />
                                        </div>
                                    </div>

                                    {/* Tests Grid list */}
                                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 dark:bg-slate-900/30">
                                        {isLoadingSamples ? (
                                            <div className="flex flex-col items-center justify-center h-full gap-2">
                                                <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Catalog...</span>
                                            </div>
                                        ) : availableSamples.filter(sample => {
                                            const matchesSearch = (sample.testName || "").toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
                                                (sample.organ || "").toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
                                                (sample.category || "").toLowerCase().includes(catalogSearchQuery.toLowerCase());
                                            const matchesCategory = selectedCategory === "All" || (sample.category || "General") === selectedCategory;
                                            const matchesOrgan = selectedOrgan === "All" || sample.organ === selectedOrgan;
                                            return matchesSearch && matchesCategory && matchesOrgan;
                                        }).length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                                <Activity className="w-10 h-10 text-slate-300 mb-2" />
                                                <p className="text-xs font-bold text-slate-500">No tests found matching search criteria.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {availableSamples.filter(sample => {
                                                    const matchesSearch = (sample.testName || "").toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
                                                        (sample.organ || "").toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
                                                        (sample.category || "").toLowerCase().includes(catalogSearchQuery.toLowerCase());
                                                    const matchesCategory = selectedCategory === "All" || (sample.category || "General") === selectedCategory;
                                                    const matchesOrgan = selectedOrgan === "All" || sample.organ === selectedOrgan;
                                                    return matchesSearch && matchesCategory && matchesOrgan;
                                                }).map((sample) => {
                                                    const isSelected = selectedCatalogTestIds.includes(sample._id);
                                                    return (
                                                        <div
                                                            key={sample._id}
                                                            onClick={() => toggleCatalogTestSelection(sample._id)}
                                                            className={cn(
                                                                "p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none cursor-pointer hover:shadow-md transition-all flex justify-between items-start gap-4 select-none group relative overflow-hidden",
                                                                isSelected
                                                                    ? "border-blue-500 ring-2 ring-blue-500/10 dark:bg-slate-900"
                                                                    : "hover:border-slate-300 dark:hover:border-slate-700"
                                                            )}
                                                        >
                                                            <div className="space-y-1.5 flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase tracking-wider border border-blue-100/50 dark:border-blue-900/50">
                                                                        {sample.category || "General"}
                                                                    </span>
                                                                    {sample.organ && sample.organ !== "-" && (
                                                                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[8px] font-bold uppercase tracking-wide">
                                                                            {sample.organ}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <h4 className="text-xs text-slate-800 dark:text-slate-100 uppercase tracking-tight truncate font-bold">
                                                                    {sample.testName}
                                                                </h4>
                                                                <div className="flex items-center gap-3 text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                                                                    <span>Ref: {sample.referenceRange || "-"}</span>
                                                                </div>
                                                            </div>
                                                            <div className={cn(
                                                                "w-5 h-5 border flex items-center justify-center shrink-0 transition-colors",
                                                                isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 dark:border-slate-700"
                                                            )}>
                                                                {isSelected && <Check className="w-3.5 h-3.5" />}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Sidebar: Selected Tests Summary */}
                                <div className="w-full lg:w-64 bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 flex flex-col shrink-0">
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Selected Tests for Report</span>
                                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1 uppercase truncate">
                                            {availableSamples.filter(s => selectedCatalogTestIds.includes(s._id)).length} tests chosen
                                        </p>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                                        {availableSamples.filter(s => selectedCatalogTestIds.includes(s._id)).length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-12">
                                                <ShoppingCart className="w-8 h-8 text-slate-300 mb-2" />
                                                <p className="text-[10px] font-bold uppercase tracking-wider">No tests selected yet</p>
                                            </div>
                                        ) : (
                                            availableSamples.filter(s => selectedCatalogTestIds.includes(s._id)).map((t) => (
                                                <div key={t._id} className="p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate uppercase tracking-tight">{t.testName}</p>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{t.category}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => toggleCatalogTestSelection(t._id)}
                                                        className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                                <button
                                    onClick={() => setShowCatalogModal(false)}
                                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs transition-all active:scale-95 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddCatalogTestsToResults}
                                    disabled={selectedCatalogTestIds.length === 0}
                                    className={cn(
                                        "px-6 py-2 font-bold text-xs transition-all active:scale-95 flex items-center gap-1.5 shadow-md cursor-pointer",
                                        selectedCatalogTestIds.length > 0
                                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
                                            : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none"
                                    )}
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Selected Tests ({selectedCatalogTestIds.length})
                                </button>
                            </div>

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
                                    const displayTests = row.testResults && row.testResults.length > 0
                                        ? row.testResults.map(tr => `${tr.testName}${tr.resultValue ? `: ${tr.resultValue} ${tr.unit}` : ''}`).join(", ")
                                        : (row.tests && row.tests.length > 0
                                            ? row.tests.map((t: any) => typeof t === "string" ? t : t.testName || t.name).join(", ")
                                            : "Routine Test Panel");

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
                                                <span className="text-xs font-bold text-slate-900 line-clamp-2">
                                                    {displayTests}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider border",
                                                    status === "AUTHORIZED" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                                                    status === "PENDING" && "bg-amber-50 text-amber-700 border-amber-200 animate-pulse",
                                                    status === "FLAGGED" && "bg-rose-50 text-rose-700 border-rose-200"
                                                )}>
                                                    {status === "AUTHORIZED" && <Check className="w-3 h-3" />}
                                                    {status === "PENDING" && <Clock className="w-3 h-3" />}
                                                    {status === "FLAGGED" && <AlertTriangle className="w-3 h-3" />}
                                                    {status}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        disabled={status !== "AUTHORIZED"}
                                                        onClick={() => {
                                                            if (status === "AUTHORIZED") {
                                                                setReportModalRecord(row);
                                                                setIsReportModalOpen(true);
                                                            }
                                                        }}
                                                        className={cn(
                                                            "p-2 rounded-full transition-all cursor-pointer border",
                                                            status === "AUTHORIZED"
                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-xs"
                                                                : "bg-slate-50 text-slate-300 border-slate-200 opacity-40 cursor-not-allowed"
                                                        )}
                                                        title={
                                                            status === "AUTHORIZED"
                                                                ? "Download / Print Official Pathology Report"
                                                                : "Download disabled — Awaiting Pathologist Authorization"
                                                        }
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedRecord(row)}
                                                        className="px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/10 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                                                    >
                                                        <ShieldCheck className="w-3.5 h-3.5" />
                                                        Review & Sign Off
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
