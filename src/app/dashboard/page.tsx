"use client";

import {
  AlertCircle,
  ArrowUpRight,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  FileText,
  Globe2,
  Package,
  Phone,
  Play,
  Rocket,
  Search,
  Send,
  ShoppingBag,
  Smartphone,
  Users,
  Video,
  Wallet,
  Wifi,
  Zap
} from "lucide-react";
import { useState } from "react";

const stats = [
  { label: "Available Balance", value: "NGN 7,628.24", detail: "+15% deposit bonus", icon: Wallet, tone: "blue" },
  { label: "Total Spent", value: "NGN 5,599.76", detail: "Lifetime expenditure", icon: ArrowUpRight, tone: "violet" },
  { label: "Active Orders", value: "0", detail: "Currently processing", icon: Clock3, tone: "amber" },
  { label: "Total Orders", value: "20", detail: "Lifetime orders", icon: CheckCircle2, tone: "green" }
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

const recentOrders = [
  { id: "#560431", service: "Rental: 2RedBeans", link: "-", quantity: "1", status: "Cancelled", date: "Jul 2, 2026" },
  { id: "#546411", service: "Rental: Snapchat", link: "-", quantity: "1", status: "Cancelled", date: "Jul 2, 2026" },
  { id: "#545167", service: "Instagram Likes", link: "instagram.com/post", quantity: "500", status: "Completed", date: "Jul 1, 2026" },
  { id: "#544373", service: "Telegram Members", link: "t.me/channel", quantity: "250", status: "Processing", date: "Jun 30, 2026" }
];

const activeNumbers = [
  { type: "Virtual Number", region: "United States", number: "+1 787 222 2812", status: "completed" },
  { type: "UK Premium", region: "United Kingdom", number: "+44 7400 330122", status: "waiting" }
];

const providerCards = [
  { title: "Bulkacc logs", provider: "Bulkacc", detail: "Account logs and usage history", status: "Configured", icon: FileText },
  { title: "SMS verification", provider: "SMSPool", detail: "Foreign, rental, and UK premium numbers", status: "Configured", icon: Smartphone },
  { title: "Boosting", provider: "Reseller SMM", detail: "Social media growth services", status: "Configured", icon: Rocket }
];

const toneClasses: Record<string, string> = {
  blue: "bg-blue-50 text-blue-700",
  violet: "bg-violet-50 text-violet-700",
  amber: "bg-amber-50 text-amber-700",
  green: "bg-emerald-50 text-emerald-700"
};

function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const styles = normalized === "completed" || normalized === "configured"
    ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
    : normalized === "processing" || normalized === "waiting"
      ? "bg-amber-50 text-amber-700 ring-amber-100"
      : "bg-slate-100 text-slate-600 ring-slate-200";

  return <span className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-bold ring-1 ${styles}`}>{status}</span>;
}

export default function DashboardPage() {
  const [activeSocial, setActiveSocial] = useState("All");
  const [numberType, setNumberType] = useState<"foreign" | "uk">("foreign");

  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">Dashboard Overview</h2>
          <p className="mt-2 text-base font-medium text-slate-500">Manage boosting, logs, virtual numbers, UK premium numbers, eSIM, and wallet funding from one clean workspace.</p>
        </div>
        <button className="inline-flex h-12 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white shadow-sm hover:bg-blue-700">
          <Package className="h-5 w-5" />
          My Orders
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className={`grid h-12 w-12 place-items-center rounded-lg ${toneClasses[stat.tone]}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold uppercase text-slate-400">Live</span>
            </div>
            <p className="mt-5 text-sm font-bold text-slate-500">{stat.label}</p>
            <strong className="mt-2 block text-3xl font-black tracking-normal text-slate-950">{stat.value}</strong>
            <span className="mt-2 block text-sm font-semibold text-emerald-600">{stat.detail}</span>
          </article>
        ))}
      </section>

      <section id="boosting" className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-blue-700">
              <Rocket className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-normal">Boost Account</h3>
              <p className="text-sm font-medium text-slate-500">Powered by Reseller SMM</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {socialTabs.map((tab) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActiveSocial(tab.label)}
                className={`grid min-h-20 place-items-center rounded-lg border px-2 py-3 text-center text-sm font-bold transition ${
                  activeSocial === tab.label
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                <tab.icon className="mb-2 h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-4">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input className="h-14 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-base outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Search services..." />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Category
                <span className="relative">
                  <select className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" defaultValue="">
                    <option value="" disabled>Choose a category...</option>
                    <option>Instagram Followers</option>
                    <option>TikTok Views</option>
                    <option>Telegram Members</option>
                    <option>YouTube Watch Time</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                </span>
              </label>
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Link
                <input className="h-12 rounded-lg border border-slate-200 bg-white px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Paste profile or post link" />
              </label>
            </div>
            <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-base font-black text-white shadow-sm hover:bg-blue-700">
              <Zap className="h-5 w-5" />
              Place Boost Order
            </button>
          </div>
        </article>

        <div className="grid gap-4">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-black tracking-normal">Important Information</h3>
            </div>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-600">
              <li>Make sure the account is public before ordering.</li>
              <li>Do not place two orders for the same link at the same time.</li>
              <li>Wrong links cannot be refunded or cancelled after submission.</li>
              <li>For views boosting, enter the video link, not the profile link.</li>
            </ul>
          </article>

          <article className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5" />
              <p className="text-sm font-semibold leading-6">Drip-feed is currently disabled for maintenance. Standard delivery is working normally.</p>
            </div>
          </article>

          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-black tracking-normal">Service Color Categorization</h3>
                <p className="text-sm font-medium text-slate-500">Basic, Medium, and Elite quality tiers.</p>
              </div>
              <button className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-bold text-blue-700 hover:bg-blue-50">See Details</button>
            </div>
          </article>
        </div>
      </section>

      <section id="numbers" className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-center">
            <h3 className="text-3xl font-black tracking-normal">{numberType === "foreign" ? "Foreign Numbers" : "UK Premium Numbers"}</h3>
            <p className="mt-2 text-sm font-medium text-slate-500">Temporary phone numbers for SMS verification.</p>
          </div>

          <div className="mt-6 grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button type="button" onClick={() => setNumberType("foreign")} className={`h-12 rounded-lg text-sm font-black ${numberType === "foreign" ? "bg-blue-600 text-white" : "text-slate-600"}`}>Foreign Numbers</button>
            <button type="button" onClick={() => setNumberType("uk")} className={`h-12 rounded-lg text-sm font-black ${numberType === "uk" ? "bg-blue-600 text-white" : "text-slate-600"}`}>UK Premium</button>
          </div>

          <div className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Select Service
              <span className="relative">
                <select className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" defaultValue="">
                  <option value="" disabled>Select a service...</option>
                  <option>WhatsApp</option>
                  <option>Telegram</option>
                  <option>Snapchat</option>
                  <option>Google</option>
                </select>
                <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              </span>
            </label>
            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-base font-black text-white shadow-sm hover:bg-blue-700">
              <Zap className="h-5 w-5" />
              Buy Number
            </button>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
              Numbers are valid for 15 minutes. Request the SMS code immediately after generating the number.
            </div>
          </div>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-black tracking-normal">Active Numbers</h3>
            <StatusPill status="Live" />
          </div>
          <div className="mt-4 grid gap-3">
            {activeNumbers.map((item) => (
              <div key={item.number} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-black">{item.type}</p>
                      <p className="text-xs font-bold text-slate-500">{item.region}</p>
                    </div>
                  </div>
                  <StatusPill status={item.status} />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-white px-4 py-3">
                  <span className="text-xl font-black tracking-normal text-blue-700">{item.number}</span>
                  <button className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" aria-label="Copy number">
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {providerCards.map((card) => (
          <article key={card.title} id={card.title.includes("logs") ? "logs" : undefined} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-blue-700">
                <card.icon className="h-6 w-6" />
              </div>
              <StatusPill status={card.status} />
            </div>
            <h3 className="mt-5 text-xl font-black tracking-normal">{card.title}</h3>
            <p className="mt-2 text-sm font-semibold text-slate-500">{card.provider}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{card.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <article id="esim" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
              <Wifi className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-normal">Buy eSIM</h3>
              <p className="text-sm font-medium text-slate-500">SMSPool-backed inventory path</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            <button className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left hover:border-blue-200 hover:bg-blue-50">
              <span><b className="block">UK Data Pass</b><small className="font-semibold text-slate-500">8 GB / 15 days</small></span>
              <span className="font-black text-blue-700">NGN 38,000</span>
            </button>
            <button className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left hover:border-blue-200 hover:bg-blue-50">
              <span><b className="block">EU Travel Pass</b><small className="font-semibold text-slate-500">12 GB / 30 days</small></span>
              <span className="font-black text-blue-700">NGN 44,500</span>
            </button>
          </div>
        </article>

        <article id="orders" className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <h3 className="text-xl font-black tracking-normal">Recent Orders</h3>
            <button className="text-sm font-black text-blue-700 hover:text-blue-800">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">Service</th>
                  <th className="px-5 py-4">Link</th>
                  <th className="px-5 py-4">Quantity</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-black">{order.id}</td>
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
        </article>
      </section>

      <section id="wallet" className="rounded-lg border border-blue-100 bg-blue-50 p-5 text-blue-950">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black tracking-normal">Wallet Funding</h3>
            <p className="mt-1 text-sm font-semibold text-blue-800">Payment is on hold for now. PocketFi is reserved as the planned funding gateway.</p>
          </div>
          <button className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-4 text-sm font-black text-blue-700 shadow-sm hover:bg-blue-100">
            <Wallet className="h-5 w-5" />
            Funding Paused
          </button>
        </div>
      </section>
    </div>
  );
}