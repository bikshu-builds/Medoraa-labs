"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  User,
  FileText,
  Share2,
  Clipboard,
  ShieldAlert,
  Check,
  RefreshCw,
  X,
  Printer,
  Calendar,
  Clock,
  Truck,
  Bus,
  UserCheck,
  Search,
  ChevronDown,
  CheckCircle2,
  ChevronRight,
  UserPlus,
  Info,
  Activity,
  ShoppingCart,
  Download,
  FileSpreadsheet,
  Plus,
  ArrowLeft,
  Loader2,
  QrCode,
  Maximize2,
  ExternalLink,
  FlaskConical,
  CreditCard,
  Pencil,
  Edit2,
  Filter,
  ArrowUpDown,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { printPdfDirect } from "@/lib/pdfPrinter";
import { cn } from "@/lib/utils";
import JsBarcode from "jsbarcode";
import * as XLSX from "xlsx";
import PathologyReportModal from "../components/PathologyReportModal";
import SampleTransferModal from "../components/SampleTransferModal";
import UpdateDueModal from "../components/UpdateDueModal";

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
  displayValue = false,
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
          lineColor: "#000",
        });
      } catch (e) {
        console.error("JsBarcode error:", e);
      }
    }
  }, [value, width, height, displayValue]);

  return <svg ref={svgRef}></svg>;
};

// Container badge color and text parser for thermal sample labels
const getContainerBadgeInfo = (test: any, samplesList: any[] = []) => {
  let containerStr = "";
  let testNameStr = "";

  if (typeof test === "object" && test !== null) {
    testNameStr = test.testName || test.name || "";
    containerStr = test.container || "";

    if ((!containerStr || containerStr === "-") && samplesList.length > 0) {
      const found = samplesList.find(
        (s) =>
          (test._id && s._id === test._id) ||
          (testNameStr &&
            s.testName?.toLowerCase() === testNameStr.toLowerCase()),
      );
      if (found && found.container && found.container !== "-") {
        containerStr = found.container;
      }
    }
  } else if (typeof test === "string") {
    testNameStr = test;
    if (samplesList.length > 0) {
      const found = samplesList.find(
        (s) => s.testName?.toLowerCase() === test.toLowerCase(),
      );
      if (found && found.container && found.container !== "-") {
        containerStr = found.container;
      }
    }
  }

  if (
    !containerStr ||
    containerStr === "-" ||
    containerStr.toLowerCase() === "none"
  ) {
    return {
      text: (testNameStr || "SAMPLE").toUpperCase(),
      bgColor: "#0d9488",
      textColor: "#ffffff",
    };
  }

  const containerUpper = containerStr.toUpperCase();

  // Map color
  let bgColor = "#0d9488"; // Default Teal
  let textColor = "#ffffff";

  if (/RED|PLAIN/i.test(containerUpper)) {
    bgColor = "#dc2626"; // Vibrant Red
  } else if (/VIOLET|LAVENDER|PURPLE|EDTA/i.test(containerUpper)) {
    bgColor = "#7c3aed"; // Violet
  } else if (/YELLOW|SST|GEL/i.test(containerUpper)) {
    bgColor = "#d97706"; // Amber Yellow
  } else if (/BLUE|CITRATE/i.test(containerUpper)) {
    bgColor = "#2563eb"; // Royal Blue
  } else if (/GREEN|HEPARIN/i.test(containerUpper)) {
    bgColor = "#16a34a"; // Green
  } else if (/GREY|GRAY|FLUORIDE/i.test(containerUpper)) {
    bgColor = "#4b5563"; // Grey
  } else if (/BLACK|ESR/i.test(containerUpper)) {
    bgColor = "#18181b"; // Black
  } else if (/ORANGE/i.test(containerUpper)) {
    bgColor = "#ea580c";
  } else if (/PINK/i.test(containerUpper)) {
    bgColor = "#db2777";
  }

  // Clean text to show on badge (extract non-color container name)
  let cleanedText = containerUpper
    .replace(/\(|\)/g, " ")
    .replace(
      /\b(RED|VIOLET|LAVENDER|PURPLE|YELLOW|BLUE|GREEN|GREY|GRAY|BLACK|ORANGE|PINK|CAP|TUBE|COLOR|TOP|BOTTLE|CONTAINER|VACUTAINER)\b/gi,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanedText) {
    if (/RED/i.test(containerUpper)) cleanedText = "PLAIN";
    else if (/VIOLET|LAVENDER|PURPLE/i.test(containerUpper))
      cleanedText = "EDTA";
    else if (/YELLOW/i.test(containerUpper)) cleanedText = "SST";
    else if (/BLUE/i.test(containerUpper)) cleanedText = "CITRATE";
    else if (/GREEN/i.test(containerUpper)) cleanedText = "HEPARIN";
    else if (/GREY|GRAY/i.test(containerUpper)) cleanedText = "FLUORIDE";
    else cleanedText = containerUpper;
  }

  return {
    text: cleanedText,
    bgColor,
    textColor,
  };
};

