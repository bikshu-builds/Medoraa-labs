"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { getApiUrl } from "@/lib/api";

const InputField = ({
  label,
  name,
  type = "text",
  required = false,
  component = "input",
  options = [],
  formData,
  onChange,
}: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {component === "select" ? (
      <select
        name={name}
        required={required}
        value={(formData as any)[name]}
        onChange={onChange}
        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
      >
        {options.map((opt: any) => (
          <option key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
    ) : component === "textarea" ? (
      <textarea
        name={name}
        required={required}
        value={(formData as any)[name]}
        onChange={onChange}
        rows={2}
        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
      />
    ) : (
      <input
        type={type}
        name={name}
        required={required}
        value={(formData as any)[name]}
        onChange={onChange}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "any" : undefined}
        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
      />
    )}
  </div>
);

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  onSuccess: () => void;
}

export default function AddStockModal({
  isOpen,
  onClose,
  productId,
  onSuccess,
}: AddStockModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contactPerson: "",
    phone: "",
  });
  const [addingSupplier, setAddingSupplier] = useState(false);

  const [formData, setFormData] = useState({
    supplierId: "",
    batchNumber: "",
    lotNumber: "",
    quantity: "",
    unitCost: "",
    purchaseDate: "",
    manufacturingDate: "",
    expiryDate: "",
    invoiceNumber: "",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchSuppliers();
      setError("");
      setSuccess("");
      setFormData({
        supplierId: "",
        batchNumber: "",
        lotNumber: "",
        quantity: "",
        unitCost: "",
        purchaseDate: "",
        manufacturingDate: "",
        expiryDate: "",
        invoiceNumber: "",
        notes: "",
      });
    }
  }, [isOpen]);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(getApiUrl("/api/admin/inventory/suppliers"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.data);
        if (data.data.length > 0 && !formData.supplierId) {
          setFormData((prev) => ({ ...prev, supplierId: data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickAddSupplier = async () => {
    if (!newSupplier.name.trim()) return;
    setAddingSupplier(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(getApiUrl("/api/admin/inventory/suppliers"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSupplier),
      });
      const data = await res.json();
      if (data.success) {
        setSuppliers([data.data, ...suppliers]);
        setFormData({ ...formData, supplierId: data.data._id });
        setIsAddingSupplier(false);
        setNewSupplier({ name: "", contactPerson: "", phone: "" });
      } else {
        setError(data.error || "Failed to create supplier");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setAddingSupplier(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!formData.supplierId && suppliers.length > 0) {
      formData.supplierId = suppliers[0]._id;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        getApiUrl(`/api/admin/inventory/products/${productId}/stock`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            quantity: Number(formData.quantity),
            unitCost: Number(formData.unitCost),
          }),
        },
      );
      const data = await res.json();

      if (data.success) {
        setSuccess("Stock batch added successfully.");
        setTimeout(() => onSuccess(), 1500);
      } else {
        setError(data.error || "Failed to add stock batch.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-xl shadow-xl flex flex-col font-sans overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Add Stock Batch
              </h2>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                Record new inventory received
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          {error && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
            </div>
          )}

          <form
            id="add-stock-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <section className="bg-white p-5 rounded-lg border border-slate-200/60 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                      Supplier / Agency <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddingSupplier(true)}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
                    >
                      + New
                    </button>
                  </div>
                  {isAddingSupplier ? (
                    <div className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <input
                        type="text"
                        value={newSupplier.name}
                        onChange={(e) =>
                          setNewSupplier({
                            ...newSupplier,
                            name: e.target.value,
                          })
                        }
                        placeholder="Supplier name *"
                        autoFocus
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                      <input
                        type="text"
                        value={newSupplier.contactPerson}
                        onChange={(e) =>
                          setNewSupplier({
                            ...newSupplier,
                            contactPerson: e.target.value,
                          })
                        }
                        placeholder="Contact Person (optional)"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                      <input
                        type="text"
                        value={newSupplier.phone}
                        onChange={(e) =>
                          setNewSupplier({
                            ...newSupplier,
                            phone: e.target.value,
                          })
                        }
                        placeholder="Phone Number (optional)"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          type="button"
                          onClick={handleQuickAddSupplier}
                          disabled={addingSupplier || !newSupplier.name.trim()}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold disabled:opacity-50 flex-1"
                        >
                          {addingSupplier ? "Adding..." : "Add Supplier"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingSupplier(false)}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md text-xs font-bold flex-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <select
                      name="supplierId"
                      required
                      value={formData.supplierId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    >
                      {suppliers.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <InputField
                  formData={formData}
                  onChange={handleChange}
                  label="Batch Number"
                  name="batchNumber"
                  required
                />
                <InputField
                  formData={formData}
                  onChange={handleChange}
                  label="Lot Number"
                  name="lotNumber"
                />
                <InputField
                  formData={formData}
                  onChange={handleChange}
                  label="Quantity Received"
                  name="quantity"
                  type="number"
                  required
                />
                <InputField
                  formData={formData}
                  onChange={handleChange}
                  label="Unit Cost"
                  name="unitCost"
                  type="number"
                  required
                />
                <InputField
                  formData={formData}
                  onChange={handleChange}
                  label="Invoice Number"
                  name="invoiceNumber"
                />
                <InputField
                  formData={formData}
                  onChange={handleChange}
                  label="Purchase Date"
                  name="purchaseDate"
                  type="date"
                />
                <InputField
                  formData={formData}
                  onChange={handleChange}
                  label="Manufacturing Date"
                  name="manufacturingDate"
                  type="date"
                />
                <InputField
                  formData={formData}
                  onChange={handleChange}
                  label="Expiry Date"
                  name="expiryDate"
                  type="date"
                />
                <div className="md:col-span-2">
                  <InputField label="Notes" name="notes" component="textarea" />
                </div>
              </div>
            </section>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-stock-form"
            disabled={loading || suppliers.length === 0}
            className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />{" "}
                Saving...
              </>
            ) : (
              "Save Stock Batch"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
