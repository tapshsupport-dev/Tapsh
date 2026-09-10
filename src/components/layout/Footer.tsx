"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Mail, MessageCircle } from "lucide-react";
import { useSiteAssets } from "@/context/SiteAssetsContext";

export default function Footer() {
  const { getAsset } = useSiteAssets();
  const logoWhite = getAsset("logo_white", "/images/logo-white.png");

  return (
    <footer className="bg-tapsh-black text-white mt-auto border-t border-tapsh-charcoal/20">
      
      {/* CTA Section */}
      <div className="border-b border-tapsh-charcoal/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-tapsh-pale-blue mb-4">Ready to connect your business?</h2>
          <p className="text-tapsh-pale-blue/70 mb-8 max-w-xl mx-auto text-lg">
            Bring your physical touchpoints into the digital world with TAPSH.
          </p>
          <Link 
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-tapsh-soft-green text-tapsh-pale-blue rounded-full font-bold hover:brightness-110 transition-all shadow-lg hover:-translate-y-0.5"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* COLUMN 1 - TAPSH BRAND */}
          <div className="lg:pr-8">
            <Link href="/" className="inline-block mb-6">
              <img 
                src={logoWhite} 
                alt="TAPSH Logo" 
                className="w-auto h-8 md:h-10 object-contain" 
              />
            </Link>

            <h3 className="font-bold tracking-widest text-sm text-tapsh-pale-blue uppercase mb-4">Tap. Connect. Grow.</h3>
            <p className="text-tapsh-charcoal leading-relaxed text-sm">
              Smart NFC, QR & digital solutions that connect physical businesses to simple digital experiences.
            </p>
          </div>

          {/* COLUMN 2 - QUICK LINKS */}
          <div>
            <h4 className="font-bold text-lg text-white mb-6">Explore</h4>
            <ul className="space-y-4">
              {[
                { name: "Home", href: "/" },
                { name: "Products", href: "/products" },
                { name: "TAPSH Hub", href: "/hub-info" },
                { name: "How It Works", href: "/faq" },
                { name: "Contact", href: "/contact" }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-tapsh-charcoal hover:text-tapsh-pale-blue transition-colors text-sm flex items-center group">
                    <span className="w-0 group-hover:w-2 transition-all duration-300 overflow-hidden text-tapsh-soft-green mr-0 group-hover:mr-2">›</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3 - PRODUCTS */}
          <div>
            <h4 className="font-bold text-lg text-white mb-6">Products</h4>
            <ul className="space-y-4">
              {[
                { name: "TAPSH Review", href: "/products#tapsh-review" },
                { name: "TAPSH Wi-Fi", href: "/products#tapsh-wifi" },
                { name: "TAPSH WhatsApp", href: "/products#tapsh-whatsapp" },
                { name: "TAPSH Instagram", href: "/products#tapsh-instagram" },
                { name: "TAPSH Website", href: "/products#tapsh-website" },
                { name: "TAPSH All-in-One", href: "/products#tapsh-all-in-one" }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-tapsh-charcoal hover:text-tapsh-pale-blue transition-colors text-sm flex items-center group">
                    <span className="w-0 group-hover:w-2 transition-all duration-300 overflow-hidden text-tapsh-soft-green mr-0 group-hover:mr-2">›</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4 - CONNECT */}
          <div>
            <h4 className="font-bold text-lg text-white mb-6">Get in Touch</h4>
            <ul className="space-y-6">
              <li>
                <a href="https://wa.me/917977469926" target="_blank" rel="noopener noreferrer" className="flex items-start group">
                  <MessageCircle className="w-5 h-5 text-tapsh-charcoal group-hover:text-[#25D366] transition-colors mr-4 shrink-0" />
                  <div>
                    <span className="block text-white font-medium text-sm mb-1 group-hover:text-[#25D366] transition-colors">WhatsApp</span>
                    <span className="text-tapsh-charcoal text-sm group-hover:text-white transition-colors">+91 79774 69926</span>
                  </div>
                </a>
              </li>
              <li>
                <a href="mailto:tapsh.support@gmail.com" className="flex items-start group">
                  <Mail className="w-5 h-5 text-tapsh-charcoal group-hover:text-tapsh-pale-blue transition-colors mr-4 shrink-0" />
                  <div>
                    <span className="block text-white font-medium text-sm mb-1 group-hover:text-tapsh-pale-blue transition-colors">Email</span>
                    <span className="text-tapsh-charcoal text-sm group-hover:text-white transition-colors">tapsh.support@gmail.com</span>
                  </div>
                </a>
              </li>
              <li>
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-tapsh-charcoal mr-4 shrink-0" />
                  <div>
                    <span className="block text-white font-medium text-sm mb-1">Location</span>
                    <span className="text-tapsh-charcoal text-sm">Kanyakumari, Tamil Nadu, India</span>
                  </div>
                </div>
              </li>

            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="border-t border-tapsh-charcoal/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-tapsh-charcoal">
              &copy; {new Date().getFullYear()} TAPSH. All rights reserved.
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-tapsh-charcoal">
              <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white transition-colors cursor-pointer">Terms & Conditions</span>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}
