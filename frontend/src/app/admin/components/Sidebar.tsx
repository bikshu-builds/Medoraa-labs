"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    UserPlus,
    Users,
    UserCheck,
    MapPin,
    CircleDollarSign,
    Home,
    BarChart3,
    FileText,
    LogOut,
    Clock,
    Bell,
    Calendar,
    ShieldCheck,
    StickyNote,
    Wallet,
    LineChart,
    Map,
    Sparkles,
    FlaskConical,
    Shield,
    AlertTriangle,
    Database,
    Settings,
    X,
    Loader2,
    CheckCircle2,
    Pencil,
    Trash2,
    Key,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    Share2,
    QrCode,
    Upload
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getApiUrl } from "@/lib/api";

const Sidebar: React.FC = () => {
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"add" | "manage" | "qrcode">("add");
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [adminList, setAdminList] = useState<any[]>([]);
    const [currentAdmin, setCurrentAdmin] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // QR Code States
    const [upiQrCode, setUpiQrCode] = useState<string>("");
    const [upiId, setUpiId] = useState<string>("");
    const [isUploadingQr, setIsUploadingQr] = useState(false);
    const [qrSuccessMsg, setQrSuccessMsg] = useState("");

    // Edit states
    const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editPassword, setEditPassword] = useState("");
    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
        "Registrations": false
    });
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (pathname === "/admin/registration" || pathname === "/admin/registration/samples") {
            setOpenDropdowns(prev => ({ ...prev, "Registrations": true }));
        }
        const storedUser = localStorage.getItem("adminUser");
        if (storedUser) {
            try {
                setCurrentAdmin(JSON.parse(storedUser));
            } catch (e) {
                console.error(e);
            }
        }
    }, [pathname]);

    const menuItems = [
        {
            group: "Main", items: [
                { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard", isDropdown: false, roles: ["admin"] },
                { name: "Examiner Desk", icon: FlaskConical, path: "/examiner", isDropdown: false, roles: ["admin", "examiner"] },
                { name: "Authorization Desk", icon: ShieldCheck, path: "/authorization", isDropdown: false, roles: ["admin", "authorization"] },
                {
                    name: "Registrations",
                    icon: FileText,
                    isDropdown: true,
                    roles: ["admin", "registration"],
                    subItems: [
                        { name: "Patient Registration", icon: UserPlus, path: "/registration" },
                        { name: "Samples", icon: Database, path: "/admin/registration/samples" }
                    ]
                },
                { name: "Referral Module", icon: Share2, path: "/admin/doctors", isDropdown: false, roles: ["admin"] },
                { name: "Staff", icon: Users, path: "/admin/staff", isDropdown: false, roles: ["admin"] },
            ]
        }
    ];

    const fetchAdmins = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/admins"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setAdminList(data.data.filter((a: any) => a.role === "admin" || !a.role));
            }
        } catch (err) {
            console.error("Failed to fetch admins", err);
        }
    };

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/settings"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                setUpiQrCode(data.data.upiQrCode || "");
                setUpiId(data.data.upiId || "");
            }
        } catch (err) {
            console.error("Failed to fetch settings", err);
        }
    };

    const handleFileUploadQr = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size should be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Image = reader.result as string;
            setIsUploadingQr(true);
            setError("");
            setQrSuccessMsg("");
            try {
                const token = localStorage.getItem("adminToken");
                const res = await fetch(getApiUrl("/api/admin/settings/qr-code"), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ upiQrCode: base64Image, upiId })
                });
                const data = await res.json();
                if (data.success) {
                    setUpiQrCode(base64Image);
                    setQrSuccessMsg("UPI QR Code uploaded successfully!");
                    setTimeout(() => setQrSuccessMsg(""), 3000);
                } else {
                    setError(data.message || "Failed to upload QR Code");
                }
            } catch (err: any) {
                setError(err.message || "Failed to upload QR Code");
            } finally {
                setIsUploadingQr(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteQr = async () => {
        if (!confirm("Are you sure you want to delete the active UPI QR Code?")) return;
        setIsUploadingQr(true);
        setError("");
        setQrSuccessMsg("");
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/settings/qr-code"), {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setUpiQrCode("");
                setQrSuccessMsg("UPI QR Code deleted successfully!");
                setTimeout(() => setQrSuccessMsg(""), 3000);
            } else {
                setError(data.message || "Failed to delete QR Code");
            }
        } catch (err: any) {
            setError(err.message || "Failed to delete QR Code");
        } finally {
            setIsUploadingQr(false);
        }
    };

    useEffect(() => {
        if (isModalOpen) {
            fetchAdmins();
            fetchSettings();
            setActiveTab("add");
            setError("");
            setSuccess(false);
            setQrSuccessMsg("");
            setEditingAdminId(null);
        }
    }, [isModalOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        setSuccess(false);

        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/admins"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ ...formData, role: "admin" })
            });

            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                setFormData({ name: "", email: "", password: "" });
                fetchAdmins();
                setTimeout(() => {
                    setSuccess(false);
                }, 1500);
            } else {
                setError(data.message || "Failed to create administrator");
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStartEdit = (admin: any) => {
        setEditingAdminId(admin._id);
        setEditName(admin.name);
        setEditEmail(admin.email);
        setEditPassword("");
    };

    const handleUpdateAdmin = async (id: string) => {
        setError("");
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("adminToken");
            const payload: any = { name: editName, email: editEmail, role: "admin" };
            if (editPassword) payload.password = editPassword;

            const res = await fetch(getApiUrl(`/api/admin/admins/${id}`), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setEditingAdminId(null);
                setEditPassword("");
                fetchAdmins();
                // If they updated themselves, update localStorage
                const selfId = currentAdmin?.id || currentAdmin?._id;
                if (selfId === id) {
                    const updatedUser = { ...currentAdmin, name: editName, email: editEmail, role: "admin" };
                    localStorage.setItem("adminUser", JSON.stringify(updatedUser));
                    setCurrentAdmin(updatedUser);
                }
            } else {
                setError(data.message || "Failed to update administrator");
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAdmin = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this administrator?")) return;
        setError("");
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl(`/api/admin/admins/${id}`), {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                fetchAdmins();
            } else {
                setError(data.message || "Failed to delete admin");
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <aside className={cn(
            "relative flex flex-col h-full bg-[#1e293b] text-slate-300 transition-all duration-300 font-sans shrink-0", 
            isCollapsed ? "w-[72px]" : "w-64"
        )}>
            {/* Logo Section */}
            <div className={cn(
                "h-20 flex items-center border-b border-slate-700/50 transition-all duration-300 relative", 
                isCollapsed ? "px-0 justify-center" : "px-6 justify-between"
            )}>
                <div className="flex items-center min-w-0">
                    <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center shrink-0">
                        <ActivityIcon className="w-5 h-5 text-white" />
                    </div>
                    {!isCollapsed && (
                        <span className="ml-3 text-white font-bold text-lg tracking-tight truncate animate-in fade-in duration-200">
                            Medoraa Labs
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn(
                        "p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-all",
                        isCollapsed 
                            ? "absolute left-[54px] top-6 bg-[#1e293b] border border-slate-700 rounded-full p-1 shadow-md z-50 hover:scale-110 active:scale-95" 
                            : ""
                    )}
                >
                    {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-6 no-scrollbar">
                {menuItems.map((group, gIdx) => {
                    const userRole = isMounted ? (currentAdmin?.role || "") : "";
                    const filteredItems = group.items.filter(item => {
                        if (item.roles) {
                            return item.roles.includes(userRole);
                        }
                        return userRole === "admin";
                    });

                    if (filteredItems.length === 0) return null;

                    return (
                        <div key={gIdx} className="mb-8">
                            {!isCollapsed && (
                                <h3 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 animate-in fade-in duration-200">
                                    {group.group}
                                </h3>
                            )}
                            <ul className="space-y-1">
                                {filteredItems.map((item) => {
                                    if (item.isDropdown) {
                                        const isAnySubActive = item.subItems?.some(sub => pathname === sub.path);
                                        const isOpen = openDropdowns[item.name];
                                        return (
                                            <li key={item.name} className="space-y-1">
                                                <button
                                                    onClick={() => {
                                                        if (isCollapsed) {
                                                            setIsCollapsed(false);
                                                            setOpenDropdowns(prev => ({ ...prev, [item.name]: true }));
                                                        } else {
                                                            setOpenDropdowns(prev => ({ ...prev, [item.name]: !prev[item.name] }));
                                                        }
                                                    }}
                                                    className={cn(
                                                        "w-full flex items-center transition-colors text-slate-300 hover:bg-slate-800 hover:text-white outline-none rounded-md text-sm font-medium py-2",
                                                        isCollapsed ? "justify-center px-0" : "justify-between px-4",
                                                        isAnySubActive && "text-white bg-slate-800/40"
                                                    )}
                                                    title={isCollapsed ? item.name : undefined}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <item.icon className="w-4 h-4 text-slate-400 shrink-0" />
                                                        {!isCollapsed && <span className="animate-in fade-in duration-200">{item.name}</span>}
                                                    </div>
                                                    {!isCollapsed && (
                                                        isOpen ? (
                                                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                                        ) : (
                                                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                        )
                                                    )}
                                                </button>
                                                {isOpen && !isCollapsed && (
                                                    <ul className="pl-4 mt-1 space-y-1 border-l border-slate-700 ml-6 animate-in slide-in-from-top-1 duration-200">
                                                        {item.subItems?.map((sub) => {
                                                            const isSubActive = pathname === sub.path;
                                                            return (
                                                                <li key={sub.path}>
                                                                    <Link
                                                                        href={sub.path}
                                                                        className={cn(
                                                                            "flex items-center gap-3 px-4 py-1.5 rounded-md text-xs font-semibold transition-colors",
                                                                            isSubActive
                                                                                ? "bg-blue-600 text-white font-extrabold"
                                                                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                                                        )}
                                                                    >
                                                                        <sub.icon className={cn(
                                                                            "w-3.5 h-3.5 shrink-0",
                                                                            isSubActive ? "text-white" : "text-slate-500"
                                                                        )} />
                                                                        {sub.name}
                                                                    </Link>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                )}
                                            </li>
                                        );
                                    }

                                    const isActive = pathname === item.path;
                                    return (
                                        <li key={item.path || item.name}>
                                            <Link
                                                href={item.path || "#"}
                                                className={cn(
                                                    "flex items-center gap-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                                                    isCollapsed ? "justify-center px-0" : "px-4",
                                                    isActive
                                                        ? "bg-blue-600 text-white"
                                                        : "hover:bg-slate-800 hover:text-white"
                                                )}
                                                title={isCollapsed ? item.name : undefined}
                                            >
                                                <item.icon className={cn(
                                                    "w-4 h-4 shrink-0",
                                                    isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                                                )} />
                                                {!isCollapsed && <span className="animate-in fade-in duration-200">{item.name}</span>}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-slate-700/50">
                <div className={cn(
                    "flex items-center gap-3 mb-2 transition-all duration-300", 
                    isCollapsed ? "justify-center px-0" : "px-2 py-2"
                )}>
                    <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                        {currentAdmin?.name ? currentAdmin.name.slice(0, 2).toUpperCase() : "AD"}
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col min-w-0 animate-in fade-in duration-200">
                            <span className="text-xs font-bold text-white truncate">{currentAdmin?.name || "Administrator"}</span>
                            <span className="text-[10px] text-slate-500 truncate">{currentAdmin?.email || "admin@medoraa.com"}</span>
                        </div>
                    )}
                </div>
                {(currentAdmin?.role === "admin" || !currentAdmin?.role) && (
                    <button
                        onClick={() => {
                            setIsModalOpen(true);
                            setActiveTab("qrcode");
                        }}
                        className={cn(
                            "flex items-center gap-3 w-full py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-md text-sm transition-all mb-1 cursor-pointer",
                            isCollapsed ? "justify-center px-0" : "px-3"
                        )}
                        title={isCollapsed ? "Payment QR Code" : undefined}
                    >
                        <QrCode className="w-4 h-4 shrink-0 text-blue-400" />
                        {!isCollapsed && <span className="animate-in fade-in duration-200">Payment QR Code</span>}
                    </button>
                )}
                <button
                    onClick={() => {
                        localStorage.removeItem("adminToken");
                        localStorage.removeItem("adminUser");
                        window.location.href = "/signin";
                    }}
                    className={cn(
                        "flex items-center gap-3 w-full py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-md text-sm transition-all",
                        isCollapsed ? "justify-center px-0" : "px-3"
                    )}
                    title={isCollapsed ? "Logout" : undefined}
                >
                    <LogOut className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="animate-in fade-in duration-200">Logout</span>}
                </button>
            </div>

            {/* Add / Manage Admin Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl p-6 border border-slate-200 text-slate-800 font-sans z-[101]">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <QrCode className="w-5 h-5 text-blue-600" />
                                    UPI Payment QR Code
                                </h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Manage lab payment QR code for patient billing</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 mt-4">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-xs font-semibold">
                                    {error}
                                </div>
                            )}
                            {qrSuccessMsg && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded text-xs font-semibold flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                    {qrSuccessMsg}
                                </div>
                            )}

                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-center">
                                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                                    Active Payment QR Code
                                </h4>

                                {upiQrCode ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm inline-block">
                                            <img
                                                src={upiQrCode}
                                                alt="Active UPI QR Code"
                                                className="w-44 h-44 object-contain rounded-lg"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleDeleteQr}
                                            disabled={isUploadingQr}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg text-xs transition-colors border border-rose-200 cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete Uploaded QR
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-400">
                                        <QrCode className="w-12 h-12 text-slate-300 stroke-[1.5]" />
                                        <p className="text-xs font-medium">No UPI QR Code uploaded yet</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                    {upiQrCode ? "Replace QR Code Image" : "Upload New QR Code Image"}
                                </label>
                                <label className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-50 hover:bg-blue-100/80 border-2 border-dashed border-blue-300 text-blue-700 font-bold rounded-xl text-xs cursor-pointer transition-all">
                                    <Upload className="w-4 h-4" />
                                    <span>{isUploadingQr ? "Uploading Image..." : "Choose Image (PNG/JPG)"}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        disabled={isUploadingQr}
                                        onChange={handleFileUploadQr}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};

function ActivityIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
    )
}

export default Sidebar;
