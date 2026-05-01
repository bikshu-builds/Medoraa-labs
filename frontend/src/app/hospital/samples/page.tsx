"use client";
import React, { useEffect, useState } from "react";
import { getApiUrl } from "@/lib/api";
import {
    Activity,
    QrCode,
    RefreshCw,
    Search,
    FileText,
    CheckCircle2,
    Save,
    FlaskConical,
    Loader2,
    X
} from "lucide-react";

interface OrderItem {
    _id: string;
    bookingId: string;
    patientName: string;
    patientAge: number;
    patientGender: string;
    status: string;
    tests: any[];
    testResults: any[];
    labLocation?: string;
    sampleReceivedBy?: string;
    labTechnician?: string;
    workstation?: string;
}

export default function SampleProcessingPage() {
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [activeOrder, setActiveOrder] = useState<OrderItem | null>(null);

    // Form inputs for current phase
    const [labLocation, setLabLocation] = useState("");
    const [sampleReceivedBy, setSampleReceivedBy] = useState("");
    const [labTechnician, setLabTechnician] = useState("");
    const [workstation, setWorkstation] = useState("");

    // Results Entry inputs
    const [paramName, setParamName] = useState("");
    const [paramValue, setParamValue] = useState("");
    const [paramUnit, setParamUnit] = useState("");
    const [paramRef, setParamRef] = useState("");
    const [paramFlag, setParamFlag] = useState("Normal");
    const [observations, setObservations] = useState("");

    const loadOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("hospitalToken");
            const res = await fetch(getApiUrl("/api/hospital/orders"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setOrders(data.data);
            }
        } catch (err) {
            console.error("Error loading sample data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const handleOpenOrder = (order: OrderItem) => {
        setActiveOrder(order);
        setLabLocation(order.labLocation || "Regional Diagnostic Hub");
        setSampleReceivedBy(order.sampleReceivedBy || "Reception Desk Staff");
        setLabTechnician(order.labTechnician || "Pathology Technician");
        setWorkstation(order.workstation || "Clinical Chemistry Bench");
    };

    const handleReception = async () => {
        if (!activeOrder) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("hospitalToken");
            const res = await fetch(getApiUrl(`/api/hospital/orders/receive/${activeOrder._id}`), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ labLocation, sampleReceivedBy })
            });
            const data = await res.json();
            if (data.success) {
                setActiveOrder(data.data);
                loadOrders();
            }
        } catch (err) {
            console.error("Failed sample reception", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLabEntry = async () => {
        if (!activeOrder) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("hospitalToken");
            const res = await fetch(getApiUrl(`/api/hospital/orders/test-entry/${activeOrder._id}`), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ labTechnician, workstation })
            });
            const data = await res.json();
            if (data.success) {
                setActiveOrder(data.data);
                loadOrders();
            }
        } catch (err) {
            console.error("Failed lab entry step", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveParameter = async () => {
        if (!activeOrder || !paramName || !paramValue) return;
        setLoading(true);

        const newResult = {
            parameterName: paramName,
            value: paramValue,
            unit: paramUnit,
            referenceRange: paramRef,
            criticalFlag: paramFlag,
            observations
        };

        const currentResults = [...(activeOrder.testResults || []), newResult];

        try {
            const token = localStorage.getItem("hospitalToken");
            const res = await fetch(getApiUrl(`/api/hospital/orders/results/${activeOrder._id}`), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ testResults: currentResults })
            });
            const data = await res.json();
            if (data.success) {
                setActiveOrder(data.data);
                setParamName("");
                setParamValue("");
                setParamUnit("");
                setParamRef("");
                setParamFlag("Normal");
                setObservations("");
                loadOrders();
            }
        } catch (err) {
            console.error("Failed results entry", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClearResults = async () => {
        if (!activeOrder) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("hospitalToken");
            const res = await fetch(getApiUrl(`/api/hospital/orders/results/${activeOrder._id}`), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ testResults: [] })
            });
            const data = await res.json();
            if (data.success) {
                setActiveOrder(data.data);
                loadOrders();
            }
        } catch (err) {
            console.error("Error clearing test results", err);
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
            {/* Header */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <FlaskConical className="w-6 h-6 text-blue-600" /> Technician Sample Workbench
                    </h1>
                    <p className="text-xs font-bold text-slate-500 mt-1">Receive patient collection samples, start lab testing, and submit diagnostics drafts.</p>
                </div>
                <button
                    onClick={loadOrders}
                    className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-700 active:scale-95 transition-all"
                >
                    <RefreshCw className="w-3.5 h-3.5" /> Reload Workbench
                </button>
            </div>

            {/* List and Processing Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List pane */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Scan QR or search Booking..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 text-xs bg-slate-50 border border-slate-100 rounded-xl font-bold focus:bg-white outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2 h-[550px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map(order => (
                                <button
                                    key={order._id}
                                    onClick={() => handleOpenOrder(order)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col justify-between h-32 ${
                                        activeOrder?._id === order._id ? "bg-blue-50/50 border-blue-200 shadow-sm" : "bg-white border-slate-100 hover:border-slate-200"
                                    }`}
                                >
                                    <div className="flex justify-between items-start w-full">
                                        <div>
                                            <span className="text-[10px] font-bold font-mono text-blue-600 block">{order.bookingId}</span>
                                            <h4 className="text-sm font-black text-slate-800 tracking-tight mt-1">{order.patientName}</h4>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                                            order.status === "Report Ready" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                            order.status === "Processing" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                            "bg-slate-100 text-slate-600 border border-slate-200"
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="text-[11px] font-bold text-slate-400 mt-2 truncate max-w-full">
                                        Tests: {order.tests && order.tests.map(t => t.name).join(", ") || "General Diagnostics"}
                                    </div>
                                </button>
                            ))
                        ) : (
                            <p className="text-xs text-slate-400 text-center py-12 font-bold">No samples match filtering criteria.</p>
                        )}
                    </div>
                </div>

                {/* Operations pane */}
                <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                    {activeOrder ? (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* Panel header */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
                                <div>
                                    <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-xl uppercase tracking-wider">Active Workspace</span>
                                    <h3 className="text-xl font-black text-slate-900 mt-2 tracking-tight">Patient: {activeOrder.patientName}</h3>
                                    <p className="text-xs font-bold text-slate-500 mt-1">
                                        Age: {activeOrder.patientAge}y &bull; Gender: {activeOrder.patientGender} &bull; Booking ID: <span className="font-mono text-blue-600 font-bold">{activeOrder.bookingId}</span>
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${
                                    activeOrder.status === "Report Ready" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                    activeOrder.status === "Processing" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                    "bg-slate-50 text-slate-500 border-slate-200"
                                }`}>
                                    {activeOrder.status}
                                </span>
                            </div>

                            {/* Workflow Progression Checklist */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-100 pb-6">
                                {/* Step 1: Reception */}
                                <div className={`p-4 rounded-2xl border transition-all ${activeOrder.status === "Pending" ? "bg-blue-50/20 border-blue-200 ring-2 ring-blue-50" : "bg-slate-50/40 border-slate-100"}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Step 1: Reception</h4>
                                        {activeOrder.status !== "Pending" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                                    </div>
                                    <div className="space-y-2.5">
                                        <input
                                            type="text"
                                            placeholder="Location e.g. Hub 1"
                                            value={labLocation}
                                            onChange={(e) => setLabLocation(e.target.value)}
                                            className="w-full px-3 py-2 text-xs bg-white border border-slate-100 rounded-lg focus:ring-1 focus:ring-blue-100 outline-none font-bold text-slate-700"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Received by staff..."
                                            value={sampleReceivedBy}
                                            onChange={(e) => setSampleReceivedBy(e.target.value)}
                                            className="w-full px-3 py-2 text-xs bg-white border border-slate-100 rounded-lg focus:ring-1 focus:ring-blue-100 outline-none font-bold text-slate-700"
                                        />
                                        <button
                                            onClick={handleReception}
                                            disabled={activeOrder.status !== "Pending" || loading}
                                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5"
                                        >
                                            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Verify & Mark Received"}
                                        </button>
                                    </div>
                                </div>

                                {/* Step 2: Lab Entry */}
                                <div className={`p-4 rounded-2xl border transition-all ${activeOrder.status === "Sample Collected" ? "bg-blue-50/20 border-blue-200 ring-2 ring-blue-50" : "bg-slate-50/40 border-slate-100"}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Step 2: Lab Entry</h4>
                                        {["Processing", "Report Ready"].includes(activeOrder.status) && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                                    </div>
                                    <div className="space-y-2.5">
                                        <input
                                            type="text"
                                            placeholder="Technician..."
                                            value={labTechnician}
                                            onChange={(e) => setLabTechnician(e.target.value)}
                                            className="w-full px-3 py-2 text-xs bg-white border border-slate-100 rounded-lg focus:ring-1 focus:ring-blue-100 outline-none font-bold text-slate-700"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Workstation..."
                                            value={workstation}
                                            onChange={(e) => setWorkstation(e.target.value)}
                                            className="w-full px-3 py-2 text-xs bg-white border border-slate-100 rounded-lg focus:ring-1 focus:ring-blue-100 outline-none font-bold text-slate-700"
                                        />
                                        <button
                                            onClick={handleLabEntry}
                                            disabled={activeOrder.status !== "Sample Collected" || loading}
                                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5"
                                        >
                                            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Move to Processing"}
                                        </button>
                                    </div>
                                </div>

                                {/* Step 3: Result Entry Status */}
                                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/40 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Parameters Saved</h4>
                                            {activeOrder.testResults && activeOrder.testResults.length > 0 && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                                        </div>
                                        <p className="text-slate-500 font-medium text-xs">Awaiting path examiner results draft. Total findings so far:</p>
                                        <span className="text-3xl font-black text-slate-800 mt-2 block">{activeOrder.testResults ? activeOrder.testResults.length : 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Testing Result Entry Grid (Step 3 Phase) */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Step 3: Test Entry (Technical findings)</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Parameter Name</label>
                                        <input
                                            type="text"
                                            value={paramName}
                                            onChange={(e) => setParamName(e.target.value)}
                                            placeholder="e.g. Hemoglobin"
                                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-100 rounded-lg outline-none font-bold text-slate-700"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Value</label>
                                        <input
                                            type="text"
                                            value={paramValue}
                                            onChange={(e) => setParamValue(e.target.value)}
                                            placeholder="e.g. 14.5"
                                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-100 rounded-lg outline-none font-bold text-slate-700"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unit</label>
                                        <input
                                            type="text"
                                            value={paramUnit}
                                            onChange={(e) => setParamUnit(e.target.value)}
                                            placeholder="e.g. g/dL"
                                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-100 rounded-lg outline-none font-bold text-slate-700"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reference Range</label>
                                        <input
                                            type="text"
                                            value={paramRef}
                                            onChange={(e) => setParamRef(e.target.value)}
                                            placeholder="e.g. 13.0 - 17.0"
                                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-100 rounded-lg outline-none font-bold text-slate-700"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Clinical Flag</label>
                                        <select
                                            value={paramFlag}
                                            onChange={(e) => setParamFlag(e.target.value)}
                                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-100 rounded-lg outline-none font-bold text-slate-700"
                                        >
                                            <option value="Normal">Normal</option>
                                            <option value="High">High</option>
                                            <option value="Low">Low</option>
                                            <option value="Critical">Critical</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Action</label>
                                        <button
                                            onClick={handleSaveParameter}
                                            disabled={loading || !paramName || !paramValue}
                                            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white py-2 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all h-[36px]"
                                        >
                                            <Save className="w-3.5 h-3.5" /> Save parameter
                                        </button>
                                    </div>
                                </div>

                                {/* Observations */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Examiner Observations / Findings</label>
                                    <textarea
                                        value={observations}
                                        onChange={(e) => setObservations(e.target.value)}
                                        placeholder="Add any microscopes comments, abnormal results highlights here..."
                                        className="w-full h-20 px-4 py-3 text-xs bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700"
                                    />
                                </div>

                                {/* Testing results summary display */}
                                {activeOrder.testResults && activeOrder.testResults.length > 0 && (
                                    <div className="border border-slate-100 p-4 rounded-2xl bg-slate-50/50 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800">Current Parameter Findings</h4>
                                            <button
                                                onClick={handleClearResults}
                                                className="text-[10px] font-black text-rose-500 hover:underline uppercase tracking-wider"
                                            >
                                                Clear parameters
                                            </button>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-slate-200">
                                                        <th className="py-2 text-[9px] font-black uppercase tracking-wider text-slate-400">Parameter</th>
                                                        <th className="py-2 text-[9px] font-black uppercase tracking-wider text-slate-400">Value</th>
                                                        <th className="py-2 text-[9px] font-black uppercase tracking-wider text-slate-400">Unit</th>
                                                        <th className="py-2 text-[9px] font-black uppercase tracking-wider text-slate-400">Ref Range</th>
                                                        <th className="py-2 text-[9px] font-black uppercase tracking-wider text-slate-400">Flag</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {activeOrder.testResults.map((r, i) => (
                                                        <tr key={i} className="text-xs font-bold text-slate-600">
                                                            <td className="py-2 font-black text-slate-800">{r.parameterName}</td>
                                                            <td className="py-2">{r.value}</td>
                                                            <td className="py-2 font-medium">{r.unit}</td>
                                                            <td className="py-2 font-medium">{r.referenceRange}</td>
                                                            <td className="py-2">
                                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                                                                    r.criticalFlag === "Normal" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                                                }`}>
                                                                    {r.criticalFlag}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-[450px] flex items-center justify-center text-slate-400 flex-col gap-2 font-bold">
                            <Activity className="w-12 h-12 stroke-slate-300 stroke-[1.5] animate-pulse" />
                            <span>Select a sample order from the left pane to begin</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
