"use client";
import React, { useEffect, useState } from "react";
import Table from "../components/Table";
import { Home, MapPin, Camera, User, Clock, CheckCircle2, Navigation } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { HomeCollection as HomeCollectionType } from "../types";
import { cn } from "@/lib/utils";

const HomeCollection: React.FC = () => {
    const [collections, setCollections] = useState<HomeCollectionType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
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

        fetchCollections();
    }, []);

    const columns = [
        { 
            header: "Patient Profile", 
            accessor: "patient" as const,
            render: (row: HomeCollectionType) => (
                <div className="flex flex-col">
                    <span className="font-black text-slate-900 tracking-tight text-base leading-none mb-1">{row.patient.name}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{row.patient.phoneNumber}</span>
                </div>
            )
        },
        { 
            header: "Assigned Personnel", 
            accessor: "assignedStaff" as const,
            render: (row: HomeCollectionType) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black border border-slate-200 shadow-inner group-hover:border-blue-200 transition-all">
                        {row.assignedStaff.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 leading-tight">{row.assignedStaff.name}</span>
                        <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-1">{row.assignedStaff.employeeId}</span>
                    </div>
                </div>
            )
        },
        { 
            header: "Cycle Status", 
            accessor: "status" as const,
            render: (row: HomeCollectionType) => {
                const statusStyles = {
                    "Collected": "bg-emerald-50 text-emerald-700 border-emerald-200",
                    "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
                    "Scheduled": "bg-amber-50 text-amber-700 border-amber-200",
                    "Cancelled": "bg-rose-50 text-rose-700 border-rose-200",
                };
                return (
                    <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", 
                            row.status === "Collected" ? "bg-emerald-500" :
                            row.status === "In Progress" ? "bg-blue-500 animate-pulse" :
                            row.status === "Scheduled" ? "bg-amber-500" : "bg-rose-500"
                        )} />
                        <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] border", statusStyles[row.status])}>
                            {row.status}
                        </span>
                    </div>
                );
            }
        },
        { 
            header: "Geo-Location", 
            accessor: "gpsLocation" as const,
            render: (row: HomeCollectionType) => (
                <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-black text-xs bg-blue-50/50 px-4 py-2 rounded-xl border border-blue-100/50 transition-all hover:shadow-md hover:bg-blue-50 active:scale-95 group">
                    <Navigation className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                    Live GPS
                </button>
            )
        },
        { 
            header: "Proof Log", 
            accessor: "selfieProof" as const,
            render: (row: HomeCollectionType) => (
                row.selfieProof ? (
                    <button className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-black text-xs bg-emerald-50/50 px-4 py-2 rounded-xl border border-emerald-100/50 transition-all hover:shadow-md hover:bg-emerald-50 active:scale-95">
                        <Camera className="w-3.5 h-3.5" />
                        Verify Selfie
                    </button>
                ) : (
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-widest px-4 py-2">
                        <Clock className="w-3.5 h-3.5" />
                        Pending
                    </div>
                )
            )
        }
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracking Mobile Units...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Home Collection</h1>
                    <p className="text-slate-500 font-medium mt-1">Real-time GPS monitoring and verification for home visits</p>
                </div>
                <div className="bg-white px-6 py-4 rounded-3xl border border-slate-200/60 shadow-sm flex items-center gap-6">
                    <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        <span className="text-sm font-black text-slate-700">{collections.filter(c => c.status === "In Progress").length} Active</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-amber-500 rounded-full" />
                        <span className="text-sm font-black text-slate-700">{collections.filter(c => c.status === "Scheduled").length} Queue</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Completion rate</p>
                    <h3 className="text-4xl font-black mb-4">98.2%</h3>
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        Operational Excellence
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm flex flex-col justify-between">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Avg. Response Time</p>
                    <h3 className="text-3xl font-black text-slate-900">42m</h3>
                    <p className="text-xs text-slate-500 font-medium mt-4">Within target SLAs</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm flex flex-col justify-between">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Field Personnel</p>
                    <h3 className="text-3xl font-black text-slate-900">14</h3>
                    <p className="text-xs text-slate-500 font-medium mt-4">Active mobile units</p>
                </div>
            </div>

            <Table 
                columns={columns} 
                data={collections} 
            />
        </div>
    );
}

export default HomeCollection;
