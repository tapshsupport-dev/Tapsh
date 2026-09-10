"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, LayoutGrid, Receipt, IndianRupee } from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Quick mock auth check
    if (!document.cookie.includes("tapsh_admin_session")) {
      router.push("/admin/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) return <div className="p-8 text-tapsh-black font-medium">Loading dashboard...</div>;

  const STATS = [
    { label: "Total Customers", value: "42", icon: Users, trend: "+3 this week" },
    { label: "Active Hubs", value: "38", icon: LayoutGrid, trend: "+2 this week" },
    { label: "Pending Invoices", value: "5", icon: Receipt, trend: "₹45,000 pending" },
    { label: "Monthly Revenue", value: "₹1.2L", icon: IndianRupee, trend: "+12% vs last month" }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-tapsh-black">Overview</h1>
        <p className="text-tapsh-charcoal mt-2 font-medium">Welcome back to the TAPSH Admin Panel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {STATS.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-tapsh-charcoal/20 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-tapsh-pale-blue rounded-2xl border border-tapsh-charcoal/30 shadow-inner">
                <stat.icon className="w-6 h-6 text-tapsh-soft-green" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-tapsh-black mb-1">{stat.value}</h3>
            <p className="text-sm text-tapsh-charcoal font-bold">{stat.label}</p>
            <p className="text-xs text-tapsh-soft-green font-bold mt-4 tracking-wide">{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-tapsh-charcoal/20 shadow-md">
          <h2 className="text-xl font-bold text-tapsh-black mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border border-tapsh-charcoal/20 rounded-2xl bg-tapsh-pale-blue hover:bg-[#E9E4D3] transition-colors">
                <div className="w-2 h-2 rounded-full bg-tapsh-soft-green shadow-sm"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-tapsh-black">New Hub Created for <span className="font-bold">Resort {i+1}</span></p>
                  <p className="text-xs text-tapsh-charcoal font-bold mt-1">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-tapsh-charcoal/20 shadow-md">
          <h2 className="text-xl font-bold text-tapsh-black mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-6 border border-tapsh-charcoal/30 rounded-2xl text-left hover:border-tapsh-soft-green hover:shadow-md transition-all bg-tapsh-pale-blue group">
              <Users className="w-8 h-8 text-tapsh-charcoal group-hover:text-tapsh-soft-green mb-3 transition-colors" />
              <p className="font-bold text-tapsh-black text-sm">Add Customer</p>
            </button>
            <button className="p-6 border border-tapsh-charcoal/30 rounded-2xl text-left hover:border-tapsh-soft-green hover:shadow-md transition-all bg-tapsh-pale-blue group">
              <LayoutGrid className="w-8 h-8 text-tapsh-charcoal group-hover:text-tapsh-soft-green mb-3 transition-colors" />
              <p className="font-bold text-tapsh-black text-sm">Setup New Hub</p>
            </button>
            <button className="p-6 border border-tapsh-charcoal/30 rounded-2xl text-left hover:border-tapsh-soft-green hover:shadow-md transition-all bg-tapsh-pale-blue group">
              <Receipt className="w-8 h-8 text-tapsh-charcoal group-hover:text-tapsh-soft-green mb-3 transition-colors" />
              <p className="font-bold text-tapsh-black text-sm">Create Invoice</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
