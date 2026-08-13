"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";
import {
  Plus,
  PackagePlus,
  Search,
  Pencil,
  Eye,
  AlertCircle,
  CheckCircle2,
  Box,
  ArchiveRestore,
  Clock,
  PackageOpen,
  Package,
  Trash,
  Ban,
} from "lucide-react";
import AddProductModal from "./components/AddProductModal";
import EditProductModal from "./components/EditProductModal";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [summary, setSummary] = useState({
    total: 0,
    totalStock: 0,
    lowStock: 0,
    expiringSoon: 0,
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const url = getApiUrl(
        `/api/admin/inventory/products${search ? `?search=${search}` : ""}`,
      );
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);

        // Calculate summary only on non-searched fetch to be accurate, or just from current view
        if (!search) {
          let tStock = 0;
          let lStock = 0;
          let expSoon = 0;
          data.data.forEach((p: any) => {
            tStock += p.totalStock;
            if (p.status === "LOW STOCK" || p.status === "OUT OF STOCK")
              lStock++;
            if (p.status === "EXPIRING SOON") expSoon++;
          });
          setSummary({
            total: data.data.length,
            totalStock: tStock,
            lowStock: lStock,
            expiringSoon: expSoon,
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to completely delete this product and all its stock batches? This action cannot be undone.",
      )
    )
      return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        getApiUrl(`/api/admin/inventory/products/${id}`),
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (product: any) => {
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
            isActive: product.isActive === false ? true : false,
          }),
        },
      );
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportXLSX = () => {
    if (products.length === 0) return;
    const exportData = products.map((p) => ({
      "Product Name": p.name,
      "Product Code": p.productCode,
      Category: p.category,
      "Item Type": p.itemType,
      "Initial Stock (Total)": p.totalStock,
      Unit: p.unit,
      Status: p.status,
      Active: p.isActive ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, `Inventory_Products_${new Date().getTime()}.xlsx`);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig: Record<
      string,
      { bg: string; text: string; dot: string }
    > = {
      "IN STOCK": {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
      },
      "LOW STOCK": {
        bg: "bg-amber-50",
        text: "text-amber-700",
        dot: "bg-amber-500",
      },
      "OUT OF STOCK": {
        bg: "bg-rose-50",
        text: "text-rose-700",
        dot: "bg-rose-500",
      },
      "EXPIRING SOON": {
        bg: "bg-orange-50",
        text: "text-orange-700",
        dot: "bg-orange-500",
      },
      EXPIRED: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
      INACTIVE: {
        bg: "bg-slate-100",
        text: "text-slate-500",
        dot: "bg-slate-400",
      },
    };

    const config = statusConfig[status] || statusConfig["IN STOCK"];

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide border border-black/5",
          config.bg,
          config.text,
        )}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)}></span>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <PackageOpen className="w-6 h-6 text-indigo-600" />
              Inventory Management
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Manage laboratory products, stock, and suppliers.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleExportXLSX}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg font-bold text-[11px] uppercase tracking-widest shadow-sm transition-colors mt-2 md:mt-0"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <Link
              href="/admin/inventory/suppliers"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-bold text-[11px] uppercase tracking-widest shadow-sm transition-colors mt-2 md:mt-0"
            >
              Manage Suppliers
            </Link>
            <Link
              href="/admin/inventory/mappings"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-bold text-[11px] uppercase tracking-widest shadow-sm transition-colors mt-2 md:mt-0"
            >
              Auto-Deductions
            </Link>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] uppercase tracking-widest shadow-sm transition-colors mt-2 md:mt-0"
            >
              <PackagePlus className="w-4 h-4" />
              Add Inventory
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
              <Box className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Products
              </p>
              <h3 className="text-xl font-black text-slate-900">
                {summary.total}
              </h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <ArchiveRestore className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Stock
              </p>
              <h3 className="text-xl font-black text-slate-900">
                {summary.totalStock.toLocaleString()}
              </h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Low Stock
              </p>
              <h3 className="text-xl font-black text-slate-900">
                {summary.lowStock}
              </h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Expiring
              </p>
              <h3 className="text-xl font-black text-slate-900">
                {summary.expiringSoon}
              </h3>
            </div>
          </div>
        </div>

        {/* Master Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-800">
              Inventory Catalog
            </h2>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products, codes..."
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
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 min-w-[140px]">
                    Supplier / primary
                  </th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Expiry</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-medium">
                          Loading inventory...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="max-w-xs mx-auto flex flex-col items-center justify-center text-slate-400">
                        <Package className="w-12 h-12 mb-3 text-slate-300 stroke-[1.5]" />
                        <h4 className="text-sm font-bold text-slate-700 mb-1">
                          No products found
                        </h4>
                        <p className="text-xs mb-4">
                          Add your first laboratory product to start managing
                          stock.
                        </p>
                        <button
                          onClick={() => setIsAddModalOpen(true)}
                          className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          + Add Inventory
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">
                            {product.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono tracking-tight">
                            {product.productCode}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="flex flex-col">
                          {product.primaryBatch?.supplierId?.name ||
                            "Multiple / Unspecified"}
                          <span className="text-[10px] text-slate-400">
                            {product.batchCount} batch
                            {product.batchCount !== 1 ? "es" : ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700">
                            {product.totalStock.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase">
                            {product.unit}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 font-medium">
                        {product.primaryBatch?.expiryDate
                          ? new Date(
                              product.primaryBatch.expiryDate,
                            ).toLocaleDateString("en-GB", {
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={
                            product.isActive === false
                              ? "INACTIVE"
                              : product.status
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-right flex items-center justify-end gap-1.5 h-full mt-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Edit Product"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(product)}
                          className={`p-1.5 rounded transition-colors ${product.isActive === false ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-400 hover:text-rose-500 hover:bg-rose-50"}`}
                          title={
                            product.isActive === false
                              ? "Mark Active"
                              : "Mark Inactive"
                          }
                        >
                          {product.isActive === false ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Ban className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Product completely"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/admin/inventory/${product._id}`}
                          className="inline-flex items-center justify-center p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchProducts();
        }}
      />

      <EditProductModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        product={editingProduct}
        onSuccess={() => {
          setEditingProduct(null);
          fetchProducts();
        }}
      />
    </div>
  );
}
