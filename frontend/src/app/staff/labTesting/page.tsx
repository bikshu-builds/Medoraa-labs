"use client";
import React, { useEffect, useState } from "react";
import { 
    FlaskConical, 
    Search, 
    Plus, 
    Trash2, 
    CheckCircle2, 
    Loader2,
    Activity,
    ArrowRight,
    User,
    ShieldCheck,
    FlaskRound as Flask,
    Clipboard,
    FileText,
    Camera,
    Save
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function LabTesting() {
    const [samples, setSamples] = useState<any[]>([]);
    const [selectedSample, setSelectedSample] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [results, setResults] = useState<any[]>([]);
    const [observations, setObservations] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchInTesting();
    }, []);

    const fetchInTesting = async () => {
        try {
            const token = localStorage.getItem("staffToken");
            // For now, let's assume an endpoint or use dashboard data
            const res = await fetch(getApiUrl("/api/staff/dashboard"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const d = await res.json();
            if (d.success) {
                // Mocking samples for now if not available
                setSamples([
                    { _id: "1", sampleId: "SMP-782104", patient: { name: "Rahul Sharma" }, test: { name: "Full Body Profile", parameters: ["Hemoglobin", "WBC Count", "Platelets"] }, status: "In Testing" },
                    { _id: "2", sampleId: "SMP-109283", patient: { name: "Anita Devi" }, test: { name: "Thyroid Profile", parameters: ["T3", "T4", "TSH"] }, status: "In Testing" }
                ]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectSample = (sample: any) => {
        setSelectedSample(sample);
        setResults(sample.test.parameters.map((p: string) => ({ name: p, value: "", unit: "mg/dL", range: "70-110", isAbnormal: false })));
        setObservations("");
    };

    const handleSave = async (status: "Draft" | "Submitted") => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem("staffToken");
            const res = await fetch(getApiUrl("/api/staff/test-results"), {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    sampleId: selectedSample.sampleId,
                    parameters: results,
                    observations,
                    status
                })
            });
            const d = await res.json();
            if (d.success) {
                if (status === "Submitted") {
                    setSelectedSample(null);
                    fetchInTesting();
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start animate-in fade-in duration-700">
            {/* Sidebar: Sample List */}
            <div className="lg:col-span-1 space-y-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Lab Entry</h1>
                    <p className="text-slate-400 font-bold mt-1 uppercase text-[10px] tracking-widest">Active Samples for Result Entry</p>
                </div>

                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Search Sample ID..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none" />
                        </div>
                    </div>
                    <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto no-scrollbar">
                        {samples.map((sample) => (
                            <button 
                                key={sample._id}
                                onClick={() => handleSelectSample(sample)}
                                className={cn(
                                    "w-full p-6 text-left transition-all hover:bg-slate-50 flex items-center gap-4 group",
                                    selectedSample?._id === sample._id ? "bg-blue-50/50 border-l-4 border-blue-600" : ""
                                )}
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                                    selectedSample?._id === sample._id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600"
                                )}>
                                    <Flask className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight truncate">{sample.sampleId}</p>
                                    <p className="text-[10px] font-bold text-slate-400 truncate mt-1 uppercase tracking-widest">{sample.patient.name}</p>
                                </div>
                                <ArrowRight className={cn(
                                    "w-4 h-4 transition-all",
                                    selectedSample?._id === sample._id ? "text-blue-600 translate-x-1" : "text-slate-200"
                                )} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content: Result Entry */}
            <div className="lg:col-span-2 space-y-10">
                {selectedSample ? (
                    <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-12">
                        {/* Sample Header */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-200">
                                    <Clipboard className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{selectedSample.test.name}</h2>
                                    <div className="flex items-center gap-4 text-slate-400 mt-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest">Sample: {selectedSample.sampleId}</span>
                                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Patient: {selectedSample.patient.name}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                Processing
                            </div>
                        </div>

                        {/* Result Form */}
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="grid grid-cols-12 px-8 py-4 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    <div className="col-span-4">Parameter Name</div>
                                    <div className="col-span-3 text-center">Observed Value</div>
                                    <div className="col-span-2 text-center">Unit</div>
                                    <div className="col-span-3 text-right">Reference Range</div>
                                </div>

                                {results.map((res, i) => (
                                    <div key={i} className="grid grid-cols-12 items-center px-8 py-2 group">
                                        <div className="col-span-4 text-xs font-black text-slate-900 uppercase tracking-tight">{res.name}</div>
                                        <div className="col-span-3 px-4">
                                            <input 
                                                type="text" 
                                                placeholder="0.00"
                                                className="w-full py-3 bg-white border border-slate-100 rounded-xl text-center text-sm font-black text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm"
                                                value={res.value}
                                                onChange={(e) => {
                                                    const newResults = [...results];
                                                    newResults[i].value = e.target.value;
                                                    setResults(newResults);
                                                }}
                                            />
                                        </div>
                                        <div className="col-span-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{res.unit}</div>
                                        <div className="col-span-3 text-right text-[10px] font-black text-slate-900 uppercase tracking-widest">{res.range}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Pathologist Observations</label>
                                <textarea 
                                    placeholder="Enter clinical notes or observations..."
                                    className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-sm font-medium text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all min-h-[120px]"
                                    value={observations}
                                    onChange={(e) => setObservations(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-6 pt-6">
                                <div className="flex-1 p-6 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-slate-300 hover:text-blue-400 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-all">
                                    <Camera className="w-6 h-6" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Upload Microscopy Images</span>
                                </div>
                                <div className="flex-1 p-6 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-slate-300 hover:text-blue-400 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-all">
                                    <FileText className="w-6 h-6" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Attach Supporting Docs</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-10 border-t border-slate-50 flex items-center justify-between">
                            <button 
                                onClick={() => handleSave("Draft")}
                                disabled={isSaving}
                                className="px-10 py-5 bg-white border border-slate-200 text-slate-500 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-3"
                            >
                                <Save className="w-4 h-4" /> Save Draft
                            </button>
                            <button 
                                onClick={() => handleSave("Submitted")}
                                disabled={isSaving}
                                className="px-12 py-5 bg-blue-600 hover:bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 active:scale-95 transition-all flex items-center gap-4"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Submit for Approval</>}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="h-full min-h-[600px] bg-slate-50/50 rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-center p-20 gap-8">
                        <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-slate-200 shadow-sm">
                            <FileText className="w-12 h-12" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-300 tracking-tight uppercase">Ready for Analysis</h3>
                            <p className="text-slate-400 font-bold mt-2 max-w-sm mx-auto uppercase text-[10px] tracking-widest leading-loose">Select a sample from the workbench to begin entering clinical parameters and observations.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
