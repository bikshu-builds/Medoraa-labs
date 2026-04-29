"use client";
import React, { useEffect, useState } from "react";
import { 
    UserPlus, 
    Search, 
    Plus, 
    Trash2, 
    CheckCircle2, 
    Loader2,
    Activity,
    CreditCard,
    ArrowRight,
    User,
    Phone,
    ShieldCheck,
    FlaskConical,
    Lock,
    Printer,
    MoreVertical
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import BookingDetailsModal from "../components/BookingDetailsModal";

export default function StaffWalkin() {
    const [tests, setTests] = useState<any[]>([]);
    const [selectedTests, setSelectedTests] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [patientData, setPatientData] = useState<any>({
        name: "",
        phoneNumber: "",
        email: "",
        age: "",
        gender: "Male",
        doctorReference: "",
        password: "",
        corporateDetails: {
            corporateName: "",
            campName: ""
        }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [sourceType, setSourceType] = useState("Walk-in");
    const [doctorReferral, setDoctorReferral] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [doctors, setDoctors] = useState<any[]>([]);
    const [registeredSamples, setRegisteredSamples] = useState<any[]>([]);
    const [view, setView] = useState<"list" | "registration">("list");
    const [walkins, setWalkins] = useState<any[]>([]);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const fetchWalkins = async () => {
        const token = localStorage.getItem("staffToken");
        const res = await fetch(getApiUrl("/api/staff/walkins"), {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const d = await res.json();
        if (d.success) setWalkins(d.data);
    };

    useEffect(() => {
        if (view === "list") fetchWalkins();
    }, [view]);

    useEffect(() => {
        const fetchTests = async () => {
            const res = await fetch(getApiUrl("/api/patient/tests"));
            const d = await res.json();
            if (d.success) setTests(d.data);
        };
        const fetchDoctors = async () => {
            const token = localStorage.getItem("staffToken");
            const res = await fetch(getApiUrl("/api/staff/doctors"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const d = await res.json();
            if (d.success) setDoctors(d.data);
        };
        fetchTests();
        fetchDoctors();
    }, []);

    const toggleTest = (test: any) => {
        if (selectedTests.find(t => t._id === test._id)) {
            setSelectedTests(selectedTests.filter(t => t._id !== test._id));
        } else {
            setSelectedTests([...selectedTests, test]);
        }
    };

    const handleRegister = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("staffToken");
            const res = await fetch(getApiUrl("/api/staff/walkin-registration"), {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    patientData,
                    tests: selectedTests.map(t => t._id),
                    paymentMethod,
                    sourceType,
                    doctorReferral: sourceType === "Referring Doctor" ? doctorReferral : undefined
                })
            });
            const d = await res.json();
            if (d.success) {
                setRegisteredSamples(d.data.samples || []);
                setStep(3);
            } else {
                alert("Registration Failed: " + (d.message || "Unknown Error"));
            }
        } catch (err: any) {
            console.error(err);
            alert("System Error: Could not connect to server.");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredTests = tests.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const totalAmount = selectedTests.reduce((acc, t) => acc + t.price, 0);

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <BookingDetailsModal 
                bookingId={selectedBookingId}
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
            />
            {view === "list" ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Header with New Registration Button */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm shadow-slate-200/20">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[1.8rem] bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-200">
                                <UserPlus className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Walk-in Registry</h1>
                                <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Manage local registrations and sample collections</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => { setView("registration"); setStep(1); }}
                            className="px-10 py-5 bg-slate-900 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-4"
                        >
                            <Plus className="w-5 h-5" /> Patient Registration
                        </button>
                    </div>

                    {/* Registry Table */}
                    <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto no-scrollbar">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-50 bg-slate-50/50">
                                        <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Details</th>
                                        <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking ID</th>
                                        <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Source</th>
                                        <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                        <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-10 py-8 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {walkins.map((w) => (
                                        <tr 
                                            key={w._id} 
                                            onClick={() => { setSelectedBookingId(w._id); setIsDetailsOpen(true); }}
                                            className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                        >
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center font-black group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                                        {w.patient?.name?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{w.patient?.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{w.patient?.phoneNumber} • {w.patient?.gender}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className="text-xs font-black text-blue-600 font-mono tracking-widest">{w.bookingId}</span>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{w.sourceType}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className="text-sm font-black text-slate-900">₹{w.totalAmount}</span>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="inline-flex px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                                    {w.status}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <button className="p-3 hover:bg-white rounded-2xl border border-transparent hover:border-slate-100 hover:shadow-sm transition-all">
                                                    <MoreVertical className="w-5 h-5 text-slate-400" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {walkins.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-10 py-20 text-center">
                                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No walk-in records found today</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-12 animate-in slide-in-from-right-12 duration-700">
                    <div className="flex items-center justify-between">
                        <button 
                            onClick={() => setView("list")}
                            className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors"
                        >
                            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Registry
                        </button>
                        <div className="flex items-center gap-10">
                            <StepIndicator current={step} step={1} label="Identity" />
                            <div className="w-12 h-px bg-slate-100" />
                            <StepIndicator current={step} step={2} label="Diagnostics" />
                            <div className="w-12 h-px bg-slate-100" />
                            <StepIndicator current={step} step={3} label="Labels" />
                        </div>
                        <div className="w-20" />
                    </div>

                    {step === 1 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-10">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                                        <UserPlus className="w-8 h-8 text-blue-600" />
                                        Patient Registry
                                    </h2>
                                    <p className="text-slate-400 font-bold mt-2">Enter the walk-in patient's primary details.</p>
                                </div>
                                <div className="space-y-6">
                                    <InputField label="Full Name" placeholder="e.g. Rahul Sharma" icon={User} 
                                        value={patientData.name} onChange={(val: string) => setPatientData({...patientData, name: val})} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField label="Phone Number" placeholder="10 Digit Number" icon={Phone}
                                            value={patientData.phoneNumber} onChange={(val: string) => setPatientData({...patientData, phoneNumber: val})} />
                                        <InputField label="Email Address" placeholder="Optional" icon={ShieldCheck}
                                            value={patientData.email} onChange={(val: string) => setPatientData({...patientData, email: val})} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField label="Age" placeholder="In Years" icon={Activity}
                                            value={patientData.age} onChange={(val: string) => setPatientData({...patientData, age: val})} />
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Gender</label>
                                            <select 
                                                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100/50 outline-none transition-all appearance-none"
                                                value={patientData.gender}
                                                onChange={(e) => setPatientData({...patientData, gender: e.target.value})}
                                            >
                                                <option>Male</option>
                                                <option>Female</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <InputField label="Account Password" placeholder="Set initial password" icon={Lock}
                                        value={patientData.password} onChange={(val: string) => setPatientData({...patientData, password: val})} />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Patient Source (*)</label>
                                            <select 
                                                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100/50 outline-none transition-all appearance-none"
                                                value={sourceType}
                                                onChange={(e) => setSourceType(e.target.value)}
                                            >
                                                <option value="Walk-in">Walk-in</option>
                                                <option value="Referring Doctor">Referring Doctor</option>
                                                <option value="Home Collection">Home Collection</option>
                                                <option value="Corporate / Camps">Corporate / Camps</option>
                                                <option value="Online Booking">Online Booking</option>
                                                <option value="Insurance Partner">Insurance Partner</option>
                                                <option value="Marketing Campaign">Marketing Campaign</option>
                                                <option value="Repeat Patient">Repeat Patient</option>
                                                <option value="Hospital Tie-up">Hospital Tie-up</option>
                                                <option value="Diagnostic Package Campaign">Diagnostic Package Campaign</option>
                                            </select>
                                        </div>
                                        {sourceType === "Referring Doctor" && (
                                            <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Referring Doctor Master (*)</label>
                                                <select 
                                                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100/50 outline-none transition-all appearance-none"
                                                    value={doctorReferral}
                                                    onChange={(e) => setDoctorReferral(e.target.value)}
                                                >
                                                    <option value="">Select Doctor From Master...</option>
                                                    {doctors.map(d => (
                                                        <option key={d._id} value={d._id}>{d.name} ({d.hospitalName})</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {sourceType === "Corporate / Camps" && (
                                        <div className="p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100 space-y-6 animate-in slide-in-from-top-4 duration-300">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-4">Corporate Details Tracking</label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <input 
                                                    type="text" 
                                                    placeholder="Corporate Name"
                                                    value={patientData.corporateDetails?.corporateName || ""}
                                                    onChange={(e) => setPatientData({...patientData, corporateDetails: {...patientData.corporateDetails, corporateName: e.target.value}})}
                                                    className="w-full px-8 py-4 bg-white border border-slate-100 rounded-[1.5rem] text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-200"
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder="Camp ID / Name"
                                                    value={patientData.corporateDetails?.campName || ""}
                                                    onChange={(e) => setPatientData({...patientData, corporateDetails: {...patientData.corporateDetails, campName: e.target.value}})}
                                                    className="w-full px-8 py-4 bg-white border border-slate-100 rounded-[1.5rem] text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-200"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={() => setStep(2)}
                                    disabled={!patientData.name || !patientData.phoneNumber}
                                    className="w-full bg-slate-900 hover:bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:bg-slate-200"
                                >
                                    Next: Select Tests <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="hidden lg:block space-y-8 p-12 bg-blue-600 rounded-[3.5rem] text-white relative overflow-hidden h-full">
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                                <h3 className="text-4xl font-black leading-tight tracking-tight relative z-10">Fast-Track <br />Reception.</h3>
                                <p className="text-blue-100 text-lg font-medium relative z-10">Register patients and assign barcode labels in under 60 seconds.</p>
                                <div className="space-y-6 pt-10 relative z-10">
                                    <FeatureItem icon={ShieldCheck} text="Verified Demographic Entry" />
                                    <FeatureItem icon={FlaskConical} text="Real-time Test Assignment" />
                                    <FeatureItem icon={CreditCard} text="Instant Invoice Generation" />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-4 bg-slate-50 px-6 py-4 rounded-[1.5rem] border border-slate-100 mb-8 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100 transition-all">
                                        <Search className="w-5 h-5 text-slate-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Search Tests & Packages..." 
                                            className="bg-transparent border-none outline-none text-sm font-bold w-full uppercase tracking-widest text-slate-900"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[500px] overflow-y-auto no-scrollbar">
                                        {filteredTests.map((test) => {
                                            const isSelected = selectedTests.find(t => t._id === test._id);
                                            return (
                                                <button 
                                                    key={test._id}
                                                    onClick={() => toggleTest(test)}
                                                    className={cn(
                                                        "p-6 rounded-[2rem] border-2 text-left transition-all relative flex flex-col justify-between group",
                                                        isSelected ? "border-blue-600 bg-blue-50/50" : "border-slate-50 hover:border-blue-200"
                                                    )}
                                                >
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 shadow-sm">
                                                            <FlaskConical className="w-5 h-5" />
                                                        </div>
                                                        {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600 animate-in zoom-in" />}
                                                    </div>
                                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{test.name}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">₹{test.price} • {test.tat}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl shadow-slate-900/40 sticky top-32">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-10">Booking Summary</h3>
                                <div className="space-y-6 mb-12 max-h-[300px] overflow-y-auto no-scrollbar pr-4">
                                    {selectedTests.map((t) => (
                                        <div key={t._id} className="flex justify-between items-start group">
                                            <div className="flex-1 pr-4">
                                                <p className="text-xs font-bold text-slate-200 line-clamp-1">{t.name}</p>
                                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">₹{t.price}</p>
                                            </div>
                                            <button onClick={() => toggleTest(t)} className="text-slate-700 hover:text-rose-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-8 border-t border-white/10 space-y-6 mb-10">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-400">Total Payable</span>
                                        <span className="text-3xl font-black text-blue-400 tracking-tighter">₹{totalAmount}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {["Cash", "UPI", "Card"].map((method) => (
                                            <button 
                                                key={method}
                                                onClick={() => setPaymentMethod(method)}
                                                className={cn(
                                                    "py-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all",
                                                    paymentMethod === method ? "bg-blue-600 border-blue-600 text-white" : "bg-white/5 border-white/10 text-slate-400"
                                                )}
                                            >
                                                {method}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button 
                                    onClick={handleRegister}
                                    disabled={selectedTests.length === 0 || isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:bg-slate-800"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Confirm & Register</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="max-w-4xl mx-auto py-12 space-y-12 animate-in zoom-in duration-500">
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10 border-2 border-white">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Registration Successful</h2>
                                <p className="text-slate-500 font-bold max-w-md mx-auto">Barcode labels generated. Please print and attach them.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {registeredSamples.map((sample, i) => (
                                    <div key={i} className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 relative overflow-hidden shadow-sm">
                                        <div className="space-y-6 relative z-10">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient</p>
                                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{sample.patientName}</p>
                                                </div>
                                                <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-black text-[9px] uppercase tracking-widest">
                                                    {sample.sampleId}
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-slate-50">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Test</p>
                                                <p className="text-xs font-bold text-slate-700">{sample.testName}</p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center gap-2 border border-slate-100">
                                                <div className="flex items-end gap-0.5 h-10 w-full justify-center">
                                                    {[...Array(40)].map((_, j) => (
                                                        <div key={j} className="bg-slate-900 rounded-full" style={{ width: Math.random() > 0.7 ? '3px' : '1px', height: `${30 + Math.random() * 40}%` }} />
                                                    ))}
                                                </div>
                                                <p className="text-[9px] font-black font-mono tracking-[0.4em] text-slate-400">{sample.sampleId}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-10 border-t border-slate-100">
                                <button onClick={() => window.print()} className="w-full md:w-auto px-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4">
                                    <Printer className="w-5 h-5" /> Print All Labels
                                </button>
                                <button onClick={() => window.location.reload()} className="w-full md:w-auto px-12 py-5 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em]">
                                    New Registration
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function StepIndicator({ current, step, label }: any) {
    const isActive = current >= step;
    const isCurrent = current === step;
    return (
        <div className="flex flex-col items-center gap-3">
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 border-2",
                isActive ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-200" : "bg-white text-slate-300 border-slate-100"
            )}>
                {isActive && !isCurrent ? <CheckCircle2 className="w-6 h-6" /> : step}
            </div>
            <span className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em]",
                isActive ? "text-slate-900" : "text-slate-300"
            )}>{label}</span>
        </div>
    );
}

function InputField({ label, placeholder, icon: Icon, value, onChange }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">{label}</label>
            <div className="relative group">
                <Icon className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input 
                    type="text" 
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100/50 outline-none transition-all"
                />
            </div>
        </div>
    );
}

function FeatureItem({ icon: Icon, text }: any) {
    return (
        <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                <Icon className="w-5 h-5 text-blue-300" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-blue-50">{text}</span>
        </div>
    );
}
