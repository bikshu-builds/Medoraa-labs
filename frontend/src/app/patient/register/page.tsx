"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
    User,
    Mail,
    Phone,
    Lock,
    Calendar,
    ArrowRight,
    ArrowLeft,
    Activity,
    Loader2,
    CheckCircle2,
    Droplets,
    FileText,
    Stethoscope,
    Users
} from "lucide-react";
import { getApiUrl } from "@/lib/api";

type PatientResult = {
    _id: string;
    name: string;
    age: number;
    gender: string;
};

export default function PatientIdentificationAndRegister() {
    // Step management: 1 = Identify, 2 = Results, 3 = Register
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Identification State
    const [identifyPhone, setIdentifyPhone] = useState("");
    const [identifyEmail, setIdentifyEmail] = useState("");
    const [foundPatients, setFoundPatients] = useState<PatientResult[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

    // Registration Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
        dob: "",
        age: "",
        gender: "Male",
        bloodGroup: "",
        bloodGroupUnknown: false,
        agreedToBloodGroupTest: false,
        medicalHistory: "",
        reasonForTest: ""
    });

    const handleIdentify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch(getApiUrl("/api/patient/identify"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber: identifyPhone })
            });
            const data = await res.json();

            if (data.success) {
                if (data.exists && data.patients.length > 0) {
                    setFoundPatients(data.patients);
                    if (data.patients.length === 1) {
                        setSelectedPatientId(data.patients[0]._id);
                    }
                    setStep(2); // Show Results
                } else {
                    // No existing record -> Go to Registration
                    setFormData(prev => ({
                        ...prev,
                        phoneNumber: identifyPhone,
                        email: identifyEmail
                    }));
                    setStep(3);
                }
            } else {
                setError(data.message || "Failed to identify patient.");
            }
        } catch (err) {
            setError("Connection failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const proceedWithSelectedPatient = () => {
        if (!selectedPatientId) {
            setError("Please select a patient to proceed.");
            return;
        }
        // If a patient is selected, they should probably log in, or we redirect them to dashboard if it's an internal kiosk.
        // For security, if they just entered a phone number, they should technically authenticate (OTP or password).
        // Directing them to sign-in page with pre-filled phone number would be appropriate.
        window.location.href = `/signin?phone=${identifyPhone}`;
    };

    const handleStartNewRegistration = () => {
        setFormData(prev => ({
            ...prev,
            phoneNumber: identifyPhone,
            email: identifyEmail
        }));
        setStep(3);
    };

    const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            // Auto-calculate age if DOB changes
            if (name === "dob" && value) {
                const birthDate = new Date(value);
                const today = new Date();
                let calcAge = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    calcAge--;
                }
                setFormData(prev => ({ ...prev, dob: value, age: calcAge.toString() }));
            } else {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password && formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const res = await fetch(getApiUrl("/api/patient/register"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                window.location.href = "/signin";
            } else if (data.isDuplicateWarning) {
                // Soft warning
                if (confirm(data.message + "\n\nDo you want to proceed and create a duplicate profile anyway?")) {
                    // Retry with force flag
                    const forceRes = await fetch(getApiUrl("/api/patient/register"), {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...formData, forceRegister: true })
                    });
                    const forceData = await forceRes.json();
                    if (forceData.success) {
                        window.location.href = "/signin";
                    } else {
                        setError(forceData.message);
                    }
                }
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen flex flex-col md:flex-row bg-[#F8FAFC] overflow-hidden">
            {/* Branding Side */}
            <div
                className="hidden md:flex flex-col justify-between w-2/5 bg-[#1A3263] p-16 text-white relative overflow-hidden h-full"
                style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/arabesque.png")` }}
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3 mb-16 group w-fit">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#1A3263] shadow-xl transition-transform group-hover:scale-110">
                            <Activity className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black tracking-tight">Medoraa Labs</span>
                    </Link>

                    <h1 className="text-4xl font-black leading-tight mb-8">
                        Join the <span className="text-blue-300">Future</span> of<br />Healthcare.
                    </h1>

                    <div className="space-y-8">
                        {[
                            { title: "Family Sharing", desc: "Multiple profiles under one phone number.", icon: Users },
                            { title: "Instant Access", desc: "View reports the moment they are ready.", icon: FileText },
                            { title: "Home Collection", desc: "Professional phlebotomists at your doorstep.", icon: CheckCircle2 }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="p-2 bg-blue-400/20 rounded-full text-blue-300 mt-1">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-black text-sm text-slate-100">{item.title}</h4>
                                    <p className="text-xs text-blue-200 font-medium mt-1">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dynamic Form Side */}
            <div className="flex-1 flex items-start justify-center p-4 sm:p-8 overflow-y-auto h-full">
                <div className="w-full max-w-xl space-y-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    <div>
                        {step === 1 && (
                            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-[#1A3263] transition-colors mb-6">
                                <ArrowLeft className="w-4 h-4" /> Back to Home
                            </Link>
                        )}
                        {(step === 2 || step === 3) && (
                            <button onClick={() => setStep(step - 1 as 1 | 2)} className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-[#1A3263] transition-colors mb-6">
                                <ArrowLeft className="w-4 h-4" /> Go Back
                            </button>
                        )}

                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                            {step === 1 ? "Patient Identification" : step === 2 ? "Select Patient" : "New Patient Registration"}
                        </h2>
                        <p className="text-slate-500 font-bold mt-2">
                            {step === 1 ? "Enter your phone number to continue." : step === 2 ? "We found existing records linked to this number." : "Fill in your details to create a new profile."}
                        </p>
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold animate-in shake duration-300">
                            <Activity className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {/* STEP 1: IDENTIFICATION */}
                    {step === 1 && (
                        <form onSubmit={handleIdentify} className="space-y-6 bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Phone Number *</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1A3263] transition-colors" />
                                    <input
                                        type="tel"
                                        placeholder="+91 00000 00000"
                                        value={identifyPhone}
                                        onChange={(e) => setIdentifyPhone(e.target.value)}
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1A3263]/20 outline-none transition-all"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Email ID (Optional)</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1A3263] transition-colors" />
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        value={identifyEmail}
                                        onChange={(e) => setIdentifyEmail(e.target.value)}
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1A3263]/20 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#1A3263] hover:bg-[#2A4273] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#1A3263]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
                            </button>
                        </form>
                    )}

                    {/* STEP 2: RESULTS / MULTIPLE PATIENTS */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                                <h3 className="text-sm font-bold text-slate-800 mb-4 px-2">Select Patient:</h3>
                                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                    {foundPatients.map((patient) => (
                                        <div
                                            key={patient._id}
                                            onClick={() => setSelectedPatientId(patient._id)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${selectedPatientId === patient._id ? "border-[#1A3263] bg-blue-50" : "border-slate-100 hover:border-slate-300 bg-slate-50"}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPatientId === patient._id ? "border-[#1A3263]" : "border-slate-300"}`}>
                                                {selectedPatientId === patient._id && <div className="w-2.5 h-2.5 bg-[#1A3263] rounded-full" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-900">{patient.name}</p>
                                                <p className="text-xs font-medium text-slate-500">{patient.age} years, {patient.gender}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={proceedWithSelectedPatient}
                                    className="w-full mt-6 bg-[#1A3263] hover:bg-[#2A4273] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#1A3263]/20 active:scale-95 transition-all"
                                >
                                    Proceed to Login
                                </button>
                            </div>

                            <div className="flex items-center justify-center">
                                <button
                                    onClick={handleStartNewRegistration}
                                    className="text-[#1A3263] font-black text-sm hover:underline flex items-center gap-2"
                                >
                                    + Add New Patient
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: REGISTRATION FORM */}
                    {step === 3 && (
                        <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 bg-white p-6 sm:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">

                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Full Name *</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1A3263] transition-colors" />
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter full name"
                                        value={formData.name}
                                        onChange={handleRegistrationChange}
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1A3263]/20 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Date of Birth</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1A3263] transition-colors" />
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleRegistrationChange}
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1A3263]/20 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Age *</label>
                                <input
                                    type="number"
                                    name="age"
                                    placeholder="Enter age manually if DOB unknown"
                                    value={formData.age}
                                    onChange={handleRegistrationChange}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1A3263]/20 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Gender *</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleRegistrationChange}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1A3263]/20 outline-none transition-all appearance-none"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="space-y-2 sm:col-span-2 pt-4 border-t border-slate-100">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Blood Group</label>
                                {!formData.bloodGroupUnknown ? (
                                    <select
                                        name="bloodGroup"
                                        value={formData.bloodGroup}
                                        onChange={handleRegistrationChange}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1A3263]/20 outline-none transition-all appearance-none"
                                    >
                                        <option value="">Select Blood Group (Optional)</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                ) : null}

                                <div className="flex items-center gap-2 mt-3 ml-2">
                                    <input
                                        type="checkbox"
                                        id="bgUnknown"
                                        name="bloodGroupUnknown"
                                        checked={formData.bloodGroupUnknown}
                                        onChange={handleRegistrationChange}
                                        className="w-4 h-4 text-[#1A3263] rounded border-slate-300 focus:ring-[#1A3263]"
                                    />
                                    <label htmlFor="bgUnknown" className="text-sm font-bold text-slate-600">Patient does not know blood group</label>
                                </div>

                                {formData.bloodGroupUnknown && (
                                    <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl animate-in fade-in zoom-in-95 duration-300">
                                        <p className="text-sm font-bold text-[#1A3263] mb-3 flex items-center gap-2">
                                            <Droplets className="w-4 h-4" /> Do you want to add a Blood Group Test?
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="bgConsent"
                                                name="agreedToBloodGroupTest"
                                                checked={formData.agreedToBloodGroupTest}
                                                onChange={handleRegistrationChange}
                                                className="w-4 h-4 text-[#1A3263] rounded border-slate-300 focus:ring-[#1A3263]"
                                            />
                                            <label htmlFor="bgConsent" className="text-xs font-bold text-slate-700">Consent received to add test</label>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Password *</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1A3263] transition-colors" />
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Create password"
                                        value={formData.password}
                                        onChange={handleRegistrationChange}
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1A3263]/20 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Confirm Password *</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1A3263] transition-colors" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Repeat password"
                                        value={formData.confirmPassword}
                                        onChange={handleRegistrationChange}
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1A3263]/20 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 sm:col-span-2 pt-4 border-t border-slate-100">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Medical History (Optional)</label>
                                <div className="relative group">
                                    <Stethoscope className="absolute left-4 top-4 w-4 h-4 text-slate-400 group-focus-within:text-[#1A3263] transition-colors" />
                                    <textarea
                                        name="medicalHistory"
                                        placeholder="E.g., Diabetes, BP, Thyroid"
                                        value={formData.medicalHistory}
                                        onChange={handleRegistrationChange}
                                        rows={2}
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1A3263]/20 outline-none transition-all resize-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Reason for Test / Symptoms (Optional)</label>
                                <div className="relative group">
                                    <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-400 group-focus-within:text-[#1A3263] transition-colors" />
                                    <textarea
                                        name="reasonForTest"
                                        placeholder="E.g., Fever, Routine checkup, Doctor referral"
                                        value={formData.reasonForTest}
                                        onChange={handleRegistrationChange}
                                        rows={2}
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1A3263]/20 outline-none transition-all resize-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="sm:col-span-2 w-full bg-[#1A3263] hover:bg-[#2A4273] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#1A3263]/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Complete Registration <ArrowRight className="w-5 h-5" /></>}
                            </button>
                        </form>
                    )}

                    {step === 1 && (
                        <div className="text-center">
                            <p className="text-slate-500 font-bold text-sm">
                                Already know you have an account?{" "}
                                <Link href="/signin" className="text-[#1A3263] hover:underline">Sign In Directly</Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
