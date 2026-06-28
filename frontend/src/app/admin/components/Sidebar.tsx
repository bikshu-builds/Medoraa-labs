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
    Share2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getApiUrl } from "@/lib/api";

const Sidebar: React.FC = () => {
    const pathname = usePathname();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"add" | "manage">("add");
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [adminList, setAdminList] = useState<any[]>([]);
    const [currentAdmin, setCurrentAdmin] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Edit states
    const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editPassword, setEditPassword] = useState("");
    const [isReferralOpen, setIsReferralOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        if (pathname === "/admin/hospitals" || pathname === "/admin/doctors") {
            setIsReferralOpen(true);
        }
    }, [pathname]);

    const menuItems = [
        {
            group: "Main", items: [
                { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard", isDropdown: false },
                {
                    name: "Referral Module",
                    icon: Share2,
                    isDropdown: true,
                    subItems: [
                        { name: "Hospital", icon: Home, path: "/admin/hospitals" },
                        { name: "Doctors", icon: UserPlus, path: "/admin/doctors" },
                    ]
                },
                { name: "Staff", icon: Users, path: "/admin/staff", isDropdown: false },
            ]
        }
    ];

    useEffect(() => {
        const storedUser = localStorage.getItem("adminUser");
        if (storedUser) {
            try {
                setCurrentAdmin(JSON.parse(storedUser));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

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

    useEffect(() => {
        if (isModalOpen) {
            fetchAdmins();
            setActiveTab("add");
            setError("");
            setSuccess(false);
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
                    const userRole = currentAdmin?.role || "admin";
                    const filteredItems = group.items.filter(item => {
                        if (item.isDropdown) return userRole === "admin";
                        if (item.path === "/admin/dashboard") return true;
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
                                        return (
                                            <li key={item.name} className="space-y-1">
                                                <button
                                                    onClick={() => {
                                                        if (isCollapsed) {
                                                            setIsCollapsed(false);
                                                            setIsReferralOpen(true);
                                                        } else {
                                                            setIsReferralOpen(!isReferralOpen);
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
                                                        isReferralOpen ? (
                                                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                                        ) : (
                                                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                        )
                                                    )}
                                                </button>
                                                {isReferralOpen && !isCollapsed && (
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
                        onClick={() => setIsModalOpen(true)}
                        className={cn(
                            "flex items-center gap-3 w-full py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-md text-sm transition-all mb-1",
                            isCollapsed ? "justify-center px-0" : "px-3"
                        )}
                        title={isCollapsed ? "Add Admin" : undefined}
                    >
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        {!isCollapsed && <span className="animate-in fade-in duration-200">Add Admin</span>}
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
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Admin Accounts</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Manage system access privileges</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tab Switcher */}
                        <div className="flex border-b border-slate-100 mt-3 mb-4">
                            <button
                                type="button"
                                onClick={() => { setActiveTab("add"); setError(""); }}
                                className={cn(
                                    "flex-1 pb-2 text-xs font-bold uppercase tracking-wider border-b-2 text-center transition-all",
                                    activeTab === "add" ? "border-blue-600 text-blue-600 font-extrabold" : "border-transparent text-slate-400 hover:text-slate-600"
                                )}
                            >
                                Add Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => { setActiveTab("manage"); setError(""); }}
                                className={cn(
                                    "flex-1 pb-2 text-xs font-bold uppercase tracking-wider border-b-2 text-center transition-all",
                                    activeTab === "manage" ? "border-blue-600 text-blue-600 font-extrabold" : "border-transparent text-slate-400 hover:text-slate-600"
                                )}
                            >
                                Manage ({adminList.length})
                            </button>
                        </div>

                        {activeTab === "add" && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-xs font-semibold">
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded text-xs font-semibold flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                                        Administrator registered successfully!
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name (*)</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address (*)</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="e.g. admin@medoraa.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password (*)</label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
                                    />
                                </div>

                                <div className="pt-2 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 uppercase tracking-wider"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs uppercase tracking-wider shadow-lg shadow-blue-600/10 disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        )}
                                        Create Admin
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === "manage" && (
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-xs font-semibold">
                                        {error}
                                    </div>
                                )}
                                
                                {adminList.map((admin) => {
                                    const selfId = currentAdmin?.id || currentAdmin?._id;
                                    const isSelf = selfId === admin._id;
                                    const isEditing = editingAdminId === admin._id;

                                    return (
                                        <div key={admin._id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-lg space-y-2">
                                            {isEditing ? (
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Name</label>
                                                            <input
                                                                type="text"
                                                                value={editName}
                                                                onChange={(e) => setEditName(e.target.value)}
                                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Email</label>
                                                            <input
                                                                type="email"
                                                                value={editEmail}
                                                                onChange={(e) => setEditEmail(e.target.value)}
                                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                                                        <input
                                                            type="password"
                                                            placeholder="••••••••"
                                                            value={editPassword}
                                                            onChange={(e) => setEditPassword(e.target.value)}
                                                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end gap-1.5 pt-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingAdminId(null)}
                                                            className="px-2.5 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-700 uppercase tracking-wider"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateAdmin(admin._id)}
                                                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-[10px] uppercase tracking-wider"
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-xs font-bold text-slate-800 truncate flex items-center gap-1.5">
                                                            {admin.name}
                                                            {isSelf && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-bold rounded uppercase tracking-wider border border-blue-100">You</span>}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-bold truncate mt-0.5">{admin.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStartEdit(admin)}
                                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded transition-colors"
                                                            title="Edit Details & Password"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        {!isSelf && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteAdmin(admin._id)}
                                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded transition-colors"
                                                                title="Delete Account"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
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
