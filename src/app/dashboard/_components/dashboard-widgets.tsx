"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  FileText,
  Globe2,
  Layers3,
  Loader2,
  Package,
  Phone,
  Play,
  RefreshCw,
  Rocket,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Users,
  Video,
  Wallet,
  Wifi,
  Zap
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { AnimatedGlobe } from "./animated-globe";
import { LiveServicesPanel } from "./live-services-panel";

type IconType = ComponentType<{ className?: string }>;
type StatusTone = "success" | "warning" | "neutral" | "danger" | "info";

type ProviderStatus = {
  id: string;
  name: string;
  envKey: string;
  configured: boolean;
  status: "configured" | "missing" | "active" | "error";
  message: string;
  lastCheck: string | null;
};

const stats = [
  { label: "Available Balance", value: "NGN 7,628.24", detail: "+15% deposit bonus", icon: Wallet, tone: "blue" },
  { label: "Total Spent", value: "NGN 5,599.76", detail: "Lifetime expenditure", icon: ArrowUpRight, tone: "violet" },
  { label: "Active Orders", value: "0", detail: "Currently processing", icon: Clock3, tone: "amber" },
  { label: "Total Orders", value: "20", detail: "Lifetime orders", icon: CheckCircle2, tone: "green" }
];

const serviceCards = [
  { title: "Boost Account", href: "/dashboard/boosting", detail: "Social growth services from Reseller SMM.", icon: Rocket, meta: "Fast campaigns" },
  { title: "Buy Logs", href: "/dashboard/logs", detail: "Bulkacc inventory, account logs, and sync records.", icon: FileText, meta: "Bulkacc" },
  { title: "Foreign Numbers", href: "/dashboard/foreign-numbers", detail: "Temporary SMS numbers for app verification.", icon: Smartphone, meta: "SMSPool" },
  { title: "UK Premium", href: "/dashboard/uk-premium", detail: "Premium UK numbers for higher-trust verification.", icon: Phone, meta: "SMSPool" },
  { title: "Buy eSIM", href: "/dashboard/esim", detail: "Travel data plans and eSIM inventory path.", icon: Wifi, meta: "On hold" },
  { title: "Wallet", href: "/dashboard/wallet", detail: "Funding is paused while PocketFi activation is pending.", icon: Wallet, meta: "PocketFi planned" }
];

const socialTabs = [
  { label: "All", icon: ShoppingBag },
  { label: "Facebook", icon: Users },
  { label: "Instagram", icon: Camera },
  { label: "WhatsApp", icon: Phone },
  { label: "TikTok", icon: Play },
  { label: "Spotify", icon: Wifi },
  { label: "Youtube", icon: Video },
  { label: "Telegram", icon: Send },
  { label: "Twitter", icon: Globe2 },
  { label: "LinkedIn", icon: BriefcaseBusiness }
];

const boostCategories = [
  "Instagram Followers",
  "Instagram Likes",
  "TikTok Views",
  "Telegram Members",
  "YouTube Watch Time",
  "WhatsApp Channel Boost"
];

const recentOrders = [
  { id: "#560431", service: "Rental: 2RedBeans", link: "-", quantity: "1", status: "Cancelled", date: "Jul 2, 2026" },
  { id: "#546411", service: "Rental: Snapchat", link: "-", quantity: "1", status: "Cancelled", date: "Jul 2, 2026" },
  { id: "#545167", service: "Instagram Likes", link: "instagram.com/post", quantity: "500", status: "Completed", date: "Jul 1, 2026" },
  { id: "#544373", service: "Telegram Members", link: "t.me/channel", quantity: "250", status: "Processing", date: "Jun 30, 2026" }
];

const logRows = [
  { id: "LOG-2041", provider: "Bulkacc", task: "Account import", status: "Completed", date: "Jul 2, 2026" },
  { id: "LOG-2037", provider: "SMSPool", task: "Number sync", status: "Live", date: "Jul 2, 2026" },
  { id: "LOG-2032", provider: "Bulkacc", task: "Usage report", status: "Pending", date: "Jul 1, 2026" },
  { id: "LOG-2028", provider: "SMSPool", task: "UK premium batch", status: "Completed", date: "Jun 30, 2026" }
];

const numberServices = ["WhatsApp", "Telegram", "Snapchat", "Google", "Instagram", "2RedBeans"];
const countries = ["United States", "United Kingdom", "Canada", "Poland", "Brazil", "Germany", "France"];

const activeNumbers = [
  { type: "Virtual Number", region: "United States", service: "Telegram", number: "+1 787 222 2812", status: "Completed", expires: "15 minutes" },
  { type: "UK Premium", region: "United Kingdom", service: "WhatsApp", number: "+44 7400 330122", status: "Waiting", expires: "12 minutes" }
];


