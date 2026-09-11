"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, LayoutGrid, Receipt, IndianRupee, ArrowUpRight, 
  ExternalLink, Sparkles, Clock, CheckCircle2, ChevronRight,
  TrendingUp, Plus
} from "lucide-react";
import { 
  mockAuditLogs, 
  Customer, Hub, AuditLog, Invoice 
} from "@/lib/data";
import { 
  subscribeCustomers, subscribeHubs, subscribeAuditLogs, subscribeInvoices 
} from "@/lib/firestoreService";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

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

    const unsubLogs = subscribeAuditLogs((data) => {
      setAuditLogs(data);
    });

    return () => {
      unsubCustomers();
      unsubHubs();
      unsubInvoices();
      unsubLogs();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
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

  const displayLogs = auditLogs.length > 0 ? auditLogs : mockAuditLogs;

  const statCards = [
    {
      label: "Active Hubs",
      value: activeHubsCount.toString(),
      subtext: `${customers.length} Verified Businesses`,
      icon: LayoutGrid,
      color: "text-tapsh-soft-green",
      bgColor: "bg-tapsh-soft-green/10"
    },
    {
      label: "Total Revenue",
      value: `₹${(totalRevenue / 1000).toFixed(1)}k`,
      subtext: "Collected Payments",
      icon: IndianRupee,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      label: "Pending Invoices",
      value: pendingInvoices.length.toString(),
      subtext: `₹${pendingAmount.toLocaleString()} to collect`,
      icon: Receipt,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      label: "Client Fleet",
      value: customers.length.toString(),
      subtext: "Enterprise accounts",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    }
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner on Mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tapsh-soft-green/10 border border-tapsh-soft-green/30 text-[11px] font-bold text-tapsh-soft-green mb-2">
            <Sparkles className="w-3 h-3" /> All Systems Operational
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-tapsh-black">
            Fleet Overview
          </h1>
          <p className="text-xs sm:text-sm text-tapsh-charcoal mt-1">
            Real-time management of active client touchpoints and billing.
          </p>
        </div>

        {/* Quick Launch Mobile Action */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/hubs/setup"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-tapsh-black text-tapsh-beige rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:bg-tapsh-taupe active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Set Up New Hub
          </Link>
        </div>
      </div>

      {/* 2x2 Metric Cards Grid (Optimized for Mobile Screens) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {statCards.map((card, i) => (
          <div 
            key={i} 
            className="bg-white p-4 sm:p-6 rounded-3xl border border-tapsh-charcoal/15 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-tapsh-charcoal leading-tight">
                {card.label}
              </span>
              <div className={`p-2 rounded-xl ${card.bgColor} ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-tapsh-black">
                {card.value}
              </div>
              <p className="text-[11px] font-medium text-tapsh-charcoal mt-1 truncate">
                {card.subtext}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Shortcuts (Mobile optimized buttons) */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-tapsh-charcoal/15 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-tapsh-charcoal mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Link 
            href="/admin/hubs/setup"
            className="p-3.5 rounded-2xl bg-tapsh-pale-blue/30 border border-tapsh-charcoal/15 hover:border-tapsh-soft-green hover:bg-tapsh-pale-blue/50 flex flex-col items-center justify-center text-center transition-all active:scale-95 group"
          >
            <Sparkles className="w-5 h-5 text-tapsh-soft-green mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-tapsh-black">New Hub</span>
          </Link>
          <Link 
            href="/admin/customers"
            className="p-3.5 rounded-2xl bg-tapsh-pale-blue/30 border border-tapsh-charcoal/15 hover:border-tapsh-soft-green hover:bg-tapsh-pale-blue/50 flex flex-col items-center justify-center text-center transition-all active:scale-95 group"
          >
            <Users className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-tapsh-black">Clients</span>
          </Link>
          <Link 
            href="/admin/invoices"
            className="p-3.5 rounded-2xl bg-tapsh-pale-blue/30 border border-tapsh-charcoal/15 hover:border-tapsh-soft-green hover:bg-tapsh-pale-blue/50 flex flex-col items-center justify-center text-center transition-all active:scale-95 group"
          >
            <Receipt className="w-5 h-5 text-amber-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-tapsh-black">Invoices</span>
          </Link>
          <Link 
            href="/admin/history"
            className="p-3.5 rounded-2xl bg-tapsh-pale-blue/30 border border-tapsh-charcoal/15 hover:border-tapsh-soft-green hover:bg-tapsh-pale-blue/50 flex flex-col items-center justify-center text-center transition-all active:scale-95 group"
          >
            <Clock className="w-5 h-5 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-tapsh-black">History</span>
          </Link>
        </div>
      </div>

      {/* Main Two Columns (Active Hubs & Live Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Client Hubs List */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-tapsh-charcoal/15 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-tapsh-black">Live Client Hubs</h2>
              <p className="text-xs text-tapsh-charcoal">Real deployed destinations</p>
            </div>
            <Link 
              href="/admin/customers" 
              className="text-xs font-bold text-tapsh-soft-green hover:underline inline-flex items-center gap-1"
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
                  className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/10 flex items-center justify-between hover:border-tapsh-soft-green/40 transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-tapsh-soft-green"></span>
                      <h3 className="text-xs sm:text-sm font-bold text-tapsh-black truncate">
                        {hub.businessName}
                      </h3>
                    </div>
                    <p className="text-[11px] text-tapsh-charcoal mt-0.5 truncate">
                      tapsh.in/h/<span className="font-semibold text-tapsh-black">{hub.slug}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a 
                      href={`/h/${hub.slug}`} 
                      target="_blank" 
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

        {/* Live Audit Log Feed */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-tapsh-charcoal/15 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-tapsh-black">Audit History</h2>
              <p className="text-xs text-tapsh-charcoal">Real admin changes & records</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-tapsh-soft-green/10 text-tapsh-soft-green text-[10px] font-bold">
              Automated Log
            </span>
          </div>

          <div className="space-y-3">
            {displayLogs.slice(0, 4).map((log) => (
              <div 
                key={log.id} 
                className="flex items-start gap-3 p-3 rounded-2xl border border-tapsh-charcoal/10 bg-[#FAF8F5]"
              >
                <div className="w-7 h-7 rounded-xl bg-tapsh-pale-blue flex items-center justify-center text-xs font-bold text-tapsh-black shrink-0 mt-0.5 border border-tapsh-charcoal/10">
                  <Clock className="w-3.5 h-3.5 text-tapsh-charcoal" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-tapsh-black truncate">
                      {log.entityType} Update
                    </p>
                    <span className="text-[10px] text-tapsh-charcoal shrink-0 font-medium">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-tapsh-charcoal mt-0.5">
                    Field <span className="font-mono text-[11px] font-bold text-tapsh-black">{log.field}</span> changed to <span className="text-tapsh-soft-green font-bold">{log.newValue}</span>
                  </p>
                  <p className="text-[10px] text-tapsh-charcoal/80 mt-1">
                    By {log.changedBy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Invoices Quick-Check (Mobile friendly card list) */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-tapsh-charcoal/15 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-tapsh-black">Recent Invoices</h2>
            <p className="text-xs text-tapsh-charcoal">Billing & payment collection</p>
          </div>
          <Link 
            href="/admin/invoices" 
            className="text-xs font-bold text-tapsh-soft-green hover:underline inline-flex items-center gap-1"
          >
            All Invoices <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {invoices.length === 0 ? (
            <div className="p-6 text-center text-xs text-tapsh-charcoal bg-[#FAF8F5] rounded-2xl border border-tapsh-charcoal/10">
              No invoices created yet. Go to Billing to issue an invoice.
            </div>
          ) : (
            invoices.slice(0, 3).map((inv) => {
              const customer = customers.find((c: Customer) => c.id === inv.customerId);
              const clientName = inv.customerDetails?.businessName || customer?.businessName || inv.customerName || "Enterprise Account";
              return (
                <div 
                  key={inv.id}
                  className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-tapsh-black font-mono">
                        {inv.invoiceNumber}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
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

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-tapsh-charcoal/10">
                    <span className="text-xs font-bold text-tapsh-black sm:hidden">
                      Balance: ₹{(inv.total - inv.amountPaid).toLocaleString()}
                    </span>
                    <Link 
                      href={`/admin/invoices/${inv.id}`}
                      className="py-1.5 px-3 rounded-xl bg-white border border-tapsh-charcoal/20 text-xs font-bold text-tapsh-black hover:border-tapsh-soft-green transition-all"
                    >
                      View Invoice
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
