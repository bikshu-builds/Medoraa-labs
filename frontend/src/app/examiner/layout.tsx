"use client";
import React from "react";
import Sidebar from "../admin/components/Sidebar";

export default function ExaminerLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-white overflow-hidden font-sans antialiased text-slate-900 print:block print:h-auto print:overflow-visible">
            <div className="print:hidden">
                <Sidebar />
            </div>
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 print:block print:bg-white">
                <main className="flex-1 overflow-y-auto custom-scrollbar print:block print:overflow-visible print:p-0">
                    <div className="p-8 max-w-[1600px] mx-auto print:p-0 print:max-w-none">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