// Cascading Locations Data
const locationsData: Record<string, Record<string, string[]>> = {
  Maharashtra: {
    Mumbai: [
      "Mumbai South",
      "Mumbai North",
      "Andheri",
      "Bandra",
      "Chembur",
      "Ghatkopar",
      "Mulund",
    ],
    Pune: [
      "Shivajinagar",
      "Kothrud",
      "Hinjawadi",
      "Hadapsar",
      "Deccan Gymkhana",
      "Kalyani Nagar",
    ],
    Nagpur: [
      "Dharampeth",
      "Sitabuldi",
      "Sadak",
      "Manish Nagar",
      "Pratap Nagar",
    ],
  },
  Karnataka: {
    Bengaluru: [
      "Koramangala",
      "Indiranagar",
      "Jayanagar",
      "Whitefield",
      "HSR Layout",
      "Malleshwaram",
      "Yelahanka",
    ],
    Mysuru: [
      "Gokulam",
      "Vidyaranyapuram",
      "Jayalakshmipuram",
      "Hebbal",
      "Vijayanagar",
    ],
    Hubli: ["Keshwapur", "Vidyanagar", "Gokul Road", "Shirur Park"],
  },
  Delhi: {
    "Central Delhi": [
      "Connaught Place",
      "Karol Bagh",
      "Paharganj",
      "Rajender Nagar",
    ],
    "South Delhi": [
      "Saket",
      "Hauz Khas",
      "Greater Kailash",
      "Green Park",
      "Vasant Kunj",
      "Lajpat Nagar",
    ],
  },
  "Tamil Nadu": {
    Chennai: [
      "Adyar",
      "Mylapore",
      "Velachery",
      "T. Nagar",
      "Anna Nagar",
      "Nungambakkam",
    ],
    Coimbatore: [
      "Gandhipuram",
      "RS Puram",
      "Peelamedu",
      "Saibaba Colony",
      "Ramanathapuram",
    ],
  },
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
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col gap-1.5 w-full font-sans"
    >
      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
        {icon}
        {label}{" "}
        {mandatory && <span className="text-rose-500 font-bold">*</span>}
      </label>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium cursor-pointer transition-all select-none shadow-sm",
          disabled
            ? "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800"
            : "hover:border-blue-500",
          isOpen && "border-blue-500 ring-2 ring-blue-500/10",
        )}
      >
        <span
          className={
            value
              ? "text-slate-900 dark:text-slate-100 font-semibold"
              : "text-slate-400"
          }
        >
          {value || placeholder}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="p-0.5 text-slate-400 hover:text-rose-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className="w-4 h-4 text-slate-400 transition-transform duration-200"
            style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}
          />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-60 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Type to filter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-transparent border-0 outline-none text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="overflow-y-auto flex-1 max-h-48 py-1 divide-y divide-slate-50 dark:divide-slate-700/50">
            {value && (
              <div
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                  setSearch("");
                }}
                className="px-4 py-2 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer font-bold flex items-center gap-1.5 transition-colors border-b border-slate-100 dark:border-slate-700"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Selection</span>
              </div>
            )}
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
                    opt === value &&
                    "bg-blue-50/50 dark:bg-slate-700/30 text-blue-600 dark:text-blue-400 font-extrabold",
                  )}
                >
                  <span>{opt}</span>
                  {opt === value && (
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  )}
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
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [isLoadingMaster, setIsLoadingMaster] = useState(true);

  // Live clock states
  const [liveDate, setLiveDate] = useState("");
  const [liveTime, setLiveTime] = useState("");

  // Next Patient ID state & auto-population states
  const [nextPatientId, setNextPatientId] = useState<string>("");
  const [patientIdInput, setPatientIdInput] = useState<string>("");
  const [isExistingPatientLoaded, setIsExistingPatientLoaded] = useState<boolean>(false);

  const fetchNextPatientId = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(getApiUrl("/api/admin/registrations/next-id"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data?.nextRegistrationNumber) {
        setNextPatientId(data.data.nextRegistrationNumber);
        setPatientIdInput(data.data.nextRegistrationNumber);
      }
    } catch (err) {
      console.error("Failed to fetch next patient ID", err);
    }
  };

  // Patient directory states
  const [showForm, setShowForm] = useState(false);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [userRole, setUserRole] = useState<string>("registration");

  // Table Column Filters & Sorting
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL"); // ALL | HAS_DUE | PAID | PARTIAL | PENDING
  const [dateFilter, setDateFilter] = useState<string>("ALL"); // ALL | TODAY | YESTERDAY | LAST_7 | THIS_MONTH | CUSTOM
  const [customDate, setCustomDate] = useState<string>("");
  const [referralFilter, setReferralFilter] = useState<string>("ALL"); // ALL | SELF | DOCTOR | HOSPITAL
  const [testStatusFilter, setTestStatusFilter] = useState<string>("ALL"); // ALL | ENTERED | PENDING
  const [genderFilter, setGenderFilter] = useState<string>("ALL"); // ALL | MALE | FEMALE | OTHER
  const [sortOption, setSortOption] = useState<string>("DATE_DESC"); // DATE_DESC | DATE_ASC | NAME_ASC | NAME_DESC | DUE_DESC
  const [openHeaderFilter, setOpenHeaderFilter] = useState<string | null>(null);

  // Helper date parser
  const getRegDateObj = (reg: any): Date | null => {
    if (reg.createdAt) {
      const d = new Date(reg.createdAt);
      if (!isNaN(d.getTime())) return d;
    }
    if (reg.registrationDate) {
      const parts = reg.registrationDate.split("-");
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          const d = new Date(reg.registrationDate);
          if (!isNaN(d.getTime())) return d;
        } else {
          const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          if (!isNaN(d.getTime())) return d;
        }
      }
    }
    return null;
  };

  const resetAllFilters = () => {
    setPaymentFilter("ALL");
    setDateFilter("ALL");
    setCustomDate("");
    setReferralFilter("ALL");
    setTestStatusFilter("ALL");
    setGenderFilter("ALL");
    setPatientSearchQuery("");
    setSortOption("DATE_DESC");
    setOpenHeaderFilter(null);
  };

  // Handle Patient ID change & auto-populate existing patient details
  useEffect(() => {
    const query = patientIdInput.trim();
    // Do not search existing patients if input matches the generated next new patient ID
    if (!query || query === nextPatientId) {
      setIsExistingPatientLoaded(false);
      return;
    }

    // Match by registrationNumber or ID
    const found = registrations.find(
      (r) =>
        r.registrationNumber?.toLowerCase() === query.toLowerCase() ||
        r._id?.toLowerCase() === query.toLowerCase(),
    );

    if (found) {
      setIsExistingPatientLoaded(true);
      setFormData((prev) => ({
        ...prev,
        patientName: found.patientName || "",
        age: found.age
          ? { value: String(found.age.value || ""), type: found.age.type || "Years" }
          : prev.age,
        gender: found.gender || "Male",
        mobileNumber: found.mobileNumber || "",
        address: found.address || "",
        location: {
          state: found.location?.state || "",
          district: found.location?.district || "",
          city: found.location?.city || "",
        },
        referredBy: found.referredBy || "Self",
        sampleDrawnBy: found.sampleDrawnBy || "",
        referralMode: found.referralMode || "Self",
        selectedLab: found.selectedLab || "",
      }));
    } else {
      setIsExistingPatientLoaded(false);
    }
  }, [patientIdInput, registrations]);
  const [formData, setFormData] = useState({
    location: {
      state: "",
      district: "",
      city: "",
    },
    patientName: "",
    age: {
      value: "",
      type: "Years" as "Years" | "Months" | "Days",
    },
    gender: "Male" as "Male" | "Female" | "Other",
    mobileNumber: "",
    address: "",
    referredBy: "Self",
    sampleDrawnBy: "",
    referralMode: "Self" as "Self" | "Hospital",
    selectedLab: "",
    selectedHospital: "",
    selectedDoctor: "",
    sampleReceived: {
      receivedThrough: "None" as
        | "None"
        | "Employee"
        | "Person"
        | "Courier"
        | "Bus"
        | "Transfer",
      transfer: { labName: "None" },
      employee: {
        name: "",
        id: "",
        mobileNumber: "",
        department: "",
        designation: "",
        dateReceived: "",
        timeReceived: "",
        remarks: "",
      },
      person: {
        name: "",
        mobileNumber: "",
        relationship: "",
        address: "",
        idProofType: "Aadhaar",
        idProofNumber: "",
        dateReceived: "",
        timeReceived: "",
        remarks: "",
      },
      courier: {
        companyName: "",
        trackingNumber: "",
        orderNumber: "",
        contactNumber: "",
        pickupLocation: "",
        arrivalDate: "",
        arrivalTime: "",
        receivedByEmployee: "",
        packageCondition: "Good" as "Good" | "Damaged" | "Opened",
        remarks: "",
      },
      bus: {
        busNumber: "",
        busServiceName: "",
        driverName: "",
        driverMobileNumber: "",
        conductorName: "",
        conductorMobileNumber: "",
        originLocation: "",
        destinationLocation: "",
        arrivalDate: "",
        arrivalTime: "",
        receivedByEmployee: "",
        packageCondition: "Good",
        remarks: "",
      },
    },
  });

  // Form states
  const [activeTab, setActiveTab] = useState<"patient" | "transport">(
    "patient",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const [savedRecord, setSavedRecord] = useState<any | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [printType, setPrintType] = useState<"receipt" | "label">("receipt");
  const [modalPreviewType, setModalPreviewType] = useState<"receipt" | "receipt-letterhead" | "label">("receipt");
  const labelRotation: 0 = 0;
  const updateLabelRotation = (_rotation?: any) => { };
  const labelOrientation = "horizontal";
  const updateLabelOrientation = (_orientation?: any) => { };


  // Official Pathology Report Modal State
  const [reportModalRecord, setReportModalRecord] = useState<any | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Billing & QR Code states
  const [discountVal, setDiscountVal] = useState<string>("0");
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">(
    "percentage",
  );
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [customPaymentMethod, setCustomPaymentMethod] = useState<string>("");
  const [paidAmountInput, setPaidAmountInput] = useState<string>("");
  const [adminQrCode, setAdminQrCode] = useState<string>("");
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  // Update Due / Payment Modal State
  const [dueModalRecord, setDueModalRecord] = useState<any | null>(null);
  const [isDueModalOpen, setIsDueModalOpen] = useState(false);

  const [isTransferModalOpen, setIsTransferModalOpen] =
    useState<boolean>(false);

  // Test selection states
  const [showTestSelection, setShowTestSelection] = useState(false);
  const [availableSamples, setAvailableSamples] = useState<any[]>([]);
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedOrgan, setSelectedOrgan] = useState("All");
  const [sidebarView, setSidebarView] = useState<"category" | "organ">(
    "category",
  );
  const [triggerPrintOnComplete, setTriggerPrintOnComplete] = useState(false);
  const [isSavingTests, setIsSavingTests] = useState(false);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [isSavingStaff, setIsSavingStaff] = useState(false);
  const [newStaffData, setNewStaffData] = useState({
    name: "",
    role: "registration",
    email: "",
    mobileNumber: "",
    password: "",
  });


  const handleDeleteAllRegistrations = async () => {
    if (!registrations || registrations.length === 0) {
      alert("No patient registration records available to delete.");
      return;
    }

    const confirmDelete = window.confirm(
      `⚠️ CRITICAL WARNING: Are you sure you want to PERMANENTLY DELETE ALL ${registrations.length} patient registrations?\n\nThis will remove all patient details, billing records, and test reports.\n\nThis action CANNOT be undone. Click OK to proceed.`
    );
    if (!confirmDelete) return;

    const secondConfirm = window.prompt(
      `Please type "DELETE" to confirm permanent deletion of all ${registrations.length} patient records:`
    );
    if (secondConfirm !== "DELETE") {
      alert("Batch deletion canceled. Confirmation text did not match.");
      return;
    }

    setIsDeletingAll(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(getApiUrl("/api/admin/registrations"), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || "All patient registrations deleted successfully.");
        fetchRegistrations();
        fetchNextPatientId();
      } else {
        alert(data.message || "Failed to delete patient registrations.");
      }
    } catch (err: any) {
      console.error("Batch delete error:", err);
      alert(err.message || "An unexpected error occurred while deleting registrations.");
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleDeleteRegistration = async (
    id: string,
    patientName: string,
    regNo: string,
  ) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete patient registration ${regNo} (${patientName || "Patient"})?\n\nThis action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(getApiUrl(`/api/admin/registrations/${id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        fetchRegistrations();
        fetchNextPatientId();
      } else {
        alert(data.message || "Failed to delete patient registration.");
      }
    } catch (err: any) {
      console.error("Delete registration error:", err);
      alert(err.message || "An unexpected error occurred while deleting registration.");
    }
  };

  const fetchRegistrations = async () => {
    setIsLoadingRegistrations(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(getApiUrl("/api/admin/registrations"), {
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
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

    // Fetch UPI QR code from settings
    try {
      const token = localStorage.getItem("adminToken");
      const setRes = await fetch(getApiUrl("/api/admin/settings"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const setData = await setRes.json();
      if (setData.success && setData.data?.upiQrCode) {
        setAdminQrCode(setData.data.upiQrCode);
      }
    } catch (err) {
      console.error("Failed to fetch lab settings", err);
    }
  };

  const handleSaveTests = async () => {
    if (!savedRecord) return;
    setIsSavingTests(true);
    try {
      const token = localStorage.getItem("adminToken");
      const subtotal = availableSamples
        .filter((s) => selectedTestIds.includes(s._id))
        .reduce((sum, s) => sum + (parseFloat(s.patientPrice) || 0), 0);
      const rawDiscount = parseFloat(discountVal) || 0;
      const calculatedDiscount = (subtotal * rawDiscount) / 100;
      const finalDiscount = Math.min(subtotal, Math.max(0, calculatedDiscount));
      const totalAmount = Math.max(0, subtotal - finalDiscount);
      const finalPaymentMethod =
        paymentMethod === "Other"
          ? customPaymentMethod.trim() || "Other"
          : paymentMethod;

      const finalPaidAmount =
        paidAmountInput.trim() !== ""
          ? Math.min(totalAmount, Math.max(0, parseFloat(paidAmountInput) || 0))
          : totalAmount;
      const paymentStatus =
        finalPaidAmount >= totalAmount
          ? "PAID"
          : finalPaidAmount > 0
            ? "PARTIAL"
            : "PENDING";

      const res = await fetch(
        getApiUrl(`/api/admin/registrations/${savedRecord._id}/tests`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            testIds: selectedTestIds,
            subtotal,
            discount: finalDiscount,
            discountType,
            totalAmount,
            paidAmount: finalPaidAmount,
            paymentMethod: finalPaymentMethod,
            paymentStatus,
          }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setSavedRecord(data.data);
        setShowTestSelection(false);
        setShowReceipt(true);

        if (triggerPrintOnComplete) {
          setPrintType("receipt");
          setTimeout(() => {
            handlePrintReceipt(data.data);
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

  const handlePrintReceipt = async (recordToPrint?: any, includeHeader: boolean = true) => {
    const target = recordToPrint || savedRecord;
    if (!target?._id) return;

    // Print PDF using the exact same duplex PDF generated for Download
    const pdfUrl = getApiUrl(
      `/api/admin/registrations/${target._id}/receipt-pdf?header=${includeHeader}&autoprint=true&t=${Date.now()}`,
    );
    await printPdfDirect(pdfUrl);
  };
  const generateBottleLabelHTML = (
    record: any,
    _rotation: any = 0,
    isPreview = false,
    includeAutoPrint = false,
  ) => {
    const pageW = "50mm";
    const pageH = "15mm";

    const patientId = (record.registrationNumber || record.patientId || "").toUpperCase().trim();
    const patientName = (record.patientName || "").toUpperCase().trim() || "PATIENT";
    const ageVal = record.age?.value || "";
    let ageType = "Y";
    if (record.age?.type) {
      ageType = record.age.type.toLowerCase().startsWith("y")
        ? "Y"
        : record.age.type.substring(0, 1).toUpperCase();
    }
    const ageDisplay = ageVal ? `${ageVal} ${ageType}` : "N/A";
    const genderDisplay = (record.gender || "N/A").toUpperCase();

    // Dynamic scaling for name (+2px larger: base 8.0px)
    const nameLen = patientName.length;
    let nameFontSize = "7.2px";
    if (nameLen > 28) {
      nameFontSize = "6.2px";
    } else if (nameLen > 20) {
      nameFontSize = "6.8px";
    }

    // Extract all test names into a single unified list
    let rawTests: any[] = [];
    if (Array.isArray(record.tests) && record.tests.length > 0) {
      rawTests = record.tests;
    } else if (Array.isArray(record.testResults) && record.testResults.length > 0) {
      rawTests = record.testResults;
    }

    const testNamesList = rawTests
      .map((t: any) => {
        if (typeof t === "object" && t !== null) {
          return (t.testName || t.name || "").trim();
        }
        return String(t || "").trim();
      })
      .filter(Boolean);

    const uniqueTests = Array.from(new Set(testNamesList.length > 0 ? testNamesList : ["ROUTINE TEST"]));
    const testsJoined = uniqueTests.join(", ").toUpperCase();
    const testsLen = testsJoined.length;

    // Normal patients (1-4 tests): stays large at 6.0px
    // Extreme orders (10-13+ tests): automatically scales down to 4.0px with zero bottom cutoff
    let testFontSize = "6.0px";
    let testLineHeight = "1.15";
    if (testsLen > 180) {
      testFontSize = "4.0px";
      testLineHeight = "0.95";
    } else if (testsLen > 120) {
      testFontSize = "4.6px";
      testLineHeight = "1.02";
    } else if (testsLen > 70) {
      testFontSize = "5.2px";
      testLineHeight = "1.08";
    }

    const topPadding = testsLen > 180 ? "2.2mm" : testsLen > 70 ? "2.8mm" : "3.2mm";
    const rowMargin = testsLen > 180 ? "0.06mm" : "0.15mm";

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Sample Label - ${record.patientName || "Specimen"}</title>
  <style>
    @page {
      size: ${pageW} ${pageH};
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: #ffffff;
      color: #000000;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 5.0px;
      line-height: 1.1;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    ${isPreview
        ? `
      html {
        width: 50mm;
        height: 15mm;
        transform: scale(1.85);
        transform-origin: top left;
      }
      body {
        width: 50mm;
        height: 15mm;
      }
    `
        : `
      html, body {
        width: ${pageW};
        height: ${pageH};
      }
    `
      }
    .label-page {
      width: ${pageW};
      height: ${pageH};
      box-sizing: border-box;
      position: relative;
      page-break-after: avoid;
      break-after: avoid;
      page-break-inside: avoid;
      break-inside: avoid;
      overflow: hidden;
      background: #ffffff;
      font-size: 5.0px;
      line-height: 1.1;
      padding: 0;
      margin: 0;
    }
    .label-content {
      width: 48.5mm;
      box-sizing: border-box;
      text-align: left;
      font-size: 5.0px;
      line-height: 1.1;
      padding: ${topPadding} 0.8mm 0 0.8mm;
      margin: 0;
      background: #ffffff;
    }
    .label-row {
      width: 100%;
      box-sizing: border-box;
      display: flex;
      align-items: baseline;
      justify-content: flex-start;
      text-align: left;
      font-size: 5.0px;
      line-height: 1.1;
      margin: 0;
      padding: 0;
    }
    .name-row {
      white-space: nowrap;
      line-height: 1.1;
      margin: 0 0 ${rowMargin} 0;
      padding: 0;
    }
    .demo-row {
      white-space: nowrap;
      line-height: 1.1;
      margin: 0 0 ${rowMargin} 0;
      padding: 0;
      gap: 1.8mm;
    }
    .id-val {
      font-size: 6.2px;
      font-weight: 700;
      color: #000000;
      letter-spacing: 0.1px;
    }
    .test-row {
      display: block;
      width: 100%;
      line-height: ${testLineHeight};
      word-break: break-word;
      white-space: normal;
      margin: 0;
      padding: 0;
    }
    .lbl-key {
      font-size: 6.8px;
      font-weight: 700;
      color: #000000;
      letter-spacing: 0.05px;
      flex-shrink: 0;
      white-space: nowrap;
    }
    .test-key {
      font-size: 6.0px;
      font-weight: 700;
      color: #000000;
      letter-spacing: 0.05px;
    }
    .lbl-val {
      font-size: 7.2px;
      font-weight: 600;
      color: #000000;
    }
    .name-val {
      font-size: 8.0px;
      font-weight: 700;
      text-transform: uppercase;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 44mm;
    }
    .test-val {
      font-weight: 600;
      text-transform: uppercase;
      color: #000000;
      word-break: break-word;
      font-size: 6.0px;
    }
  </style>
</head>
<body>
  <div class="label-page">
    <div class="label-content">
      <!-- Line 1: N: Patient Name -->
      <div class="label-row name-row">
        <span class="lbl-key">N:</span>&nbsp;<span class="lbl-val name-val" style="font-size: ${nameFontSize};">${patientName}</span>
      </div>
      <!-- Line 2: ID, AGE, and G: -->
      <div class="label-row demo-row">
        <div><span class="lbl-key">ID:</span>&nbsp;<span class="lbl-val id-val">${patientId || "N/A"}</span></div>
        <div><span class="lbl-key">AGE:</span>&nbsp;<span class="lbl-val">${ageDisplay}</span></div>
        <div><span class="lbl-key">G:</span>&nbsp;<span class="lbl-val">${genderDisplay}</span></div>
      </div>
      <!-- Line 3: TT: All Test Names -->
      <div class="test-row">
        <span class="lbl-key test-key" style="font-size: ${testFontSize};">TT:</span>&nbsp;<span class="lbl-val test-val" style="font-size: ${testFontSize};">${testsJoined}</span>
      </div>
    </div>
  </div>
  ${!isPreview && includeAutoPrint ? `
  <script>
    window.onload = function() {
      window.focus();
      window.print();
    };
  </script>
  ` : ""}
</body>
</html>`;
  };

  const handlePrintLabels = (_overrideRotation?: any, recordToPrint?: any) => {
    const targetRecord = recordToPrint || savedRecord;
    if (!targetRecord) return;

    // Generate label HTML without opening any new tab
    const htmlContent = generateBottleLabelHTML(targetRecord, 0, false, false);

    // Print directly from current screen via hidden iframe
    let iframe = document.getElementById("label-print-iframe") as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "label-print-iframe";
      iframe.style.position = "fixed";
      iframe.style.top = "-9999px";
      iframe.style.left = "-9999px";
      iframe.style.width = "50mm";
      iframe.style.height = "15mm";
      iframe.style.border = "none";
      iframe.style.visibility = "hidden";
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.error("Sample Label print error:", e);
        }
      }, 150);
    }
  };

  const toggleTestSelection = (id: string) => {
    setSelectedTestIds((prev) =>
      prev.includes(id) ? prev.filter((tId) => tId !== id) : [...prev, id],
    );
  };

  const handleExportRegistrations = () => {
    const filtered = registrations.filter((reg) => {
      const query = patientSearchQuery.toLowerCase().trim();
      if (!query) return true;
      let isSampleMatch = false;
      if (query.startsWith("s") && query.length >= 10) {
        const sampleBody = query.substring(1, query.length - 1);
        const regDigitsClean = reg.registrationNumber
          ? reg.registrationNumber.replace(/[^0-9]/g, "")
          : "";
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
    });

    if (filtered.length === 0) {
      alert("No registration records match the search query to export");
      return;
    }

    const exportData = filtered.map((reg) => {
      const testNames =
        reg.tests && reg.tests.length > 0
          ? reg.tests
            .map((t: any) =>
              typeof t === "string" ? t : t.testName || t.name,
            )
            .join(", ")
          : "No tests";

      return {
        "Registration No": reg.registrationNumber || "",
        Date: reg.registrationDate || "",
        Time: reg.registrationTime || "",
        "Patient Name": reg.patientName || "",
        Age: reg.age ? `${reg.age.value} ${reg.age.type}` : "",
        Gender: reg.gender || "",
        "Mobile Number": reg.mobileNumber || "",
        Address: reg.address || "",
        State: reg.location?.state || "",
        District: reg.location?.district || "",
        "City/Area": reg.location?.city || "",
        "Referred By": reg.referredBy || "",
        "Sample Drawn By": reg.sampleDrawnBy || "",
        "Referral Mode": reg.referralMode || "",
        "Selected Lab": reg.selectedLab || "",
        "Tests Prescribed": testNames,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

    // Write to browser
    XLSX.writeFile(workbook, "patient_registrations.xlsx");
  };

  // Fetch doctors and staff
  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const docRes = await fetch(getApiUrl("/api/admin/doctors"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const docData = await docRes.json();
        if (docData.success) setDoctors(docData.data);

        const staffRes = await fetch(getApiUrl("/api/admin/admins"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const staffData = await staffRes.json();
        if (staffData.success) setStaff(staffData.data);

        const hospRes = await fetch(getApiUrl("/api/admin/hospitals"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const hospData = await hospRes.json();
        if (hospData.success) setHospitals(hospData.data);
      } catch (err) {
        console.error("Failed to load master records", err);
      } finally {
        setIsLoadingMaster(false);
      }
    };
    fetchMaster();
    fetchRegistrations();
    fetchSamples();
    fetchNextPatientId();

    // Fetch user role
    const storedUser = localStorage.getItem("adminUser");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserRole(parsed.role || "admin");
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Live date-time updates
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const d = String(now.getDate()).padStart(2, "0");
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const y = now.getFullYear();
      setLiveDate(`${d}-${m}-${y}`);

      let h = now.getHours();
      const min = String(now.getMinutes()).padStart(2, "0");
      const sec = String(now.getSeconds()).padStart(2, "0");
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      setLiveTime(`${String(h).padStart(2, "0")}:${min}:${sec} ${ampm}`);
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
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
      ) {
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
          if (
            cleaned.toUpperCase().startsWith("REG-") ||
            cleaned.toUpperCase().startsWith("S0")
          ) {
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

  // Clear any legacy registration draft on mount
  useEffect(() => {
    try {
      localStorage.removeItem("medoraa_registration_draft");
    } catch {}
  }, []);

  // Validation checks
  const isMobileValid = /^\d{10}$/.test(formData.mobileNumber);
  const isAgeValid =
    formData.age.value !== "" && Number(formData.age.value) > 0;
  const isNameValid = formData.patientName.trim() !== "";
  const isReferralValid =
    (formData.referralMode || "Self") === "Self"
      ? true
      : (formData.selectedHospital || "").trim() !== "" &&
      (formData.selectedDoctor || "").trim() !== "";

  const transport = formData.sampleReceived;
  const isTransportValid = (() => {
    if (!transport) return false;
    if (transport.receivedThrough === "None") return true;
    if (transport.receivedThrough === "Employee") {
      const emp = transport.employee || {};
      const isEmpMobileValid =
        !emp.mobileNumber || /^\d{10}$/.test(emp.mobileNumber);
      return (
        (emp.name || "").trim() !== "" &&
        (emp.id || "").trim() !== "" &&
        isEmpMobileValid
      );
    }
    if (transport.receivedThrough === "Person") {
      const per = transport.person || {};
      return (
        (per.name || "").trim() !== "" &&
        /^\d{10}$/.test(per.mobileNumber || "") &&
        (per.relationship || "").trim() !== ""
      );
    }
    if (transport.receivedThrough === "Courier") {
      const cour = transport.courier || {};
      return (cour.companyName || "").trim() !== "";
    }
    if (transport.receivedThrough === "Transfer") {
      const tr = transport.transfer || {};
      return (tr.labName || "").trim() !== "";
    }
    if (transport.receivedThrough === "Bus") {
      const b = transport.bus || {};
      const isCondMobileValid =
        !b.conductorMobileNumber || /^\d{10}$/.test(b.conductorMobileNumber);
      return (
        (b.busNumber || "").trim() !== "" &&
        (b.busServiceName || "").trim() !== "" &&
        /^\d{10}$/.test(b.driverMobileNumber || "") &&
        isCondMobileValid
      );
    }
    return false;
  })();

  const isFormValid =
    isNameValid &&
    isAgeValid &&
    isMobileValid &&
    isReferralValid &&
    isTransportValid;

  // Populate form fields from a saved registration record
  const populateFormFromRecord = (record: any) => {
    if (!record) return;

    const refVal = record.referredBy || "Self";
    let referralMode: "Self" | "Hospital" = "Self";
    let selectedLab = "";
    let selectedHospital = "";
    let selectedDoctor = "";

    if (refVal.startsWith("Self")) {
      referralMode = "Self";
      const startIndex = refVal.indexOf("(");
      const endIndex = refVal.lastIndexOf(")");
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        const labInside = refVal.slice(startIndex + 1, endIndex);
        selectedLab = labInside === "Medoraa Labs (Our Lab)" ? "" : labInside;

        // Parse hospital name if present in the lab name, e.g. "Apollo Lab (Apollo Hospital)"
        const labOpenParen = selectedLab.lastIndexOf(" (");
        const labCloseParen = selectedLab.lastIndexOf(")");
        if (
          labOpenParen !== -1 &&
          labCloseParen !== -1 &&
          labCloseParen > labOpenParen
        ) {
          selectedHospital = selectedLab
            .slice(labOpenParen + 2, labCloseParen)
            .trim();
        }
      }
    } else {
      referralMode = "Hospital";
      const lastOpenParen = refVal.lastIndexOf(" (");
      const lastCloseParen = refVal.lastIndexOf(")");
      if (
        lastOpenParen !== -1 &&
        lastCloseParen !== -1 &&
        lastCloseParen > lastOpenParen
      ) {
        selectedDoctor = refVal.slice(0, lastOpenParen).trim();
        selectedHospital = refVal
          .slice(lastOpenParen + 2, lastCloseParen)
          .trim();
      } else {
        selectedDoctor = refVal;
      }
    }

    setFormData({
      location: record.location || { state: "", district: "", city: "" },
      patientName: record.patientName || "",
      age: record.age || { value: "", type: "Years" },
      gender: record.gender || "Male",
      mobileNumber: record.mobileNumber || "",
      address: record.address || "",
      referredBy: record.referredBy || "Self",
      sampleDrawnBy: record.sampleDrawnBy || "",
      referralMode: referralMode,
      selectedLab: selectedLab,
      selectedHospital: selectedHospital,
      selectedDoctor: selectedDoctor,
      sampleReceived: record.sampleReceived || {
        receivedThrough: "None",
        transfer: { labName: "None" },
        employee: {
          name: "",
          id: "",
          mobileNumber: "",
          department: "",
          designation: "",
          dateReceived: "",
          timeReceived: "",
          remarks: "",
        },
        person: {
          name: "",
          mobileNumber: "",
          relationship: "",
          address: "",
          idProofType: "Aadhaar",
          idProofNumber: "",
          dateReceived: "",
          timeReceived: "",
          remarks: "",
        },
        courier: {
          companyName: "",
          trackingNumber: "",
          orderNumber: "",
          contactNumber: "",
          pickupLocation: "",
          arrivalDate: "",
          arrivalTime: "",
          receivedByEmployee: "",
          packageCondition: "Good",
          remarks: "",
        },
        bus: {
          busNumber: "",
          busServiceName: "",
          driverName: "",
          driverMobileNumber: "",
          conductorName: "",
          conductorMobileNumber: "",
          originLocation: "",
          destinationLocation: "",
          arrivalDate: "",
          arrivalTime: "",
          receivedByEmployee: "",
          packageCondition: "Good",
          remarks: "",
        },
      },
    });
  };

  // Core form reset logic
  const resetFormFields = (keepOpen = false) => {
    setFormData({
      location: { state: "", district: "", city: "" },
      patientName: "",
      age: { value: "", type: "Years" },
      gender: "Male",
      mobileNumber: "",
      address: "",
      referredBy: "Self",
      sampleDrawnBy: "",
      referralMode: "Self",
      selectedLab: "",
      selectedHospital: "",
      selectedDoctor: "",
      sampleReceived: {
        receivedThrough: "None",
        transfer: { labName: "None" },
        employee: {
          name: "",
          id: "",
          mobileNumber: "",
          department: "",
          designation: "",
          dateReceived: "",
          timeReceived: "",
          remarks: "",
        },
        person: {
          name: "",
          mobileNumber: "",
          relationship: "",
          address: "",
          idProofType: "Aadhaar",
          idProofNumber: "",
          dateReceived: "",
          timeReceived: "",
          remarks: "",
        },
        courier: {
          companyName: "",
          trackingNumber: "",
          orderNumber: "",
          contactNumber: "",
          pickupLocation: "",
          arrivalDate: "",
          arrivalTime: "",
          receivedByEmployee: "",
          packageCondition: "Good",
          remarks: "",
        },
        bus: {
          busNumber: "",
          busServiceName: "",
          driverName: "",
          driverMobileNumber: "",
          conductorName: "",
          conductorMobileNumber: "",
          originLocation: "",
          destinationLocation: "",
          arrivalDate: "",
          arrivalTime: "",
          receivedByEmployee: "",
          packageCondition: "Good",
          remarks: "",
        },
      },
    });

    try {
      localStorage.removeItem("medoraa_registration_draft");
    } catch {}
    setIsDraftRestored(false);
    setSavedRecord(null);
    setIsExistingPatientLoaded(false);
    setSelectedTestIds([]);
    setDiscountVal("0");
    setDiscountType("percentage");
    setPaymentMethod("Cash");
    setPaidAmountInput("");
    setCustomPaymentMethod("");
    setShowForm(keepOpen);

    // Fetch and assign next patient ID
    fetchNextPatientId();
  };

  // Reset handler with user confirmation
  const handleReset = () => {
    if (
      confirm(
        "Are you sure you want to reset the form? This will clear all input fields.",
      )
    ) {
      resetFormFields(true);
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

      const referredByValue =
        (formData.referralMode || "Self") === "Hospital"
          ? `${formData.selectedDoctor || ""} (${formData.selectedHospital || ""})`
          : formData.selectedLab && formData.selectedLab !== "Medoraa Labs (Our Lab)"
            ? `Self (${formData.selectedLab})`
            : "Self";

      // Clean up sampleReceived depending on what is selected
      const cleanedSampleReceived = { ...formData.sampleReceived };
      if (cleanedSampleReceived.receivedThrough === "Transfer") {
        delete (cleanedSampleReceived as any).employee;
        delete (cleanedSampleReceived as any).person;
        delete (cleanedSampleReceived as any).courier;
        delete (cleanedSampleReceived as any).bus;
      } else {
        delete (cleanedSampleReceived as any).transfer;
        if (cleanedSampleReceived.receivedThrough === "None") {
          delete (cleanedSampleReceived as any).employee;
          delete (cleanedSampleReceived as any).person;
          delete (cleanedSampleReceived as any).courier;
          delete (cleanedSampleReceived as any).bus;
        } else if (cleanedSampleReceived.receivedThrough === "Courier") {
          delete (cleanedSampleReceived as any).employee;
          delete (cleanedSampleReceived as any).person;
          delete (cleanedSampleReceived as any).bus;
        }
      }

      const payload = {
        ...formData,
        referredBy: referredByValue,
        sampleReceived: cleanedSampleReceived,
      };

      const res = await fetch(getApiUrl("/api/admin/registrations"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        // Clear draft & refresh patient list and next ID
        localStorage.removeItem("medoraa_registration_draft");
        setIsDraftRestored(false);
        setSavedRecord(data.data);
        fetchRegistrations();
        fetchNextPatientId();

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

  const handleAddNewStaff = async () => {
    if (!newStaffData.name.trim()) {
      alert("Name is required");
      return;
    }
    if (!newStaffData.email.trim()) {
      alert("Email is required");
      return;
    }
    if (!newStaffData.password.trim()) {
      alert("Password is required");
      return;
    }
    if (
      newStaffData.mobileNumber &&
      newStaffData.mobileNumber.replace(/\D/g, "").length !== 10
    ) {
      alert("Mobile number must be exactly 10 digits");
      return;
    }

    setIsSavingStaff(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(getApiUrl("/api/admin/admins"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newStaffData.name,
          role: newStaffData.role,
          email: newStaffData.email,
          mobileNumber: newStaffData.mobileNumber,
          password: newStaffData.password,
          status: "active",
        }),
      });
      const data = await res.json();
      if (data.success) {
        const newlyAdded = data.data;
        setStaff((prev) => [...prev, newlyAdded]);
        const label = `${newlyAdded.name} (${newlyAdded.role || "Staff"})`;
        setFormData((prev) => ({ ...prev, sampleDrawnBy: label }));
        setIsAddingStaff(false);
        setNewStaffData({
          name: "",
          role: "registration",
          email: "",
          mobileNumber: "",
          password: "",
        });
      } else {
        alert(data.message || "Failed to add staff");
      }
    } catch (err: any) {
      console.error("Add staff failed", err);
      alert(err.message || "An error occurred while adding staff");
    } finally {
      setIsSavingStaff(false);
    }
  };

  // Doctor options helper
  const doctorOptions = [
    "Self",
    ...doctors.map(
      (d) =>
        `${d.doctorName} (Ref: ${d.doctorCode || d._id.slice(-4).toUpperCase()})`,
    ),
  ];
  const staffOptions = [
    ...(formData.selectedHospital && formData.selectedHospital !== "Self"
      ? [`Drawn at ${formData.selectedHospital}`]
      : ["Drawn at Hospital / Outside Clinic"]),
    ...staff.map((s) => `${s.name} (${s.role || "Staff"})`),
  ];
  const labOptions = [
    ...hospitals.flatMap((h) =>
      (h.labs || []).map((l: any) => `${l.labName} (${h.hospitalName})`),
    ),
  ];
  const referredByOptions =
    formData.selectedHospital && formData.selectedHospital !== "Self"
      ? [
        // Filtered labs (without hospital name)
        ...hospitals
          .filter((h) => h.hospitalName === formData.selectedHospital)
          .flatMap((h) => (h.labs || []).map((l: any) => l.labName)),
        // Filtered doctors (without hospital name)
        ...doctors
          .filter((d) => {
            const docHosp =
              typeof d.hospitalId === "object"
                ? d.hospitalId?.hospitalName
                : d.hospitalId;
            return docHosp === formData.selectedHospital;
          })
          .map((d) => {
            const refCode = d.doctorCode || d._id.slice(-4).toUpperCase();
            if (
              d.affiliationType === "LAB" &&
              d.labId &&
              typeof d.labId === "object"
            ) {
              return `${d.doctorName} (Ref: ${refCode}) (Lab: ${d.labId.labName})`;
            }
            return `${d.doctorName} (Ref: ${refCode})`;
          }),
      ]
      : [
        "Self",
        // All labs (with hospital name)
        ...hospitals.flatMap((h) =>
          (h.labs || []).map((l: any) => `${l.labName} (${h.hospitalName})`),
        ),
        // All doctors (with hospital/lab name)
        ...doctors.map((d) => {
          const refCode = d.doctorCode || d._id.slice(-4).toUpperCase();
          const hospName =
            (typeof d.hospitalId === "object"
              ? d.hospitalId?.hospitalName
              : d.hospitalId) || "Independent";
          if (
            d.affiliationType === "LAB" &&
            d.labId &&
            typeof d.labId === "object"
          ) {
            return `${d.doctorName} (Ref: ${refCode}) (${d.labId.labName})`;
          }
          return `${d.doctorName} (Ref: ${refCode}) (${hospName})`;
        }),
      ];

  const currentReferredBy = (() => {
    if ((formData.referralMode || "Self") === "Self") {
      if (
        !formData.selectedLab ||
        formData.selectedLab === "Medoraa Labs (Our Lab)"
      ) {
        return "Self";
      }
      if (formData.selectedHospital && formData.selectedHospital !== "Self") {
        const suffix = ` (${formData.selectedHospital})`;
        if (formData.selectedLab && formData.selectedLab.endsWith(suffix)) {
          return formData.selectedLab.slice(0, -suffix.length);
        }
      }
      return formData.selectedLab || "Self";
    }
    if (formData.selectedHospital && formData.selectedHospital !== "Self") {
      return formData.selectedDoctor || "";
    } else {
      const doc = doctors.find(
        (d) =>
          `${d.doctorName} (Ref: ${d.doctorCode || d._id.slice(-4).toUpperCase()})` ===
          formData.selectedDoctor,
      );
      if (doc) {
        return `${doc.doctorName} (Ref: ${doc.doctorCode || doc._id.slice(-4).toUpperCase()}) (${doc.hospitalId?.hospitalName || "Independent"})`;
      }
      return formData.selectedDoctor || "";
    }
  })();

  const handleReferredByChange = (val: string) => {
    if (val === "Self" || val === "Medoraa Labs (Our Lab)") {
      setFormData((prev) => ({
        ...prev,
        selectedHospital: "Self",
        selectedDoctor: "Self",
        referralMode: "Self",
        selectedLab: "",
      }));
    } else {
      if (formData.selectedHospital && formData.selectedHospital !== "Self") {
        const selectedHospRecord = hospitals.find(
          (h) => h.hospitalName === formData.selectedHospital,
        );
        const isLab = (selectedHospRecord?.labs || []).some(
          (l: any) => l.labName === val,
        );

        if (isLab) {
          setFormData((prev) => ({
            ...prev,
            selectedDoctor: "Self",
            referralMode: "Self",
            selectedLab: `${val} (${prev.selectedHospital})`,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            selectedDoctor: val,
            referralMode: "Hospital",
            selectedLab: "",
          }));
        }
      } else {
        if (val.includes("(") && val.endsWith(")") && !val.includes("(Ref:")) {
          const startIndex = val.indexOf("(");
          const endIndex = val.lastIndexOf(")");
          let hospitalName = "";
          if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
            hospitalName = val.slice(startIndex + 1, endIndex).trim();
          }
          setFormData((prev) => ({
            ...prev,
            selectedHospital: hospitalName,
            selectedDoctor: "Self",
            referralMode: "Self",
            selectedLab: val,
          }));
        } else {
          const doc = doctors.find(
            (d) =>
              `${d.doctorName} (Ref: ${d.doctorCode || d._id.slice(-4).toUpperCase()}) (${d.hospitalId?.hospitalName || "Independent"})` ===
              val,
          );
          const docFormatted = doc
            ? `${doc.doctorName} (Ref: ${doc.doctorCode || doc._id.slice(-4).toUpperCase()})`
            : val;
          const hospitalName = doc?.hospitalId?.hospitalName || "";
          setFormData((prev) => ({
            ...prev,
            selectedHospital: hospitalName,
            selectedDoctor: docFormatted,
            referralMode: "Hospital",
            selectedLab: "",
          }));
        }
      }
    }
  };

  return (
    <div className="font-sans pb-6 dark:text-slate-100">
      {showTestSelection && savedRecord ? (
        <div className="-mx-8 -my-8 print:hidden animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 w-full overflow-hidden flex flex-col h-screen">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Select Tests / Samples for {savedRecord.patientName}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Registration No: {savedRecord.registrationNumber} | Referrer:{" "}
                  {savedRecord.referredBy}
                </p>
              </div>
              <button
                onClick={() => {
                  populateFormFromRecord(savedRecord);
                  setShowTestSelection(false);
                  setShowForm(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-655 dark:text-slate-355 cursor-pointer text-xs font-bold shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Form
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
              {/* Left Sidebar: Categories / Organs */}
              <div className="w-full lg:w-52 bg-slate-50 dark:bg-slate-950/40 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 flex flex-col shrink-0">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex bg-slate-200/60 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200/40 dark:border-slate-700/50">
                    <button
                      onClick={() => {
                        setSidebarView("category");
                        setSelectedCategory("All");
                        setSelectedOrgan("All");
                      }}
                      className={cn(
                        "flex-1 py-1.5 text-[9px] font-black uppercase rounded-md transition-all cursor-pointer",
                        sidebarView === "category"
                          ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm font-bold"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-350",
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
                        "flex-1 py-1.5 text-[9px] font-black uppercase rounded-md transition-all cursor-pointer",
                        sidebarView === "organ"
                          ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm font-bold"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-350",
                      )}
                    >
                      Organs
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-x-auto lg:overflow-y-auto p-2 flex flex-row lg:flex-col gap-1.5 lg:space-y-1 no-scrollbar shrink-0 lg:shrink">
                  {sidebarView === "category"
                    ? [
                      "All",
                      ...Array.from(
                        new Set(
                          availableSamples
                            .map((s) => s.category || "General")
                            .filter((c) => c && c !== "-"),
                        ),
                      ),
                    ].map((cat) => {
                      const catCount = availableSamples.filter(
                        (s) =>
                          (s.category || "General") === cat && cat !== "All",
                      ).length;
                      const isSelected = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={cn(
                            "w-auto lg:w-full shrink-0 text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer whitespace-nowrap gap-1.5",
                            isSelected
                              ? "bg-blue-600 text-white shadow-md shadow-blue-600/15"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400",
                          )}
                        >
                          <span className="truncate text-left">{cat}</span>
                          {cat !== "All" && (
                            <span
                              className={cn(
                                "text-[9px] px-1.5 py-0.5 rounded-full shrink-0 font-bold ml-1.5",
                                isSelected
                                  ? "bg-blue-700 text-white"
                                  : "bg-slate-200 dark:bg-slate-850 text-slate-500",
                              )}
                            >
                              {catCount}
                            </span>
                          )}
                        </button>
                      );
                    })
                    : [
                      "All",
                      ...Array.from(
                        new Set(
                          availableSamples
                            .map((s) => s.organ)
                            .filter(Boolean)
                            .filter((o) => o && o !== "-"),
                        ),
                      ),
                    ].map((org) => {
                      const orgCount = availableSamples.filter(
                        (s) => s.organ === org && org !== "All",
                      ).length;
                      const isSelected = selectedOrgan === org;
                      return (
                        <button
                          key={org}
                          onClick={() => setSelectedOrgan(org)}
                          className={cn(
                            "w-auto lg:w-full shrink-0 text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer whitespace-nowrap gap-1.5",
                            isSelected
                              ? "bg-blue-600 text-white shadow-md shadow-blue-600/15"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400",
                          )}
                        >
                          <span className="truncate text-left">{org}</span>
                          {org !== "All" && (
                            <span
                              className={cn(
                                "text-[9px] px-1.5 py-0.5 rounded-full shrink-0 font-bold ml-1.5",
                                isSelected
                                  ? "bg-blue-700 text-white"
                                  : "bg-slate-200 dark:bg-slate-850 text-slate-500",
                              )}
                            >
                              {orgCount}
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
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Loading Catalog...
                      </span>
                    </div>
                  ) : availableSamples.filter((sample) => {
                    const matchesSearch =
                      (sample.testName || "")
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      (sample.organ || "")
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      (sample.category || "")
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase());
                    const matchesCategory =
                      selectedCategory === "All" ||
                      (sample.category || "General") === selectedCategory;
                    const matchesOrgan =
                      selectedOrgan === "All" ||
                      sample.organ === selectedOrgan;
                    return matchesSearch && matchesCategory && matchesOrgan;
                  }).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                      <Activity className="w-10 h-10 text-slate-300 mb-2" />
                      <p className="text-xs font-bold text-slate-500">
                        No tests found matching search criteria.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableSamples
                        .filter((sample) => {
                          const matchesSearch =
                            (sample.testName || "")
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            (sample.organ || "")
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            (sample.category || "")
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase());
                          const matchesCategory =
                            selectedCategory === "All" ||
                            (sample.category || "General") === selectedCategory;
                          const matchesOrgan =
                            selectedOrgan === "All" ||
                            sample.organ === selectedOrgan;
                          return (
                            matchesSearch && matchesCategory && matchesOrgan
                          );
                        })
                        .map((sample) => {
                          const isSelected = selectedTestIds.includes(
                            sample._id,
                          );
                          return (
                            <div
                              key={sample._id}
                              onClick={() => toggleTestSelection(sample._id)}
                              className={cn(
                                "p-4 bg-white dark:bg-slate-900 border rounded-2xl cursor-pointer hover:shadow-md transition-all flex justify-between items-start gap-4 select-none group relative overflow-hidden",
                                isSelected
                                  ? "border-blue-500 ring-2 ring-blue-500/10 dark:bg-slate-900"
                                  : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700",
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
                                  {sample.container && sample.container !== "-" && (
                                    <span className="px-2 py-0.5 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-[8px] font-extrabold uppercase tracking-wide rounded border border-teal-200/60 dark:border-teal-800/60">
                                      Container: {sample.container}
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight truncate font-bold">
                                  {sample.testName}
                                </h4>
                                <div className="flex items-center gap-3 text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                                  <span>Method: {sample.method || "-"}</span>
                                  <span>•</span>
                                  <span>
                                    Sample Used: {sample.sampleUsedForTest || "-"}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right shrink-0 flex flex-col items-end justify-between h-full min-h-[50px]">
                                <span className="text-xs font-black text-slate-900 dark:text-white">
                                  ₹{parseFloat(sample.patientPrice) || 0}
                                </span>
                                <div
                                  className={cn(
                                    "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                                    isSelected
                                      ? "bg-blue-600 border-blue-600 text-white"
                                      : "border-slate-300 dark:border-slate-600 group-hover:border-blue-400",
                                  )}
                                >
                                  {isSelected && (
                                    <Check className="w-2.5 h-2.5" />
                                  )}
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
              <div className="w-full lg:w-72 h-48 lg:h-auto bg-white dark:bg-slate-950/20 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 flex flex-col shrink-0 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Selected Investigations
                  </span>
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1 uppercase truncate">
                    {
                      availableSamples.filter((s) =>
                        selectedTestIds.includes(s._id),
                      ).length
                    }{" "}
                    tests added
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                  {availableSamples.filter((s) =>
                    selectedTestIds.includes(s._id),
                  ).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-12">
                      <ShoppingCart className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="text-[10px] font-bold uppercase tracking-wider">
                        No tests selected yet
                      </p>
                    </div>
                  ) : (
                    availableSamples
                      .filter((s) => selectedTestIds.includes(s._id))
                      .map((t) => (
                        <div
                          key={t._id}
                          className="p-2.5 bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-800 dark:text-slate-200 truncate uppercase tracking-tight">
                              {t.testName}
                            </p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 truncate">
                              {t.category}
                              {t.container && t.container !== "-" ? ` • ${t.container}` : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-extrabold text-slate-900 dark:text-white">
                              ₹{t.patientPrice}
                            </span>
                            <button
                              onClick={() => toggleTestSelection(t._id)}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 space-y-3.5 shrink-0">
                  {(() => {
                    const subtotal = availableSamples
                      .filter((s) => selectedTestIds.includes(s._id))
                      .reduce(
                        (sum, s) => sum + (parseFloat(s.patientPrice) || 0),
                        0,
                      );
                    const rawDiscount = parseFloat(discountVal) || 0;
                    const calculatedDiscount =
                      discountType === "percentage"
                        ? (subtotal * rawDiscount) / 100
                        : rawDiscount;
                    const finalDiscount = Math.min(
                      subtotal,
                      Math.max(0, calculatedDiscount),
                    );
                    const totalPayable = Math.max(0, subtotal - finalDiscount);
                    const isUpi = paymentMethod === "UPI";

                    return (
                      <div className="space-y-3 font-sans">
                        {/* Subtotal */}
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                          <span>Subtotal</span>
                          <span className="text-slate-800 dark:text-slate-200">
                            ₹{subtotal}
                          </span>
                        </div>

                        {/* Discount Input */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Discount (%)
                            </label>
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                              % Off
                            </span>
                          </div>
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="e.g. 10"
                              value={discountVal}
                              onChange={(e) => setDiscountVal(e.target.value)}
                              className="w-full px-2.5 py-1 pr-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="absolute right-2.5 text-xs font-black text-slate-400 pointer-events-none">
                              %
                            </span>
                          </div>
                        </div>

                        {/* Total Payable */}
                        <div className="flex items-center justify-between text-sm font-black border-t border-dashed border-slate-200 dark:border-slate-800 pt-2">
                          <span className="text-slate-900 dark:text-white uppercase tracking-wider">
                            Total Payable
                          </span>
                          <span className="text-blue-600 dark:text-blue-400 text-lg font-black">
                            ₹{totalPayable.toFixed(0)}
                          </span>
                        </div>

                        {/* Payment Method Section */}
                        <div className="space-y-1.5 pt-1">
                          <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                            Payment Method
                          </label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                          >
                            <option value="Cash">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="Self">Self</option>
                            <option value="Other">Other / Custom</option>
                          </select>

                          {/* If Other selected, custom input field */}
                          {paymentMethod === "Other" && (
                            <input
                              type="text"
                              placeholder="Enter payment method..."
                              value={customPaymentMethod}
                              onChange={(e) =>
                                setCustomPaymentMethod(e.target.value)
                              }
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-500 mt-1"
                            />
                          )}
                        </div>

                        {/* Paid Amount and Due Amount (Auto-Calculated) */}
                        {(() => {
                          const currentPaid =
                            paidAmountInput.trim() !== ""
                              ? parseFloat(paidAmountInput) || 0
                              : totalPayable;
                          const calculatedDue = Math.max(0, totalPayable - currentPaid);

                          return (
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                                  Paid (₹)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max={totalPayable}
                                  placeholder={totalPayable.toFixed(0)}
                                  value={paidAmountInput}
                                  onChange={(e) => setPaidAmountInput(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700/60 rounded-lg text-xs font-black text-emerald-600 dark:text-emerald-400 outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <label className="text-[10px] font-extrabold text-rose-500 dark:text-rose-400 uppercase tracking-wider block">
                                    Due (₹)
                                  </label>
                                  {calculatedDue > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPaidAmountInput(String(totalPayable));
                                      }}
                                      className="text-[9px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                                    >
                                      Clear Due
                                    </button>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (savedRecord) {
                                      setDueModalRecord(savedRecord);
                                      setIsDueModalOpen(true);
                                    } else if (calculatedDue > 0) {
                                      setPaidAmountInput(String(totalPayable));
                                    }
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-rose-50/80 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-black text-rose-600 dark:text-rose-400 flex items-center justify-between transition-all cursor-pointer text-left"
                                  title={savedRecord ? "Click to open Payment / Due update popup" : "Click to clear due (pay full)"}
                                >
                                  <span>₹{calculatedDue.toFixed(0)}</span>
                                  {calculatedDue > 0 ? (
                                    <span className="text-[9px] bg-rose-200 hover:bg-rose-300 dark:bg-rose-900/70 text-rose-700 dark:text-rose-200 px-1.5 py-0.5 rounded font-extrabold flex items-center gap-1">
                                      <CreditCard className="w-2.5 h-2.5" />
                                      {savedRecord ? "Update Due" : "DUE"}
                                    </span>
                                  ) : (
                                    <span className="text-[9px] text-emerald-600 font-extrabold">PAID</span>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Display UPI QR Code when UPI selected */}
                        {isUpi && (
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center gap-2 text-center shadow-xs">
                              <div className="flex items-center justify-between w-full">
                                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                                  <QrCode className="w-3.5 h-3.5" />
                                  Scan UPI QR to Pay
                                </span>
                                {adminQrCode && (
                                  <button
                                    type="button"
                                    onClick={() => setIsQrModalOpen(true)}
                                    className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                    title="Open QR in Popup"
                                  >
                                    <Maximize2 className="w-3 h-3" />
                                    Popup
                                  </button>
                                )}
                              </div>

                              {adminQrCode ? (
                                <div
                                  onClick={() => setIsQrModalOpen(true)}
                                  className="group relative cursor-pointer overflow-hidden rounded-lg border border-slate-100 dark:border-slate-800 hover:ring-2 hover:ring-blue-500 transition-all"
                                >
                                  <img
                                    src={adminQrCode}
                                    alt="UPI QR Code"
                                    className="w-36 h-36 object-contain"
                                  />
                                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-[10px] gap-1">
                                    <Maximize2 className="w-3.5 h-3.5" /> Click
                                    to Enlarge
                                  </div>
                                </div>
                              ) : (
                                <div className="py-3 px-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                                  No QR Code uploaded by Admin yet. Admin can
                                  upload QR in Payment QR Code settings.
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <button
                onClick={() => {
                  if (
                    confirm(
                      "Skip test selection? You can print receipt without tests.",
                    )
                  ) {
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
                    : "bg-transparent text-slate-300 dark:text-slate-700 border-slate-200 dark:border-slate-800 cursor-not-allowed",
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
      ) : !showForm ? (
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
                Manage registered patients, investigations, barcodes, and
                billing slips.
              </p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              {userRole === "admin" && (
                <button
                  onClick={handleExportRegistrations}
                  className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold rounded-lg text-xs text-slate-700 dark:text-slate-350 transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Export Excel</span>
                </button>
              )}
              <button
                onClick={handleDeleteAllRegistrations}
                disabled={isDeletingAll || registrations.length === 0}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-bold rounded-lg text-xs transition-all active:scale-95 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Permanently delete all patient registrations"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingAll ? "Deleting..." : "Delete All"}</span>
              </button>
              <button
                onClick={() => {
                  resetFormFields(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg text-xs transition-all active:scale-95 shadow-md cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ New Registration</span>
              </button>
            </div>
          </div>

          {/* Search & Filters Toolbar */}
          {(() => {
            const hasDueCount = registrations.filter((r) => {
              const t = r.billing?.totalAmount ?? r.totalAmount ?? 0;
              const p = r.billing?.paidAmount ?? r.paidAmount ?? 0;
              return t - p > 0;
            }).length;

            const paidCount = registrations.filter((r) => {
              const t = r.billing?.totalAmount ?? r.totalAmount ?? 0;
              const p = r.billing?.paidAmount ?? r.paidAmount ?? 0;
              return r.paymentStatus === "PAID" || (t > 0 && t - p <= 0);
            }).length;

            const pendingTestsCount = registrations.filter((r) => {
              const ent = r.testResults
                ? r.testResults.filter(
                    (t: any) =>
                      t.resultValue &&
                      String(t.resultValue).trim() !== "" &&
                      String(t.resultValue).trim() !== "—",
                  ).length
                : 0;
              const tot =
                r.testResults && r.testResults.length > 0
                  ? r.testResults.length
                  : r.tests
                    ? r.tests.length
                    : 0;
              return tot > 0 && ent < tot;
            }).length;

            const todayCount = registrations.filter((r) => {
              const d = getRegDateObj(r);
              if (!d) return false;
              const now = new Date();
              return (
                d.getFullYear() === now.getFullYear() &&
                d.getMonth() === now.getMonth() &&
                d.getDate() === now.getDate()
              );
            }).length;

            const activeFilterCount =
              (paymentFilter !== "ALL" ? 1 : 0) +
              (dateFilter !== "ALL" ? 1 : 0) +
              (referralFilter !== "ALL" ? 1 : 0) +
              (testStatusFilter !== "ALL" ? 1 : 0) +
              (genderFilter !== "ALL" ? 1 : 0) +
              (patientSearchQuery.trim() !== "" ? 1 : 0);

            return (
              <div className="space-y-3 bg-white dark:bg-slate-900 p-4 border border-slate-200/60 dark:border-slate-800 rounded-xl shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      id="patient-search-input"
                      type="text"
                      placeholder="Search by name, registration no, phone, doctor..."
                      value={patientSearchQuery}
                      onChange={(e) => setPatientSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Total:{" "}
                      <span className="text-slate-800 dark:text-slate-200 font-extrabold">
                        {registrations.length}
                      </span>
                    </div>
                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={resetAllFilters}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 cursor-pointer bg-rose-50 dark:bg-rose-950/40 px-2 py-1 rounded-md border border-rose-200 dark:border-rose-800 hover:scale-105 active:scale-95 transition-all"
                        title="Reset all filters and sorting"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Clear Filters ({activeFilterCount})</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Filters Pill Bar */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
                    <SlidersHorizontal className="w-3 h-3" /> Filters:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentFilter("ALL");
                      setDateFilter("ALL");
                      setTestStatusFilter("ALL");
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      paymentFilter === "ALL" && dateFilter === "ALL" && testStatusFilter === "ALL"
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                    )}
                  >
                    All ({registrations.length})
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPaymentFilter(paymentFilter === "HAS_DUE" ? "ALL" : "HAS_DUE")
                    }
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                      paymentFilter === "HAS_DUE"
                        ? "bg-rose-600 text-white shadow-xs font-black"
                        : "bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                    )}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    Has Due ({hasDueCount})
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPaymentFilter(paymentFilter === "PAID" ? "ALL" : "PAID")
                    }
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      paymentFilter === "PAID"
                        ? "bg-emerald-600 text-white shadow-xs font-black"
                        : "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    )}
                  >
                    Paid ({paidCount})
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setTestStatusFilter(testStatusFilter === "PENDING" ? "ALL" : "PENDING")
                    }
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      testStatusFilter === "PENDING"
                        ? "bg-amber-600 text-white shadow-xs font-black"
                        : "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                    )}
                  >
                    Pending Tests ({pendingTestsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDateFilter(dateFilter === "TODAY" ? "ALL" : "TODAY")
                    }
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      dateFilter === "TODAY"
                        ? "bg-blue-600 text-white shadow-xs font-black"
                        : "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                    )}
                  >
                    Today ({todayCount})
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Backdrop to close header filter popovers */}
          {openHeaderFilter && (
            <div
              className="fixed inset-0 z-40 bg-black/5"
              onClick={() => setOpenHeaderFilter(null)}
            />
          )}

          {/* Table Container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            {isLoadingRegistrations ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest animate-pulse">
                  Loading Directory...
                </span>
              </div>
            ) : registrations.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2 text-center">
                <span className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400">
                  <User className="w-8 h-8" />
                </span>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase mt-2">
                  No Registrations Found
                </h3>
                <p className="text-xs text-slate-400 font-semibold max-w-xs mt-1">
                  No patients registered yet. Click "+ New Registration" to
                  onboard your first patient.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/90 dark:bg-slate-800/70 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none">
                      {/* Column 1: Reg No & Date */}
                      <th className="px-6 py-3.5 relative">
                        <div className="flex items-center justify-between gap-1">
                          <span>Reg No &amp; Date</span>
                          <button
                            type="button"
                            onClick={() =>
                              setOpenHeaderFilter(
                                openHeaderFilter === "date" ? null : "date",
                              )
                            }
                            className={cn(
                              "p-1 rounded transition-colors cursor-pointer",
                              dateFilter !== "ALL" || sortOption.startsWith("DATE")
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 ring-1 ring-blue-400"
                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:hover:bg-slate-700/60",
                            )}
                            title="Filter & sort by date"
                          >
                            <Filter className="w-3 h-3" />
                          </button>
                        </div>
                        {openHeaderFilter === "date" && (
                          <div className="absolute left-4 top-full mt-1 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2.5 z-50 text-xs font-semibold text-slate-700 dark:text-slate-200 normal-case tracking-normal">
                            <div className="px-2 py-1 font-bold text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <span>Date Filter</span>
                              {dateFilter !== "ALL" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDateFilter("ALL");
                                    setCustomDate("");
                                  }}
                                  className="text-[10px] text-blue-600 hover:underline cursor-pointer lowercase"
                                >
                                  reset
                                </button>
                              )}
                            </div>
                            <div className="mt-1 space-y-0.5">
                              {[
                                { label: "All Dates", val: "ALL" },
                                { label: "📅 Today", val: "TODAY" },
                                { label: "Yesterday", val: "YESTERDAY" },
                                { label: "Last 7 Days", val: "LAST_7" },
                                { label: "This Month", val: "THIS_MONTH" },
                              ].map((opt) => (
                                <button
                                  key={opt.val}
                                  type="button"
                                  onClick={() => {
                                    setDateFilter(opt.val);
                                    setOpenHeaderFilter(null);
                                  }}
                                  className={cn(
                                    "w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer text-xs",
                                    dateFilter === opt.val
                                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold"
                                      : "hover:bg-slate-100 dark:hover:bg-slate-800",
                                  )}
                                >
                                  <span>{opt.label}</span>
                                  {dateFilter === opt.val && (
                                    <Check className="w-3.5 h-3.5 text-blue-600" />
                                  )}
                                </button>
                              ))}
                            </div>

                            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase block">
                                Custom Date
                              </label>
                              <input
                                type="date"
                                value={customDate}
                                onChange={(e) => {
                                  setCustomDate(e.target.value);
                                  if (e.target.value) {
                                    setDateFilter("CUSTOM");
                                  }
                                }}
                                className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>

                            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                              <div className="text-[10px] font-bold text-slate-400 uppercase px-1">
                                Sort Order
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSortOption("DATE_DESC");
                                  setOpenHeaderFilter(null);
                                }}
                                className={cn(
                                  "w-full text-left px-2 py-1 rounded-lg flex items-center justify-between text-[11px] cursor-pointer",
                                  sortOption === "DATE_DESC"
                                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-800",
                                )}
                              >
                                <span>Newest First</span>
                                {sortOption === "DATE_DESC" && (
                                  <Check className="w-3 h-3 text-blue-600" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSortOption("DATE_ASC");
                                  setOpenHeaderFilter(null);
                                }}
                                className={cn(
                                  "w-full text-left px-2 py-1 rounded-lg flex items-center justify-between text-[11px] cursor-pointer",
                                  sortOption === "DATE_ASC"
                                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-800",
                                )}
                              >
                                <span>Oldest First</span>
                                {sortOption === "DATE_ASC" && (
                                  <Check className="w-3 h-3 text-blue-600" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </th>

                      {/* Column 2: Patient Info */}
                      <th className="px-6 py-3.5 relative">
                        <div className="flex items-center justify-between gap-1">
                          <span>Patient Info</span>
                          <button
                            type="button"
                            onClick={() =>
                              setOpenHeaderFilter(
                                openHeaderFilter === "patient" ? null : "patient",
                              )
                            }
                            className={cn(
                              "p-1 rounded transition-colors cursor-pointer",
                              genderFilter !== "ALL" || sortOption.startsWith("NAME")
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 ring-1 ring-blue-400"
                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:hover:bg-slate-700/60",
                            )}
                            title="Filter gender & sort by name"
                          >
                            <Filter className="w-3 h-3" />
                          </button>
                        </div>
                        {openHeaderFilter === "patient" && (
                          <div className="absolute left-6 top-full mt-1 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2.5 z-50 text-xs font-semibold text-slate-700 dark:text-slate-200 normal-case tracking-normal">
                            <div className="px-2 py-1 font-bold text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <span>Gender Filter</span>
                              {genderFilter !== "ALL" && (
                                <button
                                  type="button"
                                  onClick={() => setGenderFilter("ALL")}
                                  className="text-[10px] text-blue-600 hover:underline cursor-pointer lowercase"
                                >
                                  reset
                                </button>
                              )}
                            </div>
                            <div className="mt-1 space-y-0.5">
                              {[
                                { label: "All Genders", val: "ALL" },
                                { label: "Male", val: "MALE" },
                                { label: "Female", val: "FEMALE" },
                                { label: "Other", val: "OTHER" },
                              ].map((opt) => (
                                <button
                                  key={opt.val}
                                  type="button"
                                  onClick={() => {
                                    setGenderFilter(opt.val);
                                    setOpenHeaderFilter(null);
                                  }}
                                  className={cn(
                                    "w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer",
                                    genderFilter === opt.val
                                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold"
                                      : "hover:bg-slate-100 dark:hover:bg-slate-800",
                                  )}
                                >
                                  <span>{opt.label}</span>
                                  {genderFilter === opt.val && (
                                    <Check className="w-3.5 h-3.5 text-blue-600" />
                                  )}
                                </button>
                              ))}
                            </div>
                            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                              <div className="text-[10px] font-bold text-slate-400 uppercase px-1">
                                Sort By Name
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSortOption("NAME_ASC");
                                  setOpenHeaderFilter(null);
                                }}
                                className={cn(
                                  "w-full text-left px-2 py-1 rounded-lg flex items-center justify-between text-[11px] cursor-pointer",
                                  sortOption === "NAME_ASC"
                                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-800",
                                )}
                              >
                                <span>A → Z (Alphabetical)</span>
                                {sortOption === "NAME_ASC" && (
                                  <Check className="w-3 h-3 text-blue-600" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSortOption("NAME_DESC");
                                  setOpenHeaderFilter(null);
                                }}
                                className={cn(
                                  "w-full text-left px-2 py-1 rounded-lg flex items-center justify-between text-[11px] cursor-pointer",
                                  sortOption === "NAME_DESC"
                                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-800",
                                )}
                              >
                                <span>Z → A (Reverse)</span>
                                {sortOption === "NAME_DESC" && (
                                  <Check className="w-3 h-3 text-blue-600" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </th>

                      {/* Column 3: Contact */}
                      <th className="px-6 py-3.5">Contact</th>

                      {/* Column 4: Referred By */}
                      <th className="px-6 py-3.5 relative">
                        <div className="flex items-center justify-between gap-1">
                          <span>Referred By</span>
                          <button
                            type="button"
                            onClick={() =>
                              setOpenHeaderFilter(
                                openHeaderFilter === "referral" ? null : "referral",
                              )
                            }
                            className={cn(
                              "p-1 rounded transition-colors cursor-pointer",
                              referralFilter !== "ALL"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 ring-1 ring-blue-400"
                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:hover:bg-slate-700/60",
                            )}
                            title="Filter by referral mode"
                          >
                            <Filter className="w-3 h-3" />
                          </button>
                        </div>
                        {openHeaderFilter === "referral" && (
                          <div className="absolute left-6 top-full mt-1 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2.5 z-50 text-xs font-semibold text-slate-700 dark:text-slate-200 normal-case tracking-normal">
                            <div className="px-2 py-1 font-bold text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <span>Referral Filter</span>
                              {referralFilter !== "ALL" && (
                                <button
                                  type="button"
                                  onClick={() => setReferralFilter("ALL")}
                                  className="text-[10px] text-blue-600 hover:underline cursor-pointer lowercase"
                                >
                                  reset
                                </button>
                              )}
                            </div>
                            <div className="mt-1 space-y-0.5">
                              {[
                                { label: "All Referrals", val: "ALL" },
                                { label: "Self Referral", val: "SELF" },
                                { label: "By Doctor", val: "DOCTOR" },
                                { label: "By Hospital / Clinic", val: "HOSPITAL" },
                              ].map((opt) => (
                                <button
                                  key={opt.val}
                                  type="button"
                                  onClick={() => {
                                    setReferralFilter(opt.val);
                                    setOpenHeaderFilter(null);
                                  }}
                                  className={cn(
                                    "w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer",
                                    referralFilter === opt.val
                                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold"
                                      : "hover:bg-slate-100 dark:hover:bg-slate-800",
                                  )}
                                >
                                  <span>{opt.label}</span>
                                  {referralFilter === opt.val && (
                                    <Check className="w-3.5 h-3.5 text-blue-600" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </th>

                      {/* Column 5: Tests */}
                      <th className="px-6 py-3.5 relative">
                        <div className="flex items-center justify-between gap-1">
                          <span>Tests</span>
                          <button
                            type="button"
                            onClick={() =>
                              setOpenHeaderFilter(
                                openHeaderFilter === "tests" ? null : "tests",
                              )
                            }
                            className={cn(
                              "p-1 rounded transition-colors cursor-pointer",
                              testStatusFilter !== "ALL"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 ring-1 ring-blue-400"
                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:hover:bg-slate-700/60",
                            )}
                            title="Filter by test result status"
                          >
                            <Filter className="w-3 h-3" />
                          </button>
                        </div>
                        {openHeaderFilter === "tests" && (
                          <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2.5 z-50 text-xs font-semibold text-slate-700 dark:text-slate-200 normal-case tracking-normal">
                            <div className="px-2 py-1 font-bold text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <span>Test Status</span>
                              {testStatusFilter !== "ALL" && (
                                <button
                                  type="button"
                                  onClick={() => setTestStatusFilter("ALL")}
                                  className="text-[10px] text-blue-600 hover:underline cursor-pointer lowercase"
                                >
                                  reset
                                </button>
                              )}
                            </div>
                            <div className="mt-1 space-y-0.5">
                              {[
                                { label: "All Tests", val: "ALL" },
                                { label: "⏳ Pending Results", val: "PENDING" },
                                { label: "✅ All Results Entered", val: "ENTERED" },
                              ].map((opt) => (
                                <button
                                  key={opt.val}
                                  type="button"
                                  onClick={() => {
                                    setTestStatusFilter(opt.val);
                                    setOpenHeaderFilter(null);
                                  }}
                                  className={cn(
                                    "w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer",
                                    testStatusFilter === opt.val
                                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold"
                                      : "hover:bg-slate-100 dark:hover:bg-slate-800",
                                  )}
                                >
                                  <span>{opt.label}</span>
                                  {testStatusFilter === opt.val && (
                                    <Check className="w-3.5 h-3.5 text-blue-600" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </th>

                      {/* Column 6: Payment / Due */}
                      <th className="px-6 py-3.5 relative">
                        <div className="flex items-center justify-between gap-1">
                          <span>Payment / Due</span>
                          <button
                            type="button"
                            onClick={() =>
                              setOpenHeaderFilter(
                                openHeaderFilter === "payment" ? null : "payment",
                              )
                            }
                            className={cn(
                              "p-1 rounded transition-colors cursor-pointer",
                              paymentFilter !== "ALL" || sortOption === "DUE_DESC"
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300 ring-1 ring-rose-400"
                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:hover:bg-slate-700/60",
                            )}
                            title="Filter by Payment / Due Status"
                          >
                            <Filter className="w-3 h-3" />
                          </button>
                        </div>
                        {openHeaderFilter === "payment" && (
                          <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2.5 z-50 text-xs font-semibold text-slate-700 dark:text-slate-200 normal-case tracking-normal">
                            <div className="px-2 py-1 font-bold text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <span>Payment / Due Filter</span>
                              {paymentFilter !== "ALL" && (
                                <button
                                  type="button"
                                  onClick={() => setPaymentFilter("ALL")}
                                  className="text-[10px] text-blue-600 hover:underline cursor-pointer lowercase"
                                >
                                  reset
                                </button>
                              )}
                            </div>
                            <div className="mt-1 space-y-0.5">
                              {[
                                { label: "All Payments", val: "ALL" },
                                { label: "🔴 Due Only (Unpaid / Partial)", val: "HAS_DUE" },
                                { label: "🟢 Paid in Full", val: "PAID" },
                                { label: "🟡 Partial Paid", val: "PARTIAL" },
                                { label: "⚪ Pending (Zero Paid)", val: "PENDING" },
                              ].map((opt) => (
                                <button
                                  key={opt.val}
                                  type="button"
                                  onClick={() => {
                                    setPaymentFilter(opt.val);
                                    setOpenHeaderFilter(null);
                                  }}
                                  className={cn(
                                    "w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer",
                                    paymentFilter === opt.val
                                      ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold"
                                      : "hover:bg-slate-100 dark:hover:bg-slate-800",
                                  )}
                                >
                                  <span>{opt.label}</span>
                                  {paymentFilter === opt.val && (
                                    <Check className="w-3.5 h-3.5 text-rose-600" />
                                  )}
                                </button>
                              ))}
                            </div>
                            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                              <button
                                type="button"
                                onClick={() => {
                                  setSortOption(
                                    sortOption === "DUE_DESC"
                                      ? "DATE_DESC"
                                      : "DUE_DESC",
                                  );
                                  setOpenHeaderFilter(null);
                                }}
                                className={cn(
                                  "w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between text-[11px] cursor-pointer",
                                  sortOption === "DUE_DESC"
                                    ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 font-bold"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300",
                                )}
                              >
                                <span>Sort: Highest Due First</span>
                                {sortOption === "DUE_DESC" && (
                                  <Check className="w-3 h-3 text-rose-600" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </th>

                      {/* Column 7: Actions */}
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {(() => {
                      const displayedRegistrations = registrations
                        .filter((reg) => {
                        // 1. Text Search Query
                        const query = patientSearchQuery.toLowerCase().trim();
                        if (query) {
                          let isSampleMatch = false;
                          if (query.startsWith("s") && query.length >= 10) {
                            const sampleBody = query.substring(
                              1,
                              query.length - 1,
                            );
                            const regDigitsClean = reg.registrationNumber
                              ? reg.registrationNumber.replace(/[^0-9]/g, "")
                              : "";
                            if (regDigitsClean.includes(sampleBody)) {
                              isSampleMatch = true;
                            }
                          }
                          const matchesSearch =
                            reg.patientName?.toLowerCase().includes(query) ||
                            reg.registrationNumber
                              ?.toLowerCase()
                              .includes(query) ||
                            reg.mobileNumber?.includes(query) ||
                            reg.referredBy?.toLowerCase().includes(query) ||
                            isSampleMatch;
                          if (!matchesSearch) return false;
                        }

                        // 2. Payment / Due Filter
                        const total = reg.billing?.totalAmount ?? reg.totalAmount ?? 0;
                        const paid = reg.billing?.paidAmount ?? reg.paidAmount ?? 0;
                        const due = Math.max(0, total - paid);
                        const isPaid = reg.paymentStatus === "PAID" || (total > 0 && due <= 0);

                        if (paymentFilter === "HAS_DUE" && due <= 0) return false;
                        if (paymentFilter === "PAID" && !isPaid) return false;
                        if (paymentFilter === "PARTIAL" && (due <= 0 || paid <= 0)) return false;
                        if (paymentFilter === "PENDING" && (paid > 0 || total === 0)) return false;

                        // 3. Gender Filter
                        if (genderFilter !== "ALL") {
                          if (reg.gender?.toLowerCase() !== genderFilter.toLowerCase()) return false;
                        }

                        // 4. Referral Filter
                        if (referralFilter === "SELF") {
                          const ref = (reg.referredBy || "").toLowerCase();
                          const mode = (reg.referralMode || "").toLowerCase();
                          if (!ref.includes("self") && mode !== "self") return false;
                        } else if (referralFilter === "DOCTOR") {
                          const mode = (reg.referralMode || "").toLowerCase();
                          const ref = (reg.referredBy || "").toLowerCase();
                          if (mode !== "doctor" && !ref.includes("dr.") && !ref.includes("dr ") && !ref.includes("doctor")) return false;
                        } else if (referralFilter === "HOSPITAL") {
                          const mode = (reg.referralMode || "").toLowerCase();
                          const ref = (reg.referredBy || "").toLowerCase();
                          if (mode !== "hospital" && !ref.includes("hospital") && !ref.includes("clinic")) return false;
                        }

                        // 5. Test Status Filter
                        const regEnteredCount = reg.testResults ? reg.testResults.filter((t: any) => t.resultValue && String(t.resultValue).trim() !== "" && String(t.resultValue).trim() !== "—").length : 0;
                        const regTotalCount = reg.testResults && reg.testResults.length > 0 ? reg.testResults.length : (reg.tests ? reg.tests.length : 0);
                        const regPendingCount = Math.max(0, regTotalCount - regEnteredCount);

                        if (testStatusFilter === "PENDING" && regPendingCount === 0) return false;
                        if (testStatusFilter === "ENTERED" && (regEnteredCount === 0 || regPendingCount > 0)) return false;

                        // 6. Date Filter
                        if (dateFilter !== "ALL") {
                          const d = getRegDateObj(reg);
                          if (!d) return false;
                          const now = new Date();
                          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                          if (dateFilter === "TODAY") {
                            if (d < todayStart) return false;
                          } else if (dateFilter === "YESTERDAY") {
                            const yestStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
                            if (d < yestStart || d >= todayStart) return false;
                          } else if (dateFilter === "LAST_7") {
                            const last7 = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
                            if (d < last7) return false;
                          } else if (dateFilter === "THIS_MONTH") {
                            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                            if (d < monthStart) return false;
                          } else if (dateFilter === "CUSTOM" && customDate) {
                            const [cYear, cMonth, cDay] = customDate.split("-").map(Number);
                            if (d.getFullYear() !== cYear || d.getMonth() !== cMonth - 1 || d.getDate() !== cDay) {
                              return false;
                            }
                          }
                        }

                        return true;
                      })
                      .sort((a, b) => {
                        if (sortOption === "DATE_ASC") {
                          const da = getRegDateObj(a)?.getTime() || 0;
                          const db = getRegDateObj(b)?.getTime() || 0;
                          return da - db;
                        } else if (sortOption === "NAME_ASC") {
                          return (a.patientName || "").localeCompare(b.patientName || "");
                        } else if (sortOption === "NAME_DESC") {
                          return (b.patientName || "").localeCompare(a.patientName || "");
                        } else if (sortOption === "DUE_DESC") {
                          const totalA = a.billing?.totalAmount ?? a.totalAmount ?? 0;
                          const paidA = a.billing?.paidAmount ?? a.paidAmount ?? 0;
                          const dueA = Math.max(0, totalA - paidA);

                          const totalB = b.billing?.totalAmount ?? b.totalAmount ?? 0;
                          const paidB = b.billing?.paidAmount ?? b.paidAmount ?? 0;
                          const dueB = Math.max(0, totalB - paidB);

                          return dueB - dueA;
                        }
                        // Default DATE_DESC
                        const da = getRegDateObj(a)?.getTime() || 0;
                        const db = getRegDateObj(b)?.getTime() || 0;
                        return db - da;
                      });

                      if (displayedRegistrations.length === 0) {
                        return (
                          <tr>
                            <td colSpan={7} className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <Filter className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                  No registrations match the selected filters
                                </span>
                                <button
                                  type="button"
                                  onClick={resetAllFilters}
                                  className="mt-1 px-3 py-1.5 text-xs font-extrabold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg cursor-pointer transition-all"
                                >
                                  Reset All Filters
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return displayedRegistrations.map((reg) => {
                        const total = reg.billing?.totalAmount ?? reg.totalAmount ?? 0;
                        const paid = reg.billing?.paidAmount ?? reg.paidAmount ?? 0;
                        const due = Math.max(0, total - paid);
                        const hasDue = due > 0;
                        const regEnteredCount = reg.testResults ? reg.testResults.filter((t: any) => t.resultValue && String(t.resultValue).trim() !== "" && String(t.resultValue).trim() !== "—").length : 0;
                        const regTotalCount = reg.testResults && reg.testResults.length > 0 ? reg.testResults.length : (reg.tests ? reg.tests.length : 0);
                        const regPendingCount = Math.max(0, regTotalCount - regEnteredCount);
                        return (
                          <tr
                            key={reg._id}
                            className={cn(
                              "transition-colors",
                              hasDue
                                ? "bg-red-100/80 dark:bg-rose-950/60 hover:bg-red-200/90 dark:hover:bg-rose-900/70 border-l-4 border-l-rose-500"
                                : "hover:bg-slate-50/40 dark:hover:bg-slate-800/20",
                            )}
                          >
                            <td className="px-6 py-4">
                              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">
                                {reg.registrationNumber}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 block">
                                {reg.registrationDate} {reg.registrationTime}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-extrabold text-slate-800 dark:text-slate-100">
                                  {reg.patientName}
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-black rounded uppercase">
                                    {reg.age?.value} {reg.age?.type}
                                  </span>
                                  <span className="px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[9px] font-black rounded uppercase">
                                    {reg.gender}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                                {reg.mobileNumber}
                              </span>
                              <span
                                className="text-[10px] text-slate-400 truncate max-w-[150px] block"
                                title={`${reg.address}${reg.location?.city ? `, ${reg.location.city}, ${reg.location.district}, ${reg.location.state}` : ""}`}
                              >
                                {reg.address}
                              </span>
                              {reg.location?.state && (
                                <span className="text-[9px] text-slate-500 font-medium block mt-0.5">
                                  {[
                                    reg.location.city,
                                    reg.location.district,
                                    reg.location.state,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-bold text-slate-750 dark:text-slate-250">
                                {reg.referredBy}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1 max-w-[200px]">
                                <div className="flex flex-wrap gap-1">
                                  {reg.tests && reg.tests.length > 0 ? (
                                    reg.tests.map((test: any, tIdx: number) => (
                                      <span
                                        key={tIdx}
                                        className="px-2 py-0.5 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-[9px] font-black rounded uppercase"
                                      >
                                        {typeof test === "string"
                                          ? test
                                          : test.testName || test.name}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[10px] text-amber-500 font-black uppercase">
                                      No tests added
                                    </span>
                                  )}
                                </div>
                                {regTotalCount > 0 && (
                                  <div className="mt-0.5">
                                    {regEnteredCount > 0 && regPendingCount > 0 ? (
                                      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-1.5 py-0.5 rounded">
                                        <Clock className="w-2.5 h-2.5" />
                                        {regEnteredCount} Entered • {regPendingCount} Pending
                                      </span>
                                    ) : regEnteredCount > 0 && regPendingCount === 0 ? (
                                      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-1.5 py-0.5 rounded">
                                        <Check className="w-2.5 h-2.5" />
                                        All {regEnteredCount} Entered
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">
                                        {regPendingCount} Pending
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {(() => {
                                const total = reg.billing?.totalAmount ?? reg.totalAmount ?? 0;
                                const paid = reg.billing?.paidAmount ?? reg.paidAmount ?? 0;
                                const due = Math.max(0, total - paid);
                                const isPaid = reg.paymentStatus === "PAID" || (total > 0 && due <= 0);
                                return (
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDueModalRecord(reg);
                                          setIsDueModalOpen(true);
                                        }}
                                        className={cn(
                                          "px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs",
                                          isPaid
                                            ? "bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400"
                                            : due > 0 && paid > 0
                                              ? "bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-400"
                                              : "bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-400"
                                        )}
                                        title="Click to view or update payment / due"
                                      >
                                        {reg.paymentStatus || (isPaid ? "PAID" : due > 0 && paid > 0 ? "PARTIAL" : "PENDING")}
                                      </button>
                                    </div>
                                    {due > 0 && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDueModalRecord(reg);
                                          setIsDueModalOpen(true);
                                        }}
                                        className="font-black text-xs text-rose-700 dark:text-rose-300 bg-rose-200/90 hover:bg-rose-300 dark:bg-rose-900/70 dark:hover:bg-rose-800/80 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 w-fit shadow-xs border border-rose-300/80 cursor-pointer transition-all hover:scale-105 active:scale-95 group text-left"
                                        title="Click to update / pay due amount"
                                      >
                                        <span>Due: ₹{due.toFixed(2)}</span>
                                        <span className="text-[9px] bg-rose-600 group-hover:bg-rose-700 text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5">
                                          <CreditCard className="w-2.5 h-2.5" />
                                          Pay
                                        </span>
                                      </button>
                                    )}
                                    {isPaid && total > 0 && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDueModalRecord(reg);
                                          setIsDueModalOpen(true);
                                        }}
                                        className="font-bold text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer text-left w-fit"
                                        title="Click to view payment details"
                                      >
                                        Paid in Full (₹{total.toFixed(2)})
                                      </button>
                                    )}
                                  </div>
                                );
                              })()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={async () => {
                                    setSavedRecord(reg);
                                    const existingTestIds = (reg.tests || [])
                                      .map((t: any) => (typeof t === "object" && t._id ? t._id : null))
                                      .filter(Boolean);
                                    setSelectedTestIds(existingTestIds);

                                    // Pre-fill billing options if saved
                                    if (reg.billing) {
                                      setDiscountVal(String(reg.billing.discountPercentage || reg.billing.discount || 0));
                                      setDiscountType(reg.billing.discountType || "percentage");
                                      setPaymentMethod(reg.billing.paymentMethod || "Cash");
                                      setPaidAmountInput(String(reg.billing.paidAmount ?? ""));
                                    } else {
                                      setDiscountVal("0");
                                      setDiscountType("percentage");
                                      setPaymentMethod("Cash");
                                      setPaidAmountInput("");
                                    }

                                    await fetchSamples();
                                    setShowTestSelection(true);
                                  }}
                                  className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1 font-bold text-[10px]"
                                  title="Add or Edit Tests for this patient"
                                >
                                  <FlaskConical className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">+ Tests</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={
                                    reg.authorizationStatus !== "AUTHORIZED" || regEnteredCount === 0
                                  }
                                  onClick={() => {
                                    if (
                                      reg.authorizationStatus === "AUTHORIZED" && regEnteredCount > 0
                                    ) {
                                      setReportModalRecord(reg);
                                      setIsReportModalOpen(true);
                                    }
                                  }}
                                  className={cn(
                                    "p-1.5 rounded-full transition-all cursor-pointer",
                                    reg.authorizationStatus === "AUTHORIZED" && regEnteredCount > 0
                                      ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:scale-105 active:scale-95"
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 opacity-40 cursor-not-allowed",
                                  )}
                                  title={
                                    reg.authorizationStatus === "AUTHORIZED" && regEnteredCount > 0
                                      ? `Download / Print Official Pathology Report (${regEnteredCount} entered result${regEnteredCount > 1 ? "s" : ""})`
                                      : reg.authorizationStatus !== "AUTHORIZED"
                                        ? "Download disabled — Awaiting Pathologist Authorization"
                                        : "Download disabled — No test results entered yet"
                                  }
                                >
                                  <Download className="w-3.5 h-3.5" />
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
                                      handlePrintLabels(undefined, reg);
                                    }}
                                    className="p-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-650 dark:text-teal-400 rounded-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                    title="Print Sample Labels"
                                  >
                                    <Activity className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    handleDeleteRegistration(
                                      reg._id,
                                      reg.patientName,
                                      reg.registrationNumber,
                                    )
                                  }
                                  className="p-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                  title="Delete Registration"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
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
                Onboard new diagnostics patients, track referring physicians,
                and record sample transport sources.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowForm(false);
                  resetFormFields(false);
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold rounded-lg text-xs text-slate-700 dark:text-slate-300 transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                Back to Patients List
              </button>
            </div>
          </div>


          {/* Form grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form Fields */}
            <div className="lg:col-span-2 space-y-4">
              {/* SECTION 2: Patient Information */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-4 md:p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded-md">
                      <User className="w-3.5 h-3.5" />
                    </span>
                    <h2 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                      Patient Information
                    </h2>
                  </div>
                  {isExistingPatientLoaded && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-md flex items-center gap-1 animate-in fade-in duration-200">
                      <CheckCircle2 className="w-3 h-3" /> Existing Patient Loaded
                    </span>
                  )}
                </div>

                {/* Patient ID Field */}
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      Patient ID / Reg No.
                      <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                        (Auto-generated for new, or type existing to fetch)
                      </span>
                    </label>
                    {patientIdInput !== nextPatientId && (
                      <button
                        type="button"
                        onClick={() => {
                          setPatientIdInput(nextPatientId);
                        }}
                        className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-2.5 h-2.5" /> Restore Auto ID
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={patientIdInput}
                    onChange={(e) => setPatientIdInput(e.target.value)}
                    placeholder="e.g. REG-20260903-0001"
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-blue-600 dark:text-blue-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase tracking-wide"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Patient Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Patient Name{" "}
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.patientName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          patientName: e.target.value,
                        }))
                      }
                      placeholder="Enter full name"
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-blue-550 focus:ring-1 focus:ring-blue-550 font-semibold"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Mobile Number{" "}
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={formData.mobileNumber}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          mobileNumber: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                      placeholder="10-digit number"
                      className={cn(
                        "px-3 py-1.5 bg-white dark:bg-slate-800 border rounded-lg text-xs outline-none font-semibold focus:ring-1",
                        formData.mobileNumber && !isMobileValid
                          ? "border-rose-400 dark:border-rose-900 focus:ring-rose-500 focus:border-rose-500"
                          : "border-slate-200 dark:border-slate-700 focus:ring-blue-550 focus:border-blue-550",
                      )}
                    />
                    {formData.mobileNumber && !isMobileValid && (
                      <span className="text-[10px] text-rose-500 font-bold tracking-tight">
                        Mobile number must be exactly 10 digits.
                      </span>
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
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            age: { ...prev.age, value: e.target.value },
                          }))
                        }
                        placeholder="Value"
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-blue-550 focus:ring-1 focus:ring-blue-550 font-semibold"
                      />
                      <select
                        value={formData.age.type}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            age: { ...prev.age, type: e.target.value as any },
                          }))
                        }
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
                      Sex / Gender{" "}
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <div className="flex gap-4 items-center h-[34px]">
                      {["Male", "Female", "Other"].map((g) => (
                        <label
                          key={g}
                          className="flex items-center gap-1.5 cursor-pointer font-semibold text-xs text-slate-700 dark:text-slate-300"
                        >
                          <input
                            type="radio"
                            name="gender"
                            value={g}
                            checked={formData.gender === g}
                            onChange={() =>
                              setFormData((prev) => ({
                                ...prev,
                                gender: g as any,
                              }))
                            }
                            className="w-3.5 h-3.5 text-blue-600 border-slate-300 dark:border-slate-700"
                          />
                          {g}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>



                {/* State, District, City text inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />{" "}
                      State
                    </label>
                    <input
                      type="text"
                      value={formData.location.state}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          location: { ...prev.location, state: e.target.value },
                        }))
                      }
                      placeholder="Enter State"
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-blue-550 focus:ring-1 focus:ring-blue-550 font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />{" "}
                      District
                    </label>
                    <input
                      type="text"
                      value={formData.location.district}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          location: {
                            ...prev.location,
                            district: e.target.value,
                          },
                        }))
                      }
                      placeholder="Enter District"
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-blue-550 focus:ring-1 focus:ring-blue-550 font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />{" "}
                      City / Area
                    </label>
                    <input
                      type="text"
                      value={formData.location.city}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          location: { ...prev.location, city: e.target.value },
                        }))
                      }
                      placeholder="Enter City / Area"
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-blue-550 focus:ring-1 focus:ring-blue-550 font-semibold"
                    />
                  </div>
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

                  <div className="space-y-3 text-left">
                    <SearchableSelect
                      label="Select Hospital (Optional)"
                      options={hospitals.map((h) => h.hospitalName)}
                      value={
                        formData.selectedHospital === "Self"
                          ? ""
                          : formData.selectedHospital || ""
                      }
                      onChange={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          selectedHospital: val,
                          selectedDoctor: "",
                        }))
                      }
                      placeholder="Search hospital to filter doctors..."
                    />

                    <SearchableSelect
                      label="Referred By (Doctor / Referral Source)"
                      options={referredByOptions}
                      value={currentReferredBy}
                      onChange={handleReferredByChange}
                      mandatory
                      placeholder="Search Self, Lab or Doctor..."
                    />

                    {(formData.referralMode || "Self") === "Self" &&
                      (formData.selectedLab || "Medoraa Labs (Our Lab)") !==
                      "Medoraa Labs (Our Lab)" ? (
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Sample Drawn By (Phlebotomist)
                        </label>
                        <input
                          type="text"
                          value={formData.sampleDrawnBy}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              sampleDrawnBy: e.target.value,
                            }))
                          }
                          placeholder="Enter phlebotomist name"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-blue-550 focus:ring-1 focus:ring-blue-550 font-semibold"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Sample Drawn By
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsAddingStaff((prev) => !prev)}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 uppercase tracking-wider flex items-center gap-1 transition-all"
                          >
                            {isAddingStaff ? "× Cancel Add" : "+ Add Staff"}
                          </button>
                        </div>

                        {isAddingStaff ? (
                          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-4 animate-in fade-in duration-200">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100 dark:border-slate-800 pb-1.5">
                              Add New Staff Member
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-slate-500 uppercase">
                                  Full Name *
                                </label>
                                <input
                                  type="text"
                                  placeholder="Staff Name"
                                  value={newStaffData.name}
                                  onChange={(e) =>
                                    setNewStaffData((prev) => ({
                                      ...prev,
                                      name: e.target.value,
                                    }))
                                  }
                                  className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-500 outline-none text-slate-850 dark:text-slate-200"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-slate-500 uppercase">
                                  Role *
                                </label>
                                <select
                                  value={newStaffData.role}
                                  onChange={(e) =>
                                    setNewStaffData((prev) => ({
                                      ...prev,
                                      role: e.target.value,
                                    }))
                                  }
                                  className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-blue-500 outline-none"
                                >
                                  <option value="registration">
                                    Registration
                                  </option>
                                  <option value="authorization">
                                    Authorization
                                  </option>
                                  <option value="inventory">Inventory</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-slate-500 uppercase">
                                  Email Address *
                                </label>
                                <input
                                  type="email"
                                  placeholder="email@example.com"
                                  value={newStaffData.email}
                                  onChange={(e) =>
                                    setNewStaffData((prev) => ({
                                      ...prev,
                                      email: e.target.value,
                                    }))
                                  }
                                  className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-500 outline-none text-slate-850 dark:text-slate-200"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-slate-500 uppercase">
                                  Mobile Number
                                </label>
                                <input
                                  type="tel"
                                  placeholder="10-digit mobile"
                                  value={newStaffData.mobileNumber}
                                  onChange={(e) =>
                                    setNewStaffData((prev) => ({
                                      ...prev,
                                      mobileNumber: e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 10),
                                    }))
                                  }
                                  className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-500 outline-none text-slate-850 dark:text-slate-200"
                                />
                              </div>
                              <div className="sm:col-span-2 flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-slate-500 uppercase">
                                  Password *
                                </label>
                                <input
                                  type="password"
                                  placeholder="Password"
                                  value={newStaffData.password}
                                  onChange={(e) =>
                                    setNewStaffData((prev) => ({
                                      ...prev,
                                      password: e.target.value,
                                    }))
                                  }
                                  className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-500 outline-none text-slate-850 dark:text-slate-200"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                              <button
                                type="button"
                                disabled={isSavingStaff}
                                onClick={handleAddNewStaff}
                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-blue-600/10"
                              >
                                {isSavingStaff ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Adding...
                                  </>
                                ) : (
                                  "Save Staff"
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <SearchableSelect
                            label=""
                            options={staffOptions}
                            value={formData.sampleDrawnBy}
                            onChange={(val) =>
                              setFormData((prev) => ({
                                ...prev,
                                sampleDrawnBy: val,
                              }))
                            }
                            placeholder="Select employee"
                          />
                        )}
                      </div>
                    )}
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
                        Received Through{" "}
                        <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <select
                        value={
                          formData.sampleReceived.receivedThrough === "None"
                            ? "None"
                            : "Courier"
                        }
                        onChange={(e) => {
                          const type = e.target.value;
                          setFormData((prev) => {
                            const updated = {
                              ...prev,
                              sampleReceived: {
                                ...prev.sampleReceived,
                                receivedThrough: type as any,
                              },
                            };
                            if (type === "Courier") {
                              const now = new Date();
                              const localDate = now.toISOString().split("T")[0];
                              const localTime = now
                                .toTimeString()
                                .split(" ")[0]
                                .slice(0, 5);
                              if (!updated.sampleReceived.courier.arrivalDate) {
                                updated.sampleReceived.courier.arrivalDate =
                                  localDate;
                              }
                              if (!updated.sampleReceived.courier.arrivalTime) {
                                updated.sampleReceived.courier.arrivalTime =
                                  localTime;
                              }
                            }
                            return updated;
                          });
                        }}
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none font-bold shadow-sm"
                      >
                        <option value="None">Sample Draw by Medoraalab</option>
                        <option value="Courier">
                          Other (Collected from Outside)
                        </option>
                      </select>
                    </div>

                    {formData.sampleReceived.receivedThrough === "Courier" && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-3 animate-in fade-in duration-200">
                        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800">
                          Outside Collection Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                              Mode of Transport{" "}
                              <span className="text-rose-500 font-bold">*</span>
                            </label>
                            <input
                              type="text"
                              value={
                                formData.sampleReceived.courier.companyName
                              }
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  sampleReceived: {
                                    ...prev.sampleReceived,
                                    courier: {
                                      ...prev.sampleReceived.courier,
                                      companyName: e.target.value,
                                    },
                                  },
                                }))
                              }
                              placeholder="e.g. Courier, Employee, Person, Bus, etc."
                              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 transition-all text-slate-850 dark:text-slate-200"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                              Docket Number / Tracking ID
                            </label>
                            <input
                              type="text"
                              value={
                                formData.sampleReceived.courier.trackingNumber
                              }
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  sampleReceived: {
                                    ...prev.sampleReceived,
                                    courier: {
                                      ...prev.sampleReceived.courier,
                                      trackingNumber: e.target.value,
                                    },
                                  },
                                }))
                              }
                              placeholder="Tracking ID (Optional)"
                              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 transition-all text-slate-850 dark:text-slate-200"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                              Date Received
                            </label>
                            <input
                              type="date"
                              value={
                                formData.sampleReceived.courier.arrivalDate
                              }
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  sampleReceived: {
                                    ...prev.sampleReceived,
                                    courier: {
                                      ...prev.sampleReceived.courier,
                                      arrivalDate: e.target.value,
                                    },
                                  },
                                }))
                              }
                              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 transition-all text-slate-850 dark:text-slate-200"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                              Time Received
                            </label>
                            <input
                              type="time"
                              value={
                                formData.sampleReceived.courier.arrivalTime
                              }
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  sampleReceived: {
                                    ...prev.sampleReceived,
                                    courier: {
                                      ...prev.sampleReceived.courier,
                                      arrivalTime: e.target.value,
                                    },
                                  },
                                }))
                              }
                              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 transition-all text-slate-850 dark:text-slate-200"
                            />
                          </div>
                          <div className="flex flex-col gap-1 col-span-1 md:col-span-2">
                            <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                              Remarks
                            </label>
                            <textarea
                              rows={2}
                              value={formData.sampleReceived.courier.remarks}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  sampleReceived: {
                                    ...prev.sampleReceived,
                                    courier: {
                                      ...prev.sampleReceived.courier,
                                      remarks: e.target.value,
                                    },
                                  },
                                }))
                              }
                              placeholder="Enter any transport/package remarks..."
                              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 transition-all resize-none text-slate-850 dark:text-slate-200"
                            />
                          </div>
                        </div>
                      </div>
                    )}
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
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> System Date:
                    </span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {liveDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-2">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> System Time:
                    </span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {liveTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">
                      ID Sequence:
                    </span>
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
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        isNameValid ? "bg-emerald-500" : "bg-slate-350",
                      )}
                    />
                    <span
                      className={
                        isNameValid
                          ? "text-emerald-700 dark:text-emerald-500"
                          : ""
                      }
                    >
                      Patient Full Name
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        isAgeValid ? "bg-emerald-500" : "bg-slate-350",
                      )}
                    />
                    <span
                      className={
                        isAgeValid
                          ? "text-emerald-700 dark:text-emerald-500"
                          : ""
                      }
                    >
                      Valid Age (&gt; 0)
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        isMobileValid ? "bg-emerald-500" : "bg-slate-350",
                      )}
                    />
                    <span
                      className={
                        isMobileValid
                          ? "text-emerald-700 dark:text-emerald-500"
                          : ""
                      }
                    >
                      10-Digit Mobile Number
                    </span>
                  </li>

                  <li className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        isReferralValid ? "bg-emerald-500" : "bg-slate-350",
                      )}
                    />
                    <span
                      className={
                        isReferralValid
                          ? "text-emerald-700 dark:text-emerald-500"
                          : ""
                      }
                    >
                      Referred By Doctor
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        isTransportValid ? "bg-emerald-500" : "bg-slate-350",
                      )}
                    />
                    <span
                      className={
                        isTransportValid
                          ? "text-emerald-700 dark:text-emerald-500"
                          : ""
                      }
                    >
                      Sample Transport Details
                    </span>
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
                    isFormValid && !isSaving
                      ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/10 cursor-pointer"
                      : "bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none",
                  )}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Saving Record...
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Add Test
                    </>
                  )}
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
                      if (confirm("Discard changes and cancel?")) {
                        resetFormFields(false);
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
      {/* QR CODE ENLARGED POPUP MODAL */}
      {isQrModalOpen && adminQrCode && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-4 font-sans">
            {/* Header */}
            <div className="w-full flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-600 dark:text-blue-400">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Scan QR to Pay
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400">
                    Scan via PhonePe, GPay, Paytm or UPI
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Amount Box */}
            {(() => {
              const subtotal = availableSamples
                .filter((s) => selectedTestIds.includes(s._id))
                .reduce((sum, s) => sum + (parseFloat(s.patientPrice) || 0), 0);
              const rawDiscount = parseFloat(discountVal) || 0;
              const calculatedDiscount =
                discountType === "percentage"
                  ? (subtotal * rawDiscount) / 100
                  : rawDiscount;
              const finalDiscount = Math.min(
                subtotal,
                Math.max(0, calculatedDiscount),
              );
              const totalPayable = Math.max(0, subtotal - finalDiscount);
              return (
                <div className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Total Amount
                  </span>
                  <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                    ₹{totalPayable.toFixed(0)}
                  </span>
                </div>
              );
            })()}

            {/* QR Code Image */}
            <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-blue-200 dark:border-slate-700 shadow-md inline-block">
              <img
                src={adminQrCode}
                alt="Payment UPI QR Code"
                className="w-64 h-64 object-contain rounded-lg"
              />
            </div>

            <button
              onClick={() => setIsQrModalOpen(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
            >
              Close Popup
            </button>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL OVERLAY (Printable Acknowledgement Receipt) */}
      {showReceipt && savedRecord && (
        <div
          className={cn(
            "fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-300",
            printType === "receipt"
              ? "print:p-0 print:bg-white print:relative print:z-0 print:flex"
              : "print:hidden",
          )}
        >
          <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-2xl shadow-2xl w-full max-w-3xl lg:max-w-4xl overflow-hidden print:shadow-none print:w-full print:max-w-none flex flex-col h-[88vh] max-h-[90vh] print:max-h-none border border-slate-200 dark:border-slate-800">
            {/* Modal Header Controls - hidden in print */}
            <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 print:hidden shrink-0">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    Patient Registered Successfully!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Receipt ID:{" "}
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {savedRecord.registrationNumber}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    window.open(
                      getApiUrl(
                        `/api/admin/registrations/${savedRecord._id}/receipt-pdf`,
                      ),
                      "_blank",
                    )
                  }
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-300 cursor-pointer"
                  title="Open Bill in Full Screen (New Tab)"
                >
                  <ExternalLink className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={() => {
                    setShowReceipt(false);
                    setShowTestSelection(false);
                    resetFormFields(false);
                    fetchRegistrations();
                  }}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-400 cursor-pointer"
                  title="Close and complete registration"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 2-Column Layout: Left Side = Options Panel, Right Side = PDF Preview */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100 dark:bg-slate-950">
              {/* LEFT PANEL: Options & Action Cards (No Scrollbar) */}
              <div className="w-full md:w-[320px] lg:w-[340px] p-3 sm:p-4 bg-slate-50/90 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 print:hidden flex flex-col h-full overflow-hidden shrink-0">
                {/* Scrollable Options List */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-0">

                  {/* Section Title */}
                  <div>
                    <div className="text-xs font-black tracking-wider text-slate-500 uppercase">
                      PRINT & LOGISTICS OPTIONS
                    </div>
                    <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                      Select an option below to process receipt or dispatch
                    </p>
                  </div>

                  {/* Vertical Stack of Action Cards */}
                  <div className="space-y-2.5">
                    {/* Option 1A: Print Receipt (With Header & Footer) */}
                    <div className="bg-white dark:bg-slate-800 border-2 border-blue-400/80 hover:border-blue-500 rounded-xl transition-all shadow-xs overflow-hidden">
                      <div className="p-3 flex items-center justify-between gap-2">
                        <div
                          onClick={() => {
                            setModalPreviewType("receipt");
                            handlePrintReceipt(null, true);
                          }}
                          className="flex items-center gap-2.5 flex-1 cursor-pointer"
                        >
                          <Printer className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                          <div className="text-left">
                            <div className="font-bold text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                              Receipt (With Header)
                            </div>
                            <div className="text-[10.5px] font-normal text-slate-400">
                              Official banners & logo watermark • Duplex (Front + Back)
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setModalPreviewType("receipt");
                              handlePrintReceipt(null, true);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors cursor-pointer"
                            title="Print in-page with Header & Footer"
                          >
                            Print
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (savedRecord?._id) {
                                window.open(
                                  getApiUrl(
                                    `/api/admin/registrations/${savedRecord._id}/receipt-pdf?header=true&download=true`,
                                  ),
                                  "_blank",
                                );
                              }
                            }}
                            className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-md transition-colors cursor-pointer"
                            title="Download PDF (With Header & Footer)"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Option 1B: Print Receipt (Without Header / Letterhead) */}
                    <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 rounded-xl transition-all shadow-xs overflow-hidden">
                      <div className="p-3 flex items-center justify-between gap-2">
                        <div
                          onClick={() => {
                            setModalPreviewType("receipt-letterhead");
                            handlePrintReceipt(null, false);
                          }}
                          className="flex items-center gap-2.5 flex-1 cursor-pointer"
                        >
                          <FileText className="w-5 h-5 text-slate-700 dark:text-slate-300 shrink-0" />
                          <div className="text-left">
                            <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                              Receipt (No Header)
                            </div>
                            <div className="text-[10.5px] font-normal text-slate-400">
                              Clearance for pre-printed letterhead • Duplex (Front + Back)
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setModalPreviewType("receipt-letterhead");
                              handlePrintReceipt(null, false);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-slate-700 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                            title="Print in-page without Header (Letterhead)"
                          >
                            Print
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (savedRecord?._id) {
                                window.open(
                                  getApiUrl(
                                    `/api/admin/registrations/${savedRecord._id}/receipt-pdf?header=false&download=true`,
                                  ),
                                  "_blank",
                                );
                              }
                            }}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md transition-colors cursor-pointer"
                            title="Download PDF without Header (Letterhead)"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Option 2: Print Sample Labels (Exact 50x15mm) */}
                    <div className="bg-white dark:bg-slate-800 border-2 border-emerald-400/80 hover:border-emerald-500 rounded-xl transition-all shadow-xs overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handlePrintLabels(0)}
                        className="w-full py-2.5 px-3.5 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 transition-all active:scale-[0.99] flex items-center justify-between cursor-pointer"
                        title="Print 50×15mm Sample Label"
                      >
                        <div className="flex items-center gap-2.5">
                          <Printer className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <div className="text-left">
                            <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                              <span>Print Sample Label</span>
                              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-extrabold px-1.5 py-0.5 rounded">
                                50×15mm
                              </span>
                            </div>
                            <div className="text-[11px] font-normal text-slate-400">
                              Standard 0° • Single sticker with all tests
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-md shadow-xs transition-colors">
                          Print
                        </span>
                      </button>
                    </div>

                    {/* Option 3: Thermal Transfer Label */}
                    <button
                      onClick={() => {
                        if (savedRecord.sampleTransfer) {
                          window.open(
                            getApiUrl(
                              `/api/admin/registrations/${savedRecord._id}/transfer-label-pdf`,
                            ),
                            "_blank",
                          );
                        } else {
                          setIsTransferModalOpen(true);
                        }
                      }}
                      className="w-full py-3 px-3.5 bg-white dark:bg-slate-800 hover:bg-amber-50/70 dark:hover:bg-amber-950/30 border-2 border-amber-400/80 hover:border-amber-500 rounded-xl text-amber-600 dark:text-amber-400 transition-all active:scale-[0.98] flex items-center gap-3 cursor-pointer shadow-xs"
                    >
                      <Printer className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <div className="text-left">
                        <div className="font-bold text-xs sm:text-sm">
                          Thermal Transfer Label
                        </div>
                        <div className="text-[11px] font-normal text-slate-400">
                          Outsource dispatch barcode label
                        </div>
                      </div>
                    </button>

                    {/* Option 4: Edit Transfer / Transfer Sample */}
                    <button
                      onClick={() => setIsTransferModalOpen(true)}
                      className="w-full py-3 px-3.5 bg-white dark:bg-slate-800 hover:bg-purple-50/70 dark:hover:bg-purple-950/30 border-2 border-purple-400/80 hover:border-purple-500 rounded-xl text-purple-600 dark:text-purple-400 transition-all active:scale-[0.98] flex items-center gap-3 cursor-pointer shadow-xs"
                    >
                      <Truck className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
                      <div className="text-left">
                        <div className="font-bold text-xs sm:text-sm">
                          {savedRecord.sampleTransfer
                            ? "Edit Transfer"
                            : "Transfer Sample"}
                        </div>
                        <div className="text-[11px] font-normal text-slate-400">
                          Logistics dispatch details
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Always-visible Pinned Bottom Action Buttons */}
                <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 space-y-2 shrink-0 bg-slate-50/90 dark:bg-slate-900">
                  {/* Divider OR */}
                  <div className="relative flex items-center">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                    <span className="shrink mx-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      OR
                    </span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                  </div>

                  {/* Register Next Patient */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowReceipt(false);
                      setShowTestSelection(false);
                      resetFormFields(true);
                      fetchRegistrations();
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all active:scale-[0.99] shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-white" />
                    <span>+ Register Next Patient</span>
                  </button>

                  {/* Done / Complete Registration */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowReceipt(false);
                      setShowTestSelection(false);
                      resetFormFields(false);
                      fetchRegistrations();
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all active:scale-[0.99] shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Done / Back to Directory</span>
                  </button>
                </div>
              </div>

              {/* RIGHT PANEL: Instant HTML Preview */}
              <div className="flex-1 p-2.5 sm:p-3 bg-slate-100 dark:bg-slate-950 flex flex-col overflow-hidden h-full">
                {/* Preview Selector Tabs */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setModalPreviewType("receipt")}
                      className={cn(
                        "px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer",
                        modalPreviewType === "receipt"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700",
                      )}
                    >
                      Receipt (With Header)
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalPreviewType("receipt-letterhead")}
                      className={cn(
                        "px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer",
                        modalPreviewType === "receipt-letterhead"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700",
                      )}
                    >
                      Receipt (No Header)
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalPreviewType("label")}
                      className={cn(
                        "px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer",
                        modalPreviewType === "label"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700",
                      )}
                    >
                      Sample Label (50×15mm)
                    </button>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
                    {modalPreviewType === "receipt"
                      ? "A4 Patient Bill (Official Header & Footer)"
                      : modalPreviewType === "receipt-letterhead"
                      ? "A4 Patient Bill (Pre-printed Letterhead Clearance)"
                      : "Seznik 50×15mm Label Preview"}
                  </span>
                </div>

                <div className="flex-1 overflow-hidden relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white">
                  {modalPreviewType === "receipt" ? (
                    <iframe
                      key={`receipt-header-${savedRecord._id}`}
                      src={getApiUrl(
                        `/api/admin/registrations/${savedRecord._id}/receipt-html?v=${savedRecord._id}&header=true`,
                      )}
                      className="w-full h-full rounded-xl border-none shadow-sm bg-white"
                      title="Patient Receipt Preview (With Header)"
                    />
                  ) : modalPreviewType === "receipt-letterhead" ? (
                    <iframe
                      key={`receipt-letterhead-${savedRecord._id}`}
                      src={getApiUrl(
                        `/api/admin/registrations/${savedRecord._id}/receipt-html?v=${savedRecord._id}&header=false`,
                      )}
                      className="w-full h-full rounded-xl border-none shadow-sm bg-white"
                      title="Patient Receipt Preview (No Header / Letterhead)"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 overflow-y-auto">
                      {/* Top Header Bar */}
                      <div className="w-full flex items-center justify-between bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs mb-2.5 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            Format:
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-black border border-emerald-300 dark:border-emerald-800">
                            50mm × 15mm Standard (0°)
                          </span>
                        </div>

                        {/* Top Direct Print Button */}
                        <button
                          type="button"
                          onClick={() => handlePrintLabels(0)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer ml-auto"
                          title="Print 50×15mm Sample Label"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Label</span>
                        </button>
                      </div>

                      {/* Live 50x15mm Preview Card */}
                      <div className="flex flex-col items-center justify-center my-auto py-2">
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                          <span>Live 50mm × 15mm Sticker Preview</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black border border-emerald-300 dark:border-emerald-800">
                            0° Standard (Single Sticker)
                          </span>
                        </div>
                        <iframe
                          key={`${savedRecord?._id || "modal-label"}-${savedRecord?.patientName || ""}-${savedRecord?.tests?.length || 0}`}
                          srcDoc={generateBottleLabelHTML(savedRecord, 0, true)}
                          style={{
                            width: "355px",
                            height: "108px",
                          }}
                          className="rounded-lg border-2 border-emerald-500 shadow-md bg-white overflow-hidden transition-all duration-300"
                          title="Sample Label Live Preview"
                        />
                      </div>

                      {/* Primary Print Button */}
                      <div className="w-full space-y-2 mt-2">
                        <button
                          type="button"
                          onClick={() => handlePrintLabels(0)}
                          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Print Sample Label (50×15mm)</span>
                        </button>
                      </div>

                      {/* Instructions Alert Banner */}
                      <div className="w-full p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg text-emerald-900 dark:text-emerald-200 text-[11px] font-semibold text-center mt-2">
                        💡 Label Size: <strong>50mm × 15mm</strong> (0° Standard). All tests are printed on this single tube sticker. In Chrome Print Dialog, set <strong>Margins: None</strong>.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OUTSOURCE SAMPLE TRANSFER LOGISTICS MODAL */}
      <SampleTransferModal
        record={savedRecord}
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={(updatedRec) => {
          setSavedRecord(updatedRec);
          fetchRegistrations();
        }}
      />

      {/* PRINT LABELS SECTION (Hidden on screen, visible only when printing labels) */}
      {savedRecord && (
        <div
          id={
            printType === "label"
              ? "print-active-section"
              : "print-labels-section"
          }
          className={cn(
            "hidden",
            printType === "label" ? "print:block" : "print:hidden",
          )}
        >
          {(() => {
            const rawTests = savedRecord.tests && savedRecord.tests.length > 0
              ? savedRecord.tests
              : savedRecord.testResults && savedRecord.testResults.length > 0
                ? savedRecord.testResults
                : [];

            const testNamesList = rawTests
              .map((t: any) => {
                if (typeof t === "object" && t !== null) {
                  return (t.testName || t.name || "").trim();
                }
                return String(t || "").trim();
              })
              .filter(Boolean);

            const uniqueTests = Array.from(new Set(testNamesList.length > 0 ? testNamesList : ["ROUTINE TEST"]));
            const testsJoined = uniqueTests.join(", ").toUpperCase();
            const testsLen = testsJoined.length;

            const ageValue = savedRecord.age?.value || "";
            const ageType = savedRecord.age?.type
              ? savedRecord.age.type.toLowerCase().startsWith("y")
                ? "Y"
                : savedRecord.age.type.substring(0, 1).toUpperCase()
              : "Y";
            const ageDisplay = ageValue ? `${ageValue} ${ageType}` : "N/A";
            const genderDisplay = (savedRecord.gender || "N/A").toUpperCase();
            const patientId = (savedRecord.registrationNumber || savedRecord.patientId || "").toUpperCase().trim();
            const patientName = (savedRecord.patientName || "PATIENT").toUpperCase().trim();

            // Dynamic scaling for name to fit within 44mm without truncation
            const nameLen = patientName.length;
            let nameFontSize = "6.0px";
            if (nameLen > 28) {
              nameFontSize = "4.8px";
            } else if (nameLen > 20) {
              nameFontSize = "5.4px";
            }

            let testFontSize = "4.8px";
            let testLineHeight = "1.05";
            if (testsLen > 120) {
              testFontSize = "3.2px";
              testLineHeight = "0.92";
            } else if (testsLen > 80) {
              testFontSize = "3.6px";
              testLineHeight = "0.96";
            } else if (testsLen > 50) {
              testFontSize = "4.0px";
              testLineHeight = "1.00";
            } else if (testsLen <= 25) {
              testFontSize = "5.0px";
              testLineHeight = "1.10";
            }

            return (
              <div className="vial-label-card-wrapper">
                <div className="vial-label-card">
                  {/* Line 1: N: Patient Name */}
                  <div className="label-text-row name-row">
                    <span className="label-field-key">N:</span>&nbsp;<span
                      className="label-field-val label-name-val"
                      style={{ fontSize: nameFontSize }}
                    >
                      {patientName}
                    </span>
                  </div>

                  {/* Line 2: ID, AGE: and G: */}
                  <div className="label-text-row demo-row">
                    <div>
                      <span className="label-field-key">ID:</span>&nbsp;<span className="label-field-val label-id-val">{patientId || "N/A"}</span>
                    </div>
                    <div>
                      <span className="label-field-key">AGE:</span>&nbsp;<span className="label-field-val">{ageDisplay}</span>
                    </div>
                    <div>
                      <span className="label-field-key">G:</span>&nbsp;<span className="label-field-val uppercase">{genderDisplay}</span>
                    </div>
                  </div>

                  {/* Line 3: TT: All Test Names */}
                  <div className="label-test-row">
                    <span className="label-field-key test-key">TT:</span>&nbsp;<span
                      className="label-field-val label-test-val"
                      style={{ fontSize: testFontSize, lineHeight: testLineHeight }}
                    >
                      {testsJoined}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Conditional Page Print Setup */}
      {printType === "label" ? (
        <style jsx global>{`
    @media print {
      @page {
        size: 50mm 15mm;
        margin: 0;
      }

      html,
      body {
        width: 50mm !important;
        height: 15mm !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        background: white !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      /* Hide all dashboard elements completely so body height matches label exactly */
      body > *:not(#print-active-section) {
        display: none !important;
      }

      body * {
        visibility: hidden;
      }

      #print-active-section,
      #print-active-section * {
        visibility: visible;
      }

      #print-active-section {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 50mm !important;
        height: 15mm !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        background: white !important;
        z-index: 9999999 !important;
        overflow: hidden !important;
      }

      .vial-label-card-wrapper {
        width: 50mm !important;
        height: 15mm !important;
        min-width: 50mm !important;
        min-height: 15mm !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        padding: 0 !important;
        display: flex !important;
        align-items: flex-start !important;
        justify-content: flex-start !important;
        position: relative !important;
        overflow: hidden !important;
        background: white !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      .vial-label-card {
        width: 48.5mm !important;
        min-width: 0 !important;
        min-height: 0 !important;
        max-width: 48.5mm !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        padding: 3.2mm 0.8mm 0 0.8mm !important;
        display: block !important;
        text-align: left !important;
        background: white !important;
        color: black !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
        overflow: visible !important;
        position: static !important;
        transform: none !important;
      }

      .label-text-row {
        width: 100% !important;
        box-sizing: border-box !important;
        display: flex !important;
        align-items: baseline !important;
        justify-content: flex-start !important;
        text-align: left !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .name-row {
        white-space: nowrap !important;
        line-height: 1.1 !important;
        margin-bottom: 0.15mm !important;
      }

      .demo-row {
        white-space: nowrap !important;
        line-height: 1.15 !important;
        margin-bottom: 0.15mm !important;
        gap: 1.8mm !important;
      }

      .label-id-val {
        font-size: 6.2px !important;
        font-weight: 700 !important;
        letter-spacing: 0.1px !important;
        color: black !important;
      }

      .label-test-row {
        display: block !important;
        width: 100% !important;
        word-break: break-word !important;
        white-space: normal !important;
        margin: 0 !important;
        padding: 0 !important;
        text-align: left !important;
      }

      .demo-spacer {
        display: inline-block !important;
        width: 2.5mm !important;
      }

      .label-field-key {
        font-size: 6.8px !important;
        font-weight: 700 !important;
        color: black !important;
        letter-spacing: 0.05px !important;
        flex-shrink: 0 !important;
        white-space: nowrap !important;
      }

      .test-key {
        font-size: 6.0px !important;
        font-weight: 700 !important;
        color: black !important;
        letter-spacing: 0.05px !important;
      }

      .label-field-val {
        font-size: 7.2px !important;
        font-weight: 600 !important;
        color: black !important;
      }

      .label-name-val {
        font-size: 8.0px !important;
        font-weight: 700 !important;
        text-transform: uppercase !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        max-width: 44mm !important;
      }

      .label-test-val {
        font-size: 6.0px !important;
        font-weight: 600 !important;
        text-transform: uppercase !important;
        color: black !important;
        word-break: break-word !important;
      }
    }
  `}</style>
      ) : (
        <style jsx global>{`
    @media print {
      html,
      body {
        height: auto !important;
        overflow: visible !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      body * {
        visibility: hidden;
      }

      #print-active-section,
      #print-active-section * {
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
            {/* Update Due Amount & Payment Modal */}
      <UpdateDueModal
        record={dueModalRecord}
        isOpen={isDueModalOpen}
        onClose={() => {
          setIsDueModalOpen(false);
          setDueModalRecord(null);
        }}
        adminQrCode={adminQrCode}
        onSuccess={() => {
          fetchRegistrations();
        }}
        onPrintReceipt={(rec) => {
          setSavedRecord(rec);
          setPrintType("receipt");
          setShowReceipt(true);
        }}
      />
      {/* Official Pathology Report Modal */}
      <PathologyReportModal
        record={reportModalRecord}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};

export default PatientRegistrationForm;
