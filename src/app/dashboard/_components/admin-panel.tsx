"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Ban, CheckCircle2, RefreshCcw, Search, ShieldCheck, ShoppingBag, Users, WalletCards } from "lucide-react";
import { StatusPill } from "./dashboard-widgets";

type AdminUser = {
  id: string;
  email: string;
  username: string;
  name: string;
  role: string;
  status: string;
  balance: string;
  joinedAt?: string;
  lastLoginAt?: string | null;
};

type AdminPayload = {
  stats: {
    revenue: string;
    totalUsers: number;
    activeUsers: number;
    bannedUsers: number;
  };
  users: AdminUser[];
  activities: AdminActivity[];
};

type AdminActivity = {
  id: string;
  orderNumber: string;
  user: { id: string; name: string; email: string; status: string };
  serviceName: string;
  kind: string;
  quantity: number;
  amount: string;
  amountCents: number;
  status: string;
  provider: string;
  createdAt: string;
  completedAt?: string | null;
};

const roleOptions = ["CUSTOMER", "RESELLER", "SUPPORT_AGENT", "ADMIN"];

function formatDate(value?: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function AdminPanel() {
  const [data, setData] = useState<AdminPayload | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [activityQuery, setActivityQuery] = useState("");
  const [activityStatus, setActivityStatus] = useState("ALL");

  async function load() {
    setState("loading");
    setMessage("");
    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load admin panel.");
      setData(payload);
      setState("ready");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load admin panel.");
      setState("error");
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function updateUser(userId: string, updates: { status?: "active" | "banned"; role?: string }) {
    setBusyUserId(userId);
    setMessage("");
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updates })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to update user.");
      setData((current) => {
        if (!current) return current;
        const users = current.users.map((user) => user.id === userId ? payload.user : user);
        const activities = current.activities.map((activity) => activity.user.id === userId ? { ...activity, user: { ...activity.user, status: payload.user.status } } : activity);
        return {
          ...current,
          stats: {
            ...current.stats,
            activeUsers: users.filter((user) => user.status === "active").length,
            bannedUsers: users.filter((user) => user.status === "banned").length
          },
          users
        };
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update user.");
    } finally {
      setBusyUserId(null);
    }
  }

  const statCards = useMemo(() => data ? [
    { label: "Total money made", value: data.stats.revenue, icon: WalletCards },
    { label: "Total users", value: data.stats.totalUsers.toLocaleString(), icon: Users },
    { label: "Active users", value: data.stats.activeUsers.toLocaleString(), icon: CheckCircle2 },
    { label: "Banned users", value: data.stats.bannedUsers.toLocaleString(), icon: Ban }
  ] : [], [data]);
  const filteredActivities = useMemo(() => {
    const query = activityQuery.trim().toLowerCase();
    return (data?.activities || []).filter((activity) => {
      if (activityStatus !== "ALL" && activity.status !== activityStatus) return false;
      if (!query) return true;
      return [activity.orderNumber, activity.user.name, activity.user.email, activity.serviceName, activity.kind, activity.provider]
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [activityQuery, activityStatus, data]);

  return (
    <div className="admin-panel-page mx-auto grid max-w-7xl gap-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Admin</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Control panel</h2>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-600">Monitor platform revenue, view users, and ban or unban accounts.</p>
        </div>
        <button type="button" onClick={() => void load()} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5">
          <RefreshCcw className="h-4 w-4" /> Refresh
        </button>
      </section>

      {message ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">{message}</div> : null}

      {state === "loading" ? <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm font-bold text-slate-500 shadow-sm">Loading admin data...</div> : null}

      {data ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <article key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
                <div className="flex items-center justify-between gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white"><card.icon className="h-5 w-5" /></span>
                  <ShieldCheck className="h-5 w-5 text-blue-500" />
                </div>
                <p className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-slate-400">{card.label}</p>
                <strong className="mt-2 block text-3xl font-black tracking-tight text-slate-950">{card.value}</strong>
              </article>
            ))}
          </section>



          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
              <div>
                <div className="flex items-center gap-2"><Activity className="h-5 w-5 text-blue-600" /><h3 className="text-lg font-black tracking-tight text-slate-900">Purchase activity</h3></div>
                <p className="mt-1 text-xs font-semibold text-slate-500">Latest 150 orders across all users.</p>
              </div>
              <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                <label className="relative min-w-0 flex-1 sm:w-72 sm:flex-none">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={activityQuery} onChange={(event) => setActivityQuery(event.target.value)} placeholder="Search user, order or service" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100" />
                </label>
                <select value={activityStatus} onChange={(event) => setActivityStatus(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100">
                  {["ALL", "PENDING", "PROCESSING", "COMPLETED", "FAILED", "REFUNDED", "CANCELLED"].map((status) => <option key={status} value={status}>{status === "ALL" ? "All statuses" : status}</option>)}
                </select>
              </div>
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                  <tr><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Purchase</th><th className="px-5 py-4">Provider</th><th className="px-5 py-4">Amount</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Date</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredActivities.map((activity) => (
                    <tr key={activity.id} className="transition hover:bg-slate-50/70">
                      <td className="px-5 py-4"><div className="flex flex-wrap items-center gap-2"><div><div className="font-black text-slate-900">{activity.user.name}</div><div className="mt-1 text-xs font-semibold text-slate-500">{activity.user.email}</div></div><button type="button" disabled={!activity.user.id || busyUserId === activity.user.id} onClick={() => void updateUser(activity.user.id, { status: activity.user.status === "banned" ? "active" : "banned" })} className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-black disabled:opacity-60 ${activity.user.status === "banned" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white hover:bg-rose-700"}`}><Ban className="h-3.5 w-3.5" />{busyUserId === activity.user.id ? "Updating..." : activity.user.status === "banned" ? "Unban" : "Ban user"}</button></div></td>
                      <td className="px-5 py-4"><div className="font-black text-slate-900">{activity.serviceName}</div><div className="mt-1 text-xs font-semibold capitalize text-slate-500">{activity.orderNumber} · {activity.kind} · Qty {activity.quantity}</div></td>
                      <td className="px-5 py-4 font-bold text-slate-700">{activity.provider}</td>
                      <td className="px-5 py-4 font-black text-slate-900">{activity.amount}</td>
                      <td className="px-5 py-4"><StatusPill status={activity.status} /></td>
                      <td className="px-5 py-4 text-xs font-semibold text-slate-500">{formatDateTime(activity.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-3 p-4 md:hidden">
              {filteredActivities.map((activity) => (
                <article key={activity.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-black text-blue-600">{activity.orderNumber}</p><h4 className="mt-1 truncate font-black text-slate-900">{activity.serviceName}</h4></div><StatusPill status={activity.status} /></div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-blue-600 ring-1 ring-slate-200"><ShoppingBag className="h-4 w-4" /></span><div><p className="font-black text-slate-900">{activity.user.name}</p><p className="text-xs font-semibold text-slate-500">{activity.user.email}</p></div></div><button type="button" disabled={!activity.user.id || busyUserId === activity.user.id} onClick={() => void updateUser(activity.user.id, { status: activity.user.status === "banned" ? "active" : "banned" })} className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-black disabled:opacity-60 ${activity.user.status === "banned" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}><Ban className="h-4 w-4" />{busyUserId === activity.user.id ? "Updating..." : activity.user.status === "banned" ? "Unban" : "Ban user"}</button></div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><span><b>Amount</b><br />{activity.amount}</span><span><b>Provider</b><br />{activity.provider}</span><span><b>Quantity</b><br />{activity.quantity}</span><span><b>Date</b><br />{formatDateTime(activity.createdAt)}</span></div>
                </article>
              ))}
            </div>
            {!filteredActivities.length ? <div className="border-t border-slate-100 p-8 text-center text-sm font-bold text-slate-500">No purchase activity matches these filters.</div> : null}
          </section>
        </>
      ) : null}
    </div>
  );
}

