"use client";
import React, { useEffect, useState } from "react";
import Table from "../components/Table";
import PatientModal from "../components/PatientModal";
import PatientViewModal from "../components/PatientViewModal";
import { 
    Search, 
    Filter, 
    Eye, 
    FileText, 
    UserPlus, 
    Download, 
    Trash2, 
    Edit2,
    Calendar,
    ChevronRight,
    Activity,
    UserCircle2
} from "lucide-react";
import { Patient } from "../types";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

const PatientMonitoring: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    const fetchPatients = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/patients"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setPatients(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch patients", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleAdd = () => {
        setSelectedPatient(null);
        setIsModalOpen(true);
    };

    const handleEdit = (patient: Patient) => {
        setSelectedPatient(patient);
        setIsModalOpen(true);
    };

    const handleView = (patient: Patient) => {
        setSelectedPatient(patient);
        setIsViewModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this patient record? This will delete all associated test history.")) return;
        
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl(`/api/admin/patients/${id}`), {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setPatients(patients.filter(p => p._id !== id));
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const handleSave = async (patientData: Partial<Patient>) => {
        try {
            const token = localStorage.getItem("adminToken");
            const url = selectedPatient 
                ? getApiUrl(`/api/admin/patients/${selectedPatient._id}`)
                : getApiUrl("/api/admin/patients");
            
            const method = selectedPatient ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(patientData)
            });

            const data = await res.json();
            if (data.success) {
                fetchPatients();
                setIsModalOpen(false);
            } else {
                alert(data.message || "Operation failed");
            }
        } catch (err) {
            console.error("Save failed", err);
        }
    };

    const handleGenerateReport = () => {
        const headers = ["Patient ID", "Name", "Age", "Gender", "Phone", "Source", "Status", "Revenue", "Date"];
        const rows = patients.map(p => [
            p.patientId,
            p.name,
            p.age,
            p.gender,
            p.phoneNumber,
            p.sourceType,
            p.testStatus,
            p.revenue,
            new Date(p.date).toLocaleDateString()
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `patient_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredPatients = patients.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.patientId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        { 
            header: "Patient Profile", 
            accessor: "name" as const,
            render: (row: Patient) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shrink-0">
                        <UserCircle2 className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-900 truncate">{row.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{row.patientId}</span>
                    </div>
                </div>
            )
        },
        { 
            header: "Clinical Meta", 
            accessor: "age" as const,
            render: (row: Patient) => (
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">{row.age} Years</span>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{row.gender}</span>
                </div>
            )
        },
        { 
            header: "Traffic Source", 
            accessor: "sourceType" as const,
            render: (row: Patient) => (
                <div className="flex flex-col gap-1">
                    <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border w-fit",
                        row.sourceType === "Walk-in" ? "bg-blue-50 text-blue-700 border-blue-100" :
                        row.sourceType === "Home Collection" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        "bg-purple-50 text-purple-700 border-purple-100"
                    )}>
                        {row.sourceType}
                    </span>
                    {row.doctorReferral && typeof row.doctorReferral !== 'string' && (
                        <span className="text-[10px] text-slate-400 font-bold italic truncate max-w-[120px]">Dr. {row.doctorReferral.name}</span>
                    )}
                </div>
            )
        },
        { 
            header: "Test Cycle", 
            accessor: "testStatus" as const,
            render: (row: Patient) => (
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        row.testStatus === "Completed" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" :
                        row.testStatus === "Processing" ? "bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.4)]" : 
                        "bg-amber-500"
                    )} />
                    <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        row.testStatus === "Completed" ? "text-emerald-700" :
                        row.testStatus === "Processing" ? "text-blue-700" : "text-amber-700"
                    )}>
                        {row.testStatus}
                    </span>
                </div>
            )
        },
        { 
            header: "Entry Date", 
            accessor: "date" as const,
            render: (row: Patient) => (
                <div className="flex items-center gap-2 text-slate-600 font-bold text-xs bg-slate-50 px-2 py-1 rounded border border-slate-100 w-fit">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </div>
            )
        }
    ];

    const actions = (row: Patient) => (
        <div className="flex items-center gap-2 justify-end">
            <button 
                onClick={() => handleView(row)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-200 rounded transition-all"
            >
                <Eye className="w-3.5 h-3.5" />
            </button>
            <button 
                onClick={() => handleEdit(row)}
                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-white border border-transparent hover:border-slate-200 rounded transition-all"
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

    if (isLoading && patients.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compiling Records...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Monitoring</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Full visibility of clinical intake, laboratory status, and source analytics.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleGenerateReport}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Download className="w-4 h-4 text-slate-400" />
                        Generate CSV
                    </button>
                    <button 
                        onClick={handleAdd}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded text-xs transition-all active:scale-95"
                    >
                        <UserPlus className="w-4 h-4" />
                        New Registration
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-[400px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by name, patient ID, or contact..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium text-slate-900"
                    />
                </div>
            </div>

            <Table 
                columns={columns} 
                data={filteredPatients} 
                actions={actions}
            />

            <PatientModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave} 
                patient={selectedPatient} 
            />

            <PatientViewModal 
                isOpen={isViewModalOpen} 
                onClose={() => setIsViewModalOpen(false)} 
                patient={selectedPatient} 
            />
        </div>
    );
}

export default PatientMonitoring;
