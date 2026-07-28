"use client";
import React from "react";
import { Printer, Download, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { getApiUrl } from "@/lib/api";

interface TestResultEntry {
    testId?: string;
    testName: string;
    resultValue: string;
    unit: string;
    referenceRange: string;
    flag?: "Normal" | "Abnormal" | "Critical" | "";
    notes?: string;
    category?: string;
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
    if (!isOpen || !record) return null;

    const handlePrint = () => {
        if (record._id) {
            const pdfUrl = getApiUrl(`/api/admin/registrations/${record._id}/pdf`);
            window.open(pdfUrl, "_blank");
        } else {
            window.print();
        }
    };

    // Extract tests and group by category
    const testResults: TestResultEntry[] = record.testResults && record.testResults.length > 0
        ? record.testResults
        : (record.tests && record.tests.length > 0
            ? record.tests.map((t: any) => ({
                testName: typeof t === "string" ? t : (t.testName || t.name || "Diagnostic Parameter"),
                resultValue: t.resultValue || "—",
                unit: t.unit || "",
                referenceRange: typeof t === "object" ? (t.referenceRange || "-") : "-",
                category: t.category || "GENERAL PATHOLOGY"
            }))
            : [{ testName: "Routine Pathology Parameter", resultValue: "—", unit: "", referenceRange: "-", category: "GENERAL PATHOLOGY" }]
        );

    // Group tests by Category / Organ
    const categoryGroups: { [key: string]: TestResultEntry[] } = {};
    testResults.forEach(item => {
        const cat = (item.category || "PATHOLOGY OBSERVATIONS").toUpperCase();
        if (!categoryGroups[cat]) {
            categoryGroups[cat] = [];
        }
        categoryGroups[cat].push(item);
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
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-[200] flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans">
            {/* Main Modal Outer Box */}
            <div className="bg-white text-slate-900 w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-300 rounded-none print:shadow-none print:border-none print:w-full print:max-w-none print:m-0">
                
                {/* Non-Printable Header Toolbar */}
                <div className="flex items-center justify-between px-5 py-3 bg-slate-800 text-white print:hidden shrink-0">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-amber-400" />
                        <span className="text-xs font-black uppercase tracking-wider">Official Pathology Report — {record.registrationNumber}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all active:scale-95 cursor-pointer rounded-full"
                        >
                            <Download className="w-4 h-4" />
                            Download / Print PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Printable Report Canvas */}
                <div className="p-6 sm:p-8 bg-white print:p-0 font-serif text-slate-900 space-y-6">
                    
                    {/* TOP PATIENT DEMOGRAPHICS BOXED TABLE (Exact match to uploaded standard format) */}
                    <div className="border border-slate-900 text-xs">
                        {/* Row 1 */}
                        <div className="grid grid-cols-12 border-b border-slate-900">
                            <div className="col-span-7 px-3 py-2 border-r border-slate-900 font-sans flex items-center gap-2">
                                <span className="font-extrabold uppercase tracking-tight text-slate-900">NAME :</span>
                                <span className="font-bold text-slate-900">{record.patientName}</span>
                            </div>
                            <div className="col-span-5 px-3 py-2 font-sans flex items-center justify-between">
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
                            <div className="col-span-7 px-3 py-2 border-r border-slate-900 font-sans flex items-center gap-2">
                                <span className="font-extrabold uppercase tracking-tight text-slate-900">Ref/Dr :</span>
                                <span className="font-bold text-slate-900">{record.referredBy || "SELF (Self)"}</span>
                            </div>
                            <div className="col-span-5 px-3 py-2 font-sans flex items-center gap-2">
                                <span className="font-extrabold text-slate-900">Registration Date :</span>
                                <span className="font-bold">{record.registrationDate || todayDate}</span>
                            </div>
                        </div>

                        {/* Row 3 */}
                        <div className="grid grid-cols-12 border-b border-slate-900">
                            <div className="col-span-7 px-3 py-2 border-r border-slate-900 font-sans flex items-center gap-2">
                                <span className="font-extrabold uppercase tracking-tight text-slate-900">Sample Drawn By :</span>
                                <span className="font-bold text-slate-900">{record.sampleReceived?.person || "Zedlabs, Eluru"}</span>
                            </div>
                            <div className="col-span-5 px-3 py-2 font-sans flex items-center gap-2">
                                <span className="font-extrabold text-slate-900">Report Issued Date :</span>
                                <span className="font-bold">{record.authorizedAt || record.registrationDate || todayDate}</span>
                            </div>
                        </div>

                        {/* Row 4 */}
                        <div className="grid grid-cols-12">
                            <div className="col-span-7 px-3 py-2 border-r border-slate-900 font-sans flex items-center gap-2">
                                <span className="font-extrabold uppercase tracking-tight text-slate-900">SAMPLE :</span>
                                <span className="font-bold text-slate-900">{sampleTypeText}</span>
                            </div>
                            <div className="col-span-5 px-3 py-2 font-sans flex items-center gap-2">
                                <span className="font-extrabold text-slate-900">Report No :</span>
                                <span className="font-bold font-mono text-slate-900">{record.registrationNumber}</span>
                            </div>
                        </div>
                    </div>

                    {/* CATEGORIZED TEST SECTIONS — EACH CATEGORY ON A SEPARATE PAGE */}
                    <div className="space-y-8">
                        {categoryKeys.map((categoryName, idx) => {
                            const items = categoryGroups[categoryName];
                            return (
                                <div
                                    key={categoryName}
                                    className={cn(
                                        "space-y-4",
                                        idx > 0 && "break-before-page print:break-before-page print:pt-6"
                                    )}
                                    style={{ pageBreakBefore: idx > 0 ? "always" : "auto" }}
                                >
                                    {/* Center Header: CATEGORY / ORGAN REPORT# */}
                                    <div className="text-center my-4">
                                        <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 underline underline-offset-4 decoration-2 font-sans">
                                            {categoryName} REPORT#
                                        </h2>
                                    </div>

                                    {/* Parameter Table */}
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
                                            Enzyme Kinetic Assay; Fully Automated Biochemistry & Hematology Analyzer
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pathologist Remarks if any */}
                    {record.notes && (
                        <div className="pt-4 border-t border-slate-200 font-sans text-xs">
                            <span className="font-bold text-slate-900 uppercase">Clinical Remarks: </span>
                            <span className="text-slate-800 italic">{record.notes}</span>
                        </div>
                    )}

                    {/* DOCTOR / PATHOLOGIST SIGNATURE BLOCK */}
                    <div className="pt-12 font-sans flex flex-col items-end justify-end space-y-1 text-right">
                        {/* Cursive Signature Graphic Representation */}
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

                </div>

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
