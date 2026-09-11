"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, LayoutGrid, Receipt, IndianRupee, ArrowUpRight, 
  ExternalLink, Sparkles, ChevronRight,
  TrendingUp, Plus, Settings
} from "lucide-react";
import { 
  Customer, Hub, Invoice 
} from "@/lib/data";
import { 
  subscribeCustomers, subscribeHubs, subscribeInvoices 
} from "@/lib/firestoreService";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    // Quick auth check
    if (!document.cookie.includes("tapsh_admin_session")) {
      router.push("/admin/login");
      return;
    }

    const unsubCustomers = subscribeCustomers((data) => {
      setCustomers(data);
      setLoading(false);
    });

    const unsubHubs = subscribeHubs((data) => {
      setHubs(data);
    });

    const unsubInvoices = subscribeInvoices((data) => {
      setInvoices(data);
    });

    return () => {
      unsubCustomers();
      unsubHubs();
      unsubInvoices();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-tapsh-soft-green border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold uppercase tracking-wider text-tapsh-charcoal">Syncing Live Firestore Data...</p>
        </div>
      </div>
    );
  }

  const activeHubsCount = hubs.filter(h => h.status === "ACTIVE").length;
  const pendingInvoices = invoices.filter(i => i.status === "PENDING" || i.status === "PARTIAL");
  const pendingAmount = pendingInvoices.reduce((acc, inv) => acc + (inv.total - inv.amountPaid), 0);
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.amountPaid, 0);

  const statCards = [
    {
      label: "Active Hubs",
      value: activeHubsCount.toString(),
      sub: `${customers.length} Verified Businesses`,
      icon: LayoutGrid,
      color: "text-tapsh-soft-green",
      bg: "bg-tapsh-soft-green/10"
    },
    {
      label: "Total Revenue",
      value: `₹${(totalRevenue / 1000).toFixed(1)}k`,
      sub: "Collected Payments",
      icon: IndianRupee,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      label: "Pending Invoices",
      value: pendingInvoices.length.toString(),
      sub: `₹${pendingAmount.toLocaleString()} to collect`,
      icon: Receipt,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      label: "Client Fleet",
      value: customers.length.toString(),
      sub: "Enterprise accounts",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50"
    }
  ];

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6">
      
      {/* Top Banner Card: Deploy & Setup */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-tapsh-black via-neutral-900 to-tapsh-black text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl min-w-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-tapsh-pale-blue border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-tapsh-soft-green" /> Tapsh NFC Suite 2.0
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white truncate">
              Fleet Overview & Hub Control
            </h1>
            <p className="text-tapsh-gray text-xs sm:text-sm leading-relaxed">
              Program NFC hardware tags, deploy branded smart client portals, and generate official commercial invoices.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link 
              href="/admin/hubs/setup" 
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-tapsh-soft-green text-white text-xs sm:text-sm font-bold shadow-md hover:bg-tapsh-soft-green/90 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Set Up New Hub
            </Link>
            <Link 
              href="/admin/customers" 
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 text-xs sm:text-sm font-bold transition-all border border-white/10 active:scale-95 cursor-pointer"
            >
              <Users className="w-4 h-4" /> Manage Clients
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((c, i) => (
          <div 
            key={i} 
            className="bg-white p-4 sm:p-5 rounded-3xl border border-tapsh-charcoal/15 shadow-xs flex flex-col justify-between min-w-0"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-tapsh-charcoal truncate">
                {c.label}
              </span>
              <div className={`p-2 rounded-2xl ${c.bg} shrink-0`}>
                <c.icon className={`w-4 h-4 ${c.color}`} />
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-tapsh-black tracking-tight truncate">
                {c.value}
              </p>
              <p className="text-[10px] sm:text-xs text-tapsh-charcoal font-medium mt-1 truncate">
                {c.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Launch Control Strip */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-tapsh-charcoal/15 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link 
            href="/admin/hubs/setup"
            className="p-3.5 rounded-2xl bg-tapsh-pale-blue/30 border border-tapsh-charcoal/15 hover:border-tapsh-soft-green hover:bg-tapsh-pale-blue/50 flex flex-col items-center justify-center text-center transition-all active:scale-95 group min-w-0"
          >
            <Sparkles className="w-5 h-5 text-tapsh-soft-green mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-tapsh-black truncate">New Hub</span>
          </Link>
          <Link 
            href="/admin/customers"
            className="p-3.5 rounded-2xl bg-tapsh-pale-blue/30 border border-tapsh-charcoal/15 hover:border-tapsh-soft-green hover:bg-tapsh-pale-blue/50 flex flex-col items-center justify-center text-center transition-all active:scale-95 group min-w-0"
          >
            <Users className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-tapsh-black truncate">Clients</span>
          </Link>
          <Link 
            href="/admin/invoices"
            className="p-3.5 rounded-2xl bg-tapsh-pale-blue/30 border border-tapsh-charcoal/15 hover:border-tapsh-soft-green hover:bg-tapsh-pale-blue/50 flex flex-col items-center justify-center text-center transition-all active:scale-95 group min-w-0"
          >
            <Receipt className="w-5 h-5 text-amber-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-tapsh-black truncate">Invoices</span>
          </Link>
          <Link 
            href="/admin/settings"
            className="p-3.5 rounded-2xl bg-tapsh-pale-blue/30 border border-tapsh-charcoal/15 hover:border-tapsh-soft-green hover:bg-tapsh-pale-blue/50 flex flex-col items-center justify-center text-center transition-all active:scale-95 group min-w-0"
          >
            <Settings className="w-5 h-5 text-tapsh-charcoal mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-tapsh-black truncate">Settings</span>
          </Link>
        </div>
      </div>

      {/* Main Two Columns: Live Hubs & Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Column 1: Active Client Hubs List */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-tapsh-charcoal/15 shadow-xs min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div className="min-w-0">
              <h2 className="text-base font-bold text-tapsh-black truncate">Live Client Hubs</h2>
              <p className="text-xs text-tapsh-charcoal truncate">Real deployed destinations</p>
            </div>
            <Link 
              href="/admin/customers" 
              className="text-xs font-bold text-tapsh-soft-green hover:underline inline-flex items-center gap-1 shrink-0 ml-2"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {hubs.length === 0 ? (
              <p className="text-xs text-tapsh-charcoal py-4 text-center">No active hubs deployed in Firestore.</p>
            ) : (
              hubs.slice(0, 4).map((hub) => (
                <div 
                  key={hub.id} 
                  className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/10 flex items-center justify-between hover:border-tapsh-soft-green/40 transition-colors min-w-0"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-tapsh-soft-green shrink-0"></span>
                      <h3 className="text-xs sm:text-sm font-bold text-tapsh-black truncate">
                        {hub.businessName}
                      </h3>
                    </div>
                    <p className="text-[11px] text-tapsh-charcoal mt-0.5 truncate font-mono">
                      tapsh.in/h/<span className="font-semibold text-tapsh-black">{hub.slug}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a 
                      href={`/h/${hub.slug}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white border border-tapsh-charcoal/20 text-tapsh-black hover:text-tapsh-soft-green text-xs font-bold shadow-2xs active:scale-95 transition-all flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Open</span>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Recent Invoices Quick-Check */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-tapsh-charcoal/15 shadow-xs min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div className="min-w-0">
              <h2 className="text-base font-bold text-tapsh-black truncate">Recent Invoices</h2>
              <p className="text-xs text-tapsh-charcoal truncate">Billing & payment collection</p>
            </div>
            <Link 
              href="/admin/invoices" 
              className="text-xs font-bold text-tapsh-soft-green hover:underline inline-flex items-center gap-1 shrink-0 ml-2"
            >
              All Invoices <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {invoices.length === 0 ? (
              <div className="p-6 text-center text-xs text-tapsh-charcoal bg-[#FAF8F5] rounded-2xl border border-tapsh-charcoal/10">
                No invoices created yet. Go to Invoices to issue one.
              </div>
            ) : (
              invoices.slice(0, 4).map((inv) => {
                const customer = customers.find((c: Customer) => c.id === inv.customerId);
                const clientName = inv.customerDetails?.businessName || customer?.businessName || inv.customerName || "Enterprise Account";
                return (
                  <div 
                    key={inv.id}
                    className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/10 flex items-center justify-between gap-3 min-w-0 hover:border-tapsh-soft-green/40 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-tapsh-black font-mono truncate">
                          {inv.invoiceNumber}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border shrink-0 ${
                          inv.status === "PAID" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          inv.status === "PARTIAL" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-xs text-tapsh-charcoal mt-1 truncate">
                        {clientName} • ₹{inv.total.toLocaleString()}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <Link 
                        href={`/admin/invoices/${inv.id}`}
                        className="py-1.5 px-3 rounded-xl bg-white border border-tapsh-charcoal/20 text-xs font-bold text-tapsh-black hover:border-tapsh-soft-green hover:text-tapsh-soft-green transition-all shadow-2xs"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
