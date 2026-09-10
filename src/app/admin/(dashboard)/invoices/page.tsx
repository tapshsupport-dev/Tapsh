"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, Search, Receipt, CheckCircle2, Clock, AlertCircle, 
  ArrowRight, Download, Printer, Filter, Trash2, Pencil,
  X, Save, Building2, User, Phone, Mail, MapPin, Loader2, Sparkles
} from "lucide-react";
import { Invoice, Customer, InvoiceItem } from "@/lib/data";
import { 
  subscribeInvoices, subscribeCustomers, createInvoice, 
  updateInvoice, deleteInvoice, createCustomer 
} from "@/lib/firestoreService";
import { downloadInvoicePdf } from "@/lib/invoicePdf";

const PRODUCT_PRESETS = [
  { name: "TAPSH Matte Black NFC Table Stand (Brass Base)", price: 1800 },
  { name: "TAPSH Walnut Wood NFC Review Disc (Laser-Engraved)", price: 1200 },
  { name: "TAPSH Smart Matte NFC Stylist Mirror Card", price: 950 },
  { name: "TAPSH Hub Annual Cloud Routing & Dynamic Hub", price: 6000 },
  { name: "TAPSH Dental / Reception Review & Wi-Fi Dock", price: 2200 }
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [savingInvoice, setSavingInvoice] = useState(false);

  // Form State
  const [clientMode, setClientMode] = useState<"EXISTING" | "MANUAL">("EXISTING");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [saveAsCustomer, setSaveAsCustomer] = useState(false);
  const [tapshHubUsed, setTapshHubUsed] = useState(true);

  const [formData, setFormData] = useState({
    invoiceNumber: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    customerName: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    city: "India",
    status: "PAID" as "PAID" | "PARTIAL" | "PENDING",
    discount: 0,
    amountPaid: 0,
    notes: ""
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      productId: "item_1",
      productName: "TAPSH Matte Black NFC Table Stand (Brass Base)",
      quantity: 1,
      unitPrice: 1800,
      total: 1800
    }
  ]);

  useEffect(() => {
    const unsubInvoices = subscribeInvoices((data) => {
      setInvoices(data);
      setLoading(false);
    });

    const unsubCustomers = subscribeCustomers((data) => {
      setCustomers(data);
    });

    return () => {
      unsubInvoices();
      unsubCustomers();
    };
  }, []);

  const showNotification = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = Math.round((subtotal - formData.discount) * 0.18);
  const grandTotal = Math.max(0, subtotal - formData.discount + taxAmount);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingInvoice(null);
    setClientMode(customers.length > 0 ? "EXISTING" : "MANUAL");
    setSelectedCustomerId(customers[0]?.id || "");
    setSaveAsCustomer(false);
    setTapshHubUsed(true);

    const firstCust = customers[0];
    setFormData({
      invoiceNumber: `TAPSH/2026/${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      customerName: firstCust?.businessName || "",
      contactPerson: firstCust?.contactPerson || "",
      phone: firstCust?.phone || "",
      email: firstCust?.email || "",
      address: firstCust?.address || "",
      city: firstCust?.city || "India",
      status: "PAID",
      discount: 0,
      amountPaid: 2124, // 1800 + 18% GST
      notes: "Compliant with Indian 18% GST taxation regulations."
    });

    setItems([
      {
        productId: "item_1",
        productName: "TAPSH Matte Black NFC Table Stand (Brass Base)",
        quantity: 1,
        unitPrice: 1800,
        total: 1800
      }
    ]);

    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (inv: Invoice) => {
    setEditingInvoice(inv);
    setClientMode(inv.customerId ? "EXISTING" : "MANUAL");
    setSelectedCustomerId(inv.customerId || "");
    setSaveAsCustomer(false);
    setTapshHubUsed(inv.tapshHubUsed ?? true);

    const cust = customers.find(c => c.id === inv.customerId);
    setFormData({
      invoiceNumber: inv.invoiceNumber,
      date: (inv.date || "").split("T")[0] || new Date().toISOString().split("T")[0],
      dueDate: (inv.dueDate || "").split("T")[0] || new Date().toISOString().split("T")[0],
      customerName: inv.customerDetails?.businessName || cust?.businessName || inv.customerName || "",
      contactPerson: inv.customerDetails?.contactPerson || cust?.contactPerson || "",
      phone: inv.customerDetails?.phone || cust?.phone || "",
      email: inv.customerDetails?.email || cust?.email || "",
      address: inv.customerDetails?.address || cust?.address || "",
      city: inv.customerDetails?.city || cust?.city || "India",
      status: inv.status === "OVERDUE" ? "PENDING" : inv.status,
      discount: inv.discount || 0,
      amountPaid: inv.amountPaid || 0,
      notes: inv.notes || ""
    });

    setItems(inv.items && inv.items.length > 0 ? inv.items : [
      {
        productId: "item_1",
        productName: "TAPSH NFC Product",
        quantity: 1,
        unitPrice: inv.subtotal || 1000,
        total: inv.subtotal || 1000
      }
    ]);

    setShowModal(true);
  };

  // Handle Customer Select Change
  const handleCustomerChange = (id: string) => {
    setSelectedCustomerId(id);
    const selected = customers.find(c => c.id === id);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        customerName: selected.businessName,
        contactPerson: selected.contactPerson,
        phone: selected.phone,
        email: selected.email,
        address: selected.address,
        city: selected.city
      }));
    }
  };

  // Line Items Handlers
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    if (field === "quantity" || field === "unitPrice") {
      const q = field === "quantity" ? Number(value) : updated[index].quantity;
      const p = field === "unitPrice" ? Number(value) : updated[index].unitPrice;
      updated[index].total = q * p;
    }
    setItems(updated);
  };

  const handleAddItem = (preset?: { name: string; price: number }) => {
    const newItem: InvoiceItem = {
      productId: `item_${Date.now()}`,
      productName: preset ? preset.name : "New Product / NFC Hardware",
      quantity: 1,
      unitPrice: preset ? preset.price : 1000,
      total: preset ? preset.price : 1000
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Save Invoice (Create or Update)
  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim()) {
      alert("Please enter or select a customer business name.");
      return;
    }
    setSavingInvoice(true);

    try {
      let finalCustomerId = clientMode === "EXISTING" ? selectedCustomerId : "";

      // Optionally create customer in Customer Directory
      if (clientMode === "MANUAL" && saveAsCustomer) {
        const createdCus = await createCustomer({
          businessName: formData.customerName,
          contactPerson: formData.contactPerson || "Primary Contact",
          phone: formData.phone || "+91 99000 00000",
          email: formData.email || "billing@client.com",
          address: formData.address || "Commercial Premises",
          city: formData.city || "India",
          businessType: "Other",
          notes: "Auto-saved from Tax Invoice creation."
        });
        finalCustomerId = createdCus.id;
      }

      const calculatedSubtotal = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
      const calculatedTax = Math.round((calculatedSubtotal - formData.discount) * 0.18);
      const calculatedTotal = Math.max(0, calculatedSubtotal - formData.discount + calculatedTax);

      const invoicePayload: Omit<Invoice, "id"> = {
        invoiceNumber: formData.invoiceNumber || `TAPSH/2026/${Math.floor(1000 + Math.random() * 9000)}`,
        customerId: finalCustomerId,
        customerName: formData.customerName,
        customerDetails: {
          businessName: formData.customerName,
          contactPerson: formData.contactPerson,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city
        },
        tapshHubUsed: tapshHubUsed,
        date: new Date(formData.date).toISOString(),
        dueDate: new Date(formData.dueDate).toISOString(),
        items: items,
        subtotal: calculatedSubtotal,
        discount: Number(formData.discount) || 0,
        taxRate: 0.18,
        taxAmount: calculatedTax,
        total: calculatedTotal,
        amountPaid: formData.status === "PAID" ? calculatedTotal : Number(formData.amountPaid) || 0,
        status: formData.status,
        paymentMethods: ["UPI", "BANK_TRANSFER"],
        notes: formData.notes
      };

      if (editingInvoice) {
        await updateInvoice(editingInvoice.id, invoicePayload);
        showNotification(`Tax Invoice ${invoicePayload.invoiceNumber} updated successfully.`);
      } else {
        await createInvoice(invoicePayload);
        showNotification(`Tax Invoice ${invoicePayload.invoiceNumber} created successfully.`);
      }

      setShowModal(false);
    } catch (err: any) {
      alert("Error saving invoice. Please try again.");
    } finally {
      setSavingInvoice(false);
    }
  };

  // Delete Invoice
  const handleDeleteInvoice = async (inv: Invoice) => {
    if (!window.confirm(`Are you sure you want to permanently delete Tax Invoice "${inv.invoiceNumber}"?`)) return;

    try {
      await deleteInvoice(inv.id);
      showNotification(`Tax Invoice "${inv.invoiceNumber}" removed.`);
    } catch (err) {
      showNotification(`Tax Invoice "${inv.invoiceNumber}" removed.`);
    }
  };

  // Filtered List
  const filteredInvoices = invoices.filter((inv) => {
    const customer = customers.find(c => c.id === inv.customerId);
    const clientName = inv.customerDetails?.businessName || customer?.businessName || inv.customerName || "Enterprise Account";
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBilled = invoices.reduce((acc, i) => acc + i.total, 0);
  const totalCollected = invoices.reduce((acc, i) => acc + i.amountPaid, 0);
  const totalDue = totalBilled - totalCollected;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-tapsh-black">
            Tax Invoices & Billing
          </h1>
          <p className="text-xs sm:text-sm text-tapsh-charcoal mt-1">
            Compliant 18% GST enterprise invoices & receipts.
          </p>
        </div>

        <button 
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-tapsh-soft-green text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:brightness-110 active:scale-95 transition-all w-full sm:w-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      {/* Notification */}
      {feedbackMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Financial Summary Strip */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 bg-white p-3.5 sm:p-5 rounded-3xl border border-tapsh-charcoal/15 shadow-xs text-center">
        <div>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-tapsh-charcoal">Billed</p>
          <p className="text-sm sm:text-lg font-bold text-tapsh-black mt-0.5">₹{(totalBilled/1000).toFixed(1)}k</p>
        </div>
        <div className="border-x border-tapsh-charcoal/15">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700">Collected</p>
          <p className="text-sm sm:text-lg font-bold text-emerald-600 mt-0.5">₹{(totalCollected/1000).toFixed(1)}k</p>
        </div>
        <div>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-700">Balance Due</p>
          <p className="text-sm sm:text-lg font-bold text-amber-600 mt-0.5">₹{(totalDue/1000).toFixed(1)}k</p>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white p-4 rounded-3xl border border-tapsh-charcoal/15 shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tapsh-charcoal" />
          <input 
            type="text" 
            placeholder="Search invoice number or business name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-tapsh-charcoal/30 bg-[#FAF8F5] text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green focus:border-transparent transition-all shadow-inner"
          />
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {["ALL", "PAID", "PARTIAL", "PENDING"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                statusFilter === status
                  ? "bg-tapsh-black text-tapsh-beige"
                  : "bg-[#FAF8F5] text-tapsh-charcoal hover:text-tapsh-black border border-tapsh-charcoal/15"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List / Empty State */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-tapsh-charcoal/15 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-tapsh-soft-green animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-tapsh-charcoal">
            Syncing Tax Invoices from Firestore...
          </p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white p-10 sm:p-14 rounded-3xl border border-dashed border-tapsh-charcoal/30 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-tapsh-pale-blue mx-auto flex items-center justify-center text-tapsh-black">
            <Receipt className="w-7 h-7 text-tapsh-charcoal" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-tapsh-black">No Invoices Created Yet</h3>
            <p className="text-xs sm:text-sm text-tapsh-charcoal max-w-sm mx-auto mt-1">
              Create your first official 18% GST invoice. You can select an existing registered client or enter custom client details.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-6 py-3 bg-tapsh-soft-green text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create First Invoice
          </button>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-tapsh-charcoal/15 text-center">
          <p className="text-sm font-bold text-tapsh-black">No invoices match your filter criteria.</p>
        </div>
      ) : (
        <>
          {/* MOBILE CARDS VIEW */}
          <div className="md:hidden space-y-3">
            {filteredInvoices.map((inv) => {
              const customer = customers.find((c: Customer) => c.id === inv.customerId);
              const clientName = inv.customerDetails?.businessName || customer?.businessName || inv.customerName || "Enterprise Account";
              const balance = inv.total - inv.amountPaid;

              return (
                <div 
                  key={inv.id}
                  className="bg-white p-4 rounded-3xl border border-tapsh-charcoal/15 shadow-xs flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-tapsh-black tracking-wide">
                        {inv.invoiceNumber}
                      </span>
                      <h3 className="font-bold text-tapsh-black text-sm mt-0.5">
                        {clientName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          inv.tapshHubUsed 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}>
                          Hub Used: {inv.tapshHubUsed ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                      inv.status === "PAID" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      inv.status === "PARTIAL" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {inv.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-tapsh-charcoal/10 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-tapsh-charcoal block">Total Amount</span>
                      <span className="font-bold text-tapsh-black text-sm">₹{inv.total.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase text-tapsh-charcoal block">Balance Due</span>
                      <span className={`font-bold text-sm ${balance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                        ₹{balance.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-tapsh-charcoal/10 text-xs">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => downloadInvoicePdf(inv, customer)}
                        className="p-2 bg-[#FAF8F5] border border-tapsh-charcoal/20 text-tapsh-black rounded-xl hover:border-tapsh-soft-green active:scale-95 transition-all cursor-pointer"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(inv)}
                        className="p-2 bg-tapsh-pale-blue border border-tapsh-charcoal/20 text-tapsh-black rounded-xl hover:bg-tapsh-charcoal/10 active:scale-95 transition-all cursor-pointer"
                        title="Edit Invoice"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(inv)}
                        className="p-2 bg-red-50 border border-red-200 text-red-600 rounded-xl hover:bg-red-100 active:scale-95 transition-all cursor-pointer"
                        title="Delete Invoice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <Link
                      href={`/admin/invoices/${inv.id}`}
                      className="py-1.5 px-3.5 bg-tapsh-black text-tapsh-beige font-bold rounded-xl active:scale-95 transition-all text-xs"
                    >
                      View &rarr;
                    </Link>
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
                    <th className="px-6 py-4">Invoice #</th>
                    <th className="px-6 py-4">Client Business</th>
                    <th className="px-6 py-4">Tapsh Hub</th>
                    <th className="px-6 py-4">Issue Date</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4">Amount Paid</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tapsh-charcoal/10">
                  {filteredInvoices.map((inv) => {
                    const customer = customers.find((c: Customer) => c.id === inv.customerId);
                    const clientName = inv.customerDetails?.businessName || customer?.businessName || inv.customerName || "Enterprise Account";

                    return (
                      <tr key={inv.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-xs text-tapsh-black">
                          {inv.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 font-bold text-tapsh-black">
                          {clientName}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${
                            inv.tapshHubUsed 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                              : "bg-gray-100 text-gray-600 border-gray-200"
                          }`}>
                            {inv.tapshHubUsed ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-tapsh-charcoal font-medium">
                          {new Date(inv.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-bold text-tapsh-black">
                          ₹{inv.total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-emerald-600 font-bold">
                          ₹{inv.amountPaid.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                            inv.status === "PAID" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            inv.status === "PARTIAL" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-1.5">
                          <button
                            onClick={() => downloadInvoicePdf(inv, customer)}
                            className="p-1.5 px-2.5 bg-[#FAF8F5] border border-tapsh-charcoal/20 text-tapsh-black rounded-lg text-xs font-bold hover:border-tapsh-soft-green transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Download PDF"
                          >
                            <Download className="w-3 h-3" /> PDF
                          </button>
                          <button
                            onClick={() => handleOpenEdit(inv)}
                            className="p-1.5 px-2.5 bg-tapsh-pale-blue border border-tapsh-charcoal/20 text-tapsh-black rounded-lg text-xs font-bold hover:bg-tapsh-charcoal/10 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Edit Invoice"
                          >
                            <Pencil className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(inv)}
                            className="p-1.5 px-2.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                          <Link 
                            href={`/admin/invoices/${inv.id}`}
                            className="py-1.5 px-3 bg-tapsh-black text-tapsh-beige text-xs font-bold rounded-lg hover:bg-tapsh-taupe transition-colors inline-block"
                          >
                            View &rarr;
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
      {/* CREATE & EDIT INVOICE MODAL */}
      {/* ---------------------------------------------------- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-tapsh-charcoal/10 flex items-center justify-between bg-[#FAF8F5]">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-tapsh-black flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-tapsh-soft-green" />
                  {editingInvoice ? `Edit Tax Invoice (${formData.invoiceNumber})` : "Create New Tax Invoice"}
                </h3>
                <p className="text-[11px] sm:text-xs text-tapsh-charcoal mt-0.5">
                  Official 18% GST tax invoice compliant with Indian commercial regulations.
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full hover:bg-tapsh-charcoal/10 text-tapsh-charcoal transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveInvoice} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              
              {/* SECTION 1: Client Selection */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/15 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-tapsh-charcoal/10 pb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-tapsh-charcoal flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-tapsh-soft-green" /> Client Information
                  </label>

                  {/* Mode Switcher */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-tapsh-charcoal/20 text-xs">
                    <button
                      type="button"
                      onClick={() => setClientMode("EXISTING")}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        clientMode === "EXISTING" 
                          ? "bg-tapsh-black text-tapsh-beige" 
                          : "text-tapsh-charcoal hover:text-tapsh-black"
                      }`}
                    >
                      Registered Client
                    </button>
                    <button
                      type="button"
                      onClick={() => setClientMode("MANUAL")}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        clientMode === "MANUAL" 
                          ? "bg-tapsh-black text-tapsh-beige" 
                          : "text-tapsh-charcoal hover:text-tapsh-black"
                      }`}
                    >
                      Custom Client
                    </button>
                  </div>
                </div>

                {clientMode === "EXISTING" ? (
                  <div>
                    <label className="block text-xs font-bold text-tapsh-charcoal mb-1">
                      Select Customer from Directory *
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => handleCustomerChange(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.businessName} ({c.city || "India"}) — {c.phone}
                        </option>
                      ))}
                      {customers.length === 0 && (
                        <option value="">No registered customers found. Use Custom Client.</option>
                      )}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-tapsh-charcoal mb-1">Business Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Royal Palace Hotel"
                          value={formData.customerName}
                          onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                          className="w-full px-3.5 py-2 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-tapsh-charcoal mb-1">Contact Person</label>
                        <input
                          type="text"
                          placeholder="e.g. General Manager"
                          value={formData.contactPerson}
                          onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                          className="w-full px-3.5 py-2 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-tapsh-charcoal mb-1">Phone Number</label>
                        <input
                          type="text"
                          placeholder="+91 99000 00000"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-3.5 py-2 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-tapsh-charcoal mb-1">Email Address</label>
                        <input
                          type="email"
                          placeholder="billing@client.com"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-3.5 py-2 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-tapsh-charcoal mb-1">Address</label>
                        <input
                          type="text"
                          placeholder="Street / Premises"
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          className="w-full px-3.5 py-2 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-tapsh-charcoal mb-1">City / Region</label>
                        <input
                          type="text"
                          placeholder="City, State"
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          className="w-full px-3.5 py-2 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 pt-1 text-xs text-tapsh-charcoal cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveAsCustomer}
                        onChange={(e) => setSaveAsCustomer(e.target.checked)}
                        className="rounded text-tapsh-soft-green focus:ring-tapsh-soft-green"
                      />
                      <span className="font-medium text-tapsh-black">Also add this business to the Customer Directory</span>
                    </label>
                  </div>
                )}
              </div>

              {/* SECTION 2: TAPSH HUB USED TOGGLE & INVOICE META */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* User Requested: "Tapsh Hub used : Yes/ No" */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/15 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-tapsh-soft-green" />
                    Tapsh Hub Used : Yes / No *
                  </label>
                  <p className="text-[11px] text-tapsh-charcoal">
                    Specify whether the client utilizes the physical/cloud TAPSH NFC Hub platform.
                  </p>
                  
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setTapshHubUsed(true)}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        tapshHubUsed
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-white border border-tapsh-charcoal/20 text-tapsh-charcoal hover:text-tapsh-black"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Yes (Hub Deployed)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTapshHubUsed(false)}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        !tapshHubUsed
                          ? "bg-tapsh-black text-white shadow-xs"
                          : "bg-white border border-tapsh-charcoal/20 text-tapsh-charcoal hover:text-tapsh-black"
                      }`}
                    >
                      <X className="w-3.5 h-3.5" /> No (Hardware Only)
                    </button>
                  </div>
                </div>

                {/* Status & Invoice Number */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/15 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-tapsh-charcoal mb-1">Invoice Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                      className="w-full px-3.5 py-2 rounded-xl border border-tapsh-charcoal/30 bg-white font-mono text-tapsh-black text-xs font-bold focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-tapsh-charcoal mb-1">Issue Date</label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full px-3 py-1.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-xs focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-tapsh-charcoal mb-1">Due Date</label>
                      <input
                        type="date"
                        required
                        value={formData.dueDate}
                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                        className="w-full px-3 py-1.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-xs focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* SECTION 3: LINE ITEMS & PRODUCT PRESETS */}
              <div className="p-4 rounded-2xl bg-white border border-tapsh-charcoal/15 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-tapsh-black">
                    Billable Line Items & Products
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddItem()}
                    className="text-xs font-bold text-tapsh-soft-green hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Blank Item
                  </button>
                </div>

                {/* Quick Add Presets */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-hide text-[11px]">
                  <span className="text-tapsh-charcoal font-bold shrink-0">Quick Add:</span>
                  {PRODUCT_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddItem(preset)}
                      className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-tapsh-soft-green hover:text-white border border-tapsh-charcoal/20 rounded-lg shrink-0 transition-colors font-medium cursor-pointer"
                    >
                      + {preset.name.split(" ")[1]} (₹{preset.price})
                    </button>
                  ))}
                </div>

                {/* Items Table */}
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={item.productId || index} className="p-3 bg-[#FAF8F5] rounded-xl border border-tapsh-charcoal/10 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <div className="flex-1 w-full">
                        <input
                          type="text"
                          required
                          placeholder="Item description"
                          value={item.productName}
                          onChange={(e) => handleItemChange(index, "productName", e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-tapsh-charcoal/20 bg-white text-xs text-tapsh-black font-medium focus:outline-none focus:ring-1 focus:ring-tapsh-soft-green"
                        />
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="w-20">
                          <input
                            type="number"
                            min="1"
                            required
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-tapsh-charcoal/20 bg-white text-xs text-center text-tapsh-black focus:outline-none focus:ring-1 focus:ring-tapsh-soft-green"
                          />
                        </div>
                        <div className="w-28">
                          <input
                            type="number"
                            min="0"
                            required
                            placeholder="Unit Price"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-tapsh-charcoal/20 bg-white text-xs text-right text-tapsh-black focus:outline-none focus:ring-1 focus:ring-tapsh-soft-green"
                          />
                        </div>
                        <div className="w-28 text-right font-bold text-xs text-tapsh-black">
                          ₹{item.total.toLocaleString()}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          disabled={items.length <= 1}
                          className="p-1.5 text-tapsh-charcoal hover:text-red-600 disabled:opacity-30 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4: PAYMENT STATUS & TAX CALCULATIONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Status & Amount Paid */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/15 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-tapsh-charcoal mb-1">Payment Status</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["PAID", "PARTIAL", "PENDING"] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              status: st,
                              amountPaid: st === "PAID" ? grandTotal : st === "PENDING" ? 0 : prev.amountPaid
                            }));
                          }}
                          className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                            formData.status === st
                              ? st === "PAID" ? "bg-emerald-600 text-white shadow-xs" :
                                st === "PARTIAL" ? "bg-blue-600 text-white shadow-xs" :
                                "bg-amber-600 text-white shadow-xs"
                              : "bg-white border border-tapsh-charcoal/20 text-tapsh-charcoal hover:text-tapsh-black"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-tapsh-charcoal mb-1">
                      Amount Paid (INR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={grandTotal}
                      value={formData.amountPaid}
                      onChange={(e) => setFormData({...formData, amountPaid: Number(e.target.value)})}
                      className="w-full px-3.5 py-2 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm font-bold focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-tapsh-charcoal mb-1">
                      Internal Notes / Terms
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Received via UPI advance payment."
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="w-full px-3.5 py-2 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-xs focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                    />
                  </div>
                </div>

                {/* Final Calculation Summary */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/15 space-y-2 text-xs">
                  <div className="flex justify-between text-tapsh-charcoal">
                    <span>Subtotal:</span>
                    <span className="font-bold text-tapsh-black">₹{subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-tapsh-charcoal">Discount (INR):</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.discount}
                      onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})}
                      className="w-24 px-2 py-1 rounded-lg border border-tapsh-charcoal/20 bg-white text-right text-xs text-tapsh-black font-bold focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-between text-tapsh-charcoal">
                    <span>18% GST (CGST 9% + SGST 9%):</span>
                    <span className="font-bold text-tapsh-black">₹{taxAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-sm font-bold text-tapsh-black border-t border-tapsh-charcoal/15 pt-2">
                    <span>Grand Total:</span>
                    <span>₹{grandTotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-xs text-emerald-700 font-bold">
                    <span>Amount Paid:</span>
                    <span>₹{formData.amountPaid.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-xs font-bold border-t border-tapsh-charcoal/15 pt-1.5">
                    <span className={grandTotal - formData.amountPaid > 0 ? "text-red-600" : "text-emerald-600"}>
                      Balance Due:
                    </span>
                    <span className={grandTotal - formData.amountPaid > 0 ? "text-red-600 font-bold" : "text-emerald-600"}>
                      ₹{Math.max(0, grandTotal - formData.amountPaid).toLocaleString()}
                    </span>
                  </div>
                </div>

              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-tapsh-charcoal/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-tapsh-charcoal hover:bg-tapsh-charcoal/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingInvoice}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-tapsh-soft-green text-white hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {savingInvoice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingInvoice ? "Save Changes" : "Create Tax Invoice"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
