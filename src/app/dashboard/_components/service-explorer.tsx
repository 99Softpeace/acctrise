"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  ChevronDown,
  Filter,
  Globe2,
  Loader2,
  PackageSearch,
  Phone,
  Play,
  Search,
  Send,
  ShoppingBag,
  SlidersHorizontal,
  Users,
  Video,
  Wifi,
  Zap
} from "lucide-react";

export type ServiceExplorerKind = "boosting" | "logs" | "foreign-numbers" | "uk-premium" | "esim";

type ServiceItem = {
  externalId: string;
  name: string;
  description?: string;
  price: number;
  minOrder: number;
  maxOrder?: number;
};

type PlatformOption = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  keywords: string[];
  accent: string;
};

const socialPlatforms: PlatformOption[] = [
  { label: "Instagram", icon: Camera, keywords: ["instagram", "ig"], accent: "from-pink-50 to-rose-50 text-rose-600 ring-rose-100" },
  { label: "TikTok", icon: Play, keywords: ["tiktok", "tik tok"], accent: "from-slate-50 to-cyan-50 text-cyan-700 ring-cyan-100" },
  { label: "YouTube", icon: Video, keywords: ["youtube", "yt", "watch time"], accent: "from-red-50 to-orange-50 text-red-600 ring-red-100" },
  { label: "Telegram", icon: Send, keywords: ["telegram", "tg"], accent: "from-sky-50 to-blue-50 text-sky-700 ring-sky-100" },
  { label: "Facebook", icon: Users, keywords: ["facebook", "fb"], accent: "from-blue-50 to-indigo-50 text-blue-700 ring-blue-100" },
  { label: "WhatsApp", icon: Phone, keywords: ["whatsapp", "whats app"], accent: "from-emerald-50 to-green-50 text-emerald-700 ring-emerald-100" },
  { label: "Spotify", icon: Wifi, keywords: ["spotify"], accent: "from-green-50 to-lime-50 text-green-700 ring-green-100" },
  { label: "Twitter/X", icon: Globe2, keywords: ["twitter", "x ", "x.com"], accent: "from-slate-50 to-blue-50 text-slate-700 ring-slate-200" },
  { label: "LinkedIn", icon: BriefcaseBusiness, keywords: ["linkedin", "linked in"], accent: "from-blue-50 to-cyan-50 text-blue-700 ring-blue-100" }
];

const logCategories = [
  { label: "All", keywords: [] },
  { label: "Social Media", keywords: ["instagram", "tiktok", "facebook", "twitter", "linkedin", "youtube", "telegram"] },
  { label: "Messaging", keywords: ["whatsapp", "telegram", "snapchat", "discord"] },
  { label: "Email Services", keywords: ["gmail", "email", "outlook", "yahoo"] },
  { label: "Streaming & VPN", keywords: ["netflix", "spotify", "vpn", "stream"] },
  { label: "Software & Other", keywords: ["account", "subscription", "software", "aged"] }
];

const countryOptions = ["Any country", "USA", "United States", "UK", "United Kingdom", "Germany", "France", "Canada", "Brazil", "Nigeria"];
const priceOptions = ["Any price", "Under $1", "$1 - $5", "$5+"];
const stockOptions = ["Any stock", "In stock", "High stock"];

function formatPrice(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "Live price";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 4 }).format(value);
}

