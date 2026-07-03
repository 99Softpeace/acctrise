"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  BadgeHelp,
  Box,
  Gauge,
  LogOut,
  Menu,
  X,
  Package,
  Phone,
  ReceiptText,
  Rocket,
  Smartphone,
  Wallet,
  Wifi
} from "lucide-react";

const navItems = [
  { icon: Gauge, label: "Overview", href: "/dashboard" },
  { icon: Rocket, label: "Boost Account", href: "/dashboard/boosting" },
  { icon: ReceiptText, label: "Buy Logs", href: "/dashboard/logs" },
  { icon: Smartphone, label: "Foreign Numbers", href: "/dashboard/foreign-numbers" },
  { icon: Phone, label: "UK Premium", href: "/dashboard/uk-premium" },
  { icon: Wifi, label: "Buy eSIM", href: "/dashboard/esim" },
  { icon: Box, label: "My Orders", href: "/dashboard/orders" },
  { icon: Wallet, label: "Fund Wallet", href: "/dashboard/wallet" }
];

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    setMobileMenuOpen(false);
    void signOut({ callbackUrl: "/auth/login" });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <Link href="/dashboard" className="flex items-center gap-3 border-b border-slate-200 px-5 py-5 transition hover:bg-slate-50">
          <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-lg bg-blue-50 ring-1 ring-blue-100">
            <Image src="/acctrise-logo.jpeg" alt="Acctrise" width={40} height={40} className="h-full w-full object-cover" />
          </span>
          <span>
            <span className="block text-sm font-bold tracking-tight">Acctrise</span>
            <span className="block text-xs font-semibold text-slate-500">Service console</span>
          </span>
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Dashboard navigation">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href as any}
                className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold transition ${
                  active
                    ? "bg-blue-600 text-blue-50 shadow-sm shadow-blue-600/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <button className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50" onClick={handleLogout} type="button">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" className="flex min-w-0 items-center gap-3 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
              <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-blue-50 shadow-sm shadow-blue-100 ring-1 ring-blue-100">
                <Image src="/acctrise-logo.jpeg" alt="Acctrise" width={48} height={48} className="h-full w-full object-cover" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-base font-bold tracking-tight text-slate-800">Acctrise</span>
                <span className="block truncate text-xs font-semibold text-slate-500">Dashboard</span>
              </span>
            </Link>

            <div className="hidden lg:block">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Dashboard</p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">Welcome back</h1>
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50" type="button">
                <BadgeHelp className="h-4 w-4" />
                Support
              </button>
              <Link href={"/dashboard/orders" as any} className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-blue-50 shadow-sm shadow-blue-600/20 transition hover:bg-blue-700">
                <Package className="h-4 w-4" />
                My Orders
              </Link>
            </div>

            <button className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm shadow-slate-200 transition hover:bg-slate-50 lg:hidden" type="button" aria-label="Toggle dashboard navigation" aria-expanded={mobileMenuOpen} aria-controls="mobile-dashboard-menu" onClick={() => setMobileMenuOpen((open) => !open)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <div id="mobile-dashboard-menu" className={`${mobileMenuOpen ? "grid" : "hidden"} mt-3 gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/70 lg:hidden`}>
            <nav className="grid gap-1" aria-label="Mobile dashboard navigation">
              {navItems.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href as any}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold ${
                      active
                        ? "bg-blue-600 text-blue-50 shadow-sm shadow-blue-600/20"
                        : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2">
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50" type="button" onClick={() => setMobileMenuOpen(false)}>
                <BadgeHelp className="h-4 w-4" /> Support
              </button>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-100 px-3 text-sm font-bold text-red-600 transition hover:bg-red-50" onClick={handleLogout} type="button">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}