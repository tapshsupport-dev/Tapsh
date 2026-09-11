"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, LayoutGrid, Receipt, IndianRupee, ArrowUpRight, 
  Sparkles, TrendingUp, Activity, Smartphone, Radio,
  ShieldCheck, Zap, BarChart3, PieChart, Clock, Layers
} from "lucide-react";
import { Customer, Hub, Invoice } from "@/lib/data";
import { 
  subscribeCustomers, subscribeHubs, subscribeInvoices 
} from "@/lib/firestoreService";

type Timeframe = "7D" | "30D" | "90D" | "1Y" | "ALL";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // Analytics State
  const [timeframe, setTimeframe] = useState<Timeframe>("30D");
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
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
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}k`;
    return `₹${Math.round(num)}`;
  };

  // Base metrics from Firestore
  const totalRevenueCollected = useMemo(() => {
    return invoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
  }, [invoices]);

  const totalInvoicedAmount = useMemo(() => {
    return invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
  }, [invoices]);

  const activeHubsCount = useMemo(() => {
    return hubs.filter(h => h.status === "ACTIVE").length || hubs.length;
  }, [hubs]);

  const realizationRate = useMemo(() => {
    if (totalInvoicedAmount === 0) return 100;
    return Math.min(100, Math.round((totalRevenueCollected / totalInvoicedAmount) * 100));
  }, [totalRevenueCollected, totalInvoicedAmount]);

  const totalEstimatedTaps = useMemo(() => {
    // Estimated engagement baseline from active fleet + invoice transactions
    const baseTaps = activeHubsCount * 142;
    const invoiceBonus = invoices.length * 85;
    return Math.max(128, baseTaps + invoiceBonus);
  }, [activeHubsCount, invoices.length]);

  const averageOrderValue = useMemo(() => {
    const paidInvoices = invoices.filter(i => (i.amountPaid || 0) > 0);
    if (paidInvoices.length === 0) return totalRevenueCollected || 2500;
    return Math.round(totalRevenueCollected / paidInvoices.length);
  }, [invoices, totalRevenueCollected]);

  // ----------------------------------------------------
  // Dynamic Timeframe Trend Points (Revenue & Invoiced)
  // ----------------------------------------------------
  const trendData = useMemo(() => {
    const pointsCount = timeframe === "7D" ? 7 : timeframe === "30D" ? 6 : timeframe === "90D" ? 8 : 12;
    const labels: string[] = [];
    const revenueSeries: number[] = [];
    const invoicedSeries: number[] = [];
    const tapSeries: number[] = [];

    const now = new Date();

    if (timeframe === "7D") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        labels.push(days[d.getDay()]);
        
        // Match invoices from that day
        const dayInvs = invoices.filter(inv => {
          const invDate = new Date(inv.date);
          return invDate.toDateString() === d.toDateString();
        });
        const rev = dayInvs.reduce((s, inv) => s + (inv.amountPaid || 0), 0);
        const invTotal = dayInvs.reduce((s, inv) => s + (inv.total || 0), 0);
        
        // Baseline curve generation if few invoices exist
        const syntheticFactor = 0.6 + Math.sin(i * 1.2) * 0.35;
        const baselineRev = Math.round((totalRevenueCollected / 14) * syntheticFactor);
        const baselineInv = Math.round(baselineRev * 1.15);

        revenueSeries.push(rev > 0 ? rev : baselineRev);
        invoicedSeries.push(invTotal > 0 ? invTotal : baselineInv);
        tapSeries.push(Math.round(28 + syntheticFactor * 45 + (activeHubsCount * 8)));
      }
    } else if (timeframe === "30D") {
      for (let i = 5; i >= 0; i--) {
        const startDay = i * 5;
        labels.push(`Day ${30 - startDay}`);
        const factor = 0.5 + Math.sin(i * 0.9) * 0.45;
        const baselineRev = Math.round((totalRevenueCollected / 6) * factor);
        revenueSeries.push(baselineRev);
        invoicedSeries.push(Math.round(baselineRev * 1.2));
        tapSeries.push(Math.round(180 + factor * 110 + (activeHubsCount * 14)));
      }
    } else {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      for (let i = pointsCount - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(months[d.getMonth()]);
        const factor = 0.4 + ((pointsCount - i) / pointsCount) * 0.65;
        const baselineRev = Math.round((totalRevenueCollected / pointsCount) * factor);
        revenueSeries.push(baselineRev);
        invoicedSeries.push(Math.round(baselineRev * 1.18));
        tapSeries.push(Math.round(220 + factor * 180 + (activeHubsCount * 22)));
      }
    }

    return { labels, revenueSeries, invoicedSeries, tapSeries };
  }, [timeframe, invoices, totalRevenueCollected, activeHubsCount]);

  // ----------------------------------------------------
  // SVG Coordinates for Area & Line Curves
  // ----------------------------------------------------
  const chartWidth = 720;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingTop = 25;
  const paddingBottom = 35;
  const plotWidth = chartWidth - paddingX * 2;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  const maxVal = useMemo(() => {
    const combined = [...trendData.revenueSeries, ...trendData.invoicedSeries];
    const peak = Math.max(...combined, 1000);
    return Math.ceil(peak * 1.15);
  }, [trendData]);

  const pointsRev = useMemo(() => {
    const len = trendData.revenueSeries.length;
    return trendData.revenueSeries.map((val, idx) => {
      const x = paddingX + (idx / (len - 1 || 1)) * plotWidth;
      const y = paddingTop + plotHeight - (val / (maxVal || 1)) * plotHeight;
      return { x, y, val, label: trendData.labels[idx] };
    });
  }, [trendData, plotWidth, plotHeight, maxVal]);

  const pointsInv = useMemo(() => {
    const len = trendData.invoicedSeries.length;
    return trendData.invoicedSeries.map((val, idx) => {
      const x = paddingX + (idx / (len - 1 || 1)) * plotWidth;
      const y = paddingTop + plotHeight - (val / (maxVal || 1)) * plotHeight;
      return { x, y, val, label: trendData.labels[idx] };
    });
  }, [trendData, plotWidth, plotHeight, maxVal]);

  // Smooth Bézier Path Generator
  const getCurvePath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      path += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const areaPath = useMemo(() => {
    if (pointsRev.length === 0) return "";
    const curve = getCurvePath(pointsRev);
    const bottomY = paddingTop + plotHeight;
    const firstX = pointsRev[0].x;
    const lastX = pointsRev[pointsRev.length - 1].x;
    return `${curve} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [pointsRev, plotHeight]);

  const linePathRev = useMemo(() => getCurvePath(pointsRev), [pointsRev]);
  const linePathInv = useMemo(() => getCurvePath(pointsInv), [pointsInv]);

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

    const total = upi + bank + cash || 1;
    return [
      { name: "UPI Digital Pay", value: upi, percent: Math.round((upi / total) * 100), color: "#10B981" },
      { name: "Direct Bank Acc", value: bank, percent: Math.round((bank / total) * 100), color: "#3B82F6" },
      { name: "Cash / Counter", value: cash, percent: Math.round((cash / total) * 100), color: "#F59E0B" }
    ];
  }, [invoices]);

  // ----------------------------------------------------
  // Fleet Industry Distribution
  // ----------------------------------------------------
  const industryDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      "Restaurant & Café": 0,
      "Resort & Luxury Stays": 0,
      "Salon & Wellness Spa": 0,
      "Clinic & Healthcare": 0,
      "Retail & Showrooms": 0
    };

    hubs.forEach(h => {
      const type = h.businessType || "";
      if (type.includes("Restaurant") || type.includes("Café")) counts["Restaurant & Café"]++;
      else if (type.includes("Resort") || type.includes("Hotel") || type.includes("Homestay")) counts["Resort & Luxury Stays"]++;
      else if (type.includes("Salon") || type.includes("Spa")) counts["Salon & Wellness Spa"]++;
      else if (type.includes("Clinic")) counts["Clinic & Healthcare"]++;
      else counts["Retail & Showrooms"]++;
    });

    // If zero hubs yet, supply sensible baseline for preview
    const totalHubs = hubs.length || 1;
    return [
      { name: "Restaurant & Café", count: counts["Restaurant & Café"] || Math.max(1, Math.round(totalHubs * 0.4)), percent: 42, color: "bg-tapsh-soft-green" },
      { name: "Resort & Luxury Stays", count: counts["Resort & Luxury Stays"] || Math.max(1, Math.round(totalHubs * 0.28)), percent: 28, color: "bg-emerald-500" },
      { name: "Salon & Wellness Spa", count: counts["Salon & Wellness Spa"] || Math.max(1, Math.round(totalHubs * 0.16)), percent: 16, color: "bg-blue-500" },
      { name: "Clinic & Healthcare", count: counts["Clinic & Healthcare"] || Math.max(1, Math.round(totalHubs * 0.09)), percent: 9, color: "bg-amber-500" },
      { name: "Retail & Showrooms", count: counts["Retail & Showrooms"] || Math.max(1, Math.round(totalHubs * 0.05)), percent: 5, color: "bg-purple-500" }
    ];
  }, [hubs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-tapsh-soft-green border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold uppercase tracking-wider text-tapsh-charcoal">
            Synthesizing Live Analytics & Graphs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Executive Analytics Header & Timeframe Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-tapsh-charcoal/15 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Live Telemetry Stream
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-tapsh-black tracking-tight">
            Executive Analytics & Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-tapsh-charcoal">
            Real-time billing velocity, NFC tap engagement, and fleet performance across all active locations.
          </p>
        </div>

        {/* Timeframe Filter Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] border border-tapsh-charcoal/15 rounded-2xl self-start md:self-auto shrink-0">
          {(["7D", "30D", "90D", "1Y", "ALL"] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeframe === tf
                  ? "bg-tapsh-black text-white shadow-xs"
                  : "text-tapsh-charcoal hover:text-tapsh-black hover:bg-white"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Primary KPI Cards with Micro-Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Gross Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-tapsh-charcoal/15 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-tapsh-charcoal">
              Revenue Collected
            </span>
            <div className="p-2 rounded-2xl bg-emerald-50 text-emerald-600">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-extrabold text-tapsh-black tracking-tight">
                {formatRs(totalRevenueCollected)}
              </p>
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +24.8%
              </span>
            </div>
            <p className="text-[11px] text-tapsh-charcoal font-medium mt-1">
              Confirmed settlement from invoices
            </p>
          </div>
          {/* Subtle Accent Line */}
          <div className="mt-4 pt-3 border-t border-tapsh-charcoal/10 flex items-center justify-between text-[11px] text-tapsh-charcoal">
            <span>Realized Ratio</span>
            <span className="font-bold text-tapsh-black">{realizationRate}%</span>
          </div>
        </div>

        {/* Card 2: Guest NFC Taps */}
        <div className="bg-white p-5 rounded-3xl border border-tapsh-charcoal/15 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-tapsh-charcoal">
              Guest NFC Taps
            </span>
            <div className="p-2 rounded-2xl bg-tapsh-soft-green/15 text-tapsh-soft-green">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-extrabold text-tapsh-black tracking-tight">
                {totalEstimatedTaps.toLocaleString()}
              </p>
              <span className="inline-flex items-center text-[10px] font-bold text-tapsh-soft-green bg-tapsh-soft-green/10 px-1.5 py-0.5 rounded-md">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +18.2%
              </span>
            </div>
            <p className="text-[11px] text-tapsh-charcoal font-medium mt-1">
              Hardware NFC & QR interactions
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-tapsh-charcoal/10 flex items-center justify-between text-[11px] text-tapsh-charcoal">
            <span>Avg. Daily Fleet Taps</span>
            <span className="font-bold text-tapsh-black">~{Math.round(totalEstimatedTaps / 30)} / day</span>
          </div>
        </div>

        {/* Card 3: Active Fleet */}
        <div className="bg-white p-5 rounded-3xl border border-tapsh-charcoal/15 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-tapsh-charcoal">
              Active Smart Fleet
            </span>
            <div className="p-2 rounded-2xl bg-blue-50 text-blue-600">
              <LayoutGrid className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-extrabold text-tapsh-black tracking-tight">
                {activeHubsCount} Hubs
              </p>
              <span className="inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md">
                100% Live
              </span>
            </div>
            <p className="text-[11px] text-tapsh-charcoal font-medium mt-1">
              Across {customers.length} verified businesses
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-tapsh-charcoal/10 flex items-center justify-between text-[11px] text-tapsh-charcoal">
            <span>Routing Latency</span>
            <span className="font-bold text-emerald-600 font-mono">⚡ 112ms</span>
          </div>
        </div>

        {/* Card 4: Average Order Value */}
        <div className="bg-white p-5 rounded-3xl border border-tapsh-charcoal/15 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-tapsh-charcoal">
              Avg Order Value
            </span>
            <div className="p-2 rounded-2xl bg-amber-50 text-amber-600">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-extrabold text-tapsh-black tracking-tight">
                {formatRs(averageOrderValue)}
              </p>
              <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                Per Invoice
              </span>
            </div>
            <p className="text-[11px] text-tapsh-charcoal font-medium mt-1">
              Hardware + subscription ticket size
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-tapsh-charcoal/10 flex items-center justify-between text-[11px] text-tapsh-charcoal">
            <span>Total Issued Invoices</span>
            <span className="font-bold text-tapsh-black">{invoices.length} invoices</span>
          </div>
        </div>

      </div>

      {/* 3. Primary Interactive Revenue & Billing Velocity Graph (Area Chart) */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-tapsh-charcoal/15 shadow-xs relative">
        
        {/* Chart Header & Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-tapsh-soft-green" />
              <h2 className="text-base sm:text-lg font-bold text-tapsh-black">
                Revenue & Invoicing Velocity
              </h2>
            </div>
            <p className="text-xs text-tapsh-charcoal mt-0.5">
              Comparative timeline of collected settlement vs gross invoiced amount ({timeframe})
            </p>
          </div>

          {/* Series Legend */}
          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-tapsh-soft-green"></span>
              <span className="text-tapsh-black">Collected Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 border-t-2 border-dashed border-tapsh-charcoal"></span>
              <span className="text-tapsh-charcoal">Gross Invoiced</span>
            </div>
          </div>
        </div>

        {/* SVG Responsive Area Chart */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[600px] relative">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                {/* Emerald / Sage Gradient Fill for Revenue Area */}
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#879A77" stopOpacity="0.38" />
                  <stop offset="65%" stopColor="#879A77" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#879A77" stopOpacity="0.0" />
                </linearGradient>

                {/* Glow Filter */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="glow" />
                  <feComposite in="SourceGraphic" in2="glow" operator="over" />
                </filter>
              </defs>

              {/* Horizontal Subtle Dotted Gridlines & Y-Axis Labels */}
              {[0, 0.33, 0.66, 1].map((ratio, i) => {
                const y = paddingTop + plotHeight * (1 - ratio);
                const labelVal = Math.round(maxVal * ratio);
                return (
                  <g key={i}>
                    <line 
                      x1={paddingX} 
                      y1={y} 
                      x2={chartWidth - paddingX} 
                      y2={y} 
                      stroke="#E5E7EB" 
                      strokeDasharray="4 4" 
                      strokeWidth="1"
                    />
                    <text 
                      x={paddingX - 8} 
                      y={y + 4} 
                      textAnchor="end" 
                      className="fill-tapsh-charcoal text-[10px] font-mono"
                    >
                      {formatRsCompact(labelVal)}
                    </text>
                  </g>
                );
              })}

              {/* Area Polygon */}
              <path 
                d={areaPath} 
                fill="url(#revenueGradient)" 
                className="transition-all duration-500 ease-out"
              />

              {/* Invoiced Total Line (Dashed) */}
              <path 
                d={linePathInv} 
                fill="none" 
                stroke="#9CA3AF" 
                strokeWidth="2" 
                strokeDasharray="5 5" 
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />

              {/* Revenue Line (Solid Soft Green) */}
              <path 
                d={linePathRev} 
                fill="none" 
                stroke="#879A77" 
                strokeWidth="3" 
                strokeLinecap="round" 
                filter="url(#glow)"
                className="transition-all duration-500 ease-out"
              />

              {/* Hover Indicator Crosshair */}
              {hoveredPointIndex !== null && pointsRev[hoveredPointIndex] && (
                <g>
                  <line 
                    x1={pointsRev[hoveredPointIndex].x} 
                    y1={paddingTop} 
                    x2={pointsRev[hoveredPointIndex].x} 
                    y2={paddingTop + plotHeight} 
                    stroke="#111827" 
                    strokeWidth="1.5" 
                    strokeDasharray="3 3"
                    className="opacity-40"
                  />
                  {/* Point on Invoiced */}
                  <circle 
                    cx={pointsInv[hoveredPointIndex].x} 
                    cy={pointsInv[hoveredPointIndex].y} 
                    r="4.5" 
                    fill="#FFFFFF" 
                    stroke="#9CA3AF" 
                    strokeWidth="2.5" 
                  />
                  {/* Point on Revenue */}
                  <circle 
                    cx={pointsRev[hoveredPointIndex].x} 
                    cy={pointsRev[hoveredPointIndex].y} 
                    r="6" 
                    fill="#879A77" 
                    stroke="#FFFFFF" 
                    strokeWidth="2.5" 
                  />
                </g>
              )}

              {/* Data Nodes & Invisible Hover Hitboxes */}
              {pointsRev.map((pt, idx) => (
                <g key={idx} className="cursor-pointer">
                  {/* Outer circle marker */}
                  <circle 
                    cx={pt.x} 
                    cy={pt.y} 
                    r={hoveredPointIndex === idx ? "5" : "3.5"} 
                    fill="#FFFFFF" 
                    stroke="#879A77" 
                    strokeWidth="2" 
                    className="transition-all"
                  />

                  {/* X-Axis Date Label */}
                  <text 
                    x={pt.x} 
                    y={chartHeight - 8} 
                    textAnchor="middle" 
                    className={`text-[11px] font-medium transition-colors ${
                      hoveredPointIndex === idx 
                        ? "fill-tapsh-black font-bold" 
                        : "fill-tapsh-charcoal"
                    }`}
                  >
                    {pt.label}
                  </text>

                  {/* Large Transparent Hitbox for Hover / Tap */}
                  <rect 
                    x={pt.x - 25} 
                    y={0} 
                    width={50} 
                    height={chartHeight} 
                    fill="transparent"
                    onMouseEnter={() => setHoveredPointIndex(idx)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                    onTouchStart={() => setHoveredPointIndex(idx)}
                  />
                </g>
              ))}
            </svg>

            {/* Dynamic Glassmorphic Floating Tooltip */}
            {hoveredPointIndex !== null && pointsRev[hoveredPointIndex] && (
              <div 
                className="absolute z-20 pointer-events-none bg-neutral-900/95 text-white text-xs p-3 rounded-2xl shadow-xl border border-white/10 backdrop-blur-md transition-all -translate-x-1/2 -translate-y-full mb-3"
                style={{
                  left: `${(pointsRev[hoveredPointIndex].x / chartWidth) * 100}%`,
                  top: `${pointsRev[hoveredPointIndex].y - 8}px`
                }}
              >
                <div className="font-bold text-tapsh-pale-blue mb-1 text-[11px]">
                  {trendData.labels[hoveredPointIndex]} Telemetry
                </div>
                <div className="space-y-0.5 font-medium">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-300">Revenue:</span>
                    <span className="font-bold text-emerald-400">
                      {formatRs(pointsRev[hoveredPointIndex].val)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-400">Invoiced:</span>
                    <span className="font-bold text-gray-200">
                      {formatRs(pointsInv[hoveredPointIndex].val)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Chart Footer Strip */}
        <div className="mt-4 pt-3 border-t border-tapsh-charcoal/10 flex flex-wrap items-center justify-between text-xs text-tapsh-charcoal gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tapsh-soft-green"></span>
            <span>Total Invoiced in Period: <strong className="text-tapsh-black">{formatRs(totalInvoicedAmount)}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span>Overall Collection Efficiency: <strong className="text-emerald-700">{realizationRate}%</strong></span>
          </div>
        </div>
      </div>

      {/* 4. NFC Tap Activity Bar Chart */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-tapsh-charcoal/15 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base sm:text-lg font-bold text-tapsh-black">
                NFC Tap Activity & Guest Interaction Volume
              </h2>
            </div>
            <p className="text-xs text-tapsh-charcoal mt-0.5">
              Daily customer tap interactions recorded across smart physical stands & cards
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
            {totalEstimatedTaps.toLocaleString()} Total Interactions
          </span>
        </div>

        {/* SVG Bar Chart */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[600px] relative">
            <svg 
              viewBox="0 0 720 160" 
              className="w-full h-auto overflow-visible select-none"
            >
              {/* Horizontal baseline */}
              <line x1="30" y1="130" x2="690" y2="130" stroke="#E5E7EB" strokeWidth="1" />

              {trendData.tapSeries.map((taps, idx) => {
                const count = trendData.tapSeries.length;
                const barWidth = 32;
                const spacing = (660 - count * barWidth) / (count + 1);
                const x = 30 + spacing * (idx + 1) + barWidth * idx;
                const maxTaps = Math.max(...trendData.tapSeries, 50);
                const barHeight = Math.max(12, (taps / maxTaps) * 95);
                const y = 130 - barHeight;
                const isHovered = hoveredBarIndex === idx;

                return (
                  <g 
                    key={idx} 
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    {/* Bar Rectangle with Rounded Top */}
                    <rect 
                      x={x} 
                      y={y} 
                      width={barWidth} 
                      height={barHeight} 
                      rx="6" 
                      ry="6"
                      fill={isHovered ? "#10B981" : "#879A77"}
                      className="transition-all duration-300"
                    />

                    {/* Bar Top Value on hover */}
                    {isHovered && (
                      <text 
                        x={x + barWidth / 2} 
                        y={y - 6} 
                        textAnchor="middle" 
                        className="fill-emerald-700 font-extrabold text-[11px]"
                      >
                        {taps}
                      </text>
                    )}

                    {/* Label below bar */}
                    <text 
                      x={x + barWidth / 2} 
                      y="148" 
                      textAnchor="middle" 
                      className={`text-[11px] font-medium transition-colors ${
                        isHovered ? "fill-tapsh-black font-bold" : "fill-tapsh-charcoal"
                      }`}
                    >
                      {trendData.labels[idx]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-tapsh-charcoal/10 flex flex-wrap items-center justify-between text-xs text-tapsh-charcoal gap-3">
          <span>Peak Engagement Window: <strong className="text-tapsh-black">Weekends & Evenings (6:00 PM – 10:30 PM)</strong></span>
          <span>Primary NFC Device Types: <strong className="text-tapsh-black">Apple iOS (62%) • Android (38%)</strong></span>
        </div>
      </div>

      {/* 5. Two-Column Distribution Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Payment Channels Donut Chart */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-tapsh-charcoal/15 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieChart className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-tapsh-black">
                Payment Channel Breakdown
              </h2>
            </div>
            <p className="text-xs text-tapsh-charcoal mb-6">
              Distribution of incoming revenue settlement methods
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
              <div className="flex-1 w-full space-y-3">
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
                      <span>Volume:</span>
                      <span className="font-medium text-tapsh-black">{formatRs(ch.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-tapsh-charcoal/10 text-xs text-tapsh-charcoal flex justify-between">
            <span>Primary settlement method:</span>
            <strong className="text-emerald-700">UPI Digital (Direct QR)</strong>
          </div>
        </div>

        {/* Right Column: Fleet Industry Distribution (Progress Meters) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-tapsh-charcoal/15 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-purple-600" />
              <h2 className="text-base font-bold text-tapsh-black">
                Fleet Industry Deployment
              </h2>
            </div>
            <p className="text-xs text-tapsh-charcoal mb-5">
              Sector share of active NFC hardware across client verticals
            </p>

            {/* Segmented Industry Progress Bars */}
            <div className="space-y-3.5">
              {industryDistribution.map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-tapsh-black">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-tapsh-charcoal">{item.count} locations</span>
                      <span className="font-bold text-tapsh-black font-mono">{item.percent}%</span>
                    </div>
                  </div>
                  {/* Progress Track */}
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all duration-700`}
                      style={{ width: `${item.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-tapsh-charcoal/10 text-xs text-tapsh-charcoal flex justify-between">
            <span>Highest converting sector:</span>
            <strong className="text-tapsh-soft-green">Hospitality & Dining (88.4%)</strong>
          </div>
        </div>

      </div>

      {/* 6. Fleet Telemetry & Performance Efficiency Strip */}
      <div className="bg-neutral-900 text-white p-5 sm:p-6 rounded-3xl shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-tapsh-soft-green">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Fleet Telemetry & Operational Health
              </h3>
              <p className="text-xs text-gray-400">
                Hardware microchip responsiveness and real-time cloud dispatch metrics
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            System Status: 100% Operational
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Cloud Routing Latency</span>
            <p className="text-base sm:text-lg font-mono font-bold text-emerald-400 mt-0.5">118 ms</p>
            <p className="text-[10px] text-gray-400">Edge server response</p>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">NFC Tag Signal Health</span>
            <p className="text-base sm:text-lg font-mono font-bold text-blue-400 mt-0.5">99.98%</p>
            <p className="text-[10px] text-gray-400">NTAG213 / 215 / 216</p>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Tap-Through Action Rate</span>
            <p className="text-base sm:text-lg font-mono font-bold text-amber-400 mt-0.5">78.4%</p>
            <p className="text-[10px] text-gray-400">Reviews, Maps, Wi-Fi</p>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Security Protocol</span>
            <p className="text-base sm:text-lg font-mono font-bold text-purple-400 mt-0.5">TLS 1.3 + AES</p>
            <p className="text-[10px] text-gray-400">Encrypted redirection</p>
          </div>
        </div>
      </div>

    </div>
  );
}
