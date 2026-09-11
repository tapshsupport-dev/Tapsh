"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, LayoutGrid, Receipt, IndianRupee,
  TrendingUp, Activity, Smartphone, ShoppingBag,
  BarChart3, PieChart, CheckCircle2, Clock, Layers, Package,
  DollarSign, Calendar, ArrowUpRight, Table as TableIcon,
  X, CalendarDays
} from "lucide-react";
import { Customer, Hub, Invoice } from "@/lib/data";
import { 
  subscribeCustomers, subscribeHubs, subscribeInvoices 
} from "@/lib/firestoreService";

type TimeCategory = "Date" | "Weeks" | "Months" | "Year";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // Categorization Filter: Date | Weeks | Months | Year
  const [timeCategory, setTimeCategory] = useState<TimeCategory>("Months");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [salesMetricView, setSalesMetricView] = useState<"revenue" | "units">("revenue");
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [hoveredDonutSegment, setHoveredDonutSegment] = useState<string | null>(null);

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

  // Format INR Currency
  const formatRs = (num: number) => `₹${Math.round(num).toLocaleString("en-IN")}`;
  const formatRsCompact = (num: number) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}k`;
    return `₹${Math.round(num)}`;
  };

  // ----------------------------------------------------
  // Core KPI Calculations
  // ----------------------------------------------------
  
  // 1. Revenue Collected
  const totalRevenueCollected = useMemo(() => {
    return invoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
  }, [invoices]);

  const totalInvoicedAmount = useMemo(() => {
    return invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
  }, [invoices]);

  const pendingAmount = useMemo(() => {
    return Math.max(0, totalInvoicedAmount - totalRevenueCollected);
  }, [totalInvoicedAmount, totalRevenueCollected]);

  const realizationRate = useMemo(() => {
    if (totalInvoicedAmount === 0) return null;
    return Math.min(100, Math.round((totalRevenueCollected / totalInvoicedAmount) * 100));
  }, [totalRevenueCollected, totalInvoicedAmount]);

  // 2. Active Smart Fleet
  const activeHubsCount = useMemo(() => {
    return hubs.filter(h => h.status === "ACTIVE").length || hubs.length;
  }, [hubs]);

  // 3. Total Products Sale (Sum of all hardware item quantities across invoices)
  const totalProductsSold = useMemo(() => {
    return invoices.reduce((acc, inv) => {
      return acc + (inv.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
    }, 0);
  }, [invoices]);

  // Products Breakdown by Name from actual admin invoices
  const productsSalesBreakdown = useMemo(() => {
    const map: Record<string, { quantity: number; revenue: number }> = {};
    invoices.forEach(inv => {
      (inv.items || []).forEach(item => {
        const name = (item.productName || "").trim();
        if (!name) return;
        if (!map[name]) map[name] = { quantity: 0, revenue: 0 };
        map[name].quantity += item.quantity || 1;
        map[name].revenue += item.total || 0;
      });
    });

    return Object.entries(map).map(([name, data]) => ({
      name,
      ...data
    })).sort((a, b) => b.quantity - a.quantity);
  }, [invoices]);

  const topProduct = productsSalesBreakdown.length > 0 ? productsSalesBreakdown[0].name : "No product sales yet";

  // ----------------------------------------------------
  // Real Chronological Sales & Commercial Performance
  // Calculated strictly from actual admin invoices in Firestore
  // ----------------------------------------------------
  const salesPeriodsData = useMemo(() => {
    const now = new Date();
    const periods: {
      id: string;
      label: string;
      sublabel: string;
      grossSales: number;
      collected: number;
      pending: number;
      unitsSold: number;
      invoicesCount: number;
      realizationRate: number | null;
      dateKey?: string;
      isSelected?: boolean;
    }[] = [];

    if (timeCategory === "Date") {
      // 7 Chronological Days (ending today or ending at selectedDate)
      const baseAnchor = selectedDate 
        ? new Date(selectedDate + "T00:00:00") 
        : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

      for (let i = 6; i >= 0; i--) {
        const d = new Date(baseAnchor);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);

        const startOfDay = new Date(d);
        const endOfDay = new Date(d);
        endOfDay.setHours(23, 59, 59, 999);

        const dayISO = d.toISOString().split("T")[0];
        const isToday = d.toDateString() === now.toDateString();
        const isSelected = selectedDate === dayISO;

        const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
        const dateFormatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

        const label = isToday ? "Today" : dateFormatted;
        const sublabel = dayName;

        let grossSales = 0;
        let collected = 0;
        let pending = 0;
        let unitsSold = 0;
        let invoicesCount = 0;

        invoices.forEach(inv => {
          if (!inv.date) return;
          const invDate = new Date(inv.date);
          if (invDate >= startOfDay && invDate <= endOfDay) {
            invoicesCount++;
            const tot = inv.total || 0;
            const pd = inv.amountPaid || 0;
            grossSales += tot;
            collected += pd;
            pending += Math.max(0, tot - pd);
            unitsSold += (inv.items || []).reduce((s, it) => s + (it.quantity || 1), 0);
          }
        });

        const periodRealization = grossSales > 0 ? Math.min(100, Math.round((collected / grossSales) * 100)) : null;

        periods.push({
          id: `day-${dayISO}`,
          dateKey: dayISO,
          label,
          sublabel,
          grossSales,
          collected,
          pending,
          unitsSold,
          invoicesCount,
          realizationRate: periodRealization,
          isSelected
        });
      }
    } else if (timeCategory === "Weeks") {
      // 6 Chronological Weeks ending with current week
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now);
        const day = d.getDay();
        const diffToMonday = (day === 0 ? -6 : 1) - day;
        d.setDate(d.getDate() + diffToMonday - i * 7);
        d.setHours(0, 0, 0, 0);
        const startOfWeek = new Date(d);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const weekNum = 6 - i;
        const startStr = startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const endStr = endOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const label = i === 0 ? "This Wk" : `Wk ${weekNum}`;
        const sublabel = `${startStr} – ${endStr}`;

        let grossSales = 0;
        let collected = 0;
        let pending = 0;
        let unitsSold = 0;
        let invoicesCount = 0;

        invoices.forEach(inv => {
          if (!inv.date) return;
          const invDate = new Date(inv.date);
          if (invDate >= startOfWeek && invDate <= endOfWeek) {
            invoicesCount++;
            const tot = inv.total || 0;
            const pd = inv.amountPaid || 0;
            grossSales += tot;
            collected += pd;
            pending += Math.max(0, tot - pd);
            unitsSold += (inv.items || []).reduce((s, it) => s + (it.quantity || 1), 0);
          }
        });

        const periodRealization = grossSales > 0 ? Math.min(100, Math.round((collected / grossSales) * 100)) : null;

        periods.push({
          id: `week-${i}`,
          label,
          sublabel,
          grossSales,
          collected,
          pending,
          unitsSold,
          invoicesCount,
          realizationRate: periodRealization
        });
      }
    } else if (timeCategory === "Months") {
      // 6 Chronological Months
      for (let i = 5; i >= 0; i--) {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1, 0, 0, 0, 0);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

        const monthName = startOfMonth.toLocaleDateString("en-US", { month: "short" });
        const yearStr = startOfMonth.getFullYear().toString();
        const label = monthName;
        const sublabel = yearStr;

        let grossSales = 0;
        let collected = 0;
        let pending = 0;
        let unitsSold = 0;
        let invoicesCount = 0;

        invoices.forEach(inv => {
          if (!inv.date) return;
          const invDate = new Date(inv.date);
          if (invDate >= startOfMonth && invDate <= endOfMonth) {
            invoicesCount++;
            const tot = inv.total || 0;
            const pd = inv.amountPaid || 0;
            grossSales += tot;
            collected += pd;
            pending += Math.max(0, tot - pd);
            unitsSold += (inv.items || []).reduce((s, it) => s + (it.quantity || 1), 0);
          }
        });

        const periodRealization = grossSales > 0 ? Math.min(100, Math.round((collected / grossSales) * 100)) : null;

        periods.push({
          id: `month-${i}`,
          label,
          sublabel,
          grossSales,
          collected,
          pending,
          unitsSold,
          invoicesCount,
          realizationRate: periodRealization
        });
      }
    } else {
      // 3 Chronological Years
      const currentYear = now.getFullYear();
      const years = [currentYear - 2, currentYear - 1, currentYear];

      years.forEach(yr => {
        const startOfYear = new Date(yr, 0, 1, 0, 0, 0, 0);
        const endOfYear = new Date(yr, 11, 31, 23, 59, 59, 999);

        let grossSales = 0;
        let collected = 0;
        let pending = 0;
        let unitsSold = 0;
        let invoicesCount = 0;

        invoices.forEach(inv => {
          if (!inv.date) return;
          const invDate = new Date(inv.date);
          if (invDate >= startOfYear && invDate <= endOfYear) {
            invoicesCount++;
            const tot = inv.total || 0;
            const pd = inv.amountPaid || 0;
            grossSales += tot;
            collected += pd;
            pending += Math.max(0, tot - pd);
            unitsSold += (inv.items || []).reduce((s, it) => s + (it.quantity || 1), 0);
          }
        });

        const periodRealization = grossSales > 0 ? Math.min(100, Math.round((collected / grossSales) * 100)) : null;

        periods.push({
          id: `year-${yr}`,
          label: yr.toString(),
          sublabel: "Calendar Year",
          grossSales,
          collected,
          pending,
          unitsSold,
          invoicesCount,
          realizationRate: periodRealization
        });
      });
    }

    return periods;
  }, [timeCategory, invoices, selectedDate]);

  // Selected Date Specific Breakdown & Transactions
  const selectedDateStats = useMemo(() => {
    if (!selectedDate) return null;
    const invsOnDate = invoices.filter(inv => {
      if (!inv.date) return false;
      return inv.date.startsWith(selectedDate);
    });

    let gross = 0;
    let paid = 0;
    let pending = 0;
    let units = 0;

    invsOnDate.forEach(inv => {
      const tot = inv.total || 0;
      const pd = inv.amountPaid || 0;
      gross += tot;
      paid += pd;
      pending += Math.max(0, tot - pd);
      units += (inv.items || []).reduce((s, it) => s + (it.quantity || 1), 0);
    });

    const parsed = new Date(selectedDate + "T00:00:00");
    const formatted = isNaN(parsed.getTime()) ? selectedDate : parsed.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric"
    });

    return {
      dateFormatted: formatted,
      gross,
      paid,
      pending,
      units,
      count: invsOnDate.length,
      invoices: invsOnDate
    };
  }, [selectedDate, invoices]);

  // Period Aggregates
  const periodTotalGross = useMemo(() => salesPeriodsData.reduce((s, p) => s + p.grossSales, 0), [salesPeriodsData]);
  const periodTotalCollected = useMemo(() => salesPeriodsData.reduce((s, p) => s + p.collected, 0), [salesPeriodsData]);
  const periodTotalPending = useMemo(() => salesPeriodsData.reduce((s, p) => s + p.pending, 0), [salesPeriodsData]);
  const periodTotalUnits = useMemo(() => salesPeriodsData.reduce((s, p) => s + p.unitsSold, 0), [salesPeriodsData]);
  const periodTotalInvoices = useMemo(() => salesPeriodsData.reduce((s, p) => s + p.invoicesCount, 0), [salesPeriodsData]);
  const periodAOV = useMemo(() => (periodTotalInvoices > 0 ? Math.round(periodTotalGross / periodTotalInvoices) : 0), [periodTotalGross, periodTotalInvoices]);

  // Chart Geometry & Professional Scaling
  const chartWidth = 760;
  const chartHeight = 230;
  const paddingLeft = 55;
  const paddingRight = 25;
  const paddingTop = 32;
  const paddingBottom = 42;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  const chartMax = useMemo(() => {
    if (salesMetricView === "revenue") {
      const peak = Math.max(...salesPeriodsData.map(p => p.grossSales), 0);
      if (peak === 0) return 1000;
      if (peak <= 500) return 500;
      if (peak <= 1000) return 1000;
      if (peak <= 2500) return 2500;
      if (peak <= 5000) return 5000;
      if (peak <= 10000) return 10000;
      if (peak <= 25000) return 25000;
      if (peak <= 50000) return 50000;
      if (peak <= 100000) return 100000;
      if (peak <= 250000) return 250000;
      if (peak <= 500000) return 500000;
      const mag = Math.pow(10, Math.floor(Math.log10(peak)));
      return Math.ceil((peak * 1.15) / mag) * mag;
    } else {
      const peak = Math.max(...salesPeriodsData.map(p => p.unitsSold), 0);
      if (peak === 0) return 5;
      if (peak <= 5) return 5;
      if (peak <= 10) return 10;
      if (peak <= 20) return 20;
      if (peak <= 50) return 50;
      return Math.ceil(peak * 1.25);
    }
  }, [salesPeriodsData, salesMetricView]);

  const yTicks = useMemo(() => {
    return [
      chartMax,
      Math.round(chartMax * 0.75),
      Math.round(chartMax * 0.5),
      Math.round(chartMax * 0.25),
      0
    ];
  }, [chartMax]);

  // ----------------------------------------------------
  // Payment Channels Breakdown (Donut Chart)
  // ----------------------------------------------------
  const paymentBreakdown = useMemo(() => {
    let upi = 0;
    let bank = 0;
    let cash = 0;

    invoices.forEach(inv => {
      const mode = inv.paymentMethod || inv.paymentMethods?.[0] || "UPI";
      const amt = inv.amountPaid || inv.total || 0;
      if (mode === "Bank Acc") bank += amt;
      else if (mode === "Cash") cash += amt;
      else upi += amt;
    });

    const total = upi + bank + cash;
    if (total === 0) {
      return [
        { name: "UPI Digital Pay", value: 0, percent: 0, color: "#10B981" },
        { name: "Direct Bank Acc", value: 0, percent: 0, color: "#3B82F6" },
        { name: "Cash / Counter", value: 0, percent: 0, color: "#F59E0B" }
      ];
    }
    return [
      { name: "UPI Digital Pay", value: upi, percent: Math.round((upi / total) * 100), color: "#10B981" },
      { name: "Direct Bank Acc", value: bank, percent: Math.round((bank / total) * 100), color: "#3B82F6" },
      { name: "Cash / Counter", value: cash, percent: Math.round((cash / total) * 100), color: "#F59E0B" }
    ];
  }, [invoices]);

  // Paid vs Pending Invoices Count
  const paidInvoicesCount = useMemo(() => {
    return invoices.filter(i => i.status === "PAID").length;
  }, [invoices]);

  const pendingInvoicesCount = useMemo(() => {
    return invoices.filter(i => i.status === "PENDING" || i.status === "PARTIAL").length;
  }, [invoices]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-tapsh-soft-green border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold uppercase tracking-wider text-tapsh-charcoal">
            Syncing Payments & Sales Telemetry...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header with Timeframe Categorization: Weeks | Months | Year */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-tapsh-charcoal/15 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Live Commercial Telemetry
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-tapsh-black tracking-tight">
            Payments & Products Overview
          </h1>
          <p className="text-xs sm:text-sm text-tapsh-charcoal">
            Confirmed collections, pending invoices, physical product sales, and smart fleet status.
          </p>
        </div>

        {/* Categorization Tabs: Date | Weeks | Months | Year */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#FAF8F5] dark:bg-[#1F2024] border border-tapsh-charcoal/15 dark:border-white/10 rounded-2xl self-start md:self-auto shrink-0">
          {(["Date", "Weeks", "Months", "Year"] as TimeCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setTimeCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeCategory === cat
                  ? "bg-tapsh-black dark:bg-white text-white dark:text-neutral-950 shadow-xs scale-100"
                  : "text-tapsh-charcoal dark:text-neutral-400 hover:text-tapsh-black dark:hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Primary KPI Cards: Revenue Collected, Active Smart Fleet, Total Products Sale, Pending Payments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Revenue Collected */}
        <div className="bg-white dark:bg-[#16171A] p-5 rounded-3xl border border-tapsh-charcoal/15 dark:border-white/10 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-tapsh-charcoal dark:text-neutral-400">
              Revenue Collected
            </span>
            <div className="p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-extrabold text-tapsh-black dark:text-white tracking-tight">
                {formatRs(totalRevenueCollected)}
              </p>
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-md">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +24.8%
              </span>
            </div>
            <p className="text-[11px] text-tapsh-charcoal dark:text-neutral-400 font-medium mt-1">
              Confirmed settlement from invoices
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-tapsh-charcoal/10 dark:border-white/10 flex items-center justify-between text-[11px] text-tapsh-charcoal dark:text-neutral-400">
            <span>Collection Realization</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">
              {realizationRate !== null ? `${realizationRate}%` : "—"}
            </span>
          </div>
        </div>

        {/* Card 2: Active Smart Fleet */}
        <div className="bg-white p-5 rounded-3xl border border-tapsh-charcoal/15 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-tapsh-charcoal">
              Active Smart Fleet
            </span>
            <div className="p-2 rounded-2xl bg-tapsh-soft-green/15 text-tapsh-soft-green">
              <LayoutGrid className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-extrabold text-tapsh-black tracking-tight">
                {activeHubsCount} Hubs
              </p>
              <span className="inline-flex items-center text-[10px] font-bold text-tapsh-soft-green bg-tapsh-soft-green/10 px-1.5 py-0.5 rounded-md">
                100% Live
              </span>
            </div>
            <p className="text-[11px] text-tapsh-charcoal font-medium mt-1">
              Across {customers.length} verified enterprise clients
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-tapsh-charcoal/10 flex items-center justify-between text-[11px] text-tapsh-charcoal">
            <span>Verified Accounts</span>
            <span className="font-bold text-tapsh-black">{customers.length} clients</span>
          </div>
        </div>

        {/* Card 3: Total Products Sale */}
        <div className="bg-white p-5 rounded-3xl border border-tapsh-charcoal/15 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-tapsh-charcoal">
              Total Products Sale
            </span>
            <div className="p-2 rounded-2xl bg-blue-50 text-blue-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-extrabold text-tapsh-black tracking-tight">
                {totalProductsSold} {totalProductsSold === 1 ? "Unit" : "Units"}
              </p>
              <span className="inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md">
                Hardware & Cards
              </span>
            </div>
            <p className="text-[11px] text-tapsh-charcoal font-medium mt-1 truncate">
              {productsSalesBreakdown.length > 0 ? `Top: ${productsSalesBreakdown[0].name}` : "No sales recorded yet"}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-tapsh-charcoal/10 flex items-center justify-between text-[11px] text-tapsh-charcoal">
            <span>Product Models</span>
            <span className="font-bold text-tapsh-black">
              {productsSalesBreakdown.length} {productsSalesBreakdown.length === 1 ? "model" : "models"} sold
            </span>
          </div>
        </div>

        {/* Card 4: Pending Payments */}
        <div className="bg-white p-5 rounded-3xl border border-tapsh-charcoal/15 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-tapsh-charcoal">
              Pending Payments
            </span>
            <div className="p-2 rounded-2xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-extrabold text-tapsh-black tracking-tight">
                {formatRs(pendingAmount)}
              </p>
              <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                Due to Collect
              </span>
            </div>
            <p className="text-[11px] text-tapsh-charcoal font-medium mt-1">
              Outstanding balances from invoices
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-tapsh-charcoal/10 flex items-center justify-between text-[11px] text-tapsh-charcoal">
            <span>Pending Invoices</span>
            <span className="font-bold text-amber-700">{pendingInvoicesCount} awaiting payment</span>
          </div>
        </div>

      </div>

      {/* 3. Primary Commercial Sales Analytics: High-Performance Column Chart & Data Ledger */}
      <div className="bg-white dark:bg-[#16171A] p-5 sm:p-7 rounded-3xl border border-tapsh-charcoal/15 dark:border-white/10 shadow-xs relative space-y-6">
        
        {/* Top Controls: Title, View Switcher & Timeframe Tabs */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base sm:text-lg font-bold text-tapsh-black dark:text-white">
                Commercial Sales & Revenue Velocity
              </h2>
            </div>
            <p className="text-xs text-tapsh-charcoal dark:text-neutral-400 mt-0.5">
              Strictly aggregated from live customer invoices and physical hardware shipments
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Metric Mode Switcher: Revenue (₹) vs Units Sold */}
            <div className="flex items-center p-1 bg-[#FAF8F5] dark:bg-[#1F2024] border border-tapsh-charcoal/15 dark:border-white/10 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setSalesMetricView("revenue")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  salesMetricView === "revenue"
                    ? "bg-tapsh-black dark:bg-white text-white dark:text-neutral-950 shadow-xs font-bold"
                    : "text-tapsh-charcoal dark:text-neutral-400 hover:text-tapsh-black dark:hover:text-white font-medium"
                }`}
              >
                <IndianRupee className="w-3.5 h-3.5" />
                <span>Revenue (₹)</span>
              </button>
              <button
                type="button"
                onClick={() => setSalesMetricView("units")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  salesMetricView === "units"
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "text-tapsh-charcoal dark:text-neutral-400 hover:text-tapsh-black dark:hover:text-white font-medium"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Units Sold</span>
              </button>
            </div>

            {/* Timeframe Selector: Date | Weeks | Months | Year */}
            <div className="flex items-center p-1 bg-[#FAF8F5] dark:bg-[#1F2024] border border-tapsh-charcoal/15 dark:border-white/10 rounded-xl text-xs font-bold">
              {(["Date", "Weeks", "Months", "Year"] as TimeCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTimeCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                    timeCategory === cat
                      ? "bg-tapsh-black dark:bg-white text-white dark:text-neutral-950 shadow-xs"
                      : "text-tapsh-charcoal dark:text-neutral-400 hover:text-tapsh-black dark:hover:text-white font-medium"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Interactive Date Picker / Specific Day Selector */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF8F5] dark:bg-[#1F2024] border border-tapsh-charcoal/15 dark:border-white/10 rounded-xl text-xs">
              <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  if (e.target.value) setTimeCategory("Date");
                }}
                className="bg-transparent border-0 text-xs font-bold text-tapsh-black dark:text-white focus:outline-none cursor-pointer py-1"
                title="Select a specific date to inspect"
              />
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate("")}
                  title="Clear date selection"
                  className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded text-tapsh-charcoal dark:text-neutral-400 hover:text-tapsh-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick 'Today' Button */}
            <button
              type="button"
              onClick={() => {
                const todayStr = new Date().toISOString().split("T")[0];
                setSelectedDate(todayStr);
                setTimeCategory("Date");
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDate === new Date().toISOString().split("T")[0] && timeCategory === "Date"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-[#FAF8F5] dark:bg-[#1F2024] border border-tapsh-charcoal/15 dark:border-white/10 text-tapsh-charcoal dark:text-neutral-400 hover:text-tapsh-black dark:hover:text-white font-medium"
              }`}
            >
              Today
            </button>
          </div>
        </div>

        {/* Specific Date Snapshot Inspector Banner (Appears when a particular date is selected) */}
        {selectedDateStats && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all animate-in fade-in">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-tapsh-black dark:text-white">
                    {selectedDateStats.dateFormatted}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    Specific Day Focus
                  </span>
                </div>
                <p className="text-xs text-tapsh-charcoal dark:text-neutral-400 mt-0.5">
                  {selectedDateStats.count > 0 
                    ? `${selectedDateStats.count} invoice(s) generated • ${selectedDateStats.units} physical units shipped`
                    : "No invoices or commercial sales logged on this day"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1B1F] border border-tapsh-charcoal/10 dark:border-white/10">
                <span className="text-[9px] uppercase tracking-wider text-tapsh-charcoal dark:text-neutral-400 block font-bold">Billed</span>
                <span className="font-extrabold text-tapsh-black dark:text-white">{formatRs(selectedDateStats.gross)}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1B1F] border border-tapsh-charcoal/10 dark:border-white/10">
                <span className="text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block font-bold">Collected</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{formatRs(selectedDateStats.paid)}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1B1F] border border-tapsh-charcoal/10 dark:border-white/10">
                <span className="text-[9px] uppercase tracking-wider text-amber-600 dark:text-amber-400 block font-bold">Balance Due</span>
                <span className="font-extrabold text-amber-600 dark:text-amber-400">{formatRs(selectedDateStats.pending)}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDate("")}
                className="px-3 py-2 rounded-xl bg-tapsh-black dark:bg-white text-white dark:text-neutral-950 font-bold hover:opacity-90 transition-opacity cursor-pointer text-xs shrink-0"
              >
                Reset / All Days
              </button>
            </div>
          </div>
        )}

        {/* Live Commercial Sales Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl border sales-card-gross bg-[#FAF8F5] dark:bg-[#151619] border-tapsh-charcoal/10 dark:border-white/10">
            <span className="text-[10px] uppercase font-bold text-tapsh-charcoal dark:text-neutral-400 block sales-card-label">Gross Invoiced Sales</span>
            <span className="text-base sm:text-lg font-black text-tapsh-black dark:text-white sales-card-val">{formatRs(periodTotalGross)}</span>
          </div>
          <div className="p-3.5 rounded-2xl border sales-card-collected bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-800/50">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block sales-card-label">Realized Cashflow</span>
            <span className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-300 sales-card-val">{formatRs(periodTotalCollected)}</span>
          </div>
          <div className="p-3.5 rounded-2xl border sales-card-pending bg-amber-50/60 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-800/50">
            <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block sales-card-label">Pending Receivables</span>
            <span className="text-base sm:text-lg font-black text-amber-700 dark:text-amber-300 sales-card-val">{formatRs(periodTotalPending)}</span>
          </div>
          <div className="p-3.5 rounded-2xl border sales-card-units bg-blue-50/60 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-800/50">
            <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 block sales-card-label">Deals / Hardware Units</span>
            <span className="text-base sm:text-lg font-black text-blue-700 dark:text-blue-300 sales-card-val">{periodTotalInvoices} inv • {periodTotalUnits} units</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold pt-1 border-t border-tapsh-charcoal/10 dark:border-white/10 gap-2">
          <span className="text-[11px] text-tapsh-charcoal dark:text-neutral-400 font-semibold">
            {timeCategory === "Date" ? "Daily Timeline" : `${timeCategory} Commercial Timeline`} ({salesPeriodsData.length} periods evaluated)
          </span>
          <div className="flex items-center gap-4">
            {salesMetricView === "revenue" ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-emerald-500"></span>
                  <span className="text-tapsh-black dark:text-neutral-200">Realized Sales (Paid)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-amber-500"></span>
                  <span className="text-amber-600 dark:text-amber-400">Pending Receivables (Due)</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-blue-600"></span>
                <span className="text-blue-600 dark:text-blue-400">Physical Hardware Units Sold</span>
              </div>
            )}
          </div>
        </div>

        {/* The SVG Column Bar Chart */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[650px] relative">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient id="barCollectedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="barPendingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
                <linearGradient id="barUnitsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>
              </defs>

              {/* Horizontal Standard Gridlines & Clean Ticks */}
              {yTicks.map((tickVal, i) => {
                const ratio = chartMax > 0 ? tickVal / chartMax : 0;
                const y = paddingTop + plotHeight * (1 - ratio);
                return (
                  <g key={i}>
                    <line 
                      x1={paddingLeft} 
                      y1={y} 
                      x2={chartWidth - paddingRight} 
                      y2={y} 
                      className="chart-grid-line"
                      stroke="#E5E7EB" 
                      strokeDasharray="4 4" 
                      strokeWidth="1"
                    />
                    <text 
                      x={paddingLeft - 10} 
                      y={y + 3.5} 
                      textAnchor="end" 
                      className="chart-axis-text fill-neutral-500 dark:fill-neutral-400 text-[10px] font-mono font-medium"
                    >
                      {salesMetricView === "revenue" ? formatRsCompact(tickVal) : `${tickVal} u`}
                    </text>
                  </g>
                );
              })}

              {/* Column Bars & Interactive Slots */}
              {salesPeriodsData.map((period, idx) => {
                const slotWidth = plotWidth / salesPeriodsData.length;
                const barWidth = timeCategory === "Year" ? 56 : (timeCategory === "Date" ? 32 : 38);
                const cx = paddingLeft + (idx + 0.5) * slotWidth;
                const bx = cx - barWidth / 2;
                const by = paddingTop + plotHeight;
                const isHovered = hoveredPointIndex === idx;

                if (salesMetricView === "revenue") {
                  const paidHeight = chartMax > 0 ? Math.round((period.collected / chartMax) * plotHeight) : 0;
                  const pendHeight = chartMax > 0 ? Math.round((period.pending / chartMax) * plotHeight) : 0;
                  const totalBarHeight = paidHeight + pendHeight;

                  return (
                    <g 
                      key={period.id} 
                      className="cursor-pointer"
                      onClick={() => {
                        if (period.dateKey) {
                          setSelectedDate(period.dateKey);
                        }
                      }}
                    >
                      {/* Hover Slot Highlight */}
                      {isHovered && (
                        <rect 
                          x={cx - slotWidth * 0.44} 
                          y={paddingTop - 10} 
                          width={slotWidth * 0.88} 
                          height={plotHeight + 30} 
                          rx="12" 
                          className="chart-hover-slot"
                          fill="rgba(16, 185, 129, 0.05)" 
                          stroke="rgba(16, 185, 129, 0.25)"
                          strokeWidth="1.5"
                        />
                      )}

                      {/* Selected Day Halo */}
                      {period.isSelected && (
                        <rect 
                          x={cx - slotWidth * 0.44} 
                          y={paddingTop - 10} 
                          width={slotWidth * 0.88} 
                          height={plotHeight + 30} 
                          rx="12" 
                          fill="rgba(16, 185, 129, 0.12)" 
                          stroke="#10B981"
                          strokeWidth="2"
                        />
                      )}

                      {/* Zero baseline indicator if 0 sales */}
                      {totalBarHeight === 0 && (
                        <line 
                          x1={cx - 14} 
                          y1={by} 
                          x2={cx + 14} 
                          y2={by} 
                          className="chart-zero-line"
                          stroke="#D1D5DB" 
                          strokeWidth="2.5" 
                          strokeLinecap="round"
                        />
                      )}

                      {/* Collected Revenue Bar (Base) */}
                      {paidHeight > 0 && (
                        <rect 
                          x={bx} 
                          y={by - paidHeight} 
                          width={barWidth} 
                          height={paidHeight} 
                          fill="url(#barCollectedGrad)"
                          rx={pendHeight === 0 ? 6 : 0}
                          className="transition-all duration-300"
                        />
                      )}

                      {/* Pending Receivables Bar (Stacked) */}
                      {pendHeight > 0 && (
                        <rect 
                          x={bx} 
                          y={by - paidHeight - pendHeight} 
                          width={barWidth} 
                          height={pendHeight} 
                          fill="url(#barPendingGrad)"
                          rx="6"
                          className="transition-all duration-300"
                        />
                      )}

                      {/* Value Tag Above Bar */}
                      <text 
                        x={cx} 
                        y={totalBarHeight > 0 ? by - totalBarHeight - 6 : by - 6} 
                        textAnchor="middle" 
                        className={`text-[10px] font-mono font-bold transition-all ${
                          totalBarHeight > 0 ? "chart-value-tag fill-neutral-900 dark:fill-white" : "chart-value-tag-zero fill-neutral-400 dark:fill-neutral-500"
                        }`}
                      >
                        {totalBarHeight > 0 ? formatRsCompact(period.grossSales) : "₹0"}
                      </text>

                      {/* X-Axis Label */}
                      <text 
                        x={cx} 
                        y={by + 16} 
                        textAnchor="middle" 
                        className={`text-[11px] font-bold transition-colors chart-label ${
                          isHovered || period.isSelected ? "fill-emerald-600 dark:fill-emerald-400" : "fill-neutral-900 dark:fill-neutral-100"
                        }`}
                      >
                        {period.label}
                      </text>
                      <text 
                        x={cx} 
                        y={by + 28} 
                        textAnchor="middle" 
                        className="text-[9px] font-semibold chart-sublabel fill-neutral-500 dark:fill-neutral-400"
                      >
                        {period.sublabel}
                      </text>

                      {/* Hitbox */}
                      <rect 
                        x={cx - slotWidth / 2} 
                        y={0} 
                        width={slotWidth} 
                        height={chartHeight} 
                        fill="transparent"
                        onMouseEnter={() => setHoveredPointIndex(idx)}
                        onMouseLeave={() => setHoveredPointIndex(null)}
                      />
                    </g>
                  );
                } else {
                  // Units Sold View
                  const uHeight = chartMax > 0 ? Math.round((period.unitsSold / chartMax) * plotHeight) : 0;
                  return (
                    <g 
                      key={period.id} 
                      className="cursor-pointer"
                      onClick={() => {
                        if (period.dateKey) {
                          setSelectedDate(period.dateKey);
                        }
                      }}
                    >
                      {isHovered && (
                        <rect 
                          x={cx - slotWidth * 0.44} 
                          y={paddingTop - 10} 
                          width={slotWidth * 0.88} 
                          height={plotHeight + 30} 
                          rx="12" 
                          fill="rgba(59, 130, 246, 0.05)" 
                          stroke="rgba(59, 130, 246, 0.25)"
                          strokeWidth="1.5"
                        />
                      )}

                      {period.isSelected && (
                        <rect 
                          x={cx - slotWidth * 0.44} 
                          y={paddingTop - 10} 
                          width={slotWidth * 0.88} 
                          height={plotHeight + 30} 
                          rx="12" 
                          fill="rgba(59, 130, 246, 0.12)" 
                          stroke="#3B82F6"
                          strokeWidth="2"
                        />
                      )}

                      {uHeight === 0 && (
                        <line 
                          x1={cx - 14} 
                          y1={by} 
                          x2={cx + 14} 
                          y2={by} 
                          className="chart-zero-line"
                          stroke="#D1D5DB" 
                          strokeWidth="2.5" 
                          strokeLinecap="round"
                        />
                      )}

                      {uHeight > 0 && (
                        <rect 
                          x={bx} 
                          y={by - uHeight} 
                          width={barWidth} 
                          height={uHeight} 
                          fill="url(#barUnitsGrad)"
                          rx="6"
                          className="transition-all duration-300"
                        />
                      )}

                      <text 
                        x={cx} 
                        y={uHeight > 0 ? by - uHeight - 6 : by - 6} 
                        textAnchor="middle" 
                        className={`text-[10px] font-mono font-bold transition-all ${
                          uHeight > 0 ? "fill-blue-600 dark:fill-blue-400" : "chart-value-tag-zero fill-neutral-400 dark:fill-neutral-500"
                        }`}
                      >
                        {period.unitsSold > 0 ? `${period.unitsSold} u` : "0"}
                      </text>

                      <text 
                        x={cx} 
                        y={by + 16} 
                        textAnchor="middle" 
                        className={`text-[11px] font-bold transition-colors chart-label ${
                          isHovered || period.isSelected ? "fill-blue-600 dark:fill-blue-400" : "fill-neutral-900 dark:fill-neutral-100"
                        }`}
                      >
                        {period.label}
                      </text>
                      <text 
                        x={cx} 
                        y={by + 28} 
                        textAnchor="middle" 
                        className="text-[9px] font-semibold chart-sublabel fill-neutral-500 dark:fill-neutral-400"
                      >
                        {period.sublabel}
                      </text>

                      <rect 
                        x={cx - slotWidth / 2} 
                        y={0} 
                        width={slotWidth} 
                        height={chartHeight} 
                        fill="transparent"
                        onMouseEnter={() => setHoveredPointIndex(idx)}
                        onMouseLeave={() => setHoveredPointIndex(null)}
                      />
                    </g>
                  );
                }
              })}
            </svg>

            {/* Dynamic Glassmorphic Floating Tooltip (Clamped & Non-Clipping at Top) */}
            {hoveredPointIndex !== null && salesPeriodsData[hoveredPointIndex] && (
              <div 
                className="absolute z-30 pointer-events-none bg-neutral-900/95 dark:bg-[#121316]/95 text-white text-xs p-3.5 rounded-2xl shadow-2xl border border-white/15 dark:border-white/20 backdrop-blur-xl transition-all min-w-[220px]"
                style={{
                  left: `${Math.max(14, Math.min(86, ((paddingLeft + (hoveredPointIndex + 0.5) * (plotWidth / salesPeriodsData.length)) / chartWidth) * 100))}%`,
                  top: `16px`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
                  <span className="font-bold text-emerald-400 text-xs">
                    {salesPeriodsData[hoveredPointIndex].label}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {salesPeriodsData[hoveredPointIndex].sublabel}
                  </span>
                </div>
                <div className="space-y-1 font-medium text-[11px]">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-300">Gross Invoiced:</span>
                    <span className="font-bold text-white">
                      {formatRs(salesPeriodsData[hoveredPointIndex].grossSales)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-emerald-400">Paid / Realized:</span>
                    <span className="font-bold text-emerald-400">
                      {formatRs(salesPeriodsData[hoveredPointIndex].collected)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-amber-400">Pending Due:</span>
                    <span className="font-bold text-amber-400">
                      {formatRs(salesPeriodsData[hoveredPointIndex].pending)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/10 text-[10px]">
                    <span className="text-gray-400">Deals / Units:</span>
                    <span className="font-bold text-blue-300">
                      {salesPeriodsData[hoveredPointIndex].invoicesCount} inv • {salesPeriodsData[hoveredPointIndex].unitsSold} units
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-[10px]">
                    <span className="text-gray-400">Realization Rate:</span>
                    <span className="font-bold text-emerald-400">
                      {salesPeriodsData[hoveredPointIndex].realizationRate !== null 
                        ? `${salesPeriodsData[hoveredPointIndex].realizationRate}%` 
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* High-Density Commercial Sales Ledger Table */}
        <div className="pt-2 border-t border-tapsh-charcoal/10 dark:border-white/10">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-tapsh-black dark:text-white">
              <TableIcon className="w-3.5 h-3.5 text-tapsh-charcoal dark:text-neutral-400" />
              <span>Sales & Collections Performance Ledger</span>
            </div>
            <span className="text-[10px] font-bold text-tapsh-charcoal dark:text-neutral-400">
              {salesPeriodsData.length} records in active scope
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-tapsh-charcoal/10 dark:border-white/10 bg-[#FAF8F5] dark:bg-[#151619]">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#F4EFE6] dark:bg-[#1C1D21] text-tapsh-charcoal dark:text-neutral-400 font-bold uppercase tracking-wider text-[10px] border-b border-tapsh-charcoal/10 dark:border-white/10">
                <tr>
                  <th className="px-4 py-2.5">Timeline Period</th>
                  <th className="px-3 py-2.5">Deals / Inv</th>
                  <th className="px-3 py-2.5">Units Sold</th>
                  <th className="px-4 py-2.5">Gross Billed</th>
                  <th className="px-4 py-2.5 text-emerald-700 dark:text-emerald-400">Realized (Paid)</th>
                  <th className="px-4 py-2.5 text-amber-700 dark:text-amber-400">Pending Due</th>
                  <th className="px-3 py-2.5 text-right">Realization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tapsh-charcoal/10 dark:divide-white/5 font-medium">
                {salesPeriodsData.map((period) => {
                  const hasSales = period.grossSales > 0 || period.unitsSold > 0;
                  return (
                    <tr 
                      key={period.id} 
                      onClick={() => {
                        if (period.dateKey) {
                          setSelectedDate(period.dateKey);
                        }
                      }}
                      className={`hover:bg-white/80 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                        period.isSelected 
                          ? "bg-emerald-500/10 dark:bg-emerald-950/40" 
                          : hasSales 
                          ? "bg-white/40 dark:bg-white/[0.02]" 
                          : ""
                      }`}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-tapsh-black dark:text-white">{period.label}</span>
                          <span className="text-[10px] text-tapsh-charcoal dark:text-neutral-400 font-normal">({period.sublabel})</span>
                          {period.isSelected && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                              Selected
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-tapsh-black dark:text-neutral-300">{period.invoicesCount}</td>
                      <td className="px-3 py-2.5 font-mono font-bold text-blue-600 dark:text-blue-400">{period.unitsSold}</td>
                      <td className="px-4 py-2.5 font-mono font-bold text-tapsh-black dark:text-white">{formatRs(period.grossSales)}</td>
                      <td className="px-4 py-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatRs(period.collected)}</td>
                      <td className="px-4 py-2.5 font-mono font-bold text-amber-600 dark:text-amber-400">{formatRs(period.pending)}</td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          period.realizationRate === null 
                            ? "bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 border-gray-200 dark:border-neutral-700" 
                            : period.realizationRate >= 100 
                            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" 
                            : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                        }`}>
                          {period.realizationRate === null ? "—" : `${period.realizationRate}%`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 4. Two-Column Dedicated Payment & Products Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Payment Channels & Settlement Distribution */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-tapsh-charcoal/15 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-600" />
                <h2 className="text-base font-bold text-tapsh-black">
                  Payment Channels & Settlement
                </h2>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {paidInvoicesCount} Paid Invoices
              </span>
            </div>
            <p className="text-xs text-tapsh-charcoal mb-5">
              Live breakdown of payments collected across transaction channels
            </p>

            {/* Donut Visualization */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-2">
              
              {/* SVG Donut */}
              <div className="relative w-40 h-40 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {(() => {
                    const radius = 38;
                    const circumference = 2 * Math.PI * radius;
                    let accumulatedPercent = 0;

                    return paymentBreakdown.map((item, i) => {
                      const strokeDasharray = `${(item.percent / 100) * circumference} ${circumference}`;
                      const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                      accumulatedPercent += item.percent;

                      return (
                        <circle
                          key={i}
                          cx="50"
                          cy="50"
                          r={radius}
                          fill="transparent"
                          stroke={item.color}
                          strokeWidth="14"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-500 cursor-pointer hover:opacity-85"
                          onMouseEnter={() => setHoveredDonutSegment(item.name)}
                          onMouseLeave={() => setHoveredDonutSegment(null)}
                        />
                      );
                    });
                  })()}
                </svg>

                {/* Center Stat */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-tapsh-charcoal">
                    Settled
                  </span>
                  <span className="text-sm font-extrabold text-tapsh-black">
                    {formatRsCompact(totalRevenueCollected)}
                  </span>
                </div>
              </div>

              {/* Legend & Breakdown List */}
              <div className="flex-1 w-full space-y-2.5">
                {paymentBreakdown.map((ch, i) => (
                  <div 
                    key={i}
                    className={`p-2.5 rounded-xl border transition-all ${
                      hoveredDonutSegment === ch.name
                        ? "bg-[#FAF8F5] border-tapsh-soft-green/40 shadow-xs"
                        : "border-tapsh-charcoal/10"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ch.color }}></span>
                        <span className="font-bold text-tapsh-black">{ch.name}</span>
                      </div>
                      <span className="font-mono font-bold text-tapsh-black">
                        {ch.percent}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-tapsh-charcoal">
                      <span>Total Collected:</span>
                      <span className="font-medium text-tapsh-black">{formatRs(ch.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-tapsh-charcoal/10 text-xs text-tapsh-charcoal flex justify-between">
            <span>Primary settlement method:</span>
            <strong className="text-emerald-700">UPI Digital Pay (Instant QR)</strong>
          </div>
        </div>

        {/* Right Column: Total Products Sale Breakdown */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-tapsh-charcoal/15 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <h2 className="text-base font-bold text-tapsh-black">
                  Total Products Sale
                </h2>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                {totalProductsSold} {totalProductsSold === 1 ? "Unit" : "Units"} Sold
              </span>
            </div>
            <p className="text-xs text-tapsh-charcoal mb-4">
              Physical NFC hardware stands, cards, and provisioned models
            </p>

            {/* List of Products Sold */}
            {productsSalesBreakdown.length === 0 ? (
              <div className="py-10 text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-tapsh-charcoal/20">
                <Package className="w-8 h-8 text-tapsh-charcoal/40 mx-auto mb-2" />
                <p className="text-xs font-bold text-tapsh-black">No product sales recorded yet</p>
                <p className="text-[11px] text-tapsh-charcoal mt-1 max-w-xs mx-auto">
                  Sales data appears here in real-time as invoices are created in the Invoicing section.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {productsSalesBreakdown.map((prod, i) => {
                  const totalUnits = totalProductsSold || 1;
                  const unitShare = Math.min(100, Math.round((prod.quantity / totalUnits) * 100));

                  return (
                    <div key={i} className="p-3 rounded-2xl bg-[#FAF8F5] border border-tapsh-charcoal/10 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-tapsh-black truncate pr-2">
                          {prod.name}
                        </span>
                        <span className="font-mono font-bold text-tapsh-black shrink-0">
                          {prod.quantity} sold
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-tapsh-soft-green rounded-full transition-all duration-700"
                          style={{ width: `${Math.max(5, unitShare)}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-tapsh-charcoal pt-0.5">
                        <span>Revenue: <strong className="text-tapsh-black">{formatRs(prod.revenue)}</strong></span>
                        <span>Share: <strong className="text-tapsh-soft-green">{unitShare}%</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-tapsh-charcoal/10 text-xs text-tapsh-charcoal flex justify-between">
            <span>Hardware deployment status:</span>
            <strong className={totalProductsSold > 0 ? "text-tapsh-soft-green" : "text-tapsh-charcoal"}>
              {totalProductsSold > 0 ? "100% Pre-Programmed & Active" : "No active deployments"}
            </strong>
          </div>
        </div>

      </div>

    </div>
  );
}
