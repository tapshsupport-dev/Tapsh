"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Plus, Search, Receipt, CheckCircle2, Clock, AlertCircle, 
  ArrowRight, Download, Printer, Filter 
} from "lucide-react";
import { mockInvoices, mockCustomers } from "@/lib/data";

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredInvoices = mockInvoices.filter((inv) => {
    const customer = mockCustomers.find(c => c.id === inv.customerId);
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer?.businessName && customer.businessName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalBilled = mockInvoices.reduce((acc, i) => acc + i.total, 0);
  const totalCollected = mockInvoices.reduce((acc, i) => acc + i.amountPaid, 0);
  const totalDue = totalBilled - totalCollected;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-tapsh-black">
            Tax Invoices & Billing
          </h1>
          <p className="text-xs sm:text-sm text-tapsh-charcoal mt-1">
            Compliant 18% GST enterprise invoices & receipts.
          </p>
        </div>

        <button 
          onClick={() => alert("To generate an invoice, connect with a client via Customers directory.")}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-tapsh-soft-green text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:brightness-110 active:scale-95 transition-all w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      {/* Financial Summary Strip (Mobile friendly 3-column) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 bg-white p-3.5 sm:p-5 rounded-3xl border border-tapsh-charcoal/15 shadow-xs text-center">
        <div>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-tapsh-charcoal">Billed</p>
          <p className="text-sm sm:text-lg font-bold text-tapsh-black mt-0.5">₹{(totalBilled/1000).toFixed(1)}k</p>
        </div>
        <div className="border-x border-tapsh-charcoal/15">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700">Collected</p>
          <p className="text-sm sm:text-lg font-bold text-emerald-600 mt-0.5">₹{(totalCollected/1000).toFixed(1)}k</p>
        </div>
        <div>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-700">Balance Due</p>
          <p className="text-sm sm:text-lg font-bold text-amber-600 mt-0.5">₹{(totalDue/1000).toFixed(1)}k</p>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white p-4 rounded-3xl border border-tapsh-charcoal/15 shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tapsh-charcoal" />
          <input 
            type="text" 
            placeholder="Search invoice number or business name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-tapsh-charcoal/30 bg-[#FAF8F5] text-tapsh-black text-sm focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green focus:border-transparent transition-all shadow-inner"
          />
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {["ALL", "PAID", "PARTIAL", "PENDING"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                statusFilter === status
                  ? "bg-tapsh-black text-tapsh-beige"
                  : "bg-[#FAF8F5] text-tapsh-charcoal hover:text-tapsh-black border border-tapsh-charcoal/15"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MOBILE INVOICE CARDS (Under md: screen width) */}
      {/* ---------------------------------------------------- */}
      <div className="md:hidden space-y-3">
        {filteredInvoices.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-tapsh-charcoal/15 text-center">
            <p className="text-sm font-bold text-tapsh-black">No invoices found matching criteria.</p>
          </div>
        ) : (
          filteredInvoices.map((inv) => {
            const customer = mockCustomers.find(c => c.id === inv.customerId);
            const balance = inv.total - inv.amountPaid;

            return (
              <div 
                key={inv.id}
                className="bg-white p-4 rounded-3xl border border-tapsh-charcoal/15 shadow-xs flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-tapsh-black tracking-wide">
                      {inv.invoiceNumber}
                    </span>
                    <h3 className="font-bold text-tapsh-black text-sm mt-0.5">
                      {customer?.businessName}
                    </h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                    inv.status === "PAID" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    inv.status === "PARTIAL" ? "bg-blue-50 text-blue-700 border-blue-200" :
                    "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {inv.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-tapsh-charcoal/10 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-tapsh-charcoal block">Total Amount</span>
                    <span className="font-bold text-tapsh-black text-sm">₹{inv.total.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-tapsh-charcoal block">Balance Due</span>
                    <span className={`font-bold text-sm ${balance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                      ₹{balance.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-tapsh-charcoal/10 text-[11px] text-tapsh-charcoal">
                  <span>Issued: {new Date(inv.date).toLocaleDateString()}</span>
                  <Link
                    href={`/admin/invoices/${inv.id}`}
                    className="py-1.5 px-3.5 bg-tapsh-black text-tapsh-beige font-bold rounded-xl active:scale-95 transition-all text-xs"
                  >
                    View Invoice &rarr;
                  </Link>
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
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Client Business</th>
                <th className="px-6 py-4">Issue Date</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Amount Paid</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tapsh-charcoal/10">
              {filteredInvoices.map((inv) => {
                const customer = mockCustomers.find(c => c.id === inv.customerId);
                return (
                  <tr key={inv.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-tapsh-black">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 font-bold text-tapsh-black">
                      {customer?.businessName}
                    </td>
                    <td className="px-6 py-4 text-xs text-tapsh-charcoal font-medium">
                      {new Date(inv.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-tapsh-black">
                      ₹{inv.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-emerald-600 font-bold">
                      ₹{inv.amountPaid.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                        inv.status === "PAID" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        inv.status === "PARTIAL" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/invoices/${inv.id}`}
                        className="py-1.5 px-3 bg-[#FAF8F5] border border-tapsh-charcoal/20 text-tapsh-black text-xs font-bold rounded-xl hover:border-tapsh-soft-green transition-colors inline-block"
                      >
                        View &rarr;
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
