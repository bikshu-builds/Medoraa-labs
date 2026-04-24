"use client";
import React, { useEffect, useState } from "react";
import Table from "../components/Table";
import EmployeeModal from "../components/EmployeeModal";
import { Users, Search, Edit2, Trash2, ShieldCheck, Mail, Phone, Calendar, UserPlus } from "lucide-react";
import { Employee } from "../types";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

const EmployeeManagement: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const fetchEmployees = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/employees"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setEmployees(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch employees", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleAdd = () => {
        setSelectedEmployee(null);
        setIsModalOpen(true);
    };

    const handleEdit = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this employee? All access will be revoked immediately.")) return;
        
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl(`/api/admin/employees/${id}`), {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setEmployees(employees.filter(e => e._id !== id));
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const handleSave = async (employeeData: Partial<Employee>) => {
        try {
            const token = localStorage.getItem("adminToken");
            const url = selectedEmployee 
                ? getApiUrl(`/api/admin/employees/${selectedEmployee._id}`)
                : getApiUrl("/api/admin/employees");
            
            const method = selectedEmployee ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(employeeData)
            });

            const data = await res.json();
            if (data.success) {
                fetchEmployees(); // Refresh list
                setIsModalOpen(false);
            } else {
                alert(data.message || "Operation failed");
            }
        } catch (err) {
            console.error("Save failed", err);
        }
    };

    const filteredEmployees = employees.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        { 
            header: "Team Member", 
            accessor: "name" as const,
            render: (row: Employee) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-slate-50 flex items-center justify-center text-slate-400 font-bold border border-slate-200 text-xs overflow-hidden shrink-0">
                        {row.profileImage ? (
                            <img src={row.profileImage} alt={row.name} className="w-full h-full object-cover" />
                        ) : (
                            <span>{row.name.charAt(0)}</span>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-900 truncate">{row.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.employeeId}</span>
                    </div>
                </div>
            )
        },
        { 
            header: "Role / Department", 
            accessor: "role" as const,
            render: (row: Employee) => (
                <div className="flex items-center gap-2">
                    <ShieldCheck className={cn(
                        "w-3.5 h-3.5",
                        row.role === "Lab Staff" ? "text-blue-500" : 
                        row.role === "Marketing Team" ? "text-purple-500" : "text-emerald-500"
                    )} />
                    <span className="text-xs font-bold text-slate-700">{row.role}</span>
                </div>
            )
        },
        { 
            header: "Contact Info", 
            accessor: "email" as const,
            render: (row: Employee) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {row.email}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {row.phoneNumber}
                    </div>
                </div>
            )
        },
        { 
            header: "Joined Date", 
            accessor: "joiningDate" as const,
            render: (row: Employee) => (
                <div className="flex items-center gap-2 text-slate-600 font-bold text-xs bg-slate-50 px-2 py-1 rounded border border-slate-100 w-fit">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(row.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
            )
        },
        { 
            header: "Status", 
            accessor: "status" as const,
            render: (row: Employee) => (
                <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border",
                    row.status === "active" 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                    : "bg-slate-50 text-slate-500 border-slate-200"
                )}>
                    {row.status}
                </span>
            )
        }
    ];

    const actions = (row: Employee) => (
        <div className="flex items-center gap-2 justify-end">
            <button 
                onClick={() => handleEdit(row)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-200 rounded transition-all"
            >
                <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button 
                onClick={() => handleDelete(row._id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white border border-transparent hover:border-slate-200 rounded transition-all"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>
        </div>
    );

    if (isLoading && employees.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Directory...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Workforce Management</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Internal staff directory and departmental role control.</p>
                </div>
                <button 
                    onClick={handleAdd}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded text-xs transition-all active:scale-95"
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
                        placeholder="Search by name, ID, or department..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium text-slate-900"
                    />
                </div>
            </div>

            <Table 
                columns={columns} 
                data={filteredEmployees} 
                actions={actions}
            />

            <EmployeeModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave} 
                employee={selectedEmployee} 
            />
        </div>
    );
}

export default EmployeeManagement;