function matchesKeywords(service: ServiceItem, keywords: string[]) {
  if (!keywords.length) return true;
  const haystack = `${service.name} ${service.description || ""}`.toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

function inferPlatform(service: ServiceItem) {
  const match = socialPlatforms.find((platform) => matchesKeywords(service, platform.keywords));
  return match?.label || "General";
}

function inferCountry(service: ServiceItem) {
  const text = `${service.name} ${service.description || ""}`.toLowerCase();
  if (/united states|\busa\b|\bus\b/.test(text)) return "United States";
  if (/united kingdom|\buk\b|\bgb\b/.test(text)) return "United Kingdom";
  const found = countryOptions.find((country) => country !== "Any country" && text.includes(country.toLowerCase()));
  return found || "Global";
}

function inferDelivery(service: ServiceItem) {
  const text = `${service.name} ${service.description || ""}`.toLowerCase();
  if (/instant|fast/.test(text)) return "Fast delivery when available";
  if (/aged|month|year/.test(text)) return "Aged inventory";
  if (/refill/.test(text)) return "Refill details included when available";
  return "Delivery starts after confirmation";
}

function dataSummary(service: ServiceItem) {
  const match = service.name.match(/(\d+(?:\.\d+)?)\s*GB/i) || service.description?.match(/(\d+(?:\.\d+)?)\s*GB/i);
  return match ? `${match[1]} GB` : "Data plan";
}

function userSafeError() {
  return "Service is available, but fulfillment is temporarily unavailable. Please contact support.";
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-sm font-semibold text-slate-600">{label}{children}</label>;
}

function SelectField({ value, onChange, options, label }: { value: string; onChange: (value: string) => void; options: string[]; label: string }) {
  return (
    <Field label={label}>
      <span className="relative">
        <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100">
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </span>
    </Field>
  );
}

function ServiceCard({ service, selected, onSelect, variant }: { service: ServiceItem; selected: boolean; onSelect: () => void; variant: ServiceExplorerKind }) {
  const meta = variant === "esim" ? dataSummary(service) : inferPlatform(service);
  const country = inferCountry(service);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex h-full min-h-40 flex-col rounded-xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md ${selected ? "border-blue-500 ring-4 ring-blue-100" : "border-slate-200"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">{meta}</span>
        {selected ? <CheckCircle2 className="h-5 w-5 text-blue-600" /> : null}
      </div>
      <h4 className="mt-4 line-clamp-2 text-sm font-bold leading-5 text-slate-800">{service.name}</h4>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{service.description || inferDelivery(service)}</p>
      <div className="mt-auto grid gap-2 pt-4 text-xs font-semibold text-slate-500 sm:grid-cols-2">
        <span className="rounded-lg bg-slate-50 px-2.5 py-2 text-slate-700">{formatPrice(service.price)}</span>
        <span className="rounded-lg bg-slate-50 px-2.5 py-2 text-slate-700">{country}</span>
        <span className="rounded-lg bg-slate-50 px-2.5 py-2 text-slate-700">Min {service.minOrder}</span>
        <span className="rounded-lg bg-slate-50 px-2.5 py-2 text-slate-700">{service.maxOrder ? `${service.maxOrder} available` : "Available"}</span>
      </div>
    </button>
  );
}

function CheckoutPanel({ service, variant }: { service: ServiceItem | null; variant: ServiceExplorerKind }) {
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setNotice("");
  }, [service?.externalId]);

  if (!service) {
    return (
      <aside className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
        <PackageSearch className="mx-auto h-8 w-8 text-slate-400" />
        <h3 className="mt-3 text-sm font-bold text-slate-700">Select a service</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">Choose any card to see pricing, quantity limits, and the order form.</p>
      </aside>
    );
  }

  const isBoost = variant === "boosting";
  const isNumber = variant === "foreign-numbers" || variant === "uk-premium";
  const actionLabel = isBoost ? "Create boost order" : variant === "esim" ? "Continue to eSIM checkout" : isNumber ? "Request number" : "Continue to purchase";

  return (
    <aside className="rounded-xl border border-blue-100 bg-gradient-to-b from-white to-blue-50/40 p-5 shadow-sm shadow-blue-100/60 lg:sticky lg:top-28">
      <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">Available now</span>
      <h3 className="mt-4 text-lg font-bold tracking-tight text-slate-800">{service.name}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{service.description || inferDelivery(service)}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200"><dt className="text-xs font-bold text-slate-400">Price</dt><dd className="mt-1 font-bold text-slate-700">{formatPrice(service.price)}</dd></div>
        <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200"><dt className="text-xs font-bold text-slate-400">Quantity</dt><dd className="mt-1 font-bold text-slate-700">{service.minOrder} - {service.maxOrder || "available"}</dd></div>
        <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200"><dt className="text-xs font-bold text-slate-400">Delivery</dt><dd className="mt-1 font-bold text-slate-700">{inferDelivery(service)}</dd></div>
        <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200"><dt className="text-xs font-bold text-slate-400">Region</dt><dd className="mt-1 font-bold text-slate-700">{inferCountry(service)}</dd></div>
      </dl>
      <div className="mt-5 grid gap-3">
        {isBoost ? <Field label="Profile or post link"><input className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" placeholder="Paste the correct link" /></Field> : null}
        {variant === "logs" ? <Field label="Quantity"><input className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" type="number" min={service.minOrder} max={service.maxOrder} defaultValue={service.minOrder} /></Field> : null}
        {isNumber ? <Field label="Service / app"><input className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" placeholder="WhatsApp, Telegram, Google..." /></Field> : null}
        {variant === "esim" ? <Field label="Travel label"><input className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" placeholder="Trip name or device" /></Field> : null}
        {isBoost ? <Field label="Quantity"><input className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" type="number" min={service.minOrder} max={service.maxOrder} defaultValue={service.minOrder} /></Field> : null}
        <button type="button" onClick={() => setNotice(userSafeError())} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-blue-50 shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100">
          <Zap className="h-4 w-4" /> {actionLabel}
        </button>
        {notice ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-900">{notice}</div> : null}
      </div>
    </aside>
  );
}

export function ServiceExplorer({ kind, mode }: { kind: ServiceExplorerKind; mode: "boosting" | "logs" | "numbers" | "esim" }) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "empty" | "error">(mode === "boosting" ? "idle" : "loading");
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformOption | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [country, setCountry] = useState("Any country");
  const [price, setPrice] = useState("Any price");
  const [stock, setStock] = useState("Any stock");
  const [visibleCount, setVisibleCount] = useState(60);
  const shouldLoad = mode !== "boosting" || Boolean(selectedPlatform);

  useEffect(() => {
    if (!shouldLoad) return;
    let cancelled = false;
    async function load() {
      setState("loading");
      try {
        const response = await fetch(`/api/providers/services?kind=${kind}`, { cache: "no-store" });
        const body = await response.json();
        if (cancelled) return;
        if (!response.ok) throw new Error("Service unavailable");
        const nextServices = Array.isArray(body.services) ? body.services : [];
        setServices(nextServices);
        setState(nextServices.length ? "ready" : "empty");
      } catch {
        if (cancelled) return;
        setState("error");
      }
    }
    load();
    return () => { cancelled = true; };
  }, [kind, shouldLoad]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return services.filter((service) => {
      const text = `${service.name} ${service.description || ""}`.toLowerCase();
      if (mode === "boosting" && selectedPlatform && !matchesKeywords(service, selectedPlatform.keywords)) return false;
      if (search && !text.includes(search)) return false;
      if (mode === "logs") {
        const activeCategory = logCategories.find((item) => item.label === category);
        if (activeCategory && !matchesKeywords(service, activeCategory.keywords)) return false;
        if (country !== "Any country" && !text.includes(country.toLowerCase())) return false;
        if (price === "Under $1" && !(service.price > 0 && service.price < 1)) return false;
        if (price === "$1 - $5" && !(service.price >= 1 && service.price <= 5)) return false;
        if (price === "$5+" && !(service.price >= 5)) return false;
        if (stock === "In stock" && !service.maxOrder) return false;
        if (stock === "High stock" && !(service.maxOrder && service.maxOrder >= 100)) return false;
      }
      return true;
    });
  }, [category, country, mode, price, query, selectedPlatform, services, stock]);

  useEffect(() => {
    setVisibleCount(60);
  }, [category, country, price, query, selectedPlatform, stock]);

  useEffect(() => {
    if (selectedService && !filtered.some((service) => service.externalId === selectedService.externalId)) {
      setSelectedService(null);
    }
  }, [filtered, selectedService]);

  const title = mode === "boosting" ? "Choose a platform" : mode === "logs" ? "Premium logs & accounts" : mode === "esim" ? "Available eSIM plans" : "Available verification services";
  const description = mode === "boosting" ? "Start with a social platform, then choose the exact service that fits your goal." : mode === "logs" ? "Search aged accounts, social media logs, and premium subscriptions with clear filters." : mode === "esim" ? "Browse travel-ready data plans and select the best fit before checkout." : "Search services, choose one, then continue to a clean checkout panel.";

  return (
    <section className="grid gap-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Live services</p>
            <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">{title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
          </div>
          <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">Updated recently</span>
        </div>

        {mode === "boosting" ? (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {socialPlatforms.map((platform) => (
              <button
                key={platform.label}
                type="button"
                onClick={() => { setSelectedPlatform(platform); setSelectedService(null); setQuery(""); }}
                className={`min-h-24 rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md ${selectedPlatform?.label === platform.label ? "border-blue-500 bg-blue-50 ring-4 ring-blue-100" : "border-slate-200 bg-white"}`}
              >
                <span className={`grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ring-1 ${platform.accent}`}><platform.icon className="h-5 w-5" /></span>
                <span className="mt-3 block text-sm font-bold text-slate-700">{platform.label}</span>
                <span className="mt-1 block text-xs text-slate-500">View services</span>
              </button>
            ))}
          </div>
        ) : null}

        {mode !== "boosting" || selectedPlatform ? (
          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100" placeholder={mode === "logs" ? "Search products, platforms, countries..." : "Search services..."} />
            </label>
            {mode === "logs" ? <div className="flex items-center gap-2 text-sm font-bold text-slate-500"><SlidersHorizontal className="h-4 w-4" /> Filters</div> : null}
          </div>
        ) : null}

        {mode === "logs" ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SelectField label="Category" value={category} onChange={setCategory} options={logCategories.map((item) => item.label)} />
            <SelectField label="Country" value={country} onChange={setCountry} options={countryOptions} />
            <SelectField label="Price" value={price} onChange={setPrice} options={priceOptions} />
            <SelectField label="Stock" value={stock} onChange={setStock} options={stockOptions} />
          </div>
        ) : null}
      </div>

      {mode === "boosting" && !selectedPlatform ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <ShoppingBag className="mx-auto h-9 w-9 text-slate-400" />
          <p className="mt-3 font-bold text-slate-700">Pick a platform to see matching services.</p>
          <p className="mt-1 text-sm text-slate-500">This keeps the page clean and helps you choose faster.</p>
        </div>
      ) : null}

      {state === "loading" ? (
        <div className="grid min-h-48 place-items-center rounded-xl border border-slate-200 bg-white p-8 text-sm font-semibold text-slate-600">
          <div className="flex items-center gap-3"><Loader2 className="h-5 w-5 animate-spin text-blue-600" /> Loading available services...</div>
        </div>
      ) : null}

      {state === "error" ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold leading-6 text-amber-900">
          <div className="flex items-start gap-3"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /> {userSafeError()}</div>
        </div>
      ) : null}

      {state === "empty" ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <Filter className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-3 font-bold text-slate-700">No matching services right now</p>
          <p className="mt-1 text-sm text-slate-500">Try another search or filter.</p>
        </div>
      ) : null}

      {state === "ready" ? (
        <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold text-slate-600">{filtered.length} services available</p>
              <p className="text-xs font-semibold text-slate-400">Select a card to continue</p>
            </div>
            <div className={mode === "logs" ? "grid gap-3 md:grid-cols-2 2xl:grid-cols-3" : "grid gap-3 sm:grid-cols-2 2xl:grid-cols-3"}>
              {filtered.slice(0, visibleCount).map((service) => (
                <ServiceCard key={service.externalId} service={service} selected={selectedService?.externalId === service.externalId} onSelect={() => setSelectedService(service)} variant={kind} />
              ))}
            </div>
            {!filtered.length ? <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">No services match the current filters.</div> : null}
            {filtered.length > visibleCount ? (
              <div className="mt-5 flex justify-center">
                <button type="button" onClick={() => setVisibleCount((value) => value + 60)} className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700">Load more services</button>
              </div>
            ) : null}
          </div>
          <CheckoutPanel service={selectedService} variant={kind} />
        </section>
      ) : null}
    </section>
  );
}
