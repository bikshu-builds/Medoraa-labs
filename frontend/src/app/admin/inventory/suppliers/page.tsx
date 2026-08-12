"use client";

import React, { useState, useEffect } from "react";
import { getApiUrl } from "@/lib/api";
import {
  Users,
  Plus,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Ban,
} from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Minimal inline form
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    contactPerson: "",
    phone: "",
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(getApiUrl(`/api/admin/inventory/suppliers`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(getApiUrl("/api/admin/inventory/suppliers"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, contactPerson, phone }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAdding(false);
        setName("");
        setContactPerson("");
        setPhone("");
        fetchSuppliers();
      } else {
        setError(data.error || "Failed to create supplier");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    }
  };

  const startEdit = (s: any) => {
    setEditingId(s._id);
    setEditForm({
      name: s.name,
      contactPerson: s.contactPerson || "",
      phone: s.phone || "",
    });
  };

  const handleEditSubmit = async (id: string) => {
    if (!editForm.name) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        getApiUrl(`/api/admin/inventory/suppliers/${id}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editForm),
        },
      );
      const data = await res.json();
      if (data.success) {
        setEditingId(null);
        fetchSuppliers();
      } else {
        setError(data.error || "Failed to update supplier");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    }
  };

  const toggleStatus = async (s: any) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        getApiUrl(`/api/admin/inventory/suppliers/${s._id}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: !s.isActive }),
        },
      );
      const data = await res.json();
      if (data.success) {
        fetchSuppliers();
      } else {
        setError(data.error || "Failed to update status");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/admin/inventory"
            className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800 mb-2"
          >
            <ArrowLeft className="w-3 h-3 mr-1" /> Back to Inventory
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-600" />
                Suppliers & Agencies
              </h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                Manage product vendors and distributors.
              </p>
            </div>
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Supplier
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-6 space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {isAdding && (
          <form
            onSubmit={handleAdd}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <div className="flex-1 w-full">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1 block">
                Supplier Name *
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1 block">
                Contact Person
              </label>
              <input
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1 block">
                Phone
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-md shadow-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Supplier Name</th>
                <th className="px-4 py-3">Contact Person</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-slate-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-slate-400"
                  >
                    No suppliers found
                  </td>
                </tr>
              ) : (
                suppliers.map((s) => (
                  <tr
                    key={s._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {editingId === s._id ? (
                      <>
                        <td className="px-4 py-3">
                          <input
                            autoFocus
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            className="w-full px-2 py-1 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            value={editForm.contactPerson}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                contactPerson: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            value={editForm.phone}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                phone: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          {s.isActive ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase">
                              Active
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded uppercase">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-bold transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleEditSubmit(s._id)}
                            className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold transition-colors"
                          >
                            Save
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-bold text-slate-800">
                          {s.name}
                        </td>
                        <td className="px-4 py-3">{s.contactPerson || "-"}</td>
                        <td className="px-4 py-3">{s.phone || "-"}</td>
                        <td className="px-4 py-3 text-center">
                          {s.isActive ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase">
                              Active
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded uppercase">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(s)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleStatus(s)}
                            className={`p-1.5 rounded bg-white border transition-colors ${s.isActive ? "text-rose-500 hover:bg-rose-50 border-slate-200 hover:border-rose-200" : "text-emerald-600 hover:bg-emerald-50 border-slate-200 hover:border-emerald-200"}`}
                            title={s.isActive ? "Mark Inactive" : "Mark Active"}
                          >
                            {s.isActive ? (
                              <Ban className="w-3.5 h-3.5" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
