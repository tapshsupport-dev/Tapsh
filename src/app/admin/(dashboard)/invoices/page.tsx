import Link from "next/link";
import { mockInvoices, mockCustomers } from "@/lib/data";

export default function InvoicesPage() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-tapsh-black">Invoices</h1>
        <button className="w-full sm:w-auto px-6 py-3 bg-tapsh-soft-green text-tapsh-pale-blue rounded-xl font-bold hover:brightness-110 transition-colors text-sm shadow-md">
          + Create Invoice
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-md border border-tapsh-charcoal/20 overflow-hidden">
        <div className="p-6 border-b border-tapsh-charcoal/20 bg-tapsh-pale-blue flex flex-col sm:flex-row gap-4 items-center">
          <input 
            type="text" 
            placeholder="Search invoice number..." 
            className="w-full flex-1 px-4 py-3 rounded-xl border border-tapsh-charcoal/40 bg-white text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green focus:border-transparent text-sm shadow-sm"
          />
          <button className="w-full sm:w-auto px-6 py-3 text-tapsh-black border-2 border-tapsh-charcoal/40 rounded-xl text-sm font-bold hover:bg-white bg-transparent transition-colors">
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-tapsh-pale-blue text-tapsh-charcoal font-bold border-b border-tapsh-charcoal/20 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-8 py-5">Invoice #</th>
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Total</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tapsh-charcoal/10">
              {mockInvoices.map((inv) => {
                const customer = mockCustomers.find(c => c.id === inv.customerId);
                return (
                  <tr key={inv.id} className="hover:bg-tapsh-pale-blue/50 transition-colors">
                    <td className="px-8 py-5 font-bold text-tapsh-black">{inv.invoiceNumber}</td>
                    <td className="px-8 py-5 text-tapsh-black font-medium">{customer?.businessName || inv.customerId}</td>
                    <td className="px-8 py-5 text-tapsh-charcoal font-medium">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="px-8 py-5 font-bold text-tapsh-black">₹{inv.total.toLocaleString()}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-full border shadow-sm ${
                        inv.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' : 
                        inv.status === 'PARTIAL' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link 
                        href={`/admin/invoices/${inv.id}`}
                        className="text-tapsh-soft-green font-bold hover:underline"
                      >
                        View
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
