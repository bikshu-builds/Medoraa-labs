"use client";
import React, { useEffect, useState } from "react";
import { getApiUrl } from "@/lib/api";
import {
    Activity,
    Search,
    Plus,
    X,
    Edit,
    Trash2,
    CheckCircle2,
    ShieldAlert,
    Loader2
} from "lucide-react";

interface HospitalItem {
    _id: string;
    name: string;
    branchName: string;
    contactPerson: string;
    phoneNumber: string;
    email: string;
    address: string;
    gstNumber: string;
    loginUsername: string;
    status: string;
    creditLimit: number;
    billingCycle: string;
    hospitalCode: string;
    agreementType: string;
}

export default function AdminHospitalsPage() {
    const [hospitals, setHospitals] = useState<HospitalItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingHospital, setEditingHospital] = useState<HospitalItem | null>(null);

    // Form states
    const [name, setName] = useState("");
    const [branchName, setBranchName] = useState("");
    const [contactPerson, setContactPerson] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [gstNumber, setGstNumber] = useState("");
    const [loginUsername, setLoginUsername] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState("Active");
    const [creditLimit, setCreditLimit] = useState("");
    const [billingCycle, setBillingCycle] = useState("Monthly");
    const [hospitalCode, setHospitalCode] = useState("");
    const [agreementType, setAgreementType] = useState("");

    const loadHospitals = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/hospitals"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setHospitals(data.data);
            }
        } catch (err) {
            console.error("Error loading hospitals", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHospitals();
    }, []);

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem("adminToken");
            const url = editingHospital
                ? getApiUrl(`/api/admin/hospitals/${editingHospital._id}`)
                : getApiUrl("/api/admin/hospitals");

            const method = editingHospital ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    name, branchName, contactPerson, phoneNumber, email, address, gstNumber,
                    loginUsername, password, status, creditLimit: Number(creditLimit) || 0,
                    billingCycle, hospitalCode, agreementType
                })
            });

            const data = await res.json();
            if (data.success) {
                setIsAddOpen(false);
                setEditingHospital(null);
                setName("");
                setBranchName("");
                setPhoneNumber("");
                setEmail("");
                setPassword("");
                setLoginUsername("");
                setHospitalCode("");
                loadHospitals();
            }
        } catch (err) {
            console.error("Failed saving hospital", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (hosp: HospitalItem) => {
        setEditingHospital(hosp);
        setName(hosp.name || "");
        setBranchName(hosp.branchName || "");
        setContactPerson(hosp.contactPerson || "");
        setPhoneNumber(hosp.phoneNumber || "");
        setEmail(hosp.email || "");
        setAddress(hosp.address || "");
        setGstNumber(hosp.gstNumber || "");
        setLoginUsername(hosp.loginUsername || "");
        setPassword("");
        setStatus(hosp.status || "Active");
        setCreditLimit(String(hosp.creditLimit || ""));
        setBillingCycle(hosp.billingCycle || "Monthly");
        setHospitalCode(hosp.hospitalCode || "");
        setAgreementType(hosp.agreementType || "");
        setIsAddOpen(true);
    };

    const handleDeleteClick = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this B2B hospital account?")) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl(`/api/admin/hospitals/${id}`), {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                loadHospitals();
            }
        } catch (err) {
            console.error("Failed deleting hospital", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredHospitals = hospitals.filter(h =>
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.hospitalCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Activity className="w-6 h-6 text-blue-600" /> Hospital & B2B Master Management
                    </h1>
                    <p className="text-sm font-bold text-slate-500 mt-1">Configure diagnostic partner institutions, credit policies, and login credentials.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingHospital(null);
                        setName("");
                        setBranchName("");
                        setContactPerson("");
                        setPhoneNumber("");
                        setEmail("");
                        setAddress("");
                        setGstNumber("");
                        setLoginUsername("");
                        setPassword("");
                        setHospitalCode("");
                        setIsAddOpen(true);
                    }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/10 active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4" /> Register New B2B Hospital
                </button>
            </div>

            {/* List Table */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
                <div className="relative max-w-sm group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search Name or Hospital Code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 text-xs bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white outline-none transition-all"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Hospital Code</th>
                                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Institution Name</th>
                                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Branch & City</th>
                                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Login Username</th>
                                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Status</th>
                                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredHospitals.length > 0 ? (
                                filteredHospitals.map(hosp => (
                                    <tr key={hosp._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3.5 px-4 text-xs font-bold font-mono text-blue-600">{hosp.hospitalCode}</td>
                                        <td className="py-3.5 px-4 text-xs font-black text-slate-800">{hosp.name}</td>
                                        <td className="py-3.5 px-4 text-xs font-bold text-slate-500">{hosp.branchName || "Main Center"}</td>
                                        <td className="py-3.5 px-4 text-xs font-mono font-bold text-slate-600">{hosp.loginUsername}</td>
                                        <td className="py-3.5 px-4 text-xs">
                                            <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider ${
                                                hosp.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                                            }`}>
                                                {hosp.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-xs text-center flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleEditClick(hosp)}
                                                className="p-1.5 hover:bg-slate-100 rounded-lg text-blue-600 transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(hosp._id)}
                                                className="p-1.5 hover:bg-slate-100 rounded-lg text-rose-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-400 font-bold text-sm">
                                        No hospital partners registered.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
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
                                <Plus className="w-5 h-5 text-blue-600" /> {editingHospital ? "Update" : "Register New"} B2B Account
                            </h3>
                            <p className="text-xs font-bold text-slate-500 mt-1">Configure full credentials and operational parameters.</p>
                        </div>

                        <form onSubmit={handleCreateOrUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Pane */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Institutional Details</h4>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">Hospital Name *</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white text-sm outline-none transition-all"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">Hospital Code *</label>
                                        <input
                                            type="text"
                                            value={hospitalCode}
                                            onChange={(e) => setHospitalCode(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white text-sm outline-none transition-all font-mono"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">Branch Name</label>
                                        <input
                                            type="text"
                                            value={branchName}
                                            onChange={(e) => setBranchName(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white text-sm outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">Contact Person *</label>
                                    <input
                                        type="text"
                                        value={contactPerson}
                                        onChange={(e) => setContactPerson(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white text-sm outline-none transition-all"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">Phone *</label>
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white text-sm outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">Email *</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white text-sm outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">Full Address</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white text-sm outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Right Pane */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Access & Billing Rules</h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">GST Number</label>
                                        <input
                                            type="text"
                                            value={gstNumber}
                                            onChange={(e) => setGstNumber(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white text-sm outline-none transition-all font-mono uppercase"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">Agreement Type</label>
                                        <input
                                            type="text"
                                            value={agreementType}
                                            onChange={(e) => setAgreementType(e.target.value)}
                                            placeholder="e.g. Fixed Rate"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white text-sm outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">Login Username *</label>
                                        <input
                                            type="text"
                                            value={loginUsername}
                                            onChange={(e) => setLoginUsername(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white text-sm outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">Password *</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder={editingHospital ? "Leave blank to keep same" : "••••••••"}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white text-sm outline-none transition-all"
                                            required={!editingHospital}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">Status</label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white text-sm outline-none transition-all"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">Credit Limit</label>
                                        <input
                                            type="number"
                                            value={creditLimit}
                                            onChange={(e) => setCreditLimit(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white text-sm outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-2">Billing Cycle</label>
                                    <select
                                        value={billingCycle}
                                        onChange={(e) => setBillingCycle(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white text-sm outline-none transition-all"
                                    >
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                        <option value="Bimonthly">Bimonthly</option>
                                    </select>
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
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingHospital ? "Save Changes" : "Confirm Register")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
