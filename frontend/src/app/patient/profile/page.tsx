"use client";
import React, { useEffect, useState } from "react";
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Activity, 
    Droplets, 
    AlertCircle, 
    Heart, 
    Plus, 
    Camera,
    Save,
    Loader2,
    CheckCircle2,
    Calendar
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
        return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Profile Header */}
            <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                    <div className="relative group">
                        <div className="w-40 h-40 rounded-[2.5rem] bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                            {profile.profileImage ? (
                                <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-16 h-16 text-slate-300" />
                            )}
                        </div>
                        <button className="absolute bottom-2 right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/30 hover:scale-110 active:scale-95 transition-all">
                            <Camera className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="text-center md:text-left space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{profile.name}</h1>
                            <span className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest self-center md:self-auto">
                                Verified Profile
                            </span>
                        </div>
                        <p className="text-slate-500 font-bold flex items-center justify-center md:justify-start gap-4">
                            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-600" /> {profile.addresses?.[0]?.city || "Location Pending"}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                            <span>Patient ID: {profile.patientId}</span>
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Account Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="email" 
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Phone</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="tel" 
                                        value={profile.phoneNumber}
                                        disabled
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-400 outline-none grayscale"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Age</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="number" 
                                        value={profile.age}
                                        onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Gender</label>
                                <select 
                                    value={profile.gender}
                                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Medical Info */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Clinical Profile</h3>
                        <div className="space-y-8">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                                    <Droplets className="w-8 h-8" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Blood Group</label>
                                    <select 
                                        value={profile.bloodGroup || ""}
                                        onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                                        className="w-full md:w-48 px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 focus:bg-white outline-none transition-all"
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
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-amber-500" /> Allergies
                                </label>
                                <textarea 
                                    placeholder="List any medicine or food allergies..."
                                    className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all min-h-[120px]"
                                    defaultValue={profile.allergies?.join(", ")}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Save Changes */}
                    <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl shadow-slate-900/20 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl" />
                        <h3 className="text-xl font-black mb-2 relative z-10">Manage Account</h3>
                        <p className="text-slate-400 text-xs font-medium mb-8 relative z-10">Keep your information updated for accurate diagnostic insights.</p>
                        <button 
                            type="submit"
                            disabled={isSaving}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 relative z-10 active:scale-95"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Profile</>}
                        </button>
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Emergency Contact</h3>
                        <div className="space-y-6">
                            <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-rose-500 shadow-sm">
                                        <Heart className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-900">{profile.emergencyContact?.name || "No Name"}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{profile.emergencyContact?.relationship || "Guardian"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-black text-slate-900">
                                    <Phone className="w-4 h-4 text-rose-400" />
                                    {profile.emergencyContact?.phone || "0000000000"}
                                </div>
                                <button className="w-full py-3 bg-white text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-xl border border-slate-100 hover:bg-rose-100 hover:text-rose-600 transition-all">
                                    Change Contact
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
