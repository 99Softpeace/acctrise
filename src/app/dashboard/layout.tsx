"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ComponentType } from "react";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import {
  BadgeHelp,
  BookOpen,
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
  Wifi,
  ShieldCheck
} from "lucide-react";

type NavItem = { icon: ComponentType<{ className?: string }>; label: string; href: string; adminOnly?: boolean };

const navItems: NavItem[] = [
  { icon: Gauge, label: "Overview", href: "/dashboard" },
  { icon: Rocket, label: "Boost Account", href: "/dashboard/boosting" },
  { icon: ReceiptText, label: "Buy Logs", href: "/dashboard/logs" },
  { icon: Smartphone, label: "Rent Number", href: "/dashboard/rent-number" },
  { icon: Phone, label: "Foreign Numbers", href: "/dashboard/foreign-numbers" },
  { icon: Wifi, label: "Buy eSIM", href: "/dashboard/esim" },
  { icon: Box, label: "My Orders", href: "/dashboard/orders" },
  { icon: Wallet, label: "Fund Wallet", href: "/dashboard/wallet" },
  { icon: BookOpen, label: "Tutorials", href: "/dashboard/tutorials" },
  { icon: ShieldCheck, label: "Admin", href: "/dashboard/admin", adminOnly: true }
];

const adminRoles = new Set(["ADMIN", "SUPER_ADMIN", "DEVELOPER"]);

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}
function compactName(user?: { name?: string | null; username?: string | null; email?: string | null }) {
  return user?.name || user?.username || user?.email?.split("@")[0] || "Acctrise user";
}

function userInitial(value: string) {
  return (value.trim()[0] || "A").toUpperCase();
}

function DashboardChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const canSeeAdmin = adminRoles.has(session?.user?.role || "");
  const visibleNavItems = navItems.filter((item) => !item.adminOnly || canSeeAdmin);
  const displayName = compactName(session?.user);

  function handleLogout() {
    setMobileMenuOpen(false);
    void signOut({ callbackUrl: "/auth/login" });
  }

  return (
      <div className="dashboard-shell-app dashboard-redesign min-h-screen bg-slate-50 text-slate-800">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <Link href="/dashboard" className="dashboard-side-brand flex items-center border-b border-slate-200 px-5 py-5 transition hover:bg-slate-50">
          <Image src="/acctrise-wordmark.jpeg" alt="Acctrise" width={190} height={64} className="h-14 w-48 object-contain object-left mix-blend-multiply" priority />
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Dashboard navigation">
          {visibleNavItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href as any}
                className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold transition ${
                  active
                    ? "dashboard-nav-active"
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
        <div className="dashboard-sidebar-footer border-t border-slate-200 p-3">
          <div className="dashboard-user-card">
            <span>{userInitial(displayName)}</span>
            <div>
              <strong>{displayName}</strong>
              <small>{session?.user?.role || "CUSTOMER"}</small>
            </div>
          </div>
          <button className="dashboard-logout-button" onClick={handleLogout} type="button">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="dashboard-mobile-header dashboard-topbar sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" className="dashboard-mobile-brand flex min-w-0 items-center gap-3 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
              <Image src="/acctrise-wordmark.jpeg" alt="Acctrise" width={160} height={54} className="h-11 w-36 object-contain object-left mix-blend-multiply" priority />
            </Link>

            <div className="hidden lg:block">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Dashboard</p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">Welcome back, {displayName}</h1>
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              <a href="mailto:support@acctrise.com" className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                <BadgeHelp className="h-4 w-4" />
                Support
              </a>
              <Link href={"/dashboard/orders" as any} className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-blue-50 shadow-sm shadow-blue-600/20 transition hover:bg-blue-700">
                <Package className="h-4 w-4" />
                My Orders
              </Link>
              <button className="dashboard-topbar-logout" onClick={handleLogout} type="button">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>

            <button className="dashboard-mobile-menu-button inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm shadow-slate-200 transition hover:bg-slate-50 lg:hidden" type="button" aria-label="Toggle dashboard navigation" aria-expanded={mobileMenuOpen} aria-controls="mobile-dashboard-menu" onClick={() => setMobileMenuOpen((open) => !open)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <div id="mobile-dashboard-menu" className={`dashboard-mobile-menu ${mobileMenuOpen ? "grid" : "hidden"} mt-3 gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/70 lg:hidden`}>
            <nav className="grid gap-1" aria-label="Mobile dashboard navigation">
              {visibleNavItems.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href as any}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold ${
                      active
                        ? "dashboard-nav-active"
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
              <a href="mailto:support@acctrise.com" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>
                <BadgeHelp className="h-4 w-4" /> Support
              </a>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-100 px-3 text-sm font-bold text-red-600 transition hover:bg-red-50" onClick={handleLogout} type="button">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 pb-8 sm:px-6 lg:px-8">{children}</main>
      </div>
      </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DashboardChrome>{children}</DashboardChrome>
    </SessionProvider>
  );
}
