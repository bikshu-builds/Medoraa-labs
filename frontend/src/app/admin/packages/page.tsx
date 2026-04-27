"use client";
import React, { useEffect, useState } from "react";
import Table from "../components/Table";
import { Sparkles, Plus, Edit2, Trash2, Tag, Percent, Activity } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Package {
    _id: string;
    name: string;
    description: string;
    price: number;
    discountPercentage: number;
    type: "Package" | "Membership";
    durationMonths: number;
    includedTests: string[];
    features: string[];
    status: string;
}

interface Test {
    _id: string;
    name: string;
    category: string;
    price: number;
}

const PackagesManagement: React.FC = () => {
    const [packages, setPackages] = useState<Package[]>([]);
    const [tests, setTests] = useState<Test[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [editingPkg, setEditingPkg] = useState<Package | null>(null);
    const [activeTab, setActiveTab] = useState<"Package" | "Membership">("Package");
    const [newFeature, setNewFeature] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        discountPercentage: "",
        type: "Package" as "Package" | "Membership",
        durationMonths: "12",
        status: "Active",
        includedTests: [] as string[],
        features: [] as string[]
    });

    const [testFormData, setTestFormData] = useState({
        name: "",
        category: "Other",
        price: ""
    });

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const [pkgRes, testRes] = await Promise.all([
                fetch(getApiUrl("/api/admin/packages"), { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(getApiUrl("/api/admin/tests"), { headers: { "Authorization": `Bearer ${token}` } })
            ]);
            
            if (pkgRes.ok) {
                const pkgData = await pkgRes.json();
                setPackages(pkgData.data);
            }
            if (testRes.ok) {
                const testData = await testRes.json();
                setTests(testData.data);
            }
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (pkg: Package | null = null) => {
        if (pkg) {
            setEditingPkg(pkg);
            setFormData({
                name: pkg.name,
                description: pkg.description || "",
                price: pkg.price.toString(),
                discountPercentage: pkg.discountPercentage?.toString() || "0",
                type: pkg.type || "Package",
                durationMonths: pkg.durationMonths?.toString() || "12",
                status: pkg.status,
                includedTests: pkg.includedTests || [],
                features: pkg.features || []
            });
        } else {
            setEditingPkg(null);
            setFormData({ 
                name: "", description: "", price: "", discountPercentage: "", 
                type: activeTab, durationMonths: "12", status: "Active", includedTests: [], features: [] 
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("adminToken");
            const url = editingPkg ? getApiUrl(`/api/admin/packages/${editingPkg._id}`) : getApiUrl("/api/admin/packages");
            const method = editingPkg ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    price: Number(formData.price),
                    discountPercentage: Number(formData.discountPercentage),
                    type: formData.type,
                    durationMonths: formData.type === "Membership" ? Number(formData.durationMonths) : undefined,
                    status: formData.status,
                    includedTests: formData.includedTests, // Tests apply to both now
                    features: formData.features
                })
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchData();
            }
        } catch (err) {
            console.error("Failed to save package", err);
        }
    };

    const handleSaveTest = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/tests"), {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: testFormData.name,
                    category: testFormData.category,
                    price: Number(testFormData.price)
                })
            });

            if (res.ok) {
                const newTest = await res.json();
                setTests([...tests, newTest.data]);
                setFormData(prev => ({ ...prev, includedTests: [...prev.includedTests, newTest.data._id] }));
                setIsTestModalOpen(false);
                setTestFormData({ name: "", category: "Other", price: "" });
            }
        } catch (err) {
            console.error("Failed to save test", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this package?")) return;
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl(`/api/admin/packages/${id}`), {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) fetchData();
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };

    const handleAddFeature = () => {
        if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
            setFormData(prev => ({ ...prev, features: [...prev.features, newFeature.trim()] }));
            setNewFeature("");
        }
    };

    const handleRemoveFeature = (feature: string) => {
        setFormData(prev => ({ ...prev, features: prev.features.filter(f => f !== feature) }));
    };

    const toggleTestSelection = (testId: string) => {
        setFormData(prev => {
            const newTests = prev.includedTests.includes(testId)
                ? prev.includedTests.filter(id => id !== testId)
                : [...prev.includedTests, testId];
            
            // Auto-calculate base price from tests ONLY for Packages
            const newPrice = prev.type === "Package" 
                ? newTests.reduce((sum, id) => sum + (tests.find(t => t._id === id)?.price || 0), 0).toString()
                : prev.price;
            
            return {
                ...prev,
                includedTests: newTests,
                price: newPrice
            };
        });
    };

    const columns = [
        { 
            header: "Plan Details", 
            accessor: "name" as const,
            render: (row: Package) => (
                <div className="flex flex-col">
                    <span className="font-black text-slate-900 tracking-tight text-base mb-0.5">{row.name}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {row.description || "No description"} • {row.type === "Membership" ? `${row.durationMonths} Months Validity` : `${row.includedTests?.length || 0} Tests`} {row.features?.length > 0 && `• ${row.features.length} Features`}
                    </span>
                </div>
            )
        },
        { 
            header: "Pricing", 
            accessor: "price" as const,
            render: (row: Package) => {
                const finalPrice = row.price - (row.price * (row.discountPercentage || 0) / 100);
                return (
                    <div className="flex flex-col justify-center">
                        <span className="text-lg font-black text-blue-600 tracking-tight">₹{Math.round(finalPrice).toLocaleString()}</span>
                        {(row.discountPercentage || 0) > 0 && (
                            <span className="text-xs font-bold text-slate-400 line-through">₹{row.price.toLocaleString()} Base Price</span>
                        )}
                    </div>
                );
            }
        },
        { 
            header: "Discount", 
            accessor: "discountPercentage" as const,
            render: (row: Package) => (
                <div className="flex items-center gap-2 font-black text-rose-600 text-sm bg-rose-50 px-2 py-1 rounded-lg w-fit border border-rose-100">
                    <Percent className="w-3.5 h-3.5" />
                    {row.discountPercentage || 0}% OFF
                </div>
            )
        },
        { 
            header: "Status", 
            accessor: "status" as const,
            render: (row: Package) => (
                <span className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border w-fit flex items-center gap-1.5",
                    row.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-600 border-slate-200"
                )}>
                    {row.status === "Active" ? <Activity className="w-3 h-3" /> : null}
                    {row.status}
                </span>
            )
        },
        { 
            header: "Actions", 
            accessor: "_id" as const,
            render: (row: Package) => (
                <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenModal(row)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(row._id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

    const filteredPackages = packages.filter(p => (p.type || "Package") === activeTab);

    const stats = {
        totalPlans: filteredPackages.length,
        activePlans: filteredPackages.filter(p => p.status === "Active").length,
        avgPrice: filteredPackages.length > 0 ? filteredPackages.reduce((acc, p) => acc + p.price, 0) / filteredPackages.length : 0
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Packages & Plans</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Manage bundled tests and membership subscriptions</p>
                </div>
                <button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-blue-600/20 transition-all active:scale-95">
                    <Plus className="w-4 h-4" />
                    {activeTab === "Membership" ? "Create Membership" : "Create Package"}
                </button>
            </div>

            <div className="flex items-center gap-2 border-b border-slate-200">
                <button 
                    onClick={() => setActiveTab("Package")}
                    className={cn(
                        "px-6 py-3 text-sm font-bold border-b-2 transition-all",
                        activeTab === "Package" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
                    )}
                >
                    Test Packages
                </button>
                <button 
                    onClick={() => setActiveTab("Membership")}
                    className={cn(
                        "px-6 py-3 text-sm font-bold border-b-2 transition-all",
                        activeTab === "Membership" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
                    )}
                >
                    Membership Plans
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Tag className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total {activeTab}s</p>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{stats.totalPlans}</h2>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 text-emerald-400 flex items-center justify-center">
                            <Activity className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Active {activeTab}s</p>
                    <h2 className="text-xl font-black text-white tracking-tight">{stats.activePlans}</h2>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Percent className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Average Price</p>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">₹{Math.round(stats.avgPrice).toLocaleString()}</h2>
                </div>
            </div>

            <Table columns={columns} data={filteredPackages} />

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
                    <div className="bg-white w-full max-w-xl rounded-3xl shadow-xl overflow-hidden my-auto">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-black text-lg text-slate-900">{editingPkg ? "Edit" : "Create New"} {formData.type}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="flex items-center gap-4 p-1 bg-slate-100 rounded-xl w-fit">
                                <button type="button" onClick={() => setFormData({...formData, type: "Package"})} className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", formData.type === "Package" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>Package</button>
                                <button type="button" onClick={() => setFormData({...formData, type: "Membership"})} className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", formData.type === "Membership" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>Membership</button>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Name</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" placeholder="e.g., Annual Health Plan" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" placeholder="Brief details about the plan" rows={2} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {formData.type === "Package" ? (
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Base Price (₹)</label>
                                        <div className="relative">
                                            <input type="number" readOnly value={formData.price || 0} className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-black text-slate-500 outline-none cursor-not-allowed" />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 uppercase">Auto-sum</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Price (₹)</label>
                                        <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Discount (%)</label>
                                    <input type="number" min="0" max="100" value={formData.discountPercentage} onChange={e => setFormData({...formData, discountPercentage: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" placeholder={formData.type === "Membership" ? "Discount on all tests" : ""} />
                                </div>
                            </div>
                            
                            {formData.type === "Membership" && (
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Validity (Months)</label>
                                    <input type="number" required min="1" value={formData.durationMonths} onChange={e => setFormData({...formData, durationMonths: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" />
                                </div>
                            )}

                            {Number(formData.price) > 0 && (
                                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
                                    <span className="text-xs font-bold text-blue-800">Final {formData.type} Amount</span>
                                    <div className="flex items-center gap-2">
                                        {Number(formData.discountPercentage) > 0 && (
                                            <span className="text-[10px] font-black text-slate-400 line-through">₹{formData.price}</span>
                                        )}
                                        <span className="text-lg font-black text-blue-700 tracking-tight">
                                            ₹{Math.round(Number(formData.price) - (Number(formData.price) * (Number(formData.discountPercentage) || 0) / 100)).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 border-t border-slate-100 space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Included Tests ({formData.includedTests.length})</label>
                                        <button type="button" onClick={() => setIsTestModalOpen(true)} className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1 transition-colors">
                                            <Plus className="w-3 h-3" /> New Test
                                        </button>
                                    </div>
                                    <div className="max-h-40 overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-2 space-y-1 custom-scrollbar">
                                        {tests.length === 0 ? (
                                            <p className="text-xs text-slate-500 text-center py-4 font-medium">No tests found. Create one first.</p>
                                        ) : (
                                            tests.map(test => (
                                                <label key={test._id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={formData.includedTests.includes(test._id)}
                                                        onChange={() => toggleTestSelection(test._id)}
                                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/20"
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-900 leading-none">{test.name}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{test.category} • ₹{test.price}</span>
                                                    </div>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Plan Features ({formData.features.length})</label>
                                    <div className="flex gap-2 mb-2">
                                        <input 
                                            type="text" 
                                            value={newFeature} 
                                            onChange={e => setNewFeature(e.target.value)} 
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                                            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" 
                                            placeholder="e.g., Free Home Collection" 
                                        />
                                        <button type="button" onClick={handleAddFeature} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all">Add</button>
                                    </div>
                                    {formData.features.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {formData.features.map((feature, idx) => (
                                                <span key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                                                    {feature}
                                                    <button type="button" onClick={() => handleRemoveFeature(feature)} className="text-blue-400 hover:text-rose-500 ml-1">×</button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Status</label>
                                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all">
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3 sticky bottom-0 bg-white">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-600/20 transition-all active:scale-95">Save {formData.type}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Nested Test Creation Modal */}
            {isTestModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-black text-lg text-slate-900">Quick Add Test</h3>
                            <button onClick={() => setIsTestModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
                        </div>
                        <form onSubmit={handleSaveTest} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Test Name</label>
                                <input type="text" required value={testFormData.name} onChange={e => setTestFormData({...testFormData, name: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
                                <select value={testFormData.category} onChange={e => setTestFormData({...testFormData, category: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none">
                                    {["Diabetes / Sugar", "Liver (Hepatic)", "Kidney / Renal", "Heart / Cardiac", "Thyroid / Hormones", "Infections / Fever", "Immunology / Autoimmune", "Microbiology", "General Health Profiles", "Cancer Markers", "Bone / Mineral", "Urine / Stool", "Other"].map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Price (₹)</label>
                                <input type="number" required value={testFormData.price} onChange={e => setTestFormData({...testFormData, price: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none" />
                            </div>
                            <div className="pt-2 flex gap-3">
                                <button type="button" onClick={() => setIsTestModalOpen(false)} className="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all active:scale-95">Save Test</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PackagesManagement;
