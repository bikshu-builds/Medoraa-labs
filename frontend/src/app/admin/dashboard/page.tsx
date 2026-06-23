"use client";
import React, { useEffect, useState } from "react";
import DashboardCard from "../components/DashboardCard";
import { 
    Users, 
    UserPlus, 
    Home,
    DollarSign, 
    Activity,
    Plus,
    Clock,
    FileText,
    ArrowRight,
    Zap,
    TrendingUp,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Wallet,
    MapPin,
    Search,
    Printer,
    ClipboardCheck,
    ShieldAlert,
    ShoppingCart,
    PackageOpen,
    BadgeCheck,
    XCircle,
    AlertTriangle,
    FileSpreadsheet
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

interface DashboardStats {
    totalDoctors: number;
    totalHospitals: number;
    totalAdmins: number;
    totalReferral: number;
    totalPaid: number;
    totalDue: number;
    hospitalDistribution: { name: string; count: number }[];
    topDoctors: { _id: string; name: string; totalEarnings: number; paid: number; due: number }[];
    recentPayments: {
        _id: string;
        doctorName: string;
        hospitalName: string;
        totalReferralAmount: number;
        paidAmount: number;
        dueAmount: number;
        paymentStatus: string;
        createdAt: string;
    }[];
}

const DonutChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
    const size = 110;
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return (
        <div className="w-full flex items-center justify-between select-none relative group/chart">
            <svg width={size} height={size} className="transform -rotate-90">
                {data.map((item, index) => {
                    const strokeDasharray = circumference;
                    const strokeDashoffset = circumference - (item.value / total) * circumference;
                    const currentOffset = offset;
                    offset += strokeDashoffset;
                    return (
                        <circle
                            key={index}
                            r={radius}
                            cx={size / 2}
                            cy={size / 2}
                            fill="transparent"
                            stroke={item.color}
                            strokeWidth={hoverIndex === index ? 14 : 11}
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={currentOffset}
                            className="transition-all duration-300 cursor-pointer"
                            onMouseEnter={() => setHoverIndex(index)}
                            onMouseLeave={() => setHoverIndex(null)}
                        />
                    );
                })}
            </svg>
            <div className="flex flex-col gap-1 justify-center flex-1 max-w-[150px] ml-4">
                {data.map((item, index) => (
                    <div 
                        key={index} 
                        className={cn(
                            "flex items-center justify-between text-[10px] font-black transition-all cursor-pointer",
                            hoverIndex === index ? "translate-x-1 opacity-100" : "opacity-80"
                        )}
                        onMouseEnter={() => setHoverIndex(index)}
                        onMouseLeave={() => setHoverIndex(null)}
                    >
                        <div className="flex items-center gap-1.5 truncate">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-slate-500 truncate uppercase tracking-wider">{item.label}</span>
                        </div>
                        <span className="text-slate-800 shrink-0 ml-1">{item.value}</span>
                    </div>
                ))}
            </div>
            {hoverIndex !== null && (
                <div className="absolute top-1/2 left-[55px] bg-slate-900 text-white text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-50 animate-in fade-in duration-150 whitespace-nowrap">
                    {Math.round((data[hoverIndex].value / total) * 100)}%
                </div>
            )}
        </div>
    );
};

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState<string>("admin");
    const [userName, setUserName] = useState<string>("Administrator");

    // Sub-Dashboard Search Filters
    const [regSearch, setRegSearch] = useState("");
    const [authSearch, setAuthSearch] = useState("");
    const [invSearch, setInvSearch] = useState("");

    // Demo Data State for non-admin workflows
    const [patientsQueue, setPatientsQueue] = useState([
        { id: "P-8802", name: "Aria Montgomery", age: 28, gender: "F", tests: "CBC, Thyroid Panel", time: "09:15 AM", status: "Sample Collected" },
        { id: "P-8803", name: "Ezra Fitz", age: 34, gender: "M", tests: "Lipid Profile, HbA1c", time: "09:30 AM", status: "Registered" },
        { id: "P-8804", name: "Hanna Marin", age: 26, gender: "F", tests: "Liver Function Test", time: "10:05 AM", status: "Awaiting Barcode" },
        { id: "P-8805", name: "Caleb Rivers", age: 29, gender: "M", tests: "Vitamin D3, B12", time: "10:15 AM", status: "Dispatched to Lab" },
        { id: "P-8806", name: "Spencer Hastings", age: 27, gender: "F", tests: "Renal Panel, Serum Uric", time: "10:45 AM", status: "Registered" }
    ]);

    const [authQueue, setAuthQueue] = useState([
        { id: "A-5401", patient: "Toby Cavanaugh", test: "Hemoglobin (Hb)", department: "Hematology", value: "8.5 g/dL", range: "13.0 - 17.0 g/dL", severity: "Critical Low" },
        { id: "A-5402", patient: "Alison DiLaurentis", test: "Random Blood Sugar", department: "Biochemistry", value: "245 mg/dL", range: "70 - 140 mg/dL", severity: "Abnormal High" },
        { id: "A-5403", patient: "Emily Fields", test: "TSH", department: "Endocrinology", value: "3.2 uIU/mL", range: "0.4 - 4.5 uIU/mL", severity: "Normal" },
        { id: "A-5404", patient: "Mona Vanderwaal", test: "Serum Creatinine", department: "Renal Function", value: "1.1 mg/dL", range: "0.6 - 1.2 mg/dL", severity: "Normal" },
        { id: "A-5405", patient: "Jenna Marshall", test: "Serum Potassium", department: "Electrolytes", value: "5.8 mEq/L", range: "3.5 - 5.1 mEq/L", severity: "Abnormal High" }
    ]);

    const [inventoryAlerts, setInventoryAlerts] = useState([
        { code: "RG-EDTA", item: "EDTA Vacutainer Tubes (Lavender)", category: "Consumables", qty: 250, minQty: 1000, unit: "pcs", status: "Low Stock" },
        { code: "RG-GLU", item: "Glucose Reagent Kits", category: "Reagents", qty: 4, minQty: 20, unit: "kits", status: "Low Stock" },
        { code: "RG-SYR2", item: "2ml Syringes with Needles", category: "Disposables", qty: 1500, minQty: 500, unit: "pcs", status: "In Stock" },
        { code: "RG-ALC", item: "Alcohol Swabs", category: "Consumables", qty: 0, minQty: 200, unit: "pcs", status: "Out of Stock" },
        { code: "RG-CBC", item: "Sysmex CBC Diluent Reagent", category: "Reagents", qty: 12, minQty: 10, unit: "cans", status: "In Stock" }
    ]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) {
                window.location.href = "/signin";
                return;
            }

            // Extract role & name
            const storedUser = localStorage.getItem("adminUser");
            if (storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    setUserRole(user.role || "admin");
                    setUserName(user.name || "Administrator");
                } catch (e) {
                    console.error(e);
                }
            }

            // Only fetch admin metrics API if role is admin
            const res = await fetch(getApiUrl("/api/admin/dashboard"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (data.success) {
                setStats(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Analytics Dashboard...</p>
            </div>
        );
    }

    // Role-based Dashboards rendering:
    // -------------------------------------------------------------
    // 1. REGISTRATION DASHBOARD
    // -------------------------------------------------------------
    if (userRole === "registration") {
        const filteredReg = patientsQueue.filter(p => 
            p.name.toLowerCase().includes(regSearch.toLowerCase()) || 
            p.id.toLowerCase().includes(regSearch.toLowerCase()) || 
            p.tests.toLowerCase().includes(regSearch.toLowerCase())
        );

        return (
            <div className="space-y-6 font-sans animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Registration Desk</h1>
                        <div className="flex items-center gap-3 mt-0.5">
                            <p className="text-slate-500 text-sm font-medium">Logged in: <span className="font-bold text-slate-700">{userName}</span></p>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#e0f2fe] text-[#0369a1] rounded-full border border-blue-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Active Shift</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => alert("Redirecting to Patient Registration Form...")}
                            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            Register Walk-in
                        </button>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <DashboardCard title="Today's Registrations" value={28} icon={UserPlus} color="blue" description="Awaiting samples: 9" />
                    <DashboardCard title="Pending Collections" value={9} icon={Clock} color="amber" description="Average wait: 12m" />
                    <DashboardCard title="Home Collections Booked" value={6} icon={MapPin} color="emerald" description="Dispatched phlebos: 4" />
                    <DashboardCard title="Dispatched to Lab" value={19} icon={CheckCircle2} color="purple" description="Sent for processing" />
                </div>

                {/* Quick Actions Panel */}
                <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Quick Utilities</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <button onClick={() => alert("Scanner Initialized...")} className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-all group">
                            <Zap className="w-5 h-5 text-blue-600 transition-transform group-hover:scale-110" />
                            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Scan Patient QR</span>
                        </button>
                        <button onClick={() => alert("Connecting to Printer...")} className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-all group">
                            <Printer className="w-5 h-5 text-blue-600 transition-transform group-hover:scale-110" />
                            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Print Barcodes</span>
                        </button>
                        <button onClick={() => alert("Phlebotomy Map Opened...")} className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-all group">
                            <MapPin className="w-5 h-5 text-blue-600 transition-transform group-hover:scale-110" />
                            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Track Phlebo</span>
                        </button>
                        <button onClick={() => alert("Consolidated Patient Log Exported...")} className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-all group">
                            <FileSpreadsheet className="w-5 h-5 text-blue-600 transition-transform group-hover:scale-110" />
                            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Export Day Log</span>
                        </button>
                    </div>
                </div>

                {/* Patients Queue List */}
                <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                        <div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-600" />
                                Patient Registration Queue
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Active patients listed in system</p>
                        </div>
                        <div className="relative w-full sm:w-[250px]">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search queue..." 
                                value={regSearch}
                                onChange={(e) => setRegSearch(e.target.value)}
                                className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-800"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Patient ID</th>
                                    <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Patient Name</th>
                                    <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Age/Sex</th>
                                    <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tests Requested</th>
                                    <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Reg. Time</th>
                                    <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredReg.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 text-xs font-bold text-slate-800 uppercase tracking-tight">{p.id}</td>
                                        <td className="py-3 text-xs font-bold text-slate-900">{p.name}</td>
                                        <td className="py-3 text-xs font-medium text-slate-500">{p.age} / {p.gender}</td>
                                        <td className="py-3 text-xs font-medium text-slate-700">{p.tests}</td>
                                        <td className="py-3 text-xs text-slate-400 font-bold">{p.time}</td>
                                        <td className="py-3">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border",
                                                p.status === "Sample Collected" && "bg-emerald-50 text-emerald-600 border-emerald-100",
                                                p.status === "Registered" && "bg-blue-50 text-blue-600 border-blue-100",
                                                p.status === "Awaiting Barcode" && "bg-amber-50 text-amber-600 border-amber-100",
                                                p.status === "Dispatched to Lab" && "bg-purple-50 text-purple-600 border-purple-100"
                                            )}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right">
                                            <button 
                                                onClick={() => {
                                                    alert(`Sample status updated for ${p.name}`);
                                                    setPatientsQueue(prev => prev.map(item => item.id === p.id ? { ...item, status: "Sample Collected" } : item));
                                                }}
                                                className="px-2 py-1 text-[9px] font-black text-white bg-blue-600 hover:bg-blue-700 rounded uppercase tracking-wider transition-all active:scale-95"
                                            >
                                                Collect Sample
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // 2. AUTHORIZATION DASHBOARD
    // -------------------------------------------------------------
    if (userRole === "authorization") {
        const filteredAuth = authQueue.filter(p => 
            p.patient.toLowerCase().includes(authSearch.toLowerCase()) || 
            p.id.toLowerCase().includes(authSearch.toLowerCase()) || 
            p.test.toLowerCase().includes(authSearch.toLowerCase()) ||
            p.department.toLowerCase().includes(authSearch.toLowerCase())
        );

        return (
            <div className="space-y-6 font-sans animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Authorization & Pathology Verification</h1>
                        <div className="flex items-center gap-3 mt-0.5">
                            <p className="text-slate-500 text-sm font-medium">Logged in: <span className="font-bold text-slate-700">{userName}</span></p>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#fef2f2] text-[#991b1b] rounded-full border border-red-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Medical Signatory</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => {
                                alert("Bulk Authorization Successful! 14 reports approved.");
                                setAuthQueue(prev => prev.map(item => ({ ...item, severity: "Normal" })));
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#991b1b] hover:bg-[#7f1d1d] text-white rounded-xl font-bold text-xs shadow-lg shadow-red-900/10 transition-all active:scale-95"
                        >
                            <ClipboardCheck className="w-4 h-4" />
                            Bulk Sign Off
                        </button>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <DashboardCard title="Pending Sign-Off" value={14} icon={AlertTriangle} color="amber" description="Requires clinical review" />
                    <DashboardCard title="Approved Reports Today" value={52} icon={BadgeCheck} color="emerald" description="Dispatched to patients" />
                    <DashboardCard title="Critical Flags" value={3} icon={ShieldAlert} color="rose" description="Urgent callback required" />
                    <DashboardCard title="Average Sign Time" value="1.8 hr" icon={Zap} color="blue" description="Turnaround performance" />
                </div>

                {/* Pending Verification List */}
                <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                        <div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <Activity className="w-4 h-4 text-rose-600" />
                                Pathology Review Worklist
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Reports awaiting pathologist authorization</p>
                        </div>
                        <div className="relative w-full sm:w-[250px]">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Filter worklist..." 
                                value={authSearch}
                                onChange={(e) => setAuthSearch(e.target.value)}
                                className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white transition-all font-medium text-slate-800"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Ref ID</th>
                                    <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Patient Name</th>
                                    <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Parameters</th>
                                    <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Department</th>
                                    <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Value</th>
                                    <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Reference Range</th>
                                    <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredAuth.map((a) => (
                                    <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 text-xs font-bold text-slate-800 uppercase tracking-tight">{a.id}</td>
                                        <td className="py-3 text-xs font-bold text-slate-900">{a.patient}</td>
                                        <td className="py-3 text-xs font-medium text-slate-700">{a.test}</td>
                                        <td className="py-3 text-xs text-slate-400 font-bold uppercase tracking-wider text-[9px]">{a.department}</td>
                                        <td className="py-3">
                                            <span className={cn(
                                                "font-black text-xs px-2 py-0.5 rounded",
                                                a.severity === "Critical Low" && "bg-red-100 text-red-700 border border-red-200 animate-pulse",
                                                a.severity === "Abnormal High" && "bg-amber-100 text-amber-700 border border-amber-200",
                                                a.severity === "Normal" && "text-slate-800"
                                            )}>
                                                {a.value}
                                            </span>
                                        </td>
                                        <td className="py-3 text-xs text-slate-500 font-mono">{a.range}</td>
                                        <td className="py-3 text-right">
                                            <div className="flex items-center gap-1.5 justify-end">
                                                <button 
                                                    onClick={() => {
                                                        alert(`Report ${a.id} authorized & verified.`);
                                                        setAuthQueue(prev => prev.filter(item => item.id !== a.id));
                                                    }}
                                                    className="px-2 py-1 text-[9px] font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded uppercase tracking-wider transition-all active:scale-95"
                                                >
                                                    Authorize
                                                </button>
                                                <button 
                                                    onClick={() => alert(`Retest scheduled for ${a.patient}`)}
                                                    className="px-2 py-1 text-[9px] font-black text-slate-600 bg-slate-100 hover:bg-slate-200 rounded uppercase tracking-wider transition-all"
                                                >
                                                    Retest
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // 3. INVENTORY DASHBOARD
    // -------------------------------------------------------------
    if (userRole === "inventory") {
        const filteredInv = inventoryAlerts.filter(i => 
            i.item.toLowerCase().includes(invSearch.toLowerCase()) || 
            i.code.toLowerCase().includes(invSearch.toLowerCase()) || 
            i.category.toLowerCase().includes(invSearch.toLowerCase())
        );

        return (
            <div className="space-y-6 font-sans animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lab Inventory & Reagents Control</h1>
                        <div className="flex items-center gap-3 mt-0.5">
                            <p className="text-slate-500 text-sm font-medium">Logged in: <span className="font-bold text-slate-700">{userName}</span></p>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#f0fdf4] text-[#166534] rounded-full border border-emerald-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Inventory Manager</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => alert("Reorder requisition sheet generated for suppliers.")}
                            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all active:scale-95"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            Create Purchase Order
                        </button>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <DashboardCard title="Low Stock Warnings" value={2} icon={AlertCircle} color="amber" description="Urgent ordering needed" />
                    <DashboardCard title="Out of Stock Items" value={1} icon={XCircle} color="rose" description="Alcohol Swabs" />
                    <DashboardCard title="Active Supplier Orders" value={3} icon={ShoppingCart} color="blue" description="Incoming within 24h" />
                    <DashboardCard title="Total Registered Items" value={148} icon={PackageOpen} color="purple" description="Consumables & reagents" />
                </div>

                {/* Stock Warning List */}
                <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                        <div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <PackageOpen className="w-4 h-4 text-emerald-600" />
                                Reagent Stock Warning Registry
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Live status alerts for diagnostics inventory</p>
                        </div>
                        <div className="relative w-full sm:w-[250px]">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Filter stock items..." 
                                value={invSearch}
                                onChange={(e) => setInvSearch(e.target.value)}
                                className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all font-medium text-slate-800"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Item SKU</th>
                                    <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Item Name / Reagent</th>
                                    <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
                                    <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">In Stock</th>
                                    <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Minimum Safe Qty</th>
                                    <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredInv.map((item) => (
                                    <tr key={item.code} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 text-xs font-bold text-slate-800 uppercase tracking-tight">{item.code}</td>
                                        <td className="py-3 text-xs font-bold text-slate-900">{item.item}</td>
                                        <td className="py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-[9px]">{item.category}</td>
                                        <td className="py-3 text-xs font-black text-slate-800">{item.qty} {item.unit}</td>
                                        <td className="py-3 text-xs text-slate-500 font-medium">{item.minQty} {item.unit}</td>
                                        <td className="py-3">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border",
                                                item.status === "In Stock" && "bg-emerald-50 text-emerald-600 border-emerald-100",
                                                item.status === "Low Stock" && "bg-amber-50 text-amber-600 border-amber-100",
                                                item.status === "Out of Stock" && "bg-red-50 text-red-500 border-red-100"
                                            )}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right">
                                            <button 
                                                onClick={() => {
                                                    alert(`Stock replenished for ${item.item}`);
                                                    setInventoryAlerts(prev => prev.map(i => i.code === item.code ? { ...i, qty: i.minQty + 500, status: "In Stock" } : i));
                                                }}
                                                className="px-2 py-1 text-[9px] font-black text-white bg-blue-600 hover:bg-blue-700 rounded uppercase tracking-wider transition-all active:scale-95"
                                            >
                                                Restock
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // 4. MAIN ADMIN DASHBOARD
    // -------------------------------------------------------------
    const defaultStats: DashboardStats = {
        totalDoctors: 0,
        totalHospitals: 0,
        totalAdmins: 0,
        totalReferral: 0,
        totalPaid: 0,
        totalDue: 0,
        hospitalDistribution: [],
        topDoctors: [],
        recentPayments: []
    };

    const activeStats = stats || defaultStats;

    const donutColors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6"];
    const hospitalChartData = (activeStats.hospitalDistribution || []).length > 0
        ? (activeStats.hospitalDistribution || []).map((h, i) => ({
            label: h.name,
            value: h.count,
            color: donutColors[i % donutColors.length]
          }))
        : [{ label: "No Doctors Yet", value: 1, color: "#e2e8f0" }];

    return (
        <div className="space-y-6 font-sans animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Administrative Dashboard</h1>
                    <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-slate-500 text-sm font-medium">Logged in: <span className="font-bold text-slate-700">{userName}</span></p>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Live Sync</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => window.location.href = '/admin/doctors'}
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Manage Doctors
                    </button>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <DashboardCard title="Total Hospitals" value={activeStats.totalHospitals || 0} icon={Home} color="blue" description="Registered Branches" />
                <DashboardCard title="Total Doctors" value={activeStats.totalDoctors || 0} icon={UserPlus} color="emerald" description="Associated Partners" />
                <DashboardCard title="Administrators" value={activeStats.totalAdmins || 0} icon={ShieldCheck} color="purple" description="System Operators" />
                <DashboardCard title="Total Referrals" value={`₹${(activeStats.totalReferral || 0).toLocaleString()}`} icon={DollarSign} color="amber" description="All-time Payouts" />
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-300">
                    <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Allocated Payouts</span>
                        <h3 className="text-2xl font-black text-slate-950">₹{(activeStats.totalReferral || 0).toLocaleString()}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
                        <Wallet className="w-5 h-5" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-300">
                    <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Paid Out</span>
                        <h3 className="text-2xl font-black text-emerald-600">₹{(activeStats.totalPaid || 0).toLocaleString()}</h3>
                    </div>
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-300">
                    <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Outstanding Balance Due</span>
                        <h3 className="text-2xl font-black text-rose-500">₹{(activeStats.totalDue || 0).toLocaleString()}</h3>
                    </div>
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Content Section: Hospital Distribution & Top Earners */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Hospital Donut Chart */}
                <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Doctors by Hospital</h3>
                        <p className="text-xs font-semibold text-slate-400 mb-6 uppercase tracking-wider">Hospital distribution density</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center py-4">
                        <DonutChart data={hospitalChartData} />
                    </div>
                </div>

                {/* Top Performing Doctors (Leaderboard) */}
                <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6">
                    <div>
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Top Earning Physicians</h3>
                        <p className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider">Ranked by total referral commissions</p>
                    </div>
                    <div className="space-y-2.5">
                        {(activeStats.topDoctors || []).length > 0 ? (
                            (activeStats.topDoctors || []).map((doc, idx) => (
                                <div key={doc._id || idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-black text-xs">
                                            #{idx + 1}
                                        </span>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 uppercase tracking-tight">{doc.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-slate-900">₹{doc.totalEarnings.toLocaleString()}</p>
                                        <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                            Paid: ₹{doc.paid.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                No Doctor Earnings Recorded
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Payments Registry */}
            <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-600" />
                            Recent Payment Transactions
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Latest referral commissions posted</p>
                    </div>
                    <button 
                        onClick={() => window.location.href = '/admin/doctors'}
                        className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 flex items-center gap-2 transition-all"
                    >
                        View Doctor Registry
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Doctor</th>
                                <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Hospital</th>
                                <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Referral Amount</th>
                                <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Paid</th>
                                <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Due</th>
                                <th className="pb-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {(activeStats.recentPayments || []).length > 0 ? (
                                (activeStats.recentPayments || []).map((p, idx) => (
                                    <tr key={p._id || idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 text-xs font-medium text-slate-500">
                                            {new Date(p.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 text-xs font-bold text-slate-800 uppercase tracking-tight">{p.doctorName}</td>
                                        <td className="py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-[10px]">{p.hospitalName}</td>
                                        <td className="py-3 text-xs font-bold text-slate-900">₹{p.totalReferralAmount.toLocaleString()}</td>
                                        <td className="py-3 text-xs font-bold text-emerald-600">₹{p.paidAmount.toLocaleString()}</td>
                                        <td className="py-3 text-xs font-bold text-rose-500">₹{p.dueAmount.toLocaleString()}</td>
                                        <td className="py-3 text-right">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border",
                                                p.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                p.paymentStatus === "PARTIALLY_PAID" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                "bg-rose-50 text-rose-500 border-rose-100"
                                            )}>
                                                {p.paymentStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        No Recent Payments Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
