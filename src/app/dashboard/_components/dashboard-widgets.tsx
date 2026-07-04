"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  Clock3,
  FileText,
  History,
  Layers3,
  MessageSquare,
  Package,
  Phone,
  PlayCircle,
  Plus,
  Rocket,
  Smartphone,
  Wallet,
  Wifi,
  Zap
} from "lucide-react";
import { useMemo } from "react";
import { AnimatedGlobe } from "./animated-globe";
import { ServiceExplorer } from "./service-explorer";

type StatusTone = "success" | "warning" | "neutral" | "danger" | "info";

const stats = [
  { label: "Available Balance", value: "NGN 7,628.24", detail: "+15% deposit bonus", icon: Wallet, tone: "blue" },
  { label: "Total Spent", value: "NGN 5,599.76", detail: "Lifetime expenditure", icon: ArrowUpRight, tone: "violet" },
  { label: "Active Orders", value: "0", detail: "Currently processing", icon: Clock3, tone: "amber" },
  { label: "Total Orders", value: "20", detail: "Lifetime orders", icon: CheckCircle2, tone: "green" }
];

const serviceCards = [
  { title: "Boost Account", href: "/dashboard/boosting", detail: "Social growth services organized by platform.", icon: Rocket, meta: "Fast campaigns" },
  { title: "Buy Logs", href: "/dashboard/logs", detail: "Premium accounts and social log inventory.", icon: FileText, meta: "Secure inventory" },
  { title: "Rent Number", href: "/dashboard/rent-number", detail: "Temporary SMS numbers for app verification.", icon: Smartphone, meta: "SMSPool live" },
  { title: "USA Premium", href: "/dashboard/uk-premium", detail: "Premium USA numbers for higher-trust verification.", icon: Phone, meta: "Live numbers" },
  { title: "Buy eSIM", href: "/dashboard/esim", detail: "Travel data plans and regional eSIM options.", icon: Wifi, meta: "Travel ready" },
  { title: "Wallet", href: "/dashboard/wallet", detail: "Funding is paused while PocketFi activation is pending.", icon: Wallet, meta: "PocketFi planned" }
];

const quickActions = [
  { label: "Boost Account", href: "/dashboard/boosting", icon: Rocket, tone: "blue" },
  { label: "Rent Number", href: "/dashboard/rent-number", icon: MessageSquare, tone: "orange" },
  { label: "USA Premium", href: "/dashboard/uk-premium", icon: Clock3, tone: "teal" },
  { label: "Buy Logs", href: "/dashboard/logs", icon: FileText, tone: "yellow" },
  { label: "Tutorials", href: "/dashboard/orders", icon: PlayCircle, tone: "indigo" },
  { label: "eSIM", href: "/dashboard/esim", icon: Smartphone, tone: "pink" }
];

const recentOrders = [
  { id: "#560431", service: "Rental: 2RedBeans", link: "-", quantity: "1", status: "Cancelled", date: "Jul 2, 2026" },
  { id: "#546411", service: "Rental: Snapchat", link: "-", quantity: "1", status: "Cancelled", date: "Jul 2, 2026" },
  { id: "#545167", service: "Instagram Likes", link: "instagram.com/post", quantity: "500", status: "Completed", date: "Jul 1, 2026" },
  { id: "#544373", service: "Telegram Members", link: "t.me/channel", quantity: "250", status: "Processing", date: "Jun 30, 2026" }
];

const toneClasses: Record<string, string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100"
};

const mobileToneClasses: Record<string, string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  orange: "bg-orange-50 text-orange-700 ring-orange-100",
  teal: "bg-teal-50 text-teal-700 ring-teal-100",
  yellow: "bg-amber-50 text-amber-700 ring-amber-100",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  pink: "bg-pink-50 text-pink-700 ring-pink-100"
};

function statusTone(status: string): StatusTone {
  const normalized = status.toLowerCase();
  if (["completed", "configured", "active", "live", "paid"].includes(normalized)) return "success";
  if (["processing", "waiting", "pending"].includes(normalized)) return "warning";
  if (["cancelled", "failed", "missing", "error"].includes(normalized)) return "danger";
  return "neutral";
}

export function StatusPill({ status }: { status: string }) {
  const styles: Record<StatusTone, string> = {
    success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    warning: "bg-amber-50 text-amber-700 ring-amber-100",
    danger: "bg-rose-50 text-rose-700 ring-rose-100",
    info: "bg-blue-50 text-blue-700 ring-blue-100",
    neutral: "bg-slate-100 text-slate-600 ring-slate-200"
  };

  return <span className={`inline-flex h-7 items-center rounded-md px-2.5 text-xs font-semibold ring-1 ${styles[statusTone(status)]}`}>{status}</span>;
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <section className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">{title}</h2>
        <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
      </div>
      {action}
    </section>
  );
}

