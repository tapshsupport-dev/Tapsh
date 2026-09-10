"use client";

import { useState } from "react";
import { QrCode, Search, CheckCircle2 } from "lucide-react";
import { mockCustomers, mockInvoices } from "@/lib/data";

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  // Filter invoices that are not fully paid
  const pendingInvoices = mockInvoices.filter(
    (inv) => inv.status === "PENDING" || inv.status === "PARTIAL"
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-tapsh-black">Payments</h1>
        <button className="w-full sm:w-auto px-6 py-3 bg-tapsh-soft-green text-tapsh-pale-blue rounded-xl font-bold hover:brightness-110 transition-colors text-sm shadow-md">
          Record Payment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: TAPSH UPI QR */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl border border-tapsh-charcoal/20 shadow-md text-center">
            <h2 className="text-xl font-bold text-tapsh-black mb-2">TAPSH UPI QR</h2>
            <p className="text-tapsh-charcoal font-medium text-sm mb-8">
              Display this QR to the customer for direct business account payment.
            </p>
            
            <div className="w-56 h-56 bg-white mx-auto rounded-2xl flex items-center justify-center p-4 mb-6 border-2 border-tapsh-charcoal/30 shadow-lg">
              {/* Placeholder for actual UPI QR Image */}
              <QrCode className="w-full h-full text-tapsh-black" />
            </div>
            
            <p className="font-bold text-tapsh-black text-lg tracking-wider">TAPSH TECH</p>
            <p className="text-tapsh-soft-green font-mono font-bold text-sm mt-1">tapsh@upi</p>
          </div>
        </div>

        {/* Right Column: Manual Recording */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-tapsh-charcoal/20 shadow-md overflow-hidden">
            <div className="p-6 border-b border-tapsh-charcoal/20 bg-tapsh-pale-blue">
              <h2 className="text-xl font-bold text-tapsh-black mb-4">Record Manual Payment</h2>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tapsh-charcoal" />
                <input 
                  type="text"
                  placeholder="Search invoice number or customer..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-tapsh-charcoal/40 bg-white text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green focus:border-transparent font-medium shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="p-6 bg-white">
              <h3 className="text-xs font-bold text-tapsh-charcoal uppercase tracking-wider mb-4">Pending Invoices</h3>
              
              <div className="space-y-4">
                {pendingInvoices.map((inv) => {
                  const customer = mockCustomers.find(c => c.id === inv.customerId);
                  const balance = inv.total - inv.amountPaid;
                  const isSelected = selectedInvoice === inv.id;

                  return (
                    <div 
                      key={inv.id} 
                      className={`border-2 rounded-2xl p-5 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-tapsh-soft-green bg-tapsh-pale-blue shadow-md' 
                          : 'border-tapsh-charcoal/20 bg-white hover:border-tapsh-charcoal/50'
                      }`}
                      onClick={() => setSelectedInvoice(inv.id)}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 mb-2">
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="font-bold text-tapsh-black text-lg">{inv.invoiceNumber}</h4>
                            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-white border border-tapsh-charcoal/30 text-tapsh-soft-green shadow-sm">
                              {inv.status}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-tapsh-charcoal mt-1">{customer?.businessName}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1">Balance Due</p>
                          <p className="font-bold text-red-600 text-lg">₹{balance.toLocaleString()}</p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-6 pt-5 border-t border-tapsh-charcoal/20">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-black mb-2">Amount Received</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-tapsh-charcoal font-bold">₹</span>
                                <input 
                                  type="number" 
                                  defaultValue={balance}
                                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-tapsh-charcoal/40 bg-white text-tapsh-black font-bold focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green focus:border-transparent shadow-sm"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-black mb-2">Payment Method</label>
                              <select className="w-full px-4 py-3 rounded-xl border border-tapsh-charcoal/40 bg-white text-tapsh-black font-bold focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green focus:border-transparent shadow-sm">
                                <option>UPI</option>
                                <option>Cash</option>
                                <option>Bank Transfer</option>
                                <option>Card</option>
                                <option>Other</option>
                              </select>
                            </div>
                          </div>
                          <button className="w-full py-4 bg-tapsh-soft-green text-tapsh-pale-blue rounded-xl font-bold hover:brightness-110 flex items-center justify-center gap-2 shadow-md">
                            <CheckCircle2 className="w-5 h-5" /> Confirm Payment
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
