"use client";
import React, { useState } from "react";
import { Download, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { getApiUrl } from "@/lib/api";

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
    const [viewMode, setViewMode] = useState<"pdf" | "html">("pdf");

    if (!isOpen || !record) return null;

    const handlePrint = () => {
        if (record._id) {
            const pdfUrl = getApiUrl(`/api/admin/registrations/${record._id}/pdf`);
            window.open(pdfUrl, "_blank");
        } else {
            window.print();
        }
    };

    // Extract test results and map with populated category classification (matching record.tests if available)
    const rawResults = (record.testResults && record.testResults.length > 0)
        ? record.testResults
        : ((record.tests && record.tests.length > 0)
            ? record.tests.map((t: any) => ({
                testId: typeof t === "object" ? t._id : t,
                testName: typeof t === "string" ? t : (t.testName || t.name || "Diagnostic Parameter"),
                resultValue: t.resultValue || "—",
                unit: t.unit || "",
                referenceRange: typeof t === "object" ? (t.referenceRange || "-") : "-",
                category: typeof t === "object" ? (t.category || t.organ || "GENERAL PATHOLOGY") : "GENERAL PATHOLOGY",
                method: typeof t === "object" ? (t.method || "") : ""
            }))
            : [{ testName: "Routine Pathology Parameter", resultValue: "—", unit: "", referenceRange: "-", category: "GENERAL PATHOLOGY", method: "" }]
        );

    // Map each result to its specific Classification/Category (matching backend logic exactly)
    const testResults = rawResults.map((tr: any) => {
        const itemObj = tr;
        const popTest = (typeof itemObj.testId === "object" && itemObj.testId !== null) ? itemObj.testId : null;
        const matchedTest = popTest || (record.tests || []).find((t: any) => {
            if (!t) return false;
            const targetId = itemObj.testId ? (itemObj.testId._id ? itemObj.testId._id.toString() : itemObj.testId.toString()) : null;
            if (t._id && targetId && t._id.toString() === targetId) return true;
            if (t.testName && itemObj.testName && t.testName.trim().toLowerCase() === itemObj.testName.trim().toLowerCase()) return true;
            return false;
        });

        let categoryName = "";
        if (popTest && popTest.category && popTest.category !== "-") {
            categoryName = popTest.category;
        } else if (itemObj.category && itemObj.category !== "-") {
            categoryName = itemObj.category;
        } else if (matchedTest && matchedTest.category && matchedTest.category !== "-") {
            categoryName = matchedTest.category;
        } else if (popTest && popTest.organ && popTest.organ !== "-") {
            categoryName = popTest.organ;
        } else if (itemObj.organ && itemObj.organ !== "-") {
            categoryName = itemObj.organ;
        } else if (matchedTest && matchedTest.organ && matchedTest.organ !== "-") {
            categoryName = matchedTest.organ;
        } else {
            categoryName = "GENERAL PATHOLOGY";
        }

        const methodStr = (popTest && popTest.method && popTest.method !== "-")
            ? popTest.method
            : ((itemObj.method && itemObj.method !== "-")
                ? itemObj.method
                : (matchedTest && matchedTest.method && matchedTest.method !== "-" ? matchedTest.method : ""));

        return {
            ...itemObj,
            category: categoryName.trim().toUpperCase(),
            method: methodStr
        };
    });

    // Group test items strictly by Category / Classification
    const categoryGroups: { [key: string]: typeof testResults } = {};
    testResults.forEach(item => {
        let catKey = item.category || "GENERAL PATHOLOGY";
        if (!categoryGroups[catKey]) {
            categoryGroups[catKey] = [];
        }
        categoryGroups[catKey].push(item);
    });

    const categoryKeys = Object.keys(categoryGroups);

    // Sample type text
    let sampleTypeText = "Clot-Act, Blood / Urine";
    if (record.sampleReceived) {
        if (typeof record.sampleReceived === "string") {
            sampleTypeText = record.sampleReceived;
        } else if (typeof record.sampleReceived === "object") {
            sampleTypeText = record.sampleReceived.sampleType || record.sampleReceived.transportMethod || "Clot-Act, Blood / Urine";
        }
    }

    const todayDate = new Date().toLocaleDateString("en-GB");

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-[200] flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans">
            {/* Main Modal Outer Box */}
            <div className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white w-full max-w-5xl max-h-[95vh] shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-300 dark:border-slate-800 rounded-xl print:shadow-none print:border-none print:w-full print:max-w-none print:m-0 print:bg-white">
                
                {/* Non-Printable Header Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-900 text-white print:hidden shrink-0">
                    <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-amber-400 shrink-0" />
                        <div>
                            <span className="text-xs font-black uppercase tracking-wider block">Official Pathology Report — {record.registrationNumber}</span>
                            <span className="text-[10px] text-slate-400 font-medium">Patient: {record.patientName} | Total Pages: {categoryKeys.length}</span>
                        </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center flex-wrap gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all active:scale-95 cursor-pointer rounded-lg"
                        >
                            <Download className="w-4 h-4" />
                            <span>Print / Download PDF</span>
                        </button>

                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* View Mode 1: PDF Iframe Viewer */}
                {viewMode === "pdf" && record._id ? (
                    <div className="p-3 bg-slate-900/90 flex-1 flex flex-col min-h-[550px] sm:min-h-[650px] h-[75vh]">
                        <iframe
                            src={getApiUrl(`/api/admin/registrations/${record._id}/pdf#toolbar=0&navpanes=0&scrollbar=0&view=FitH`)}
                            className="w-full flex-1 rounded-lg border border-slate-700 shadow-md bg-white"
                            title={`Official Pathology Report ${record.registrationNumber}`}
                        />
                    </div>
                ) : (
                    /* View Mode 2: HTML Page Cards Preview */
                    <div className="p-4 sm:p-6 bg-slate-200/70 print:p-0 font-serif text-slate-900 space-y-6 print:space-y-0 print:bg-white">
                    {categoryKeys.map((categoryName, idx) => {
                        const items = categoryGroups[categoryName];
                        let titleDisplay = categoryName.trim().toUpperCase();
                        if (!titleDisplay.endsWith("#")) {
                            if (titleDisplay.endsWith("REPORT")) {
                                titleDisplay = `${titleDisplay}#`;
                            } else if (titleDisplay.length <= 4) {
                                titleDisplay = `${titleDisplay}#`;
                            } else {
                                titleDisplay = `${titleDisplay} REPORT#`;
                            }
                        }

                        const methodText = items[0]?.method && items[0].method !== "-"
                            ? items[0].method
                            : "Enzyme Kinetic Assay; Fully Automated Laboratory Analyzer";

                        return (
                            <div
                                key={categoryName}
                                className={cn(
                                    "bg-white shadow-xl border border-slate-300 rounded-sm p-6 sm:p-8 flex flex-col justify-between min-h-[265mm] print:min-h-[270mm] print:shadow-none print:border-none print:rounded-none print:p-0",
                                    idx > 0 && "break-before-page print:break-before-page"
                                )}
                                style={{ pageBreakBefore: idx > 0 ? "always" : "auto", breakBefore: idx > 0 ? "page" : "auto" }}
                            >
                                <div className="space-y-5">
                                    {/* Preview Page Number Indicator (Non-Printable) */}
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-[11px] font-sans text-slate-500 font-bold uppercase tracking-wider print:hidden">
                                        <span>Page {idx + 1} of {categoryKeys.length}</span>
                                        <span className="text-indigo-600 font-black">{categoryName}</span>
                                    </div>

                                    {/* TOP PATIENT DEMOGRAPHICS BOXED TABLE */}
                                    <div className="border border-slate-900 text-xs font-sans">
                                        {/* Row 1 */}
                                        <div className="grid grid-cols-12 border-b border-slate-900">
                                            <div className="col-span-7 px-3 py-2 border-r border-slate-900 flex items-center gap-2">
                                                <span className="font-extrabold uppercase tracking-tight text-slate-900">NAME :</span>
                                                <span className="font-bold text-slate-900">{record.patientName}</span>
                                            </div>
                                            <div className="col-span-5 px-3 py-2 flex items-center justify-between">
                                                <div>
                                                    <span className="font-extrabold text-slate-900">Age : </span>
                                                    <span className="font-bold">{record.age?.value || "N/A"} {record.age?.type || "Years"}</span>
                                                </div>
                                                <div className="ml-4">
                                                    <span className="font-extrabold text-slate-900">Sex : </span>
                                                    <span className="font-bold">{record.gender}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row 2 */}
                                        <div className="grid grid-cols-12 border-b border-slate-900">
                                            <div className="col-span-7 px-3 py-2 border-r border-slate-900 flex items-center gap-2">
                                                <span className="font-extrabold uppercase tracking-tight text-slate-900">Ref/Dr :</span>
                                                <span className="font-bold text-slate-900">{record.referredBy || "SELF (Self)"}</span>
                                            </div>
                                            <div className="col-span-5 px-3 py-2 flex items-center gap-2">
                                                <span className="font-extrabold text-slate-900">Registration Date :</span>
                                                <span className="font-bold">{record.registrationDate || todayDate}</span>
                                            </div>
                                        </div>

                                        {/* Row 3 */}
                                        <div className="grid grid-cols-12 border-b border-slate-900">
                                            <div className="col-span-7 px-3 py-2 border-r border-slate-900 flex items-center gap-2">
                                                <span className="font-extrabold uppercase tracking-tight text-slate-900">Sample Drawn By :</span>
                                                <span className="font-bold text-slate-900">{record.sampleReceived?.person || "Zedlabs, Eluru"}</span>
                                            </div>
                                            <div className="col-span-5 px-3 py-2 flex items-center gap-2">
                                                <span className="font-extrabold text-slate-900">Report Issued Date :</span>
                                                <span className="font-bold">{record.authorizedAt || record.registrationDate || todayDate}</span>
                                            </div>
                                        </div>

                                        {/* Row 4 */}
                                        <div className="grid grid-cols-12">
                                            <div className="col-span-7 px-3 py-2 border-r border-slate-900 flex items-center gap-2">
                                                <span className="font-extrabold uppercase tracking-tight text-slate-900">SAMPLE :</span>
                                                <span className="font-bold text-slate-900">{sampleTypeText}</span>
                                            </div>
                                            <div className="col-span-5 px-3 py-2 flex items-center gap-2">
                                                <span className="font-extrabold text-slate-900">Report No :</span>
                                                <span className="font-bold font-mono text-slate-900">{record.registrationNumber}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CATEGORY TITLE & PARAMETER TABLE */}
                                    <div className="space-y-4">
                                        <div className="text-center my-4">
                                            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 underline underline-offset-4 decoration-2 font-sans">
                                                {titleDisplay}
                                            </h2>
                                        </div>

                                        <table className="w-full text-left border-collapse font-sans text-xs">
                                            <thead>
                                                <tr className="border-b-2 border-slate-900 text-slate-900 font-extrabold uppercase tracking-wide">
                                                    <th className="py-2 px-2 w-[40%] text-left">Test Name</th>
                                                    <th className="py-2 px-2 w-[25%] text-left">Observed Value</th>
                                                    <th className="py-2 px-2 w-[35%] text-left">Reference Range</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 text-slate-900">
                                                {items.map((item, i) => (
                                                    <tr key={i} className="align-top">
                                                        <td className="py-2 px-2 font-bold text-slate-900">
                                                            {item.testName}
                                                        </td>
                                                        <td className="py-2 px-2 font-extrabold text-slate-900">
                                                            {item.resultValue || "—"} {item.unit}
                                                        </td>
                                                        <td className="py-2 px-2 font-semibold text-slate-700 whitespace-pre-line">
                                                            {item.referenceRange || "-"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {/* Test Method Note */}
                                        <div className="pt-3 font-sans text-[11px] text-slate-800 flex items-start gap-1">
                                            <span className="font-black text-slate-900">Test Method :-</span>
                                            <span className="font-semibold text-slate-700">
                                                {methodText}
                                            </span>
                                        </div>

                                        {/* Clinical Remarks */}
                                        {record.notes && (
                                            <div className="pt-3 border-t border-slate-200 font-sans text-xs">
                                                <span className="font-bold text-slate-900 uppercase">Clinical Remarks: </span>
                                                <span className="text-slate-800 italic">{record.notes}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* DOCTOR / PATHOLOGIST SIGNATURE & FOOTER NOTE BLOCK */}
                                <div className="pt-6 font-sans space-y-3">
                                    <div className="flex flex-col items-end justify-end space-y-1 text-right">
                                        <div className="text-2xl font-serif italic font-extrabold text-slate-900 pr-4 select-none tracking-tighter" style={{ fontFamily: 'Georgia, serif' }}>
                                            {record.authorizedBy || "Dr. Ravi Kumar Manyam"}
                                        </div>
                                        <div className="border-t border-slate-800 w-48 mt-1 pt-1" />
                                        <div className="font-extrabold text-xs text-slate-900">
                                            Dr. Ravi Kumar Manyam; Ph.D
                                        </div>
                                        <div className="text-[11px] font-semibold text-slate-600">
                                            Biochemist & Pathologist
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-extrabold text-slate-900 border-t border-slate-200 pt-2">
                                        NOTE : Please Correlate Clinically. If Any Discrepancy, Please Contact.
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                )}

            </div>

            {/* Print Media Styles */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .fixed, .backdrop-blur-xs {
                        position: static !important;
                        background: transparent !important;
                        padding: 0 !important;
                    }
                    body {
                        background: white !important;
                    }
                    /* Show only report canvas */
                    .print\\:shadow-none, .print\\:shadow-none * {
                        visibility: visible;
                    }
                    .break-before-page {
                        page-break-before: always !important;
                        break-before: page !important;
                    }
                }
            `}</style>
        </div>
    );
}
