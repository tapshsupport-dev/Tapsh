"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, Users, Receipt, PlusCircle, 
  Menu, X, ExternalLink, LogOut, ShieldCheck, ChevronRight,
  Sparkles, History, Settings
} from "lucide-react";
import { useSiteAssets } from "@/context/SiteAssetsContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAdminDark, setIsAdminDark] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { getAsset } = useSiteAssets();

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Ensure the root document never has a global dark class
      document.documentElement.classList.remove("dark");
      setIsAdminDark(localStorage.getItem("tapsh_admin_theme") === "dark");

      const handleThemeChange = () => {
        setIsAdminDark(localStorage.getItem("tapsh_admin_theme") === "dark");
      };

      window.addEventListener("admin_theme_change", handleThemeChange);
      window.addEventListener("storage", handleThemeChange);
      return () => {
        window.removeEventListener("admin_theme_change", handleThemeChange);
        window.removeEventListener("storage", handleThemeChange);
      };
    }
  }, []);

  const logoWhite = getAsset("logo_white", "/images/logo-white.png");
  const logoDark = getAsset("logo_dark", "/images/logo-dark.png");
  const adminAvatar = getAsset("admin_avatar");
  const adminName = getAsset("admin_name", "TAPSH Operations");

  const handleLogout = () => {
    document.cookie = "tapsh_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/admin/login");
  };

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
    { name: "Customers", href: "/admin/customers", icon: Users, exact: false },
    { name: "Hubs", href: "/admin/hubs/setup", icon: PlusCircle, exact: false },
    { name: "Invoices", href: "/admin/invoices", icon: Receipt, exact: false },
    { name: "History", href: "/admin/history", icon: History, exact: false },
    { name: "Settings", href: "/admin/settings", icon: Settings, exact: false },
  ];

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <div className={`flex min-h-[100dvh] bg-[#F7F7F8] text-tapsh-black relative selection:bg-tapsh-soft-green selection:text-white transition-colors duration-200 ${isAdminDark ? "admin-dark dark" : ""}`}>
      
      {/* ---------------------------------------------------- */}
      {/* DESKTOP SIDEBAR (Visible on lg: and larger) */}
      {/* ---------------------------------------------------- */}
      <aside className="hidden lg:flex w-64 bg-tapsh-black text-white flex-col shrink-0 border-r border-white/10 z-30 sticky top-0 h-screen">
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <img 
              src={logoWhite} 
              alt="TAPSH Logo" 
              className="w-auto h-7 object-contain" 
            />
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className="w-2 h-2 rounded-full bg-tapsh-soft-green animate-pulse"></span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-tapsh-gray">
                Admin Console
              </span>
            </div>
          </div>
        </div>


        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  active 
                    ? "bg-tapsh-soft-green text-white shadow-md" 
                    : "text-tapsh-pale-blue/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className={`w-5 h-5 ${active ? "text-white" : "text-tapsh-gray"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Quick Launch & Sign Out */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link 
            href="/" 
            target="_blank"
            className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-tapsh-gray hover:text-white hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" /> View Public Site
            </span>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ---------------------------------------------------- */}
      {/* MOBILE DRAWER / SIDE MENU (Accessible via hamburger) */}
      {/* ---------------------------------------------------- */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          {/* Drawer sheet */}
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-tapsh-black text-white p-6 shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <img 
                  src={logoWhite} 
                  alt="TAPSH" 
                  className="w-auto h-6 object-contain" 
                />
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-full text-tapsh-gray hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-6 space-y-2">
                <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-tapsh-gray">
                  Quick Navigation
                </div>
                {navItems.map((item) => {
                  const active = isActive(item);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsDrawerOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                        active 
                          ? "bg-tapsh-soft-green text-white" 
                          : "text-tapsh-pale-blue/80 hover:bg-white/5"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" /> {item.name}
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-3">
              <Link 
                href="/" 
                target="_blank"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-2xl bg-white/5 text-xs font-semibold text-white"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-tapsh-soft-green" /> Open Public Website
                </span>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-red-500/10 text-red-400 text-xs font-bold"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MAIN VIEWPORT CONTAINER */}
      {/* ---------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        
        {/* MOBILE TOP BAR (Fixed/Sticky on Mobile) */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-tapsh-charcoal/20 px-4 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open menu"
              className="p-2 -ml-1.5 rounded-xl text-tapsh-black hover:bg-tapsh-pale-blue/40 active:scale-95 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/admin" className="flex items-center">
              <img 
                src={logoDark} 
                alt="TAPSH" 
                className="w-auto h-6 object-contain" 
              />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link 
              href="/admin/hubs/setup" 
              className="flex items-center gap-1 py-1.5 px-3 bg-tapsh-soft-green text-white rounded-full text-xs font-bold shadow-xs active:scale-95 transition-transform"
            >
              <Sparkles className="w-3.5 h-3.5" /> + Hub
            </Link>
            <Link 
              href="/admin/settings"
              title="Settings & Profile"
              className="relative w-8 h-8 rounded-full overflow-hidden border border-tapsh-charcoal/20 flex items-center justify-center text-xs font-bold text-tapsh-black bg-tapsh-pale-blue shadow-xs"
            >
              {adminAvatar ? (
                <img src={adminAvatar} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                "TS"
              )}
            </Link>
          </div>
        </header>

        {/* DESKTOP TOP BAR (Only visible on desktop) */}
        <header className="hidden lg:flex h-16 bg-white border-b border-tapsh-charcoal/15 items-center justify-between px-8 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-tapsh-soft-green animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-tapsh-charcoal">
              TAPSH Enterprise Fleet • Live Status
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold text-tapsh-black leading-none">{adminName}</p>
              <p className="text-[10px] text-tapsh-charcoal mt-1">tapsh.support@gmail.com</p>
            </div>
            <Link 
              href="/admin/settings" 
              title="Settings & Profile"
              className="relative w-9 h-9 rounded-full overflow-hidden border border-tapsh-charcoal/20 flex items-center justify-center font-bold text-xs text-tapsh-black bg-tapsh-pale-blue shadow-inner hover:ring-2 hover:ring-tapsh-soft-green transition-all"
            >
              {adminAvatar ? (
                <img src={adminAvatar} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                "TS"
              )}
            </Link>
          </div>
        </header>

        {/* MAIN PAGE BODY */}
        <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Thumb-friendly on phone) */}
      {/* ---------------------------------------------------- */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-tapsh-charcoal/20 px-2 py-1.5 shadow-lg safe-area-bottom">
        <div className="grid grid-cols-6 items-center">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all ${
                  active 
                    ? "text-tapsh-black font-bold" 
                    : "text-tapsh-charcoal hover:text-tapsh-black font-medium"
                }`}
              >
                <div className={`p-1 rounded-xl transition-colors ${active ? "bg-tapsh-soft-green/15 text-tapsh-soft-green" : ""}`}>
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[9px] tracking-tight mt-0.5 leading-none">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>


    </div>
  );
}
