"use client";

import React, { useState, useEffect } from "react";
import { getApiUrl } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import {
  FileSpreadsheet,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  Plus,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Modal Component for Edit/Add
function DraftRowModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
}) {
  const [formData, setFormData] = useState({
    date: "",
    type: "INCOME",
    category: "",
    amount: "",
    paymentMethod: "",
    referenceNumber: "",
    description: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date
          ? new Date(initialData.date).toISOString().split("T")[0]
          : "",
        type: initialData.type || "INCOME",
        category: initialData.category || "",
        amount: initialData.amount ? initialData.amount.toString() : "",
        paymentMethod: initialData.paymentMethod || "",
        referenceNumber: initialData.referenceNumber || "",
        description: initialData.description || "",
        notes: initialData.notes || "",
      });
    } else {
      setFormData({
        date: new Date().toISOString().split("T")[0],
        type: "INCOME",
        category: "",
        amount: "",
        paymentMethod: "",
        referenceNumber: "",
        description: "",
        notes: "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
            {initialData ? "Edit Draft Transaction" : "Add Transaction"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full text-sm border-slate-200 rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                Amount
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full text-sm border-slate-200 rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                Transaction Type
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full text-sm border-slate-200 rounded-lg p-2 bg-white focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="INCOME">INCOME</option>
                <option value="EXPENSE">EXPENSE</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                Category
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full text-sm border-slate-200 rounded-lg p-2 bg-white focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Category...</option>
                <option value="Patient Payment">Patient Payment</option>
                <option value="Laboratory Service">Laboratory Service</option>
                <option value="Inventory / Laboratory Supplies">
                  Inventory / Laboratory Supplies
                </option>
                <option value="Equipment">Equipment</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Rent">Rent</option>
                <option value="Utilities">Utilities</option>
                <option value="Transportation">Transportation</option>
                <option value="Courier">Courier</option>
                <option value="Staff">Staff</option>
                <option value="Marketing">Marketing</option>
                <option value="Office">Office</option>
                <option value="Doctor Payment">Doctor Payment</option>
                <option value="Other">Other</option>
                <option value="Other Income">Other Income</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                Payment Method
              </label>
              <select
                required
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethod: e.target.value })
                }
                className="w-full text-sm border-slate-200 rounded-lg p-2 bg-white focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Method...</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Card</option>
                <option value="Cheque">Cheque</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                Reference
              </label>
              <input
                type="text"
                value={formData.referenceNumber}
                onChange={(e) =>
                  setFormData({ ...formData, referenceNumber: e.target.value })
                }
                className="w-full text-sm border-slate-200 rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full text-sm border-slate-200 rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 bg-white"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "SAVING..." : "SAVE DRAFT ROW"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DraftReviewPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<any>(null);
  const [rows, setRows] = useState<any[]>([]);

  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchDraft();
    }
  }, [id]);

  const fetchDraft = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(getApiUrl(`/api/admin/finance/import/${id}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setBatch(data.data.batch);
        setRows(data.data.rows);
      } else {
        setErrorMsg("Failed to load draft");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Error loading draft");
    } finally {
      setLoading(false);
    }
  };

  const handleRowSubmit = async (formData: any) => {
    const token = localStorage.getItem("adminToken");
    const method = editingRow ? "PUT" : "POST";
    const url = editingRow
      ? getApiUrl(`/api/admin/finance/import/row/${editingRow._id}`)
      : getApiUrl(`/api/admin/finance/import/${id}/row`);

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setEditingRow(null);
        await fetchDraft(); // Refresh after edit
      } else {
        alert(data.error || "Failed to update row");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (rowId: string) => {
    if (!confirm("Remove this transaction from the import?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(
        getApiUrl(`/api/admin/finance/import/row/${rowId}`),
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        setRows(rows.filter((r) => r._id !== rowId));
        fetchDraft(); // refresh summary
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmImport = async () => {
    const invalidCount = rows.filter(
      (r) => r.validationStatus === "INVALID",
    ).length;
    if (invalidCount > 0) {
      alert(
        `There are ${invalidCount} invalid rows. Please edit or delete them before confirming.`,
      );
      return;
    }

    if (!confirm(`Confirm importing ${rows.length} transactions to Finance?`))
      return;

    setIsConfirming(true);
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(getApiUrl("/api/admin/finance/import/confirm"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ batchId: id }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Import successful!");
        router.push("/admin/finance");
      } else {
        alert(data.error || "Import failed");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Draft...
      </div>
    );
  }

  if (!batch) return <div className="p-10 text-center">Batch not found.</div>;

  const isConfirmed = batch.status === "CONFIRMED";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/admin/finance/imports"
                className="text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                {isConfirmed ? "Import Details" : "Review Import Draft"}
              </h1>
              {isConfirmed ? (
                <span className="ml-3 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100 rounded border border-emerald-200">
                  CONFIRMED
                </span>
              ) : (
                <span className="ml-3 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-orange-800 bg-orange-100 rounded border border-orange-200">
                  DRAFT
                </span>
              )}
            </div>
            <p className="text-[11.5px] font-semibold text-slate-500 mt-0.5 ml-6">
              File: {batch.fileName}
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-indigo-50 border border-indigo-100/50 rounded-lg px-4 py-2 flex flex-col items-end">
              <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">
                Total Income
              </span>
              <span className="text-sm font-bold text-indigo-700">
                + ₹{batch.totalIncome?.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="bg-rose-50 border border-rose-100/50 rounded-lg px-4 py-2 flex flex-col items-end">
              <span className="text-[9px] font-black uppercase text-rose-400 tracking-widest">
                Total Expense
              </span>
              <span className="text-sm font-bold text-rose-700">
                - ₹{batch.totalExpense?.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="bg-slate-100 border border-slate-200/50 rounded-lg px-4 py-2 flex flex-col items-end">
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
                Net Change
              </span>
              <span className="text-sm font-bold text-slate-800">
                ₹
                {(batch.totalIncome - batch.totalExpense)?.toLocaleString(
                  "en-IN",
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6">
        {!isConfirmed && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setEditingRow(null);
                setModalOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Transaction
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 whitespace-nowrap">
              <thead className="text-[10px] text-slate-400 uppercase bg-slate-50 font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 w-12 text-center">Row</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  {!isConfirmed && (
                    <th className="px-5 py-3 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-slate-400 font-medium"
                    >
                      No rows found in this batch.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <React.Fragment key={row._id}>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-5 py-3 text-center font-medium text-slate-400 bg-slate-50/30">
                          {row.rowNumber}
                        </td>
                        <td className="px-5 py-3 font-semibold">
                          {row.date
                            ? new Date(row.date).toLocaleDateString("en-GB")
                            : "-"}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                              row.type === "INCOME"
                                ? "bg-emerald-50 text-emerald-600"
                                : row.type === "EXPENSE"
                                  ? "bg-rose-50 text-rose-600"
                                  : "bg-slate-100 text-slate-500",
                            )}
                          >
                            {row.type || "UNKNOWN"}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-medium">
                          {row.category || "-"}
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-slate-800">
                          ₹
                          {row.amount
                            ? row.amount.toLocaleString("en-IN")
                            : "0"}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {row.validationStatus === "VALID" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-500 mx-auto" />
                          )}
                        </td>
                        {!isConfirmed && (
                          <td className="px-5 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingRow(row);
                                  setModalOpen(true);
                                }}
                                className="text-slate-400 hover:text-indigo-600"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(row._id)}
                                className="text-slate-400 hover:text-rose-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                      {row.validationErrors &&
                        row.validationErrors.length > 0 && (
                          <tr className="bg-rose-50/50">
                            <td colSpan={1}></td>
                            <td colSpan={6} className="px-5 py-2">
                              <div className="flex items-center gap-1.5 text-rose-600">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                  {row.validationErrors.join(" • ")}
                                </span>
                              </div>
                            </td>
                          </tr>
                        )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {!isConfirmed && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] p-4 px-6 z-20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-500">
              Valid:{" "}
              <span className="text-emerald-600">{batch.successfulRows}</span> •
              Invalid: <span className="text-rose-600">{batch.failedRows}</span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push("/admin/finance/imports")}
                className="px-6 py-2.5 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-100 transition-colors uppercase tracking-wider"
              >
                Save & Exit
              </button>
              <button
                disabled={
                  batch.failedRows > 0 || rows.length === 0 || isConfirming
                }
                onClick={handleConfirmImport}
                className="flex items-center gap-2 bg-indigo-600 text-white font-bold px-8 py-2.5 rounded-xl uppercase tracking-widest hover:bg-indigo-700 focus:ring-4 ring-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isConfirming && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Import
              </button>
            </div>
          </div>
        </div>
      )}

      <DraftRowModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleRowSubmit}
        initialData={editingRow}
      />
    </div>
  );
}
