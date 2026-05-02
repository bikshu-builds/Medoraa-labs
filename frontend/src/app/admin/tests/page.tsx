"use client";
import React, { useState, useEffect } from "react";
import { 
    Plus, 
    Sparkles, 
    Clock, 
    MoreVertical, 
    Trash2, 
    Edit, 
    Search, 
    X,
    Filter
} from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface Test {
    _id: string;
    name: string;
    category: string;
    price: number;
    description: string;
    tat: string;
    status: string;
    createdAt: string;
}

const CATEGORIES = [
    "Diabetes / Sugar", 
    "Liver (Hepatic)", 
    "Kidney / Renal", 
    "Heart / Cardiac", 
    "Thyroid / Hormones", 
    "Infections / Fever", 
    "Immunology / Autoimmune", 
    "Microbiology", 
    "General Health Profiles", 
    "Cancer Markers", 
    "Bone / Mineral", 
    "Urine / Stool",
    "Other"
];

const TestsManagementPage = () => {
    const [tests, setTests] = useState<Test[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Form states
    const [idToEdit, setIdToEdit] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [category, setCategory] = useState("Other");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [tat, setTat] = useState("24 Hours");
    const [status, setStatus] = useState("Active");
    const [isSaving, setIsSaving] = useState(false);

    // Filter states
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const fetchTests = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/tests"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setTests(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTests();
    }, []);

    const openCreate = () => {
        setIdToEdit(null);
        setName("");
        setCategory("Other");
        setPrice("");
        setDescription("");
        setTat("24 Hours");
        setStatus("Active");
        setIsFormOpen(true);
    };

    const openEdit = (test: Test) => {
        setIdToEdit(test._id);
        setName(test.name);
        setCategory(test.category);
        setPrice(test.price.toString());
        setDescription(test.description || "");
        setTat(test.tat || "24 Hours");
        setStatus(test.status || "Active");
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !price) return;

        setIsSaving(true);
        try {
            const token = localStorage.getItem("adminToken");
            const payload = {
                name,
                category,
                price: parseFloat(price),
                description,
                tat,
                status
            };

            let res;
            if (idToEdit) {
                res = await fetch(getApiUrl(`/api/admin/tests/${idToEdit}`), {
                    method: "PUT",
                    headers: { 
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch(getApiUrl("/api/admin/tests"), {
                    method: "POST",
                    headers: { 
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });
            }

            const data = await res.json();
            if (data.success) {
                setIsFormOpen(false);
                fetchTests();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (testId: string) => {
        if (!confirm("Are you sure you want to remove this test from the catalog?")) return;
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl(`/api/admin/tests/${testId}`), {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                fetchTests();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredTests = tests.filter(test => {
        const matchesSearch = test.name.toLowerCase().includes(search.toLowerCase());
        const matchesCat = selectedCategory === "All" || test.category === selectedCategory;
        return matchesSearch && matchesCat;
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-in fade-in">
                <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Test Catalog...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Diagnostic Test Registry</h1>
                    <p className="text-slate-500 text-sm mt-0.5 font-medium">Manage and configure available tests, turnaround times, and pricing catalog.</p>
                </div>
                <button 
                    onClick={openCreate}
                    className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl font-bold text-xs hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-600/20 w-fit"
                >
                    <Plus className="w-4 h-4" />
                    Quick Add Test
                </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm select-none">
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 px-3.5 py-2 rounded-xl focus-within:ring-1 focus:ring-blue-600 transition-all w-full md:max-w-md">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search for test name..."
                        className="bg-transparent outline-none text-xs font-medium text-slate-700 w-full"
                    />
                </div>
                <div className="flex items-center gap-2 select-none shrink-0">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-slate-50 border border-slate-200/60 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-1 focus:ring-blue-600 transition-all cursor-pointer"
                    >
                        <option value="All">All Categories</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTests.length > 0 ? (
                    filteredTests.map((test) => (
                        <div key={test._id} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group select-none">
                            <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <span className="px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-100/60 rounded-lg text-[9px] font-black uppercase tracking-widest truncate max-w-[70%]">
                                        {test.category}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => openEdit(test)}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors bg-slate-50 hover:bg-blue-50 border border-slate-100/60 hover:border-blue-100 rounded-lg"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(test._id)}
                                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors bg-slate-50 hover:bg-rose-50 border border-slate-100/60 hover:border-rose-100 rounded-lg"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-tight line-clamp-1">{test.name}</h3>
                                    {test.description && (
                                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1 line-clamp-2">
                                            {test.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100/60 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5 leading-none">Price</span>
                                    <span className="text-base font-black text-slate-900 leading-none">₹{test.price}</span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-500 font-bold text-[10px] bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100/60 shrink-0">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    {test.tat || "24 Hours"}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-16 text-center bg-white border border-slate-200/60 rounded-2xl">
                        <Sparkles className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <h3 className="text-slate-900 font-bold">No test records found</h3>
                        <p className="text-slate-400 text-sm mt-0.5 font-medium">Add your first test or modify filters to find what you are looking for.</p>
                    </div>
                )}
            </div>

            {/* Modal for adding/updating a test */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl border border-slate-200/60 w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col gap-5 select-none">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-black tracking-tight text-slate-900">
                                    {idToEdit ? "Edit Diagnostic Test" : "Quick Add Test"}
                                </h2>
                                <p className="text-xs font-medium text-slate-400 mt-0.5">Define your diagnostic procedures and metrics.</p>
                            </div>
                            <button 
                                onClick={() => setIsFormOpen(false)}
                                className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all border border-slate-100/60 hover:border-slate-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1.5 leading-none">Test Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Complete Blood Count (CBC)"
                                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-xl outline-none focus:ring-1 focus:ring-blue-600 transition-all text-xs font-medium text-slate-700"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1.5 leading-none">Category</label>
                                    <select 
                                        required
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-xl outline-none focus:ring-1 focus:ring-blue-600 transition-all text-xs font-medium text-slate-700 cursor-pointer"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1.5 leading-none">Price (₹)</label>
                                    <input 
                                        type="number" 
                                        required
                                        min={0}
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="e.g. 299"
                                        className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-xl outline-none focus:ring-1 focus:ring-blue-600 transition-all text-xs font-medium text-slate-700"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1.5 leading-none">Turnaround (TAT)</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={tat}
                                        onChange={(e) => setTat(e.target.value)}
                                        placeholder="e.g. 12 Hours or 1 Day"
                                        className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-xl outline-none focus:ring-1 focus:ring-blue-600 transition-all text-xs font-medium text-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1.5 leading-none">Catalog Status</label>
                                    <select 
                                        required
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-xl outline-none focus:ring-1 focus:ring-blue-600 transition-all text-xs font-medium text-slate-700 cursor-pointer"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1.5 leading-none">Description / Details (Optional)</label>
                                <textarea 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter additional instructions or diagnostic details..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-xl outline-none focus:ring-1 focus:ring-blue-600 transition-all text-xs font-medium text-slate-700 resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 select-none">
                                <button 
                                    type="button" 
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-all border border-slate-200/60"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-600/10"
                                >
                                    {isSaving ? (idToEdit ? "Saving..." : "Creating...") : (idToEdit ? "Save Test" : "Add Test")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestsManagementPage;