const toneClasses: Record<string, string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100"
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

function StatGrid() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {serviceCards.map((service) => (
        <Link key={service.href} href={service.href as any} className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <service.icon className="h-5 w-5" />
            </div>
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{service.meta}</span>
          </div>
          <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-800">{service.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{service.detail}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-700 group-hover:text-blue-800">
            Open service <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      ))}
    </section>
  );
}

function RecentOrdersTable({ compact = false }: { compact?: boolean }) {
  const rows = compact ? recentOrders.slice(0, 3) : recentOrders;
  return (
    <Surface className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-slate-800">Recent Orders</h3>
          <p className="text-sm text-slate-500">Latest wallet and service activity.</p>
        </div>
        <Link href="/dashboard/orders" className="text-sm font-bold text-blue-700 hover:text-blue-800">View all</Link>
      </div>
      <div className="overflow-x-auto">
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

function EmptyState({ icon: Icon, title, description, action }: { icon: IconType; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-bold tracking-tight text-slate-800">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function OverviewPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr] xl:items-stretch">
        <Surface className="p-5 sm:p-6">
          <PageHeader eyebrow="Overview" title="Your Acctrise workspace" description="A live command center for boosting, logs, numbers, eSIM, orders, and wallet funding. Clean enough for daily use, detailed enough for provider-backed operations." action={<PrimaryButton href="/dashboard/boosting"><Rocket className="h-4 w-4" /> New boost order</PrimaryButton>} />
          <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
            <span className="rounded-md bg-blue-50 px-3 py-2 text-blue-700 ring-1 ring-blue-100">Provider-backed services</span>
            <span className="rounded-md bg-emerald-50 px-3 py-2 text-emerald-700 ring-1 ring-emerald-100">Light mode console</span>
            <span className="rounded-md bg-slate-100 px-3 py-2 text-slate-700 ring-1 ring-slate-200">Mobile ready</span>
          </div>
        </Surface>
        <AnimatedGlobe />
      </section>
      <StatGrid />
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <RecentOrdersTable compact />
        <Surface className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100"><Layers3 className="h-5 w-5" /></div>
            <div><h3 className="text-lg font-bold tracking-tight text-slate-800">Quick Actions</h3><p className="text-sm text-slate-500">Jump into common workflows.</p></div>
          </div>
          <div className="mt-5 grid gap-3">
            <PrimaryButton href="/dashboard/boosting"><Zap className="h-4 w-4" /> Place boost order</PrimaryButton>
            <Link href="/dashboard/foreign-numbers" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"><Smartphone className="h-4 w-4" /> Buy number</Link>
            <Link href="/dashboard/logs" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"><FileText className="h-4 w-4" /> View provider logs</Link>
          </div>
          <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950">PocketFi funding is intentionally paused. Wallet UI stays visible, but funding actions are held until activation.</div>
        </Surface>
      </section>
      <ServiceCards />
    </div>
  );
}

export function BoostingPage() {
  const [activeSocial, setActiveSocial] = useState("All");
  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      <PageHeader eyebrow="Boosting" title="Boost your social media" description="Choose a network, inspect live Reseller SMM inventory, paste the right link, and submit cleanly." action={<StatusPill status="Reseller SMM" />} />
      <LiveServicesPanel kind="boosting" title="Live boosting services" description="Fetched directly from Reseller SMM. Refresh to see the latest provider inventory before ordering." limit={9} />
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Surface className="p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {socialTabs.map((tab) => (
              <button key={tab.label} type="button" onClick={() => setActiveSocial(tab.label)} className={`grid min-h-20 place-items-center rounded-lg border px-2 py-3 text-center text-sm font-bold transition ${activeSocial === tab.label ? "border-blue-600 bg-blue-600 text-blue-50 shadow-sm shadow-blue-600/20" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"}`}>
                <tab.icon className="mb-2 h-5 w-5" />{tab.label}
              </button>
            ))}
          </div>
          <div className="mt-6 grid gap-4">
            <label className="relative block"><Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Search services..." /></label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-slate-700">Category<span className="relative"><select className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" defaultValue=""><option value="" disabled>Choose a category...</option>{boostCategories.map((category) => <option key={category}>{category}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /></span></label>
              <label className="grid gap-2 text-sm font-bold text-slate-700">Link<input className="h-12 rounded-lg border border-slate-200 bg-white px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Paste profile or post link" /></label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-slate-700">Quantity<input className="h-12 rounded-lg border border-slate-200 bg-white px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" type="number" min="1" placeholder="1000" /></label>
              <label className="grid gap-2 text-sm font-bold text-slate-700">Estimated price<input className="h-12 rounded-lg border border-slate-200 bg-slate-50 px-4 font-bold text-slate-700" value="Calculated after service selection" readOnly /></label>
            </div>
            <PrimaryButton><Zap className="h-4 w-4" /> Place Boost Order</PrimaryButton>
          </div>
        </Surface>
        <div className="grid gap-4">
          <Surface className="p-5"><div className="flex items-center gap-3"><AlertCircle className="h-6 w-6 text-blue-600" /><h3 className="text-xl font-bold tracking-tight text-slate-800">Important Information</h3></div><ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-600"><li>Make sure the account is public before ordering.</li><li>Do not place two orders for the same link at the same time.</li><li>Wrong links cannot be refunded or cancelled after submission.</li><li>For views boosting, enter the video link, not the profile link.</li></ul></Surface>
          <Surface className="border-amber-200 bg-amber-50 p-5 text-amber-950"><div className="flex items-start gap-3"><AlertCircle className="mt-0.5 h-5 w-5" /><p className="text-sm font-semibold leading-6">Drip-feed is currently disabled for maintenance. Standard delivery is working normally.</p></div></Surface>
          <Surface className="p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold tracking-tight text-slate-800">Service quality tiers</h3><p className="text-sm text-slate-500">Basic, Medium, and Elite categorization for service quality.</p></div><button className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-bold text-blue-700 transition hover:bg-blue-50" type="button">See details</button></div></Surface>
        </div>
      </section>
    </div>
  );
}

