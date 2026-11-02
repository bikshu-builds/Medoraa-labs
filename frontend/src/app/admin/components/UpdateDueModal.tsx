"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Printer,
  QrCode,
  User,
  Phone,
  Calendar,
  Clock,
  ArrowRight,
  Receipt,
  Sparkles,
} from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface UpdateDueModalProps {
  record: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedRecord: any) => void;
  onPrintReceipt?: (record: any) => void;
  adminQrCode?: string;
}

export default function UpdateDueModal({
  record,
  isOpen,
  onClose,
  onSuccess,
  onPrintReceipt,
  adminQrCode,
}: UpdateDueModalProps) {
  const [amountToPay, setAmountToPay] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [customMethod, setCustomMethod] = useState<string>("");
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [showQr, setShowQr] = useState<boolean>(false);
  const [isDirectAdjustment, setIsDirectAdjustment] = useState<boolean>(false);
  const [directDueInput, setDirectDueInput] = useState<string>("");

  useEffect(() => {
    if (isOpen && record) {
      const total = record.billing?.totalAmount ?? record.totalAmount ?? 0;
      const paid = record.billing?.paidAmount ?? record.paidAmount ?? 0;
      const due = Math.max(0, total - paid);

      // Pre-fill amount to pay with the full remaining due by default
      setAmountToPay(due > 0 ? String(due) : "");
      setDirectDueInput(String(due));
      setPaymentMethod(record.paymentMethod || "Cash");
      setCustomMethod("");
      setPaymentNotes("");
      setErrorMsg("");
      setSuccessMsg("");
      setShowQr(false);
      setIsDirectAdjustment(false);
    }
  }, [isOpen, record]);

  if (!isOpen || !record) return null;

  const totalAmount = parseFloat(record.billing?.totalAmount ?? record.totalAmount ?? 0);
  const currentPaid = parseFloat(record.billing?.paidAmount ?? record.paidAmount ?? 0);
  const currentDue = Math.max(0, totalAmount - currentPaid);

  // Dynamic calculations based on mode
  let calculatedNewPaid = currentPaid;
  let calculatedRemainingDue = currentDue;

  if (isDirectAdjustment) {
    const desiredDue = Math.max(0, parseFloat(directDueInput) || 0);
    calculatedNewPaid = Math.max(0, totalAmount - desiredDue);
    calculatedRemainingDue = desiredDue;
  } else {
    const payNum = parseFloat(amountToPay) || 0;
    calculatedNewPaid = currentPaid + payNum;
    calculatedRemainingDue = Math.max(0, totalAmount - calculatedNewPaid);
  }

  const isFullyCleared = calculatedRemainingDue <= 0 && calculatedNewPaid >= totalAmount;

  const handleQuickPayFull = () => {
    setIsDirectAdjustment(false);
    setAmountToPay(String(currentDue));
  };

  const handleQuickPayAmount = (amt: number) => {
    setIsDirectAdjustment(false);
    setAmountToPay(String(Math.min(currentDue, amt)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const finalPaymentMethod =
      paymentMethod === "Other"
        ? customMethod.trim() || "Other"
        : paymentMethod;

    let payloadPaid = calculatedNewPaid;
    if (isNaN(payloadPaid) || payloadPaid < 0) {
      setErrorMsg("Please enter a valid payment amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(getApiUrl(`/api/admin/registrations/${record._id}/payment`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paidAmount: payloadPaid,
          paymentMethod: finalPaymentMethod,
          paymentNotes: paymentNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update payment");
      }

      setSuccessMsg("Payment and due amount updated successfully!");
      if (onSuccess) {
        onSuccess(data.data);
      }

      // Automatically close after a brief delay, or keep open if they want to print receipt
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error("Update due error:", err);
      setErrorMsg(err.message || "An error occurred while updating payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Frosted Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden z-10 flex flex-col my-auto transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#015971]/10 dark:bg-sky-500/20 text-[#015971] dark:text-sky-400 flex items-center justify-center flex-shrink-0 shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
                  Update Due Amount
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-extrabold text-[10px] uppercase tracking-wider">
                  Due: ₹{currentDue.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Collect payment &amp; clear pending balance for patient
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Patient Identity Strip */}
        <div className="px-5 py-3 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              {record.patientName}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold uppercase">
              {record.age?.value} {record.age?.type} • {record.gender}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
            <span>{record.registrationNumber}</span>
            {record.mobileNumber && (
              <span className="flex items-center gap-1 font-sans text-slate-600 dark:text-slate-300">
                <Phone className="w-3 h-3 text-slate-400" />
                {record.mobileNumber}
              </span>
            )}
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Three Summary Metric Boxes */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {/* Total Bill */}
            <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-center">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Total Bill
              </span>
              <span className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 block mt-0.5">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Paid So Far */}
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/50 text-center">
              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                Paid
              </span>
              <span className="text-sm sm:text-base font-black text-emerald-700 dark:text-emerald-300 block mt-0.5">
                ₹{currentPaid.toFixed(2)}
              </span>
            </div>

            {/* Current Due */}
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-800/50 text-center relative overflow-hidden">
              <span className="text-[10px] font-extrabold text-rose-500 dark:text-rose-400 uppercase tracking-wider block flex items-center justify-center gap-1">
                Current Due
              </span>
              <span className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-300 block mt-0.5">
                ₹{currentDue.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Quick Pay / Clear Full Due Button */}
          {currentDue > 0 && !isDirectAdjustment && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleQuickPayFull}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Collect Full Due (₹{currentDue.toFixed(0)})</span>
              </button>

              {currentDue > 500 && (
                <button
                  type="button"
                  onClick={() => handleQuickPayAmount(500)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
                >
                  +₹500
                </button>
              )}

              {currentDue > 1000 && (
                <button
                  type="button"
                  onClick={() => handleQuickPayAmount(1000)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
                >
                  +₹1,000
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsDirectAdjustment(true)}
                className="ml-auto text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Direct Due Adjustment &rarr;
              </button>
            </div>
          )}

          {isDirectAdjustment && (
            <div className="flex items-center justify-between text-xs bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-2.5 rounded-xl">
              <span className="text-amber-800 dark:text-amber-300 font-medium">
                Directly editing final due balance
              </span>
              <button
                type="button"
                onClick={() => setIsDirectAdjustment(false)}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Switch to Collect Payment
              </button>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between">
              <span>
                {isDirectAdjustment
                  ? "Set New Due Balance (₹)"
                  : "Amount Received / Collected Now (₹)"}
              </span>
              {!isDirectAdjustment && currentDue > 0 && (
                <span className="text-[11px] text-slate-400 font-normal">
                  Max Due: ₹{currentDue.toFixed(2)}
                </span>
              )}
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-base">
                ₹
              </div>
              {isDirectAdjustment ? (
                <input
                  type="number"
                  min="0"
                  max={totalAmount}
                  step="any"
                  value={directDueInput}
                  onChange={(e) => setDirectDueInput(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-rose-300 dark:border-rose-700 rounded-2xl text-base font-black text-rose-600 dark:text-rose-400 outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              ) : (
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amountToPay}
                  onChange={(e) => setAmountToPay(e.target.value)}
                  placeholder={currentDue > 0 ? currentDue.toFixed(2) : "0.00"}
                  autoFocus
                  className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-emerald-300 dark:border-emerald-700 rounded-2xl text-base font-black text-emerald-600 dark:text-emerald-400 outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              )}
            </div>
          </div>

          {/* Real-time Calculation Preview Card */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>New Total Paid:</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">
                ₹{calculatedNewPaid.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>Remaining Due:</span>
              <span
                className={`font-black ${
                  isFullyCleared
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                ₹{calculatedRemainingDue.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500">Updated Status:</span>
              <span
                className={`px-2 py-0.5 rounded font-black text-[10px] uppercase tracking-wider ${
                  isFullyCleared
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                    : calculatedNewPaid > 0
                    ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                    : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                }`}
              >
                {isFullyCleared
                  ? "PAID (Fully Cleared)"
                  : calculatedNewPaid > 0
                  ? "PARTIAL"
                  : "PENDING"}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
              Payment Method
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {["Cash", "UPI", "Card", "Net Banking", "Other"].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                    paymentMethod === method
                      ? "bg-[#015971] text-white border-[#015971] shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            {paymentMethod === "Other" && (
              <input
                type="text"
                placeholder="Specify payment method (e.g., Cheque, Insurance)..."
                value={customMethod}
                onChange={(e) => setCustomMethod(e.target.value)}
                className="w-full mt-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-blue-500"
              />
            )}

            {paymentMethod === "UPI" && adminQrCode && (
              <div className="mt-2 p-2.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4" /> Lab UPI QR Code available
                </span>
                <button
                  type="button"
                  onClick={() => setShowQr(!showQr)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {showQr ? "Hide QR" : "Show QR"}
                </button>
              </div>
            )}

            {showQr && adminQrCode && (
              <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2">
                <img
                  src={adminQrCode}
                  alt="UPI QR Code"
                  className="w-36 h-36 object-contain rounded-xl border border-slate-100 shadow-sm"
                />
                <span className="text-[10px] text-slate-400 font-semibold">
                  Scan with any UPI App (GPay, PhonePe, Paytm)
                </span>
              </div>
            )}
          </div>

          {/* Payment Notes / Transaction Reference */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
              Reference / Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Paid via PhonePe, UTR #40291..., Counter 1"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            {onPrintReceipt && (
              <button
                type="button"
                onClick={() => onPrintReceipt(record)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                title="Print current receipt"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Receipt</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#015971] hover:bg-[#01475a] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save &amp; Update Due</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

