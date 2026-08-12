"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  PackageOpen,
  Plus,
  ArchiveRestore,
  Clock,
  Activity,
  AlertCircle,
  Pencil,
  Trash,
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import AddStockModal from "../components/AddStockModal";
import EditProductModal from "../components/EditProductModal";
import EditBatchModal from "../components/EditBatchModal";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingBatch, setEditingBatch] = useState<any>(null);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        getApiUrl(`/api/admin/inventory/products/${id}`),
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        setProduct(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleDeleteBatch = async (batchId: string) => {
    if (
      !confirm(
        "Are you sure you want to completely delete this batch (and all remaining quantities within it)?",
      )
    )
      return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        getApiUrl(
          `/api/admin/inventory/products/${product._id}/batches/${batchId}`,
        ),
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) fetchProduct();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold">Loading product...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <h2 className="text-lg font-bold text-slate-800">Product not found</h2>
        <Link
          href="/admin/inventory"
          className="text-sm text-indigo-600 hover:underline"
        >
          Return to Inventory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link
            href="/admin/inventory"
            className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800 mb-2"
          >
            <ArrowLeft className="w-3 h-3 mr-1" /> Back to Inventory
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <PackageOpen className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 leading-none">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-mono tracking-tight text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {product.productCode}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                      {product.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsAddStockOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Stock
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-6 space-y-6">
        {/* Top Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
              <ArchiveRestore className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Total Stock
              </p>
              <h3 className="text-xl font-black text-slate-900 border-b-2 border-indigo-200 inline-block">
                {product.totalStock.toLocaleString()}{" "}
                <span className="text-[11px] text-slate-400 ml-0.5 uppercase">
                  {product.unit}
                </span>
              </h3>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <PackageOpen className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Batches
              </p>
              <h3 className="text-xl font-black text-slate-900">
                {product.batches?.length || 0}
              </h3>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Min Stock
              </p>
              <h3 className="text-xl font-black text-slate-900">
                {product.minimumStock}
              </h3>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                First Expiry
              </p>
              <div className="text-sm font-black text-slate-900 mt-1 truncate">
                {product.batches?.[0]?.expiryDate
                  ? new Date(product.batches[0].expiryDate).toLocaleDateString(
                      "en-GB",
                    )
                  : "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Info & Batches Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Details Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                  Master Details
                </h3>
                <button
                  onClick={() => setEditingProduct(product)}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors uppercase"
                >
                  <Pencil className="w-3 h-3" /> Edit Profile
                </button>
              </div>
              <div className="p-4 space-y-4 text-sm">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Type
                  </span>
                  <span className="font-semibold text-slate-700">
                    {product.itemType}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Reorder Level
                  </span>
                  <span className="font-semibold text-slate-700">
                    {product.reorderLevel}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Description
                  </span>
                  <span className="text-slate-600 leading-relaxed">
                    {product.description || "No description provided."}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Batches Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                  Stock Batches
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/80 font-bold border-b border-slate-100 tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Batch No.</th>
                      <th className="px-4 py-3">Supplier</th>
                      <th className="px-4 py-3 text-right">Available Qty</th>
                      <th className="px-4 py-3 text-right">Unit Cost</th>
                      <th className="px-4 py-3">Expiry</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {product.batches?.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-slate-400 text-sm"
                        >
                          No batches found for this product.
                        </td>
                      </tr>
                    ) : (
                      product.batches?.map((batch: any) => {
                        const isExpired =
                          batch.expiryDate &&
                          new Date(batch.expiryDate) < new Date();
                        return (
                          <tr
                            key={batch._id}
                            className={cn(
                              "hover:bg-slate-50 transition-colors",
                              isExpired ? "bg-rose-50/30" : "",
                            )}
                          >
                            <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">
                              {batch.batchNumber}
                            </td>
                            <td className="px-4 py-3 text-xs font-semibold text-slate-600">
                              {batch.supplierId?.name || "-"}
                            </td>
                            <td className="px-4 py-3 text-right font-black text-indigo-700">
                              {batch.availableQuantity.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right text-xs">
                              ₹{batch.unitCost?.toFixed(2) || "0.00"}
                            </td>
                            <td className="px-4 py-3 text-xs">
                              {isExpired ? (
                                <span className="text-rose-600 font-bold">
                                  Expired
                                </span>
                              ) : batch.expiryDate ? (
                                new Date(batch.expiryDate).toLocaleDateString(
                                  "en-GB",
                                )
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="px-4 py-3 text-right flex justify-end gap-1.5 h-full mt-2">
                              <button
                                onClick={() => setEditingBatch(batch)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                title="Edit Batch"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBatch(batch._id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete Batch"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddStockModal
        isOpen={isAddStockOpen}
        onClose={() => setIsAddStockOpen(false)}
        productId={id as string}
        onSuccess={() => {
          setIsAddStockOpen(false);
          fetchProduct();
        }}
      />

      <EditProductModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        product={editingProduct}
        onSuccess={() => {
          setEditingProduct(null);
          fetchProduct();
        }}
      />

      <EditBatchModal
        isOpen={!!editingBatch}
        onClose={() => setEditingBatch(null)}
        productId={id as string}
        batch={editingBatch}
        onSuccess={() => {
          setEditingBatch(null);
          fetchProduct();
        }}
      />
    </div>
  );
}
