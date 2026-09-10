"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, ArrowLeft, Sparkles } from "lucide-react";
import { useSiteAssets } from "@/context/SiteAssetsContext";

export default function AdminLoginPage() {
  const { getAsset } = useSiteAssets();
  const logoWhite = getAsset("logo_white", "/images/logo-white.png");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // Authenticate admin or support credentials
    const isValidAdmin = 
      (cleanEmail === "tapsh.support@gmail.com" || cleanEmail === "admin@tapsh.com" || cleanEmail === "admin@tapsh.in") &&
      (cleanPass === "admin123" || cleanPass === "tapsh2026" || cleanPass === "tapsh.support");

    setTimeout(() => {
      if (isValidAdmin) {
        document.cookie = "tapsh_admin_session=authenticated_admin; path=/; max-age=86400; SameSite=Lax";
        router.push("/admin");
      } else {
        setError("Invalid credentials. Please use tapsh.support@gmail.com or admin@tapsh.com with password admin123");
        setLoading(false);
      }
    }, 400);
  };

  const handleQuickFill = (type: "support" | "admin") => {
    if (type === "support") {
      setEmail("tapsh.support@gmail.com");
      setPassword("admin123");
    } else {
      setEmail("admin@tapsh.com");
      setPassword("admin123");
    }
    setError("");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-between bg-tapsh-black text-white p-4 sm:p-6 md:p-8 relative overflow-x-hidden selection:bg-tapsh-soft-green selection:text-white">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-tapsh-soft-green/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-tapsh-taupe/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Bar on Mobile */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-md mx-auto pt-2">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-tapsh-gray hover:text-white transition-colors py-2 px-3 rounded-full hover:bg-white/5 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Website
        </Link>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tapsh-soft-green/10 border border-tapsh-soft-green/30 text-tapsh-soft-green text-[11px] font-bold tracking-wider uppercase">
          <ShieldCheck className="w-3.5 h-3.5" /> Secure
        </span>
      </div>

      {/* Main Login Card - Compact on all phone screens */}
      <div className="relative z-10 w-full max-w-md mx-auto my-auto py-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          
          {/* Subtle accent line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-tapsh-soft-green via-tapsh-beige to-tapsh-soft-green"></div>

          {/* Logo & Header */}
          <div className="text-center mb-7 pt-2">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-black/40 border border-white/10 shadow-inner mb-3">
              <img 
                src={logoWhite} 
                alt="TAPSH Logo" 
                className="w-auto h-7 sm:h-8 object-contain" 
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">

              Admin Gateway
            </h1>
            <p className="text-xs sm:text-sm text-tapsh-gray mt-1.5">
              Manage client hubs, NFC touchpoints & invoices
            </p>
          </div>

          {/* Error Message Banner */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl text-xs sm:text-sm leading-relaxed text-center animate-in fade-in duration-200">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-gray mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-tapsh-gray">
                  <Mail className="w-4 h-4" />
                </div>
                <input 
                  type="email" 
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tapsh.support@gmail.com"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-black/40 border border-white/15 text-white placeholder-white/30 text-base focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green focus:border-transparent transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-gray">
                  Security Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-tapsh-gray">
                  <Lock className="w-4 h-4" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3.5 rounded-2xl bg-black/40 border border-white/15 text-white placeholder-white/30 text-base focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green focus:border-transparent transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-tapsh-gray hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 mt-2 bg-gradient-to-r from-tapsh-soft-green to-[#6e855c] text-white rounded-2xl font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  Authenticating...
                </span>
              ) : (
                <>
                  Access Admin Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill Pill for Phone Screen convenience */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-[11px] uppercase tracking-wider text-tapsh-gray font-bold mb-2.5">
              Fast Mobile Sign-in (1-Tap)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button"
                onClick={() => handleQuickFill("support")}
                className="py-2 px-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-tapsh-pale-blue font-medium transition-all active:scale-95 flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-tapsh-soft-green" /> tapsh.support
              </button>
              <button 
                type="button"
                onClick={() => handleQuickFill("admin")}
                className="py-2 px-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-tapsh-pale-blue font-medium transition-all active:scale-95 flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-tapsh-soft-green" /> admin@tapsh
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 text-center text-tapsh-charcoal text-xs pb-2">
        TAPSH Operating System v2.4 • Authorized Personnel Only
      </div>

    </div>
  );
}
