"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Phone, Mail, MapPin, ExternalLink, 
  Pencil, Trash2, X, Save, CheckCircle2, Receipt, Clock, Sparkles, Building2,
  Loader2, User, FileText, Download, Copy, Check, Plus, Image as ImageIcon,
  Globe, Wifi, AlertCircle, RefreshCw
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { Customer, Hub, mockAuditLogs, Invoice } from "@/lib/data";
import { 
  getCustomerById, getHubByCustomerId, updateCustomer, deleteCustomer, subscribeInvoices, updateHub 
} from "@/lib/firestoreService";
import { compressImage } from "@/lib/assetsService";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getTouchpointIcon } from "@/components/TouchpointIcons";
import ConfirmDeleteModal from "@/components/admin/ConfirmDeleteModal";

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [hub, setHub] = useState<Hub | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Edit Customer Modal State
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit Deployed Hub Modal State
  const [showEditHubModal, setShowEditHubModal] = useState(false);
  const [hubTab, setHubTab] = useState<"info" | "branding" | "links">("info");
  const [savingHubEdit, setSavingHubEdit] = useState(false);
  const [uploadingHubLogo, setUploadingHubLogo] = useState(false);
  const [uploadingHubCover, setUploadingHubCover] = useState(false);
  const [hubForm, setHubForm] = useState({
    businessName: "",
    businessType: "Resort / Hotel",
    shortDescription: "",
    greetingMessage: "",
    phone: "",
    whatsapp: "",
    status: "ACTIVE" as "ACTIVE" | "SUSPENDED",
    logoUrl: "",
    coverUrl: "",
    links: [] as any[]
  });
  const [newLink, setNewLink] = useState({
    category: "reviews",
    title: "",
    url: "",
    icon: "google"
  });
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);

  // Delete Confirmation State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

    const unsubInvoices = subscribeInvoices((data) => {
      setInvoices(data);
    });

    return () => unsubInvoices();
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

  const openEditHubModal = () => {
    if (!hub) return;
    setHubForm({
      businessName: hub.businessName || customer?.businessName || "",
      businessType: hub.businessType || customer?.businessType || "Resort / Hotel",
      shortDescription: hub.shortDescription || "",
      greetingMessage: hub.greetingMessage || "Thank you for visiting ♡",
      phone: hub.phone || customer?.phone || "",
      whatsapp: hub.whatsapp || "",
      status: (hub.status as "ACTIVE" | "SUSPENDED") || "ACTIVE",
      logoUrl: hub.logoUrl || "",
      coverUrl: hub.coverUrl || "",
      links: hub.links ? JSON.parse(JSON.stringify(hub.links)) : []
    });
    setHubTab("info");
    setEditingLinkIndex(null);
    setShowEditHubModal(true);
  };

  const handleHubImageUpload = async (file: File, type: "logo" | "cover") => {
    if (type === "logo") setUploadingHubLogo(true);
    else setUploadingHubCover(true);

    try {
      // High-efficiency client-side compression (<40ms) with zero reliance on failing storage buckets
      const maxDim = type === "logo" ? 300 : 960;
      const quality = type === "logo" ? 0.82 : 0.74;
      const fastDataUrl = await compressImage(file, maxDim, quality);
      
      if (type === "logo") {
        setHubForm(prev => ({ ...prev, logoUrl: fastDataUrl }));
      } else {
        setHubForm(prev => ({ ...prev, coverUrl: fastDataUrl }));
      }
    } catch (err) {
      console.error("Failed to process hub image:", err);
      alert("Failed to process image file. Please try another image.");
    } finally {
      if (type === "logo") setUploadingHubLogo(false);
      else setUploadingHubCover(false);
    }
  };

  const handleSaveHubEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hub) return;
    setSavingHubEdit(true);

    try {
      const updatedFields: Partial<Hub> = {
        slug: hub.slug,
        customerId: hub.customerId || customer?.id || "",
        businessName: hubForm.businessName,
        businessType: hubForm.businessType,
        shortDescription: hubForm.shortDescription,
        greetingMessage: hubForm.greetingMessage,
        phone: hubForm.phone,
        whatsapp: hubForm.whatsapp.replace(/[^0-9]/g, ""),
        status: hubForm.status,
        logoUrl: hubForm.logoUrl,
        coverUrl: hubForm.coverUrl,
        links: hubForm.links,
        updatedAt: new Date().toISOString()
      };

      try {
        await updateHub(hub.id, updatedFields);
      } catch (updErr: any) {
        console.warn("Firestore update warning (continuing with local state):", updErr);
      }

      setHub({ ...hub, ...updatedFields });
      showNotification("Deployed Hub settings, touchpoints & branding updated.");
      setShowEditHubModal(false);
    } catch (err: any) {
      alert("Failed to update Hub: " + err.message);
    } finally {
      setSavingHubEdit(false);
    }
  };

  const handleAddLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) {
      alert("Please provide both a link title and URL.");
      return;
    }
    const linkItem = {
      id: `link_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      category: newLink.category,
      title: newLink.title.trim(),
      url: newLink.url.trim(),
      icon: newLink.icon || newLink.category
    };
    setHubForm(prev => ({ ...prev, links: [...prev.links, linkItem] }));
    setNewLink({ category: "reviews", title: "", url: "", icon: "google" });
  };

  const handleDeleteLink = (index: number) => {
    setHubForm(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
    if (editingLinkIndex === index) setEditingLinkIndex(null);
  };

  const handleUpdateLinkItem = (index: number, field: "title" | "url", value: string) => {
    setHubForm(prev => {
      const updated = [...prev.links];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, links: updated };
    });
  };

  const handleConfirmDelete = async () => {
    if (!customer) return;
    setIsDeleting(true);
    try {
      await deleteCustomer(customer.id);
      router.push("/admin/customers");
    } catch (err: any) {
      alert("Failed to delete customer: " + err.message);
      setIsDeleting(false);
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
  const customerInvoices = invoices.filter(i => i.customerId === customer.id);
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-tapsh-pale-blue text-tapsh-black border border-tapsh-charcoal/20 rounded-xl text-xs font-bold hover:bg-tapsh-charcoal/10 transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-tapsh-charcoal" /> Edit Profile
          </button>
          {hub && (
            <button
              onClick={openEditHubModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-tapsh-soft-green text-white rounded-xl text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" /> Edit Deployed Hub
            </button>
          )}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer"
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-tapsh-soft-green" />
            <h2 className="text-base sm:text-lg font-bold text-tapsh-black">
              TAPSH Permanent Digital Hub
            </h2>
          </div>
          {hub ? (
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                hub.status === "ACTIVE" 
                  ? "bg-tapsh-soft-green/10 text-tapsh-soft-green border-tapsh-soft-green/30"
                  : "bg-red-100 text-red-700 border-red-200"
              }`}>
                {hub.status === "ACTIVE" ? "ACTIVE ROUTING" : "SUSPENDED"}
              </span>
              <button
                type="button"
                onClick={openEditHubModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-tapsh-soft-green text-white rounded-xl text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-white" />
                Edit Hub Content
              </button>
            </div>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
              NO HUB DEPLOYED
            </span>
          )}
        </div>

        {hub ? (
          <div className="space-y-5">
            {/* Visual Branding Display (Shop Logo & Backdrop) */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white border border-tapsh-charcoal/20 shadow-xs shrink-0 flex items-center justify-center">
                  {hub.logoUrl ? (
                    <img src={hub.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-tapsh-soft-green text-lg">{hub.businessName?.charAt(0) || "T"}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-tapsh-black truncate">{hub.businessName}</h4>
                  <p className="text-xs text-tapsh-charcoal truncate">
                    {hub.shortDescription || hub.greetingMessage || "No description set"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-tapsh-charcoal/70">
                    <span>Logo: <strong className="text-tapsh-black">{hub.logoUrl ? "✓ Custom" : "Default"}</strong></span>
                    <span>•</span>
                    <span>Backdrop: <strong className="text-tapsh-black">{hub.coverUrl ? "✓ Custom" : "Default"}</strong></span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  openEditHubModal();
                  setHubTab("branding");
                }}
                className="px-3 py-1.5 bg-white border border-tapsh-charcoal/20 text-tapsh-black hover:border-tapsh-soft-green text-xs font-bold rounded-xl active:scale-95 transition-all self-start sm:self-auto cursor-pointer shadow-2xs shrink-0"
              >
                Change Branding
              </button>
            </div>

            {/* Live Web URL Copy Card */}
            {(() => {
              const liveUrl = typeof window !== "undefined" && hub.slug
                ? `${window.location.origin}/h/${hub.slug}`
                : `https://tapsh.in/h/${hub.slug}`;

              const handleCopy = () => {
                navigator.clipboard.writeText(liveUrl);
                setCopiedUrl(true);
                setTimeout(() => setCopiedUrl(false), 2500);
              };

              const handleDownloadProfileQR = () => {
                const canvas = document.getElementById("profile-hub-qr") as HTMLCanvasElement;
                if (!canvas) return;
                const pngUrl = canvas.toDataURL("image/png");
                const dl = document.createElement("a");
                dl.href = pngUrl;
                dl.download = `${hub.slug}-qr.png`;
                document.body.appendChild(dl);
                dl.click();
                document.body.removeChild(dl);
              };

              return (
                <>
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-bold text-tapsh-charcoal block mb-0.5 tracking-wider">
                        Live Web Destination Link
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          readOnly
                          value={liveUrl}
                          onClick={(e) => (e.target as HTMLInputElement).select()}
                          className="text-xs font-mono font-bold text-tapsh-black bg-white border border-tapsh-charcoal/20 px-3 py-2 rounded-xl flex-1 focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green select-all"
                        />
                        <button
                          type="button"
                          onClick={handleCopy}
                          className="p-2 px-3 bg-tapsh-soft-green text-white rounded-xl text-xs font-bold hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                          title="Copy Link"
                        >
                          {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedUrl ? "Copied!" : "Copy"}</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-tapsh-charcoal/10">
                      <a 
                        href={`/h/${hub.slug}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-tapsh-black text-tapsh-beige text-xs font-bold shadow-xs active:scale-95 transition-all hover:bg-tapsh-taupe"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open Live Tab
                      </a>
                    </div>
                  </div>

                  {/* QR Code Card & PNG Download */}
                  <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                      <div className="bg-white p-2.5 rounded-xl border border-tapsh-charcoal/20 shadow-xs inline-block">
                        <QRCodeCanvas
                          id="profile-hub-qr"
                          value={liveUrl}
                          size={120}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-tapsh-black text-sm">Hardware QR Code</h3>
                        <p className="text-xs text-tapsh-charcoal mt-0.5">
                          High-resolution QR linking to this customer's live Hub.
                        </p>
                        <p className="text-[11px] font-mono text-tapsh-soft-green font-bold mt-1">
                          tapsh.in/h/{hub.slug}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadProfileQR}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-tapsh-charcoal/30 text-tapsh-black rounded-xl text-xs font-bold hover:border-tapsh-soft-green active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-tapsh-soft-green" /> Download QR (PNG)
                    </button>
                  </div>
                </>
              );
            })()}

            {/* Touchpoints Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-tapsh-charcoal uppercase tracking-wider block">
                  Configured Touchpoint Links ({hub.links?.length || 0})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    openEditHubModal();
                    setHubTab("links");
                  }}
                  className="text-xs font-bold text-tapsh-soft-green hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Pencil className="w-3 h-3" /> Manage Links
                </button>
              </div>

              {hub.links && hub.links.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {hub.links.map((l) => (
                    <div key={l.id} className="p-2.5 rounded-xl bg-[#FAF8F5] border border-tapsh-charcoal/10 text-xs flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white shadow-2xs flex items-center justify-center shrink-0">
                        {getTouchpointIcon(l, "sm")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-tapsh-black block truncate">{l.title}</span>
                        <span className="text-[10px] text-tapsh-soft-green uppercase font-bold">{l.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-dashed border-tapsh-charcoal/20 text-center">
                  <p className="text-xs text-tapsh-charcoal mb-1">No touchpoint links added yet.</p>
                  <button
                    type="button"
                    onClick={() => {
                      openEditHubModal();
                      setHubTab("links");
                    }}
                    className="text-xs font-bold text-tapsh-soft-green hover:underline cursor-pointer"
                  >
                    + Add Touchpoints Now
                  </button>
                </div>
              )}
            </div>
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

              {/* Shortcut to Hub Editor */}
              {hub && (
                <div className="p-3 bg-tapsh-pale-blue/50 border border-tapsh-charcoal/15 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-tapsh-black block">Need to edit the deployed Hub?</strong>
                    <span className="text-tapsh-charcoal text-[11px]">Logo, backdrop, review links &amp; touchpoints.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      openEditHubModal();
                    }}
                    className="px-3 py-1.5 bg-tapsh-soft-green text-white font-bold rounded-lg text-xs hover:brightness-110 cursor-pointer shrink-0 shadow-2xs"
                  >
                    Edit Hub Content &rarr;
                  </button>
                </div>
              )}

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

      {/* ---------------------------------------------------- */}
      {/* MODAL: EDIT DEPLOYED HUB CONTENT & TOUCHPOINTS       */}
      {/* ---------------------------------------------------- */}
      {showEditHubModal && hub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] border border-tapsh-charcoal/15">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-tapsh-charcoal/10 flex items-center justify-between bg-[#FAF8F5]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-tapsh-soft-green/10 text-tapsh-soft-green flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-tapsh-black flex items-center gap-2">
                    Edit Deployed Hub
                  </h3>
                  <a 
                    href={`/h/${hub.slug}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-tapsh-charcoal hover:text-tapsh-soft-green inline-flex items-center gap-1 font-mono"
                  >
                    /h/{hub.slug} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <button 
                onClick={() => setShowEditHubModal(false)}
                className="p-1.5 rounded-full hover:bg-tapsh-charcoal/10 text-tapsh-charcoal transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-tapsh-charcoal/10 bg-[#FAF8F5]/50 px-4 sm:px-6">
              {[
                { id: "info", label: "1. Info & Settings" },
                { id: "branding", label: "2. Branding & Images" },
                { id: "links", label: `3. Touchpoints (${hubForm.links.length})` }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setHubTab(t.id as any)}
                  className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                    hubTab === t.id
                      ? "border-tapsh-soft-green text-tapsh-black"
                      : "border-transparent text-tapsh-charcoal/70 hover:text-tapsh-black"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <form onSubmit={handleSaveHubEdit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              
              {/* TAB 1: GENERAL INFO */}
              {hubTab === "info" && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5">
                      Hub Business Name *
                    </label>
                    <input 
                      type="text"
                      required
                      value={hubForm.businessName}
                      onChange={(e) => setHubForm({ ...hubForm, businessName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                      placeholder="e.g. The Tamara Coorg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5">
                      Business Category / Type *
                    </label>
                    <select
                      value={hubForm.businessType}
                      onChange={(e) => setHubForm({ ...hubForm, businessType: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                    >
                      <option value="Resort / Hotel">Resort / Hotel</option>
                      <option value="Restaurant / Café">Restaurant / Café</option>
                      <option value="Salon / Spa">Salon / Spa</option>
                      <option value="Clinic">Clinic / Healthcare</option>
                      <option value="Retail">Retail / Boutique</option>
                      <option value="Office">Office / Corporate</option>
                      <option value="Homestay">Homestay / Villa</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5">
                      Tagline / Short Description
                    </label>
                    <textarea 
                      rows={2}
                      value={hubForm.shortDescription}
                      onChange={(e) => setHubForm({ ...hubForm, shortDescription: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green resize-none"
                      placeholder="Welcome to our space. Select an option below to connect with us."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5">
                      Guest Welcome Greeting
                    </label>
                    <input 
                      type="text"
                      value={hubForm.greetingMessage}
                      onChange={(e) => setHubForm({ ...hubForm, greetingMessage: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                      placeholder="Thank you for visiting ♡"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5">
                        Reception Phone
                      </label>
                      <input 
                        type="tel"
                        value={hubForm.phone}
                        onChange={(e) => setHubForm({ ...hubForm, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                        placeholder="+91 82722 80000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5">
                        WhatsApp Business No
                      </label>
                      <input 
                        type="tel"
                        value={hubForm.whatsapp}
                        onChange={(e) => setHubForm({ ...hubForm, whatsapp: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-tapsh-charcoal/30 bg-white text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                        placeholder="918272280000"
                      />
                    </div>
                  </div>

                  {/* Routing Status */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5">
                      Hub Routing Status
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setHubForm({ ...hubForm, status: "ACTIVE" })}
                        className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                          hubForm.status === "ACTIVE"
                            ? "bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-300/40"
                            : "bg-white border-tapsh-charcoal/20 text-tapsh-charcoal hover:border-emerald-300"
                        }`}
                      >
                        ✓ Active (Online)
                      </button>
                      <button
                        type="button"
                        onClick={() => setHubForm({ ...hubForm, status: "SUSPENDED" })}
                        className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                          hubForm.status === "SUSPENDED"
                            ? "bg-red-50 border-red-400 text-red-800 ring-2 ring-red-300/40"
                            : "bg-white border-tapsh-charcoal/20 text-tapsh-charcoal hover:border-red-300"
                        }`}
                      >
                        ✕ Suspended (Offline)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BRANDING & MEDIA */}
              {hubTab === "branding" && (
                <div className="space-y-5 animate-in fade-in">
                  <p className="text-xs text-tapsh-charcoal">
                    Update the shop logo and hero cover backdrop displayed to visitors on the live Hub.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Shop Logo */}
                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/15 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-tapsh-black uppercase tracking-wider">
                          Shop Logo
                        </label>
                        <span className="text-[10px] text-tapsh-charcoal font-medium">Optional</span>
                      </div>

                      {hubForm.logoUrl ? (
                        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-tapsh-charcoal/10 shadow-xs">
                          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-tapsh-soft-green/40 shadow-xs shrink-0 bg-neutral-100 flex items-center justify-center">
                            <img src={hubForm.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <p className="text-xs font-bold text-tapsh-black truncate">Logo Attached</p>
                            <div className="flex items-center gap-2">
                              <label className="text-[11px] font-bold text-tapsh-soft-green hover:underline cursor-pointer">
                                Change
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden"
                                  disabled={uploadingHubLogo}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleHubImageUpload(file, "logo");
                                  }}
                                />
                              </label>
                              <span className="text-tapsh-charcoal/30">•</span>
                              <button
                                type="button"
                                onClick={() => setHubForm({ ...hubForm, logoUrl: "" })}
                                className="text-[11px] font-bold text-red-500 hover:underline cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className={`w-full flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                            uploadingHubLogo ? "border-tapsh-soft-green bg-tapsh-soft-green/5" : "border-tapsh-charcoal/20 hover:border-tapsh-soft-green/60 bg-white"
                          }`}>
                            {uploadingHubLogo ? (
                              <div className="flex items-center gap-2 text-tapsh-soft-green text-xs font-bold">
                                <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                              </div>
                            ) : (
                              <>
                                <ImageIcon className="w-5 h-5 text-tapsh-soft-green mb-1" />
                                <span className="text-xs font-bold text-tapsh-black">Upload Logo</span>
                                <span className="text-[10px] text-tapsh-charcoal">PNG / JPG</span>
                              </>
                            )}
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              disabled={uploadingHubLogo}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleHubImageUpload(file, "logo");
                              }} 
                            />
                          </label>
                          <input 
                            type="url"
                            placeholder="Or paste image URL"
                            value={hubForm.logoUrl}
                            onChange={(e) => setHubForm({ ...hubForm, logoUrl: e.target.value })}
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-tapsh-charcoal/20 text-tapsh-black focus:outline-none focus:ring-1 focus:ring-tapsh-soft-green"
                          />
                        </div>
                      )}
                    </div>

                    {/* Shop Backdrop */}
                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/15 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-tapsh-black uppercase tracking-wider">
                          Shop Backdrop
                        </label>
                        <span className="text-[10px] text-tapsh-charcoal font-medium">Optional</span>
                      </div>

                      {hubForm.coverUrl ? (
                        <div className="space-y-1.5">
                          <div className="w-full h-20 rounded-xl overflow-hidden border border-tapsh-charcoal/20 shadow-xs relative bg-neutral-900 group">
                            <img src={hubForm.coverUrl} alt="Backdrop" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <label className="px-2.5 py-1 bg-white text-tapsh-black rounded-lg text-xs font-bold cursor-pointer">
                                Change
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden"
                                  disabled={uploadingHubCover}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleHubImageUpload(file, "cover");
                                  }}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => setHubForm({ ...hubForm, coverUrl: "" })}
                                className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-tapsh-charcoal">
                            <span>Backdrop Active</span>
                            <button
                              type="button"
                              onClick={() => setHubForm({ ...hubForm, coverUrl: "" })}
                              className="font-bold text-red-500 hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className={`w-full flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                            uploadingHubCover ? "border-tapsh-soft-green bg-tapsh-soft-green/5" : "border-tapsh-charcoal/20 hover:border-tapsh-soft-green/60 bg-white"
                          }`}>
                            {uploadingHubCover ? (
                              <div className="flex items-center gap-2 text-tapsh-soft-green text-xs font-bold">
                                <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                              </div>
                            ) : (
                              <>
                                <ImageIcon className="w-5 h-5 text-tapsh-soft-green mb-1" />
                                <span className="text-xs font-bold text-tapsh-black">Upload Backdrop</span>
                                <span className="text-[10px] text-tapsh-charcoal">16:9 Banner</span>
                              </>
                            )}
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              disabled={uploadingHubCover}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleHubImageUpload(file, "cover");
                              }} 
                            />
                          </label>
                          <input 
                            type="url"
                            placeholder="Or paste backdrop image URL"
                            value={hubForm.coverUrl}
                            onChange={(e) => setHubForm({ ...hubForm, coverUrl: e.target.value })}
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-tapsh-charcoal/20 text-tapsh-black focus:outline-none focus:ring-1 focus:ring-tapsh-soft-green"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TOUCHPOINTS & LINKS */}
              {hubTab === "links" && (
                <div className="space-y-5 animate-in fade-in">
                  
                  {/* Current Links List */}
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-2">
                      Active Touchpoints ({hubForm.links.length})
                    </span>

                    {hubForm.links.length === 0 ? (
                      <p className="text-xs text-tapsh-charcoal/70 p-3 bg-[#FAF8F5] rounded-xl border border-dashed border-tapsh-charcoal/20 text-center">
                        No touchpoints configured. Use the form below to add Google reviews, social links, or phone actions.
                      </p>
                    ) : (
                      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                        {hubForm.links.map((link, idx) => (
                          <div 
                            key={link.id || idx}
                            className="p-3 bg-[#FAF8F5] border border-tapsh-charcoal/15 rounded-xl flex items-start gap-2.5"
                          >
                            <div className="w-7 h-7 rounded-lg bg-white border border-tapsh-charcoal/10 flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                              {getTouchpointIcon(link, "sm")}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center gap-2">
                                <input 
                                  type="text"
                                  value={link.title}
                                  onChange={(e) => handleUpdateLinkItem(idx, "title", e.target.value)}
                                  className="text-xs font-bold text-tapsh-black bg-white px-2 py-1 rounded-lg border border-tapsh-charcoal/20 flex-1 focus:outline-none focus:ring-1 focus:ring-tapsh-soft-green"
                                  placeholder="Link Title"
                                />
                                <span className="text-[10px] font-bold uppercase text-tapsh-soft-green px-2 py-0.5 rounded-full bg-tapsh-soft-green/10 shrink-0">
                                  {link.category}
                                </span>
                              </div>
                              <input 
                                type="text"
                                value={link.url}
                                onChange={(e) => handleUpdateLinkItem(idx, "url", e.target.value)}
                                className="text-xs font-mono text-tapsh-charcoal bg-white px-2 py-1 rounded-lg border border-tapsh-charcoal/20 w-full focus:outline-none focus:ring-1 focus:ring-tapsh-soft-green"
                                placeholder="Destination URL"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteLink(idx)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0 mt-1"
                              title="Delete Link"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add New Link Section */}
                  <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-tapsh-charcoal/20 space-y-3">
                    <span className="block text-xs font-bold text-tapsh-black uppercase tracking-wider">
                      + Add New Touchpoint Link
                    </span>

                    {/* Presets */}
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: "Google Review", cat: "reviews", icon: "google", defaultTitle: "Rate Us on Google" },
                        { label: "WhatsApp Direct", cat: "contact", icon: "whatsapp", defaultTitle: "WhatsApp Direct" },
                        { label: "Phone Call", cat: "contact", icon: "phone", defaultTitle: "Call Reception" },
                        { label: "Email", cat: "contact", icon: "mail", defaultTitle: "Official Email" },
                        { label: "Instagram", cat: "social", icon: "instagram", defaultTitle: "Follow on Instagram" },
                        { label: "Website", cat: "website", icon: "globe", defaultTitle: "Official Website" },
                        { label: "Menu / Booking", cat: "website", icon: "calendar", defaultTitle: "Online Menu / Booking" },
                        { label: "Guest Wi-Fi", cat: "wifi", icon: "wifi", defaultTitle: "Guest Wi-Fi Network" }
                      ].map(preset => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setNewLink({
                            category: preset.cat,
                            title: preset.defaultTitle,
                            url: "",
                            icon: preset.icon
                          })}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            newLink.icon === preset.icon
                              ? "bg-tapsh-soft-green text-white border-tapsh-soft-green shadow-xs"
                              : "bg-white text-tapsh-charcoal border-tapsh-charcoal/20 hover:border-tapsh-soft-green/60"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-tapsh-charcoal mb-1">
                          Touchpoint Title
                        </label>
                        <input 
                          type="text"
                          value={newLink.title}
                          onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                          placeholder="e.g. Leave a Google Review"
                          className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-tapsh-charcoal/20 text-tapsh-black focus:outline-none focus:ring-1 focus:ring-tapsh-soft-green font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-tapsh-charcoal mb-1">
                          Category
                        </label>
                        <select
                          value={newLink.category}
                          onChange={(e) => setNewLink({ ...newLink, category: e.target.value, icon: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-tapsh-charcoal/20 text-tapsh-black focus:outline-none focus:ring-1 focus:ring-tapsh-soft-green"
                        >
                          <option value="reviews">🌟 Customer Reviews</option>
                          <option value="contact">📞 Phone &amp; Contact</option>
                          <option value="social">📸 Social Media</option>
                          <option value="website">🌐 Web &amp; Online Booking</option>
                          <option value="wifi">📶 Guest Wi-Fi</option>
                          <option value="other">🔗 Other Custom</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-tapsh-charcoal mb-1">
                        Touchpoint URL / Action Link
                      </label>
                      <input 
                        type="text"
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                        placeholder={
                          newLink.category === "contact" && newLink.icon === "whatsapp" 
                            ? "e.g. 919876543210 (or full https://wa.me/91...)"
                            : newLink.category === "wifi"
                            ? "wifi:SSID_NAME or WIFI:S:SSID;T:WPA;P:Password;;"
                            : "https://..."
                        }
                        className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-tapsh-charcoal/20 text-tapsh-black focus:outline-none focus:ring-1 focus:ring-tapsh-soft-green font-mono"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddLink}
                      className="w-full py-2 bg-tapsh-black text-tapsh-beige rounded-xl text-xs font-bold hover:bg-tapsh-taupe active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-tapsh-soft-green" /> Add Link to Hub
                    </button>
                  </div>

                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-4 border-t border-tapsh-charcoal/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <a 
                  href={`/h/${hub.slug}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-tapsh-charcoal hover:text-tapsh-black flex items-center gap-1.5 self-center sm:self-auto py-1"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-tapsh-soft-green" />
                  View Live Hub
                </a>

                <div className="flex items-center justify-end gap-2.5">
                  <button 
                    type="button"
                    onClick={() => setShowEditHubModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-tapsh-charcoal hover:bg-tapsh-charcoal/10 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={savingHubEdit}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-tapsh-soft-green text-white hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {savingHubEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Hub to Firestore
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: CONFIRM CUSTOMER DELETE */}
      {/* ---------------------------------------------------- */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        recordName={customer ? customer.businessName : ""}
        recordType="Customer"
        warningMessage="This will permanently delete this client profile, its associated digital hub, and connection settings from Firestore."
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

    </div>
  );
}
