"use client";
import React, { useState } from "react";
import { Download, X, FileText, Check, Printer, CheckCircle2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { getApiUrl } from "@/lib/api";
import { printPdfDirect } from "@/lib/pdfPrinter";

interface TestResultEntry {
    testId?: any;
    testName: string;
    resultValue: string;
    unit: string;
    referenceRange: string;
    flag?: "Normal" | "Abnormal" | "Critical" | "";
    notes?: string;
    category?: string;
    organ?: string;
    method?: string;
}

interface PatientTestRecord {
    _id: string;
    registrationNumber: string;
    patientName: string;
    age: { value: number; type: string };
    gender: string;
    mobileNumber: string;
    address?: string;
    referredBy: string;
    registrationDate: string;
    registrationTime?: string;
    sampleReceived?: any;
    tests?: any[];
    testResults?: TestResultEntry[];
    authorizationStatus?: "PENDING" | "AUTHORIZED" | "FLAGGED" | "REJECTED";
    authorizedBy?: string;
    authorizedAt?: string;
    notes?: string;
}

interface PathologyReportModalProps {
    record: PatientTestRecord | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function PathologyReportModal({ record, isOpen, onClose }: PathologyReportModalProps) {
    const [previewType, setPreviewType] = useState<"with-header" | "no-header">("with-header");

    if (!isOpen || !record) return null;

    // Filter tests that have entered results
    const allResults = (record.testResults && record.testResults.length > 0)
        ? record.testResults
        : ((record.tests && record.tests.length > 0)
            ? record.tests.map((t: any) => ({
                testId: typeof t === "object" ? t._id : t,
                testName: typeof t === "string" ? t : (t.testName || t.name || "Diagnostic Parameter"),
                resultValue: t.resultValue || "",
                unit: t.unit || "",
                referenceRange: typeof t === "object" ? (t.referenceRange || "-") : "-",
                category: typeof t === "object" ? (t.category || t.organ || "GENERAL PATHOLOGY") : "GENERAL PATHOLOGY",
                method: typeof t === "object" ? (t.method || "") : ""
            }))
            : []
        );

    const enteredResults = allResults.filter(
        (tr: any) => tr.resultValue && String(tr.resultValue).trim() !== "" && String(tr.resultValue).trim() !== "—"
    );

    // Direct download helper (triggers browser download without opening blank tabs)
    const handleDownload = (withHeader: boolean) => {
        if (!record?._id) return;
        const pdfUrl = getApiUrl(`/api/admin/registrations/${record._id}/pdf?header=${withHeader}&download=true`);
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.setAttribute("download", `Pathology_Report_${record.registrationNumber || record._id}${withHeader ? "" : "_Letterhead"}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Print PDF using the exact same duplex PDF generated for Download
    const handlePrint = async (withHeader: boolean) => {
        if (!record?._id) return;
        const pdfUrl = getApiUrl(`/api/admin/registrations/${record._id}/pdf?header=${withHeader}&autoprint=true&t=${Date.now()}`);
        await printPdfDirect(pdfUrl);
    };

    let sampleTypeText = "Clot-Act, Blood / Urine";
    if (record.sampleReceived) {
        if (typeof record.sampleReceived === "string") {
            sampleTypeText = record.sampleReceived;
        } else if (typeof record.sampleReceived === "object") {
            sampleTypeText = record.sampleReceived.sampleType || record.sampleReceived.transportMethod || "Clot-Act, Blood / Urine";
        }
    }

    const currentWithHeader = previewType === "with-header";

    return (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-[200] flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
            {/* Modal Container */}
            <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-2xl shadow-2xl w-full max-w-5xl lg:max-w-6xl overflow-hidden flex flex-col h-[88vh] max-h-[92vh] border border-slate-200 dark:border-slate-800">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-extrabold tracking-wide uppercase">
                                    Official Pathology Report
                                </h3>
                                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-blue-400 border border-slate-700">
                                    {record.registrationNumber}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Patient: <span className="font-bold text-slate-200">{record.patientName}</span>
                                {" • "}{record.age?.value || "N/A"} {record.age?.type || "Y"} / {record.gender}
                                {" • "}Ref: <span className="text-slate-300">{record.referredBy || "Self"}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Authorized
                        </span>

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white cursor-pointer"
                            title="Close modal"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* 2-Column Body */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100 dark:bg-slate-950">
                    
                    {/* LEFT PANEL: Action Cards & Information */}
                    <div className="w-full md:w-[340px] lg:w-[360px] p-4 sm:p-5 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto space-y-4 shrink-0">
                        <div className="space-y-4">
                            <div>
                                <div className="text-[11px] font-extrabold tracking-wider text-slate-500 uppercase">
                                    REPORT DOWNLOAD &amp; PRINT OPTIONS
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                    Choose your desired format below to download or print
                                </p>
                            </div>

                            {/* Option 1: Official Report (With Header & Footer) */}
                            <div className={cn(
                                "bg-white dark:bg-slate-800 border-2 rounded-xl transition-all shadow-xs overflow-hidden",
                                previewType === "with-header"
                                    ? "border-emerald-500 ring-2 ring-emerald-500/20"
                                    : "border-slate-200 dark:border-slate-700 hover:border-emerald-400"
                            )}>
                                <div className="p-3.5 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                                            Official Branded
                                        </span>
                                        {previewType === "with-header" && (
                                            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                                                <Check className="w-3.5 h-3.5" /> Active Preview
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                                            Report (With Header &amp; Footer)
                                        </div>
                                        <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                                            Includes Medoraa Labs header banner, footer contact details, and watermark. Automatically merged with back design for double-sided printing.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => handleDownload(true)}
                                            className="flex-1 py-2 px-3 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-lg transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                            title="Download official PDF report with header and footer"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>Download PDF</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPreviewType("with-header");
                                                handlePrint(true);
                                            }}
                                            className="py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 active:scale-98 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                                            title="Print in-page with header"
                                        >
                                            <Printer className="w-3.5 h-3.5" />
                                            <span>Print</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Option 2: Pre-Printed Letterhead (No Header) */}
                            <div className={cn(
                                "bg-white dark:bg-slate-800 border-2 rounded-xl transition-all shadow-xs overflow-hidden",
                                previewType === "no-header"
                                    ? "border-blue-500 ring-2 ring-blue-500/20"
                                    : "border-slate-200 dark:border-slate-700 hover:border-blue-400"
                            )}>
                                <div className="p-3.5 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                                            Letterhead Paper
                                        </span>
                                        {previewType === "no-header" && (
                                            <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                                                <Check className="w-3.5 h-3.5" /> Active Preview
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                                            Report (No Header)
                                        </div>
                                        <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                                            Leaves exact spacing for pre-printed stationary. Automatically merged with back design for double-sided printing.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => handleDownload(false)}
                                            className="flex-1 py-2 px-3 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-lg transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                            title="Download PDF without header for letterhead paper"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>Download PDF</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPreviewType("no-header");
                                                handlePrint(false);
                                            }}
                                            className="py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 active:scale-98 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                                            title="Print in-page for letterhead"
                                        >
                                            <Printer className="w-3.5 h-3.5" />
                                            <span>Print</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Duplex Printing Notice Banner */}
                        <div className="bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl p-2.5 text-xs text-emerald-900 dark:text-emerald-200">
                            <div className="font-bold flex items-center gap-1.5 text-[11.5px]">
                                <span>📄 Automatic Double-Sided (Duplex) Ready</span>
                            </div>
                            <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">
                                Every front page is followed by the standard back design. Ensure <strong>&quot;Print on both sides&quot;</strong> (Flip on long edge) is enabled in your printer settings.
                            </p>
                        </div>

                        {/* Patient & Report Details Footer Box */}
                        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                            <div className="flex justify-between font-medium">
                                <span className="text-slate-400">Sample:</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">{sampleTypeText}</span>
                            </div>
                            <div className="flex justify-between font-medium">
                                <span className="text-slate-400">Entered Tests:</span>
                                <span className="font-bold text-emerald-600">{enteredResults.length} Parameter(s)</span>
                            </div>
                            <div className="flex justify-between font-medium">
                                <span className="text-slate-400">Authorized By:</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{record.authorizedBy || "Dr. Ravi Kumar Manyam"}</span>
                            </div>
                            {record.registrationDate && (
                                <div className="flex justify-between font-medium">
                                    <span className="text-slate-400">Date:</span>
                                    <span>{record.registrationDate} {record.registrationTime || ""}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL: Live Interactive PDF Preview */}
                    <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
                        
                        {/* Preview Toolbar */}
                        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 border-b border-slate-700 text-xs">
                            <div className="flex items-center gap-1.5">
                                <span className="text-slate-400 font-semibold mr-2">Preview Mode:</span>
                                <button
                                    type="button"
                                    onClick={() => setPreviewType("with-header")}
                                    className={cn(
                                        "px-3 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5",
                                        previewType === "with-header"
                                            ? "bg-emerald-600 text-white shadow-xs"
                                            : "text-slate-300 hover:text-white hover:bg-slate-700"
                                    )}
                                >
                                    {previewType === "with-header" && <Check className="w-3.5 h-3.5" />}
                                    <span>With Header &amp; Footer</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPreviewType("no-header")}
                                    className={cn(
                                        "px-3 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5",
                                        previewType === "no-header"
                                            ? "bg-blue-600 text-white shadow-xs"
                                            : "text-slate-300 hover:text-white hover:bg-slate-700"
                                    )}
                                >
                                    {previewType === "no-header" && <Check className="w-3.5 h-3.5" />}
                                    <span>No Header (Letterhead)</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleDownload(currentWithHeader)}
                                    className="px-3 py-1 text-xs font-bold text-white bg-slate-700 hover:bg-slate-600 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                                    title="Download currently previewed PDF"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Download</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handlePrint(currentWithHeader)}
                                    className="px-3 py-1 text-xs font-bold text-white bg-slate-700 hover:bg-slate-600 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                                    title="Print currently previewed PDF"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Print</span>
                                </button>
                            </div>
                        </div>

                        {/* PDF Iframe Viewer */}
                        <div className="flex-1 p-2 sm:p-3 bg-slate-900/95 flex flex-col min-h-0">
                            <iframe
                                key={`report-pdf-viewer-${previewType}-${record._id}`}
                                src={getApiUrl(`/api/admin/registrations/${record._id}/pdf?header=${currentWithHeader}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`)}
                                className="w-full flex-1 rounded-lg border border-slate-700 shadow-md bg-white"
                                title={`Official Pathology Report ${record.registrationNumber}`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
