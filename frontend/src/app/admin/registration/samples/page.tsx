"use client";
import React, { useEffect, useState, useRef } from "react";
import { getApiUrl } from "@/lib/api";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Loader2,
    X,
    Download,
    Upload,
    FileSpreadsheet,
    Database,
    RefreshCw,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import * as XLSX from "xlsx";

interface SampleItem {
    _id: string;
    slno: string;
    organ: string;
    category: string;
    testName: string;
    method: string;
    container: string;
    sampleUsedForTest: string;
    reportTime: string;
    referenceRange: string;
    labPrice: string;
    patientPrice: string;
    createdBy?: {
        name: string;
        email: string;
    };
    createdAt?: string;
}

export default function SamplesDirectoryPage() {
    const [samples, setSamples] = useState<SampleItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSample, setEditingSample] = useState<SampleItem | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Staging and Excel Import States
    const [stagedSamples, setStagedSamples] = useState<any[]>([]);
    const [isImportMode, setIsImportMode] = useState(false);
    const [editingStagedIndex, setEditingStagedIndex] = useState<number | null>(null);
    
    // User role state
    const [userRole, setUserRole] = useState<string>("registration");

    // Form inputs state
    const [slno, setSlno] = useState("");
    const [organ, setOrgan] = useState("");
    const [category, setCategory] = useState("");
    const [testName, setTestName] = useState("");
    const [method, setMethod] = useState("");
    const [container, setContainer] = useState("");
    const [sampleUsedForTest, setSampleUsedForTest] = useState("");
    const [reportTime, setReportTime] = useState("");
    const [referenceRange, setReferenceRange] = useState("");
    const [labPrice, setLabPrice] = useState("");
    const [patientPrice, setPatientPrice] = useState("");

    // Message notifications
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    const showToast = (type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const loadSamples = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/samples"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSamples(data.data);
            } else {
                showToast("error", data.message || "Failed to fetch samples");
            }
        } catch (err: any) {
            console.error("Error loading samples:", err);
            showToast("error", "Error connecting to server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSamples();
        
        // Fetch user role
        const storedUser = localStorage.getItem("adminUser");
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setUserRole(parsed.role || "admin");
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const resetForm = () => {
        setEditingSample(null);
        setEditingStagedIndex(null);
        setSlno("");
        setOrgan("");
        setCategory("");
        setTestName("");
        setMethod("");
        setContainer("");
        setSampleUsedForTest("");
        setReportTime("");
        setReferenceRange("");
        setLabPrice("");
        setPatientPrice("");
    };

    const handleOpenAdd = () => {
        resetForm();
        setIsFormOpen(true);
    };

    const handleOpenEdit = (sample: SampleItem) => {
        setEditingSample(sample);
        setEditingStagedIndex(null);
        setSlno(sample.slno || "");
        setOrgan(sample.organ || "");
        setCategory(sample.category || "");
        setTestName(sample.testName || "");
        setMethod(sample.method || "");
        setContainer(sample.container || "");
        setSampleUsedForTest(sample.sampleUsedForTest || "");
        setReportTime(sample.reportTime || "");
        setReferenceRange(sample.referenceRange || "");
        setLabPrice(sample.labPrice || "");
        setPatientPrice(sample.patientPrice || "");
        setIsFormOpen(true);
    };

    const handleOpenEditStaged = (index: number, sample: any) => {
        setEditingStagedIndex(index);
        setEditingSample(null);
        setSlno(sample["Sl No"] || "");
        setOrgan(sample["Organ"] || "");
        setCategory(sample["Category"] || "");
        setTestName(sample["Test Name"] || "");
        setMethod(sample["Method"] || "");
        setContainer(sample["Container"] || "");
        setSampleUsedForTest(sample["Sample Used for test"] || "");
        setReportTime(sample["Report Time"] || "");
        setReferenceRange(sample["Reference Range"] || "");
        setLabPrice(sample["Lab Price"] || "");
        setPatientPrice(sample["Patient Price"] || "");
        setIsFormOpen(true);
    };

    const handleDeleteStaged = (index: number) => {
        if (!window.confirm("Are you sure you want to remove this staged record?")) return;
        setStagedSamples(prev => prev.filter((_, idx) => idx !== index));
        showToast("success", "Staged sample removed from preview");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!testName.trim()) {
            showToast("error", "Test Name is required");
            return;
        }

        if (editingStagedIndex !== null) {
            const updatedStaged = [...stagedSamples];
            updatedStaged[editingStagedIndex] = {
                "Sl No": slno,
                "Organ": organ,
                "Category": category,
                "Test Name": testName,
                "Method": method,
                "Container": container,
                "Sample Used for test": sampleUsedForTest,
                "Report Time": reportTime,
                "Reference Range": referenceRange,
                "Lab Price": labPrice,
                "Patient Price": patientPrice
            };
            setStagedSamples(updatedStaged);
            setIsFormOpen(false);
            resetForm();
            showToast("success", "Staged sample updated successfully");
            return;
        }

        setActionLoading(true);
        try {
            const token = localStorage.getItem("adminToken");
            const url = editingSample
                ? getApiUrl(`/api/admin/samples/${editingSample._id}`)
                : getApiUrl("/api/admin/samples");

            const methodType = editingSample ? "PUT" : "POST";

            const res = await fetch(url, {
                method: methodType,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    slno,
                    organ,
                    category,
                    testName,
                    method,
                    container,
                    sampleUsedForTest,
                    reportTime,
                    referenceRange,
                    labPrice,
                    patientPrice
                })
            });

            const data = await res.json();
            if (data.success) {
                showToast("success", editingSample ? "Sample updated successfully" : "Sample added successfully");
                setIsFormOpen(false);
                resetForm();
                loadSamples();
            } else {
                showToast("error", data.message || "Failed to save sample");
            }
        } catch (err) {
            console.error("Failed saving sample:", err);
            showToast("error", "Failed to save sample due to network issue");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this sample entry?")) return;
        setActionLoading(true);
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl(`/api/admin/samples/${id}`), {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                showToast("success", "Sample deleted successfully");
                loadSamples();
            } else {
                showToast("error", data.message || "Failed to delete sample");
            }
        } catch (err) {
            console.error("Failed deleting sample:", err);
            showToast("error", "Network error when deleting sample");
        } finally {
            setActionLoading(false);
        }
    };

    // Download XLS template
    const handleDownloadTemplate = () => {
        const templateHeaders = [
            {
                "Sl No": "1",
                "Organ": "Liver",
                "Category": "LFT",
                "Test Name": "Bilirubin Total",
                "Method": "Photometry",
                "Container": "SST (Yellow)",
                "Sample Used for test": "Serum",
                "Report Time": "Same Day",
                "Reference Range": "0.2 - 1.2 mg/dL",
                "Lab Price": "150",
                "Patient Price": "200"
            },
            {
                "Sl No": "2",
                "Organ": "Kidney",
                "Category": "RFT",
                "Test Name": "Serum Creatinine",
                "Method": "Jaffe",
                "Container": "Red Cap",
                "Sample Used for test": "Serum",
                "Report Time": "Same Day",
                "Reference Range": "0.6 - 1.2 mg/dL",
                "Lab Price": "120",
                "Patient Price": "180"
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(templateHeaders);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "SamplesTemplate");
        
        // Write to browser
        XLSX.writeFile(workbook, "samples_template.xlsx");
        showToast("success", "Template download initiated");
    };

    // Export Samples to Excel
    const handleExportExcel = () => {
        if (filteredSamples.length === 0) {
            showToast("error", "No sample records match the search query to export");
            return;
        }

        // Map samples to match the headers nicely
        const exportData = filteredSamples.map(sample => ({
            "Sl No": sample.slno || "",
            "Organ": sample.organ || "",
            "Category": sample.category || "",
            "Test Name": sample.testName || "",
            "Method": sample.method || "",
            "Container": sample.container || "",
            "Sample Used for test": sample.sampleUsedForTest || "",
            "Report Time": sample.reportTime || "",
            "Reference Range": sample.referenceRange || "",
            "Lab Price": sample.labPrice || "",
            "Patient Price": sample.patientPrice || ""
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "SamplesCatalog");
        
        // Write to browser
        XLSX.writeFile(workbook, "samples_catalog.xlsx");
        showToast("success", "Samples catalog export initiated");
    };

    // Handle Upload Excel
    const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        const reader = new FileReader();

        reader.onload = async (evt) => {
            try {
                const data = evt.target?.result;
                if (!data) return;

                const workbook = XLSX.read(data, { type: "array" });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Parse to json, empty cell -> undefined
                const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "-" });
                console.log("Excel Raw Rows parsed:", rawRows);

                if (rawRows.length === 0) {
                    showToast("error", "No data rows found in excel file");
                    return;
                }

                // Process rows with flexible column matching strategy
                const cleanedRows = rawRows.map((row, index) => {
                    const findValue = (termsList: string[][]) => {
                        const keys = Object.keys(row);
                        for (const terms of termsList) {
                            for (const key of keys) {
                                const normalizedKey = key.toLowerCase().replace(/[\s_\.\-\/]/g, "");
                                const match = terms.every(term => normalizedKey.includes(term));
                                if (match) {
                                    return row[key];
                                }
                            }
                        }
                        return undefined;
                    };

                    const slnoVal = findValue([["sl", "no"], ["s", "no"], ["sno"], ["serial"], ["slno"]]);
                    const organVal = findValue([["organ"]]);
                    const categoryVal = findValue([["category"], ["cat"]]);
                    
                    // Match Test Name or test or name
                    let testNameVal = findValue([["test", "name"], ["testname"]]);
                    if (testNameVal === undefined) {
                        testNameVal = findValue([["test"]]);
                    }
                    if (testNameVal === undefined) {
                        testNameVal = findValue([["name"]]);
                    }

                    const methodVal = findValue([["method"]]);
                    const containerVal = findValue([["container"], ["tube"], ["cap"]]);
                    const sampleUsedForTestVal = findValue([["sample", "used"], ["sampleused"], ["sample"], ["specimen"]]);
                    const reportTimeVal = findValue([["report", "time"], ["reporttime"], ["tat"], ["reporting"]]);
                    const referenceRangeVal = findValue([["reference", "range"], ["referencerange"], ["ref", "range"], ["reference"], ["range"]]);
                    const labPriceVal = findValue([["lab", "price"], ["labprice"], ["b2b"]]);
                    const patientPriceVal = findValue([["patient", "price"], ["patientprice"], ["mrp"], ["patient"]]);

                    const clean = (val: any) => {
                        if (val === null || val === undefined) return "-";
                        const s = String(val).trim();
                        return s === "" ? "-" : s;
                    };

                    return {
                        "Sl No": clean(slnoVal),
                        "Organ": clean(organVal),
                        "Category": clean(categoryVal),
                        "Test Name": clean(testNameVal),
                        "Method": clean(methodVal),
                        "Container": clean(containerVal),
                        "Sample Used for test": clean(sampleUsedForTestVal),
                        "Report Time": clean(reportTimeVal),
                        "Reference Range": clean(referenceRangeVal),
                        "Lab Price": clean(labPriceVal),
                        "Patient Price": clean(patientPriceVal)
                    };
                });

                console.log("Processed Cleaned Rows:", cleanedRows);

                // Filter out rows where Test Name is completely missing or "-"
                const validRows = cleanedRows.filter(r => r["Test Name"] !== "-");
                console.log("Valid Rows to send:", validRows);

                if (validRows.length === 0) {
                    showToast("error", "No rows with a valid Test Name column matched in excel file");
                    return;
                }

                setStagedSamples(validRows);
                setIsImportMode(true);
                showToast("success", `Staged ${validRows.length} samples for review`);
            } catch (err: any) {
                console.error("Excel processing failed:", err);
                showToast("error", "Failed to parse excel file");
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const handleSaveAllImported = async () => {
        if (stagedSamples.length === 0) {
            showToast("error", "No staged samples to import");
            return;
        }

        setActionLoading(true);
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/samples/import"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ samples: stagedSamples })
            });

            const resData = await res.json();
            if (resData.success) {
                showToast("success", `Successfully imported ${resData.count} samples`);
                setStagedSamples([]);
                setIsImportMode(false);
                loadSamples();
            } else {
                showToast("error", resData.message || "Failed to import samples");
            }
        } catch (err) {
            console.error("Failed saving staged samples:", err);
            showToast("error", "Failed to save samples due to network issue");
        } finally {
            setActionLoading(false);
        }
    };

    const handleImportClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const filteredSamples = samples.filter(sample =>
        (sample.testName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sample.organ || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sample.category || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Staging Preview UI
    if (isImportMode) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Toast Alerts */}
                {toast && (
                    <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 border animate-in slide-in-from-bottom-5 duration-300 ${
                        toast.type === "success" 
                            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-800 dark:text-emerald-300"
                            : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 text-rose-800 dark:text-rose-300"
                    }`}>
                        {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span className="text-xs font-bold">{toast.msg}</span>
                    </div>
                )}

                {/* Staging Header */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-amber-50/60 dark:bg-amber-955/10 border border-amber-200/60 dark:border-amber-900/30 p-5 rounded-2xl shadow-sm">
                    <div>
                        <h1 className="text-xl font-black text-amber-900 dark:text-amber-400 tracking-tight flex items-center gap-2">
                            <span className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-350 rounded-lg">
                                <FileSpreadsheet className="w-5 h-5" />
                            </span>
                            Excel Import Staging &amp; Review
                        </h1>
                        <p className="text-amber-800 dark:text-amber-350 text-xs mt-1.5 font-semibold">
                            Review, edit, or delete staged records parsed from Excel. Click "Save &amp; Import All" to commit all {stagedSamples.length} samples to the catalog.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => {
                                if (window.confirm("Are you sure you want to cancel the import? All staged progress will be lost.")) {
                                    setStagedSamples([]);
                                    setIsImportMode(false);
                                }
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold rounded-xl text-xs text-slate-650 dark:text-slate-350 transition-all active:scale-95 cursor-pointer shadow-sm"
                        >
                            <X className="w-3.5 h-3.5" />
                            Cancel Import
                        </button>
                        <button
                            onClick={handleSaveAllImported}
                            disabled={actionLoading}
                            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-bold rounded-xl text-xs transition-all active:scale-95 cursor-pointer shadow-md shadow-amber-900/5"
                        >
                            {actionLoading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            Save &amp; Import All ({stagedSamples.length})
                        </button>
                    </div>
                </div>

                {/* Staged Table Grid */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800">
                                    <th className="py-3 px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest w-16">Sl No</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Test Name</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Organ</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Category</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Method</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Container</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Sample Used</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Report Time</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Reference Range</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Lab Price</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Patient Price</th>
                                    <th className="py-3 px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center w-24">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {stagedSamples.length > 0 ? (
                                    stagedSamples.map((sample, index) => (
                                        <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                            <td className="py-3.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-350">{sample["Sl No"]}</td>
                                            <td className="py-3.5 px-4 text-xs font-black text-slate-900 dark:text-white">{sample["Test Name"]}</td>
                                            <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">{sample["Organ"]}</td>
                                            <td className="py-3.5 px-4 text-xs font-semibold text-slate-650 dark:text-slate-400">
                                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-md text-[10px] font-extrabold uppercase">
                                                    {sample["Category"]}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">{sample["Method"]}</td>
                                            <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">{sample["Container"]}</td>
                                            <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">{sample["Sample Used for test"]}</td>
                                            <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">{sample["Report Time"]}</td>
                                            <td className="py-3.5 px-4 text-xs font-mono text-slate-550 dark:text-slate-450">{sample["Reference Range"]}</td>
                                            <td className="py-3.5 px-4 text-xs font-extrabold text-blue-600 dark:text-blue-400">
                                                {sample["Lab Price"] !== "-" ? `₹${sample["Lab Price"]}` : "-"}
                                            </td>
                                            <td className="py-3.5 px-4 text-xs font-black text-slate-800 dark:text-slate-300">
                                                {sample["Patient Price"] !== "-" ? `₹${sample["Patient Price"]}` : "-"}
                                            </td>
                                            <td className="py-3.5 px-4 text-xs text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => handleOpenEditStaged(index, sample)}
                                                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                                                        title="Edit Staged Entry"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteStaged(index)}
                                                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-slate-400 hover:text-rose-650 transition-colors cursor-pointer"
                                                        title="Remove Staged Entry"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={12} className="py-16 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-955/20 flex items-center justify-center text-amber-505">
                                                    <FileSpreadsheet className="w-6 h-6" />
                                                </div>
                                                <h3 className="text-sm font-black text-slate-850 dark:text-slate-200">No Staged Samples Left</h3>
                                                <p className="text-slate-500 text-xs max-w-xs mx-auto font-medium">
                                                    All items have been removed. Click "Cancel Import" to return to the catalog directory.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Staging Modal Form Drawer */}
                {isFormOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-2xl w-full rounded-2xl shadow-2xl relative my-auto animate-in scale-in duration-200">
                            
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-5 border-b border-slate-150 dark:border-slate-800">
                                <div>
                                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                                        Update Staged Sample Details
                                    </h3>
                                    <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                                        Modify Staged Entry parameters before committing to Database
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsFormOpen(false);
                                        resetForm();
                                    }}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 transition-colors p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body / Form */}
                            <form onSubmit={handleSubmit}>
                                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase">Sl No</label>
                                            <input
                                                type="text"
                                                value={slno}
                                                onChange={(e) => setSlno(e.target.value)}
                                                placeholder="e.g. 1"
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-205"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase">Test Name *</label>
                                            <input
                                                type="text"
                                                required
                                                value={testName}
                                                onChange={(e) => setTestName(e.target.value)}
                                                placeholder="e.g. Fasting Blood Glucose"
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-205"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase">Organ Group</label>
                                            <input
                                                type="text"
                                                value={organ}
                                                onChange={(e) => setOrgan(e.target.value)}
                                                placeholder="e.g. Liver / Kidney"
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-205"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase">Category</label>
                                            <input
                                                type="text"
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                placeholder="e.g. LFT / RFT / Lipid"
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-205"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase">Method Used</label>
                                            <input
                                                type="text"
                                                value={method}
                                                onChange={(e) => setMethod(e.target.value)}
                                                placeholder="e.g. ELISA / CLIA"
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-205"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase">Container / Cap Color</label>
                                            <input
                                                type="text"
                                                value={container}
                                                onChange={(e) => setContainer(e.target.value)}
                                                placeholder="e.g. SST Yellow / Lavender EDTA"
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-205"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase">Sample Used for Test</label>
                                            <input
                                                type="text"
                                                value={sampleUsedForTest}
                                                onChange={(e) => setSampleUsedForTest(e.target.value)}
                                                placeholder="e.g. Serum / Plasma / Urine"
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-205"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase">Report TAT / Time</label>
                                            <input
                                                type="text"
                                                value={reportTime}
                                                onChange={(e) => setReportTime(e.target.value)}
                                                placeholder="e.g. Same Day / 24 Hours"
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-205"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase">Biological Reference Range</label>
                                        <input
                                            type="text"
                                            value={referenceRange}
                                            onChange={(e) => setReferenceRange(e.target.value)}
                                            placeholder="e.g. 70 - 110 mg/dL"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-205"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase">Lab B2B Price (₹)</label>
                                            <input
                                                type="text"
                                                value={labPrice}
                                                onChange={(e) => setLabPrice(e.target.value)}
                                                placeholder="e.g. 150"
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-205"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase">Patient Price (₹)</label>
                                            <input
                                                type="text"
                                                value={patientPrice}
                                                onChange={(e) => setPatientPrice(e.target.value)}
                                                placeholder="e.g. 250"
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-205"
                                            />
                                        </div>
                                    </div>

                                </div>

                                {/* Modal Actions */}
                                <div className="p-5 border-t border-slate-150 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/30 rounded-b-2xl">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsFormOpen(false);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 border border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-400 rounded-xl font-bold text-xs transition-all cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 bg-slate-900 dark:bg-blue-650 hover:bg-slate-850 dark:hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Save Changes
                                    </button>
                                </div>
                            </form>

                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Default Directory View
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Toast Alerts */}
            {toast && (
                <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 border animate-in slide-in-from-bottom-5 duration-300 ${
                    toast.type === "success" 
                        ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-800 dark:text-emerald-300"
                        : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 text-rose-800 dark:text-rose-300"
                }`}>
                    {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="text-xs font-bold">{toast.msg}</span>
                </div>
            )}

            {/* Header section */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm">
                <div>
                    <h1 className="text-xl font-black text-slate-850 dark:text-white tracking-tight flex items-center gap-2">
                        <span className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                            <Database className="w-5 h-5" />
                        </span>
                        Samples &amp; Tests Directory
                    </h1>
                    <p className="text-slate-500 text-xs mt-1.5 font-semibold">
                        Manage test menus, organ groupings, reference ranges, and laboratory pricing catalog.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {userRole === "admin" && (
                        <>
                            <button
                                onClick={handleDownloadTemplate}
                                className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold rounded-xl text-xs text-slate-650 dark:text-slate-350 transition-all active:scale-95 cursor-pointer shadow-sm"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Download Template
                            </button>
                            <button
                                onClick={handleImportClick}
                                className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold rounded-xl text-xs text-slate-650 dark:text-slate-350 transition-all active:scale-95 cursor-pointer shadow-sm"
                            >
                                <Upload className="w-3.5 h-3.5" />
                                Import Excel
                            </button>
                            <button
                                onClick={handleExportExcel}
                                className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold rounded-xl text-xs text-slate-650 dark:text-slate-350 transition-all active:scale-95 cursor-pointer shadow-sm"
                            >
                                <FileSpreadsheet className="w-3.5 h-3.5" />
                                Export Excel
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleExcelImport} 
                                accept=".xlsx, .xls" 
                                className="hidden" 
                            />
                            <button
                                onClick={handleOpenAdd}
                                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-blue-650 hover:bg-slate-850 dark:hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all active:scale-95 cursor-pointer shadow-md shadow-slate-900/5"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add New Sample
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Toolbar and list filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by test name, organ, or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:ring-2 focus:ring-slate-900 focus:border-slate-900 dark:focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
                <button
                    onClick={loadSamples}
                    className="flex items-center gap-1 px-3 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-bold cursor-pointer transition-colors"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Catalog
                </button>
            </div>

            {/* List Table container */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800">
                                <th className="py-3 px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest w-16">Sl No</th>
                                <th className="py-3 px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Test Name</th>
                                <th className="py-3 px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Organ</th>
                                <th className="py-3 px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Category</th>
                                <th className="py-3 px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Method</th>
                                <th className="py-3 px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Container</th>
                                <th className="py-3 px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Sample Used</th>
                                <th className="py-3 px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Report Time</th>
                                <th className="py-3 px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Reference Range</th>
                                <th className="py-3 px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Lab Price</th>
                                <th className="py-3 px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Patient Price</th>
                                {userRole === "admin" && (
                                    <th className="py-3 px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center w-24">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={userRole === "admin" ? 12 : 11} className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading Samples Catalog...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredSamples.length > 0 ? (
                                filteredSamples.map((sample) => (
                                    <tr key={sample._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="py-3.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-350">{sample.slno}</td>
                                        <td className="py-3.5 px-4 text-xs font-black text-slate-900 dark:text-white">{sample.testName}</td>
                                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">{sample.organ}</td>
                                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-650 dark:text-slate-400">
                                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-md text-[10px] font-extrabold uppercase">
                                                {sample.category}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">{sample.method}</td>
                                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">{sample.container}</td>
                                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">{sample.sampleUsedForTest}</td>
                                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">{sample.reportTime}</td>
                                        <td className="py-3.5 px-4 text-xs font-mono text-slate-550 dark:text-slate-450">{sample.referenceRange}</td>
                                        <td className="py-3.5 px-4 text-xs font-extrabold text-blue-600 dark:text-blue-400">
                                            {sample.slno !== "-" ? `₹${sample.labPrice}` : "-"}
                                        </td>
                                        <td className="py-3.5 px-4 text-xs font-black text-slate-800 dark:text-slate-300">
                                            {sample.patientPrice !== "-" ? `₹${sample.patientPrice}` : "-"}
                                        </td>
                                        {userRole === "admin" && (
                                            <td className="py-3.5 px-4 text-xs text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => handleOpenEdit(sample)}
                                                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                                                        title="Edit Entry"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(sample._id)}
                                                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-slate-400 hover:text-rose-650 transition-colors cursor-pointer"
                                                        title="Delete Entry"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={userRole === "admin" ? 12 : 11} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                <FileSpreadsheet className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">No Samples Found</h3>
                                            <p className="text-slate-500 text-xs max-w-xs mx-auto font-medium">
                                                Search query didn't match any records. Try adjusting query or click "Add New Sample" to manually create one.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Drawer Form */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-2xl w-full rounded-2xl shadow-2xl relative my-auto animate-in scale-in duration-200">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-150 dark:border-slate-800">
                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white">
                                    {editingSample ? "Update Sample & Test Details" : "Add New Sample & Test"}
                                </h3>
                                <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                                    Configure Catalog Parameters and Pricing Info
                                </p>
                            </div>
                            <button
                                onClick={() => setIsFormOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 transition-colors p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body / Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase">Sl No</label>
                                        <input
                                            type="text"
                                            value={slno}
                                            onChange={(e) => setSlno(e.target.value)}
                                            placeholder="e.g. 1"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-205"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase">Test Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={testName}
                                            onChange={(e) => setTestName(e.target.value)}
                                            placeholder="e.g. Fasting Blood Glucose"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-205"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase">Organ Group</label>
                                        <input
                                            type="text"
                                            value={organ}
                                            onChange={(e) => setOrgan(e.target.value)}
                                            placeholder="e.g. Liver / Kidney"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-205"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase">Category</label>
                                        <input
                                            type="text"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            placeholder="e.g. LFT / RFT / Lipid"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-205"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase">Method Used</label>
                                        <input
                                            type="text"
                                            value={method}
                                            onChange={(e) => setMethod(e.target.value)}
                                            placeholder="e.g. ELISA / CLIA"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-205"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase">Container / Cap Color</label>
                                        <input
                                            type="text"
                                            value={container}
                                            onChange={(e) => setContainer(e.target.value)}
                                            placeholder="e.g. SST Yellow / Lavender EDTA"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-205"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase">Sample Used for Test</label>
                                        <input
                                            type="text"
                                            value={sampleUsedForTest}
                                            onChange={(e) => setSampleUsedForTest(e.target.value)}
                                            placeholder="e.g. Serum / Plasma / Urine"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-205"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase">Report TAT / Time</label>
                                        <input
                                            type="text"
                                            value={reportTime}
                                            onChange={(e) => setReportTime(e.target.value)}
                                            placeholder="e.g. Same Day / 24 Hours"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-205"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase">Biological Reference Range</label>
                                    <input
                                        type="text"
                                        value={referenceRange}
                                        onChange={(e) => setReferenceRange(e.target.value)}
                                        placeholder="e.g. 70 - 110 mg/dL"
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-205"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase">Lab B2B Price (₹)</label>
                                        <input
                                            type="text"
                                            value={labPrice}
                                            onChange={(e) => setLabPrice(e.target.value)}
                                            placeholder="e.g. 150"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-205"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase">Patient Price (₹)</label>
                                        <input
                                            type="text"
                                            value={patientPrice}
                                            onChange={(e) => setPatientPrice(e.target.value)}
                                            placeholder="e.g. 250"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-205"
                                        />
                                    </div>
                                </div>

                            </div>

                            {/* Modal Actions */}
                            <div className="p-5 border-t border-slate-150 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/30 rounded-b-2xl">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-4 py-2 border border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-400 rounded-xl font-bold text-xs transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-5 py-2 bg-slate-900 dark:bg-blue-650 hover:bg-slate-850 dark:hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                                >
                                    {actionLoading ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    )}
                                    {editingSample ? "Save Changes" : "Create Sample"}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}
        </div>
    );
}
