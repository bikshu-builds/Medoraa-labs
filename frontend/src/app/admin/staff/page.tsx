"use client";
import React, { useEffect, useState } from "react";
import Table from "../components/Table";
import StaffModal from "../components/StaffModal";
import { UserPlus, Search, Edit2, Trash2, Phone, Mail, ShieldCheck, UserCircle2 } from "lucide-react";
import { Staff } from "../types";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

const StaffManagement: React.FC = () => {
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

    const fetchStaff = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/admins"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setStaffList(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch staff list", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleAdd = () => {
        setSelectedStaff(null);
        setIsModalOpen(true);
    };

    const handleEdit = (staff: Staff) => {
        setSelectedStaff(staff);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        const storedUser = localStorage.getItem("adminUser");
        let isSelf = false;
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                const selfId = user.id || user._id;
                if (selfId === id) isSelf = true;
            } catch (e) {
                console.error(e);
            }
        }

        if (isSelf) {
            alert("You cannot delete your own account.");
            return;
        }

        if (!confirm("Are you sure you want to remove this staff account? This action cannot be undone.")) return;
        
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl(`/api/admin/admins/${id}`), {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setStaffList(staffList.filter(s => s._id !== id));
            } else {
                alert(data.message || "Delete failed");
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const handleSave = async (staffData: Partial<Staff>) => {
        try {
            const token = localStorage.getItem("adminToken");
            const url = selectedStaff 
                ? getApiUrl(`/api/admin/admins/${selectedStaff._id}`)
                : getApiUrl("/api/admin/admins");
            
            const method = selectedStaff ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(staffData)
            });

            const data = await res.json();
            if (data.success) {
                fetchStaff(); // Refresh list
                setIsModalOpen(false);
            } else {
                alert(data.message || "Operation failed");
            }
        } catch (err) {
            console.error("Save failed", err);
        }
    };

    const filteredStaff = staffList.filter(staff => 
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (staff.role || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        { 
            header: "Staff Member", 
            accessor: "name" as const,
            render: (row: Staff) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shrink-0">
                        <UserCircle2 className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-900 truncate">{row.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Ref: {row._id.slice(-6).toUpperCase()}</span>
                    </div>
                </div>
            )
        },
        { 
            header: "Contact / Email", 
            accessor: "email" as const,
            render: (row: Staff) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {row.email}
                    </div>
                    {row.mobileNumber && (
                        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {row.mobileNumber}
                        </div>
                    )}
                </div>
            )
        },
        {
            header: "Role / Permissions",
            accessor: "role" as const,
            render: (row: Staff) => {
                const role = row.role || "admin";
                return (
                    <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded border w-fit",
                        role === "admin" && "bg-purple-50 text-purple-700 border-purple-100",
                        role === "registration" && "bg-cyan-50 text-cyan-700 border-cyan-100",
                        role === "authorization" && "bg-amber-50 text-amber-700 border-amber-100",
                        role === "inventory" && "bg-emerald-50 text-emerald-700 border-emerald-100"
                    )}>
                        <ShieldCheck className="w-3 h-3" />
                        {role}
                    </span>
                );
            }
        },
        { 
            header: "Status", 
            accessor: "status" as const,
            render: (row: Staff) => {
                const status = row.status || "active";
                return (
                    <div className="flex items-center gap-2">
                        <div className={cn("w-1.5 h-1.5 rounded-full", status === "active" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-slate-300")} />
                        <span className={cn("text-[10px] font-bold uppercase tracking-widest", status === "active" ? "text-emerald-700" : "text-slate-500")}>
                            {status}
                        </span>
                    </div>
                );
            }
        }
    ];

    const actions = (row: Staff) => (
        <div className="flex items-center gap-2 justify-end">
            <button 
                onClick={() => handleEdit(row)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-200 rounded transition-all"
                title="Edit Details & Role"
            >
                <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button 
                onClick={() => handleDelete(row._id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white border border-transparent hover:border-slate-200 rounded transition-all"
                title="Delete Account"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>
        </div>
    );

    if (isLoading && staffList.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Querying Accounts...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Management</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Create and manage internal staff accounts and assign system roles.</p>
                </div>
                <button 
                    onClick={handleAdd}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded text-xs transition-all active:scale-95 shadow-md"
                >
                    <UserPlus className="w-4 h-4" />
                    Register New Staff
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-[400px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by name, email, or role..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium text-slate-900"
                    />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] bg-slate-100 px-3 py-1.5 rounded">
                    Total Records: <span className="text-slate-900 ml-1 font-black">{filteredStaff.length}</span>
                </div>
            </div>

            <Table 
                columns={columns} 
                data={filteredStaff} 
                actions={actions}
            />

            <StaffModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave} 
                staff={selectedStaff} 
            />
        </div>
    );
}

export default StaffManagement;
