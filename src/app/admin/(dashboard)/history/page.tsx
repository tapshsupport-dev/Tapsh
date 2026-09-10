"use client";

import { useState, useEffect } from "react";
import { 
  Search, Pencil, Trash2, MapPin, X, Save, ShieldAlert,
  Building2, Phone, Mail, User, Loader2, CheckCircle2,
  Clock, History as HistoryIcon
} from "lucide-react";
import { Customer } from "@/lib/data";
import { 
  subscribeCustomers, updateCustomer, deleteCustomer 
} from "@/lib/firestoreService";

export default function HistoryPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState({
    businessName: "",
    contactPerson: "",
    email: "",
    phone: "",
    city: ""
  });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    const unsub = subscribeCustomers((data) => {
      setCustomers(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const showNotification = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const filteredCustomers = customers.filter((customer) => {
    return (
      (customer.businessName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.contactPerson || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.city || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete "${name}" from Firestore?`)) {
      try {
        await deleteCustomer(id);
        showNotification(`Customer "${name}" deleted from Firestore.`);
      } catch (err: any) {
        alert("Delete failed: " + err.message);
      }
    }
  };

  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditForm({
      businessName: customer.businessName || "",
      contactPerson: customer.contactPerson || "",
      email: customer.email || "",
      phone: customer.phone || "",
      city: customer.city || ""
    });
  };

  const handleSaveEdit = async () => {
    if (!editingCustomer) return;
    setSavingEdit(true);
    try {
      await updateCustomer(editingCustomer.id, editForm);
      showNotification(`Customer "${editForm.businessName}" updated successfully in Firestore.`);
      setEditingCustomer(null);
    } catch (err: any) {
      alert("Update failed: " + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tapsh-soft-green/10 border border-tapsh-soft-green/30 text-[11px] font-bold text-tapsh-soft-green mb-2">
          <HistoryIcon className="w-3 h-3" /> Live Firestore History
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-tapsh-black">
          Customer History & Records
        </h1>
        <p className="text-xs sm:text-sm text-tapsh-charcoal mt-1">
          Historical log of registered client accounts. Edit and delete records directly synchronized with Firebase.
        </p>
      </div>

      {/* Feedback Message */}
      {feedbackMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-tapsh-charcoal/15 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tapsh-charcoal" />
          <input 
            type="text" 
            placeholder="Search by business, manager, email or city..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-tapsh-charcoal/30 bg-[#FAF8F5] text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green focus:border-transparent transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-tapsh-charcoal/15 shadow-xs overflow-hidden">
        
        {/* Table Header */}
        <div className="hidden lg:grid grid-cols-12 gap-4 bg-[#FAF8F5] p-4 border-b border-tapsh-charcoal/15 text-xs font-bold uppercase tracking-wider text-tapsh-charcoal">
          <div className="col-span-3">Business Info</div>
          <div className="col-span-3">Contact Person</div>
          <div className="col-span-2">Location</div>
          <div className="col-span-2">Contact Details</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Data List */}
        <div className="divide-y divide-tapsh-charcoal/10">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-tapsh-soft-green animate-spin" />
              <p className="text-xs font-bold uppercase tracking-wider text-tapsh-charcoal">Loading from Firestore...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="p-12 text-center text-tapsh-charcoal text-sm font-bold">
              No customer history present in Firestore. Records will appear here when clients are registered.
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-8 text-center text-tapsh-charcoal text-sm font-bold">
              No records match your search.
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div key={customer.id} className="p-4 lg:p-0">
                {/* Desktop Row View */}
                <div className="hidden lg:grid grid-cols-12 gap-4 items-center p-4 hover:bg-[#FAF8F5]/60 transition-colors">
                  <div className="col-span-3">
                    <p className="font-bold text-tapsh-black text-sm">{customer.businessName}</p>
                    <p className="text-[11px] text-tapsh-soft-green font-bold mt-0.5">{customer.businessType}</p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm font-medium text-tapsh-black">{customer.contactPerson}</p>
                  </div>
                  <div className="col-span-2 text-xs text-tapsh-charcoal">
                    <p>{customer.city}</p>
                  </div>
                  <div className="col-span-2 text-[11px] text-tapsh-charcoal space-y-1">
                    <p className="truncate">{customer.email}</p>
                    <p>{customer.phone}</p>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleEditClick(customer)}
                      className="p-2 rounded-xl bg-tapsh-pale-blue text-tapsh-black hover:bg-tapsh-charcoal/10 transition-colors cursor-pointer"
                      title="Edit Customer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(customer.id, customer.businessName)}
                      className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-tapsh-black text-base">{customer.businessName}</h3>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-tapsh-soft-green/10 text-tapsh-soft-green mt-1">
                        {customer.businessType}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleEditClick(customer)}
                        className="p-2 rounded-lg bg-tapsh-pale-blue text-tapsh-black"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(customer.id, customer.businessName)}
                        className="p-2 rounded-lg bg-red-50 text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-tapsh-charcoal pt-2 border-t border-tapsh-charcoal/10">
                    <div>
                      <span className="font-bold text-tapsh-black block mb-0.5">Contact</span>
                      {customer.contactPerson}
                    </div>
                    <div>
                      <span className="font-bold text-tapsh-black block mb-0.5">Location</span>
                      {customer.city}
                    </div>
                    <div className="col-span-2">
                      <span className="font-bold text-tapsh-black block mb-0.5">Details</span>
                      {customer.email} • {customer.phone}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal overlay */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
            <div className="p-5 border-b border-tapsh-charcoal/10 flex items-center justify-between bg-[#FAF8F5]">
              <h3 className="font-bold text-lg text-tapsh-black flex items-center gap-2">
                <Pencil className="w-5 h-5 text-tapsh-soft-green" />
                Edit Customer in Firestore
              </h3>
              <button 
                onClick={() => setEditingCustomer(null)}
                className="p-1.5 rounded-full hover:bg-tapsh-charcoal/10 text-tapsh-charcoal transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Business Name
                </label>
                <input 
                  type="text"
                  value={editForm.businessName}
                  onChange={(e) => setEditForm({...editForm, businessName: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                />
              </div>
              
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> City/Location
                </label>
                <input 
                  type="text"
                  value={editForm.city}
                  onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                />
              </div>
            </div>

            <div className="p-5 border-t border-tapsh-charcoal/10 bg-[#FAF8F5] flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-tapsh-charcoal hover:bg-tapsh-charcoal/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                disabled={savingEdit}
                onClick={handleSaveEdit}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-tapsh-soft-green text-white hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
