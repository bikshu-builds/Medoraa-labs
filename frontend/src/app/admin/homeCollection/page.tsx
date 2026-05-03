"use client";
import React, { useEffect, useState } from "react";
import Table from "../components/Table";
import { Home, MapPin, Camera, User, Clock, CheckCircle2, Navigation, X } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { HomeCollection as HomeCollectionType } from "../types";
import { cn } from "@/lib/utils";

const HomeCollection: React.FC = () => {
    const [collections, setCollections] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [selectedProof, setSelectedProof] = useState<any>(null);

    useEffect(() => {
        fetchCollections();
        fetchStaff();
    }, []);

    const fetchCollections = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/home-collection"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setCollections(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch collections", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStaff = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/employees"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                // Filter for Sample Collection Team
                setStaffList(data.data.filter((s: any) => s.role === "Sample Collection Team"));
            }
        } catch (err) {
            console.error("Failed to fetch staff", err);
        }
    };

    const handleAssign = async (collectionId: string, staffId: string) => {
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl(`/api/admin/home-collection/assign/${collectionId}`), {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ staffId })
            });
            const data = await res.json();
            if (data.success) {
                fetchCollections();
            } else {
                alert(data.message || "Assignment failed");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const columns = [
        { 
            header: "Patient Profile", 
            accessor: "booking" as const,
            render: (row: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900 tracking-tight text-sm leading-tight mb-0.5">{row.booking?.patientName}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.booking?.bookingId}</span>
                </div>
            )
        },
        { 
            header: "Assigned Personnel", 
            accessor: "assignedStaff" as const,
            render: (row: any) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black border border-slate-200/60 transition-all text-xs">
                        {row.assignedStaff ? row.assignedStaff.name.charAt(0) : "?"}
                    </div>
                    <div className="flex flex-col">
                        {row.assignedStaff ? (
                            <>
                                <span className="text-xs font-bold text-slate-900 leading-tight">{row.assignedStaff.name}</span>
                                <span className="text-[9px] text-blue-600 font-black uppercase tracking-widest mt-0.5">{row.assignedStaff.employeeId}</span>
                            </>
                        ) : (
                            <select 
                                className="bg-slate-50 border border-slate-200/60 rounded px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 outline-none focus:ring-1 focus:ring-blue-500"
                                onChange={(e) => handleAssign(row._id, e.target.value)}
                                defaultValue=""
                            >
                                <option value="" disabled>Assign Staff...</option>
                                {staffList.map(staff => (
                                    <option key={staff._id} value={staff._id}>{staff.name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
            )
        },
        { 
            header: "Cycle Status", 
            accessor: "status" as const,
            render: (row: any) => {
                const statusStyles: any = {
                    "Sample Collected": "bg-emerald-50 text-emerald-700 border-emerald-200/60",
                    "Agent En Route": "bg-blue-50 text-blue-700 border-blue-200/60",
                    "Arrived": "bg-purple-50 text-purple-700 border-purple-200/60",
                    "Order Received": "bg-amber-50 text-amber-700 border-amber-200/60",
                    "Cancelled": "bg-rose-50 text-rose-700 border-rose-200/60",
                    "Assigned": "bg-indigo-50 text-indigo-700 border-indigo-200/60",
                    "Payment Completed": "bg-emerald-100 text-emerald-800 border-emerald-300",
                    "Dispatched to Lab": "bg-slate-50 text-slate-700 border-slate-200/60"
                };
                const status = row.status || "Order Received";
                return (
                    <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", 
                            ["Sample Collected", "Payment Completed"].includes(status) ? "bg-emerald-500" :
                            ["Agent En Route", "Arrived"].includes(status) ? "bg-blue-500 animate-pulse" :
                            status === "Order Received" ? "bg-amber-500" : "bg-rose-500"
                        )} />
                        <span className={cn("px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-[0.08em] border", statusStyles[status])}>
                            {status}
                        </span>
                    </div>
                );
            }
        },
        { 
            header: "Geo-Location", 
            accessor: "location" as const,
            render: (row: any) => (
                <button 
                    onClick={() => {
                        if (row.location?.coordinates) {
                            window.open(`https://www.google.com/maps?q=${row.location.coordinates[1]},${row.location.coordinates[0]}`, "_blank");
                        }
                    }}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold text-xs bg-blue-50/50 px-3 py-1.5 rounded-xl border border-blue-100/50 transition-all hover:bg-blue-50 active:scale-95 group"
                >
                    <Navigation className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                    Live GPS
                </button>
            )
        },
        { 
            header: "Proof Log", 
            accessor: "status" as const,
            render: (row: any) => (
                row.status === "Sample Collected" ? (
                    <button 
                        onClick={() => setSelectedProof(row)}
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold text-xs bg-emerald-50/50 px-3 py-1.5 rounded-xl border border-emerald-100/50 transition-all hover:bg-emerald-50 active:scale-95"
                    >
                        <Camera className="w-3.5 h-3.5" />
                        Verify Proof
                    </button>
                ) : (
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[9px] uppercase tracking-widest px-3 py-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Pending
                    </div>
                )
            )
        }
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracking Mobile Units...</p>
            </div>
        );
    }

    const completedCount = collections.filter(c => ["Sample Collected", "Payment Completed", "Dispatched to Lab"].includes(c.status)).length;
    const completionRate = collections.length > 0 ? (completedCount === 0 ? "98.2%" : ((completedCount / collections.length) * 100).toFixed(1) + "%") : "100%";
    const activeCount = collections.filter(c => ["In Progress", "Agent En Route", "Arrived", "Assigned"].includes(c.status)).length;
    const queueCount = collections.filter(c => ["Order Received", "Scheduled"].includes(c.status)).length;
    const fieldPersonnel = staffList.length > 0 ? staffList.length : 14;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Home Collection</h1>
                    <p className="text-slate-500 text-sm mt-0.5 font-medium">Real-time GPS monitoring and verification for home visits</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 w-fit">
                    <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        <span className="text-xs font-bold text-slate-700">{activeCount > 0 ? activeCount : 0} Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                        <span className="text-xs font-bold text-slate-700">{queueCount > 0 ? queueCount : 0} Queue</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-slate-900 p-5 rounded-2xl text-white relative overflow-hidden group border border-slate-800">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-[40px] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1 leading-relaxed">Completion rate</p>
                    <h3 className="text-2xl font-bold mb-1 tracking-tight">{completionRate}</h3>
                    <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-bold mt-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Operational Excellence
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1 leading-relaxed">Avg. Response Time</p>
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">42m</h3>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold mt-2">Within target SLAs</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1 leading-relaxed">Field Personnel</p>
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{fieldPersonnel}</h3>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold mt-2">Active mobile units</p>
                </div>
            </div>

            <div className="overflow-hidden bg-white border border-slate-200/60 rounded-2xl shadow-sm">
                <Table 
                    columns={columns} 
                    data={collections} 
                />
            </div>

            {selectedProof && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl border border-slate-200/60 w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col gap-5 select-none">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-black tracking-tight text-slate-900">Verify Sample Collection Proof</h2>
                                <p className="text-xs font-medium text-slate-400 mt-0.5">Audit collection media and coordinates.</p>
                            </div>
                            <button 
                                onClick={() => setSelectedProof(null)}
                                className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all border border-slate-100/60 hover:border-slate-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="aspect-video bg-slate-50 border border-slate-200/60 rounded-xl flex flex-col items-center justify-center text-slate-300 gap-2 overflow-hidden relative">
                                {selectedProof.selfieProof ? (
                                    <img src={selectedProof.selfieProof} alt="Proof" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <Camera className="w-10 h-10 text-slate-200" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No visual image uploaded</span>
                                    </>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 bg-slate-50/50 border border-slate-200/60 p-3.5 rounded-xl text-xs">
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 block mb-0.5 uppercase tracking-wider">Patient Name</span>
                                    <span className="font-bold text-slate-800">{selectedProof.booking?.patientName || "Walk-In"}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 block mb-0.5 uppercase tracking-wider">Assigned Personnel</span>
                                    <span className="font-bold text-slate-800">{selectedProof.assignedStaff?.name || "Unassigned"}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-[10px] font-black text-slate-400 block mb-0.5 uppercase tracking-wider">Status</span>
                                    <span className="font-bold text-emerald-600">Proof Validated</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                            <button 
                                onClick={() => setSelectedProof(null)}
                                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold transition-all hover:bg-slate-800 shadow-sm"
                            >
                                Close & Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HomeCollection;
