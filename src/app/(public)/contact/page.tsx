"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name")?.toString().trim();
    const businessName = formData.get("businessName")?.toString().trim();
    const phone = formData.get("phone")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const businessType = formData.get("businessType")?.toString().trim();
    const message = formData.get("message")?.toString().trim();

    if (!name) { setError("Please enter your name."); return; }
    if (!businessName) { setError("Please enter your business name."); return; }
    if (!phone) { setError("Please enter a valid phone number."); return; }
    if (!businessType) { setError("Please select a business type."); return; }

    const text = `*Hello TAPSH,*\n\nI'd like to enquire about TAPSH solutions for my business.\n\n*Name:* ${name}\n*Business Name:* ${businessName}\n*Phone:* ${phone}${email ? `\n*Email:* ${email}` : ""}\n*Business Type:* ${businessType}${message ? `\n*Requirements:* ${message}` : ""}\n\nThank you.`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/910000000000?text=${encodedText}`, '_blank');
  };

  return (
    <div className="min-h-screen pt-20 bg-tapsh-pale-blue text-tapsh-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          
          {/* Information Side */}
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-tapsh-black mb-6">Contact TAPSH</h1>
            <p className="text-lg sm:text-xl text-tapsh-charcoal mb-8 sm:mb-12 max-w-md">
              We're currently onboarding select businesses. Get in touch to see how TAPSH can connect your physical space to the digital world.
            </p>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-tapsh-charcoal/20 shadow-lg mb-8">
              <h3 className="font-bold text-xl text-tapsh-black mb-4">Fastest way to reach us</h3>
              <p className="text-tapsh-charcoal mb-6">Send us a direct message on WhatsApp for immediate assistance.</p>
              <Link 
                href="https://wa.me/910000000000" 
                target="_blank"
                className="inline-flex items-center gap-3 px-6 py-3 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#20bd5a] transition-colors shadow-md"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp TAPSH
              </Link>
            </div>
            
            <div className="space-y-4 bg-tapsh-pale-blue p-6 rounded-2xl border border-tapsh-charcoal/20">
              <p className="text-tapsh-black">
                <strong className="block text-sm uppercase tracking-wider text-tapsh-charcoal mb-1">Email</strong>
                hello@tapsh.in
              </p>
              <p className="text-tapsh-black">
                <strong className="block text-sm uppercase tracking-wider text-tapsh-charcoal mb-1">Location</strong>
                India
              </p>
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-white p-6 sm:p-8 md:p-12 rounded-3xl border border-tapsh-charcoal/20 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-xl sm:text-2xl font-bold text-tapsh-black mb-6 sm:mb-8">Want TAPSH for your business?</h3>
                
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-tapsh-black mb-2">Name *</label>
                    <input 
                      id="name"
                      name="name"
                      required
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-tapsh-charcoal/40 bg-tapsh-pale-blue text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-tapsh-black mb-2">Business Name *</label>
                    <input 
                      id="businessName"
                      name="businessName"
                      required
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-tapsh-charcoal/40 bg-tapsh-pale-blue text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-tapsh-black mb-2">Phone *</label>
                    <input 
                      id="phone"
                      name="phone"
                      required
                      type="tel" 
                      pattern="[+]?[0-9\s\-()]{7,15}"
                      title="Please enter a valid phone number (7 to 15 digits)"
                      className="w-full px-4 py-3 rounded-xl border border-tapsh-charcoal/40 bg-tapsh-pale-blue text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-tapsh-black mb-2">Email</label>
                    <input 
                      id="email"
                      name="email"
                      type="email" 
                      className="w-full px-4 py-3 rounded-xl border border-tapsh-charcoal/40 bg-tapsh-pale-blue text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="businessType" className="block text-sm font-medium text-tapsh-black mb-2">Business Type *</label>
                    <select id="businessType" name="businessType" required className="w-full px-4 py-3 rounded-xl border border-tapsh-charcoal/40 bg-tapsh-pale-blue text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green focus:border-transparent transition-all">
                      <option value="">Select Business Type</option>
                      <option value="Resort / Hotel">Resort / Hotel</option>
                      <option value="Restaurant / Café">Restaurant / Café</option>
                      <option value="Salon / Spa">Salon / Spa</option>
                      <option value="Clinic">Clinic</option>
                      <option value="Retail">Retail</option>
                      <option value="Office">Office</option>
                      <option value="Homestay">Homestay</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-tapsh-black mb-2">Message</label>
                  <textarea 
                    id="message"
                    name="message"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-tapsh-charcoal/40 bg-tapsh-pale-blue text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green focus:border-transparent transition-all"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-tapsh-soft-green text-tapsh-pale-blue rounded-xl font-bold hover:brightness-110 transition-colors shadow-lg mt-4"
                >
                  Send Enquiry
                </button>
              </form>
          </div>

        </div>
      </div>
    </div>
  );
}
