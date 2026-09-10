import Link from "next/link";
import { mockCustomers, mockHubs, mockAuditLogs } from "@/lib/data";

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = mockCustomers.find(c => c.id === id);
  const hub = mockHubs.find(h => h.customerId === id);

  if (!customer) {
    return <div className="text-tapsh-black">Customer not found.</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/customers" className="text-tapsh-charcoal hover:text-tapsh-black font-bold text-sm">
          &larr; Back to Customers
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-tapsh-charcoal/20 shadow-md">
            <div className="w-20 h-20 bg-tapsh-pale-blue rounded-2xl flex items-center justify-center text-3xl font-bold text-tapsh-black mb-6 border border-tapsh-charcoal/30 shadow-inner">
              {customer.businessName.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold text-tapsh-black mb-1">{customer.businessName}</h2>
            <p className="text-tapsh-charcoal font-bold mb-8">{customer.businessType}</p>

            <div className="space-y-6">
              <div>
                <p className="text-xs text-tapsh-charcoal font-bold uppercase tracking-wider mb-1">Contact Person</p>
                <p className="font-bold text-tapsh-black">{customer.contactPerson}</p>
              </div>
              <div>
                <p className="text-xs text-tapsh-charcoal font-bold uppercase tracking-wider mb-1">Phone</p>
                <p className="font-bold text-tapsh-black">{customer.phone}</p>
              </div>
              <div>
                <p className="text-xs text-tapsh-charcoal font-bold uppercase tracking-wider mb-1">Email</p>
                <p className="font-bold text-tapsh-black">{customer.email}</p>
              </div>
              <div>
                <p className="text-xs text-tapsh-charcoal font-bold uppercase tracking-wider mb-1">Address</p>
                <p className="font-medium text-tapsh-black text-sm leading-relaxed">{customer.address}</p>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-tapsh-charcoal/20">
              <button className="w-full py-3 bg-tapsh-pale-blue border-2 border-tapsh-charcoal/30 text-tapsh-black rounded-xl font-bold hover:bg-white hover:border-tapsh-soft-green hover:shadow-sm transition-all">
                Edit Details
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Hubs & Activity */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Hub Status Card */}
          <div className="bg-white p-8 rounded-3xl border border-tapsh-charcoal/20 shadow-md">
            <div className="flex justify-between items-start mb-8">
              <h3 className="text-2xl font-bold text-tapsh-black">TAPSH Hub</h3>
              {hub ? (
                <span className={`px-4 py-1.5 text-xs font-bold rounded-full border shadow-sm ${hub.status === 'ACTIVE' ? 'bg-tapsh-pale-blue text-tapsh-black border-tapsh-soft-green' : 'bg-red-50 text-red-600 border-red-200'}`}>
                  {hub.status}
                </span>
              ) : (
                <span className="px-4 py-1.5 text-xs font-bold rounded-full bg-tapsh-pale-blue border border-tapsh-charcoal text-tapsh-charcoal">
                  NO HUB
                </span>
              )}
            </div>

            {hub ? (
              <div>
                <p className="text-sm font-bold text-tapsh-charcoal mb-2 uppercase tracking-wider">Permanent URL</p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
                  <code className="px-4 py-3 bg-tapsh-pale-blue border border-tapsh-charcoal/30 rounded-xl text-tapsh-black font-bold text-sm flex-1 shadow-inner truncate">
                    tapsh.in/h/{hub.slug}
                  </code>
                  <a href={`/h/${hub.slug}`} target="_blank" className="px-6 py-3 bg-tapsh-soft-green text-tapsh-pale-blue rounded-xl font-bold text-sm hover:brightness-110 shadow-md text-center">
                    Open Hub
                  </a>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/admin/hubs/setup" className="w-full sm:flex-1 py-3 bg-tapsh-pale-blue border-2 border-tapsh-charcoal/30 text-tapsh-black text-center rounded-xl font-bold hover:bg-white hover:border-tapsh-soft-green transition-all">
                    Edit Hub Settings
                  </Link>
                  <button className="w-full sm:flex-1 py-3 bg-tapsh-pale-blue border-2 border-tapsh-charcoal/30 text-tapsh-black text-center rounded-xl font-bold hover:bg-white hover:border-tapsh-soft-green transition-all">
                    Generate QR
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-tapsh-pale-blue border-2 border-tapsh-charcoal/30 border-dashed rounded-2xl">
                <p className="text-tapsh-black font-bold mb-6">This customer does not have a TAPSH Hub yet.</p>
                <Link href="/admin/hubs/setup" className="px-8 py-3 bg-tapsh-soft-green text-tapsh-pale-blue rounded-xl font-bold hover:brightness-110 inline-block shadow-md">
                  Create Hub
                </Link>
              </div>
            )}
          </div>

          {/* Activity / Orders / History Tabs */}
          <div className="bg-white rounded-3xl border border-tapsh-charcoal/20 shadow-md overflow-hidden">
            <div className="flex flex-col sm:flex-row border-b border-tapsh-charcoal/20 bg-tapsh-pale-blue">
              <button className="w-full sm:w-auto px-8 py-5 text-sm font-bold text-tapsh-black border-b-2 sm:border-b-2 border-tapsh-soft-green bg-white">
                Audit History
              </button>
              <button className="w-full sm:w-auto px-8 py-5 text-sm font-bold text-tapsh-charcoal hover:text-tapsh-black transition-colors border-b-2 sm:border-b-0 border-transparent">
                Invoices
              </button>
            </div>
            
            {/* Tab Content (History Example) */}
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-tapsh-black text-xl">Recent Activity</h3>
              </div>
              
              <div className="space-y-4">
                {mockAuditLogs.map((log) => (
                  <div key={log.id} className="flex gap-4 p-5 border border-tapsh-charcoal/20 rounded-2xl bg-tapsh-pale-blue shadow-sm">
                    <div className="mt-1">
                      <div className="w-10 h-10 rounded-full bg-white border border-tapsh-charcoal/30 flex items-center justify-center text-sm font-bold text-tapsh-black shadow-sm">
                        {log.changedBy.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-tapsh-black">
                        {log.changedBy} updated <span className="text-tapsh-soft-green">{log.field}</span>
                      </p>
                      <div className="mt-3 text-sm bg-white p-4 rounded-xl border border-tapsh-charcoal/20 shadow-inner">
                        <span className="text-tapsh-charcoal line-through mr-4">{log.oldValue}</span>
                        <span className="text-tapsh-soft-green font-bold">{log.newValue}</span>
                      </div>
                      <p className="text-xs text-tapsh-charcoal font-bold mt-4 tracking-wide">
                        {new Date(log.timestamp).toLocaleString()} • {log.entityType} ({log.entityId})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
