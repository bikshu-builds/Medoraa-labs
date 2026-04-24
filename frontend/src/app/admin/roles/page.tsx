"use client";
import React, { useState, useEffect } from "react";
import Table from "../components/Table";
import { 
    Shield, 
    Plus, 
    Trash2, 
    Edit2, 
    CheckCircle2, 
    XCircle,
    Lock,
    Users
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Role {
    _id: string;
    name: string;
    permissions: string[];
    status: 'active' | 'inactive';
}

const RolesPage = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    const categories = [
        "Dashboard Access",
        "Doctor Management",
        "Employee Management",
        "Patient Access",
        "Reports Access",
        "Analytics Access",
        "Billing Access",
        "Source Tracking Access"
    ];

    const fetchRoles = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/roles"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setRoles(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const columns = [
        { 
            header: "Role Identity", 
            accessor: "name" as const,
            render: (row: Role) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                        <Lock className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-900">{row.name}</span>
                </div>
            )
        },
        { 
            header: "Privileges", 
            accessor: "permissions" as const,
            render: (row: Role) => (
                <div className="flex flex-wrap gap-1 max-w-[400px]">
                    {row.permissions.map(p => (
                        <span key={p} className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">
                            {p}
                        </span>
                    ))}
                </div>
            )
        },
        { 
            header: "Operational Status", 
            accessor: "status" as const,
            render: (row: Role) => (
                <div className="flex items-center gap-2">
                    {row.status === 'active' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                        <XCircle className="w-4 h-4 text-slate-300" />
                    )}
                    <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        row.status === 'active' ? "text-emerald-600" : "text-slate-400"
                    )}>
                        {row.status}
                    </span>
                </div>
            )
        }
    ];

    const actions = (row: Role) => (
        <div className="flex items-center gap-2">
            <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
                <Edit2 className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors">
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Access Control</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Manage departmental roles and specific module permissions.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/10"
                >
                    <Plus className="w-4 h-4" />
                    Define New Role
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Roles</p>
                        <p className="text-2xl font-black text-slate-900">{roles.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sub-Admins</p>
                        <p className="text-2xl font-black text-slate-900">04</p>
                    </div>
                </div>
            </div>

            <Table 
                columns={columns} 
                data={roles} 
                actions={actions}
            />
        </div>
    );
};

export default RolesPage;
