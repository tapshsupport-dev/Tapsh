"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { 
  Settings, Image as ImageIcon, Sparkles, Upload, RotateCcw, 
  Check, ExternalLink, AlertCircle, Eye, Search, Filter,
  ShieldCheck, Database, RefreshCw, X, CheckCircle2, Globe, User
} from "lucide-react";
import { useSiteAssets } from "@/context/SiteAssetsContext";
import { 
  MEDIA_ASSET_REGISTRY, 
  MEDIA_CATEGORIES, 
  MediaAssetDefinition 
} from "@/lib/mediaAssetsRegistry";

export default function AdminSettingsPage() {
  const { assets, isLoaded, getAsset, isCustom, updateAsset, resetAsset, resetAll } = useSiteAssets();
  
  // Tabs: "content" | "identity" | "system"
  const [activeTab, setActiveTab] = useState<"content" | "identity" | "system">("content");
  
  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Upload & action states
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewModalImage, setPreviewModalImage] = useState<{ title: string; url: string } | null>(null);
  const [urlInputOpenKey, setUrlInputOpenKey] = useState<string | null>(null);
  const [customUrlValue, setCustomUrlValue] = useState("");

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleFileUpload = async (asset: MediaAssetDefinition, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 10MB)
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
      // Reset file input value so user can re-upload same file if desired
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

  // Filter items
  const filteredAssets = MEDIA_ASSET_REGISTRY.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = 
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.key.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const customCount = MEDIA_ASSET_REGISTRY.filter((item) => isCustom(item.key)).length;

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
                Settings & Configuration
              </h1>
              <p className="text-xs sm:text-sm text-tapsh-charcoal mt-0.5">
                Manage site content, website media assets, admin identity, and cloud sync.
              </p>
            </div>
          </div>
        </div>

        {/* Global Stats / Quick Action */}
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl border border-tapsh-charcoal/20 shadow-xs flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tapsh-soft-green animate-pulse"></span>
            <span className="text-xs font-semibold text-tapsh-charcoal">
              Custom Assets: <strong className="text-tapsh-black">{customCount}</strong> / {MEDIA_ASSET_REGISTRY.length}
            </span>
          </div>
          {customCount > 0 && (
            <button
              onClick={handleResetAllConfirm}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-tapsh-charcoal hover:text-red-500 bg-white hover:bg-red-50 rounded-2xl border border-tapsh-charcoal/20 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Revert All
            </button>
          )}
        </div>
      </div>

      {/* TOP NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-tapsh-charcoal/15 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("content")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "content"
              ? "bg-tapsh-black text-white shadow-md"
              : "text-tapsh-charcoal hover:text-tapsh-black hover:bg-tapsh-pale-blue/40"
          }`}
        >
          <ImageIcon className="w-4 h-4 text-tapsh-soft-green" />
          <span>Content & Media Assets</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === "content" ? "bg-tapsh-soft-green text-white" : "bg-tapsh-charcoal/10 text-tapsh-charcoal"
          }`}>
            {MEDIA_ASSET_REGISTRY.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("identity")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "identity"
              ? "bg-tapsh-black text-white shadow-md"
              : "text-tapsh-charcoal hover:text-tapsh-black hover:bg-tapsh-pale-blue/40"
          }`}
        >
          <User className="w-4 h-4 text-tapsh-taupe" />
          <span>Admin Identity</span>
        </button>

        <button
          onClick={() => setActiveTab("system")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "system"
              ? "bg-tapsh-black text-white shadow-md"
              : "text-tapsh-charcoal hover:text-tapsh-black hover:bg-tapsh-pale-blue/40"
          }`}
        >
          <Database className="w-4 h-4 text-tapsh-soft-green" />
          <span>Firebase Cloud Sync</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: CONTENT & MEDIA ASSETS SECTION */}
      {/* ---------------------------------------------------- */}
      {activeTab === "content" && (
        <div className="space-y-6">
          
          {/* Section Introduction Banner */}
          <div className="bg-gradient-to-br from-tapsh-black to-[#2A2B2D] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-tapsh-soft-green/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tapsh-soft-green/20 text-tapsh-soft-green text-[11px] font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Content Management Flow
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
                Dynamic Website & Admin Media Catalog
              </h2>
              <p className="text-xs sm:text-sm text-tapsh-gray leading-relaxed">
                Choose and customize every visual asset rendered across the public web pages and admin console. 
                Upload files from your computer or provide direct URLs. Changes sync instantaneously through Firebase and update live for all visitors worldwide without requiring a deployment.
              </p>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-3xl border border-tapsh-charcoal/20 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {MEDIA_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-tapsh-soft-green text-white shadow-xs"
                      : "bg-tapsh-pale-blue/40 text-tapsh-charcoal hover:text-tapsh-black hover:bg-tapsh-pale-blue"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-tapsh-charcoal" />
              <input
                type="text"
                placeholder="Search images & assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-tapsh-pale-blue/30 border border-tapsh-charcoal/20 rounded-2xl text-xs focus:outline-none focus:border-tapsh-soft-green transition-colors"
              />
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
                  className="bg-white rounded-3xl border border-tapsh-charcoal/20 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Top Status Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-tapsh-taupe">
                          {asset.category}
                        </span>
                        <h3 className="font-bold text-tapsh-black text-base mt-0.5 leading-snug">
                          {asset.label}
                        </h3>
                      </div>

                      {/* Custom vs Default Badge */}
                      {customActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-tapsh-soft-green/15 text-tapsh-soft-green shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-tapsh-soft-green animate-pulse"></span>
                          Firebase Custom
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-tapsh-charcoal/10 text-tapsh-charcoal shrink-0">
                          System Default
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-tapsh-charcoal mb-4 line-clamp-2">
                      {asset.description}
                    </p>

                    {/* LIVE IMAGE PREVIEW CONTAINER */}
                    <div className="relative w-full aspect-video bg-[#1F2022] rounded-2xl overflow-hidden border border-tapsh-charcoal/15 flex items-center justify-center p-3 mb-4 group/preview">
                      {asset.type === "text" ? (
                        <div className="text-center p-4">
                          <span className="text-xs uppercase text-tapsh-gray tracking-wider">Current Text Value</span>
                          <p className="text-lg font-bold text-white mt-1">{liveValue || "TAPSH Operations"}</p>
                        </div>
                      ) : liveValue ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          {/* Use regular img for maximum reliability with data: URLs and cross-origin images */}
                          <img
                            src={liveValue}
                            alt={asset.label}
                            className="max-h-full max-w-full object-contain drop-shadow-md transition-transform duration-300 group-hover/preview:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-tapsh-gray text-xs">
                          <div className="w-12 h-12 rounded-full bg-tapsh-pale-blue text-tapsh-black flex items-center justify-center font-bold text-sm mb-1">
                            TS
                          </div>
                          <span>No custom avatar set</span>
                        </div>
                      )}

                      {/* Overlay Action to Enlarge */}
                      {liveValue && asset.type === "image" && (
                        <button
                          onClick={() => setPreviewModalImage({ title: asset.label, url: liveValue })}
                          className="absolute inset-0 bg-tapsh-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold backdrop-blur-xs cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-tapsh-soft-green" /> Click to Inspect
                        </button>
                      )}

                      {/* Loading spinner */}
                      {isUpdating && (
                        <div className="absolute inset-0 bg-tapsh-black/80 flex flex-col items-center justify-center text-white text-xs gap-2 z-20 backdrop-blur-xs">
                          <RefreshCw className="w-6 h-6 animate-spin text-tapsh-soft-green" />
                          <span className="font-semibold">Syncing to Firebase...</span>
                        </div>
                      )}
                    </div>

                    {/* Specification Hints */}
                    <div className="text-[11px] text-tapsh-charcoal/80 mb-4 bg-tapsh-pale-blue/30 p-2.5 rounded-xl border border-tapsh-charcoal/10">
                      <strong>Recommended:</strong> {asset.recommendedSize}
                    </div>
                  </div>

                  {/* BOTTOM ACTION BUTTONS */}
                  <div className="space-y-2 pt-2 border-t border-tapsh-charcoal/15">
                    
                    {/* Hidden File Input */}
                    <input
                      type="file"
                      ref={(el) => {
                        fileInputRefs.current[asset.key] = el;
                      }}
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={(e) => handleFileUpload(asset, e)}
                      className="hidden"
                    />

                    {/* Upload / Choose Image Button */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => fileInputRefs.current[asset.key]?.click()}
                        disabled={isUpdating}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-tapsh-black hover:bg-tapsh-soft-green text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
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
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-tapsh-pale-blue hover:bg-tapsh-pale-blue/80 text-tapsh-black rounded-xl text-xs font-bold transition-all border border-tapsh-charcoal/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>URL Link</span>
                      </button>
                    </div>

                    {/* Expandable URL Input Field */}
                    {isUrlOpen && (
                      <div className="p-3 bg-tapsh-pale-blue/50 rounded-2xl border border-tapsh-charcoal/20 space-y-2 animate-in slide-in-from-top-2">
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

                    {/* Reset to Default Button (Visible if custom) */}
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

      {/* ---------------------------------------------------- */}
      {/* TAB 2: ADMIN IDENTITY & PROFILE */}
      {/* ---------------------------------------------------- */}
      {activeTab === "identity" && (
        <div className="bg-white rounded-3xl border border-tapsh-charcoal/20 p-8 shadow-xs max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-tapsh-pale-blue text-tapsh-black flex items-center justify-center font-bold">
              <User className="w-6 h-6 text-tapsh-soft-green" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-tapsh-black">Admin Identity & Presence</h2>
              <p className="text-xs text-tapsh-charcoal">Manage how your admin credentials appear in headers and consoles.</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Current Profile Avatar */}
            <div className="flex items-center gap-5 p-4 bg-tapsh-pale-blue/30 rounded-2xl border border-tapsh-charcoal/15">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-tapsh-soft-green bg-tapsh-black flex items-center justify-center shrink-0">
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
                  setActiveTab("content");
                  setSelectedCategory("Admin Identity");
                }}
                className="px-4 py-2 bg-tapsh-black text-white rounded-xl text-xs font-bold hover:bg-tapsh-soft-green transition-colors cursor-pointer"
              >
                Change Avatar
              </button>
            </div>

            {/* Display Name Setting */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-tapsh-black">
                Console Display Label
              </label>
              <div className="flex gap-2">
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
                  className="flex-1 px-4 py-2.5 bg-tapsh-pale-blue/20 border border-tapsh-charcoal/20 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:border-tapsh-soft-green"
                />
              </div>
              <p className="text-[11px] text-tapsh-charcoal">
                Shown in the top right desktop header beside the profile avatar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: FIREBASE CLOUD SYNC STATUS */}
      {/* ---------------------------------------------------- */}
      {activeTab === "system" && (
        <div className="bg-white rounded-3xl border border-tapsh-charcoal/20 p-8 shadow-xs max-w-3xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-tapsh-soft-green/15 text-tapsh-soft-green flex items-center justify-center font-bold">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-tapsh-black">Cloud Sync Architecture</h2>
              <p className="text-xs text-tapsh-charcoal">Dual-layer persistent storage and asset delivery health.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-tapsh-pale-blue/30 border border-tapsh-charcoal/15">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-tapsh-charcoal uppercase">Firestore Sync</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-tapsh-soft-green">
                  <span className="w-2 h-2 rounded-full bg-tapsh-soft-green animate-pulse"></span> Connected
                </span>
              </div>
              <p className="text-xs text-tapsh-charcoal">
                Collection: <code className="bg-white px-1.5 py-0.5 rounded border text-[11px]">site_settings</code> / Document: <code className="bg-white px-1.5 py-0.5 rounded border text-[11px]">site_assets</code>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-tapsh-pale-blue/30 border border-tapsh-charcoal/15">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-tapsh-charcoal uppercase">Real-Time Broadcast</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-tapsh-soft-green">
                  <span className="w-2 h-2 rounded-full bg-tapsh-soft-green animate-pulse"></span> Active
                </span>
              </div>
              <p className="text-xs text-tapsh-charcoal">
                Firestore <code className="bg-white px-1.5 py-0.5 rounded border text-[11px]">onSnapshot</code> listener propagates live updates to all client browser sessions without page reload.
              </p>
            </div>
          </div>

          <div className="bg-tapsh-pale-blue/20 p-4 rounded-2xl border border-tapsh-charcoal/15 text-xs text-tapsh-charcoal leading-relaxed">
            <strong className="text-tapsh-black block mb-1">Resilient Dual-Mode Upload Pipeline:</strong>
            When uploading image files, the system first attempts cloud delivery to Firebase Storage (<code className="bg-white px-1 rounded">tapsh-ddea2.firebasestorage.app</code>). If storage rules are restricted or offline, the system automatically uses client-side canvas compression to encode high-resolution data URLs directly into Firestore and local cache. Images are never lost and always visible.
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
