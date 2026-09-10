"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-tapsh-bg-neutral text-tapsh-black relative">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-tapsh-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static top-0 left-0 h-full w-64 bg-tapsh-black border-r border-tapsh-black/20 flex flex-col shadow-2xl z-30 transition-transform duration-300 transform ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="p-6 border-b border-tapsh-taupe flex justify-between items-center">
          <div>
            <Image src="/images/logo-white.png" alt="TAPSH Logo" width={120} height={35} className="w-auto h-8 object-contain" />
            <p className="text-[10px] text-tapsh-charcoal font-bold tracking-widest uppercase mt-3">Admin Panel</p>
          </div>
          <button 
            className="lg:hidden text-tapsh-pale-blue"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/admin" onClick={() => setIsSidebarOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-tapsh-pale-blue hover:bg-tapsh-charcoal hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link href="/admin/customers" onClick={() => setIsSidebarOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-tapsh-pale-blue hover:bg-tapsh-charcoal hover:text-white transition-colors">
            Customers
          </Link>
          <Link href="/admin/invoices" onClick={() => setIsSidebarOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-tapsh-pale-blue hover:bg-tapsh-charcoal hover:text-white transition-colors">
            Invoices
          </Link>
          <Link href="/admin/payments" onClick={() => setIsSidebarOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-tapsh-pale-blue hover:bg-tapsh-charcoal hover:text-white transition-colors">
            Payments
          </Link>
        </nav>
        
        <div className="p-4 border-t border-tapsh-taupe">
          <Link href="/" className="block w-full text-center px-4 py-2 text-sm text-tapsh-charcoal hover:text-tapsh-pale-blue transition-colors">
            ← Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 w-full lg:w-[calc(100%-16rem)] overflow-x-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-tapsh-charcoal/20 flex items-center justify-between px-4 sm:px-8 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 -ml-2 text-tapsh-black rounded-md hover:bg-tapsh-pale-blue"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center gap-4">
              <span className="w-2 h-2 rounded-full bg-tapsh-soft-green animate-pulse"></span>
              <span className="text-sm font-bold text-tapsh-black">System Online</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-tapsh-pale-blue rounded-full flex items-center justify-center border border-tapsh-charcoal/30 text-tapsh-black font-bold text-sm shadow-sm">
              A
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 bg-tapsh-bg-neutral">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
