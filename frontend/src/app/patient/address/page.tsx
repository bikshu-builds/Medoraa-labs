"use client";
import React, { useEffect, useState } from "react";
import { 
    MapPin, 
    Plus, 
    Home, 
    Briefcase, 
    Navigation, 
    Trash2, 
    CheckCircle2,
    Loader2,
    X
} from "lucide-react";
import { getApiUrl } from "@/lib/api";

export default function PatientAddress() {
    const [addresses, setAddresses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const token = localStorage.getItem("patientToken");
                const res = await fetch(getApiUrl("/api/patient/profile"), {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const d = await res.json();
                if (d.success) setAddresses(d.data.addresses || []);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAddresses();
    }, []);

    if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Saved Addresses</h1>
                    <p className="text-slate-500 font-bold mt-1">Manage locations for home sample collections.</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4" /> Add Address
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {addresses.length > 0 ? (
                    addresses.map((addr) => (
                        <div key={addr._id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group relative overflow-hidden">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                        {addr.label === "Home" ? <Home className="w-6 h-6" /> : addr.label === "Work" ? <Briefcase className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900">{addr.label}</h3>
                                        {addr.isDefault && <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Default Address</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                                </div>
                            </div>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">{addr.fullAddress}, {addr.city}, {addr.state} - {addr.pincode}</p>
                            <button className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                                <Navigation className="w-4 h-4" /> View on Maps
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm text-center">
                        <MapPin className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-slate-900">No addresses saved</h3>
                        <p className="text-slate-400 font-bold mt-2">Add your home or work address for easy home collection booking.</p>
                    </div>
                )}
            </div>

            {/* Simple Mock Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in duration-300">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900">
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-black text-slate-900 mb-8">New Address</h2>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                {["Home", "Work", "Other"].map(l => (
                                    <button key={l} className="flex-1 py-3 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-blue-600 hover:text-white transition-all">{l}</button>
                                ))}
                            </div>
                            <textarea placeholder="Full Address / House No." className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none min-h-[100px]" />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="City" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none" />
                                <input type="text" placeholder="Pincode" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none" />
                            </div>
                            <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20">Save Address</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
