"use client";
import React, { useEffect, useState } from "react";
import Table from "../components/Table";
import DoctorModal from "../components/DoctorModal";
import { UserPlus, Search, Edit2, Trash2, Phone, Mail, Building2, UserCircle2 } from "lucide-react";
import { Doctor } from "../types";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

const DoctorManagement: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

    const fetchDoctors = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/doctors"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setDoctors(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch doctors", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const handleAdd = () => {
        setSelectedDoctor(null);
        setIsModalOpen(true);
    };

    const handleEdit = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this medical partner? This action cannot be undone.")) return;
        
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl(`/api/admin/doctors/${id}`), {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setDoctors(doctors.filter(d => d._id !== id));
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const handleSave = async (doctorData: Partial<Doctor>) => {
        const token = localStorage.getItem("adminToken");
        const url = selectedDoctor 
            ? getApiUrl(`/api/admin/doctors/${selectedDoctor._id}`)
            : getApiUrl("/api/admin/doctors");
        
        const method = selectedDoctor ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(doctorData)
        });

        const data = await res.json();
        if (data.success) {
            fetchDoctors(); // Refresh list
        } else {
            throw new Error(data.message || "Operation failed");
        }
    };

    const filteredDoctors = doctors.filter(doctor => 
        doctor.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof doctor.hospitalId === 'object' ? doctor.hospitalId?.hospitalName : doctor.hospitalId)?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        { 
            header: "Medical Professional", 
            accessor: "doctorName" as const,
            render: (row: Doctor) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shrink-0">
                        <UserCircle2 className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-900 truncate">{row.doctorName}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Ref: {row.doctorCode || row._id.slice(-6).toUpperCase()}</span>
                    </div>
                </div>
            )
        },
        { 
            header: "Hospital Name", 
            accessor: "hospitalId" as const,
            render: (row: Doctor) => {
                const hospitalName = (typeof row.hospitalId === 'object' && row.hospitalId !== null)
                    ? (row.hospitalId.branch ? `${row.hospitalId.hospitalName} (${row.hospitalId.branch})` : row.hospitalId.hospitalName)
                    : (row.hospitalId || "Not Associated");
                return (
                    <div className="flex flex-col max-w-[180px]">
                        <div className="flex items-start gap-1.5 text-slate-700 font-bold text-xs">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2 break-words">{hospitalName}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            header: "Degree",
            accessor: "degree" as const,
            render: (row: Doctor) => (
                <div className="text-xs font-bold text-slate-700">{row.degree}</div>
            )
        },
        {
            header: "Specialization",
            accessor: "specialization" as const,
            render: (row: Doctor) => (
                <div className="text-xs font-bold text-slate-700">{row.specialization}</div>
            )
        },
        { 
            header: "Communication", 
            accessor: "mobileNumber" as const,
            render: (row: Doctor) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {row.mobileNumber}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {row.email}
                    </div>
                </div>
            )
        },
        { 
            header: "Referral Share", 
            accessor: "referralPercentage" as const,
            render: (row: Doctor) => {
                const periodLabel = row.periodType ? row.periodType.toLowerCase().replace('_', ' ') : "";

                return (
                    <div className="flex flex-col gap-1 min-w-[150px]">
                        <div className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit uppercase tracking-tight">
                            {row.referralPercentage}% Share
                        </div>
                        {periodLabel && (
                            <span className="text-[10px] text-slate-400 font-bold capitalize">
                                {periodLabel}
                            </span>
                        )}
                    </div>
                );
            }
        },
        { 
            header: "Status", 
            accessor: "status" as const,
            render: (row: Doctor) => (
                <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full", row.status === "ACTIVE" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-slate-300")} />
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest", row.status === "ACTIVE" ? "text-emerald-700" : "text-slate-500")}>
                        {row.status}
                    </span>
                </div>
            )
        }
    ];

    const actions = (row: Doctor) => (
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

    if (isLoading && doctors.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Querying Partners...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Medical Partners</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">External referring physicians and hospital branch management.</p>
                </div>
                <button 
                    onClick={handleAdd}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded text-xs transition-all active:scale-95"
                >
                    <UserPlus className="w-4 h-4" />
                    Onboard New Partner
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-[400px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by name, hospital, or email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium text-slate-900"
                    />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] bg-slate-100 px-3 py-1.5 rounded">
                    Total Records: <span className="text-slate-900 ml-1 font-black">{filteredDoctors.length}</span>
                </div>
            </div>

            <Table 
                columns={columns} 
                data={filteredDoctors} 
                actions={actions}
            />

            <DoctorModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave} 
                doctor={selectedDoctor} 
            />
        </div>
    );
}

export default DoctorManagement;