function PrimaryButton({ children, href }: { children: React.ReactNode; href?: string }) {
  const className = "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-blue-50 shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100";
  if (href) return <Link href={href as any} className={className}>{children}</Link>;
  return <button className={className} type="button">{children}</button>;
}

function Surface({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <article className={`rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/60 ${className}`}>{children}</article>;
}

function MobileOverviewHeader() {
  return (
    <section className="mobile-overview md:hidden" aria-label="Mobile dashboard summary">
      <div className="mobile-overview-top">
        <div className="mobile-avatar">P</div>
        <div>
          <span>Welcome back</span>
          <strong>Peace Olowo</strong>
        </div>
        <button className="mobile-bell" type="button" aria-label="Notifications"><Bell className="h-4 w-4" /></button>
      </div>

      <div className="mobile-balance-card">
        <div>
          <span>Total Balance</span>
          <strong>NGN 7,628.24</strong>
        </div>
        <Wallet className="mobile-wallet-mark" aria-hidden="true" />
        <div className="mobile-balance-actions">
          <Link href="/dashboard/wallet"><Plus className="h-4 w-4" /> Add Money</Link>
          <Link href="/dashboard/wallet"><History className="h-4 w-4" /> History</Link>
        </div>
      </div>

      <div className="mobile-network-lite">
        <div>
          <span>Available now</span>
          <strong>620+ services</strong>
        </div>
        <div className="network-lite-orb" aria-hidden="true"><span /><span /><span /></div>
      </div>

      <div className="mobile-section-title">Quick Actions</div>
      <div className="mobile-action-grid">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href as any} className="mobile-action-tile">
            <span className={`mobile-action-icon ${mobileToneClasses[action.tone]}`}><action.icon className="h-5 w-5" /></span>
            <small>{action.label}</small>
          </Link>
        ))}
      </div>
    </section>
  );
}

function DesktopOverviewHero() {
  return (
    <section className="hidden gap-5 md:grid xl:grid-cols-[1.05fr_0.95fr] xl:items-stretch">
      <Surface className="overflow-hidden p-6">
        <div className="desktop-overview-card">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Dashboard</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">Welcome back, Peace</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Track balance, orders, and service shortcuts without digging through menus.</p>
          </div>
          <PrimaryButton href="/dashboard/boosting"><Rocket className="h-4 w-4" /> New boost order</PrimaryButton>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Link href="/dashboard/wallet" className="rounded-lg bg-blue-50 p-4 text-blue-800 ring-1 ring-blue-100"><span className="text-xs font-bold uppercase tracking-[0.12em] text-blue-500">Balance</span><strong className="mt-2 block text-2xl tracking-tight">NGN 7,628.24</strong></Link>
          <Link href="/dashboard/orders" className="rounded-lg bg-slate-50 p-4 text-slate-700 ring-1 ring-slate-200"><span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Orders</span><strong className="mt-2 block text-2xl tracking-tight">20</strong></Link>
          <Link href={"/dashboard/rent-number" as any} className="rounded-lg bg-emerald-50 p-4 text-emerald-800 ring-1 ring-emerald-100"><span className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-600">Numbers</span><strong className="mt-2 block text-2xl tracking-tight">17 live</strong></Link>
        </div>
      </Surface>
      <AnimatedGlobe />
    </section>
  );
}

function StatGrid() {
  return (
    <section className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Surface key={stat.label} className="p-5 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div className={`grid h-11 w-11 place-items-center rounded-lg ring-1 ${toneClasses[stat.tone]}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Live</span>
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-500">{stat.label}</p>
          <strong className="mt-2 block text-3xl font-bold tracking-tight text-slate-800">{stat.value}</strong>
          <span className="mt-2 block text-sm font-semibold text-emerald-600">{stat.detail}</span>
        </Surface>
      ))}
    </section>
  );
}

