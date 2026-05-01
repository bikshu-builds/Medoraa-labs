"use client";
import React, { useEffect, useState } from "react";
import { 
    Truck, 
    MapPin, 
    User, 
    Phone, 
    ChevronRight, 
    CheckCircle2, 
    Clock, 
    Navigation, 
    MoreVertical,
    Search,
    Loader2,
    Calendar,
    Activity,
    Plus,
    CreditCard,
    ExternalLink,
    AlertCircle,
    Camera
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import CollectionWorkflowModal from "../components/CollectionWorkflowModal";
import VisitCaptureModal from "../components/VisitCaptureModal";

export default function StaffCollections() {
    const [filter, setFilter] = useState("Unassigned");
    const [collections, setCollections] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCollection, setSelectedCollection] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
    const [checkInCollectionId, setCheckInCollectionId] = useState<string | null>(null);

    useEffect(() => {
        fetchCollections();
        if (filter !== "Unassigned") startLocationTracking();
    }, [filter]);

    const fetchCollections = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("staffToken");
            const type = filter === "Unassigned" ? "unassigned" : "assigned";
            const res = await fetch(getApiUrl(`/api/staff/collections?type=${type}`), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const d = await res.json();
            if (d.success) setCollections(d.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClaim = async (collectionId: string) => {
        try {
            const token = localStorage.getItem("staffToken");
            const res = await fetch(getApiUrl("/api/staff/claim-collection"), {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ collectionId })
            });
            const d = await res.json();
            if (d.success) {
                setFilter("Assigned");
                fetchCollections();
            } else {
                alert(d.message || "Claim failed");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const startLocationTracking = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.watchPosition(async (position) => {
                try {
                    const token = localStorage.getItem("staffToken");
                    await fetch(getApiUrl("/api/staff/update-location"), {
                        method: "POST",
                        headers: { 
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({ 
                            lat: position.coords.latitude, 
                            lng: position.coords.longitude 
                        })
                    });
                } catch (err) {
                    console.error("Location update failed", err);
                }
            }, null, { enableHighAccuracy: true });
        }
    };

    const updateStatus = async (data: any) => {
        try {
            const token = localStorage.getItem("staffToken");
            const res = await fetch(getApiUrl("/api/staff/update-collection"), {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            const d = await res.json();
            if (d.success) {
                fetchCollections();
                return true;
            } else {
                alert(d.message || "Update failed");
                return false;
            }
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const handleNavigation = (coordinates: any) => {
        if (coordinates && coordinates.length === 2) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates[1]},${coordinates[0]}`;
            window.open(url, "_blank");
        }
    };

    if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Home Collections</h1>
                    <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-widest">Assigned Routes & Patient Appointments</p>
                </div>
                <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-1 shrink-0">
                        {["Unassigned", "Assigned", "Agent En Route", "Arrived", "Sample Collected", "Payment Completed"].map((s) => (
                            <button 
                                key={s}
                                onClick={() => setFilter(s)}
                                className={cn(
                                    "px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0",
                                    filter === s ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Collection Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {collections.length === 0 ? (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                            <Truck className="w-10 h-10 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">No collections found in this stage</p>
                    </div>
                ) : collections.map((item: any) => (
                    <div key={item._id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all flex flex-col group overflow-hidden">
                        {/* Map Preview / Visual Placeholder */}
                        <div className="h-40 bg-slate-100 relative overflow-hidden">
                            <div className="absolute inset-0 bg-blue-600/5 flex items-center justify-center">
                                <Navigation className="w-12 h-12 text-blue-200 animate-pulse" />
                            </div>
                            <div className="absolute top-6 right-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 border border-white shadow-sm flex items-center gap-2">
                                <Clock className="w-3 h-3 text-blue-600" />
                                {item.timeSlot}
                            </div>
                            <div className="absolute bottom-6 left-6 flex items-center gap-2">
                                <span className={cn(
                                    "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg",
                                    item.status === "Assigned" ? "bg-blue-600 text-white" : 
                                    item.status === "Agent En Route" ? "bg-amber-500 text-white" : 
                                    item.status === "Arrived" ? "bg-purple-500 text-white" : "bg-emerald-500 text-white"
                                )}>
                                    {item.status}
                                </span>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Patient Info */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-lg shadow-sm border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        {item.booking.patientName[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none mb-2">{item.booking.patientName}</h3>
                                        <div className="flex items-center gap-4">
                                            <a href={`tel:${item.booking.patient?.phoneNumber}`} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors">
                                                <Phone className="w-3 h-3" />
                                                <span className="text-[10px] font-black tracking-widest">{item.booking.patient?.phoneNumber || "N/A"}</span>
                                            </a>
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <CreditCard className="w-3 h-3" />
                                                <span className="text-[10px] font-black tracking-widest">₹{item.booking.totalAmount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address & Tests */}
                            <div className="space-y-4">
                                <button 
                                    onClick={() => handleNavigation(item.location?.coordinates)}
                                    className="w-full flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100/50 hover:bg-white hover:border-blue-100 transition-all text-left group/addr"
                                >
                                    <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-[11px] font-bold text-slate-500 leading-relaxed">Click to navigate in Google Maps</p>
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Latitude: {item.location?.coordinates[1]}, Longitude: {item.location?.coordinates[0]}</p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover/addr:text-blue-600 transition-colors" />
                                </button>

                                <div className="flex flex-wrap gap-2">
                                    {item.booking.tests.map((test: any) => (
                                        <span key={test._id} className="px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                                            {test.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-8 border-t border-slate-50 flex items-center gap-4">
                                {item.status === "Order Received" && (
                                    <button 
                                        onClick={() => handleClaim(item._id)}
                                        className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        <Plus className="w-4 h-4" /> Claim Task
                                    </button>
                                )}
                                {item.status === "Assigned" && (
                                    <button 
                                        onClick={() => updateStatus({ collectionId: item._id, status: "Agent En Route" })}
                                        className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        <Navigation className="w-4 h-4" /> Start Trip
                                    </button>
                                )}
                                {item.status === "Agent En Route" && (
                                    <button 
                                        onClick={() => {
                                            setCheckInCollectionId(item._id);
                                            setIsCaptureModalOpen(true);
                                        }}
                                        className="flex-1 bg-amber-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        <Camera className="w-4 h-4" /> Marked Arrived (Selfie)
                                    </button>
                                )}
                                {item.status === "Arrived" && (
                                    <button 
                                        onClick={() => {
                                            setSelectedCollection(item);
                                            setIsModalOpen(true);
                                        }}
                                        className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        <Activity className="w-4 h-4" /> Start Collection
                                    </button>
                                )}
                                {item.status === "Sample Collected" && (
                                    <button 
                                        onClick={() => {
                                            setSelectedCollection(item);
                                            setIsModalOpen(true);
                                        }}
                                        className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        <CreditCard className="w-4 h-4" /> Collect Payment
                                    </button>
                                )}
                                {item.status === "Payment Completed" && (
                                    <div className="flex-1 flex flex-col items-center gap-2 py-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                            <CheckCircle2 className="w-4 h-4" /> Completed
                                        </div>
                                        <button 
                                            onClick={() => updateStatus({ collectionId: item._id, status: "Dispatched to Lab" })}
                                            className="text-[8px] font-black uppercase tracking-widest text-emerald-700 underline"
                                        >
                                            Dispatch to Lab
                                        </button>
                                    </div>
                                )}
                                {item.status === "Dispatched to Lab" && (
                                    <div className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                                        <Truck className="w-4 h-4" /> En Route to Lab
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <CollectionWorkflowModal 
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedCollection(null);
                }}
                collection={selectedCollection}
                onUpdate={updateStatus}
            />
            <VisitCaptureModal 
                isOpen={isCaptureModalOpen}
                onClose={() => {
                    setIsCaptureModalOpen(false);
                    setCheckInCollectionId(null);
                }}
                collectionId={checkInCollectionId || ""}
                onSuccess={fetchCollections}
            />
        </div>
    );
}
