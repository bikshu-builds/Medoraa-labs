"use client";

import React, { useState, useEffect } from "react";
import { getApiUrl } from "@/lib/api";
import {
  FileSpreadsheet,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function InventoryImportHistoryPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(getApiUrl("/api/admin/inventory/imports"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setBatches(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/admin/inventory"
                className="text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                Inventory Import History
              </h1>
            </div>
            <p className="text-[11.5px] font-semibold text-slate-500 mt-0.5 ml-6">
              Track history of Excel batch imports for Inventory.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 whitespace-nowrap">
              <thead className="text-[10px] text-slate-400 uppercase bg-slate-50 font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 font-black">Date</th>
                  <th className="px-5 py-3 font-black">Batch Details</th>
                  <th className="px-5 py-3 font-black text-center">
                    Total Products
                  </th>
                  <th className="px-5 py-3 font-black text-center">
                    Valid Items
                  </th>
                  <th className="px-5 py-3 font-black text-center">
                    Invalid Items
                  </th>
                  <th className="px-5 py-3 font-black text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest"
                    >
                      Loading history...
                    </td>
                  </tr>
                ) : batches.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center text-slate-400 shadow-inner bg-slate-50/50"
                    >
                      <p className="text-xs font-semibold">No imports found.</p>
                    </td>
                  </tr>
                ) : (
                  batches.map((batch) => (
                    <tr
                      key={batch._id}
                      onClick={() =>
                        router.push(`/admin/inventory/imports/${batch._id}`)
                      }
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">
                            {new Date(batch.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                          <span className="text-[9px] uppercase tracking-widest text-slate-400 mt-0.5">
                            {new Date(batch.createdAt).toLocaleTimeString(
                              "en-GB",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-indigo-700">
                            {batch.fileName}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                            Imported by: {batch.importedBy?.name || "Admin"} •{" "}
                            {batch.importBatchId}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                          {batch.totalRows}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="font-bold text-emerald-600">
                          {batch.successfulRows}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="font-bold text-rose-600">
                          {batch.failedRows}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex justify-center">
                          {batch.status === "CONFIRMED" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              CONFIRMED
                            </span>
                          ) : batch.status === "DRAFT" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-orange-700 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200">
                              <Loader2 className="w-3.5 h-3.5" />
                              DRAFT
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                              <XCircle className="w-3.5 h-3.5" />
                              FAILED
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
