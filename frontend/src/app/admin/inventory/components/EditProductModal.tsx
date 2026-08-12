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
        {options.map((opt: any) => (
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

type EditProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: any;
};

export default function EditProductModal({
  isOpen,
  onClose,
  onSuccess,
  product,
}: EditProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    "Blood Collection",
    "Urine Collection",
    "Specimen Container",
    "Consumable",
    "Reagent",
    "Liquid",
    "PPE",
    "Glassware",
    "Other",
  ];

  const itemTypes = [
    "Consumable",
    "Reagent",
    "Liquid",
    "Container",
    "PPE",
    "Equipment",
    "Other",
  ];

  const units = [
    "Piece",
    "Box",
    "Pack",
    "Vial",
    "Bottle",
    "Roll",
    "Ml",
    "Mg",
    "Other",
  ];

  const [customFields, setCustomFields] = useState({
    category: "",
    itemType: "",
    unit: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    productCode: "",
    category: "Consumable",
    itemType: "Consumable",
    unit: "Piece",
    description: "",
    minimumStock: "0",
    reorderLevel: "0",
  });

  useEffect(() => {
    if (isOpen && product) {
      setError("");

      const isCustomCat = !categories.includes(product.category);
      const isCustomType = !itemTypes.includes(product.itemType);
      const isCustomUnit = !units.includes(product.unit);

      setFormData({
        name: product.name || "",
        productCode: product.productCode || "",
        category: isCustomCat ? "Other" : product.category || "Consumable",
        itemType: isCustomType ? "Other" : product.itemType || "Consumable",
        unit: isCustomUnit ? "Other" : product.unit || "Piece",
        description: product.description || "",
        minimumStock: product.minimumStock?.toString() || "0",
        reorderLevel: product.reorderLevel?.toString() || "0",
      });

      setCustomFields({
        category: isCustomCat ? product.category : "",
        itemType: isCustomType ? product.itemType : "",
        unit: isCustomUnit ? product.unit : "",
      });
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const finalCategory =
      formData.category === "Other" ? customFields.category : formData.category;
    const finalItemType =
      formData.itemType === "Other" ? customFields.itemType : formData.itemType;
    const finalUnit =
      formData.unit === "Other" ? customFields.unit : formData.unit;

    if (formData.category === "Other" && !finalCategory.trim()) {
      setError("Please specify the custom category.");
      setLoading(false);
      return;
    }
    if (formData.itemType === "Other" && !finalItemType.trim()) {
      setError("Please specify the custom product type.");
      setLoading(false);
      return;
    }
    if (formData.unit === "Other" && !finalUnit.trim()) {
      setError("Please specify the custom unit.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        getApiUrl(`/api/admin/inventory/products/${product._id}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            category: finalCategory,
            itemType: finalItemType,
            unit: finalUnit,
            minimumStock: Number(formData.minimumStock),
            reorderLevel: Number(formData.reorderLevel),
          }),
        },
      );

      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        setError(data.error || "Failed to update product");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-indigo-600 shadow-sm" />
              Edit Product Details
            </h2>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">
              {product.productCode}
            </p>
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
            <InputField
              formData={formData}
              setFormData={setFormData}
              label="Product Name"
              name="name"
              required
            />
            <InputField
              formData={formData}
              setFormData={setFormData}
              label="Product Code"
              name="productCode"
              required
            />

            <div className="flex flex-col gap-1.5">
              <InputField
                formData={formData}
                setFormData={setFormData}
                label="Category"
                name="category"
                component="select"
                options={categories}
                required
              />
              {formData.category === "Other" && (
                <input
                  type="text"
                  placeholder="Specify category..."
                  value={customFields.category}
                  onChange={(e) =>
                    setCustomFields({
                      ...customFields,
                      category: e.target.value,
                    })
                  }
                  required
                  className="w-full px-3 py-2 mt-1 text-sm bg-indigo-50 border border-indigo-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-indigo-300"
                />
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <InputField
                formData={formData}
                setFormData={setFormData}
                label="Product Type"
                name="itemType"
                component="select"
                options={itemTypes}
                required
              />
              {formData.itemType === "Other" && (
                <input
                  type="text"
                  placeholder="Specify product type..."
                  value={customFields.itemType}
                  onChange={(e) =>
                    setCustomFields({
                      ...customFields,
                      itemType: e.target.value,
                    })
                  }
                  required
                  className="w-full px-3 py-2 mt-1 text-sm bg-indigo-50 border border-indigo-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-indigo-300"
                />
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <InputField
                formData={formData}
                setFormData={setFormData}
                label="Unit"
                name="unit"
                component="select"
                options={units}
                required
              />
              {formData.unit === "Other" && (
                <input
                  type="text"
                  placeholder="Specify unit (e.g. Mg, Boxes)..."
                  value={customFields.unit}
                  onChange={(e) =>
                    setCustomFields({ ...customFields, unit: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 mt-1 text-sm bg-indigo-50 border border-indigo-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-indigo-300"
                />
              )}
            </div>

            <InputField
              formData={formData}
              setFormData={setFormData}
              label="Minimum Base Stock"
              name="minimumStock"
              type="number"
              min="0"
              required
            />

            <div className="md:col-span-2">
              <InputField
                formData={formData}
                setFormData={setFormData}
                label="Description"
                name="description"
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
