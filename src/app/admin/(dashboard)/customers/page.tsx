import Link from "next/link";
import { mockCustomers } from "@/lib/data";

export default function CustomersPage() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-tapsh-black">Customers</h1>
        <Link href="/admin/hubs/setup" className="w-full sm:w-auto px-6 py-3 bg-tapsh-soft-green text-white rounded-xl font-bold hover:brightness-110 transition-colors text-sm shadow-md text-center inline-block">
          + Add Customer
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-md border border-tapsh-charcoal/20 overflow-hidden">
        <div className="p-6 border-b border-tapsh-charcoal/20 bg-tapsh-bg-cool flex flex-col sm:flex-row gap-4 items-center">
          <input 
            type="text" 
            placeholder="Search customers..." 
            className="w-full flex-1 px-4 py-3 rounded-xl border border-tapsh-charcoal/40 bg-white text-tapsh-black focus:outline-none focus:ring-2 focus:ring-tapsh-soft-green focus:border-transparent text-sm shadow-sm"
          />
          <button className="w-full sm:w-auto px-6 py-3 text-tapsh-black border-2 border-tapsh-charcoal/40 rounded-xl text-sm font-bold hover:bg-white bg-transparent transition-colors">
            Filter
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-tapsh-bg-cool text-tapsh-charcoal font-bold border-b border-tapsh-charcoal/20 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-8 py-5">Business Name</th>
                <th className="px-8 py-5">Type</th>
                <th className="px-8 py-5">Contact Person</th>
                <th className="px-8 py-5">Email</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tapsh-charcoal/10">
              {mockCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-tapsh-bg-cool transition-colors">
                  <td className="px-8 py-5 font-bold text-tapsh-black">{customer.businessName}</td>
                  <td className="px-8 py-5 text-tapsh-charcoal font-medium">{customer.businessType}</td>
                  <td className="px-8 py-5 text-tapsh-black font-medium">{customer.contactPerson}</td>
                  <td className="px-8 py-5 text-tapsh-charcoal">{customer.email}</td>
                  <td className="px-8 py-5 text-right">
                    <Link 
                      href={`/admin/customers/${customer.id}`}
                      className="text-tapsh-soft-green font-bold hover:underline"
                    >
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
