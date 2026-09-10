"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Plus, Search, Phone, Mail, MapPin, Building2, ExternalLink, 
  ChevronRight, Sparkles 
} from "lucide-react";
import { mockCustomers, mockHubs } from "@/lib/data";

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const filteredCustomers = mockCustomers.filter((customer) => {
    const matchesSearch = 
      customer.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "ALL" || customer.businessType === typeFilter;

    return matchesSearch && matchesType;
  });

  const businessTypes = ["ALL", "Resort / Hotel", "Restaurant / Café", "Salon / Spa", "Clinic", "Retail"];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-tapsh-black">
            Client Directory
          </h1>
          <p className="text-xs sm:text-sm text-tapsh-charcoal mt-1">
            {mockCustomers.length} active enterprise accounts deployed with TAPSH hardware.
          </p>
        </div>

        <Link 
          href="/admin/hubs/setup"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-tapsh-black text-tapsh-beige rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:bg-tapsh-taupe active:scale-95 transition-all w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Add New Client
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-tapsh-charcoal/15 shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tapsh-charcoal" />
          <input 
            type="text" 
            placeholder="Search by business, manager or city..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-tapsh-charcoal/30 bg-[#FAF8F5] text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green focus:border-transparent transition-all shadow-inner"
          />
        </div>

        {/* Scrollable category pills for mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {businessTypes.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                typeFilter === type
                  ? "bg-tapsh-black text-tapsh-beige"
                  : "bg-[#FAF8F5] text-tapsh-charcoal hover:text-tapsh-black border border-tapsh-charcoal/15"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MOBILE CARDS VIEW (Under md: screen width) */}
      {/* ---------------------------------------------------- */}
      <div className="md:hidden space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-tapsh-charcoal/15 text-center">
            <p className="text-sm font-bold text-tapsh-black">No clients found matching your search.</p>
          </div>
        ) : (
          filteredCustomers.map((customer) => {
            const hub = mockHubs.find(h => h.customerId === customer.id);
            return (
              <div 
                key={customer.id} 
                className="bg-white p-4 rounded-3xl border border-tapsh-charcoal/15 shadow-xs flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-tapsh-pale-blue text-tapsh-black font-bold text-sm flex items-center justify-center border border-tapsh-charcoal/15 shrink-0 shadow-inner">
                      {customer.businessName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-tapsh-black text-sm leading-snug">
                        {customer.businessName}
                      </h3>
                      <span className="inline-block text-[11px] font-bold text-tapsh-soft-green bg-tapsh-soft-green/10 px-2 py-0.5 rounded-md mt-0.5">
                        {customer.businessType}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    {customer.status}
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-tapsh-charcoal/10 text-xs text-tapsh-charcoal">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-tapsh-charcoal shrink-0" />
                    <span className="truncate">{customer.address}, {customer.city}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold text-tapsh-black">Contact:</span>
                    <span>{customer.contactPerson}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-tapsh-charcoal/10">
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="flex-1 py-2.5 px-3 bg-tapsh-black text-tapsh-beige text-xs font-bold rounded-xl text-center shadow-xs active:scale-95 transition-all"
                  >
                    View Account Profile
                  </Link>
                  {hub && (
                    <a
                      href={`/h/${hub.slug}`}
                      target="_blank"
                      className="p-2.5 bg-[#FAF8F5] border border-tapsh-charcoal/20 text-tapsh-black rounded-xl hover:border-tapsh-soft-green active:scale-95 transition-all"
                      aria-label="Open Live Hub"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* DESKTOP TABLE VIEW (Visible on md: and larger) */}
      {/* ---------------------------------------------------- */}
      <div className="hidden md:block bg-white rounded-3xl border border-tapsh-charcoal/15 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#FAF8F5] text-tapsh-charcoal font-bold border-b border-tapsh-charcoal/15 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Client Enterprise</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Primary Contact</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tapsh-charcoal/10">
              {filteredCustomers.map((customer) => {
                const hub = mockHubs.find(h => h.customerId === customer.id);
                return (
                  <tr key={customer.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-tapsh-pale-blue text-tapsh-black font-bold text-xs flex items-center justify-center border border-tapsh-charcoal/15 shadow-inner">
                          {customer.businessName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-tapsh-black">{customer.businessName}</p>
                          {hub && (
                            <span className="text-[11px] text-tapsh-charcoal">tapsh.in/h/{hub.slug}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-tapsh-charcoal">{customer.businessType}</td>
                    <td className="px-6 py-4 text-tapsh-black">
                      <p className="font-medium text-xs">{customer.contactPerson}</p>
                      <p className="text-[11px] text-tapsh-charcoal">{customer.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-tapsh-charcoal">{customer.city}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {hub && (
                        <a 
                          href={`/h/${hub.slug}`} 
                          target="_blank" 
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FAF8F5] border border-tapsh-charcoal/20 text-tapsh-black rounded-lg text-xs font-bold hover:border-tapsh-soft-green transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" /> Hub
                        </a>
                      )}
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-tapsh-black text-tapsh-beige rounded-lg text-xs font-bold hover:bg-tapsh-taupe transition-colors"
                      >
                        Profile &rarr;
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