function NumberPurchasePage({ premium = false }: { premium?: boolean }) {
  const [service, setService] = useState("");
  const title = premium ? "UK Premium Numbers" : "Foreign Numbers";
  const description = premium ? "Premium UK inventory for services that need a higher-trust region. Numbers remain time-bound and easy to track." : "Temporary international phone numbers for fast SMS verification across major services.";
  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      <PageHeader eyebrow="Numbers" title={title} description={description} action={<StatusPill status="SMSPool" />} />
      <LiveServicesPanel kind={premium ? "uk-premium" : "foreign-numbers"} title={premium ? "Live UK premium inventory" : "Live foreign number inventory"} description="Fetched directly from SMSPool. Availability and pricing come from the provider response." limit={9} />
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Surface className="p-5">
          <div className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <label className="grid gap-2 text-sm font-bold text-slate-700">Select Service<span className="relative"><select className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={service} onChange={(event) => setService(event.target.value)}><option value="" disabled>Select a service...</option>{numberServices.map((item) => <option key={item}>{item}</option>)}</select><Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /></span></label>
            {!premium ? <label className="grid gap-2 text-sm font-bold text-slate-700">Country<span className="relative"><select className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" defaultValue=""><option value="" disabled>Choose country...</option>{countries.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /></span></label> : null}
            <PrimaryButton><Zap className="h-4 w-4" /> Buy Number</PrimaryButton>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">Numbers are valid for 15 minutes. Request the SMS code immediately after generating the number.</div>
          </div>
        </Surface>
        <Surface className="p-5">
          <div className="flex items-center justify-between gap-3"><div><h3 className="text-lg font-bold tracking-tight text-slate-800">Active Numbers</h3><p className="text-sm text-slate-500">Waiting and completed number rentals.</p></div><StatusPill status="Live" /></div>
          <div className="mt-4 grid gap-3">
            {activeNumbers.filter((item) => premium ? item.type === "UK Premium" : item.type !== "UK Premium").map((item) => (
              <div key={item.number} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><Phone className="h-5 w-5 text-blue-600" /><div><p className="font-bold text-slate-800">{item.type}</p><p className="text-xs font-bold text-slate-500">{item.service} - {item.region}</p></div></div><StatusPill status={item.status} /></div>
                <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-white px-4 py-3 ring-1 ring-slate-200"><span className="truncate text-lg font-bold tracking-tight text-blue-700 sm:text-xl">{item.number}</span><button className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50" aria-label="Copy number" type="button"><Copy className="h-5 w-5" /></button></div>
                <p className="mt-3 text-xs font-semibold text-slate-500">Expires in {item.expires}</p>
              </div>
            ))}
          </div>
        </Surface>
      </section>
    </div>
  );
}

export function ForeignNumbersPage() { return <NumberPurchasePage />; }
export function UkPremiumPage() { return <NumberPurchasePage premium />; }

export function EsimPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      <PageHeader eyebrow="eSIM" title="Buy eSIM plans" description="Fetch eSIM-capable services from the configured SMSPool provider and show clean states when inventory is unavailable." action={<StatusPill status="SMSPool" />} />
      <LiveServicesPanel kind="esim" title="Live eSIM services" description="Fetched directly from SMSPool and filtered for eSIM/data-plan inventory." />
    </div>
  );
}

