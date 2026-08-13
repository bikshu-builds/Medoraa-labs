"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";
import {
  Search,
  Pencil,
  Trash,
  Settings,
  Link as LinkIcon,
  Plus,
  Save,
  Ban,
  CheckCircle2,
  X,
} from "lucide-react";

export default function InventoryMappingsPage() {
  const [mappings, setMappings] = useState<any[]>([]);
  const [samples, setSamples] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    testId: "",
    inventoryProductId: "",
    quantity: 1,
    unit: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const headers = { Authorization: `Bearer ${token}` };

      const [mappingsRes, samplesRes, productsRes] = await Promise.all([
        fetch(getApiUrl("/api/admin/inventory/mappings"), { headers }),
        fetch(getApiUrl("/api/admin/samples"), { headers }),
        fetch(getApiUrl("/api/admin/inventory/products"), { headers }),
      ]);

      const [mappingsData, samplesData, productsData] = await Promise.all([
        mappingsRes.json(),
        samplesRes.json(),
        productsRes.json(),
      ]);

      if (mappingsData.success) setMappings(mappingsData.data);
      if (samplesData.success) setSamples(samplesData.data);
      if (productsData.success) setProducts(productsData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    const prod = products.find((p) => p._id === pId);
    setFormData((prev) => ({
      ...prev,
      inventoryProductId: pId,
      unit: prod ? prod.unit : "",
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const url = getApiUrl(
        editId
          ? `/api/admin/inventory/mappings/${editId}`
          : "/api/admin/inventory/mappings",
      );
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setEditId(null);
        setFormData({
          testId: "",
          inventoryProductId: "",
          quantity: 1,
          unit: "",
        });
        fetchData();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (mapping: any) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        getApiUrl(`/api/admin/inventory/mappings/${mapping._id}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: !mapping.isActive }),
        },
      );
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this mapping completely?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        getApiUrl(`/api/admin/inventory/mappings/${id}`),
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMappings = mappings.filter((m) => {
    const t = m.testId?.testName?.toLowerCase() || "";
    const p = m.inventoryProductId?.name?.toLowerCase() || "";
    const s = search.toLowerCase();
    return t.includes(s) || p.includes(s);
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/admin/inventory"
                className="text-sm font-bold text-slate-400 hover:text-indigo-600"
              >
                Inventory
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-sm font-bold text-slate-600">
                Auto-Deductions
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-indigo-600" />
              Test Consumable Mappings
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Configure which inventory products are automatically consumed when
              a patient registers for a test.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setEditId(null);
                setFormData({
                  testId: "",
                  inventoryProductId: "",
                  quantity: 1,
                  unit: "",
                });
                setShowForm(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] uppercase tracking-widest shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Mapping
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-6">
        {showForm && (
          <div className="bg-white rounded-xl border border-indigo-100 shadow-sm p-5 mb-6 animate-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-indigo-900">
                {editId ? "Edit Mapping" : "Create New Mapping"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
            >
              <div className="md:col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Diagnostic Test
                </label>
                <select
                  required
                  value={formData.testId}
                  onChange={(e) =>
                    setFormData({ ...formData, testId: e.target.value })
                  }
                  className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select Test...</option>
                  {samples.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.testName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Inventory Product
                </label>
                <select
                  required
                  value={formData.inventoryProductId}
                  onChange={handleProductSelect}
                  className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select Product...</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Quantity
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: parseFloat(e.target.value),
                      })
                    }
                    className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                    {formData.unit}
                  </span>
                </div>
              </div>

              <div className="md:col-span-1 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold text-[11px] uppercase tracking-wide py-2.5 rounded-lg hover:bg-indigo-700 transition"
                >
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-800">
              Available Mappings
            </h2>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search test or product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-1.5 w-64 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Diagnostic Test</th>
                  <th className="px-4 py-3">Consumes Product</th>
                  <th className="px-4 py-3">Requirement</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : filteredMappings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <div className="max-w-xs mx-auto flex flex-col items-center justify-center text-slate-400">
                        <Settings className="w-10 h-10 mb-3 text-slate-300" />
                        <h4 className="text-sm font-bold text-slate-700">
                          No Mappings Configured
                        </h4>
                        <p className="text-xs mt-1 mb-4">
                          Link tests to inventory items to enable
                          auto-deduction.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMappings.map((mapping) => (
                    <tr
                      key={mapping._id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-bold text-slate-800">
                        {mapping.testId?.testName || (
                          <span className="text-red-500 text-xs">
                            Test Deleted
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {mapping.inventoryProductId?.name || (
                          <span className="text-red-500 text-xs">
                            Product Deleted
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md text-xs border border-indigo-100">
                          {mapping.quantity} {mapping.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {mapping.isActive ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 uppercase tracking-wider">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 uppercase tracking-wider">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditId(mapping._id);
                            setFormData({
                              testId: mapping.testId?._id || "",
                              inventoryProductId:
                                mapping.inventoryProductId?._id || "",
                              quantity: mapping.quantity,
                              unit: mapping.unit,
                            });
                            setShowForm(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(mapping)}
                          className={`p-1.5 rounded transition-colors ${!mapping.isActive ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-400 hover:text-orange-500 hover:bg-orange-50"}`}
                        >
                          {!mapping.isActive ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Ban className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(mapping._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
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
