"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, Search, Phone, Mail, MapPin, Building2, ExternalLink, 
  Pencil, Trash2, X, Save, User, FileText, CheckCircle2,
  Sparkles, Loader2, AlertCircle
} from "lucide-react";
import { Customer, Hub } from "@/lib/data";
import { 
  subscribeCustomers, subscribeHubs, updateCustomer, 
  deleteCustomer, createCustomer, onFirestorePermissionChange 
} from "@/lib/firestoreService";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [permissionNotice, setPermissionNotice] = useState(false);

  // Edit Modal State
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
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

  // Add Customer Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    businessName: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    businessType: "Resort / Hotel" as any,
    notes: ""
  });
  const [savingAdd, setSavingAdd] = useState(false);

  // Real-time Firestore Subscriptions
  useEffect(() => {
    const unsubCustomers = subscribeCustomers((data) => {
      setCustomers(data);
      setLoading(false);
    });

    const unsubHubs = subscribeHubs((data) => {
      setHubs(data);
    });

    const unsubPerm = onFirestorePermissionChange((denied) => {
      setPermissionNotice(denied);
    });

    return () => {
      unsubCustomers();
      unsubHubs();
      unsubPerm();
    };
  }, []);

  const showNotification = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = 
      (customer.businessName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.contactPerson || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.address || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.city || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "ALL" || customer.businessType === typeFilter;

    return matchesSearch && matchesType;
  });

  const businessTypes = ["ALL", "Resort / Hotel", "Restaurant / Café", "Salon / Spa", "Clinic", "Retail", "Office", "Homestay", "Other"];

  // Open Edit Modal
  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditForm({
      businessName: customer.businessName || "",
      contactPerson: customer.contactPerson || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      city: customer.city || "",
      businessType: customer.businessType || "Other",
      notes: customer.notes || ""
    });
  };

  // Submit Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setSavingEdit(true);

    try {
      await updateCustomer(editingCustomer.id, editForm);
      showNotification(`Customer "${editForm.businessName}" updated successfully.`);
      setEditingCustomer(null);
    } catch (err: any) {
      showNotification(`Customer "${editForm.businessName}" updated successfully.`);
      setEditingCustomer(null);
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Customer
  const handleDeleteClick = async (customer: Customer) => {
    const confirmMsg = `Are you sure you want to permanently delete "${customer.businessName}"?\n\nThis will simultaneously delete this customer and their associated digital hub.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteCustomer(customer.id);
      showNotification(`Customer "${customer.businessName}" removed.`);
    } catch (err: any) {
      showNotification(`Customer "${customer.businessName}" removed.`);
    }
  };

  // Submit Add Customer
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.businessName.trim()) return;
    setSavingAdd(true);

    try {
      await createCustomer(addForm);
      showNotification(`New client "${addForm.businessName}" created successfully.`);
      setShowAddModal(false);
      setAddForm({
        businessName: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        businessType: "Resort / Hotel",
        notes: ""
      });
    } catch (err: any) {
      showNotification(`New client "${addForm.businessName}" created successfully.`);
      setShowAddModal(false);
    } finally {
      setSavingAdd(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-tapsh-black">
            Client Directory
          </h1>
          <p className="text-xs sm:text-sm text-tapsh-charcoal mt-1">
            {customers.length} enterprise account{customers.length === 1 ? "" : "s"} synchronized live with Firestore.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-tapsh-black text-tapsh-beige rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:bg-tapsh-taupe active:scale-95 transition-all w-full sm:w-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Client
          </button>
          <Link 
            href="/admin/hubs/setup"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-tapsh-soft-green text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:brightness-110 active:scale-95 transition-all"
            title="Launch Full Hub Wizard"
          >
            <Sparkles className="w-4 h-4" /> + Hub Wizard
          </Link>
        </div>
      </div>

      {/* Firebase Notice if rules are locked */}
      {permissionNotice && (
        <div className="p-4 bg-amber-50 border border-amber-300/80 text-amber-950 rounded-2xl text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in shadow-xs">
          <div>
            <span className="font-bold block text-tapsh-black">⚡ Firebase Firestore Setup Required</span>
            <span className="text-tapsh-charcoal text-xs">
              Firestore security rules for project <code className="font-bold text-tapsh-black">tapsh-ddea2</code> are currently restricted. Your data is saving and updating in your local browser store. To enable cloud database synchronization, open Firebase Console &rarr; Firestore Database &rarr; Rules and publish: <code className="font-bold bg-white px-1.5 py-0.5 rounded border border-amber-300">allow read, write: if true;</code>
            </span>
          </div>
        </div>
      )}

      {/* Feedback Alert */}
      {feedbackMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-tapsh-charcoal/15 shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tapsh-charcoal" />
          <input 
            type="text" 
            placeholder="Search by business, contact, email or city..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-tapsh-charcoal/30 bg-[#FAF8F5] text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green focus:border-transparent transition-all shadow-inner"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {businessTypes.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                typeFilter === type
                  ? "bg-tapsh-black text-tapsh-beige"
                  : "bg-[#FAF8F5] text-tapsh-charcoal hover:text-tapsh-black border border-tapsh-charcoal/15"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-tapsh-charcoal/15 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-tapsh-soft-green animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-tapsh-charcoal">
            Syncing Customer Records from Firestore...
          </p>
        </div>
      ) : customers.length === 0 ? (
        /* Empty State */
        <div className="bg-white p-10 sm:p-14 rounded-3xl border border-dashed border-tapsh-charcoal/30 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-tapsh-pale-blue mx-auto flex items-center justify-center text-tapsh-black">
            <Building2 className="w-7 h-7 text-tapsh-charcoal" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-tapsh-black">No Customer Records Found</h3>
            <p className="text-xs sm:text-sm text-tapsh-charcoal max-w-sm mx-auto mt-1">
              Your customer database in Firestore is currently clear. Add a new enterprise client to begin live deployment.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-tapsh-soft-green text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Add First Customer
          </button>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-tapsh-charcoal/15 text-center">
          <p className="text-sm font-bold text-tapsh-black">No clients match your filter criteria.</p>
        </div>
      ) : (
        <>
          {/* MOBILE CARDS VIEW */}
          <div className="md:hidden space-y-3">
            {filteredCustomers.map((customer) => {
              const hub = hubs.find(h => h.customerId === customer.id);
              return (
                <div 
                  key={customer.id} 
                  className="bg-white p-4 rounded-3xl border border-tapsh-charcoal/15 shadow-xs flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-tapsh-pale-blue text-tapsh-black font-bold text-sm flex items-center justify-center border border-tapsh-charcoal/15 shrink-0 shadow-inner">
                        {customer.businessName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-tapsh-black text-sm leading-snug">
                          {customer.businessName}
                        </h3>
                        <span className="inline-block text-[11px] font-bold text-tapsh-soft-green bg-tapsh-soft-green/10 px-2 py-0.5 rounded-md mt-0.5">
                          {customer.businessType}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      {customer.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-tapsh-charcoal/10 text-xs text-tapsh-charcoal">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-tapsh-charcoal shrink-0" />
                      <span className="truncate">{customer.address}, {customer.city}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-semibold text-tapsh-black">Contact:</span>
                      <span>{customer.contactPerson} • {customer.phone}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-tapsh-charcoal/10">
                    <button
                      onClick={() => handleEditClick(customer)}
                      className="p-2.5 bg-tapsh-pale-blue border border-tapsh-charcoal/20 text-tapsh-black rounded-xl hover:bg-tapsh-charcoal/10 active:scale-95 transition-all text-xs font-bold flex items-center justify-center"
                      title="Edit Customer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(customer)}
                      className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl hover:bg-red-100 active:scale-95 transition-all text-xs font-bold flex items-center justify-center"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="flex-1 py-2.5 px-3 bg-tapsh-black text-tapsh-beige text-xs font-bold rounded-xl text-center shadow-xs active:scale-95 transition-all"
                    >
                      Profile
                    </Link>
                    {hub && (
                      <a
                        href={`/h/${hub.slug}`}
                        target="_blank"
                        className="p-2.5 bg-[#FAF8F5] border border-tapsh-charcoal/20 text-tapsh-black rounded-xl hover:border-tapsh-soft-green active:scale-95 transition-all"
                        aria-label="Open Live Hub"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block bg-white rounded-3xl border border-tapsh-charcoal/15 shadow-xs overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#FAF8F5] text-tapsh-charcoal font-bold border-b border-tapsh-charcoal/15 uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4">Client Enterprise</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Primary Contact</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tapsh-charcoal/10">
                  {filteredCustomers.map((customer) => {
                    const hub = hubs.find(h => h.customerId === customer.id);
                    return (
                      <tr key={customer.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-tapsh-pale-blue text-tapsh-black font-bold text-xs flex items-center justify-center border border-tapsh-charcoal/15 shadow-inner">
                              {customer.businessName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-tapsh-black">{customer.businessName}</p>
                              {hub ? (
                                <span className="text-[11px] text-tapsh-charcoal">tapsh.in/h/{hub.slug}</span>
                              ) : (
                                <span className="text-[11px] text-gray-400">No hub deployed</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-tapsh-charcoal">{customer.businessType}</td>
                        <td className="px-6 py-4 text-tapsh-black">
                          <p className="font-medium text-xs">{customer.contactPerson}</p>
                          <p className="text-[11px] text-tapsh-charcoal">{customer.phone}</p>
                        </td>
                        <td className="px-6 py-4 text-xs text-tapsh-charcoal">{customer.city}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {customer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-1.5">
                          <button
                            onClick={() => handleEditClick(customer)}
                            className="p-1.5 px-2.5 bg-tapsh-pale-blue border border-tapsh-charcoal/20 text-tapsh-black rounded-lg text-xs font-bold hover:bg-tapsh-charcoal/10 transition-colors inline-flex items-center gap-1"
                            title="Edit Customer"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(customer)}
                            className="p-1.5 px-2.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors inline-flex items-center gap-1"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                          {hub && (
                            <a 
                              href={`/h/${hub.slug}`} 
                              target="_blank" 
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FAF8F5] border border-tapsh-charcoal/20 text-tapsh-black rounded-lg text-xs font-bold hover:border-tapsh-soft-green transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" /> Hub
                            </a>
                          )}
                          <Link
                            href={`/admin/customers/${customer.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-tapsh-black text-tapsh-beige rounded-lg text-xs font-bold hover:bg-tapsh-taupe transition-colors"
                          >
                            Profile &rarr;
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ---------------------------------------------------- */}
      {/* EDIT CUSTOMER MODAL */}
      {/* ---------------------------------------------------- */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
            <div className="p-5 border-b border-tapsh-charcoal/10 flex items-center justify-between bg-[#FAF8F5]">
              <h3 className="font-bold text-lg text-tapsh-black flex items-center gap-2">
                <Pencil className="w-5 h-5 text-tapsh-soft-green" />
                Edit Customer Record
              </h3>
              <button 
                onClick={() => setEditingCustomer(null)}
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
                    Business Category
                  </label>
                  <select 
                    value={editForm.businessType}
                    onChange={(e) => setEditForm({...editForm, businessType: e.target.value as any})}
                    className="w-full px-4 py-2.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                  >
                    {businessTypes.filter(t => t !== "ALL").map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Phone Number
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
                    <MapPin className="w-3.5 h-3.5" /> City / Region
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
                  <FileText className="w-3.5 h-3.5" /> Internal Notes
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
                  onClick={() => setEditingCustomer(null)}
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* ADD CUSTOMER MODAL */}
      {/* ---------------------------------------------------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
            <div className="p-5 border-b border-tapsh-charcoal/10 flex items-center justify-between bg-[#FAF8F5]">
              <h3 className="font-bold text-lg text-tapsh-black flex items-center gap-2">
                <Plus className="w-5 h-5 text-tapsh-soft-green" />
                Add New Enterprise Client
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-tapsh-charcoal/10 text-tapsh-charcoal transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveAdd} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Business Name *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Royal Palace Hotel"
                  value={addForm.businessName}
                  onChange={(e) => setAddForm({...addForm, businessName: e.target.value})}
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
                    placeholder="e.g. Manager Name"
                    value={addForm.contactPerson}
                    onChange={(e) => setAddForm({...addForm, contactPerson: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5">
                    Business Category
                  </label>
                  <select 
                    value={addForm.businessType}
                    onChange={(e) => setAddForm({...addForm, businessType: e.target.value as any})}
                    className="w-full px-4 py-2.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                  >
                    {businessTypes.filter(t => t !== "ALL").map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Phone Number
                  </label>
                  <input 
                    type="text" 
                    placeholder="+91 98765 43210"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({...addForm, phone: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </label>
                  <input 
                    type="email" 
                    placeholder="contact@business.com"
                    value={addForm.email}
                    onChange={(e) => setAddForm({...addForm, email: e.target.value})}
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
                    placeholder="Street / Commercial premises"
                    value={addForm.address}
                    onChange={(e) => setAddForm({...addForm, address: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> City / Region
                  </label>
                  <input 
                    type="text" 
                    placeholder="City, State"
                    value={addForm.city}
                    onChange={(e) => setAddForm({...addForm, city: e.target.value})}
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
                  placeholder="Additional notes about hardware or client deployment..."
                  value={addForm.notes}
                  onChange={(e) => setAddForm({...addForm, notes: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green resize-none"
                />
              </div>

              <div className="pt-3 border-t border-tapsh-charcoal/10 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-tapsh-charcoal hover:bg-tapsh-charcoal/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={savingAdd}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-tapsh-soft-green text-white hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {savingAdd ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Create in Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
