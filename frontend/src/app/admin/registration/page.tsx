"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
    MapPin, User, FileText, Share2, Clipboard, ShieldAlert, Check, 
    RefreshCw, X, Printer, Calendar, Clock, Truck, Bus, UserCheck, 
    Search, ChevronDown, CheckCircle2, ChevronRight, UserPlus, Info,
    Activity, ShoppingCart
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import JsBarcode from "jsbarcode";

interface BarcodeProps {
    value: string;
    width?: number;
    height?: number;
    displayValue?: boolean;
}

const Barcode: React.FC<BarcodeProps> = ({ 
    value, 
    width = 1.2, 
    height = 25, 
    displayValue = false 
}) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (svgRef.current && value) {
            try {
                JsBarcode(svgRef.current, value, {
                    format: "CODE128",
                    width,
                    height,
                    displayValue,
                    margin: 0,
                    background: "transparent",
                    lineColor: "#000"
                });
            } catch (e) {
                console.error("JsBarcode error:", e);
            }
        }
    }, [value, width, height, displayValue]);

    return <svg ref={svgRef}></svg>;
};

// Cascading Locations Data
const locationsData: Record<string, Record<string, string[]>> = {
    "Maharashtra": {
        "Mumbai": ["Mumbai South", "Mumbai North", "Andheri", "Bandra", "Chembur", "Ghatkopar", "Mulund"],
        "Pune": ["Shivajinagar", "Kothrud", "Hinjawadi", "Hadapsar", "Deccan Gymkhana", "Kalyani Nagar"],
        "Nagpur": ["Dharampeth", "Sitabuldi", "Sadak", "Manish Nagar", "Pratap Nagar"]
    },
    "Karnataka": {
        "Bengaluru": ["Koramangala", "Indiranagar", "Jayanagar", "Whitefield", "HSR Layout", "Malleshwaram", "Yelahanka"],
        "Mysuru": ["Gokulam", "Vidyaranyapuram", "Jayalakshmipuram", "Hebbal", "Vijayanagar"],
        "Hubli": ["Keshwapur", "Vidyanagar", "Gokul Road", "Shirur Park"]
    },
    "Delhi": {
        "Central Delhi": ["Connaught Place", "Karol Bagh", "Paharganj", "Rajender Nagar"],
        "South Delhi": ["Saket", "Hauz Khas", "Greater Kailash", "Green Park", "Vasant Kunj", "Lajpat Nagar"]
    },
    "Tamil Nadu": {
        "Chennai": ["Adyar", "Mylapore", "Velachery", "T. Nagar", "Anna Nagar", "Nungambakkam"],
        "Coimbatore": ["Gandhipuram", "RS Puram", "Peelamedu", "Saibaba Colony", "Ramanathapuram"]
    }
};

