"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "TAPSH Hub", href: "/hub-info" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="fixed w-full z-50 bg-tapsh-bg-warm/90 backdrop-blur-md border-b border-tapsh-charcoal/20 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="group z-50 relative">
              <Image src="/images/logo-dark.png" alt="TAPSH Logo" width={140} height={40} className="w-auto h-8 md:h-10 object-contain" />
            </Link>
          </div>

          {/* Desktop Center Links */}
          <div className="hidden lg:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className="text-sm font-medium text-tapsh-black/70 hover:text-tapsh-black transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Right Side CTA & Admin */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link 
              href="/admin/login" 
              className="text-xs font-semibold uppercase tracking-wider text-tapsh-charcoal hover:text-tapsh-black transition-colors"
            >
              Admin Login
            </Link>
            <Link 
              href="/contact" 
              className="group flex items-center gap-2 px-5 py-2.5 bg-tapsh-black text-tapsh-beige rounded-full text-sm font-medium hover:bg-tapsh-taupe transition-all shadow-sm"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-tapsh-beige" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center z-50 relative">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-tapsh-black hover:bg-tapsh-charcoal/20 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-0 left-0 w-full h-screen bg-tapsh-bg-warm z-40 flex flex-col pt-24 px-6 pb-6 overflow-y-auto lg:hidden">
          <div className="flex flex-col space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-bold text-tapsh-black border-b border-tapsh-charcoal/20 pb-4"
              >
                {link.name}
              </Link>
            ))}
            
            <div className="pt-6 flex flex-col gap-4">
              <Link 
                href="/admin/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center py-4 bg-tapsh-charcoal/20 text-tapsh-black font-bold rounded-xl"
              >
                Admin Login
              </Link>
              <Link 
                href="/contact" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-4 bg-tapsh-black text-tapsh-beige rounded-xl font-bold shadow-lg"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
