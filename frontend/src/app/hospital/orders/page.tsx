"use client";
import React, { useEffect, useState } from "react";
import { getApiUrl } from "@/lib/api";
import {
    Activity,
    Clipboard,
    Search,
    Plus,
    X,
    UploadCloud,
    FileText,
    CheckCircle2,
    Loader2
} from "lucide-react";

interface TestItem {
    _id: string;
    name: string;
    price: number;
    category: string;
}

interface OrderItem {
    _id: string;
    bookingId: string;
    patientName: string;
    patientAge: number;
    patientGender: string;
    doctorName: string;
    tests: any[];
    status: string;
    createdAt: string;
    invoiceAmount: number;
    invoiceStatus: string;
    priority: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [tests, setTests] = useState<TestItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isBulkOpen, setIsBulkOpen] = useState(false);

    // Form States
    const [patientName, setPatientName] = useState("");
    const [patientAge, setPatientAge] = useState("");
    const [patientGender, setPatientGender] = useState("Male");
    const [patientPhone, setPatientPhone] = useState("");
    const [doctorName, setDoctorName] = useState("");
    const [selectedTests, setSelectedTests] = useState<string[]>([]);
    const [priority, setPriority] = useState("Normal");
    const [collectionType, setCollectionType] = useState("Walk-in");
    const [notes, setNotes] = useState("");
    const [attachment, setAttachment] = useState("");
    const [insurance, setInsurance] = useState("");
    const [corporateTag, setCorporateTag] = useState("");
    const [ipOpType, setIpOpType] = useState("OP");
    const [bedNumber, setBedNumber] = useState("");
    const [ward, setWard] = useState("");

    // Bulk states
    const [bulkRawData, setBulkRawData] = useState("");
    const [bulkMessage, setBulkMessage] = useState("");

    const loadData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("hospitalToken");
            const ordRes = await fetch(getApiUrl("/api/hospital/orders"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const ordData = await ordRes.json();
            if (ordData.success) {
                setOrders(ordData.data);
            }

            const tstRes = await fetch(getApiUrl("/api/hospital/tests"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const tstData = await tstRes.json();
            if (tstData.success) {
                setTests(tstData.data);
            }
        } catch (err) {
            console.error("Error loading data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedTests.length === 0) {
            alert("Please select at least one test prescribed.");
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem("hospitalToken");
            const res = await fetch(getApiUrl("/api/hospital/orders"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    patientName,
                    patientAge: Number(patientAge),
                    patientGender,
                    patientPhone,
                    doctorName: doctorName || "Self / Referring",
                    tests: selectedTests,
                    priority,
                    collectionType,
                    notes,
                    attachment,
                    insurance,
                    corporateTag,
                    ipOpType,
                    bedNumber,
                    ward
                })
            });
            const data = await res.json();
            if (data.success) {
                setIsAddOpen(false);
                setPatientName("");
                setPatientAge("");
                setPatientPhone("");
                setDoctorName("");
                setSelectedTests([]);
                setNotes("");
                loadData();
            }
        } catch (err) {
            console.error("Failed creating order", err);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkSubmit = async () => {
        if (!bulkRawData.trim()) return;
        setLoading(true);
        setBulkMessage("");
        try {
            const lines = bulkRawData.trim().split("\n");
            const patients: any[] = [];
            
            lines.forEach((line, index) => {
                if (index === 0 && (line.toLowerCase().includes("name") || line.toLowerCase().includes("phone"))) {
                    return; // Skip headers if included
                }
                const parts = line.split(",").map(s => s.trim());
                if (parts.length >= 3) {
                    patients.push({
                        patientName: parts[0],
                        patientAge: Number(parts[1]) || 30,
                        patientGender: parts[2] || "Male",
                        patientPhone: parts[3] || "9876543210",
                        doctorName: parts[4] || "Referring",
                        priority: "Normal",
                        collectionType: "Walk-in"
                    });
                }
            });

            const token = localStorage.getItem("hospitalToken");
            const res = await fetch(getApiUrl("/api/hospital/orders/bulk"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ patients })
            });

            const data = await res.json();
            if (data.success) {
                setBulkMessage(`Success! Registered ${data.data.length} requests successfully.`);
                setBulkRawData("");
                loadData();
                setTimeout(() => setIsBulkOpen(false), 2000);
            }
        } catch (err) {
            console.error("Bulk upload failure", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(o =>
        o.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.bookingId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Top greeting */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Patient Orders</h1>
                    <p className="text-xs font-bold text-slate-500 mt-1">Submit single requests or use the bulk patient CSV uploader.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsBulkOpen(true)}
                        className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-700 active:scale-95 transition-all"
                    >
                        <UploadCloud className="w-4 h-4" /> Bulk Excel Upload
                    </button>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/10 active:scale-95 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Create Request
                    </button>
                </div>
            </div>

            {/* Filter and Table */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
                <div className="relative max-w-sm group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search patient name or request ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 text-xs bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Request ID</th>
                                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Patient Details</th>
                                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Doctor</th>
                                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Tests</th>
                                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Invoice Status</th>
                                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3.5 px-4 text-xs font-bold font-mono text-blue-600">
                                            {order.bookingId}
                                        </td>
                                        <td className="py-3.5 px-4 text-xs font-black text-slate-700">
                                            {order.patientName} <span className="font-bold text-slate-400">({order.patientAge}y, {order.patientGender})</span>
                                        </td>
                                        <td className="py-3.5 px-4 text-xs font-bold text-slate-500">
                                            {order.doctorName}
                                        </td>
                                        <td className="py-3.5 px-4 text-xs font-bold text-slate-500">
                                            {order.tests && order.tests.map(t => t.name).join(", ") || "General Testing"}
                                        </td>
                                        <td className="py-3.5 px-4 text-xs">
                                            <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider ${
                                                order.invoiceStatus === "Paid" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                                            }`}>
                                                {order.invoiceStatus} (₹{order.invoiceAmount})
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-xs">
                                            <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider ${
                                                order.status === "Report Ready" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                order.status === "Processing" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                                "bg-slate-100 text-slate-600 border border-slate-200"
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-400 font-bold text-sm">
                                        {loading ? "Loading results..." : "No requests match your search."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal - Create Request Form */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 rounded-[2rem] shadow-2xl relative border border-slate-100">
                        <button
                            onClick={() => setIsAddOpen(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="mb-6">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <Clipboard className="w-5 h-5 text-blue-600" /> New Diagnostics Request
                            </h3>
                            <p className="text-xs font-bold text-slate-500 mt-1">Complete patient and prescribing doctor credentials.</p>
                        </div>

                        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Mandatory section */}
                            <div className="space-y-5">
                                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Basic & Mandatory Information</h4>
                                
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">Patient Name *</label>
                                    <input
                                        type="text"
                                        value={patientName}
                                        onChange={(e) => setPatientName(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white text-sm outline-none transition-all"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">Age *</label>
                                        <input
                                            type="number"
                                            value={patientAge}
                                            onChange={(e) => setPatientAge(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white text-sm outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">Gender *</label>
                                        <select
                                            value={patientGender}
                                            onChange={(e) => setPatientGender(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white text-sm outline-none transition-all"
                                            required
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">Contact Phone *</label>
                                    <input
                                        type="tel"
                                        value={patientPhone}
                                        onChange={(e) => setPatientPhone(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white text-sm outline-none transition-all"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">Referring Doctor *</label>
                                    <input
                                        type="text"
                                        value={doctorName}
                                        onChange={(e) => setDoctorName(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white text-sm outline-none transition-all"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">Tests Prescribed *</label>
                                    <div className="w-full h-44 overflow-y-auto p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs space-y-2">
                                        {tests.map(t => {
                                            const isSelected = selectedTests.includes(t._id);
                                            return (
                                                <label key={t._id} className="flex items-center gap-3 cursor-pointer select-none hover:bg-white p-2 rounded-lg transition-all">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedTests([...selectedTests, t._id]);
                                                            } else {
                                                                setSelectedTests(selectedTests.filter(id => id !== t._id));
                                                            }
                                                        }}
                                                        className="w-4 h-4 accent-blue-600 rounded border-slate-300 cursor-pointer"
                                                    />
                                                    <span className={`text-xs ${isSelected ? "text-blue-600 font-black" : "text-slate-600 font-bold"}`}>
                                                        {t.name} (₹{t.price})
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Optional section */}
                            <div className="space-y-5">
                                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Optional B2B & Clinical Tracking</h4>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">Priority</label>
                                        <select
                                            value={priority}
                                            onChange={(e) => setPriority(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white text-sm outline-none transition-all"
                                        >
                                            <option value="Normal">Normal</option>
                                            <option value="Urgent">Urgent</option>
                                            <option value="Stat">Stat</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">Collection Type</label>
                                        <select
                                            value={collectionType}
                                            onChange={(e) => setCollectionType(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white text-sm outline-none transition-all"
                                        >
                                            <option value="Walk-in">Walk-in</option>
                                            <option value="Lab Technician Collection">Lab Collector</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">Corporate Tag</label>
                                        <input
                                            type="text"
                                            value={corporateTag}
                                            onChange={(e) => setCorporateTag(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white text-sm outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">IP / OP Type</label>
                                        <select
                                            value={ipOpType}
                                            onChange={(e) => setIpOpType(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white text-sm outline-none transition-all"
                                        >
                                            <option value="IP">IP</option>
                                            <option value="OP">OP</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">Bed Number</label>
                                        <input
                                            type="text"
                                            value={bedNumber}
                                            onChange={(e) => setBedNumber(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white text-sm outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">Ward Name</label>
                                        <input
                                            type="text"
                                            value={ward}
                                            onChange={(e) => setWard(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white text-sm outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">Additional Remarks / Clinical Notes</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white text-sm outline-none transition-all h-20"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="md:col-span-2 pt-6 border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddOpen(false)}
                                    className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl font-black text-xs uppercase tracking-wider transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Sample Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal - Bulk CSV Uploader */}
            {isBulkOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white max-w-lg w-full p-8 rounded-[2rem] shadow-2xl relative border border-slate-100">
                        <button
                            onClick={() => setIsBulkOpen(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="mb-6">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <UploadCloud className="w-5 h-5 text-blue-600" /> Excel / CSV Patient List
                            </h3>
                            <p className="text-xs font-bold text-slate-500 mt-1">Submit multiple requests at once.</p>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs text-slate-400 font-medium">Format text list line by line as comma separated values:<br />
                            <code className="bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-600">Patient Name, Age, Gender, Phone, Doctor Name</code>
                            </p>
                            <textarea
                                value={bulkRawData}
                                onChange={(e) => setBulkRawData(e.target.value)}
                                placeholder="Example:&#10;Dileep Kumar, 44, Male, 9123456789, Dr. Sharma&#10;Kishore Reddy, 38, Male, 9876543210, Dr. Rajesh"
                                className="w-full h-48 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-mono text-xs focus:bg-white outline-none transition-all"
                            />

                            {bulkMessage && (
                                <div className="p-3 bg-emerald-50 text-emerald-600 font-bold border border-emerald-100 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-300">
                                    <CheckCircle2 className="w-4 h-4" /> {bulkMessage}
                                </div>
                            )}

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsBulkOpen(false)}
                                    className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl font-black text-xs uppercase tracking-wider transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBulkSubmit}
                                    disabled={loading || !bulkRawData.trim()}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload Requests"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
