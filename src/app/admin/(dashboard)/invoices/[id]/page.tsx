import Link from "next/link";
import { mockInvoices, mockCustomers } from "@/lib/data";
import { Printer, Download, CreditCard } from "lucide-react";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = mockInvoices.find(i => i.id === id);
  const customer = mockCustomers.find(c => c.id === invoice?.customerId);

  if (!invoice || !customer) {
    return <div className="text-tapsh-black">Invoice not found</div>;
  }

  const balanceDue = invoice.total - invoice.amountPaid;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link href="/admin/invoices" className="text-tapsh-charcoal hover:text-tapsh-black font-bold text-sm">
          &larr; Back to Invoices
        </Link>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-tapsh-charcoal/30 text-tapsh-black rounded-xl text-sm font-bold hover:border-tapsh-soft-green transition-all shadow-sm">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-tapsh-charcoal/30 text-tapsh-black rounded-xl text-sm font-bold hover:border-tapsh-soft-green transition-all shadow-sm">
            <Download className="w-4 h-4" /> PDF
          </button>
          {balanceDue > 0 && (
            <button className="flex items-center gap-2 px-6 py-2.5 bg-tapsh-soft-green text-tapsh-pale-blue rounded-xl text-sm font-bold hover:brightness-110 shadow-md">
              <CreditCard className="w-4 h-4" /> Record Payment
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-tapsh-charcoal/20 p-8 md:p-12 relative overflow-hidden">
        
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8 sm:gap-0 border-b border-tapsh-charcoal/20 pb-10 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-tapsh-black tracking-widest mb-2">TAPSH</h1>
            <p className="text-sm text-tapsh-soft-green font-bold uppercase tracking-widest">Tap. Connect. Grow.</p>
            <p className="text-sm text-tapsh-charcoal mt-4 font-medium">GSTIN: 29XXXXXXXXXXXXX</p>
          </div>
          <div className="text-left sm:text-right">
            <h2 className="text-2xl font-bold text-tapsh-charcoal/40 uppercase tracking-widest mb-4">Invoice</h2>
            <div className="space-y-1 text-sm text-tapsh-black">
              <p><span className="text-tapsh-charcoal font-bold uppercase tracking-wider text-xs mr-2">Invoice No:</span> <span className="font-bold">{invoice.invoiceNumber}</span></p>
              <p><span className="text-tapsh-charcoal font-bold uppercase tracking-wider text-xs mr-2">Date:</span> {new Date(invoice.date).toLocaleDateString()}</p>
              <p><span className="text-tapsh-charcoal font-bold uppercase tracking-wider text-xs mr-2">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Billed To */}
        <div className="mb-10">
          <p className="text-xs font-bold text-tapsh-charcoal uppercase tracking-widest mb-3">Billed To</p>
          <h3 className="text-xl font-bold text-tapsh-black mb-2">{customer.businessName}</h3>
          <p className="text-sm text-tapsh-black/80 font-medium">{customer.address}</p>
          <p className="text-sm text-tapsh-black/80 font-medium">{customer.email}</p>
          <p className="text-sm text-tapsh-black/80 font-medium">{customer.phone}</p>
        </div>

        {/* Items Table */}
        <div className="mb-10 bg-tapsh-pale-blue rounded-2xl border border-tapsh-charcoal/20 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-tapsh-charcoal/20 text-tapsh-black">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Description</th>
                <th className="px-6 py-4 font-bold text-center uppercase tracking-wider text-xs">Qty</th>
                <th className="px-6 py-4 font-bold text-right uppercase tracking-wider text-xs">Unit Price</th>
                <th className="px-6 py-4 font-bold text-right uppercase tracking-wider text-xs">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tapsh-charcoal/10">
              {invoice.items.map((item, i) => (
                <tr key={i} className="text-tapsh-black">
                  <td className="px-6 py-5 font-bold">{item.productName}</td>
                  <td className="px-6 py-5 text-center font-medium">{item.quantity}</td>
                  <td className="px-6 py-5 text-right font-medium">₹{item.unitPrice.toLocaleString()}</td>
                  <td className="px-6 py-5 text-right font-bold text-tapsh-soft-green">₹{item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full max-w-sm space-y-4 text-sm bg-white p-6 rounded-2xl border border-tapsh-charcoal/20 shadow-sm">
            <div className="flex justify-between text-tapsh-black">
              <span className="text-tapsh-charcoal font-bold">Subtotal</span>
              <span className="font-bold">₹{invoice.subtotal.toLocaleString()}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-tapsh-soft-green font-bold">
                <span>Discount</span>
                <span>-₹{invoice.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-tapsh-black">
              <span className="text-tapsh-charcoal font-bold">GST ({(invoice.taxRate * 100).toFixed(0)}%)</span>
              <span className="font-bold">₹{invoice.taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-tapsh-charcoal/20 pt-4 text-lg font-bold text-tapsh-black">
              <span>Total</span>
              <span>₹{invoice.total.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-tapsh-soft-green font-bold mt-2">
              <span>Amount Paid</span>
              <span>₹{invoice.amountPaid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-tapsh-charcoal/20 pt-4 text-xl font-bold text-red-600">
              <span>Balance Due</span>
              <span>₹{balanceDue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-16 pt-8 border-t border-tapsh-charcoal/20 text-sm text-tapsh-charcoal bg-tapsh-pale-blue p-6 rounded-2xl">
          <p className="font-bold mb-2 text-tapsh-black uppercase tracking-wider text-xs">Payment Instructions</p>
          <p className="font-medium leading-relaxed">Please make payment via UPI or Bank Transfer. Ensure to quote the invoice number as a reference. Tapsh currently does not support automated gateway capture for setup invoices.</p>
        </div>
      </div>
    </div>
  );
}
