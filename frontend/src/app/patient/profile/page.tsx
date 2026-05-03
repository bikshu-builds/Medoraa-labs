"use client";
import React, { useEffect, useState } from "react";
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Droplets, 
    AlertCircle, 
    Heart, 
    Camera,
    Save,
    Loader2,
    Calendar,
    UserCircle,
    UserCheck,
    CreditCard
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function PatientProfile() {
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("patientToken");
                const res = await fetch(getApiUrl("/api/patient/profile"), {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const d = await res.json();
                if (d.success) setProfile(d.data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const token = localStorage.getItem("patientToken");
            const res = await fetch(getApiUrl("/api/patient/profile"), {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(profile)
            });
            const d = await res.json();
            if (d.success) alert("Profile updated successfully!");
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;
    }

    return (
        <div className="h-full animate-in fade-in duration-500 max-w-[1400px] mx-auto">
            <form onSubmit={handleUpdate} className="flex flex-col gap-5 h-full">
                {/* Compact Header */}
                <div className="bg-[#1e293b] rounded-2xl p-6 text-white flex items-center justify-between shadow-lg shadow-slate-200/50">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="w-20 h-20 rounded-xl bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center shadow-inner">
                                {profile.profileImage ? (
                                    <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircle className="w-10 h-10 text-slate-500" />
                                )}
                            </div>
                            <button className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 rounded-lg shadow-lg hover:bg-blue-500 transition-all">
                                <Camera className="w-3.5 h-3.5 text-white" />
                            </button>
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight">{profile.name}</h1>
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                    <UserCheck className="w-3 h-3" /> Verified
                                </span>
                            </div>
                            <div className="flex items-center gap-4 mt-1.5 text-slate-400 text-xs font-medium">
                                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-blue-500" /> {profile.addresses?.[0]?.city || "Location set"}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-700" />
                                <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-blue-500" /> ID: {profile.patientId}</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        type="submit"
                        title="Save Changes"
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-500 w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 shadow-md"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Save className="w-5 h-5 text-white" />}
                    </button>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Column 1: Account Details */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Mail className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900">Contact Information</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                                <input 
                                    type="email" 
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Phone Number</label>
                                <input 
                                    type="tel" 
                                    value={profile.phoneNumber}
                                    disabled
                                    className="w-full px-4 py-2.5 bg-slate-100/50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-400 outline-none cursor-not-allowed"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Age</label>
                                    <input 
                                        type="number" 
                                        value={profile.age}
                                        onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Gender</label>
                                    <select 
                                        value={profile.gender}
                                        onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white outline-none transition-all"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Clinical Profile */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                                <Droplets className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900">Health Profile</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Blood Group</label>
                                <select 
                                    value={profile.bloodGroup || ""}
                                    onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white outline-none transition-all"
                                >
                                    <option value="">Unknown</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                                    <AlertCircle className="w-3 h-3 text-amber-500" /> Allergies & Notes
                                </label>
                                <textarea 
                                    placeholder="List medicine/food allergies..."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-700 focus:bg-white outline-none transition-all h-[104px] resize-none"
                                    defaultValue={profile.allergies?.join(", ")}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Emergency & Stats */}
                    <div className="space-y-5">
                        <div className="bg-rose-50/50 rounded-2xl p-6 border border-rose-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-200">
                                        <Heart className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-900">Emergency Contact</h3>
                                </div>
                                <button type="button" className="text-[10px] font-bold text-rose-600 hover:underline uppercase">Edit</button>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Name</span>
                                    <span className="text-xs font-bold text-slate-900">{profile.emergencyContact?.name || "Not set"}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Relation</span>
                                    <span className="text-xs font-bold text-slate-900">{profile.emergencyContact?.relationship || "-"}</span>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-rose-100 mt-1">
                                    <span className="text-xs text-slate-500">Contact</span>
                                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                        <Phone className="w-3 h-3 text-rose-400" />
                                        {profile.emergencyContact?.phone || "N/A"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Status Card */}
                        <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                            <h3 className="text-sm font-bold mb-1 relative z-10">Last Checkup</h3>
                            <p className="text-blue-100 text-xs font-medium relative z-10 mb-4">Complete your health profile to get better insights.</p>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-bold">12 Oct, 2025</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
