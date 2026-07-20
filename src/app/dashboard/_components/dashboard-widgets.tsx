"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  ArrowRight,
  Bell,
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
import { useEffect, useState } from "react";
import { ServiceExplorer } from "./service-explorer";

type StatusTone = "success" | "warning" | "neutral" | "danger" | "info";


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
  { label: "Tutorials", href: "/dashboard/tutorials", icon: PlayCircle, tone: "indigo" },
  { label: "eSIM", href: "/dashboard/esim", icon: Smartphone, tone: "pink" }
];


function userDisplayName(user?: { name?: string | null; username?: string | null; email?: string | null }) {
  const value = user?.name || user?.username || user?.email?.split("@")[0] || "Acctrise user";
  return value.trim() || "Acctrise user";
}

function firstName(value: string) {
  return value.trim().split(/\s+/)[0] || "there";
}

function userInitial(value: string) {
  return (value.trim()[0] || "A").toUpperCase();
}
function useWalletBalance() {
  const [balance, setBalance] = useState("0.00");
  useEffect(() => {
    let active = true;
    fetch("/api/wallet/balance", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => { if (active && data?.wallet?.balance) setBalance(data.wallet.balance); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);
  return "NGN " + Number(balance).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
const mobileToneClasses: Record<string, string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  orange: "bg-orange-50 text-orange-700 ring-orange-100",
  teal: "bg-teal-50 text-teal-700 ring-teal-100",
  yellow: "bg-amber-50 text-amber-700 ring-amber-100",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  pink: "bg-pink-50 text-pink-700 ring-pink-100"
};


function orderIconFor(service: string) {
  const normalized = service.toLowerCase();
  if (normalized.includes("rental")) return Smartphone;
  if (normalized.includes("instagram") || normalized.includes("telegram")) return Rocket;
  if (normalized.includes("esim")) return Wifi;
  if (normalized.includes("log")) return FileText;
  return Package;
}
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

function MobileOverviewHeader({ displayName, balance }: { displayName: string; balance: string }) {
  return (
    <section className="mobile-overview md:hidden" aria-label="Mobile dashboard summary">
      <div className="mobile-overview-top">
        <div className="mobile-avatar">{userInitial(displayName)}</div>
        <div>
          <span>Welcome back</span>
          <strong>{displayName}</strong>
        </div>
        <button className="mobile-bell" type="button" aria-label="Notifications"><Bell className="h-4 w-4" /></button>
      </div>

      <div className="mobile-balance-card">
        <div>
          <span>Total Balance</span>
          <strong>{balance}</strong>
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

function DesktopOverviewHero({ displayName, balance }: { displayName: string; balance: string }) {
  return (
    <section className="hidden md:block">
      <Surface className="desktop-overview-hero overflow-hidden p-6">
        <div className="desktop-overview-card">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Dashboard</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">Welcome back, {firstName(displayName)}</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Track balance, orders, and service shortcuts without digging through menus.</p>
          </div>
        </div>
        <div className="desktop-overview-metrics mt-6 grid gap-3 sm:grid-cols-3">
          <Link href="/dashboard/wallet" className="desktop-balance-tile rounded-lg p-4"><span className="text-xs font-bold uppercase tracking-[0.12em]">Balance</span><strong className="mt-2 block text-2xl tracking-tight">{balance}</strong></Link>
          <Link href="/dashboard/orders" className="desktop-orders-tile rounded-lg p-4"><span className="text-xs font-bold uppercase tracking-[0.12em]">Orders</span><strong className="mt-2 block text-2xl tracking-tight">20</strong></Link>
          <Link href="#services" className="desktop-services-tile rounded-lg p-4"><span className="text-xs font-bold uppercase tracking-[0.12em]">Services</span><strong className="mt-2 block text-2xl tracking-tight">620+</strong><small className="mt-1 block text-xs font-bold">Available now</small></Link>
        </div>
      </Surface>
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

function EsimOrderDetails({ fulfillment }: { fulfillment?: Record<string, unknown> | null }) {
  if (!fulfillment?.ac && !fulfillment?.activationCode) return null;
  const fields = [
    ["Activation string", fulfillment.ac],
    ["SM-DP+ address", fulfillment.smdp],
    ["Activation code", fulfillment.activationCode],
    ["APN", fulfillment.apn],
    ["PIN", fulfillment.pin],
    ["PUK", fulfillment.puk],
    ["Remaining data", fulfillment.remainingData],
    ["Total data", fulfillment.totalData]
  ].filter((entry) => entry[1] !== undefined && entry[1] !== null && entry[1] !== "");
  return <details className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3"><summary className="cursor-pointer text-xs font-black text-emerald-800">View eSIM activation details</summary><dl className="mt-3 grid gap-2">{fields.map(([label, value]) => <div key={String(label)} className="rounded-md bg-white p-2"><dt className="text-xs font-bold text-emerald-700">{String(label)}</dt><dd className="mt-1 break-all text-xs font-semibold text-slate-900">{String(value)}</dd></div>)}</dl></details>;
}

function RecentOrdersTable({ compact = false }: { compact?: boolean }) {
  const [orders, setOrders] = useState<Array<{ id: string; orderNumber: string; serviceName: string; targetUrl?: string | null; quantity: number; status: string; statusMessage?: string | null; createdAt: string; fulfillment?: ({ accounts?: string[]; number?: string | number; phonenumber?: string | number } & Record<string, unknown>) | null }>>([]);
  useEffect(() => {
    let active = true;
    const load = () => fetch("/api/orders?limit=" + (compact ? "3" : "50"), { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => { if (active && Array.isArray(data?.data)) setOrders(data.data); })
      .catch(() => undefined);
    load();
    const timer = window.setInterval(load, 10000);
    return () => { active = false; window.clearInterval(timer); };
  }, [compact]);
  const rows = orders.map((order) => {
    const created = new Date(order.createdAt);
    return { id: order.orderNumber, service: order.serviceName, link: order.targetUrl || "-", quantity: String(order.quantity), status: order.status, statusMessage: order.statusMessage || (order.status === "PROCESSING" ? "Waiting for SMS..." : ""), number: order.fulfillment?.number || order.fulfillment?.phonenumber || null, date: created.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" }), time: created.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" }), accounts: order.fulfillment?.accounts || [], fulfillment: order.fulfillment || null };
  });
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
        {rows.map((order) => {
          const OrderIcon = orderIconFor(order.service);
          return (
            <article key={order.id} className="mobile-order-card rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <span className="order-service-icon"><OrderIcon className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-400">{order.id}</p>
                  <h4 className="mt-1 truncate text-sm font-bold text-slate-800">{order.service}</h4>
                </div>
                <StatusPill status={order.status} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
                <span>Qty {order.quantity}</span>
                <span>{order.date} - {order.time}</span>
              </div>
              {order.number ? <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3"><span className="text-xs font-bold text-blue-600">Phone number</span><strong className="mt-1 block text-base text-blue-950">{order.number}</strong><p className="mt-1 text-xs font-semibold text-blue-700">{order.statusMessage || "Waiting for SMS..."}</p></div> : null}
              {order.accounts.length ? <details className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3"><summary className="cursor-pointer text-xs font-black text-emerald-800">View delivered account</summary><div className="mt-2 grid gap-2">{order.accounts.map((account, index) => <pre key={index} className="whitespace-pre-wrap break-all rounded-md bg-white p-2 text-xs text-slate-800">{account}</pre>)}</div></details> : null}
              <EsimOrderDetails fulfillment={order.fulfillment} />
            </article>
          );
        })}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th className="px-5 py-4">ID</th><th className="px-5 py-4">Service</th><th className="px-5 py-4">Link</th><th className="px-5 py-4">Quantity</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {rows.map((order) => {
              const OrderIcon = orderIconFor(order.service);
              return (
                <tr key={order.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4 font-bold text-slate-800">{order.id}</td>
                  <td className="px-5 py-4 font-semibold text-slate-700"><span className="inline-flex items-center gap-3"><span className="order-service-icon"><OrderIcon className="h-4 w-4" /></span>{order.service}</span>{order.number ? <div className="mt-2 rounded-md bg-blue-50 p-2 text-xs"><span className="font-bold text-blue-600">Number</span><strong className="ml-2 text-blue-950">{order.number}</strong><p className="mt-1 font-semibold text-blue-700">{order.statusMessage || "Waiting for SMS..."}</p></div> : null}{order.accounts.length ? <details className="mt-2"><summary className="cursor-pointer text-xs font-black text-emerald-700">View delivered account</summary><div className="mt-2 grid gap-2">{order.accounts.map((account, index) => <pre key={index} className="max-w-md whitespace-pre-wrap break-all rounded-md bg-emerald-50 p-2 text-xs text-slate-800">{account}</pre>)}</div></details> : null}<EsimOrderDetails fulfillment={order.fulfillment} /></td>
                  <td className="px-5 py-4 text-slate-500">{order.link}</td>
                  <td className="px-5 py-4 text-slate-500">{order.quantity}</td>
                  <td className="px-5 py-4"><StatusPill status={order.status} /></td>
                  <td className="px-5 py-4 text-slate-500"><span className="block font-bold text-slate-700">{order.date}</span><span className="text-xs font-semibold text-slate-400">{order.time}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Surface>
  );
}
export function OverviewPage() {
  const sessionResult = useSession();
  const displayName = userDisplayName(sessionResult?.data?.user);
  const balance = useWalletBalance();

  return (
    <div className="dashboard-overview mx-auto grid max-w-7xl gap-5 sm:gap-6">
      <MobileOverviewHeader displayName={displayName} balance={balance} />
      <DesktopOverviewHero displayName={displayName} balance={balance} />
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
      <div className="hidden md:block">
        <ServiceCards />
      </div>
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

type DedicatedAccount = { accountName: string; accountNumber: string; bankName: string; bankCode?: string | null };
type MissingProfile = { firstName: boolean; lastName: boolean };
function DedicatedAccountCard() {
  const [account, setAccount] = useState<DedicatedAccount | null>(null);
  const [missing, setMissing] = useState<MissingProfile | null>(null);
  const [profile, setProfile] = useState({ firstName: "", lastName: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  async function provision(details: Record<string, string> = {}) {
    const response = await fetch("/api/wallet/virtual-account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(details) });
    const body = await response.json();
    if (response.status === 409) { setMissing(body.missingProfile || null); setNotice(body.error || "Complete your profile."); return; }
    if (!response.ok) throw new Error(body.error || "Your dedicated account is still being prepared.");
    setAccount(body.account); setMissing(null); setNotice("");
  }
  useEffect(() => {
    let active = true;
    async function load() {
      try { const response = await fetch("/api/wallet/virtual-account", { cache: "no-store" }); const body = await response.json(); if (!active) return; if (body?.account) setAccount(body.account); else { setMissing(body.missingProfile || null); if (!Object.values(body.missingProfile || {}).some(Boolean)) await provision(); } }
      catch (error) { if (active) setNotice(error instanceof Error ? error.message : "Your dedicated account is still being prepared."); }
      finally { if (active) setLoading(false); }
    }
    load(); return () => { active = false; };
  }, []);
  async function completeProfile() { setSaving(true); setNotice(""); try { await provision(profile); } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to complete account setup."); } finally { setSaving(false); } }
  async function copyNumber() { if (!account) return; await navigator.clipboard.writeText(account.accountNumber); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }
  const needsProfile = missing && Object.values(missing).some(Boolean);
  return <Surface className="overflow-hidden"><div className="h-1 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">Fund wallet with virtual account</p><h3 className="mt-2 text-xl font-bold text-slate-900">Your dedicated funding account</h3><p className="mt-2 text-sm leading-6 text-slate-500">Transfer funds to this account whenever you want to fund your Acctrise wallet.</p></div><StatusPill status={account ? "Active" : "PocketFi"} /></div>{loading ? <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm font-semibold text-slate-500">Preparing your dedicated account...</div> : account ? <div className="mt-5 grid gap-4"><div className="grid gap-3 sm:grid-cols-2"><div><span className="text-xs font-bold text-slate-400">Account name</span><strong className="mt-1 block text-slate-900">{account.accountName.replace(/\s*\([^)]*\)\s*$/, "")}</strong></div><div><span className="text-xs font-bold text-slate-400">Bank name</span><strong className="mt-1 block text-slate-900">{account.bankName}</strong></div></div><div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-slate-950 p-5 text-white"><div><span className="text-xs font-bold text-slate-400">Account number</span><strong className="mt-1 block text-2xl tracking-widest sm:text-3xl">{account.accountNumber}</strong></div><button type="button" onClick={copyNumber} className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-900">{copied ? "Copied" : "Copy"}</button></div><div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm font-semibold leading-6 text-blue-900">This live account was generated from your verified profile and is unique to your wallet.</div></div> : needsProfile ? <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4"><h4 className="font-bold text-amber-950">Complete your profile once</h4><p className="mt-1 text-sm text-amber-900">PocketFi requires your missing name details before it can issue a real bank account.</p><div className="mt-4 grid gap-3 sm:grid-cols-3">{missing.firstName ? <input value={profile.firstName} onChange={(e) => setProfile((v) => ({ ...v, firstName: e.target.value }))} className="h-11 rounded-lg border border-amber-200 bg-white px-3" placeholder="First name" /> : null}{missing.lastName ? <input value={profile.lastName} onChange={(e) => setProfile((v) => ({ ...v, lastName: e.target.value }))} className="h-11 rounded-lg border border-amber-200 bg-white px-3" placeholder="Last name" /> : null}<button type="button" onClick={completeProfile} disabled={saving} className="h-11 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white disabled:bg-slate-300 sm:col-span-3">{saving ? "Generating account..." : "Save details"}</button></div>{notice ? <p className="mt-3 text-sm font-semibold text-amber-900">{notice}</p> : null}</div> : <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">{notice || "Your dedicated account is being prepared. Refresh shortly or contact support."}</div>}</div></Surface>;
}
export function WalletPage() {
  
  const [walletRows, setWalletRows] = useState<Array<{ id: string; description?: string | null; paymentMethod?: string | null; amount: string; status: string; type: string; createdAt: string }>>([]);
  useEffect(() => {
    fetch("/api/wallet/transactions?limit=20", { cache: "no-store" }).then((response) => response.json()).then((body) => { if (Array.isArray(body?.transactions)) setWalletRows(body.transactions); }).catch(() => undefined);
  }, []);
  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      <PageHeader eyebrow="Wallet" title="Wallet funding" description="Fund your wallet through your dedicated bank account. Your balance updates after payment confirmation." />
      <DedicatedAccountCard />
      <section>
        <Surface className="overflow-hidden"><div className="border-b border-slate-200 px-5 py-4"><h3 className="text-lg font-bold tracking-tight text-slate-800">Wallet history</h3></div>{!walletRows.length ? <div className="p-6 text-sm font-semibold text-slate-500">No wallet transactions yet.</div> : <div className="grid gap-3 p-4">{walletRows.map((row) => <article key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4"><div><h4 className="font-bold text-slate-800">{row.description || row.type.replaceAll("_", " ")}</h4><p className="mt-1 text-xs font-semibold text-slate-500">{row.paymentMethod || "Wallet"} · {new Date(row.createdAt).toLocaleString("en-NG")}</p></div><div className="text-right"><p className={`font-black ${row.type === "DEPOSIT" ? "text-emerald-700" : "text-slate-800"}`}>{row.type === "DEPOSIT" ? "+" : "-"}NGN {Number(row.amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</p><div className="mt-1"><StatusPill status={row.status} /></div></div></article>)}</div>}</Surface>
      </section>
    </div>
  );
}
export function DashboardLoading() {
  return <div className="mx-auto grid max-w-7xl gap-4"><div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" /><div className="h-20 animate-pulse rounded-lg bg-slate-200" /><div className="grid gap-4 md:grid-cols-3"><div className="h-36 animate-pulse rounded-lg bg-slate-200" /><div className="h-36 animate-pulse rounded-lg bg-slate-200" /><div className="h-36 animate-pulse rounded-lg bg-slate-200" /></div></div>;
}
