import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  mockCustomers, mockHubs, mockAuditLogs, mockInvoices 
} from "@/lib/data";
import { 
  ArrowLeft, Phone, Mail, MapPin, ExternalLink, QrCode, 
  Copy, CheckCircle2, Receipt, Clock, Sparkles, Building2 
} from "lucide-react";

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = mockCustomers.find(c => c.id === id);
  const hub = mockHubs.find(h => h.customerId === id);
  const customerInvoices = mockInvoices.filter(i => i.customerId === id);
  const customerLogs = mockAuditLogs.filter(l => l.entityId === hub?.id || l.entityId === id);

  if (!customer) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-tapsh-charcoal/20 text-center max-w-md mx-auto my-12">
        <h2 className="text-xl font-bold text-tapsh-black mb-2">Customer Not Found</h2>
        <p className="text-sm text-tapsh-charcoal mb-6">The requested client record does not exist.</p>
        <Link href="/admin/customers" className="px-6 py-3 bg-tapsh-black text-tapsh-beige font-bold text-sm rounded-xl inline-block">
          &larr; Return to Clients
        </Link>
      </div>
    );
  }

  const cleanPhone = customer.phone.replace(/[^0-9+]/g, "");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Back Link */}
      <div>
        <Link 
          href="/admin/customers" 
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-tapsh-charcoal hover:text-tapsh-black py-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Client Directory
        </Link>
      </div>

      {/* Profile Overview Card (Mobile optimized) */}
      <div className="bg-white rounded-3xl border border-tapsh-charcoal/15 shadow-xs p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-tapsh-pale-blue border border-tapsh-charcoal/20 flex items-center justify-center text-2xl sm:text-3xl font-bold text-tapsh-black shrink-0 shadow-inner">
              {customer.businessName.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-tapsh-black tracking-tight">
                  {customer.businessName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {customer.status}
                </span>
              </div>
              <p className="text-xs font-bold text-tapsh-soft-green">
                {customer.businessType} • {customer.city}
              </p>
              <p className="text-xs text-tapsh-charcoal mt-1">
                Contact: <span className="font-semibold text-tapsh-black">{customer.contactPerson}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Dialers on Mobile */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-tapsh-charcoal/10">
            <a 
              href={`tel:${cleanPhone}`}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-[#FAF8F5] border border-tapsh-charcoal/20 text-xs font-bold text-tapsh-black hover:border-tapsh-soft-green active:scale-95 transition-all"
            >
              <Phone className="w-3.5 h-3.5 text-tapsh-soft-green" /> Call
            </a>
            <a 
              href={`mailto:${customer.email}`}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-[#FAF8F5] border border-tapsh-charcoal/20 text-xs font-bold text-tapsh-black hover:border-tapsh-soft-green active:scale-95 transition-all"
            >
              <Mail className="w-3.5 h-3.5 text-tapsh-soft-green" /> Email
            </a>
          </div>
        </div>

        {/* Client Address & Notes */}
        <div className="mt-5 pt-4 border-t border-tapsh-charcoal/10 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-bold text-tapsh-charcoal uppercase tracking-wider text-[10px] block mb-1">
              Registered Address
            </span>
            <p className="text-tapsh-black font-medium leading-relaxed">
              {customer.address}, {customer.city}
            </p>
          </div>
          <div>
            <span className="font-bold text-tapsh-charcoal uppercase tracking-wider text-[10px] block mb-1">
              Hardware & Hub Notes
            </span>
            <p className="text-tapsh-charcoal leading-relaxed font-medium">
              {customer.notes}
            </p>
          </div>
        </div>
      </div>

      {/* Permanent Hub Status Card */}
      <div className="bg-white rounded-3xl border border-tapsh-charcoal/15 shadow-xs p-5 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-tapsh-soft-green" />
            <h2 className="text-base sm:text-lg font-bold text-tapsh-black">
              TAPSH Permanent Digital Hub
            </h2>
          </div>
          {hub ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-tapsh-soft-green/10 text-tapsh-soft-green border border-tapsh-soft-green/30">
              ACTIVE ROUTING
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
              NO HUB DEPLOYED
            </span>
          )}
        </div>

        {hub ? (
          <div className="space-y-4">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-tapsh-charcoal block mb-0.5 tracking-wider">
                  Live Public Destination
                </span>
                <code className="text-xs sm:text-sm font-bold text-tapsh-black font-mono break-all">
                  tapsh.in/h/{hub.slug}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={`/h/${hub.slug}`}
                  target="_blank"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-tapsh-black text-tapsh-beige text-xs font-bold shadow-xs active:scale-95 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Hub
                </a>
              </div>
            </div>

            {/* Active modules preview */}
            <div>
              <span className="text-[11px] font-bold text-tapsh-charcoal uppercase tracking-wider block mb-2">
                Configured Touchpoint Links ({hub.links.length})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {hub.links.map((l) => (
                  <div key={l.id} className="p-2.5 rounded-xl bg-[#FAF8F5] border border-tapsh-charcoal/10 text-xs">
                    <span className="font-bold text-tapsh-black block truncate">{l.title}</span>
                    <span className="text-[10px] text-tapsh-soft-green uppercase font-bold">{l.category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-tapsh-charcoal/30">
            <p className="text-xs font-bold text-tapsh-charcoal mb-3">No active Hub configuration associated with this client.</p>
            <Link 
              href="/admin/hubs/setup"
              className="px-5 py-2.5 bg-tapsh-soft-green text-white text-xs font-bold rounded-xl shadow-xs inline-block"
            >
              + Create Hub Now
            </Link>
          </div>
        )}
      </div>

      {/* Associated Invoices */}
      <div className="bg-white rounded-3xl border border-tapsh-charcoal/15 shadow-xs p-5 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-600" />
            <h2 className="text-base sm:text-lg font-bold text-tapsh-black">
              Client Invoices ({customerInvoices.length})
            </h2>
          </div>
        </div>

        {customerInvoices.length === 0 ? (
          <p className="text-xs text-tapsh-charcoal py-4 text-center">No invoices recorded for this client.</p>
        ) : (
          <div className="space-y-3">
            {customerInvoices.map((inv) => (
              <div 
                key={inv.id}
                className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-tapsh-black font-mono">{inv.invoiceNumber}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                      inv.status === "PAID" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      inv.status === "PARTIAL" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                  <p className="text-xs text-tapsh-charcoal mt-1">
                    Date: {new Date(inv.date).toLocaleDateString()} • Total: <strong className="text-tapsh-black">₹{inv.total.toLocaleString()}</strong>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-tapsh-charcoal/10">
                  <span className="text-xs font-bold text-red-600 sm:hidden">
                    Due: ₹{(inv.total - inv.amountPaid).toLocaleString()}
                  </span>
                  <Link 
                    href={`/admin/invoices/${inv.id}`}
                    className="py-1.5 px-3 bg-white border border-tapsh-charcoal/20 rounded-xl text-xs font-bold text-tapsh-black hover:border-tapsh-soft-green transition-all"
                  >
                    View Breakdown
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Log for this client */}
      {customerLogs.length > 0 && (
        <div className="bg-white rounded-3xl border border-tapsh-charcoal/15 shadow-xs p-5 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-tapsh-charcoal" />
            <h2 className="text-base sm:text-lg font-bold text-tapsh-black">
              Account Activity History
            </h2>
          </div>
          <div className="space-y-2.5">
            {customerLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-[#FAF8F5] border border-tapsh-charcoal/10 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-tapsh-black">Updated {log.field}</span>
                  <span className="text-[10px] text-tapsh-charcoal">{new Date(log.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-tapsh-charcoal">
                  Value: <span className="text-tapsh-soft-green font-bold">{log.newValue}</span> (by {log.changedBy})
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
