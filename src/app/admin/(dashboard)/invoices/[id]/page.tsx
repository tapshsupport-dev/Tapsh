import Link from "next/link";
import { notFound } from "next/navigation";
import { mockInvoices } from "@/lib/data";
import { getCustomerById } from "@/lib/firestoreService";
import { Printer, Download, Clock, ArrowLeft, CheckCircle2, Building2 } from "lucide-react";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = mockInvoices.find(i => i.id === id);

  if (!invoice) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-tapsh-charcoal/20 text-center max-w-md mx-auto my-12">
        <h2 className="text-xl font-bold text-tapsh-black mb-2">Invoice Not Found</h2>
        <p className="text-sm text-tapsh-charcoal mb-6">The requested tax invoice could not be located.</p>
        <Link href="/admin/invoices" className="px-6 py-3 bg-tapsh-black text-tapsh-beige font-bold text-sm rounded-xl inline-block">
          &larr; Return to Invoices
        </Link>
      </div>
    );
  }

  const firestoreCustomer = await getCustomerById(invoice.customerId);
  const customer = firestoreCustomer || {
    id: invoice.customerId,
    businessName: "Enterprise Account",
    contactPerson: "Account Manager",
    phone: "+91 99000 00000",
    email: "billing@tapsh.in",
    address: "Commercial Premises",
    city: "India",
    businessType: "Other" as const,
    notes: "",
    status: "ACTIVE" as const,
    createdAt: new Date().toISOString()
  };

  const balanceDue = invoice.total - invoice.amountPaid;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link 
          href="/admin/invoices" 
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-tapsh-charcoal hover:text-tapsh-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </Link>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            href="/admin/history"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-tapsh-soft-green text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-xs active:scale-95 transition-all"
          >
            <Clock className="w-4 h-4" /> View History
          </Link>
        </div>
      </div>

      {/* Main Printable Tax Invoice Receipt Card */}
      <div className="bg-white rounded-3xl shadow-xs border border-tapsh-charcoal/15 p-5 sm:p-10 relative overflow-hidden">
        
        {/* Top Accent Strip */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-tapsh-soft-green via-tapsh-beige to-tapsh-taupe"></div>

        {/* Invoice Title & Business Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-tapsh-charcoal/15 pb-8 mb-8 pt-2">
          <div>
            <span className="text-2xl sm:text-3xl font-bold tracking-widest text-tapsh-black">TAPSH</span>
            <p className="text-xs text-tapsh-soft-green font-bold uppercase tracking-widest mt-0.5">
              Tap. Connect. Grow.
            </p>
            <div className="mt-3 text-xs text-tapsh-charcoal space-y-0.5 font-medium">
              <p>TAPSH Technologies Private Limited</p>
              <p>GSTIN: 29AAACT9812M1Z5</p>
              <p>Email: tapsh.support@gmail.com</p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-[#FAF8F5] sm:bg-transparent p-4 sm:p-0 rounded-2xl w-full sm:w-auto border sm:border-0 border-tapsh-charcoal/10">
            <h1 className="text-lg font-bold text-tapsh-black uppercase tracking-wider">
              Tax Invoice
            </h1>
            <p className="font-mono text-xs sm:text-sm font-bold text-tapsh-black mt-1">
              {invoice.invoiceNumber}
            </p>
            <div className="mt-2 text-xs text-tapsh-charcoal space-y-0.5">
              <p>Date: <strong className="text-tapsh-black">{new Date(invoice.date).toLocaleDateString()}</strong></p>
              <p>Due: <strong className="text-tapsh-black">{new Date(invoice.dueDate).toLocaleDateString()}</strong></p>
              <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                invoice.status === "PAID" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                invoice.status === "PARTIAL" ? "bg-blue-50 text-blue-700 border-blue-200" :
                "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                STATUS: {invoice.status}
              </span>
            </div>
          </div>
        </div>

        {/* Billed To Client */}
        <div className="mb-8 p-4 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/10">
          <p className="text-[10px] font-bold uppercase tracking-wider text-tapsh-charcoal mb-1">
            Billed Client (Customer)
          </p>
          <h2 className="text-base font-bold text-tapsh-black">
            {customer.businessName}
          </h2>
          <div className="text-xs text-tapsh-charcoal mt-1 space-y-0.5 font-medium">
            <p>Attn: {customer.contactPerson}</p>
            <p>{customer.address}, {customer.city}</p>
            <p>Phone: {customer.phone} • {customer.email}</p>
          </div>
        </div>

        {/* Items Table - Mobile Friendly Cards on Small Screens */}
        <div className="mb-8 border border-tapsh-charcoal/15 rounded-2xl overflow-hidden">
          <div className="bg-[#FAF8F5] px-4 py-3 border-b border-tapsh-charcoal/15 flex justify-between text-[11px] font-bold uppercase tracking-wider text-tapsh-charcoal">
            <span>Item Description</span>
            <span>Total</span>
          </div>

          <div className="divide-y divide-tapsh-charcoal/10">
            {invoice.items.map((item, idx) => (
              <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-tapsh-black">
                    {item.productName}
                  </p>
                  <p className="text-[11px] text-tapsh-charcoal mt-0.5">
                    Qty: <strong className="text-tapsh-black">{item.quantity}</strong> × ₹{item.unitPrice.toLocaleString()}
                  </p>
                </div>
                <div className="text-right font-bold text-xs sm:text-sm text-tapsh-black">
                  ₹{item.total.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals & Tax Calculation Breakdown */}
        <div className="flex flex-col sm:flex-row justify-between gap-6">
          <div className="text-xs text-tapsh-charcoal space-y-1.5 flex-1">
            <p className="font-bold uppercase text-[10px] text-tapsh-black tracking-wider">Payment Instructions</p>
            <p>Direct UPI VPA: <span className="font-mono font-bold text-tapsh-black">tapsh@upi</span></p>
            <p>Bank: HDFC Bank Ltd. (Commercial Branch)</p>
            <p>A/C: 50200088192831 • IFSC: HDFC0000128</p>
          </div>

          <div className="w-full sm:w-64 space-y-2 p-4 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/10 text-xs">
            <div className="flex justify-between text-tapsh-charcoal">
              <span>Subtotal:</span>
              <span className="font-bold text-tapsh-black">₹{invoice.subtotal.toLocaleString()}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Discount:</span>
                <span>-₹{invoice.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-tapsh-charcoal">
              <span>18% GST:</span>
              <span className="font-bold text-tapsh-black">₹{invoice.taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-tapsh-black border-t border-tapsh-charcoal/15 pt-2">
              <span>Total:</span>
              <span>₹{invoice.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Paid:</span>
              <span>₹{invoice.amountPaid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-red-600 border-t border-tapsh-charcoal/15 pt-2">
              <span>Balance Due:</span>
              <span>₹{balanceDue.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
