"use client";

import React, { useState, useEffect } from "react";
import { getApiUrl } from "@/lib/api";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Search,
  Plus,
  Filter,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AddTransactionModal from "./components/AddTransactionModal";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";

export default function FinanceDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    revenue: 0,
    expenses: 0,
    net: 0,
    pending: 0,
    revenueBreakdown: {},
    expenseBreakdown: {},
  });
  const [transactions, setTransactions] = useState<any[]>([]);

  // Filters
  const [dateRange, setDateRange] = useState("this_month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Modals
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      let dateQuery = "";

      const now = new Date();
      let start, end;

      if (dateRange === "today") {
        start = new Date(now.setHours(0, 0, 0, 0));
      } else if (dateRange === "this_week") {
        const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
        start = new Date(firstDay.setHours(0, 0, 0, 0));
      } else if (dateRange === "this_month") {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (dateRange === "last_month") {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      } else if (dateRange === "this_year") {
        start = new Date(now.getFullYear(), 0, 1);
      } else if (dateRange === "custom" && customStartDate && customEndDate) {
        start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
      }

      if (start) dateQuery += `startDate=${start.toISOString()}&`;
      if (end) dateQuery += `endDate=${end.toISOString()}&`;
      if (searchQuery) dateQuery += `search=${searchQuery}&`;

      // We pass the type parameter to getTransactions ONLY if it isn't ALL
      if (typeFilter !== "ALL") dateQuery += `type=${typeFilter}&`;

      // Fetch Summary
      const summaryRes = await fetch(
        getApiUrl(`/api/admin/finance/summary?${dateQuery}`),
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const summaryData = await summaryRes.json();
      if (summaryData.success) {
        setSummary(summaryData.data);
      }

      // Fetch Transactions
      const txRes = await fetch(
        getApiUrl(`/api/admin/finance/transactions?${dateQuery}`),
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const txData = await txRes.json();
      if (txData.success) {
        setTransactions(txData.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Prevent fetching if custom range is selected but dates are incomplete
    if (dateRange === "custom" && (!customStartDate || !customEndDate)) return;

    const delay = setTimeout(() => {
      fetchFinanceData();
    }, 400);
    return () => clearTimeout(delay);
  }, [dateRange, searchQuery, typeFilter, customStartDate, customEndDate]);

  const handleExportXLSX = () => {
    if (transactions.length === 0) return;
    const exportData = transactions.map((tx) => ({
      Date: new Date(tx.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      Description: tx.description,
      Category: tx.category,
      Type: tx.type,
      "Amount (INR)": tx.amount,
      Source: tx.source,
      "Reference Number": tx.referenceNumber || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger");
    XLSX.writeFile(workbook, `Finance_Ledger_${new Date().getTime()}.xlsx`);
  };

  // Breakdown Visualizer Helper Component
  const CategoryBars = ({
    data,
    total,
    colorClass,
  }: {
    data: Record<string, number>;
    total: number;
    colorClass: string;
  }) => {
    if (!data || Object.keys(data).length === 0 || total === 0) {
      return (
        <div className="text-[11px] text-slate-400 font-medium py-2">
          No category data available.
        </div>
      );
    }
    return (
      <div className="space-y-3 mt-3">
        {Object.entries(data)
          .sort((a, b) => b[1] - a[1])
          .map(([name, val]) => (
            <div key={name} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                <span>{name}</span>
                <span>
                  ₹{val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    colorClass,
                  )}
                  style={{
                    width: `${Math.min(100, Math.max(0, (val / total) * 100))}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">
              Finance
            </h1>
            <p className="text-[11.5px] font-semibold text-slate-500 mt-0.5">
              Track income, expenses and financial activity.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md py-1.5 px-3 shadow-sm mr-2">
              <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                Period
              </span>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="text-[11px] font-bold text-slate-700 bg-transparent uppercase tracking-wider focus:outline-none cursor-pointer"
              >
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="this_year">This Year</option>
                <option value="custom">Custom</option>
              </select>
              {dateRange === "custom" && (
                <div className="flex items-center gap-2 ml-2 border-l border-slate-200 pl-3">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="text-[11px] font-bold text-slate-700 bg-transparent focus:outline-none"
                  />
                  <span className="text-slate-400 text-[9px] font-black uppercase">
                    to
                  </span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="text-[11px] font-bold text-slate-700 bg-transparent focus:outline-none"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleExportXLSX}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md font-bold text-[11px] uppercase tracking-widest transition-colors w-full sm:w-auto"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <button
              onClick={() => setIsAddTransactionOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold text-[11px] uppercase tracking-widest shadow-sm transition-colors w-full sm:w-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Transaction
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6 space-y-6">
        {/* Ultra-Compact Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[90px]">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{" "}
                Revenue
              </p>
              <ArrowUpRight className="w-4 h-4 text-emerald-600 opacity-80" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-2 tracking-tight">
              ₹
              {summary.revenue.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </h3>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[90px]">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>{" "}
                Expenses
              </p>
              <ArrowDownRight className="w-4 h-4 text-rose-600 opacity-80" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-2 tracking-tight">
              ₹
              {summary.expenses.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </h3>
          </div>

          <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[90px] ring-1 ring-indigo-50">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black tracking-widest text-indigo-500 uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>{" "}
                Net Margin
              </p>
              <Wallet className="w-4 h-4 text-indigo-600 opacity-80" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-2 tracking-tight">
              ₹
              {summary.net.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </h3>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[90px]">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>{" "}
                Pending Due
              </p>
              <Clock className="w-4 h-4 text-amber-600 opacity-80" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-2 tracking-tight">
              ₹
              {summary.pending.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </h3>
          </div>
        </div>

        {/* Two-Column Middle Section: Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-sm"></div> Income
              by Category
            </h3>
            <CategoryBars
              data={summary.revenueBreakdown}
              total={summary.revenue}
              colorClass="bg-emerald-500"
            />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-rose-500 rounded-sm"></div> Expenses by
              Category
            </h3>
            <CategoryBars
              data={summary.expenseBreakdown}
              total={summary.expenses}
              colorClass="bg-rose-500"
            />
          </div>
        </div>

        {/* Transactions Layer */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">
              Recent Transactions
            </h2>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 w-full text-[11px] font-bold bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-[11px] py-1.5 px-3 font-bold text-slate-600 bg-white border border-slate-200 rounded-md uppercase tracking-wider focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 whitespace-nowrap">
              <thead className="text-[10px] text-slate-400 uppercase bg-slate-50 font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 font-black">Date</th>
                  <th className="px-5 py-3 font-black">Description & Source</th>
                  <th className="px-5 py-3 font-black">Category</th>
                  <th className="px-5 py-3 font-black">Type</th>
                  <th className="px-5 py-3 text-right font-black">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest"
                    >
                      Compiling ledgers...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-16 text-center text-slate-400 shadow-inner bg-slate-50/50"
                    >
                      <p className="text-xs font-semibold mb-2">
                        No transactions yet
                      </p>
                      <button
                        onClick={() => setIsAddTransactionOpen(true)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest mt-1"
                      >
                        + Add Transaction
                      </button>
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-5 py-2.5 font-medium">
                        {new Date(tx.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">
                            {tx.description}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                            {tx.source === "PATIENT_BILLING"
                              ? "Patient Billing"
                              : tx.source === "DOCTOR_PAYMENT"
                                ? "Doctor Referral"
                                : tx.source === "INVENTORY"
                                  ? "Inventory"
                                  : "Manual Entry"}
                            {tx.referenceNumber &&
                              tx.referenceNumber !== "-" &&
                              ` • Ref: ${tx.referenceNumber}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-2.5">
                        <span className="font-semibold text-slate-600">
                          {tx.category}
                        </span>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-1.5">
                          {tx.type === "INCOME" ? (
                            <>
                              <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                                Income
                              </span>
                            </>
                          ) : (
                            <>
                              <ArrowDownRight className="w-3 h-3 text-rose-500" />
                              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">
                                Expense
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <div
                          className={cn(
                            "font-bold text-sm tracking-tight",
                            tx.type === "INCOME"
                              ? "text-emerald-700"
                              : "text-rose-700",
                          )}
                        >
                          {tx.type === "INCOME" ? "+" : "−"} ₹
                          {tx.amount.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddTransactionModal
        isOpen={isAddTransactionOpen}
        onClose={() => setIsAddTransactionOpen(false)}
        onSuccess={() => {
          setIsAddTransactionOpen(false);
          fetchFinanceData();
        }}
      />
    </div>
  );
}
