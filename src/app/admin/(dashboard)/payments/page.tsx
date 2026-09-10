"use client";

import { useState } from "react";
import { QrCode, Search, CheckCircle2, Copy, Check, Sparkles, CreditCard } from "lucide-react";
import { mockCustomers, mockInvoices } from "@/lib/data";

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    mockInvoices.find(i => i.status === "PENDING" || i.status === "PARTIAL")?.id || null
  );
  const [amountReceived, setAmountReceived] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [copiedUPI, setCopiedUPI] = useState(false);
  const [recordedSuccess, setRecordedSuccess] = useState(false);

  // Filter pending/partial invoices
  const pendingInvoices = mockInvoices.filter(
    (inv) => inv.status === "PENDING" || inv.status === "PARTIAL"
  ).filter((inv) => {
    const customer = mockCustomers.find(c => c.id === inv.customerId);
    return (
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer?.businessName && customer.businessName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const selectedInvoice = mockInvoices.find(i => i.id === selectedInvoiceId);
  const selectedCustomer = mockCustomers.find(c => c.id === selectedInvoice?.customerId);
  const currentBalance = selectedInvoice ? (selectedInvoice.total - selectedInvoice.amountPaid) : 0;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText("tapsh@upi");
    setCopiedUPI(true);
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    
    setRecordedSuccess(true);
    setTimeout(() => {
      setRecordedSuccess(false);
    }, 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-tapsh-black">
          Payments & UPI Collection
        </h1>
        <p className="text-xs sm:text-sm text-tapsh-charcoal mt-1">
          Receive payments via business UPI or record offline client settlements.
        </p>
      </div>

      {/* Success Notification */}
      {recordedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 rounded-3xl text-xs sm:text-sm font-bold flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Payment of ₹{(amountReceived ? Number(amountReceived) : currentBalance).toLocaleString()} successfully recorded for {selectedCustomer?.businessName}!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Official TAPSH UPI QR Card (Compact on mobile) */}
        <div className="lg:col-span-1">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-tapsh-charcoal/15 shadow-xs text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-tapsh-soft-green/10 text-tapsh-soft-green text-[10px] font-bold tracking-wider uppercase mb-3">
              Direct Account Settlement
            </span>
            <h2 className="text-lg font-bold text-tapsh-black">TAPSH Business UPI</h2>
            <p className="text-xs text-tapsh-charcoal mt-0.5 mb-4">
              Scan with GPay, PhonePe, Paytm, or BHIM
            </p>
            
            {/* QR Mock Display */}
            <div className="w-48 h-48 sm:w-52 sm:h-52 bg-[#FAF8F5] mx-auto rounded-3xl flex flex-col items-center justify-center p-4 mb-4 border-2 border-tapsh-charcoal/15 shadow-inner relative group">
              <QrCode className="w-36 h-36 sm:w-40 sm:h-40 text-tapsh-black" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-3xl backdrop-blur-xs text-white text-xs font-bold">
                Scan to Pay
              </div>
            </div>
            
            {/* Copy VPA button */}
            <div className="flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/15 max-w-xs mx-auto">
              <span className="font-mono text-xs font-bold text-tapsh-black">tapsh@upi</span>
              <button
                type="button"
                onClick={handleCopyUPI}
                className="p-1.5 rounded-xl bg-tapsh-soft-green text-white hover:brightness-110 active:scale-90 transition-all text-xs"
                title="Copy UPI ID"
              >
                {copiedUPI ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-tapsh-charcoal mt-2">Verified Merchant: TAPSH Technologies Pvt Ltd</p>
          </div>
        </div>

        {/* Right Column: Pending Invoices & Recording Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Invoices Selection Card */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-tapsh-charcoal/15 shadow-xs">
            <h2 className="text-base font-bold text-tapsh-black mb-1">
              Select Invoice to Record Payment
            </h2>
            <p className="text-xs text-tapsh-charcoal mb-4">
              Choose an invoice with an outstanding balance.
            </p>

            {/* Quick Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tapsh-charcoal" />
              <input
                type="text"
                placeholder="Search invoice or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-tapsh-charcoal/20 bg-[#FAF8F5] text-xs sm:text-sm text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
              />
            </div>

            {/* Invoices List */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {pendingInvoices.length === 0 ? (
                <p className="text-xs text-tapsh-charcoal py-4 text-center">No outstanding invoices matching search.</p>
              ) : (
                pendingInvoices.map((inv) => {
                  const customer = mockCustomers.find(c => c.id === inv.customerId);
                  const balance = inv.total - inv.amountPaid;
                  const isSelected = selectedInvoiceId === inv.id;

                  return (
                    <div
                      key={inv.id}
                      onClick={() => {
                        setSelectedInvoiceId(inv.id);
                        setAmountReceived(balance.toString());
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected 
                          ? "border-tapsh-soft-green bg-tapsh-soft-green/10 shadow-xs" 
                          : "border-tapsh-charcoal/15 bg-[#FAF8F5] hover:border-tapsh-charcoal/30"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-tapsh-black">{inv.invoiceNumber}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-tapsh-charcoal/15 text-amber-700">
                            {inv.status}
                          </span>
                        </div>
                        <p className="text-xs text-tapsh-charcoal truncate mt-0.5">{customer?.businessName}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[10px] uppercase font-bold text-tapsh-charcoal">Due Balance</p>
                        <p className="text-xs sm:text-sm font-bold text-red-600">₹{balance.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Payment Recording Form */}
          {selectedInvoice && (
            <div className="bg-white p-5 sm:p-7 rounded-3xl border border-tapsh-charcoal/15 shadow-xs">
              <h2 className="text-base font-bold text-tapsh-black mb-1">
                Record Payment Details
              </h2>
              <p className="text-xs text-tapsh-charcoal mb-4">
                Applying to <strong className="text-tapsh-black">{selectedInvoice.invoiceNumber}</strong> ({selectedCustomer?.businessName})
              </p>

              <form onSubmit={handleConfirmPayment} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5">
                      Amount Received (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-tapsh-charcoal">₹</span>
                      <input
                        type="number"
                        required
                        value={amountReceived || currentBalance}
                        onChange={(e) => setAmountReceived(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 rounded-2xl border border-tapsh-charcoal/30 bg-[#FAF8F5] text-tapsh-black text-sm font-bold focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-1.5">
                      Payment Channel
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-tapsh-charcoal/30 bg-[#FAF8F5] text-tapsh-black text-sm font-bold focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green"
                    >
                      <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                      <option value="BANK_TRANSFER">NEFT / RTGS Bank Transfer</option>
                      <option value="CARD">Credit / Debit Card</option>
                      <option value="CASH">Cash On Delivery</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 bg-tapsh-soft-green text-white rounded-2xl font-bold hover:brightness-110 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirm & Post Payment
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
