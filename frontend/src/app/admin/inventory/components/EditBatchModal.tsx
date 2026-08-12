import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, Pencil } from "lucide-react";
import { getApiUrl } from "@/lib/api";

const InputField = ({
  label,
  name,
  type = "text",
  required = false,
  component = "input",
  options = [],
  formData,
  setFormData,
  ...props
}: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {component === "select" ? (
      <select
        value={(formData as any)[name]}
        onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
        required={required}
        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
        {...props}
      >
        <option value="" disabled>
          Select {label}
        </option>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        value={(formData as any)[name]}
        onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
        required={required}
        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
        {...props}
      />
    )}
  </div>
);

type EditBatchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  batch: any;
  onSuccess: () => void;
};

export default function EditBatchModal({
  isOpen,
  onClose,
  productId,
  batch,
  onSuccess,
}: EditBatchModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    supplierId: "",
    batchNumber: "",
    expiryDate: "",
    availableQuantity: "",
    unitCost: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchSuppliers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && batch) {
      setError("");
      setFormData({
        supplierId: batch.supplierId?._id || batch.supplierId || "",
        batchNumber: batch.batchNumber || "",
        expiryDate: batch.expiryDate
          ? new Date(batch.expiryDate).toISOString().split("T")[0]
          : "",
        availableQuantity: batch.availableQuantity?.toString() || "",
        unitCost: batch.unitCost?.toString() || "",
      });
    }
  }, [isOpen, batch]);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(getApiUrl("/api/admin/inventory/suppliers"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen || !batch) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        getApiUrl(
          `/api/admin/inventory/products/${productId}/batches/${batch._id}`,
        ),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            availableQuantity: Number(formData.availableQuantity),
            unitCost: Number(formData.unitCost),
            supplierId: formData.supplierId || undefined,
          }),
        },
      );

      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        setError(data.error || "Failed to update batch");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-indigo-600 shadow-sm" />
              Edit Batch
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div className="md:col-span-2">
              <InputField
                formData={formData}
                setFormData={setFormData}
                label="Supplier"
                name="supplierId"
                component="select"
                options={suppliers.map((s) => ({
                  value: s._id,
                  label: s.name,
                }))}
              />
            </div>

            <InputField
              formData={formData}
              setFormData={setFormData}
              label="Batch Number"
              name="batchNumber"
              required
            />
            <InputField
              formData={formData}
              setFormData={setFormData}
              label="Expiry Date"
              name="expiryDate"
              type="date"
            />
            <InputField
              formData={formData}
              setFormData={setFormData}
              label="Available Quantity"
              name="availableQuantity"
              type="number"
              min="0"
              required
            />
            <InputField
              formData={formData}
              setFormData={setFormData}
              label="Unit Cost (₹)"
              name="unitCost"
              type="number"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
