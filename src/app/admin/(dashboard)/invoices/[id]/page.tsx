"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Printer, Download, ArrowLeft, CheckCircle2, Building2, 
  Pencil, Trash2, X, Save, Loader2, Sparkles, Clock 
} from "lucide-react";
import { Invoice, Customer, InvoiceItem } from "@/lib/data";
import { 
  getInvoiceById, getCustomerById, updateInvoice, deleteInvoice 
} from "@/lib/firestoreService";
import { downloadInvoicePdf } from "@/lib/invoicePdf";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editStatus, setEditStatus] = useState<"PAID" | "PARTIAL" | "PENDING">("PAID");
  const [editAmountPaid, setEditAmountPaid] = useState(0);
  const [editTapshHubUsed, setEditTapshHubUsed] = useState(true);
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      const inv = await getInvoiceById(id);
      if (inv) {
        setInvoice(inv);
        setEditStatus(inv.status === "OVERDUE" ? "PENDING" : inv.status);
        setEditAmountPaid(inv.amountPaid || 0);
        setEditTapshHubUsed(inv.tapshHubUsed ?? true);
        setEditNotes(inv.notes || "");

        if (inv.customerId) {
          const cust = await getCustomerById(inv.customerId);
          setCustomer(cust);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  const showNotification = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!invoice) return;
    downloadInvoicePdf(invoice, customer);
  };

  const handleDelete = async () => {
    if (!invoice) return;
    if (!window.confirm(`Are you sure you want to permanently delete Tax Invoice "${invoice.invoiceNumber}"?`)) return;

    try {
      await deleteInvoice(invoice.id);
      router.push("/admin/invoices");
    } catch {
      router.push("/admin/invoices");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    setSavingEdit(true);

    try {
      const updatedData: Partial<Invoice> = {
        status: editStatus,
        amountPaid: editStatus === "PAID" ? invoice.total : editAmountPaid,
        tapshHubUsed: editTapshHubUsed,
        notes: editNotes
      };

      await updateInvoice(invoice.id, updatedData);
      setInvoice({ ...invoice, ...updatedData });
      setShowEditModal(false);
      showNotification("Tax Invoice updated successfully.");
    } catch {
      alert("Failed to update invoice.");
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-tapsh-soft-green animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-tapsh-charcoal">
            Loading Tax Invoice...
          </p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-tapsh-charcoal/20 text-center max-w-md mx-auto my-12">
        <h2 className="text-xl font-bold text-tapsh-black mb-2">Invoice Not Found</h2>
        <p className="text-sm text-tapsh-charcoal mb-6">The requested tax invoice could not be located in Firestore.</p>
        <Link href="/admin/invoices" className="px-6 py-3 bg-tapsh-black text-tapsh-beige font-bold text-sm rounded-xl inline-block">
          &larr; Return to Invoices
        </Link>
      </div>
    );
  }

  const clientName = invoice.customerDetails?.businessName || customer?.businessName || invoice.customerName || "Enterprise Account";
  const contactPerson = invoice.customerDetails?.contactPerson || customer?.contactPerson || "Primary Contact";
  const address = invoice.customerDetails?.address || customer?.address || "Commercial Premises";
  const city = invoice.customerDetails?.city || customer?.city || "India";
  const phone = invoice.customerDetails?.phone || customer?.phone || "+91 99000 00000";
  const email = invoice.customerDetails?.email || customer?.email || "billing@client.com";
  const balanceDue = invoice.total - invoice.amountPaid;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300 print-container">
      
      {/* Top Header & Actions (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <Link 
          href="/admin/invoices" 
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-tapsh-charcoal hover:text-tapsh-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </Link>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleDownload}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#FAF8F5] border border-tapsh-charcoal/20 text-tapsh-black rounded-xl text-xs font-bold hover:border-tapsh-soft-green shadow-xs active:scale-95 transition-all cursor-pointer"
            title="Download PDF File"
          >
            <Download className="w-4 h-4 text-tapsh-soft-green" /> Download PDF
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-tapsh-soft-green text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-xs active:scale-95 transition-all cursor-pointer"
            title="Print to connected printer or AirPrint"
          >
            <Printer className="w-4 h-4" /> Print Invoice
          </button>

          <button
            onClick={() => setShowEditModal(true)}
            className="p-2.5 bg-tapsh-pale-blue border border-tapsh-charcoal/20 text-tapsh-black rounded-xl text-xs font-bold hover:bg-tapsh-charcoal/10 active:scale-95 transition-all cursor-pointer"
            title="Edit Status & Notes"
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            onClick={handleDelete}
            className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 active:scale-95 transition-all cursor-pointer"
            title="Delete Invoice"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification */}
      {feedbackMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in no-print">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Main Printable Tax Invoice Receipt Card */}
      <div className="bg-white rounded-3xl shadow-xs border border-tapsh-charcoal/15 p-5 sm:p-10 relative overflow-hidden print-card">
        
        {/* Top Accent Strip */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-tapsh-soft-green via-tapsh-beige to-tapsh-taupe"></div>

        {/* Invoice Title & Business Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-tapsh-charcoal/15 pb-8 mb-8 pt-2">
          <div>
            <span className="text-2xl sm:text-3xl font-bold tracking-widest text-tapsh-black">TAPSH</span>
            <p className="text-xs text-tapsh-soft-green font-bold uppercase tracking-widest mt-0.5">
              Tap. Connect. Grow.
            </p>
            <div className="mt-3 text-xs text-tapsh-charcoal space-y-0.5 font-medium">
              <p className="font-bold text-tapsh-black">TAPSH Technologies Private Limited</p>
              <p>GSTIN: 29AAACT9812M1Z5</p>
              <p>Email: tapsh.support@gmail.com • WhatsApp: +91 7977469926</p>
              <p>Location: Kanyakumari, Tamil Nadu, India</p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-[#FAF8F5] sm:bg-transparent p-4 sm:p-0 rounded-2xl w-full sm:w-auto border sm:border-0 border-tapsh-charcoal/10">
            <h1 className="text-lg font-bold text-tapsh-black uppercase tracking-wider">
              Tax Invoice
            </h1>
            <p className="font-mono text-xs sm:text-sm font-bold text-tapsh-black mt-1">
              {invoice.invoiceNumber}
            </p>
            <div className="mt-2 text-xs text-tapsh-charcoal space-y-0.5">
              <p>Date: <strong className="text-tapsh-black">{new Date(invoice.date).toLocaleDateString()}</strong></p>
              <p>Due: <strong className="text-tapsh-black">{new Date(invoice.dueDate).toLocaleDateString()}</strong></p>
              
              <div className="flex items-center sm:justify-end gap-2 mt-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  invoice.status === "PAID" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  invoice.status === "PARTIAL" ? "bg-blue-50 text-blue-700 border-blue-200" :
                  "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  STATUS: {invoice.status}
                </span>

                {/* Tapsh Hub used Badge */}
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  invoice.tapshHubUsed
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-gray-100 text-gray-700 border-gray-200"
                }`}>
                  Hub Used: {invoice.tapshHubUsed ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Billed To Client */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/10">
          <p className="text-[10px] font-bold uppercase tracking-wider text-tapsh-charcoal mb-1">
            Billed Client (Customer)
          </p>
          <h2 className="text-base sm:text-lg font-bold text-tapsh-black">
            {clientName}
          </h2>
          <div className="text-xs text-tapsh-charcoal mt-1 space-y-0.5 font-medium">
            <p>Attn: {contactPerson}</p>
            <p>{address}, {city}</p>
            <p>Phone: {phone} • Email: {email}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8 border border-tapsh-charcoal/15 rounded-2xl overflow-hidden">
          <div className="bg-[#FAF8F5] px-4 py-3 border-b border-tapsh-charcoal/15 flex justify-between text-[11px] font-bold uppercase tracking-wider text-tapsh-charcoal">
            <span>Item Description</span>
            <span>Total</span>
          </div>

          <div className="divide-y divide-tapsh-charcoal/10">
            {invoice.items.map((item, idx) => (
              <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-tapsh-black">
                    {item.productName}
                  </p>
                  <p className="text-[11px] text-tapsh-charcoal mt-0.5">
                    Qty: <strong className="text-tapsh-black">{item.quantity}</strong> × ₹{item.unitPrice.toLocaleString()}
                  </p>
                </div>
                <div className="text-right font-bold text-xs sm:text-sm text-tapsh-black">
                  ₹{item.total.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals & Tax Calculation Breakdown */}
        <div className="flex flex-col sm:flex-row justify-between gap-6">
          
          {/* Left: Payment Instructions */}
          <div className="text-xs text-tapsh-charcoal space-y-1.5 flex-1">
            <p className="font-bold uppercase text-[10px] text-tapsh-black tracking-wider">Payment Instructions & Banking</p>
            <p>Direct UPI VPA: <span className="font-mono font-bold text-tapsh-black">tapsh@upi</span></p>
            <p>Bank: HDFC Bank Ltd. (Commercial Branch)</p>
            <p>A/C: 50200088192831 • IFSC: HDFC0000128</p>
            {invoice.notes && (
              <p className="pt-2 italic text-tapsh-black/80">
                <strong>Notes:</strong> {invoice.notes}
              </p>
            )}
          </div>

          {/* Right: Tax Calculation */}
          <div className="w-full sm:w-64 space-y-2 p-4 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/10 text-xs">
            <div className="flex justify-between text-tapsh-charcoal">
              <span>Subtotal:</span>
              <span className="font-bold text-tapsh-black">₹{invoice.subtotal.toLocaleString()}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Discount:</span>
                <span>-₹{invoice.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-tapsh-charcoal">
              <span>18% GST (9% CGST + 9% SGST):</span>
              <span className="font-bold text-tapsh-black">₹{invoice.taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-tapsh-black border-t border-tapsh-charcoal/15 pt-2">
              <span>Total:</span>
              <span>₹{invoice.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Paid:</span>
              <span>₹{invoice.amountPaid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-red-600 border-t border-tapsh-charcoal/15 pt-2">
              <span>Balance Due:</span>
              <span>₹{Math.max(0, balanceDue).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Printable Footer Notice */}
        <div className="mt-8 pt-4 border-t border-tapsh-charcoal/10 text-center text-[10px] text-tapsh-charcoal">
          Thank you for choosing TAPSH. This is an authenticated computer-generated commercial tax invoice.
        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* EDIT INVOICE MODAL */}
      {/* ---------------------------------------------------- */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 no-print">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-tapsh-charcoal/10 flex items-center justify-between bg-[#FAF8F5]">
              <h3 className="font-bold text-base text-tapsh-black flex items-center gap-2">
                <Pencil className="w-4 h-4 text-tapsh-soft-green" /> Edit Invoice Status & Details
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-full hover:bg-tapsh-charcoal/10 text-tapsh-charcoal transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              
              {/* Tapsh Hub Used */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5">
                  Tapsh Hub Used : Yes / No
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditTapshHubUsed(true)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      editTapshHubUsed
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white border border-tapsh-charcoal/20 text-tapsh-charcoal"
                    }`}
                  >
                    Yes (Hub Deployed)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTapshHubUsed(false)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      !editTapshHubUsed
                        ? "bg-tapsh-black text-white shadow-xs"
                        : "bg-white border border-tapsh-charcoal/20 text-tapsh-charcoal"
                    }`}
                  >
                    No (Hardware Only)
                  </button>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5">
                  Payment Status
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["PAID", "PARTIAL", "PENDING"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditStatus(st)}
                      className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        editStatus === st
                          ? st === "PAID" ? "bg-emerald-600 text-white shadow-xs" :
                            st === "PARTIAL" ? "bg-blue-600 text-white shadow-xs" :
                            "bg-amber-600 text-white shadow-xs"
                          : "bg-white border border-tapsh-charcoal/20 text-tapsh-charcoal"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Paid */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5">
                  Amount Paid (INR)
                </label>
                <input
                  type="number"
                  min="0"
                  max={invoice.total}
                  value={editAmountPaid}
                  onChange={(e) => setEditAmountPaid(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm font-bold focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5">
                  Notes
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-xs focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                />
              </div>

              <div className="pt-3 border-t border-tapsh-charcoal/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-tapsh-charcoal hover:bg-tapsh-charcoal/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-tapsh-soft-green text-white hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
