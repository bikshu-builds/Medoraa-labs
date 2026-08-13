"use client";

import React, { useState, useEffect } from "react";
import { getApiUrl } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import {
  FileSpreadsheet,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  AlertCircle,
  Loader2,
  Package,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// --- INVENTORY ROW MODAL COMPONENT ---
function DraftRowModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialData: any;
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    productCode: "",
    name: "",
    category: "",
    itemType: "",
    unit: "",
    minimumStock: 0,
    reorderLevel: 0,
    supplierName: "",
    batchNumber: "",
    quantity: 0,
    unitCost: 0,
    manufacturingDate: "",
    expiryDate: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        productCode: initialData.productCode || "",
        name: initialData.name || "",
        category: initialData.category || "",
        itemType: initialData.itemType || "",
        unit: initialData.unit || "",
        minimumStock: initialData.minimumStock || 0,
        reorderLevel: initialData.reorderLevel || 0,
        supplierName: initialData.supplierName || "",
        batchNumber: initialData.batchNumber || "",
        quantity: initialData.quantity || 0,
        unitCost: initialData.unitCost || 0,
        manufacturingDate: initialData.manufacturingDate
          ? new Date(initialData.manufacturingDate).toISOString().split("T")[0]
          : "",
        expiryDate: initialData.expiryDate
          ? new Date(initialData.expiryDate).toISOString().split("T")[0]
          : "",
      });
    } else {
      setFormData({
        productCode: "",
        name: "",
        category: "",
        itemType: "",
        unit: "",
        minimumStock: 0,
        reorderLevel: 0,
        supplierName: "",
        batchNumber: "",
        quantity: 0,
        unitCost: 0,
        manufacturingDate: "",
        expiryDate: "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right-8 duration-300 overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase">
            {initialData ? "Edit Stock Item" : "Add Stock Item"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-full"
          >
            ×
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Product Code
              </label>
              <input
                type="text"
                value={formData.productCode}
                onChange={(e) =>
                  setFormData({ ...formData, productCode: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Product Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Item Type
              </label>
              <input
                type="text"
                value={formData.itemType}
                onChange={(e) =>
                  setFormData({ ...formData, itemType: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Unit
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Min Stock
              </label>
              <input
                type="number"
                value={formData.minimumStock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minimumStock: Number(e.target.value),
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Reorder lvl
              </label>
              <input
                type="number"
                value={formData.reorderLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reorderLevel: Number(e.target.value),
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800"
              />
            </div>
          </div>

          <hr className="border-slate-100 my-2" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Supplier Name
              </label>
              <input
                type="text"
                value={formData.supplierName}
                onChange={(e) =>
                  setFormData({ ...formData, supplierName: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Batch/Lot Number
              </label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) =>
                  setFormData({ ...formData, batchNumber: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Quantity
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: Number(e.target.value) })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Unit Cost (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.unitCost}
                onChange={(e) =>
                  setFormData({ ...formData, unitCost: Number(e.target.value) })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Mfg Date
              </label>
              <input
                type="date"
                value={formData.manufacturingDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    manufacturingDate: e.target.value,
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Expiry Date
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) =>
                  setFormData({ ...formData, expiryDate: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800"
              />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50 mt-auto">
          <button
            onClick={() => onSubmit(formData)}
            className="w-full bg-indigo-600 text-white font-bold tracking-wide py-3 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            {initialData ? "UPDATE ITEM" : "ADD ITEM"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function InventoryDraftReviewPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<any>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

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
      const res = await fetch(getApiUrl(`/api/admin/inventory/import/${id}`), {
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
      ? getApiUrl(`/api/admin/inventory/import/row/${editingRow._id}`)
      : getApiUrl(`/api/admin/inventory/import/${id}/row`);

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
        await fetchDraft();
      } else {
        alert(data.error || "Failed to update row");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (rowId: string) => {
    if (!confirm("Remove this item from the import?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(
        getApiUrl(`/api/admin/inventory/import/row/${rowId}`),
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        setRows(rows.filter((r) => r._id !== rowId));
        fetchDraft();
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

    if (!confirm(`Confirm importing ${rows.length} products to Inventory?`))
      return;

    setIsConfirming(true);
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(
        getApiUrl("/api/admin/inventory/import/confirm"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ batchId: id }),
        },
      );
      const data = await res.json();
      if (data.success) {
        router.push("/admin/inventory");
      } else {
        alert(data.error || "Failed to confirm batch");
      }
    } catch (e) {
      console.error(e);
      alert("Error confirming batch");
    } finally {
      setIsConfirming(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-slate-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Fetching draft...
      </div>
    );
  if (errorMsg)
    return <div className="p-10 text-center text-red-500">{errorMsg}</div>;
  if (!batch) return <div className="p-10 text-center">Batch not found.</div>;

  const isConfirmed = batch.status === "CONFIRMED";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/admin/inventory/imports"
                className="text-slate-400 hover:text-indigo-600 transition-colors"
                title="Back to History"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
                {isConfirmed ? "Import Details" : "Draft Review"}
                {isConfirmed && (
                  <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                  </span>
                )}
              </h1>
            </div>
            <p className="text-sm text-slate-500 font-medium ml-8">
              {batch.fileName} (Upload ID: {batch.importBatchId})
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 flex flex-col items-center justify-center min-w-[80px]">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Valid
              </span>
              <span className="text-lg font-black text-emerald-600">
                {batch.successfulRows}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 flex flex-col items-center justify-center min-w-[80px]">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Invalid
              </span>
              <span
                className={cn(
                  "text-lg font-black",
                  batch.failedRows > 0 ? "text-rose-600" : "text-slate-600",
                )}
              >
                {batch.failedRows}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-500" /> Staged Products (
              {rows.length})
            </h2>
            {!isConfirmed && (
              <button
                onClick={() => {
                  setEditingRow(null);
                  setModalOpen(true);
                }}
                className="text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg shadow-sm"
              >
                + Add Item
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
              <thead className="text-[10px] text-slate-500 uppercase bg-slate-50/80 font-black border-b border-slate-200 tracking-widest">
                <tr>
                  <th className="px-4 py-3">Row</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Batch Info</th>
                  <th className="px-4 py-3">Status</th>
                  {!isConfirmed && (
                    <th className="px-4 py-3 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-slate-400 text-xs"
                    >
                      No items staged.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const valid = row.validationStatus === "VALID";
                    return (
                      <tr
                        key={row._id}
                        className={cn(
                          "transition-colors",
                          !valid
                            ? "bg-rose-50/30 hover:bg-rose-50/50"
                            : "hover:bg-slate-50",
                        )}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">
                          {row.rowNumber}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">
                              {row.name || (
                                <span className="text-rose-500 italic text-xs">
                                  Missing
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              Code:{" "}
                              {row.productCode || (
                                <span className="text-rose-500 italic">
                                  N/A
                                </span>
                              )}{" "}
                              | {row.category} ({row.itemType})
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 text-xs">
                              Qty: {row.quantity} {row.unit} @ ₹{row.unitCost}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              B#: {row.batchNumber} | Suppl: {row.supplierName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col items-start gap-1">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                                valid
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200",
                              )}
                            >
                              {valid ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {row.validationStatus}
                            </span>
                            {!valid && row.validationErrors.length > 0 && (
                              <div className="text-[10px] text-rose-600 flex flex-col mt-1">
                                {row.validationErrors.map(
                                  (err: any, i: number) => (
                                    <span
                                      key={i}
                                      className="flex gap-1 items-start"
                                    >
                                      <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                                      {err}
                                    </span>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        {!isConfirmed && (
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => {
                                setEditingRow(row);
                                setModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded transition"
                              title="Edit Row"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(row._id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition"
                              title="Delete Row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM ACTIONS */}
      {!isConfirmed && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] p-4 z-40">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <p className="text-xs font-semibold text-slate-500">
              Please review all warnings before confirming.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/admin/inventory")}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 text-xs uppercase tracking-widest transition"
              >
                Save Draft
              </button>
              <button
                disabled={isConfirming || batch.failedRows > 0}
                onClick={handleConfirmImport}
                className="px-8 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-widest shadow-sm transition flex gap-2 items-center"
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    CONFIRMING...
                  </>
                ) : (
                  <>
                    CONFIRM IMPORT
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAFT ROW MODAL */}
      <DraftRowModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editingRow}
        onSubmit={handleRowSubmit}
      />
    </div>
  );
}
