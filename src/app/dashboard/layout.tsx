"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BadgeHelp,
  BookOpen,
  Box,
  FileText,
  Gauge,
  LogOut,
  Package,
  Phone,
  ReceiptText,
  Rocket,
  Settings,
  Share2,
  Smartphone,
  Wallet,
  Wifi
} from "lucide-react";

const navItems = [
  { icon: Gauge, label: "Overview", href: "/dashboard" },
  { icon: Wallet, label: "Fund Wallet", href: "/dashboard#wallet" },
  { icon: Rocket, label: "Boost Account", href: "/dashboard#boosting" },
  { icon: Box, label: "My Orders", href: "/dashboard#orders" },
  { icon: Smartphone, label: "Foreign Numbers", href: "/dashboard#numbers" },
  { icon: Phone, label: "UK Premium", href: "/dashboard#uk-premium" },
  { icon: Wifi, label: "Buy eSIM", href: "/dashboard#esim" },
  { icon: ReceiptText, label: "Buy Logs", href: "/dashboard#logs" },
  { icon: BookOpen, label: "Tutorials", href: "/dashboard#tutorials" },
  { icon: Share2, label: "Refer & Earn", href: "/dashboard#referrals" },
  { icon: FileText, label: "API Docs", href: "/dashboard#api" }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <Link href="/dashboard" className="flex items-center gap-3 border-b border-slate-200 px-5 py-5">
          <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-lg bg-blue-50">
            <Image src="/acctrise-logo.jpeg" alt="Acctrise" width={40} height={40} className="h-full w-full object-cover" />
          </span>
          <span>
            <span className="block text-sm font-black">Acctrise</span>
            <span className="block text-xs font-semibold text-slate-500">Services dashboard</span>
          </span>
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Dashboard navigation">
          {navItems.map((item, index) => (
            <Link
              key={item.label}
              href={item.href as any}
              className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold transition ${
                index === 0
                  ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-semibold">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <Link href={"/dashboard#settings" as any} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            <Settings className="h-5 w-5" />
            Settings
          </Link>
          <button className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-red-600 hover:bg-red-50">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-lg bg-blue-50 lg:hidden">
                <Image src="/acctrise-logo.jpeg" alt="Acctrise" width={40} height={40} className="h-full w-full object-cover" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase text-blue-600">Dashboard</p>
                <h1 className="text-xl font-black tracking-normal text-slate-950 sm:text-2xl">Welcome back</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={"/dashboard#support" as any} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                <BadgeHelp className="h-4 w-4" />
                <span className="hidden sm:inline">Support</span>
              </Link>
              <Link href={"/dashboard#orders" as any} className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-700">
                <Package className="h-4 w-4" />
                My Orders
              </Link>
            </div>
          </div>

          <nav className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:hidden" aria-label="Mobile dashboard navigation">
            {navItems.map((item, index) => (
              <Link
                key={item.label}
                href={item.href as any}
                className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-xs font-bold ring-1 ${
                  index === 0
                    ? "bg-blue-600 text-white ring-blue-600"
                    : "bg-white text-slate-600 ring-slate-200"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}