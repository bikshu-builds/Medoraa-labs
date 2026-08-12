import React, { useState } from "react";
import { X, Save, AlertCircle, CircleDollarSign } from "lucide-react";
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
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
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

type AddTransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddTransactionModal({
  isOpen,
  onClose,
  onSuccess,
}: AddTransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    type: "EXPENSE",
    category: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "Bank Transfer",
    referenceNumber: "",
    description: "",
    notes: "",
  });

  const incomeCategories = [
    "Patient Payment",
    "Laboratory Service",
    "Other Income",
  ];
  const expenseCategories = [
    "Inventory / Supplies",
    "Equipment",
    "Maintenance",
    "Rent",
    "Utilities",
    "Transportation",
    "Courier",
    "Staff",
    "Marketing",
    "Office",
    "Other",
  ];
  const paymentMethods = [
    "Cash",
    "UPI",
    "Bank Transfer",
    "Card",
    "Cheque",
    "Other",
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(getApiUrl(`/api/admin/finance/transactions`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
          date: new Date(formData.date),
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        setError(data.error || "Failed to add transaction");
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
              <CircleDollarSign className="w-5 h-5 text-indigo-600 shadow-sm" />
              Add Manual Transaction
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

          {/* Type Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, type: "EXPENSE", category: "" })
              }
              className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-colors ${
                formData.type === "EXPENSE"
                  ? "bg-white text-rose-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, type: "INCOME", category: "" })
              }
              className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-colors ${
                formData.type === "INCOME"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Income
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <InputField
              formData={formData}
              setFormData={setFormData}
              label="Amount (₹)"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              required
            />
            <InputField
              formData={formData}
              setFormData={setFormData}
              label="Category"
              name="category"
              component="select"
              options={
                formData.type === "INCOME"
                  ? incomeCategories
                  : expenseCategories
              }
              required
            />
            <InputField
              formData={formData}
              setFormData={setFormData}
              label="Date"
              name="date"
              type="date"
              required
            />
            <InputField
              formData={formData}
              setFormData={setFormData}
              label="Payment Method"
              name="paymentMethod"
              component="select"
              options={paymentMethods}
              required
            />
            <InputField
              formData={formData}
              setFormData={setFormData}
              label="Reference Number"
              name="referenceNumber"
            />
            <div className="md:col-span-2">
              <InputField
                formData={formData}
                setFormData={setFormData}
                label="Description"
                name="description"
                required
              />
            </div>
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
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