function ServiceCards() {
  return (
    <section className="overview-services grid gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
      <div className="col-span-full flex items-center justify-between gap-3 md:hidden">
        <h3 className="text-base font-bold tracking-tight text-slate-800">Services</h3>
        <Link href="/dashboard/orders" className="text-xs font-bold text-blue-700">Orders</Link>
      </div>
      {serviceCards.map((service) => (
        <Link key={service.href} href={service.href as any} className="group service-shortcut-card rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md md:p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <service.icon className="h-5 w-5" />
            </div>
            <span className="hidden rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 sm:inline-flex">{service.meta}</span>
          </div>
          <h3 className="mt-4 text-base font-bold tracking-tight text-slate-800 md:mt-5 md:text-lg">{service.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{service.detail}</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-700 group-hover:text-blue-800 md:mt-5">
            Open <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      ))}
    </section>
  );
}

function RecentOrdersTable({ compact = false }: { compact?: boolean }) {
  const rows = compact ? recentOrders.slice(0, 3) : recentOrders;
  return (
    <Surface className="overflow-hidden recent-orders-surface">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
        <div>
          <h3 className="text-base font-bold tracking-tight text-slate-800 sm:text-lg">Recent Orders</h3>
          <p className="text-sm text-slate-500">Latest wallet and service activity.</p>
        </div>
        <Link href="/dashboard/orders" className="text-sm font-bold text-blue-700 hover:text-blue-800">View all</Link>
      </div>
      <div className="grid gap-3 p-3 md:hidden">
        {rows.map((order) => (
          <article key={order.id} className="mobile-order-card rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-400">{order.id}</p>
                <h4 className="mt-1 truncate text-sm font-bold text-slate-800">{order.service}</h4>
              </div>
              <StatusPill status={order.status} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
              <span>Qty {order.quantity}</span>
              <span>{order.date}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th className="px-5 py-4">ID</th><th className="px-5 py-4">Service</th><th className="px-5 py-4">Link</th><th className="px-5 py-4">Quantity</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {rows.map((order) => (
              <tr key={order.id} className="transition hover:bg-slate-50">
                <td className="px-5 py-4 font-bold text-slate-800">{order.id}</td>
                <td className="px-5 py-4 font-semibold text-slate-700">{order.service}</td>
                <td className="px-5 py-4 text-slate-500">{order.link}</td>
                <td className="px-5 py-4 text-slate-500">{order.quantity}</td>
                <td className="px-5 py-4"><StatusPill status={order.status} /></td>
                <td className="px-5 py-4 text-slate-500">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Surface>
  );
}

export function OverviewPage() {
  return (
    <div className="dashboard-overview mx-auto grid max-w-7xl gap-5 sm:gap-6">
      <MobileOverviewHeader />
      <DesktopOverviewHero />
      <StatGrid />
      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr] xl:gap-6">
        <RecentOrdersTable compact />
        <Surface className="hidden p-5 md:block">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100"><Layers3 className="h-5 w-5" /></div>
            <div><h3 className="text-lg font-bold tracking-tight text-slate-800">Quick Actions</h3><p className="text-sm text-slate-500">Jump into common workflows.</p></div>
          </div>
          <div className="mt-5 grid gap-3">
            <PrimaryButton href="/dashboard/boosting"><Zap className="h-4 w-4" /> Place boost order</PrimaryButton>
            <Link href={"/dashboard/rent-number" as any} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"><Smartphone className="h-4 w-4" /> Rent number</Link>
            <Link href="/dashboard/logs" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"><FileText className="h-4 w-4" /> Browse logs</Link>
          </div>
          <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950">PocketFi funding is intentionally paused. Wallet UI stays visible, but funding actions are held until activation.</div>
        </Surface>
      </section>
      <ServiceCards />
    </div>
  );
}

export function BoostingPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      <PageHeader eyebrow="Boosting" title="Boost your social media" description="Choose a platform first, then select the exact service you want to order." action={<StatusPill status="Live services" />} />
      <ServiceExplorer kind="boosting" mode="boosting" />
      <Surface className="border-amber-200 bg-amber-50 p-5 text-amber-950"><div className="flex items-start gap-3"><AlertCircle className="mt-0.5 h-5 w-5" /><p className="text-sm font-semibold leading-6">Make sure your account or post is public before ordering. For views, use the video link, not the profile link.</p></div></Surface>
    </div>
  );
}

function NumberPurchasePage({ premium = false, rent = false }: { premium?: boolean; rent?: boolean }) {
  const title = premium ? "USA Premium Numbers" : rent ? "Rent Number" : "Foreign Numbers";
  const description = premium ? "Search premium USA verification services, select one, and continue with a clear checkout panel." : "Choose a country, search SMSPool services, and rent a temporary verification number with live pricing.";
  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      <PageHeader eyebrow="Numbers" title={title} description={description} action={<StatusPill status="Live pricing" />} />
      <ServiceExplorer kind={premium ? "uk-premium" : "foreign-numbers"} mode="numbers" />
      <Surface className="border-amber-200 bg-amber-50 p-5 text-amber-950"><div className="flex items-start gap-3"><AlertCircle className="mt-0.5 h-5 w-5" /><p className="text-sm font-semibold leading-6">Numbers are time-sensitive. Request the SMS code immediately after generating your number.</p></div></Surface>
    </div>
  );
}

export function ForeignNumbersPage() { return <NumberPurchasePage rent />; }
export function RentNumberPage() { return <NumberPurchasePage rent />; }
export function UkPremiumPage() { return <NumberPurchasePage premium />; }

export function EsimPage() {
  return <div className="mx-auto grid max-w-7xl gap-6"><ServiceExplorer kind="esim" mode="esim" /></div>;
}

export function LogsPage() {
  return <div className="mx-auto grid max-w-7xl gap-6"><ServiceExplorer kind="logs" mode="logs" /></div>;
}

export function OrdersPage() {
  return <div className="mx-auto grid max-w-7xl gap-6"><PageHeader eyebrow="Orders" title="My orders" description="Track all boosting, number, log, and wallet activity from one table." action={<PrimaryButton href="/dashboard/boosting"><Package className="h-4 w-4" /> New order</PrimaryButton>} /><RecentOrdersTable /></div>;
}

export function WalletPage() {
  const walletRows = useMemo(() => [
    { item: "Wallet top-up", method: "PocketFi", amount: "+NGN 3,000", status: "Pending" },
    { item: "Instagram order", method: "Wallet", amount: "-NGN 900", status: "Paid" },
    { item: "OTP rental", method: "Wallet", amount: "-NGN 350", status: "Paid" }
  ], []);
  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      <PageHeader eyebrow="Wallet" title="Wallet funding" description="Funding remains on hold while PocketFi activation is pending. The interface is ready, but payment capture is intentionally paused." action={<StatusPill status="PocketFi on hold" />} />
      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Surface className="p-5"><div className="rounded-lg bg-blue-700 p-5 text-blue-50"><p className="text-sm font-semibold text-slate-300">Available balance</p><strong className="mt-2 block text-3xl font-bold tracking-tight">NGN 7,628.24</strong><p className="mt-3 text-sm leading-6 text-slate-300">Payment collection is paused. PocketFi is the planned funding gateway.</p></div><div className="mt-5 grid gap-4"><label className="grid gap-2 text-sm font-bold text-slate-700">Amount<input className="h-12 rounded-lg border border-slate-200 bg-slate-50 px-4" value="Funding paused" readOnly /></label><button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-200 px-4 text-sm font-bold text-slate-500" type="button" disabled><Wallet className="h-4 w-4" /> Funding Paused</button></div></Surface>
        <Surface className="overflow-hidden"><div className="border-b border-slate-200 px-5 py-4"><h3 className="text-lg font-bold tracking-tight text-slate-800">Wallet history</h3></div><div className="grid gap-3 p-4 md:hidden">{walletRows.map((row) => <article key={row.item} className="rounded-lg border border-slate-200 bg-slate-50 p-4"><div className="flex items-start justify-between gap-3"><div><h4 className="font-bold text-slate-800">{row.item}</h4><p className="mt-1 text-xs font-semibold text-slate-500">{row.method}</p></div><StatusPill status={row.status} /></div><p className="mt-3 text-lg font-bold text-slate-800">{row.amount}</p></article>)}</div><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[560px] border-collapse text-left"><thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-500"><tr><th className="px-5 py-4">Item</th><th className="px-5 py-4">Method</th><th className="px-5 py-4">Amount</th><th className="px-5 py-4">Status</th></tr></thead><tbody className="divide-y divide-slate-100 text-sm">{walletRows.map((row) => <tr key={row.item} className="transition hover:bg-slate-50"><td className="px-5 py-4 font-semibold text-slate-700">{row.item}</td><td className="px-5 py-4 text-slate-500">{row.method}</td><td className="px-5 py-4 font-bold text-slate-800">{row.amount}</td><td className="px-5 py-4"><StatusPill status={row.status} /></td></tr>)}</tbody></table></div></Surface>
      </section>
    </div>
  );
}

export function DashboardLoading() {
  return <div className="mx-auto grid max-w-7xl gap-4"><div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" /><div className="h-20 animate-pulse rounded-lg bg-slate-200" /><div className="grid gap-4 md:grid-cols-3"><div className="h-36 animate-pulse rounded-lg bg-slate-200" /><div className="h-36 animate-pulse rounded-lg bg-slate-200" /><div className="h-36 animate-pulse rounded-lg bg-slate-200" /></div></div>;
}
