"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Settings, Image as ImageIcon, Sparkles, Upload, RotateCcw, 
  Check, ExternalLink, AlertCircle, Eye, Search, Filter,
  ShieldCheck, Database, RefreshCw, X, CheckCircle2, Globe, User,
  Package, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, ChevronDown, Star,
  Wifi, MessageCircle, Camera, LayoutGrid, Layers, ArrowUpRight
} from "lucide-react";
import { useSiteAssets } from "@/context/SiteAssetsContext";
import { 
  MEDIA_ASSET_REGISTRY, 
  MEDIA_CATEGORIES, 
  MediaAssetDefinition 
} from "@/lib/mediaAssetsRegistry";
import { 
  ProductItem, 
  subscribeToProducts, 
  saveProduct, 
  deleteProduct, 
  uploadProductImage,
  resetToDefaultProducts,
  DEFAULT_PRODUCTS 
} from "@/lib/productsService";
import ProductSlideshow from "@/components/products/ProductSlideshow";

export default function AdminSettingsPage() {
  const { assets, isLoaded, getAsset, isCustom, updateAsset, resetAsset, resetAll } = useSiteAssets();
  
  // Section Expand/Collapse State (Sections as Lists)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    content: true,
    products: true,
    identity: false,
    system: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleExpandAll = () => {
    setOpenSections({ content: true, products: true, identity: true, system: true });
  };

  const handleCollapseAll = () => {
    setOpenSections({ content: false, products: false, identity: false, system: false });
  };
  
  // Category filter for Media Assets
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Upload & action states for Media Assets
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewModalImage, setPreviewModalImage] = useState<{ title: string; url: string } | null>(null);
  const [urlInputOpenKey, setUrlInputOpenKey] = useState<string | null>(null);
  const [customUrlValue, setCustomUrlValue] = useState("");

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // ----------------------------------------------------
  // PRODUCTS STATE & MANAGEMENT
  // ----------------------------------------------------
  const [products, setProducts] = useState<ProductItem[]>(DEFAULT_PRODUCTS);
  const [productSearch, setProductSearch] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<ProductItem> | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isUploadingProductImages, setIsUploadingProductImages] = useState(false);
  const [productUrlInput, setProductUrlInput] = useState("");
  const productFileInputRef = useRef<HTMLInputElement | null>(null);

  // Read URL query parameter on mount (e.g. /admin/settings?tab=products)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "products") {
        setOpenSections({ content: false, products: true, identity: false, system: false });
      } else if (tab === "content") {
        setOpenSections({ content: true, products: false, identity: false, system: false });
      } else if (tab === "identity") {
        setOpenSections({ content: false, products: false, identity: true, system: false });
      } else if (tab === "system") {
        setOpenSections({ content: false, products: false, identity: false, system: true });
      }
    }
  }, []);

  // Subscribe to real-time products
  useEffect(() => {
    const unsubscribe = subscribeToProducts((items) => {
      setProducts(items);
    });
    return () => unsubscribe();
  }, []);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // ----------------------------------------------------
  // MEDIA ASSET HANDLERS
  // ----------------------------------------------------
  const handleFileUpload = async (asset: MediaAssetDefinition, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showFeedback("Image file is too large (max 10MB). Please select a smaller image.", "error");
      return;
    }

    try {
      setUpdatingKey(asset.key);
      await updateAsset(asset.key, file);
      showFeedback(`Successfully updated ${asset.label}! Synced to Firebase.`);
    } catch (err) {
      console.error(err);
      showFeedback(`Failed to update ${asset.label}. Please try again.`, "error");
    } finally {
      setUpdatingKey(null);
      if (fileInputRefs.current[asset.key]) {
        fileInputRefs.current[asset.key]!.value = "";
      }
    }
  };

  const handleCustomUrlSubmit = async (key: string) => {
    if (!customUrlValue.trim()) return;
    try {
      setUpdatingKey(key);
      await updateAsset(key, customUrlValue.trim());
      showFeedback("Custom image URL saved to Firebase!");
      setUrlInputOpenKey(null);
      setCustomUrlValue("");
    } catch (err) {
      console.error(err);
      showFeedback("Failed to save image URL.", "error");
    } finally {
      setUpdatingKey(null);
    }
  };

  const handleResetSingle = async (asset: MediaAssetDefinition) => {
    try {
      setUpdatingKey(asset.key);
      await resetAsset(asset.key);
      showFeedback(`Reverted ${asset.label} to system default.`);
    } catch (err) {
      console.error(err);
      showFeedback("Failed to reset asset.", "error");
    } finally {
      setUpdatingKey(null);
    }
  };

  const handleResetAllConfirm = async () => {
    if (confirm("Are you sure you want to revert all custom images back to original system defaults?")) {
      try {
        await resetAll();
        showFeedback("All website and admin images reverted to defaults.");
      } catch (err) {
        console.error(err);
        showFeedback("Failed to reset all assets.", "error");
      }
    }
  };

  // ----------------------------------------------------
  // PRODUCT CRUD HANDLERS
  // ----------------------------------------------------
  const handleOpenCreateProduct = () => {
    setEditingProduct({
      id: `prod-${Date.now()}`,
      name: "",
      slug: "",
      tagline: "",
      description: "",
      benefit: "",
      images: [],
      iconType: "sparkles",
      category: "General",
      badge: "",
      features: [],
      status: "ACTIVE",
    });
    setProductUrlInput("");
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: ProductItem) => {
    setEditingProduct({ ...prod, images: [...(prod.images || [])] });
    setProductUrlInput("");
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (prod: ProductItem) => {
    if (confirm(`Are you sure you want to delete "${prod.name}"? It will be removed from the public website immediately.`)) {
      try {
        await deleteProduct(prod.id);
        showFeedback(`Product "${prod.name}" deleted from Firebase.`);
      } catch (err) {
        console.error(err);
        showFeedback("Failed to delete product.", "error");
      }
    }
  };

  const handleUploadProductImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingProduct) return;

    setIsUploadingProductImages(true);
    const prodId = editingProduct.id || `prod-${Date.now()}`;
    const newImageUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadedUrl = await uploadProductImage(prodId, file);
        if (uploadedUrl) newImageUrls.push(uploadedUrl);
      }

      setEditingProduct((prev) => ({
        ...prev,
        images: [...(prev?.images || []), ...newImageUrls],
      }));
      showFeedback(`Added ${newImageUrls.length} image(s) to product!`);
    } catch (err) {
      console.error(err);
      showFeedback("Failed to upload some images.", "error");
    } finally {
      setIsUploadingProductImages(false);
      if (productFileInputRef.current) productFileInputRef.current.value = "";
    }
  };

  const handleAddProductImageUrl = () => {
    if (!productUrlInput.trim() || !editingProduct) return;
    setEditingProduct((prev) => ({
      ...prev,
      images: [...(prev?.images || []), productUrlInput.trim()],
    }));
    setProductUrlInput("");
    showFeedback("Image URL added to product gallery!");
  };

  const handleRemoveProductImage = (indexToRemove: number) => {
    if (!editingProduct) return;
    setEditingProduct((prev) => ({
      ...prev,
      images: (prev?.images || []).filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleMakeCoverImage = (indexToCover: number) => {
    if (!editingProduct) return;
    const current = [...(editingProduct.images || [])];
    const [selected] = current.splice(indexToCover, 1);
    current.unshift(selected);
    setEditingProduct((prev) => ({ ...prev, images: current }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name?.trim()) {
      showFeedback("Product Title is required.", "error");
      return;
    }

    try {
      setIsSavingProduct(true);
      await saveProduct(editingProduct);
      showFeedback(`Product "${editingProduct.name}" saved to Firebase! Live on website.`);
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error(err);
      showFeedback("Failed to save product.", "error");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleResetDefaultProducts = async () => {
    if (confirm("Reset all products back to standard 6 TAPSH default products?")) {
      try {
        await resetToDefaultProducts();
        showFeedback("Products catalog restored to factory defaults.");
      } catch (err) {
        console.error(err);
        showFeedback("Failed to reset products.", "error");
      }
    }
  };

  // Filter Media Assets
  const filteredAssets = MEDIA_ASSET_REGISTRY.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = 
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.key.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const customCount = MEDIA_ASSET_REGISTRY.filter((item) => isCustom(item.key)).length;

  // Filter Products
  const filteredProducts = products.filter((prod) => {
    const term = productSearch.toLowerCase();
    return (
      prod.name.toLowerCase().includes(term) ||
      prod.description.toLowerCase().includes(term) ||
      prod.benefit.toLowerCase().includes(term) ||
      (prod.category && prod.category.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Toast Notification */}
      {feedbackMessage && (
        <div 
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold transition-all transform animate-in slide-in-from-top-3 ${
            feedbackMessage.type === "success" 
              ? "bg-tapsh-black text-white border border-tapsh-soft-green" 
              : "bg-red-600 text-white border border-red-400"
          }`}
        >
          {feedbackMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-tapsh-soft-green shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-white shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-tapsh-charcoal/20 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-tapsh-black text-white flex items-center justify-center shadow-sm">
              <Settings className="w-5 h-5 text-tapsh-soft-green" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-tapsh-black tracking-tight">
                Settings & Sections
              </h1>
              <p className="text-xs sm:text-sm text-tapsh-charcoal mt-0.5">
                Click each section list below to open and manage content, media, products, and cloud services.
              </p>
            </div>
          </div>
        </div>

        {/* Global Expand / Collapse Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExpandAll}
            className="px-3.5 py-2 text-xs font-bold text-tapsh-black bg-white hover:bg-tapsh-pale-blue/60 rounded-xl border border-tapsh-charcoal/20 transition-all cursor-pointer shadow-xs"
          >
            Expand All
          </button>
          <button
            onClick={handleCollapseAll}
            className="px-3.5 py-2 text-xs font-bold text-tapsh-charcoal hover:text-tapsh-black bg-white hover:bg-tapsh-pale-blue/60 rounded-xl border border-tapsh-charcoal/20 transition-all cursor-pointer shadow-xs"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SECTIONS AS LIST ITEMS (CLICK TO OPEN & REVEAL DATA) */}
      {/* ---------------------------------------------------- */}
      <div className="space-y-5">

        {/* ==================================================== */}
        {/* LIST ITEM 1: CONTENT & MEDIA ASSETS SECTION */}
        {/* ==================================================== */}
        <div className="bg-white rounded-3xl border border-tapsh-charcoal/20 shadow-xs overflow-hidden transition-all">
          
          {/* Clickable Section Row */}
          <button
            onClick={() => toggleSection("content")}
            className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left hover:bg-tapsh-pale-blue/15 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-tapsh-black text-white flex items-center justify-center shrink-0 shadow-sm">
                <ImageIcon className="w-6 h-6 text-tapsh-soft-green" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-tapsh-black">
                    Content & Media Assets
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-tapsh-soft-green/15 text-tapsh-soft-green">
                    {MEDIA_ASSET_REGISTRY.length} Assets
                  </span>
                  {customCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-tapsh-black text-white">
                      {customCount} Custom
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-tapsh-charcoal mt-1">
                  Website dark/white logos, brand favicon, homepage hero backdrop, lifestyle NFC card, and industry hub mockups.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="hidden sm:inline-block text-xs font-bold text-tapsh-charcoal">
                {openSections.content ? "Hide" : "Open"}
              </span>
              <div className={`w-9 h-9 rounded-full bg-tapsh-pale-blue flex items-center justify-center text-tapsh-black transition-transform duration-300 ${
                openSections.content ? "rotate-180 bg-tapsh-soft-green text-white" : ""
              }`}>
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </button>

          {/* Section Body Content */}
          {openSections.content && (
            <div className="p-5 sm:p-8 pt-2 border-t border-tapsh-charcoal/15 space-y-6 animate-in slide-in-from-top-2 duration-200">
              
              {/* Filter & Search Bar */}
              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-tapsh-charcoal/15 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                  {MEDIA_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        selectedCategory === cat
                          ? "bg-tapsh-soft-green text-white shadow-xs"
                          : "bg-white text-tapsh-charcoal hover:text-tapsh-black border border-tapsh-charcoal/15"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <div className="relative w-full md:w-64">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-tapsh-charcoal" />
                    <input
                      type="text"
                      placeholder="Search images..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white border border-tapsh-charcoal/20 rounded-xl text-xs focus:outline-none focus:border-tapsh-soft-green transition-colors"
                    />
                  </div>

                  {customCount > 0 && (
                    <button
                      onClick={handleResetAllConfirm}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-tapsh-charcoal hover:text-red-500 bg-white rounded-xl border border-tapsh-charcoal/20 transition-all cursor-pointer shrink-0"
                    >
                      <RotateCcw className="w-3 h-3" /> Revert All
                    </button>
                  )}
                </div>
              </div>

              {/* ASSET CARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAssets.map((asset) => {
                  const liveValue = getAsset(asset.key, asset.defaultPath);
                  const customActive = isCustom(asset.key);
                  const isUpdating = updatingKey === asset.key;
                  const isUrlOpen = urlInputOpenKey === asset.key;

                  return (
                    <div
                      key={asset.key}
                      className="bg-white rounded-2xl border border-tapsh-charcoal/20 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-tapsh-taupe">
                              {asset.category}
                            </span>
                            <h3 className="font-bold text-tapsh-black text-base mt-0.5 leading-snug">
                              {asset.label}
                            </h3>
                          </div>

                          {customActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-tapsh-soft-green/15 text-tapsh-soft-green shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-tapsh-soft-green animate-pulse"></span>
                              Firebase Custom
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-tapsh-charcoal/10 text-tapsh-charcoal shrink-0">
                              Default
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-tapsh-charcoal mb-4 line-clamp-2">
                          {asset.description}
                        </p>

                        {/* Image Preview Container */}
                        <div className="relative w-full aspect-video bg-[#1F2022] rounded-xl overflow-hidden border border-tapsh-charcoal/15 flex items-center justify-center p-3 mb-4 group/preview">
                          {asset.type === "text" ? (
                            <div className="text-center p-4">
                              <span className="text-xs uppercase text-tapsh-gray tracking-wider">Current Text Value</span>
                              <p className="text-base font-bold text-white mt-1">{liveValue || "TAPSH Operations"}</p>
                            </div>
                          ) : liveValue ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                              <img
                                src={liveValue}
                                alt={asset.label}
                                className="max-h-full max-w-full object-contain drop-shadow-md transition-transform duration-300 group-hover/preview:scale-105"
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-tapsh-gray text-xs">
                              <div className="w-10 h-10 rounded-full bg-tapsh-pale-blue text-tapsh-black flex items-center justify-center font-bold text-sm mb-1">
                                TS
                              </div>
                              <span>No avatar set</span>
                            </div>
                          )}

                          {liveValue && asset.type === "image" && (
                            <button
                              onClick={() => setPreviewModalImage({ title: asset.label, url: liveValue })}
                              className="absolute inset-0 bg-tapsh-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold backdrop-blur-xs cursor-pointer"
                            >
                              <Eye className="w-4 h-4 text-tapsh-soft-green" /> Click to Inspect
                            </button>
                          )}

                          {isUpdating && (
                            <div className="absolute inset-0 bg-tapsh-black/80 flex flex-col items-center justify-center text-white text-xs gap-2 z-20 backdrop-blur-xs">
                              <RefreshCw className="w-6 h-6 animate-spin text-tapsh-soft-green" />
                              <span className="font-semibold">Syncing to Firebase...</span>
                            </div>
                          )}
                        </div>

                        <div className="text-[11px] text-tapsh-charcoal/80 mb-4 bg-tapsh-pale-blue/30 p-2.5 rounded-xl border border-tapsh-charcoal/10">
                          <strong>Recommended:</strong> {asset.recommendedSize}
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-tapsh-charcoal/15">
                        <input
                          type="file"
                          ref={(el) => {
                            fileInputRefs.current[asset.key] = el;
                          }}
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          onChange={(e) => handleFileUpload(asset, e)}
                          className="hidden"
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => fileInputRefs.current[asset.key]?.click()}
                            disabled={isUpdating}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-tapsh-black hover:bg-tapsh-soft-green text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Choose File</span>
                          </button>

                          <button
                            onClick={() => {
                              setUrlInputOpenKey(isUrlOpen ? null : asset.key);
                              setCustomUrlValue(customActive ? liveValue : "");
                            }}
                            disabled={isUpdating}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-tapsh-pale-blue hover:bg-tapsh-pale-blue/80 text-tapsh-black rounded-xl text-xs font-bold transition-all border border-tapsh-charcoal/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>URL Link</span>
                          </button>
                        </div>

                        {isUrlOpen && (
                          <div className="p-3 bg-tapsh-pale-blue/50 rounded-xl border border-tapsh-charcoal/20 space-y-2 animate-in slide-in-from-top-2">
                            <label className="text-[10px] uppercase font-bold text-tapsh-charcoal">
                              Paste Direct Image / CDN URL:
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="url"
                                placeholder="https://example.com/image.png"
                                value={customUrlValue}
                                onChange={(e) => setCustomUrlValue(e.target.value)}
                                className="flex-1 px-3 py-1.5 bg-white border border-tapsh-charcoal/20 rounded-xl text-xs focus:outline-none focus:border-tapsh-soft-green"
                              />
                              <button
                                onClick={() => handleCustomUrlSubmit(asset.key)}
                                disabled={isUpdating || !customUrlValue.trim()}
                                className="px-3 py-1.5 bg-tapsh-soft-green text-white rounded-xl text-xs font-bold shadow-xs hover:brightness-105 disabled:opacity-50 cursor-pointer"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        )}

                        {customActive && (
                          <button
                            onClick={() => handleResetSingle(asset)}
                            disabled={isUpdating}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-tapsh-charcoal hover:text-red-500 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Revert to original default</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}
        </div>

        {/* ==================================================== */}
        {/* LIST ITEM 2: PRODUCTS SECTION (ADD, EDIT, SLIDESHOW) */}
        {/* ==================================================== */}
        <div className="bg-white rounded-3xl border border-tapsh-charcoal/20 shadow-xs overflow-hidden transition-all">
          
          {/* Clickable Section Row */}
          <button
            onClick={() => toggleSection("products")}
            className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left hover:bg-tapsh-pale-blue/15 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-tapsh-black text-white flex items-center justify-center shrink-0 shadow-sm">
                <Package className="w-6 h-6 text-tapsh-soft-green" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-tapsh-black">
                    Products & Hardware Catalog
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-tapsh-soft-green/15 text-tapsh-soft-green">
                    {products.length} Products
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-tapsh-charcoal mt-1">
                  Add new products, upload multiple showcase images that auto-slideshow on the website, edit titles & benefits, or delete items.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="hidden sm:inline-block text-xs font-bold text-tapsh-charcoal">
                {openSections.products ? "Hide" : "Open"}
              </span>
              <div className={`w-9 h-9 rounded-full bg-tapsh-pale-blue flex items-center justify-center text-tapsh-black transition-transform duration-300 ${
                openSections.products ? "rotate-180 bg-tapsh-soft-green text-white" : ""
              }`}>
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </button>

          {/* Section Body Content */}
          {openSections.products && (
            <div className="p-5 sm:p-8 pt-2 border-t border-tapsh-charcoal/15 space-y-6 animate-in slide-in-from-top-2 duration-200">
              
              {/* Product Controls Bar */}
              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-tapsh-charcoal/15 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-tapsh-charcoal" />
                  <input
                    type="text"
                    placeholder="Search products by title, benefit, category..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-tapsh-charcoal/20 rounded-xl text-xs focus:outline-none focus:border-tapsh-soft-green transition-colors"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
                  <button
                    onClick={handleOpenCreateProduct}
                    className="flex items-center gap-2 px-4 py-2.5 bg-tapsh-soft-green hover:brightness-105 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Product
                  </button>

                  <Link
                    href="/products"
                    target="_blank"
                    className="flex items-center gap-1.5 px-3 py-2 bg-white text-tapsh-black font-bold text-xs rounded-xl border border-tapsh-charcoal/20 hover:bg-tapsh-pale-blue transition-colors"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-tapsh-soft-green" /> View Website
                  </Link>

                  <button
                    onClick={handleResetDefaultProducts}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-tapsh-charcoal hover:text-red-500 bg-white rounded-xl border border-tapsh-charcoal/15 transition-all cursor-pointer"
                    title="Reset to original 6 products"
                  >
                    <RotateCcw className="w-3 h-3" /> Defaults
                  </button>
                </div>
              </div>

              {/* PRODUCTS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const imageCount = product.images?.length || 0;

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-tapsh-charcoal/20 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      {/* Top Slideshow Visual */}
                      <div>
                        <div className="relative">
                          <ProductSlideshow
                            images={product.images}
                            name={product.name}
                            iconType={product.iconType}
                            className="h-48"
                          />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                            {product.badge && (
                              <span className="px-2.5 py-1 rounded-full bg-tapsh-black text-tapsh-pale-blue text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                {product.badge}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              product.status === "ACTIVE" ? "bg-tapsh-soft-green text-white" : "bg-tapsh-charcoal/20 text-tapsh-black"
                            }`}>
                              {product.status}
                            </span>
                          </div>

                          {/* Image count pill */}
                          <div className="absolute bottom-3 right-3 z-20 px-2.5 py-1 rounded-full bg-black/70 text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1">
                            <ImageIcon className="w-3 h-3 text-tapsh-soft-green" />
                            <span>{imageCount} {imageCount === 1 ? "image" : "images"}</span>
                          </div>
                        </div>

                        {/* Product Content Details */}
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-tapsh-taupe">
                                {product.category || "General"}
                              </span>
                              <h3 className="font-bold text-tapsh-black text-lg leading-tight mt-0.5">
                                {product.name}
                              </h3>
                            </div>
                          </div>

                          <p className="text-xs text-tapsh-charcoal line-clamp-2 mb-4 leading-relaxed">
                            {product.description || "No description provided."}
                          </p>

                          {/* Key Benefit Box */}
                          {product.benefit && (
                            <div className="bg-tapsh-pale-blue/40 p-3 rounded-xl border border-tapsh-charcoal/15 mb-2">
                              <span className="block text-[10px] font-bold uppercase tracking-wider text-tapsh-soft-green mb-0.5">
                                Key Benefit
                              </span>
                              <p className="text-xs font-semibold text-tapsh-black line-clamp-2">
                                {product.benefit}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="p-3.5 bg-[#FAF8F5] border-t border-tapsh-charcoal/15 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditProduct(product)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-tapsh-black hover:bg-tapsh-soft-green text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            className="p-1.5 text-tapsh-charcoal hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          className="text-[11px] font-bold text-tapsh-charcoal hover:text-tapsh-black flex items-center gap-1"
                        >
                          <span>Public Page</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-tapsh-soft-green" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}
        </div>

        {/* ==================================================== */}
        {/* LIST ITEM 3: ADMIN IDENTITY SECTION */}
        {/* ==================================================== */}
        <div className="bg-white rounded-3xl border border-tapsh-charcoal/20 shadow-xs overflow-hidden transition-all">
          
          {/* Clickable Section Row */}
          <button
            onClick={() => toggleSection("identity")}
            className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left hover:bg-tapsh-pale-blue/15 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-tapsh-black text-white flex items-center justify-center shrink-0 shadow-sm">
                <User className="w-6 h-6 text-tapsh-taupe" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-tapsh-black">
                    Admin Identity & Profile
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-tapsh-pale-blue text-tapsh-black">
                    Superadmin
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-tapsh-charcoal mt-1">
                  Custom administrator avatar photo shown in desktop/mobile headers and console display name.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="hidden sm:inline-block text-xs font-bold text-tapsh-charcoal">
                {openSections.identity ? "Hide" : "Open"}
              </span>
              <div className={`w-9 h-9 rounded-full bg-tapsh-pale-blue flex items-center justify-center text-tapsh-black transition-transform duration-300 ${
                openSections.identity ? "rotate-180 bg-tapsh-soft-green text-white" : ""
              }`}>
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </button>

          {/* Section Body Content */}
          {openSections.identity && (
            <div className="p-5 sm:p-8 pt-2 border-t border-tapsh-charcoal/15 space-y-6 animate-in slide-in-from-top-2 duration-200 max-w-3xl">
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-5 bg-[#FAF8F5] rounded-2xl border border-tapsh-charcoal/15">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-tapsh-soft-green bg-tapsh-black flex items-center justify-center shrink-0 shadow-md">
                  {getAsset("admin_avatar") ? (
                    <img
                      src={getAsset("admin_avatar")}
                      alt="Admin Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-white">TS</span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-tapsh-black text-sm">Active Administrator</h4>
                  <p className="text-xs text-tapsh-charcoal">tapsh.support@gmail.com</p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-tapsh-soft-green uppercase tracking-wider">
                    Full Superadmin Privileges
                  </span>
                </div>
                <button
                  onClick={() => {
                    setOpenSections((prev) => ({ ...prev, content: true }));
                    setSelectedCategory("Admin Identity");
                  }}
                  className="px-4 py-2 bg-tapsh-black text-white rounded-xl text-xs font-bold hover:bg-tapsh-soft-green transition-colors cursor-pointer w-fit"
                >
                  Change Avatar in Media
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-tapsh-black">
                  Console Display Label
                </label>
                <input
                  type="text"
                  defaultValue={getAsset("admin_name", "TAPSH Operations")}
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      updateAsset("admin_name", e.target.value.trim());
                      showFeedback("Updated admin display label in Firebase.");
                    }
                  }}
                  placeholder="e.g. TAPSH Operations or System Admin"
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-tapsh-charcoal/20 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-tapsh-soft-green"
                />
                <p className="text-[11px] text-tapsh-charcoal">
                  Shown in the top right desktop header beside your profile picture.
                </p>
              </div>

            </div>
          )}
        </div>

        {/* ==================================================== */}
        {/* LIST ITEM 4: FIREBASE CLOUD SYNC SECTION */}
        {/* ==================================================== */}
        <div className="bg-white rounded-3xl border border-tapsh-charcoal/20 shadow-xs overflow-hidden transition-all">
          
          {/* Clickable Section Row */}
          <button
            onClick={() => toggleSection("system")}
            className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left hover:bg-tapsh-pale-blue/15 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-tapsh-black text-white flex items-center justify-center shrink-0 shadow-sm">
                <Database className="w-6 h-6 text-tapsh-soft-green" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-tapsh-black">
                    Firebase Cloud Sync & Architecture
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-tapsh-soft-green bg-tapsh-soft-green/15">
                    <span className="w-1.5 h-1.5 rounded-full bg-tapsh-soft-green animate-pulse"></span>
                    Live Connected
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-tapsh-charcoal mt-1">
                  Dual-layer persistent storage status, real-time Firestore synchronization, and asset delivery pipeline.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="hidden sm:inline-block text-xs font-bold text-tapsh-charcoal">
                {openSections.system ? "Hide" : "Open"}
              </span>
              <div className={`w-9 h-9 rounded-full bg-tapsh-pale-blue flex items-center justify-center text-tapsh-black transition-transform duration-300 ${
                openSections.system ? "rotate-180 bg-tapsh-soft-green text-white" : ""
              }`}>
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </button>

          {/* Section Body Content */}
          {openSections.system && (
            <div className="p-5 sm:p-8 pt-2 border-t border-tapsh-charcoal/15 space-y-6 animate-in slide-in-from-top-2 duration-200 max-w-3xl">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/15">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-tapsh-charcoal uppercase">Firestore Sync</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-tapsh-soft-green">
                      <span className="w-2 h-2 rounded-full bg-tapsh-soft-green animate-pulse"></span> Connected
                    </span>
                  </div>
                  <p className="text-xs text-tapsh-charcoal">
                    Collections: <code className="bg-white px-1.5 py-0.5 rounded border text-[11px]">site_settings</code> & <code className="bg-white px-1.5 py-0.5 rounded border text-[11px]">site_products</code>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/15">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-tapsh-charcoal uppercase">Real-Time Broadcast</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-tapsh-soft-green">
                      <span className="w-2 h-2 rounded-full bg-tapsh-soft-green animate-pulse"></span> Active
                    </span>
                  </div>
                  <p className="text-xs text-tapsh-charcoal">
                    Firestore <code className="bg-white px-1.5 py-0.5 rounded border text-[11px]">onSnapshot</code> listener automatically updates all open client browser sessions without page reload.
                  </p>
                </div>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-tapsh-charcoal/15 text-xs text-tapsh-charcoal leading-relaxed">
                <strong className="text-tapsh-black block mb-1">Resilient Dual-Mode Upload Pipeline:</strong>
                When uploading image files, the system first attempts cloud delivery to Firebase Storage (<code className="bg-white px-1 rounded">tapsh-ddea2.firebasestorage.app</code>). If storage rules are restricted or offline, the system automatically uses client-side canvas compression to encode high-resolution data URLs directly into Firestore and local cache. Images are never lost and always visible.
              </div>

            </div>
          )}
        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL: ADD / EDIT PRODUCT */}
      {/* ---------------------------------------------------- */}
      {isProductModalOpen && editingProduct && (
        <div 
          className="fixed inset-0 z-50 bg-tapsh-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsProductModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] flex flex-col justify-between shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-tapsh-charcoal/20 pb-4 mb-6 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-tapsh-black text-white flex items-center justify-center">
                  <Package className="w-4 h-4 text-tapsh-soft-green" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-tapsh-black">
                    {editingProduct.name ? `Edit "${editingProduct.name}"` : "Add New Product"}
                  </h3>
                  <p className="text-xs text-tapsh-charcoal">
                    Changes will be saved to Firebase and instantly published to the website.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsProductModalOpen(false)}
                className="w-8 h-8 rounded-full bg-tapsh-pale-blue/60 hover:bg-tapsh-pale-blue text-tapsh-black flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Scrollable Area */}
            <form onSubmit={handleSaveProduct} className="space-y-6 overflow-y-auto pr-1 flex-1">
              
              {/* Product Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-black mb-1.5">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TAPSH Smart Stand"
                    value={editingProduct.name || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                      setEditingProduct((prev) => ({ 
                        ...prev, 
                        name: val,
                        slug: prev?.slug && prev.slug !== "" ? prev.slug : slug 
                      }));
                    }}
                    className="w-full px-4 py-2.5 bg-tapsh-pale-blue/30 border border-tapsh-charcoal/20 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-tapsh-soft-green"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-black mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. tapsh-smart-stand"
                    value={editingProduct.slug || ""}
                    onChange={(e) => setEditingProduct((prev) => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-tapsh-pale-blue/30 border border-tapsh-charcoal/20 rounded-xl text-xs sm:text-sm font-mono text-tapsh-black focus:outline-none focus:border-tapsh-soft-green"
                  />
                </div>
              </div>

              {/* Tagline / Subtitle */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-black mb-1.5">
                  Tagline / Pitch
                </label>
                <input
                  type="text"
                  placeholder="e.g. Turn customer interactions into instant 5-star reviews."
                  value={editingProduct.tagline || ""}
                  onChange={(e) => setEditingProduct((prev) => ({ ...prev, tagline: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-tapsh-pale-blue/30 border border-tapsh-charcoal/20 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-tapsh-soft-green"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-black mb-1.5">
                  Full Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain what the product accomplishes for physical businesses..."
                  value={editingProduct.description || ""}
                  onChange={(e) => setEditingProduct((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-tapsh-pale-blue/30 border border-tapsh-charcoal/20 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-tapsh-soft-green"
                />
              </div>

              {/* Key Benefit */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-black mb-1.5">
                  Key Benefit (Highlighted on Website Card) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Increase your Google & TripAdvisor ratings effortlessly."
                  value={editingProduct.benefit || ""}
                  onChange={(e) => setEditingProduct((prev) => ({ ...prev, benefit: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-tapsh-pale-blue/30 border border-tapsh-charcoal/20 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-tapsh-soft-green"
                />
              </div>

              {/* Category, Badge, Status, Icon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-tapsh-black mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Reviews"
                    value={editingProduct.category || ""}
                    onChange={(e) => setEditingProduct((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-tapsh-pale-blue/30 border border-tapsh-charcoal/20 rounded-xl text-xs focus:outline-none focus:border-tapsh-soft-green"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-tapsh-black mb-1">
                    Ribbon Badge
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Popular"
                    value={editingProduct.badge || ""}
                    onChange={(e) => setEditingProduct((prev) => ({ ...prev, badge: e.target.value }))}
                    className="w-full px-3 py-2 bg-tapsh-pale-blue/30 border border-tapsh-charcoal/20 rounded-xl text-xs focus:outline-none focus:border-tapsh-soft-green"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-tapsh-black mb-1">
                    Fallback Icon
                  </label>
                  <select
                    value={editingProduct.iconType || "sparkles"}
                    onChange={(e) => setEditingProduct((prev) => ({ ...prev, iconType: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-tapsh-pale-blue/30 border border-tapsh-charcoal/20 rounded-xl text-xs focus:outline-none focus:border-tapsh-soft-green"
                  >
                    <option value="star">Star (Review)</option>
                    <option value="wifi">Wi-Fi</option>
                    <option value="message">WhatsApp/Chat</option>
                    <option value="camera">Instagram/Camera</option>
                    <option value="globe">Globe/Website</option>
                    <option value="grid">Grid (All-in-One)</option>
                    <option value="sparkles">Sparkles (Custom)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-tapsh-black mb-1">
                    Status
                  </label>
                  <select
                    value={editingProduct.status || "ACTIVE"}
                    onChange={(e) => setEditingProduct((prev) => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-tapsh-pale-blue/30 border border-tapsh-charcoal/20 rounded-xl text-xs focus:outline-none focus:border-tapsh-soft-green"
                  >
                    <option value="ACTIVE">Active (Live)</option>
                    <option value="DRAFT">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* ---------------------------------------------------- */}
              {/* MULTIPLE IMAGES SELECTOR & GALLERY MANAGER */}
              {/* ---------------------------------------------------- */}
              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-tapsh-charcoal/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-tapsh-black flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-tapsh-soft-green" /> Product Showcase Images (Slideshow)
                    </h4>
                    <p className="text-[11px] text-tapsh-charcoal">
                      Select multiple photos. These will auto-play as a slideshow on the website card and product page.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-tapsh-black text-white">
                    {editingProduct.images?.length || 0} Images
                  </span>
                </div>

                <input
                  type="file"
                  ref={productFileInputRef}
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleUploadProductImages}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => productFileInputRef.current?.click()}
                    disabled={isUploadingProductImages}
                    className="flex-1 py-3 px-4 bg-tapsh-black hover:bg-tapsh-soft-green text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {isUploadingProductImages ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-tapsh-soft-green" />
                        <span>Uploading & Processing...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Choose Multiple Image Files</span>
                      </>
                    )}
                  </button>

                  <div className="flex flex-1 gap-2">
                    <input
                      type="url"
                      placeholder="Or paste direct image URL..."
                      value={productUrlInput}
                      onChange={(e) => setProductUrlInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-tapsh-charcoal/20 rounded-xl text-xs focus:outline-none focus:border-tapsh-soft-green"
                    />
                    <button
                      type="button"
                      onClick={handleAddProductImageUrl}
                      disabled={!productUrlInput.trim()}
                      className="px-3 py-2 bg-tapsh-pale-blue text-tapsh-black rounded-xl text-xs font-bold border border-tapsh-charcoal/20 hover:bg-tapsh-soft-green hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                {/* Image Thumbnails Gallery */}
                {editingProduct.images && editingProduct.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {editingProduct.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-2xl bg-white border border-tapsh-charcoal/20 overflow-hidden group/img shadow-xs flex items-center justify-center p-2"
                      >
                        <img
                          src={imgUrl}
                          alt={`Product photo ${idx + 1}`}
                          className="max-h-full max-w-full object-contain"
                        />

                        {idx === 0 ? (
                          <span className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded-md bg-tapsh-soft-green text-white text-[9px] font-bold uppercase shadow-sm">
                            Cover
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMakeCoverImage(idx)}
                            className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded-md bg-black/60 hover:bg-tapsh-soft-green text-white text-[9px] font-bold opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer"
                          >
                            Set Cover
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveProductImage(idx)}
                          className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity shadow-md cursor-pointer"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-xl border border-dashed border-tapsh-charcoal/30 text-center text-tapsh-charcoal text-xs">
                    No custom images added yet. The product will use its default emblem until photos are uploaded.
                  </div>
                )}
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-tapsh-charcoal/20 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  disabled={isSavingProduct}
                  className="px-5 py-2.5 rounded-xl border border-tapsh-charcoal/20 text-xs font-bold text-tapsh-charcoal hover:bg-tapsh-pale-blue transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-6 py-2.5 bg-tapsh-soft-green hover:brightness-105 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingProduct ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving to Firebase...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Product</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: IMAGE INSPECTOR / ENLARGEMENT */}
      {/* ---------------------------------------------------- */}
      {previewModalImage && (
        <div 
          className="fixed inset-0 z-50 bg-tapsh-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewModalImage(null)}
        >
          <div 
            className="bg-tapsh-black border border-white/20 rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] flex flex-col items-center relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <h3 className="text-white font-bold text-base">{previewModalImage.title}</h3>
              <button
                onClick={() => setPreviewModalImage(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-full flex-1 max-h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl bg-[#141517] p-4">
              <img
                src={previewModalImage.url}
                alt={previewModalImage.title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            <div className="w-full flex justify-end mt-4">
              <button
                onClick={() => setPreviewModalImage(null)}
                className="px-6 py-2.5 bg-tapsh-soft-green text-white font-bold text-xs rounded-xl hover:brightness-105 transition-all cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
