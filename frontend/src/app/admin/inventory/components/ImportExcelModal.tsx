import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  X,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ImportExcelModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportExcelModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    if (!selectedFile.name.endsWith(".xlsx")) {
      setError("Please select a valid Excel (.xlsx) file.");
      setFile(null);
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File exceeds 5MB size limit.");
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        getApiUrl("/api/admin/inventory/import/validate"),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }

      // Redirect to Draft Review
      const batchId = data.data.batchId;
      resetState();
      onClose();
      router.push(`/admin/inventory/imports/${batchId}`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(getApiUrl("/api/admin/inventory/template"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Medoraa_Labs_Inventory_Template.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download template", error);
      setError("Failed to download template.");
    }
  };

  const resetState = () => {
    setFile(null);
    setError(null);
    setIsUploading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right-8 duration-300">
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-2 rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase">
              Import Inventory
            </h2>
          </div>
          <button
            onClick={() => {
              resetState();
              onClose();
            }}
            className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 p-2 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 flex-1 flex flex-col">
          {error && (
            <div className="mb-4 flex gap-2 items-start bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs leading-5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <div
            className={cn(
              "border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 text-center transition-colors cursor-pointer group mb-6",
              isDragActive
                ? "border-indigo-500 bg-indigo-50/50"
                : file
                  ? "border-emerald-300 bg-emerald-50/20"
                  : "border-slate-200 bg-slate-50 hover:border-indigo-400 hover:bg-slate-50/80",
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".xlsx"
              onChange={handleFileSelect}
            />

            {file ? (
              <div className="flex flex-col items-center">
                <div className="bg-emerald-100/50 p-3 rounded-full mb-3 shadow-sm border border-emerald-200">
                  <FileText className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-slate-700 max-w-[200px] truncate">
                  {file.name}
                </p>
                <p className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                  {(file.size / 1024).toFixed(1)} KB • Ready to upload
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="mt-4 text-xs font-bold text-rose-600 hover:text-rose-700"
                >
                  Remove File
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="bg-white p-3 rounded-full shadow-sm border border-slate-100 mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8 text-indigo-500" />
                </div>
                <span className="text-sm font-bold text-slate-700">
                  Click or drag Excel file here
                </span>
                <span className="text-xs font-medium text-slate-400 mt-1">
                  Max size: 5MB (.xlsx only)
                </span>
              </div>
            )}
          </div>

          <div className="mt-auto bg-slate-50 rounded-xl p-5 border border-slate-100">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">
              Don't have the template?
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Download the official Medoraa Inventory Import Excel template to
              ensure your products and stock are formatted correctly.
            </p>
            <button
              onClick={downloadTemplate}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors w-full bg-white border border-indigo-100 py-2.5 rounded-lg hover:bg-indigo-50"
            >
              Download .xlsx Template
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold tracking-wide py-3.5 px-4 rounded-xl shadow-sm hover:bg-indigo-700 hover:shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                UPLOADING...
              </>
            ) : (
              "UPLOAD & REVIEW"
            )}
          </button>
          <p className="text-center text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-3">
            Items remain as DRAFT until confirmed
          </p>
        </div>
      </div>
    </div>
  );
}