// Custom Searchable Dropdown Select Component
interface SearchableSelectProps {
    label: string;
    options: string[];
    value: string;
    onChange: (val: string) => void;
    disabled?: boolean;
    mandatory?: boolean;
    placeholder?: string;
    icon?: React.ReactNode;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    label,
    options,
    value,
    onChange,
    disabled = false,
    mandatory = false,
    placeholder = "Select option...",
    icon
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div ref={containerRef} className="relative flex flex-col gap-1.5 w-full font-sans">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                {icon}
                {label} {mandatory && <span className="text-rose-500 font-bold">*</span>}
            </label>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium cursor-pointer transition-all select-none shadow-sm",
                    disabled ? "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800" : "hover:border-blue-500",
                    isOpen && "border-blue-500 ring-2 ring-blue-500/10"
                )}
            >
                <span className={value ? "text-slate-900 dark:text-slate-100 font-semibold" : "text-slate-400"}>
                    {value || placeholder}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
            </div>

            {isOpen && !disabled && (
                <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-60 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Type to filter..."
                            value={search}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-transparent border-0 outline-none text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                    <div className="overflow-y-auto flex-1 max-h-48 py-1 divide-y divide-slate-50 dark:divide-slate-700/50">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt}
                                    onClick={() => {
                                        onChange(opt);
                                        setIsOpen(false);
                                        setSearch("");
                                    }}
                                    className={cn(
                                        "px-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700/50 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer font-bold flex items-center justify-between transition-colors",
                                        opt === value && "bg-blue-50/50 dark:bg-slate-700/30 text-blue-600 dark:text-blue-400 font-extrabold"
                                    )}
                                >
                                    <span>{opt}</span>
                                    {opt === value && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-xs text-slate-400 text-center font-medium">
                                No matching options
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    // Mini function to wrap target value assignment
    function setSearchTerm(val: string) {
        setSearch(val);
    }
};

const PatientRegistrationForm: React.FC = () => {
    // Master data
    const [doctors, setDoctors] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [isLoadingMaster, setIsLoadingMaster] = useState(true);

    // Live clock states
    const [liveDate, setLiveDate] = useState("");
    const [liveTime, setLiveTime] = useState("");

    // Form inputs state
    const [formData, setFormData] = useState({
        location: {
            state: "",
            district: "",
            city: ""
        },
        patientName: "",
        age: {
            value: "",
            type: "Years" as "Years" | "Months" | "Days"
        },
        gender: "Male" as "Male" | "Female" | "Other",
        mobileNumber: "",
        address: "",
        referredBy: "Self",
        sampleDrawnBy: "",
        sampleReceived: {
            receivedThrough: "Employee" as "Employee" | "Person" | "Courier" | "Bus",
            employee: { name: "", id: "", mobileNumber: "", department: "", designation: "", dateReceived: "", timeReceived: "", remarks: "" },
            person: { name: "", mobileNumber: "", relationship: "", address: "", idProofType: "Aadhaar", idProofNumber: "", dateReceived: "", timeReceived: "", remarks: "" },
            courier: { companyName: "", trackingNumber: "", orderNumber: "", contactNumber: "", pickupLocation: "", arrivalDate: "", arrivalTime: "", receivedByEmployee: "", packageCondition: "Good" as "Good" | "Damaged" | "Opened", remarks: "" },
            bus: { busNumber: "", busServiceName: "", driverName: "", driverMobileNumber: "", conductorName: "", conductorMobileNumber: "", originLocation: "", destinationLocation: "", arrivalDate: "", arrivalTime: "", receivedByEmployee: "", packageCondition: "Good", remarks: "" }
        }
    });

    // Form states
    const [activeTab, setActiveTab] = useState<"patient" | "transport">("patient");
    const [isSaving, setIsSaving] = useState(false);
    const [isDraftRestored, setIsDraftRestored] = useState(false);
    const [savedRecord, setSavedRecord] = useState<any | null>(null);
    const [showReceipt, setShowReceipt] = useState(false);
    const [printType, setPrintType] = useState<"receipt" | "label">("receipt");

    // Test selection states
    const [showTestSelection, setShowTestSelection] = useState(false);
    const [availableSamples, setAvailableSamples] = useState<any[]>([]);
    const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
    const [isLoadingSamples, setIsLoadingSamples] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [triggerPrintOnComplete, setTriggerPrintOnComplete] = useState(false);
    const [isSavingTests, setIsSavingTests] = useState(false);

    // Patient directory states
    const [showForm, setShowForm] = useState(false);
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);
    const [patientSearchQuery, setPatientSearchQuery] = useState("");

    const fetchRegistrations = async () => {
        setIsLoadingRegistrations(true);
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/registrations"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setRegistrations(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch registrations", err);
        } finally {
            setIsLoadingRegistrations(false);
        }
    };

    const fetchSamples = async () => {
        setIsLoadingSamples(true);
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/samples"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setAvailableSamples(data.data);
            }
        } catch (err) {
            console.error("Failed to load samples for selection", err);
        } finally {
            setIsLoadingSamples(false);
        }
    };

    const handleSaveTests = async () => {
        if (!savedRecord) return;
        setIsSavingTests(true);
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl(`/api/admin/registrations/${savedRecord._id}/tests`), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ testIds: selectedTestIds })
            });
            const data = await res.json();
            if (data.success) {
                setSavedRecord(data.data);
                setShowTestSelection(false);
                setShowReceipt(true);
                
                if (triggerPrintOnComplete) {
                    setPrintType("receipt");
                    setTimeout(() => {
                        window.print();
                    }, 500);
                }
            } else {
                alert(data.message || "Failed to save tests");
            }
        } catch (err) {
            console.error("Failed to save tests", err);
            alert("An error occurred while saving test selections");
        } finally {
            setIsSavingTests(false);
        }
    };

    const handlePrintReceipt = () => {
        setPrintType("receipt");
        setTimeout(() => {
            window.print();
        }, 150);
    };

    const handlePrintLabels = () => {
        setPrintType("label");
        setTimeout(() => {
            window.print();
        }, 150);
    };

    const toggleTestSelection = (id: string) => {
        setSelectedTestIds(prev => 
            prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
        );
    };

    // Fetch doctors and staff
    useEffect(() => {
        const fetchMaster = async () => {
            try {
                const token = localStorage.getItem("adminToken");
                const docRes = await fetch(getApiUrl("/api/admin/doctors"), {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const docData = await docRes.json();
                if (docData.success) setDoctors(docData.data);

                const staffRes = await fetch(getApiUrl("/api/admin/admins"), {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const staffData = await staffRes.json();
                if (staffData.success) setStaff(staffData.data);
            } catch (err) {
                console.error("Failed to load master records", err);
            } finally {
                setIsLoadingMaster(false);
            }
        };
        fetchMaster();
        fetchRegistrations();
    }, []);

    // Live date-time updates
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const d = String(now.getDate()).padStart(2, '0');
            const m = String(now.getMonth() + 1).padStart(2, '0');
            const y = now.getFullYear();
            setLiveDate(`${d}-${m}-${y}`);

            let h = now.getHours();
            const min = String(now.getMinutes()).padStart(2, '0');
            const sec = String(now.getSeconds()).padStart(2, '0');
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12 || 12;
            setLiveTime(`${String(h).padStart(2, '0')}:${min}:${sec} ${ampm}`);
        };
        updateClock();
        const timer = setInterval(updateClock, 1000);
        return () => clearInterval(timer);
    }, []);

    // Global barcode scanner listener
    useEffect(() => {
        let buffer = "";
        let lastKeyTime = Date.now();

        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
                if (target.id === "patient-search-input") {
                    return;
                }
            }

            const currentTime = Date.now();
            if (currentTime - lastKeyTime > 50) {
                buffer = "";
            }
            lastKeyTime = currentTime;

            if (e.key === "Enter") {
                if (buffer.length >= 6) {
                    const cleaned = buffer.trim();
                    if (cleaned.toUpperCase().startsWith("REG-") || cleaned.toUpperCase().startsWith("S0")) {
                        e.preventDefault();
                        setPatientSearchQuery(cleaned);
                        setShowForm(false);
                        const searchInput = document.getElementById("patient-search-input");
                        if (searchInput) {
                            searchInput.focus();
                        }
                        buffer = "";
                    }
                }
                buffer = "";
            } else if (e.key.length === 1) {
                buffer += e.key;
            }
        };

        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, []);

    // Auto-save draft check
    useEffect(() => {
        const draft = localStorage.getItem("medoraa_registration_draft");
        if (draft) {
            try {
                const parsed = JSON.parse(draft);
                setFormData(parsed);
                setIsDraftRestored(true);
            } catch (e) {
                console.error("Failed to parse local draft", e);
            }
        }
    }, []);

    // Auto-save form changes
    const isFirstRun = useRef(true);
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        localStorage.setItem("medoraa_registration_draft", JSON.stringify(formData));
    }, [formData]);

    // Derived states for locations
    const statesList = Object.keys(locationsData);
    const districtsList = formData.location.state ? Object.keys(locationsData[formData.location.state]) : [];
    const citiesList = (formData.location.state && formData.location.district) 
        ? locationsData[formData.location.state][formData.location.district] 
        : [];

    // Validation checks
    const isMobileValid = /^\d{10}$/.test(formData.mobileNumber);
    const isAgeValid = formData.age.value !== "" && Number(formData.age.value) > 0;
    const isNameValid = formData.patientName.trim() !== "";
    const isAddressValid = formData.address.trim() !== "";
    const isReferralValid = formData.referredBy !== "";
    const isFormValid = isNameValid && isAgeValid && isMobileValid && isAddressValid && isReferralValid;

    // Reset handler
    const handleReset = () => {
        if (confirm("Are you sure you want to reset the form? This will discard your current inputs and draft.")) {
            setFormData({
                location: { state: "", district: "", city: "" },
                patientName: "",
                age: { value: "", type: "Years" },
                gender: "Male",
                mobileNumber: "",
                address: "",
                referredBy: "Self",
                sampleDrawnBy: "",
                sampleReceived: {
                    receivedThrough: "Employee",
                    employee: { name: "", id: "", mobileNumber: "", department: "", designation: "", dateReceived: "", timeReceived: "", remarks: "" },
                    person: { name: "", mobileNumber: "", relationship: "", address: "", idProofType: "Aadhaar", idProofNumber: "", dateReceived: "", timeReceived: "", remarks: "" },
                    courier: { companyName: "", trackingNumber: "", orderNumber: "", contactNumber: "", pickupLocation: "", arrivalDate: "", arrivalTime: "", receivedByEmployee: "", packageCondition: "Good", remarks: "" },
                    bus: { busNumber: "", busServiceName: "", driverName: "", driverMobileNumber: "", conductorName: "", conductorMobileNumber: "", originLocation: "", destinationLocation: "", arrivalDate: "", arrivalTime: "", receivedByEmployee: "", packageCondition: "Good", remarks: "" }
                }
            });
            localStorage.removeItem("medoraa_registration_draft");
            setIsDraftRestored(false);
        }
    };

    // Save Registration logic
    const handleSave = async (printOnSuccess = false) => {
        if (!isFormValid) return;
        setIsSaving(true);
        setTriggerPrintOnComplete(printOnSuccess);
        setSelectedTestIds([]);
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/registrations"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                // Clear draft
                localStorage.removeItem("medoraa_registration_draft");
                setIsDraftRestored(false);
                setSavedRecord(data.data);
                
                // Fetch samples and open test selection step
                await fetchSamples();
                setShowTestSelection(true);
            } else {
                alert(data.message || "Failed to save registration");
            }
        } catch (err) {
            console.error("Save registration failed", err);
            alert("An error occurred while saving the registration");
        } finally {
            setIsSaving(false);
        }
    };

    // Doctor options helper
    const doctorOptions = ["Self", ...doctors.map(d => `${d.doctorName} (Ref: ${d.doctorCode || d._id.slice(-4).toUpperCase()})`)];
    const staffOptions = staff.map(s => `${s.name} (${s.role || "Staff"})`);

    return (
        <div className="font-sans pb-6 dark:text-slate-100">
            {!showForm ? (
                <div className="space-y-5 print:hidden">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                    <UserPlus className="w-4 h-4" />
                                </span>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    Patient Registrations Directory
                                </h1>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">
                                Manage registered patients, investigations, barcodes, and billing slips.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => {
                                    setFormData({
                                        location: { state: "", district: "", city: "" },
                                        patientName: "",
                                        age: { value: "", type: "Years" },
                                        gender: "Male",
                                        mobileNumber: "",
                                        address: "",
                                        referredBy: "Self",
                                        sampleDrawnBy: "",
                                        sampleReceived: {
                                            receivedThrough: "Employee",
                                            employee: { name: "", id: "", mobileNumber: "", department: "", designation: "", dateReceived: "", timeReceived: "", remarks: "" },
                                            person: { name: "", mobileNumber: "", relationship: "", address: "", idProofType: "Aadhaar", idProofNumber: "", dateReceived: "", timeReceived: "", remarks: "" },
                                            courier: { companyName: "", trackingNumber: "", orderNumber: "", contactNumber: "", pickupLocation: "", arrivalDate: "", arrivalTime: "", receivedByEmployee: "", packageCondition: "Good", remarks: "" },
                                            bus: { busNumber: "", busServiceName: "", driverName: "", driverMobileNumber: "", conductorName: "", conductorMobileNumber: "", originLocation: "", destinationLocation: "", arrivalDate: "", arrivalTime: "", receivedByEmployee: "", packageCondition: "Good", remarks: "" }
                                        }
                                    });
                                    setShowForm(true);
                                }}
                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg text-xs transition-all active:scale-95 shadow-md cursor-pointer"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span>+ New Registration</span>
                            </button>
                        </div>
                    </div>

                    {/* Search & Statistics */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 border border-slate-200/60 dark:border-slate-800 rounded-xl shadow-sm">
                        <div className="relative flex-1 max-w-md">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Search className="w-4 h-4" />
                            </span>
                            <input 
                                id="patient-search-input"
                                type="text"
                                placeholder="Search by name, registration no, phone..."
                                value={patientSearchQuery}
                                onChange={(e) => setPatientSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold outline-none focus:border-blue-550 focus:ring-1 focus:ring-blue-550 text-slate-800 dark:text-slate-100"
                            />
                        </div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Total Registrations: <span className="text-slate-850 dark:text-slate-250 font-extrabold">{registrations.length}</span>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                        {isLoadingRegistrations ? (
                            <div className="p-12 flex flex-col items-center justify-center gap-2">
                                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest animate-pulse">Loading Directory...</span>
                            </div>
                        ) : registrations.length === 0 ? (
                            <div className="p-12 flex flex-col items-center justify-center gap-2 text-center">
                                <span className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400">
                                    <User className="w-8 h-8" />
                                </span>
                                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase mt-2">No Registrations Found</h3>
                                <p className="text-xs text-slate-400 font-semibold max-w-xs mt-1">
                                    No patients registered yet. Click "+ New Registration" to onboard your first patient.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/75 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            <th className="px-6 py-3.5">Reg No &amp; Date</th>
                                            <th className="px-6 py-3.5">Patient Info</th>
                                            <th className="px-6 py-3.5">Contact</th>
                                            <th className="px-6 py-3.5">Referred By</th>
                                            <th className="px-6 py-3.5">Tests</th>
                                            <th className="px-6 py-3.5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                        {registrations
                                            .filter(reg => {
                                                const query = patientSearchQuery.toLowerCase().trim();
                                                let isSampleMatch = false;
                                                if (query.startsWith("s") && query.length >= 10) {
                                                    const sampleBody = query.substring(1, query.length - 1);
                                                    const regDigitsClean = reg.registrationNumber ? reg.registrationNumber.replace(/[^0-9]/g, "") : "";
                                                    if (regDigitsClean.includes(sampleBody)) {
                                                        isSampleMatch = true;
                                                    }
                                                }
                                                return (
                                                    reg.patientName?.toLowerCase().includes(query) ||
                                                    reg.registrationNumber?.toLowerCase().includes(query) ||
                                                    reg.mobileNumber?.includes(query) ||
                                                    reg.referredBy?.toLowerCase().includes(query) ||
                                                    isSampleMatch
                                                );
                                            })
                                            .map((reg) => (
                                                <tr key={reg._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">{reg.registrationNumber}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 block">{reg.registrationDate} {reg.registrationTime}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-extrabold text-slate-800 dark:text-slate-100">{reg.patientName}</span>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-black rounded uppercase">{reg.age?.value} {reg.age?.type}</span>
                                                                <span className="px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[9px] font-black rounded uppercase">{reg.gender}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-semibold text-slate-700 dark:text-slate-300 block">{reg.mobileNumber}</span>
                                                        <span className="text-[10px] text-slate-400 truncate max-w-[150px] block" title={reg.address}>{reg.address}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-slate-750 dark:text-slate-250">{reg.referredBy}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                            {reg.tests && reg.tests.length > 0 ? (
                                                                reg.tests.map((test: any, tIdx: number) => (
                                                                    <span key={tIdx} className="px-2 py-0.5 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-[9px] font-black rounded uppercase">
                                                                        {typeof test === "string" ? test : test.testName || test.name}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-[10px] text-amber-500 font-black uppercase">No tests added</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                onClick={async () => {
                                                                    setSavedRecord(reg);
                                                                    const testIds = reg.tests ? reg.tests.map((t: any) => typeof t === "string" ? t : t._id) : [];
                                                                    setSelectedTestIds(testIds);
                                                                    await fetchSamples();
                                                                    setShowTestSelection(true);
                                                                }}
                                                                className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                                                title="Add/Edit Tests"
                                                            >
                                                                <Clipboard className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSavedRecord(reg);
                                                                    setPrintType("receipt");
                                                                    setShowReceipt(true);
                                                                }}
                                                                className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                                                title="Print Receipt"
                                                            >
                                                                <Printer className="w-3.5 h-3.5" />
                                                            </button>
                                                            {reg.tests && reg.tests.length > 0 && (
                                                                <button
                                                                    onClick={() => {
                                                                        setSavedRecord(reg);
                                                                        setPrintType("label");
                                                                        setTimeout(() => {
                                                                            window.print();
                                                                        }, 150);
                                                                    }}
                                                                    className="p-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-650 dark:text-teal-400 rounded-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                                                    title="Print Bottle Labels"
                                                                >
                                                                    <Activity className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-5 print:hidden">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                    <UserPlus className="w-4 h-4" />
                                </span>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    Patient Registration Form
                                </h1>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">
                                Onboard new diagnostics patients, track referring physicians, and record sample transport sources.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold rounded-lg text-xs text-slate-700 dark:text-slate-300 transition-all active:scale-95 shadow-sm cursor-pointer"
                            >
                                Back to Patients List
                            </button>
                        </div>
                    </div>

                    {/* Restored Draft Alert Banner */}
                    {isDraftRestored && (
                        <div className="flex items-center justify-between px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-900/30 rounded-xl animate-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-2">
                                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                                    We found and restored a pending patient registration draft.
                                </p>
                            </div>
                            <button 
                                onClick={() => {
                                    localStorage.removeItem("medoraa_registration_draft");
                                    setIsDraftRestored(false);
                                }}
                                className="text-[10px] font-black uppercase text-amber-700 hover:text-amber-900 dark:text-amber-400 hover:underline px-2 py-1 rounded"
                            >
                                Dismiss Draft
                            </button>
                        </div>
                    )}

                    {/* Form grid layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Form Fields */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* SECTION 2: Patient Information */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-4 md:p-5 shadow-sm space-y-3">
                                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                                    <span className="p-1 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded-md">
                                        <User className="w-3.5 h-3.5" />
                                    </span>
                                    <h2 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                                        Patient Information
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* Patient Name */}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                            Patient Name <span className="text-rose-500 font-bold">*</span>
                                        </label>
                                        <input 
                                            type="text"
                                            value={formData.patientName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                                            placeholder="Enter full name"
                                            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-blue-550 focus:ring-1 focus:ring-blue-550 font-semibold"
                                        />
                                    </div>

                                    {/* Mobile Number */}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                            Mobile Number <span className="text-rose-500 font-bold">*</span>
                                        </label>
                                        <input 
                                            type="text"
                                            maxLength={10}
                                            value={formData.mobileNumber}
                                            onChange={(e) => setFormData(prev => ({ ...prev, mobileNumber: e.target.value.replace(/\D/g, "") }))}
                                            placeholder="10-digit number"
                                            className={cn(
                                                "px-3 py-1.5 bg-white dark:bg-slate-800 border rounded-lg text-xs outline-none font-semibold focus:ring-1",
                                                formData.mobileNumber && !isMobileValid ? "border-rose-400 dark:border-rose-900 focus:ring-rose-500 focus:border-rose-500" : "border-slate-200 dark:border-slate-700 focus:ring-blue-550 focus:border-blue-550"
                                            )}
                                        />
                                        {formData.mobileNumber && !isMobileValid && (
                                            <span className="text-[10px] text-rose-500 font-bold tracking-tight">Mobile number must be exactly 10 digits.</span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* Age */}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                            Age <span className="text-rose-500 font-bold">*</span>
                                        </label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="number"
                                                min={1}
                                                value={formData.age.value}
                                                onChange={(e) => setFormData(prev => ({ ...prev, age: { ...prev.age, value: e.target.value } }))}
                                                placeholder="Value"
                                                className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-blue-550 focus:ring-1 focus:ring-blue-550 font-semibold"
                                            />
                                            <select 
                                                value={formData.age.type}
                                                onChange={(e) => setFormData(prev => ({ ...prev, age: { ...prev.age, type: e.target.value as any } }))}
                                                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none font-bold"
                                            >
                                                <option value="Years">Years</option>
                                                <option value="Months">Months</option>
                                                <option value="Days">Days</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Gender */}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                            Sex / Gender <span className="text-rose-500 font-bold">*</span>
                                        </label>
                                        <div className="flex gap-4 items-center h-[34px]">
                                            {["Male", "Female", "Other"].map(g => (
                                                <label key={g} className="flex items-center gap-1.5 cursor-pointer font-semibold text-xs text-slate-700 dark:text-slate-300">
                                                    <input 
                                                        type="radio"
                                                        name="gender"
                                                        value={g}
                                                        checked={formData.gender === g}
                                                        onChange={() => setFormData(prev => ({ ...prev, gender: g as any }))}
                                                        className="w-3.5 h-3.5 text-blue-600 border-slate-300 dark:border-slate-700"
                                                    />
                                                    {g}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Complete Address */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                        Complete Address <span className="text-rose-500 font-bold">*</span>
                                    </label>
                                    <textarea 
                                        rows={1}
                                        value={formData.address}
                                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                        placeholder="Enter patient complete street address details"
                                        className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-blue-550 focus:ring-1 focus:ring-blue-550 font-semibold resize-none"
                                    />
                                </div>
                            </div>

                            {/* Split Grid for Referral and Transport Side-by-Side to save screen height */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* SECTION 3: Referral Information */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-4 md:p-5 shadow-sm space-y-3 flex flex-col justify-between">
                                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                                        <span className="p-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-md">
                                            <Share2 className="w-3.5 h-3.5" />
                                        </span>
                                        <h2 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                                            Referral Information
                                        </h2>
                                    </div>

                                    <div className="space-y-3">
                                        <SearchableSelect 
                                            label="Referred By (Doctor)"
                                            options={doctorOptions}
                                            value={formData.referredBy}
                                            onChange={(val) => setFormData(prev => ({ ...prev, referredBy: val }))}
                                            mandatory
                                            placeholder="Search referring doctor..."
                                        />
                                        <SearchableSelect 
                                            label="Sample Drawn By"
                                            options={staffOptions}
                                            value={formData.sampleDrawnBy}
                                            onChange={(val) => setFormData(prev => ({ ...prev, sampleDrawnBy: val }))}
                                            placeholder="Select phlebotomist"
                                        />
                                    </div>
                                </div>

                                {/* SECTION 4: Sample Received By / Transport */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-4 md:p-5 shadow-sm space-y-3">
                                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                                        <span className="p-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-md">
                                            <Truck className="w-3.5 h-3.5" />
                                        </span>
                                        <h2 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                                            Sample Transport Details
                                        </h2>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                                Received Through <span className="text-rose-500 font-bold">*</span>
                                            </label>
                                            <select 
                                                value={formData.sampleReceived.receivedThrough}
                                                onChange={(e) => {
                                                    const type = e.target.value;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        sampleReceived: { ...prev.sampleReceived, receivedThrough: type as any }
                                                    }));
                                                }}
                                                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none font-bold shadow-sm"
                                            >
                                                <option value="Employee">Employee Name & ID</option>
                                                <option value="Person">Delivery Person Details</option>
                                                <option value="Courier">Courier Transport</option>
                                                <option value="Bus">Bus Transport / Parcel</option>
                                            </select>
                                        </div>

                                        {/* DYNAMIC FIELDS */}
                                        <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2">
                                            {/* Option A: Employee */}
                                            {formData.sampleReceived.receivedThrough === "Employee" && (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex flex-col gap-0.5">
                                                        <label className="text-[9px] font-bold text-slate-500 uppercase">Name</label>
                                                        <input 
                                                            type="text" 
                                                            value={formData.sampleReceived.employee.name}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, sampleReceived: { ...prev.sampleReceived, employee: { ...prev.sampleReceived.employee, name: e.target.value } } }))}
                                                            placeholder="Name"
                                                            className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <label className="text-[9px] font-bold text-slate-500 uppercase">Employee ID</label>
                                                        <input 
                                                            type="text" 
                                                            value={formData.sampleReceived.employee.id}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, sampleReceived: { ...prev.sampleReceived, employee: { ...prev.sampleReceived.employee, id: e.target.value } } }))}
                                                            placeholder="EMP-ID"
                                                            className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {/* Option B: Person */}
                                            {formData.sampleReceived.receivedThrough === "Person" && (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex flex-col gap-0.5">
                                                        <label className="text-[9px] font-bold text-slate-500 uppercase">Name</label>
                                                        <input 
                                                            type="text" 
                                                            value={formData.sampleReceived.person.name}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, sampleReceived: { ...prev.sampleReceived, person: { ...prev.sampleReceived.person, name: e.target.value } } }))}
                                                            placeholder="Name"
                                                            className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <label className="text-[9px] font-bold text-slate-500 uppercase">Mobile</label>
                                                        <input 
                                                            type="text" 
                                                            value={formData.sampleReceived.person.mobileNumber}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, sampleReceived: { ...prev.sampleReceived, person: { ...prev.sampleReceived.person, mobileNumber: e.target.value } } }))}
                                                            placeholder="Mobile"
                                                            className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {/* Option C: Courier */}
                                            {formData.sampleReceived.receivedThrough === "Courier" && (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex flex-col gap-0.5">
                                                        <label className="text-[9px] font-bold text-slate-500 uppercase">Company</label>
                                                        <input 
                                                            type="text" 
                                                            value={formData.sampleReceived.courier.companyName}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, sampleReceived: { ...prev.sampleReceived, courier: { ...prev.sampleReceived.courier, companyName: e.target.value } } }))}
                                                            placeholder="e.g. DHL"
                                                            className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <label className="text-[9px] font-bold text-slate-500 uppercase">Tracking #</label>
                                                        <input 
                                                            type="text" 
                                                            value={formData.sampleReceived.courier.trackingNumber}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, sampleReceived: { ...prev.sampleReceived, courier: { ...prev.sampleReceived.courier, trackingNumber: e.target.value } } }))}
                                                            placeholder="Tracking ID"
                                                            className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {/* Option D: Bus */}
                                            {formData.sampleReceived.receivedThrough === "Bus" && (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex flex-col gap-0.5">
                                                        <label className="text-[9px] font-bold text-slate-500 uppercase">Service Name</label>
                                                        <input 
                                                            type="text" 
                                                            value={formData.sampleReceived.bus.busServiceName}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, sampleReceived: { ...prev.sampleReceived, bus: { ...prev.sampleReceived.bus, busServiceName: e.target.value } } }))}
                                                            placeholder="Bus Service"
                                                            className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <label className="text-[9px] font-bold text-slate-500 uppercase">Driver Mobile</label>
                                                        <input 
                                                            type="text" 
                                                            value={formData.sampleReceived.bus.driverMobileNumber}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, sampleReceived: { ...prev.sampleReceived, bus: { ...prev.sampleReceived.bus, driverMobileNumber: e.target.value } } }))}
                                                            placeholder="Mobile"
                                                            className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="space-y-4">
                            {/* SECTION 5: REGISTRATION INFO */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-4 md:p-5 shadow-sm space-y-4">
                                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                                    <span className="p-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-md">
                                        <FileText className="w-3.5 h-3.5" />
                                    </span>
                                    <h2 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                                        Registration Info
                                    </h2>
                                </div>

                                <div className="space-y-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-2">
                                        <span className="text-slate-400 font-medium flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> System Date:</span>
                                        <span className="text-slate-800 dark:text-slate-200">{liveDate}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-2">
                                        <span className="text-slate-400 font-medium flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> System Time:</span>
                                        <span className="text-slate-800 dark:text-slate-200">{liveTime}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400 font-medium">ID Sequence:</span>
                                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded text-[10px] font-black tracking-widest uppercase">
                                            Pending Save
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Form Completeness Checklist */}
                            <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-800/60 rounded-xl p-4 space-y-3">
                                <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                                    Validation Checklist
                                </h3>

                                <ul className="space-y-2 text-xs font-bold text-slate-500">
                                    <li className="flex items-center gap-2">
                                        <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", isNameValid ? "bg-emerald-500" : "bg-slate-350")} />
                                        <span className={isNameValid ? "text-emerald-700 dark:text-emerald-500" : ""}>Patient Full Name</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", isAgeValid ? "bg-emerald-500" : "bg-slate-350")} />
                                        <span className={isAgeValid ? "text-emerald-700 dark:text-emerald-500" : ""}>Valid Age (&gt; 0)</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", isMobileValid ? "bg-emerald-500" : "bg-slate-350")} />
                                        <span className={isMobileValid ? "text-emerald-700 dark:text-emerald-500" : ""}>10-Digit Mobile Number</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", isAddressValid ? "bg-emerald-500" : "bg-slate-350")} />
                                        <span className={isAddressValid ? "text-emerald-700 dark:text-emerald-500" : ""}>Street Address Details</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", isReferralValid ? "bg-emerald-500" : "bg-slate-350")} />
                                        <span className={isReferralValid ? "text-emerald-700 dark:text-emerald-500" : ""}>Referred By Doctor</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Actions Panel */}
                            <div className="space-y-2.5">
                                <button 
                                    disabled={!isFormValid || isSaving}
                                    onClick={() => handleSave(false)}
                                    className={cn(
                                        "w-full py-2.5 text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md flex items-center justify-center gap-2",
                                        isFormValid && !isSaving ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/10 cursor-pointer" : "bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none"
                                    )}
                                >
                                    {isSaving ? (
                                        <>
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            Saving Record...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-3.5 h-3.5" />
                                            Save Patient Registration
                                        </>
                                    )}
                                </button>

                                <button 
                                    disabled={!isFormValid || isSaving}
                                    onClick={() => handleSave(true)}
                                    className={cn(
                                        "w-full py-2.5 font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 border",
                                        isFormValid && !isSaving 
                                            ? "bg-slate-900 hover:bg-slate-800 text-white border-transparent cursor-pointer" 
                                            : "bg-transparent text-slate-300 dark:text-slate-700 border-slate-200 dark:border-slate-800 cursor-not-allowed"
                                    )}
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    Save &amp; Print Receipt
                                </button>

                                <div className="grid grid-cols-2 gap-2.5 pt-1.5">
                                    <button 
                                        onClick={handleReset}
                                        className="py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold rounded-xl text-xs text-slate-600 dark:text-slate-400 transition-all active:scale-95 cursor-pointer"
                                    >
                                        Reset Form
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (confirm("Discard draft changes and cancel?")) {
                                                setShowForm(false);
                                            }
                                        }}
                                        className="py-2 border border-rose-200 dark:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold rounded-xl text-xs text-rose-600 dark:text-rose-400 transition-all active:scale-95 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TEST SELECTION OVERLAY */}

            {showTestSelection && savedRecord && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[85vh] max-h-[800px]">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <div>
                                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-blue-600" />
                                    Select Tests / Samples for {savedRecord.patientName}
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                    Registration No: {savedRecord.registrationNumber} | Referrer: {savedRecord.referredBy}
                                </p>
                            </div>
                            <button 
                                onClick={() => {
                                    if (confirm("Skip test selection? You can print receipt without tests.")) {
                                        setShowTestSelection(false);
                                        setShowReceipt(true);
                                    }
                                }}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 flex overflow-hidden min-h-0">
                            
                            {/* Left Sidebar: Categories */}
                            <div className="w-48 bg-slate-50 dark:bg-slate-950/40 border-r border-slate-100 dark:border-slate-800 flex flex-col shrink-0">
                                <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Categories</span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                    {["All", ...Array.from(new Set(availableSamples.map(s => s.category || "General").filter(c => c && c !== "-")))].map((cat) => {
                                        const catCount = availableSamples.filter(s => (s.category || "General") === cat && cat !== "All").length;
                                        const isSelected = selectedCategory === cat;
                                        return (
                                            <button
                                                key={cat}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={cn(
                                                    "w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between",
                                                    isSelected 
                                                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/15" 
                                                        : "hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400"
                                                )}
                                            >
                                                <span className="truncate">{cat}</span>
                                                {cat !== "All" && (
                                                    <span className={cn(
                                                        "text-[9px] px-1.5 py-0.5 rounded-full shrink-0 font-bold ml-1.5",
                                                        isSelected ? "bg-blue-700 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                                                    )}>
                                                        {catCount}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
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
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium text-slate-800 dark:text-slate-100"
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
                                        const matchesSearch = (sample.testName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            (sample.organ || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            (sample.category || "").toLowerCase().includes(searchQuery.toLowerCase());
                                        const matchesCategory = selectedCategory === "All" || (sample.category || "General") === selectedCategory;
                                        return matchesSearch && matchesCategory;
                                    }).length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                            <Activity className="w-10 h-10 text-slate-300 mb-2" />
                                            <p className="text-xs font-bold text-slate-500">No tests found matching search criteria.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {availableSamples.filter(sample => {
                                                const matchesSearch = (sample.testName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                    (sample.organ || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                    (sample.category || "").toLowerCase().includes(searchQuery.toLowerCase());
                                                const matchesCategory = selectedCategory === "All" || (sample.category || "General") === selectedCategory;
                                                return matchesSearch && matchesCategory;
                                            }).map((sample) => {
                                                const isSelected = selectedTestIds.includes(sample._id);
                                                return (
                                                    <div
                                                        key={sample._id}
                                                        onClick={() => toggleTestSelection(sample._id)}
                                                        className={cn(
                                                            "p-4 bg-white dark:bg-slate-900 border rounded-2xl cursor-pointer hover:shadow-md transition-all flex justify-between items-start gap-4 select-none group relative overflow-hidden",
                                                            isSelected 
                                                                ? "border-blue-500 ring-2 ring-blue-500/10 dark:bg-slate-900" 
                                                                : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                                        )}
                                                    >
                                                        <div className="space-y-1.5 flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase tracking-wider rounded border border-blue-100/50 dark:border-blue-900/50">
                                                                    {sample.category || "General"}
                                                                </span>
                                                                {sample.organ && sample.organ !== "-" && (
                                                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[8px] font-bold uppercase tracking-wide rounded">
                                                                        {sample.organ}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight truncate font-bold">
                                                                {sample.testName}
                                                            </h4>
                                                            <div className="flex items-center gap-3 text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                                                                <span>Method: {sample.method || "-"}</span>
                                                                <span>•</span>
                                                                <span>Specimen: {sample.sampleUsedForTest || "-"}</span>
                                                            </div>
                                                        </div>

                                                        <div className="text-right shrink-0 flex flex-col items-end justify-between h-full min-h-[50px]">
                                                            <span className="text-xs font-black text-slate-900 dark:text-white">
                                                                ₹{parseFloat(sample.patientPrice) || 0}
                                                            </span>
                                                            <div className={cn(
                                                                "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                                                                isSelected 
                                                                    ? "bg-blue-600 border-blue-600 text-white" 
                                                                    : "border-slate-300 dark:border-slate-600 group-hover:border-blue-400"
                                                            )}>
                                                                {isSelected && <Check className="w-2.5 h-2.5" />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Sidebar: Selected Tests Summary */}
                            <div className="w-72 bg-white dark:bg-slate-950/20 border-l border-slate-100 dark:border-slate-800 flex flex-col shrink-0 overflow-hidden">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Selected Investigations</span>
                                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1 uppercase truncate">
                                        {availableSamples.filter(s => selectedTestIds.includes(s._id)).length} tests added
                                    </p>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                                    {availableSamples.filter(s => selectedTestIds.includes(s._id)).length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-12">
                                            <ShoppingCart className="w-8 h-8 text-slate-300 mb-2" />
                                            <p className="text-[10px] font-bold uppercase tracking-wider">No tests selected yet</p>
                                        </div>
                                    ) : (
                                        availableSamples.filter(s => selectedTestIds.includes(s._id)).map((t) => (
                                            <div key={t._id} className="p-2.5 bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate uppercase tracking-tight">{t.testName}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{t.category}</p>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className="font-extrabold text-slate-900 dark:text-white">₹{t.patientPrice}</span>
                                                    <button 
                                                        onClick={() => toggleTestSelection(t._id)}
                                                        className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 space-y-3 shrink-0">
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                                        <span>Subtotal</span>
                                        <span className="text-slate-800 dark:text-slate-200">
                                            ₹{availableSamples.filter(s => selectedTestIds.includes(s._id)).reduce((sum, s) => sum + (parseFloat(s.patientPrice) || 0), 0)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm font-black border-t border-dashed border-slate-200 dark:border-slate-800 pt-2">
                                        <span className="text-slate-900 dark:text-white uppercase tracking-wider">Total Payable</span>
                                        <span className="text-blue-600 dark:text-blue-400 text-lg">
                                            ₹{availableSamples.filter(s => selectedTestIds.includes(s._id)).reduce((sum, s) => sum + (parseFloat(s.patientPrice) || 0), 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                            <button
                                onClick={() => {
                                    if (confirm("Skip test selection? You can print receipt without tests.")) {
                                        setShowTestSelection(false);
                                        setShowReceipt(true);
                                    }
                                }}
                                className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl text-xs transition-all active:scale-95 cursor-pointer"
                            >
                                Skip & Print Receipt
                            </button>
                            <button
                                onClick={handleSaveTests}
                                disabled={selectedTestIds.length === 0 || isSavingTests}
                                className={cn(
                                    "px-6 py-2 font-bold rounded-xl text-xs transition-all active:scale-95 flex items-center gap-1.5 border shadow-md",
                                    selectedTestIds.length > 0 && !isSavingTests
                                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 border-transparent cursor-pointer"
                                        : "bg-transparent text-slate-300 dark:text-slate-700 border-slate-200 dark:border-slate-800 cursor-not-allowed"
                                )}
                            >
                                {isSavingTests ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Printer className="w-4 h-4" />
                                        Confirm & Save Tests
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* RECEIPT MODAL OVERLAY (Printable Acknowledgement Receipt) */}
            {showReceipt && savedRecord && (
                <div className={cn(
                    "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300",
                    printType === "receipt" ? "print:p-0 print:bg-white print:relative print:z-0 print:flex" : "print:hidden"
                )}>
                    <div className="bg-white text-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden print:shadow-none print:w-full print:max-w-none flex flex-col max-h-[90vh] print:max-h-none">
                        
                        {/* Modal controls - hidden in print */}
                        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100 print:hidden shrink-0">
                            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                Patient Registered Successfully!
                            </h3>
                            <button 
                                onClick={() => {
                                    setShowReceipt(false);
                                    window.location.href = "/admin/dashboard";
                                }}
                                className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Printable Area */}
                        <div id={printType === "receipt" ? "print-active-section" : "print-receipt-section"} className="p-8 print:p-0 flex-1 overflow-y-auto print:overflow-visible font-mono text-sm leading-relaxed space-y-6">
                            
                            {/* Receipt Header */}
                            <div className="text-center space-y-1.5 border-b border-dashed border-slate-300 pb-5">
                                <h2 className="text-xl font-black uppercase tracking-wider text-slate-900">MEDORAA LABS</h2>
                                <p className="text-[11px] font-bold text-slate-500">DIAGNOSTIC & PATHOLOGY CLINICAL MANAGEMENT SYSTEM</p>
                                <p className="text-[10px] font-medium text-slate-400">Medoraa HQ, Road No 10, Banjara Hills, Hyderabad - 500034</p>
                                <p className="text-[10px] font-medium text-slate-400">Tel: +91 40 2345 6789 | Email: contact@medoraalabs.com</p>
                            </div>

                            {/* Ticket Title */}
                            <div className="bg-slate-50 p-2.5 rounded-lg text-center border border-slate-200/50 print:border-slate-300">
                                <span className="font-extrabold text-xs text-slate-900 uppercase tracking-widest">
                                    Patient Registration Acknowledgement
                                </span>
                            </div>

                            {/* Registration meta numbers */}
                            <div className="grid grid-cols-2 gap-4 text-xs font-bold bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                                <div className="space-y-1">
                                    <p className="text-slate-400 font-medium">REGISTRATION NO:</p>
                                    <p className="text-slate-900 font-black text-sm tracking-wide">{savedRecord.registrationNumber}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-slate-400 font-medium">DATE / TIME:</p>
                                    <p className="text-slate-900">{savedRecord.registrationDate} | {savedRecord.registrationTime}</p>
                                </div>
                            </div>

                            {/* Patient Metadata Details */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wider">Patient Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                                    <div className="flex justify-between py-1 border-b border-slate-100/50">
                                        <span className="text-slate-400 font-medium">Name:</span>
                                        <span className="font-bold text-slate-950 uppercase">{savedRecord.patientName}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-100/50">
                                        <span className="text-slate-400 font-medium">Age / Gender:</span>
                                        <span className="font-bold text-slate-950">{savedRecord.age.value} {savedRecord.age.type} / {savedRecord.gender}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-100/50">
                                        <span className="text-slate-400 font-medium">Mobile Number:</span>
                                        <span className="font-bold text-slate-950">+91 {savedRecord.mobileNumber}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-100/50 md:col-span-2">
                                        <span className="text-slate-400 font-medium">Address:</span>
                                        <span className="font-bold text-slate-950 max-w-[320px] text-right break-words">{savedRecord.address}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Referral Info details */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wider">Referral Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                                    <div className="flex justify-between py-1 border-b border-slate-100/50">
                                        <span className="text-slate-400 font-medium">Referred By:</span>
                                        <span className="font-bold text-slate-950 uppercase">{savedRecord.referredBy}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-100/50">
                                        <span className="text-slate-400 font-medium">Sample Drawn By:</span>
                                        <span className="font-bold text-slate-950">{savedRecord.sampleDrawnBy || "N/A"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Sample Transport Info */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wider">Sample Transport Logistics</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                                    <div className="flex justify-between py-1 border-b border-slate-100/50">
                                        <span className="text-slate-400 font-medium">Transport Method:</span>
                                        <span className="font-extrabold text-blue-600 dark:text-blue-400 uppercase">{savedRecord.sampleReceived.receivedThrough}</span>
                                    </div>

                                    {/* Employee Detail receipt fields */}
                                    {savedRecord.sampleReceived.receivedThrough === "Employee" && (
                                        <>
                                            <div className="flex justify-between py-1 border-b border-slate-100/50">
                                                <span className="text-slate-400 font-medium">Collector Name:</span>
                                                <span className="font-bold text-slate-950">{savedRecord.sampleReceived.employee?.name || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b border-slate-100/50">
                                                <span className="text-slate-400 font-medium">Employee ID:</span>
                                                <span className="font-bold text-slate-950">{savedRecord.sampleReceived.employee?.id || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b border-slate-100/50">
                                                <span className="text-slate-400 font-medium">Department:</span>
                                                <span className="font-bold text-slate-950">{savedRecord.sampleReceived.employee?.department || "N/A"}</span>
                                            </div>
                                        </>
                                    )}

                                    {/* Person Detail receipt fields */}
                                    {savedRecord.sampleReceived.receivedThrough === "Person" && (
                                        <>
                                            <div className="flex justify-between py-1 border-b border-slate-100/50">
                                                <span className="text-slate-400 font-medium">Person Name:</span>
                                                <span className="font-bold text-slate-950">{savedRecord.sampleReceived.person?.name || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b border-slate-100/50">
                                                <span className="text-slate-400 font-medium">Mobile Number:</span>
                                                <span className="font-bold text-slate-950">{savedRecord.sampleReceived.person?.mobileNumber || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b border-slate-100/50">
                                                <span className="text-slate-400 font-medium">ID Proof Type / No:</span>
                                                <span className="font-bold text-slate-950">{savedRecord.sampleReceived.person?.idProofType}: {savedRecord.sampleReceived.person?.idProofNumber || "N/A"}</span>
                                            </div>
                                        </>
                                    )}

                                    {/* Courier Detail receipt fields */}
                                    {savedRecord.sampleReceived.receivedThrough === "Courier" && (
                                        <>
                                            <div className="flex justify-between py-1 border-b border-slate-100/50">
                                                <span className="text-slate-400 font-medium">Courier Company:</span>
                                                <span className="font-bold text-slate-950">{savedRecord.sampleReceived.courier?.companyName || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b border-slate-100/50">
                                                <span className="text-slate-400 font-medium">Tracking Number:</span>
                                                <span className="font-bold text-slate-950">{savedRecord.sampleReceived.courier?.trackingNumber || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b border-slate-100/50">
                                                <span className="text-slate-400 font-medium">Package Condition:</span>
                                                <span className="font-bold text-slate-950">{savedRecord.sampleReceived.courier?.packageCondition || "Good"}</span>
                                            </div>
                                        </>
                                    )}

                                    {/* Bus Detail receipt fields */}
                                    {savedRecord.sampleReceived.receivedThrough === "Bus" && (
                                        <>
                                            <div className="flex justify-between py-1 border-b border-slate-100/50">
                                                <span className="text-slate-400 font-medium">Bus Service Name:</span>
                                                <span className="font-bold text-slate-950">{savedRecord.sampleReceived.bus?.busServiceName || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b border-slate-100/50">
                                                <span className="text-slate-400 font-medium">Bus Reg Number:</span>
                                                <span className="font-bold text-slate-950">{savedRecord.sampleReceived.bus?.busNumber || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b border-slate-100/50">
                                                <span className="text-slate-400 font-medium">Driver Mobile:</span>
                                                <span className="font-bold text-slate-950">{savedRecord.sampleReceived.bus?.driverMobileNumber || "N/A"}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Selected Tests Detail */}
                            <div className="space-y-3 pt-2">
                                <h4 className="text-xs font-black text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wider">Prescribed Tests / Investigations</h4>
                                {savedRecord.tests && savedRecord.tests.length > 0 ? (
                                    <table className="w-full text-left text-xs font-mono">
                                        <thead>
                                            <tr className="border-b border-slate-200 text-slate-400 font-bold">
                                                <th className="py-1">Test Name</th>
                                                <th className="py-1">Category</th>
                                                <th className="py-1 text-right">Price</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {savedRecord.tests.map((test: any) => (
                                                <tr key={test._id} className="text-slate-950 font-semibold">
                                                    <td className="py-1.5">{test.testName}</td>
                                                    <td className="py-1.5 uppercase">{test.category || "General"}</td>
                                                    <td className="py-1.5 text-right font-bold">₹{parseFloat(test.patientPrice) || 0}</td>
                                                </tr>
                                            ))}
                                            <tr className="border-t border-dashed border-slate-300 font-black text-slate-900 text-sm">
                                                <td colSpan={2} className="py-2 text-right">TOTAL AMOUNT:</td>
                                                <td className="py-2 text-right">₹{savedRecord.tests.reduce((sum: number, t: any) => sum + (parseFloat(t.patientPrice) || 0), 0)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="text-center text-slate-400 text-xs py-2 border border-dashed border-slate-200 rounded-lg font-bold">
                                        No tests selected for this patient.
                                    </div>
                                )}
                            </div>

                            {/* Footer barcode and signoff */}
                            <div className="border-t border-dashed border-slate-300 pt-6 text-center space-y-4">
                                <div className="flex flex-col items-center justify-center gap-1 bg-slate-50 py-3 rounded-lg border border-slate-100">
                                    <div className="mb-1">
                                        <Barcode value={savedRecord.registrationNumber} width={1.5} height={40} displayValue={false} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">{savedRecord.registrationNumber}</span>
                                </div>

                                <div className="flex items-end justify-between text-[10px] font-bold text-slate-400 pt-4">
                                    <div>
                                        <p>__________________________</p>
                                        <p className="mt-1 uppercase">Issued By Desk Operator</p>
                                    </div>
                                    <div className="text-right">
                                        <p>__________________________</p>
                                        <p className="mt-1 uppercase">Authorized Signature</p>
                                    </div>
                                </div>

                                <p className="text-[10px] font-bold text-slate-400 text-center tracking-tight pt-2">
                                    Thank you for choosing Medoraa Labs. Please bring this receipt for sample status queries.
                                </p>
                            </div>
                        </div>

                        {/* Modal Action Buttons - hidden in print */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 print:hidden shrink-0">
                            <button 
                                onClick={handlePrintReceipt}
                                className="px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                            >
                                <Printer className="w-4 h-4" />
                                Print Receipt
                            </button>
                            <button 
                                onClick={handlePrintLabels}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer"
                            >
                                <Printer className="w-4 h-4" />
                                Print Bottle Labels
                            </button>
                            <button 
                                onClick={() => {
                                    setShowReceipt(false);
                                    window.location.href = "/admin/dashboard";
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all active:scale-95 shadow-md"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PRINT LABELS SECTION (Hidden on screen, visible only when printing labels) */}
            {savedRecord && (
                <div
                    id={printType === "label" ? "print-active-section" : "print-labels-section"}
                    className={cn("hidden", printType === "label" ? "print:block" : "print:hidden")}
                >
                    {(savedRecord.tests || []).map((test: any, index: number) => {
                        const currentDate = savedRecord.registrationDate || "";
                        const currentTime = savedRecord.registrationTime || "";
                        const formattedDateTime = `${currentDate} ${currentTime}`;
                        
                        const regDigits = savedRecord.registrationNumber ? savedRecord.registrationNumber.replace(/[^0-9]/g, "") : "";
                        const sampleDigits = regDigits.slice(-8);
                        const sampleId = `S${sampleDigits}${index + 1}`;

                        return (
                            <div key={test._id || index} className="vial-label-card" style={{ pageBreakAfter: "always", breakAfter: "page" }}>
                                {/* Logo Column */}
                                <div className="label-logo-col">
                                    <svg className="label-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                    </svg>
                                    <div className="label-brand-name">Medoraa</div>
                                    <div className="label-brand-sub">DIAGNOSTICS</div>
                                </div>

                                {/* Divider */}
                                <div className="label-divider" />

                                {/* Patient Info Column */}
                                <div className="label-info-col">
                                    <div className="label-field-group">
                                        <span className="label-field-title">PATIENT ID:</span>
                                        <span className="label-field-value-lg">{savedRecord.registrationNumber}</span>
                                    </div>
                                    <div className="label-field-group" style={{ marginTop: "3px" }}>
                                        <span className="label-field-title">NAME:</span>
                                        <span className="label-field-value-lg uppercase truncate-name">{savedRecord.patientName}</span>
                                    </div>
                                    <div className="label-grid" style={{ marginTop: "3px" }}>
                                        <div>
                                            <span className="label-field-title">AGE:</span>
                                            <span className="label-field-value">{savedRecord.age?.value} {savedRecord.age?.type?.substring(0, 1)}</span>
                                        </div>
                                        <div>
                                            <span className="label-field-title">GENDER:</span>
                                            <span className="label-field-value">{savedRecord.gender?.substring(0, 1)}</span>
                                        </div>
                                        <div>
                                            <span className="label-field-title">PHONE:</span>
                                            <span className="label-field-value">{savedRecord.mobileNumber}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* QR Column */}
                                <div className="label-qr-col">
                                    <div className="label-field-group">
                                        <span className="label-field-title">SAMPLE ID:</span>
                                        <span className="label-field-value-md">{sampleId}</span>
                                    </div>
                                    <div className="label-qr-wrapper">
                                        <img 
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`Patient:${savedRecord.patientName}|ID:${savedRecord.registrationNumber}|Sample:${sampleId}|Test:${test.testName}`)}`} 
                                            alt="QR Code" 
                                            className="label-qr-img" 
                                        />
                                    </div>
                                    <div className="label-test-badge">
                                        {test.testName}
                                    </div>
                                </div>

                                {/* Barcode Column */}
                                <div className="label-barcode-col">
                                    <div className="label-barcode-wrapper">
                                        <Barcode value={sampleId} width={1.1} height={24} displayValue={false} />
                                    </div>
                                    <div className="label-timestamp-wrapper">
                                        {formattedDateTime}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Conditional Page Print Setup */}
            {printType === "label" ? (
                <style jsx global>{`
                    @media print {
                        @page {
                            size: 100mm 35mm;
                            margin: 0;
                        }
                        body * {
                            visibility: hidden;
                        }
                        #print-active-section, #print-active-section * {
                            visibility: visible;
                        }
                        #print-active-section {
                            position: absolute !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 100mm !important;
                            height: auto !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            background: white !important;
                            z-index: 9999999 !important;
                        }
                        
                        /* Vial Label Container Styling */
                        .vial-label-card {
                            width: 100mm;
                            height: 35mm;
                            box-sizing: border-box;
                            padding: 1.5mm 2.5mm;
                            display: flex;
                            align-items: stretch;
                            background: white !important;
                            color: black !important;
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                            page-break-after: always;
                            break-after: page;
                            overflow: hidden;
                        }
                        
                        /* Column 1: Logo & Brand */
                        .label-logo-col {
                            width: 18mm;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            text-align: center;
                            flex-shrink: 0;
                        }
                        .label-logo-icon {
                            width: 6mm;
                            height: 6mm;
                            color: #1a365d !important;
                        }
                        .label-brand-name {
                            font-size: 10px;
                            font-weight: 800;
                            color: #1a365d !important;
                            line-height: 1;
                            margin-top: 1mm;
                            letter-spacing: -0.2px;
                        }
                        .label-brand-sub {
                            font-size: 5px;
                            font-weight: 700;
                            color: #0d9488 !important;
                            letter-spacing: 0.8px;
                            line-height: 1;
                            margin-top: 0.5mm;
                        }
                        
                        /* Divider */
                        .label-divider {
                            width: 0.2mm;
                            background-color: #cbd5e1 !important;
                            margin: 0 1.5mm;
                            flex-shrink: 0;
                        }
                        
                        /* Column 2: Patient Info */
                        .label-info-col {
                            flex: 1;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            min-width: 0;
                        }
                        .label-field-group {
                            display: flex;
                            flex-direction: column;
                            line-height: 1.1;
                        }
                        .label-field-title {
                            font-size: 7px;
                            font-weight: 700;
                            color: #64748b !important;
                            letter-spacing: 0.2px;
                        }
                        .label-field-value-lg {
                            font-size: 10px;
                            font-weight: 800;
                            color: #0f172a !important;
                        }
                        .truncate-name {
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            display: block;
                        }
                        .label-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr 1.3fr;
                            gap: 1mm;
                        }
                        .label-field-value {
                            font-size: 8px;
                            font-weight: 800;
                            color: #0f172a !important;
                            display: block;
                        }
                        
                        /* Column 3: QR & Badge */
                        .label-qr-col {
                            width: 22mm;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: space-between;
                            flex-shrink: 0;
                            padding-top: 0.5mm;
                        }
                        .label-field-value-md {
                            font-size: 8px;
                            font-weight: 800;
                            color: #0f172a !important;
                        }
                        .label-qr-wrapper {
                            width: 14mm;
                            height: 14mm;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        .label-qr-img {
                            width: 14mm;
                            height: 14mm;
                        }
                        .label-test-badge {
                            width: 100%;
                            background-color: #0d9488 !important;
                            color: white !important;
                            font-size: 8px;
                            font-weight: 800;
                            text-align: center;
                            padding: 0.5mm 0;
                            border-radius: 0.5mm;
                            text-transform: uppercase;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }
                        
                        /* Column 4: Barcode & Time */
                        .label-barcode-col {
                            width: 18mm;
                            display: flex;
                            flex-direction: row;
                            align-items: center;
                            justify-content: center;
                            flex-shrink: 0;
                            border-left: 0.2mm dashed #e2e8f0 !important;
                            position: relative;
                            margin-left: 1mm;
                            height: 100%;
                        }
                        .label-barcode-wrapper {
                            transform: rotate(90deg);
                            transform-origin: center;
                            white-space: nowrap;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            position: absolute;
                            left: 0;
                            top: 50%;
                            margin-top: -15px;
                        }

                        .label-timestamp-wrapper {
                            transform: rotate(90deg);
                            transform-origin: center;
                            white-space: nowrap;
                            font-size: 6px;
                            font-weight: 700;
                            color: #64748b !important;
                            position: absolute;
                            right: 0;
                            top: 50%;
                            margin-top: -15px;
                        }
                    }
                `}</style>
            ) : (
                <style jsx global>{`
                    @media print {
                        html, body {
                            height: auto !important;
                            overflow: visible !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        body * {
                            visibility: hidden;
                        }
                        #print-active-section, #print-active-section * {
                            visibility: visible;
                        }
                        #print-active-section {
                            position: absolute !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 100% !important;
                            height: auto !important;
                            display: block !important;
                            overflow: visible !important;
                            padding: 0 !important;
                            margin: 0 !important;
                            box-shadow: none !important;
                            border: none !important;
                            background: white !important;
                            color: black !important;
                            z-index: 9999999 !important;
                        }
                        @page {
                            size: A4;
                            margin: 10mm;
                        }
                    }
                `}</style>
            )}
        </div>
    );
};

export default PatientRegistrationForm;
