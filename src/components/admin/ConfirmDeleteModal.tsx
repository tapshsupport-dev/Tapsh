"use client";

import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  recordName: string;
  recordType?: string;
  warningMessage?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  title = "Delete Record Confirmation",
  recordName,
  recordType = "record",
  warningMessage,
  isDeleting = false,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-3xl border border-tapsh-charcoal/20 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="absolute top-5 right-5 p-2 text-tapsh-charcoal hover:text-tapsh-black rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon */}
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>

        {/* Header & Question */}
        <div>
          <h3 className="text-lg font-bold text-tapsh-black">
            {title}
          </h3>
          <p className="text-xs text-tapsh-charcoal mt-1">
            Are you sure you want to permanently delete this {recordType.toLowerCase()}?
          </p>
        </div>

        {/* Highlighted Record Card */}
        <div className="p-3.5 rounded-2xl bg-red-50/50 border border-red-200/60 text-xs">
          <span className="text-[10px] uppercase font-bold text-red-700 tracking-wider">
            Record To Delete
          </span>
          <p className="text-sm font-bold text-tapsh-black mt-0.5 truncate">
            {recordName}
          </p>
          {warningMessage && (
            <p className="text-[11px] text-red-600/90 mt-1 font-medium">
              {warningMessage}
            </p>
          )}
        </div>

        <p className="text-xs text-tapsh-charcoal font-medium">
          This record will be permanently erased from Firestore. This action cannot be reversed.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-tapsh-black font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            Cancel / Keep Record
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs hover:shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm & Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
