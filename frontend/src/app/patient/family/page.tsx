"use client";
import React, { useEffect, useState } from "react";
import { 
    Users, 
    Plus, 
    User, 
    Heart, 
    Activity, 
    MoreHorizontal, 
    ChevronRight,
    Loader2,
    X
} from "lucide-react";
import { getApiUrl } from "@/lib/api";

export default function PatientFamily() {
    const [family, setFamily] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        const fetchFamily = async () => {
            try {
                const token = localStorage.getItem("patientToken");
                const res = await fetch(getApiUrl("/api/patient/profile"), {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const d = await res.json();
                if (d.success) setFamily(d.data.familyMembers || []);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFamily();
    }, []);

    if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Family Members</h1>
                    <p className="text-slate-500 font-bold mt-1">Book tests and track health for your loved ones.</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4" /> Add Member
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {family.length > 0 ? (
                    family.map((member) => (
                        <div key={member._id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                    <User className="w-8 h-8" />
                                </div>
                                <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 mb-1">{member.name}</h3>
                                <div className="flex items-center gap-3 text-slate-400 mb-8">
                                    <span className="text-[10px] font-black uppercase tracking-widest">{member.relation}</span>
                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{member.age} Yrs • {member.gender}</span>
                                </div>
                            </div>
                            <button className="w-full py-4 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 transition-all flex items-center justify-center gap-3">
                                View Profile <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm text-center">
                        <Users className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-slate-900">No family members linked</h3>
                        <p className="text-slate-400 font-bold mt-2">Add family members to book tests for them quickly.</p>
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
                        <h2 className="text-2xl font-black text-slate-900 mb-8">Add Family Member</h2>
                        <div className="space-y-6">
                            <input type="text" placeholder="Full Name" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none" />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" placeholder="Age" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none" />
                                <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none">
                                    <option>Male</option>
                                    <option>Female</option>
                                </select>
                            </div>
                            <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none">
                                <option>Spouse</option>
                                <option>Child</option>
                                <option>Parent</option>
                                <option>Sibling</option>
                            </select>
                            <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20">Add Member</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
