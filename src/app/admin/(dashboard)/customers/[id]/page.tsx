"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Phone, Mail, MapPin, ExternalLink, 
  Pencil, Trash2, X, Save, CheckCircle2, Receipt, Clock, Sparkles, Building2,
  Loader2, User, FileText
} from "lucide-react";
import { Customer, Hub, mockInvoices, mockAuditLogs } from "@/lib/data";
import { 
  getCustomerById, getHubByCustomerId, updateCustomer, deleteCustomer 
} from "@/lib/firestoreService";

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [hub, setHub] = useState<Hub | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    businessName: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    businessType: "Resort / Hotel" as any,
    notes: ""
  });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function loadData() {
      setLoading(true);
      const [c, h] = await Promise.all([
        getCustomerById(id),
        getHubByCustomerId(id)
      ]);
      setCustomer(c);
      setHub(h);
      if (c) {
        setEditForm({
          businessName: c.businessName || "",
          contactPerson: c.contactPerson || "",
          phone: c.phone || "",
          email: c.email || "",
          address: c.address || "",
          city: c.city || "",
          businessType: c.businessType || "Other",
          notes: c.notes || ""
        });
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  const showNotification = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    setSavingEdit(true);

    try {
      await updateCustomer(customer.id, editForm);
      setCustomer({ ...customer, ...editForm });
      showNotification("Customer record successfully updated in Firestore.");
      setShowEditModal(false);
    } catch (err: any) {
      alert("Failed to update customer: " + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!customer) return;
    const confirmMsg = `Are you sure you want to permanently delete "${customer.businessName}" from Firestore?\n\nThis will remove the customer record and associated digital hub.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteCustomer(customer.id);
      router.push("/admin/customers");
    } catch (err: any) {
      alert("Failed to delete customer: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-tapsh-soft-green animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider text-tapsh-charcoal">
          Loading Customer Profile from Firestore...
        </p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-tapsh-charcoal/20 text-center max-w-md mx-auto my-12">
        <h2 className="text-xl font-bold text-tapsh-black mb-2">Customer Not Found</h2>
        <p className="text-sm text-tapsh-charcoal mb-6">The requested client record does not exist in Firestore.</p>
        <Link href="/admin/customers" className="px-6 py-3 bg-tapsh-black text-tapsh-beige font-bold text-sm rounded-xl inline-block">
          &larr; Return to Clients
        </Link>
      </div>
    );
  }

  const cleanPhone = (customer.phone || "").replace(/[^0-9+]/g, "");
  const customerInvoices = mockInvoices.filter(i => i.customerId === customer.id);
  const customerLogs = mockAuditLogs.filter(l => l.entityId === hub?.id || l.entityId === customer.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Back Link & Actions */}
      <div className="flex items-center justify-between">
        <Link 
          href="/admin/customers" 
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-tapsh-charcoal hover:text-tapsh-black py-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Client Directory
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-tapsh-pale-blue text-tapsh-black border border-tapsh-charcoal/20 rounded-xl text-xs font-bold hover:bg-tapsh-charcoal/10 transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit Record
          </button>
          <button
            onClick={handleDeleteClient}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl border border-tapsh-charcoal/15 shadow-xs p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-tapsh-pale-blue border border-tapsh-charcoal/20 flex items-center justify-center text-2xl sm:text-3xl font-bold text-tapsh-black shrink-0 shadow-inner">
              {customer.businessName.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-tapsh-black tracking-tight">
                  {customer.businessName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {customer.status}
                </span>
              </div>
              <p className="text-xs font-bold text-tapsh-soft-green">
                {customer.businessType} • {customer.city}
              </p>
              <p className="text-xs text-tapsh-charcoal mt-1">
                Contact: <span className="font-semibold text-tapsh-black">{customer.contactPerson}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Dialers */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-tapsh-charcoal/10">
            {cleanPhone && (
              <a 
                href={`tel:${cleanPhone}`}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-[#FAF8F5] border border-tapsh-charcoal/20 text-xs font-bold text-tapsh-black hover:border-tapsh-soft-green active:scale-95 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-tapsh-soft-green" /> Call
              </a>
            )}
            {customer.email && (
              <a 
                href={`mailto:${customer.email}`}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-[#FAF8F5] border border-tapsh-charcoal/20 text-xs font-bold text-tapsh-black hover:border-tapsh-soft-green active:scale-95 transition-all"
              >
                <Mail className="w-3.5 h-3.5 text-tapsh-soft-green" /> Email
              </a>
            )}
          </div>
        </div>

        {/* Client Address & Notes */}
        <div className="mt-5 pt-4 border-t border-tapsh-charcoal/10 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-bold text-tapsh-charcoal uppercase tracking-wider text-[10px] block mb-1">
              Registered Address
            </span>
            <p className="text-tapsh-black font-medium leading-relaxed">
              {customer.address}, {customer.city}
            </p>
          </div>
          <div>
            <span className="font-bold text-tapsh-charcoal uppercase tracking-wider text-[10px] block mb-1">
              Hardware & Hub Notes
            </span>
            <p className="text-tapsh-charcoal leading-relaxed font-medium">
              {customer.notes || "No additional notes provided."}
            </p>
          </div>
        </div>
      </div>

      {/* Permanent Hub Status Card */}
      <div className="bg-white rounded-3xl border border-tapsh-charcoal/15 shadow-xs p-5 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-tapsh-soft-green" />
            <h2 className="text-base sm:text-lg font-bold text-tapsh-black">
              TAPSH Permanent Digital Hub
            </h2>
          </div>
          {hub ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-tapsh-soft-green/10 text-tapsh-soft-green border border-tapsh-soft-green/30">
              ACTIVE ROUTING
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
              NO HUB DEPLOYED
            </span>
          )}
        </div>

        {hub ? (
          <div className="space-y-4">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-tapsh-charcoal block mb-0.5 tracking-wider">
                  Live Public Destination
                </span>
                <code className="text-xs sm:text-sm font-bold text-tapsh-black font-mono break-all">
                  tapsh.in/h/{hub.slug}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={`/h/${hub.slug}`} 
                  target="_blank"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-tapsh-black text-tapsh-beige text-xs font-bold shadow-xs active:scale-95 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Hub
                </a>
              </div>
            </div>

            {hub.links && hub.links.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-tapsh-charcoal uppercase tracking-wider block mb-2">
                  Configured Touchpoint Links ({hub.links.length})
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {hub.links.map((l) => (
                    <div key={l.id} className="p-2.5 rounded-xl bg-[#FAF8F5] border border-tapsh-charcoal/10 text-xs">
                      <span className="font-bold text-tapsh-black block truncate">{l.title}</span>
                      <span className="text-[10px] text-tapsh-soft-green uppercase font-bold">{l.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-tapsh-charcoal/30">
            <p className="text-xs font-bold text-tapsh-charcoal mb-3">No active Hub configuration associated with this client.</p>
            <Link 
              href="/admin/hubs/setup"
              className="px-5 py-2.5 bg-tapsh-soft-green text-white text-xs font-bold rounded-xl shadow-xs inline-block"
            >
              + Create Hub Now
            </Link>
          </div>
        )}
      </div>

      {/* Associated Invoices */}
      <div className="bg-white rounded-3xl border border-tapsh-charcoal/15 shadow-xs p-5 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-600" />
            <h2 className="text-base sm:text-lg font-bold text-tapsh-black">
              Client Invoices ({customerInvoices.length})
            </h2>
          </div>
        </div>

        {customerInvoices.length === 0 ? (
          <p className="text-xs text-tapsh-charcoal py-4 text-center">No invoices recorded for this client.</p>
        ) : (
          <div className="space-y-3">
            {customerInvoices.map((inv) => (
              <div 
                key={inv.id}
                className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-tapsh-black font-mono">{inv.invoiceNumber}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                      inv.status === "PAID" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      inv.status === "PARTIAL" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                  <p className="text-xs text-tapsh-charcoal mt-1">
                    Date: {new Date(inv.date).toLocaleDateString()} • Total: <strong className="text-tapsh-black">₹{inv.total.toLocaleString()}</strong>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-tapsh-charcoal/10">
                  <span className="text-xs font-bold text-red-600 sm:hidden">
                    Due: ₹{(inv.total - inv.amountPaid).toLocaleString()}
                  </span>
                  <Link 
                    href={`/admin/invoices/${inv.id}`}
                    className="py-1.5 px-3 bg-white border border-tapsh-charcoal/20 rounded-xl text-xs font-bold text-tapsh-black hover:border-tapsh-soft-green transition-all"
                  >
                    View Breakdown
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
            <div className="p-5 border-b border-tapsh-charcoal/10 flex items-center justify-between bg-[#FAF8F5]">
              <h3 className="font-bold text-lg text-tapsh-black flex items-center gap-2">
                <Pencil className="w-5 h-5 text-tapsh-soft-green" />
                Edit Profile in Firestore
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-full hover:bg-tapsh-charcoal/10 text-tapsh-charcoal transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Business Name *
                </label>
                <input 
                  type="text"
                  required
                  value={editForm.businessName}
                  onChange={(e) => setEditForm({...editForm, businessName: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Contact Person
                  </label>
                  <input 
                    type="text"
                    value={editForm.contactPerson}
                    onChange={(e) => setEditForm({...editForm, contactPerson: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5">
                    Category
                  </label>
                  <select 
                    value={editForm.businessType}
                    onChange={(e) => setEditForm({...editForm, businessType: e.target.value as any})}
                    className="w-full px-4 py-2.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                  >
                    {["Resort / Hotel", "Restaurant / Café", "Salon / Spa", "Clinic", "Retail", "Office", "Homestay", "Other"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Phone
                  </label>
                  <input 
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </label>
                  <input 
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Address
                  </label>
                  <input 
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> City
                  </label>
                  <input 
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Notes
                </label>
                <textarea 
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green resize-none"
                />
              </div>

              <div className="pt-3 border-t border-tapsh-charcoal/10 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-tapsh-charcoal hover:bg-tapsh-charcoal/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-tapsh-soft-green text-white hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save to Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
