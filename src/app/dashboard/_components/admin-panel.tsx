"use client";

import { useEffect, useMemo, useState } from "react";
import { Ban, CheckCircle2, RefreshCcw, ShieldCheck, Users, WalletCards } from "lucide-react";
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
};

function formatDate(value?: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function AdminPanel() {
  const [data, setData] = useState<AdminPayload | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

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

  async function updateUser(userId: string, status: "active" | "banned") {
    setBusyUserId(userId);
    setMessage("");
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to update user.");
      setData((current) => {
        if (!current) return current;
        const users = current.users.map((user) => user.id === userId ? payload.user : user);
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
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="text-lg font-black tracking-tight text-slate-900">Users</h3>
            </div>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[880px] border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                  <tr><th className="px-5 py-4">User</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Balance</th><th className="px-5 py-4">Joined</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.users.map((user) => (
                    <tr key={user.id} className="transition hover:bg-slate-50/70">
                      <td className="px-5 py-4"><div className="font-black text-slate-900">{user.name}</div><div className="mt-1 text-xs font-semibold text-slate-500">{user.email}</div></td>
                      <td className="px-5 py-4 font-bold text-slate-600">{user.role}</td>
                      <td className="px-5 py-4 font-black text-slate-900">{user.balance}</td>
                      <td className="px-5 py-4 text-slate-500">{formatDate(user.joinedAt)}</td>
                      <td className="px-5 py-4"><StatusPill status={user.status} /></td>
                      <td className="px-5 py-4 text-right">
                        <button type="button" disabled={busyUserId === user.id} onClick={() => void updateUser(user.id, user.status === "banned" ? "active" : "banned")} className={`inline-flex h-10 items-center justify-center rounded-xl px-4 text-xs font-black transition disabled:opacity-60 ${user.status === "banned" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-rose-50 text-rose-700 ring-1 ring-rose-100"}`}>
                          {busyUserId === user.id ? "Updating..." : user.status === "banned" ? "Unban" : "Ban"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-3 p-4 lg:hidden">
              {data.users.map((user) => (
                <article key={user.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3"><div><h4 className="font-black text-slate-900">{user.name}</h4><p className="mt-1 text-xs font-semibold text-slate-500">{user.email}</p></div><StatusPill status={user.status} /></div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><span><b>Role</b><br />{user.role}</span><span><b>Balance</b><br />{user.balance}</span></div>
                  <button type="button" disabled={busyUserId === user.id} onClick={() => void updateUser(user.id, user.status === "banned" ? "active" : "banned")} className="mt-4 h-11 w-full rounded-xl bg-slate-950 text-sm font-black text-white disabled:opacity-60">
                    {busyUserId === user.id ? "Updating..." : user.status === "banned" ? "Unban user" : "Ban user"}
                  </button>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}