export function LogsPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      <PageHeader eyebrow="Logs" title="Provider logs" description="Track Bulkacc and SMSPool operational activity without exposing provider secrets." action={<PrimaryButton><RefreshCw className="h-4 w-4" /> Sync logs</PrimaryButton>} />
      <ProviderDiagnostics />
      <LiveServicesPanel kind="logs" title="Live Bulkacc services" description="Fetched directly from Bulkacc so logs and account products come from the provider response." />
      <Surface className="overflow-hidden"><div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4"><div><h3 className="text-lg font-bold tracking-tight text-slate-800">Recent provider events</h3><p className="text-sm text-slate-500">Safe operational history view.</p></div><StatusPill status="Protected" /></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] border-collapse text-left"><thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-500"><tr><th className="px-5 py-4">Log</th><th className="px-5 py-4">Provider</th><th className="px-5 py-4">Task</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Date</th></tr></thead><tbody className="divide-y divide-slate-100 text-sm">{logRows.map((row) => <tr key={row.id} className="transition hover:bg-slate-50"><td className="px-5 py-4 font-bold text-slate-800">{row.id}</td><td className="px-5 py-4 font-semibold text-slate-700">{row.provider}</td><td className="px-5 py-4 text-slate-500">{row.task}</td><td className="px-5 py-4"><StatusPill status={row.status} /></td><td className="px-5 py-4 text-slate-500">{row.date}</td></tr>)}</tbody></table></div></Surface>
    </div>
  );
}

function ProviderDiagnostics() {
  const [status, setStatus] = useState<"loading" | "ready" | "forbidden" | "error">("loading");
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [message, setMessage] = useState("Checking protected diagnostics...");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/admin/providers/status", { cache: "no-store" });
        if (cancelled) return;
        if (response.status === 403) {
          setStatus("forbidden");
          setMessage("Provider diagnostics are admin-only. The dashboard keeps secrets protected for customer accounts.");
          return;
        }
        if (!response.ok) throw new Error(`Status request failed with ${response.status}`);
        const payload = await response.json();
        setProviders(payload.providers || []);
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Unable to load provider diagnostics.");
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (status === "loading") return <Surface className="p-5"><div className="flex items-center gap-3 text-sm font-semibold text-slate-600"><Loader2 className="h-5 w-5 animate-spin text-blue-600" /> {message}</div></Surface>;
  if (status !== "ready") return <EmptyState icon={ShieldCheck} title={status === "forbidden" ? "Admin-only diagnostics" : "Provider diagnostics unavailable"} description={message} />;
  return <section className="grid gap-4 md:grid-cols-3">{providers.map((provider) => <Surface key={provider.id} className="p-5"><div className="flex items-start justify-between gap-3"><div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100"><ShieldCheck className="h-5 w-5" /></div><StatusPill status={provider.status} /></div><h3 className="mt-5 text-lg font-bold tracking-tight text-slate-800">{provider.name}</h3><p className="mt-2 text-sm font-semibold text-slate-500">{provider.envKey}</p><p className="mt-3 text-sm leading-6 text-slate-600">{provider.message}</p></Surface>)}</section>;
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
        <Surface className="overflow-hidden"><div className="border-b border-slate-200 px-5 py-4"><h3 className="text-lg font-bold tracking-tight text-slate-800">Wallet history</h3></div><div className="overflow-x-auto"><table className="w-full min-w-[560px] border-collapse text-left"><thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-500"><tr><th className="px-5 py-4">Item</th><th className="px-5 py-4">Method</th><th className="px-5 py-4">Amount</th><th className="px-5 py-4">Status</th></tr></thead><tbody className="divide-y divide-slate-100 text-sm">{walletRows.map((row) => <tr key={row.item} className="transition hover:bg-slate-50"><td className="px-5 py-4 font-semibold text-slate-700">{row.item}</td><td className="px-5 py-4 text-slate-500">{row.method}</td><td className="px-5 py-4 font-bold text-slate-800">{row.amount}</td><td className="px-5 py-4"><StatusPill status={row.status} /></td></tr>)}</tbody></table></div></Surface>
      </section>
    </div>
  );
}

export function DashboardLoading() {
  return <div className="mx-auto grid max-w-7xl gap-4"><div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" /><div className="h-20 animate-pulse rounded-lg bg-slate-200" /><div className="grid gap-4 md:grid-cols-3"><div className="h-36 animate-pulse rounded-lg bg-slate-200" /><div className="h-36 animate-pulse rounded-lg bg-slate-200" /><div className="h-36 animate-pulse rounded-lg bg-slate-200" /></div></div>;
}



