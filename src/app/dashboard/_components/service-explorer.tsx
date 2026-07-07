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
  countryId?: string;
  countryName?: string;
  serviceId?: string;
  availability?: string;
  friendlyLabel?: string;
};

type CountryItem = {
  id: string;
  name: string;
  shortName?: string;
  dialCode?: string;
  region?: string;
};

type PlatformOption = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  keywords: string[];
  accent: string;
};

type BoostPlatformOption = PlatformOption & { all?: boolean; more?: boolean };

const socialPlatforms: PlatformOption[] = [
  { label: "Facebook", icon: Users, keywords: ["facebook", "fb"], accent: "from-blue-50 to-indigo-50 text-blue-700 ring-blue-100" },
  { label: "Instagram", icon: Camera, keywords: ["instagram", "ig"], accent: "from-pink-50 to-rose-50 text-rose-600 ring-rose-100" },
  { label: "WhatsApp", icon: Phone, keywords: ["whatsapp", "whats app"], accent: "from-emerald-50 to-green-50 text-emerald-700 ring-emerald-100" },
  { label: "TikTok", icon: Play, keywords: ["tiktok", "tik tok"], accent: "from-slate-50 to-cyan-50 text-cyan-700 ring-cyan-100" },
  { label: "Spotify", icon: Wifi, keywords: ["spotify"], accent: "from-green-50 to-lime-50 text-green-700 ring-green-100" },
  { label: "YouTube", icon: Video, keywords: ["youtube", "yt", "watch time"], accent: "from-red-50 to-orange-50 text-red-600 ring-red-100" },
  { label: "Telegram", icon: Send, keywords: ["telegram", "tg"], accent: "from-sky-50 to-blue-50 text-sky-700 ring-sky-100" },
  { label: "Twitter", icon: Globe2, keywords: ["twitter", "x ", "x.com"], accent: "from-slate-50 to-blue-50 text-slate-700 ring-slate-200" },
  { label: "LinkedIn", icon: BriefcaseBusiness, keywords: ["linkedin", "linked in"], accent: "from-blue-50 to-cyan-50 text-blue-700 ring-blue-100" }
];

const boostPlatformTiles: BoostPlatformOption[] = [
  { label: "All", icon: ShoppingBag, keywords: [], accent: "from-blue-50 to-sky-50 text-blue-700 ring-blue-100", all: true },
  ...socialPlatforms,
  { label: "More", icon: ChevronDown, keywords: [], accent: "from-slate-50 to-slate-100 text-slate-600 ring-slate-200", more: true }
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
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value * 1600);
}

function formatBoostRate(value: number) {
  const price = formatPrice(value);
  return price === "Live price" ? price : `${price} / 1k`;
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
  if (service.countryName) return service.countryName;
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

function boostCategoryFor(service: ServiceItem) {
  const text = `${service.name} ${service.description || ""}`.toLowerCase();
  if (/followers?|fans|subscribers?/.test(text)) return "Followers & subscribers";
  if (/likes?|reactions?|favorites?/.test(text)) return "Likes & reactions";
  if (/views?|watch time|impressions?/.test(text)) return "Views & watch time";
  if (/comments?|replies/.test(text)) return "Comments";
  if (/members?|joins?|group/.test(text)) return "Members & groups";
  if (/plays?|streams?|listeners?/.test(text)) return "Plays & streams";
  if (/shares?|saves?|bookmarks?/.test(text)) return "Shares & saves";
  return "General services";
}

function boostCategoryLabel(platform: BoostPlatformOption, category: string) {
  if (category === "All categories") return category;
  const name = platform.all || platform.more ? "Social" : platform.label;
  return `${name} ${category.toLowerCase()}`;
}

function matchesBoostPlatform(service: ServiceItem, platform: BoostPlatformOption) {
  if (platform.all) return true;
  if (platform.more) return !socialPlatforms.some((item) => matchesKeywords(service, item.keywords));
  return matchesKeywords(service, platform.keywords);
}


function orderEstimate(service: ServiceItem, quantity: number) {
  const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : service.minOrder;
  const total = service.price > 0 ? (service.price * safeQuantity * 1600) / 1000 : 0;
  if (!Number.isFinite(total) || total <= 0) return "Live total";
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(total);
}

function linkPlaceholder(service: ServiceItem) {
  const text = service.name.toLowerCase();
  if (/views?|watch|video|reel/.test(text)) return "Paste the post, reel, or video link";
  if (/followers?|subscribers?|members?/.test(text)) return "Paste the profile, page, channel, or group link";
  if (/likes?|comments?|shares?|saves?/.test(text)) return "Paste the exact post link";
  return "Paste the profile or post link";
}
function userSafeError() {
  return "This service is available, but fulfillment is temporarily unavailable. Please contact support.";
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-sm font-semibold text-slate-600">{label}{children}</label>;
}

function SelectField({ value, onChange, options, label }: { value: string; onChange: (value: string) => void; options: string[];

label: string }) {
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
        <span className="rounded-lg bg-slate-50 px-2.5 py-2 text-slate-700">{variant === "boosting" ? formatBoostRate(service.price) : formatPrice(service.price)}</span>
        <span className="rounded-lg bg-slate-50 px-2.5 py-2 text-slate-700">{country}</span>
        <span className="rounded-lg bg-slate-50 px-2.5 py-2 text-slate-700">Min {service.minOrder}</span>
        <span className="rounded-lg bg-slate-50 px-2.5 py-2 text-slate-700">{service.availability || (service.maxOrder ? `${service.maxOrder} available` : "Available")}</span>
      </div>
    </button>
  );
}

function CheckoutPanel({ service, variant }: { service: ServiceItem | null; variant: ServiceExplorerKind }) {
  const [notice, setNotice] = useState<{ serviceId: string; message: string } | null>(null);
  const [quantity, setQuantity] = useState(() => service?.minOrder || 0);


  if (!service) {
    return (
      <aside className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
        <PackageSearch className="mx-auto h-8 w-8 text-slate-400" />
        <h3 className="mt-3 text-sm font-bold text-slate-700">Select a service</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">Choose a service to see the final price and purchase action.</p>
      </aside>
    );
  }

  const isBoost = variant === "boosting";
  const isNumber = variant === "foreign-numbers" || variant === "uk-premium";
  const isEsim = variant === "esim";
  const actionLabel = isBoost ? "Create boost order" : isEsim ? "Buy eSIM" : isNumber ? "Buy Number" : "Continue to purchase";

  if (isNumber) {
    return (
      <aside className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/60 lg:sticky lg:top-28">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Ready to buy</p>
        <h3 className="mt-2 text-lg font-bold tracking-tight text-slate-900">{service.name}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{service.countryName || inferCountry(service)} SMS verification service.</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200"><dt className="text-xs font-bold text-slate-400">Price</dt><dd className="mt-1 font-black text-blue-700">{formatPrice(service.price)}</dd></div>
          <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200"><dt className="text-xs font-bold text-slate-400">Region</dt><dd className="mt-1 font-bold text-slate-800">{service.countryName || inferCountry(service)}</dd></div>
          <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200"><dt className="text-xs font-bold text-slate-400">Availability</dt><dd className="mt-1 font-bold text-slate-800">{service.availability || "Live stock"}</dd></div>
          <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200"><dt className="text-xs font-bold text-slate-400">Window</dt><dd className="mt-1 font-bold text-slate-800">15 minutes</dd></div>
        </dl>
        <button type="button" onClick={() => setNotice({ serviceId: service.externalId, message: userSafeError() })} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-blue-50 shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100">
          <Zap className="h-4 w-4" /> Buy Number
        </button>
        {notice?.serviceId === service.externalId ? <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-900">{notice.message}</div> : null}
      </aside>
    );
  }

  if (isEsim) {
    return (
      <aside className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/60 lg:sticky lg:top-28">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Selected eSIM</p>
        <h3 className="mt-2 text-lg font-bold tracking-tight text-slate-900">{service.name}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{service.description || "Travel-ready data plan with activation details delivered after purchase."}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200"><dt className="text-xs font-bold text-slate-400">Price</dt><dd className="mt-1 font-black text-blue-700">{formatPrice(service.price)}</dd></div>
          <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200"><dt className="text-xs font-bold text-slate-400">Data</dt><dd className="mt-1 font-bold text-slate-800">{dataSummary(service)}</dd></div>
          <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200"><dt className="text-xs font-bold text-slate-400">Coverage</dt><dd className="mt-1 font-bold text-slate-800">{inferCountry(service)}</dd></div>
          <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200"><dt className="text-xs font-bold text-slate-400">Activation</dt><dd className="mt-1 font-bold text-slate-800">QR or manual setup</dd></div>
        </dl>
        <div className="mt-5 grid gap-4 rounded-lg border border-blue-100 bg-blue-50/70 p-4 sm:grid-cols-[112px_1fr] sm:items-center">
          <div className="grid h-28 w-28 grid-cols-5 gap-1 rounded-lg border border-blue-200 bg-white p-3 shadow-sm">
            {Array.from({ length: 25 }).map((_, index) => (
              <span key={index} className={`rounded-sm ${index % 2 === 0 || [6, 8, 16, 18].includes(index) ? "bg-blue-700" : "bg-blue-100"}`} />
            ))}
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900">QR code after purchase</h4>
            <p className="mt-2 text-sm leading-6 text-slate-600">After a successful purchase, the activation QR code or manual eSIM details will appear here for the customer to scan from their phone settings.</p>
          </div>
        </div>
        <button type="button" onClick={() => setNotice({ serviceId: service.externalId, message: userSafeError() })} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-blue-50 shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100">
          <Zap className="h-4 w-4" /> Buy eSIM
        </button>
        {notice?.serviceId === service.externalId ? <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-900">{notice.message}</div> : null}
      </aside>
    );
  }
  return (
    <aside className="rounded-xl border border-blue-100 bg-gradient-to-b from-white to-blue-50/40 p-5 shadow-sm shadow-blue-100/60 lg:sticky lg:top-28">
      <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">{service.availability || "Available"}</span>
      <h3 className="mt-4 text-lg font-bold tracking-tight text-slate-800">{service.name}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{service.description || inferDelivery(service)}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200"><dt className="text-xs font-bold text-slate-400">{isBoost ? "Rate / 1k" : "Price"}</dt><dd className="mt-1 font-bold text-slate-700">{isBoost ? formatBoostRate(service.price) : formatPrice(service.price)}</dd></div>
        <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200"><dt className="text-xs font-bold text-slate-400">Quantity</dt><dd className="mt-1 font-bold text-slate-700">{service.minOrder} - {service.maxOrder || "available"}</dd></div>
        <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200"><dt className="text-xs font-bold text-slate-400">Delivery</dt><dd className="mt-1 font-bold text-slate-700">{inferDelivery(service)}</dd></div>
        <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200"><dt className="text-xs font-bold text-slate-400">Region</dt><dd className="mt-1 font-bold text-slate-700">{inferCountry(service)}</dd></div>
      </dl>
      <div className="mt-5 grid gap-3">
        {isBoost ? <Field label="Profile or post link"><input className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100" placeholder={linkPlaceholder(service)} /></Field> : null}
        {(variant === "logs" || isBoost) ? <Field label="Quantity"><input className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100" type="number" min={service.minOrder} max={service.maxOrder} value={quantity || service.minOrder} onChange={(event) => setQuantity(Number(event.target.value))} /></Field> : null}
        {isBoost ? (
          <div className="grid gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-4 sm:grid-cols-3">
            <div><span className="text-xs font-black uppercase tracking-[0.14em] text-blue-500">Rate / 1k</span><strong className="mt-1 block text-sm font-black text-blue-950">{formatBoostRate(service.price)}</strong></div>
            <div><span className="text-xs font-black uppercase tracking-[0.14em] text-blue-500">Quantity</span><strong className="mt-1 block text-sm font-black text-blue-950">{quantity || service.minOrder}</strong></div>
            <div><span className="text-xs font-black uppercase tracking-[0.14em] text-blue-500">Estimated total</span><strong className="mt-1 block text-lg font-black text-blue-700">{orderEstimate(service, quantity || service.minOrder)}</strong></div>
          </div>
        ) : null}
        <button type="button" onClick={() => setNotice({ serviceId: service.externalId, message: userSafeError() })} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-blue-50 shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100">
          <Zap className="h-4 w-4" /> {actionLabel}
        </button>
        {notice?.serviceId === service.externalId ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-900">{notice.message}</div> : null}
      </div>
    </aside>
  );
}


const USA_COUNTRY: CountryItem = { id: "1", name: "United States", shortName: "US", dialCode: "1", region: "North America" };

function ServiceDropdownOption({ service, onSelect }: { service: ServiceItem; onSelect: () => void }) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
      className="grid w-full gap-2 rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:grid-cols-[1fr_auto] sm:items-center"
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-slate-800">{service.name}</span>
        <span className="mt-1 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
          <span>{service.friendlyLabel || "Verification service"}</span>
          <span>{service.countryName || "Selected country"}</span>
          <span>{service.availability || "Live availability"}</span>
        </span>
      </span>
      <span className="text-left sm:text-right">
        <span className="block text-base font-black text-blue-700">{formatPrice(service.price)}</span>
        <span className="text-xs font-semibold text-slate-400">Live price</span>
      </span>
    </button>
  );
}

function NumberServicePicker({ kind }: { kind: Extract<ServiceExplorerKind, "foreign-numbers" | "uk-premium"> }) {
  const premium = kind === "uk-premium";
  const [countries, setCountries] = useState<CountryItem[]>(premium ? [USA_COUNTRY] : []);
  const [countryState, setCountryState] = useState<"idle" | "loading" | "ready" | "error">(premium ? "ready" : "loading");
  const [selectedCountryId, setSelectedCountryId] = useState(premium ? USA_COUNTRY.id : "");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [serviceState, setServiceState] = useState<"idle" | "loading" | "ready" | "empty" | "error">("idle");
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const selectedCountry = useMemo(() => countries.find((country) => country.id === selectedCountryId) || (premium ? USA_COUNTRY : null), [countries, premium, selectedCountryId]);

  useEffect(() => {
    if (premium) return;
    let cancelled = false;

    async function loadCountries() {
      setCountryState("loading");
      try {
        const response = await fetch(`/api/providers/services?kind=${kind}&scope=countries`, { cache: "no-store" });
        const body = await response.json();
        if (cancelled) return;
        if (!response.ok) throw new Error("Countries unavailable");
        const nextCountries = Array.isArray(body.countries) ? body.countries : [];

        setCountries(nextCountries);
        setCountryState(nextCountries.length ? "ready" : "error");
      } catch {
        if (!cancelled) setCountryState("error");
      }
    }

    loadCountries();
    return () => { cancelled = true; };
  }, [kind, premium]);


  useEffect(() => {
    if (!searchOpen || !selectedCountry) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setServiceState("loading");
      try {
        const params = new URLSearchParams({
          kind,
          countryId: selectedCountry.id,
          countryName: selectedCountry.name,
          limit: "24"
        });
        if (query.trim()) params.set("q", query.trim());
        const response = await fetch(`/api/providers/services?${params.toString()}`, { cache: "no-store" });
        const body = await response.json();
        if (cancelled) return;
        if (!response.ok) throw new Error("Services unavailable");
        const nextServices = Array.isArray(body.services) ? body.services : [];

        setServices(nextServices);
        setServiceState(nextServices.length ? "ready" : "empty");
      } catch {
        if (!cancelled) setServiceState("error");
      }
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [kind, query, searchOpen, selectedCountry]);

  function selectService(service: ServiceItem) {
    setSelectedService(service);
    setQuery(service.name);
    setSearchOpen(false);
  }

  const countryDisabled = countryState === "loading" || countryState === "error";
  const inputDisabled = !selectedCountry || countryDisabled;

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Number checkout</p>
            <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">{premium ? "Choose a USA Premium service" : "Choose country, then service"}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{premium ? "Search USA verification services and select one to view live price and availability." : "Pick a country first. Services load only when you click or type in the service search."}</p>
          </div>
          <span className="rounded-md bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">Live provider data</span>
        </div>

        <div className="mt-5 grid gap-4">
          {!premium ? (
            <Field label="Select Country">
              <span className="relative">
                <select value={selectedCountryId} disabled={countryDisabled} onChange={(event) => { setSelectedCountryId(event.target.value); setServices([]); setSelectedService(null); setQuery(""); setSearchOpen(false); setServiceState("idle"); }} className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 pr-10 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:text-slate-400">
                  <option value="">{countryState === "loading" ? "Loading countries..." : "Select a country..."}</option>
                  {countries.map((country) => <option key={country.id} value={country.id}>{country.name}{country.shortName ? ` (${country.shortName})` : ""}</option>)}
                </select>
                <Globe2 className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              </span>
            </Field>
          ) : (
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-blue-950">
              USA Premium uses United States routes with live service pricing and availability.
            </div>
          )}

          <Field label="Select Service">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                disabled={inputDisabled}
                onFocus={() => { if (!inputDisabled) setSearchOpen(true); }}
                onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); setSelectedService(null); }}
                className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:text-slate-400"
                placeholder={inputDisabled ? "Select a country first" : "Click or search service..."}
              />
              {searchOpen ? (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-96 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
                  {serviceState === "loading" ? <div className="flex items-center gap-2 p-3 text-sm font-semibold text-slate-600"><Loader2 className="h-4 w-4 animate-spin text-blue-600" /> Loading matching services...</div> : null}
                  {serviceState === "error" ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-900">{userSafeError()}</div> : null}
                  {serviceState === "empty" ? <div className="p-3 text-sm font-semibold text-slate-500">No matching services for this country. Try another search.</div> : null}
                  {serviceState === "ready" ? <div className="grid gap-2">{services.map((service) => <ServiceDropdownOption key={service.externalId} service={service} onSelect={() => selectService(service)} />)}</div> : null}
                </div>
              ) : null}
            </div>
          </Field>

          {selectedService ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Selected Service</p>
                  <h4 className="mt-1 text-lg font-bold text-slate-800">{selectedService.name}</h4>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{selectedService.friendlyLabel || "Verification service"} - {selectedService.countryName || selectedCountry?.name}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Price</p>
                  <strong className="mt-1 block text-2xl font-black tracking-tight text-blue-700">{formatPrice(selectedService.price)}</strong>
                  <span className="text-xs font-semibold text-slate-500">{selectedService.availability || "Live availability"}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-semibold leading-6 text-slate-500">
              {selectedCountry ? "Click the service search to load matching services and prices." : "Start by selecting a country."}
            </div>
          )}
        </div>
      </div>

      <CheckoutPanel service={selectedService} variant={kind} />
    </section>
  );
}

function stockLabel(service: ServiceItem) {
  if (service.maxOrder && service.maxOrder > 1) return `${service.maxOrder} left`;
  return service.availability || "Live stock";
}

function logCategoryFor(service: ServiceItem) {
  const text = `${service.name} ${service.description || ""}`.toLowerCase();
  if (/instagram|tiktok|facebook|twitter|linkedin|youtube|telegram|social/.test(text)) return "Social Media";
  if (/whatsapp|telegram|snapchat|discord|message/.test(text)) return "Messaging";
  if (/gmail|email|outlook|yahoo|mail/.test(text)) return "Email Services";
  if (/netflix|spotify|vpn|stream|prime|hulu/.test(text)) return "Streaming & VPN";
  if (/game|steam|xbox|playstation/.test(text)) return "Games";
  return "Software & Other";
}

const logMarketplaceCategories = [
  { label: "Social Media", icon: Camera },
  { label: "Messaging", icon: Send },
  { label: "Email Services", icon: BriefcaseBusiness },
  { label: "Streaming & VPN", icon: Wifi },
  { label: "Games", icon: Play },
  { label: "Software & Other", icon: Globe2 }
];


function LogsMarketplace() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [activeCategory, setActiveCategory] = useState("Social Media");
  const [query, setQuery] = useState("");
  const [showOos, setShowOos] = useState(true);
  const [sortLowFirst, setSortLowFirst] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setState("loading");
      try {
        const response = await fetch("/api/providers/services?kind=logs", { cache: "no-store" });
        const body = await response.json();
        if (cancelled) return;
        if (!response.ok) throw new Error("Logs unavailable");
        const nextServices = Array.isArray(body.services) ? body.services : [];

        setServices(nextServices);
        setState(nextServices.length ? "ready" : "empty");
      } catch {
        if (!cancelled) setState("error");
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const counts = useMemo(() => logMarketplaceCategories.reduce<Record<string, number>>((acc, category) => {
    acc[category.label] = services.filter((service) => logCategoryFor(service) === category.label).length;
    return acc;
  }, {}), [services]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return services
      .filter((service) => logCategoryFor(service) === activeCategory)
      .filter((service) => showOos || service.maxOrder !== 0)
      .filter((service) => !search || `${service.name} ${service.description || ""}`.toLowerCase().includes(search))
      .sort((a, b) => sortLowFirst ? a.price - b.price : b.price - a.price);
  }, [activeCategory, query, services, showOos, sortLowFirst]);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm shadow-slate-200/70">
      <div className="grid gap-4 border-b border-slate-200 p-4 lg:grid-cols-[1fr_400px] lg:items-center lg:p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Marketplace</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Premium Logs & Accounts</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">High-quality aged accounts, social media logs, and premium subscriptions.</p>
        </div>
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100" placeholder="Search products..." />
        </label>
      </div>

      {state === "loading" ? <div className="grid min-h-60 place-items-center p-8 text-sm font-semibold text-slate-600"><span className="inline-flex items-center gap-3"><Loader2 className="h-5 w-5 animate-spin text-blue-600" /> Loading logs...</span></div> : null}
      {state === "error" ? <div className="m-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">{userSafeError()}</div> : null}
      {state === "empty" ? <div className="p-8 text-center text-sm font-semibold text-slate-500">No log products are available right now.</div> : null}

      {state === "ready" ? (
        <div className="grid lg:grid-cols-[330px_minmax(0,1fr)]">
          <aside className="border-b border-slate-200 bg-slate-50/70 p-4 lg:border-b-0 lg:border-r lg:p-5">
            <p className="px-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">Categories</p>
            <div className="mt-4 grid gap-2">
              {logMarketplaceCategories.map((category) => {
                const active = activeCategory === category.label;
                return (
                  <button key={category.label} type="button" onClick={() => { setActiveCategory(category.label); setSelectedService(null); }} className={`flex min-h-12 items-center justify-between gap-3 rounded-lg px-4 text-left text-sm font-bold transition ${active ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20" : "text-slate-600 hover:bg-white hover:text-blue-700 hover:shadow-sm"}`}>
                    <span className="inline-flex min-w-0 items-center gap-3"><category.icon className="h-4 w-4 shrink-0" /><span className="truncate">{category.label}</span></span>
                    <span className={active ? "text-blue-100" : "text-slate-400"}>{counts[category.label] || 0}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 lg:p-6">
              <div className="flex items-center gap-3"><h4 className="text-xl font-black text-slate-900">{activeCategory}</h4><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">{filtered.length} items</span></div>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600"><input type="checkbox" checked={showOos} onChange={(event) => setShowOos(event.target.checked)} className="h-4 w-4 accent-blue-600" /> Show OOS</label>
                <button type="button" onClick={() => setSortLowFirst((value) => !value)} className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600">Price: {sortLowFirst ? "Low to High" : "High to Low"}</button>
              </div>
            </div>

            {selectedService ? <div className="m-4 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950 lg:m-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">Selected product</p><h5 className="mt-1 text-base font-black text-slate-900">{selectedService.name}</h5><p className="mt-1 text-slate-600">{selectedService.description || logCategoryFor(selectedService)}</p></div><strong className="text-xl text-blue-700">{formatPrice(selectedService.price)}</strong></div></div> : null}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.12em] text-slate-500"><tr><th className="px-6 py-4">Product Name</th><th className="px-6 py-4">Price</th><th className="px-6 py-4">Stock</th><th className="px-6 py-4 text-right">Action</th></tr></thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filtered.map((service) => <tr key={service.externalId} className="transition hover:bg-slate-50"><td className="px-6 py-5"><div className="font-bold text-slate-900">{service.name}</div><div className="mt-1 text-xs font-semibold text-slate-500">{logCategoryFor(service).toLowerCase()}</div></td><td className="px-6 py-5 text-base font-black text-blue-700">{formatPrice(service.price)}</td><td className="px-6 py-5"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">{stockLabel(service)}</span></td><td className="px-6 py-5 text-right"><button type="button" onClick={() => setSelectedService(service)} className="font-bold text-blue-700 hover:text-blue-800">View Details</button></td></tr>)}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 md:hidden">
              {filtered.map((service) => <article key={service.externalId} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h5 className="text-sm font-black text-slate-900">{service.name}</h5><p className="mt-1 text-xs font-semibold text-slate-500">{logCategoryFor(service)}</p></div><strong className="shrink-0 text-blue-700">{formatPrice(service.price)}</strong></div><div className="mt-3 flex items-center justify-between gap-3"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">{stockLabel(service)}</span><button type="button" onClick={() => setSelectedService(service)} className="text-sm font-bold text-blue-700">View Details</button></div></article>)}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function EsimPlanBrowser() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [query, setQuery] = useState("");
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setState("loading");
      try {
        const response = await fetch("/api/providers/services?kind=esim", { cache: "no-store" });
        const body = await response.json();
        if (cancelled) return;
        if (!response.ok) throw new Error("eSIM unavailable");
        const nextServices = Array.isArray(body.services) ? body.services : [];

        setServices(nextServices);
        setState(nextServices.length ? "ready" : "empty");
        setSelectedService(nextServices[0] || null);
      } catch {
        if (!cancelled) setState("error");
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return services.filter((service) => !search || `${service.name} ${service.description || ""}`.toLowerCase().includes(search));
  }, [query, services]);

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_320px] lg:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Travel data</p><h3 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Available eSIM plans</h3><p className="mt-2 text-sm leading-6 text-slate-600">Browse live regional data plans and select one to view the final checkout details.</p></div>
          <label className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100" placeholder="Search country or data plan..." /></label>
        </div>

        {state === "loading" ? <div className="mt-5 grid min-h-52 place-items-center rounded-lg border border-slate-200 bg-slate-50 p-8 text-sm font-semibold text-slate-600"><span className="inline-flex items-center gap-3"><Loader2 className="h-5 w-5 animate-spin text-blue-600" /> Loading eSIM plans...</span></div> : null}
        {state === "error" ? <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">{userSafeError()}</div> : null}
        {state === "empty" ? <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">No eSIM plans are available right now.</div> : null}

        {state === "ready" ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            {filtered.map((service) => {
              const selected = selectedService?.externalId === service.externalId;
              return (
                <article key={service.externalId} className={`flex min-h-48 flex-col rounded-lg border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md ${selected ? "border-blue-500 ring-4 ring-blue-100" : "border-slate-200"}`}>
                  <div className="flex items-start justify-between gap-3"><span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">{dataSummary(service)}</span>{selected ? <CheckCircle2 className="h-5 w-5 text-blue-600" /> : null}</div>
                  <h4 className="mt-4 line-clamp-2 text-sm font-black leading-5 text-slate-900">{service.name}</h4>
                  <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">{service.description || "Travel-ready data plan"}</p>
                  <div className="mt-auto pt-4">
                    <div className="flex items-center justify-between gap-3"><strong className="text-lg font-black text-blue-700">{formatPrice(service.price)}</strong><span className="text-xs font-bold text-emerald-600">{service.availability || "Activation details after purchase"}</span></div>
                    <button type="button" onClick={() => setSelectedService(service)} className={`mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg px-4 text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${selected ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100" : "bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700"}`}>
                      {selected ? "Selected" : "Buy eSIM"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>

      <CheckoutPanel service={selectedService} variant="esim" />
    </section>
  );
}

function BoostAccountBrowser() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [selectedPlatformLabel, setSelectedPlatformLabel] = useState("All");
  const [category, setCategory] = useState("All categories");
  const [query, setQuery] = useState("");
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setState("loading");
      try {
        const response = await fetch("/api/providers/services?kind=boosting", { cache: "no-store" });
        const body = await response.json();
        if (cancelled) return;
        if (!response.ok) throw new Error("Boosting unavailable");
        const nextServices = Array.isArray(body.services) ? body.services : [];
        setServices(nextServices);
        setState(nextServices.length ? "ready" : "empty");
      } catch {
        if (!cancelled) setState("error");
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const activePlatform = boostPlatformTiles.find((platform) => platform.label === selectedPlatformLabel) || boostPlatformTiles[0];

  const counts = useMemo(() => boostPlatformTiles.reduce<Record<string, number>>((acc, platform) => {
    acc[platform.label] = services.filter((service) => matchesBoostPlatform(service, platform)).length;
    return acc;
  }, {}), [services]);

  const platformServices = useMemo(() => services.filter((service) => matchesBoostPlatform(service, activePlatform)), [activePlatform, services]);

  const categoryOptions = useMemo(() => {
    const categories = Array.from(new Set(platformServices.map(boostCategoryFor))).sort((a, b) => a.localeCompare(b));
    return ["All categories", ...categories];
  }, [platformServices]);



  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return platformServices.filter((service) => {
      const text = `${service.name} ${service.description || ""}`.toLowerCase();
      if (category !== "All categories" && boostCategoryFor(service) !== category) return false;
      if (search && !text.includes(search)) return false;
      return true;
    });
  }, [category, platformServices, query]);

  const activeSelectedService = selectedService && filtered.some((service) => service.externalId === selectedService.externalId) ? selectedService : null;

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,1fr)] xl:items-start">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100"><ShoppingBag className="h-5 w-5" /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Boost Account</p>
            <h3 className="text-2xl font-black tracking-tight text-slate-900">Choose a social service</h3>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-5">
          {boostPlatformTiles.map((platform) => {
            const active = platform.label === activePlatform.label;
            return (
              <button key={platform.label} type="button" onClick={() => { setSelectedPlatformLabel(platform.label); setCategory("All categories"); setSelectedService(null); setQuery(""); }} className={`min-h-24 rounded-xl border p-3 text-center transition hover:-translate-y-0.5 hover:shadow-md ${active ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/25" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-white hover:text-blue-700"}`}>
                <span className={`mx-auto grid h-10 w-10 place-items-center rounded-lg ${active ? "bg-white/15 text-white ring-1 ring-white/25" : `bg-gradient-to-br ring-1 ${platform.accent}`}`}><platform.icon className="h-5 w-5" /></span>
                <span className="mt-3 block text-sm font-black">{platform.label}</span>
                <span className={active ? "mt-1 block text-xs font-bold text-blue-100" : "mt-1 block text-xs font-bold text-slate-400"}>{counts[platform.label] || 0} services</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100" placeholder="Search services..." />
          </label>

          <Field label="Category">
            <span className="relative">
              <select value={category} onChange={(event) => { setCategory(event.target.value); setSelectedService(null); }} className="h-14 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100">
                {categoryOptions.map((option) => <option key={option} value={option}>{boostCategoryLabel(activePlatform, option)}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </span>
          </Field>

          <Field label="Service">
            <span className="relative">
              <select value={activeSelectedService?.externalId || ""} onChange={(event) => setSelectedService(filtered.find((service) => service.externalId === event.target.value) || null)} disabled={!filtered.length || state !== "ready"} className="h-14 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-semibold text-slate-800 outline-none transition disabled:bg-slate-100 disabled:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100">
                <option value="">{filtered.length ? "Choose a service..." : "No matching services"}</option>
                {filtered.slice(0, 300).map((service) => <option key={service.externalId} value={service.externalId}>{service.name} - {formatBoostRate(service.price)}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </span>
          </Field>
        </div>

        {state === "loading" ? <div className="mt-5 grid min-h-28 place-items-center rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm font-semibold text-slate-600"><span className="inline-flex items-center gap-3"><Loader2 className="h-5 w-5 animate-spin text-blue-600" /> Loading social services...</span></div> : null}
        {state === "error" ? <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">{userSafeError()}</div> : null}
        {state === "empty" ? <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">No boosting services are available right now.</div> : null}

        {activeSelectedService ? (
          <div className="boost-inline-checkout mt-5">
            <CheckoutPanel key={activeSelectedService.externalId} service={activeSelectedService} variant="boosting" />
          </div>
        ) : null}

        <div className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-between gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-600">
          <span>Acctrise service color categorization</span>
          <span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Basic</span>
          <span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Medium</span>
          <span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Elite</span>
        </div>
      </div>

      <div className="grid gap-5">
        <div>
          <h3 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Boost your <span className="text-blue-600">social media</span></h3>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">Select a service, enter your link, and place the order from one guided panel. Services are pulled from the live provider catalog.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70 sm:p-6">
          <div className="flex items-center gap-3"><AlertCircle className="h-5 w-5 text-blue-600" /><h4 className="text-xl font-black text-slate-900">Important information</h4></div>
          <ul className="mt-5 grid gap-4 text-sm leading-6 text-slate-600">
            <li className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" /> Make sure the account or post is public before ordering.</li>
            <li className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" /> Do not place two orders for the same link at the same time.</li>
            <li className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" /> Double-check links before buying because incorrect links may not be refundable.</li>
            <li className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" /> For views, enter the video link instead of a profile link.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-950">
          <div className="flex items-start gap-3"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /> Drip-feed is currently disabled for maintenance. Standard delivery is working normally.</div>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm font-semibold leading-6 text-blue-950">Choose a service on the left. The link field, quantity, and live estimated total will appear immediately under your selected service.</div>
      </div>
    </section>
  );
}
function ServiceCatalogExplorer({ kind, mode }: { kind: ServiceExplorerKind; mode: "boosting" | "logs" | "numbers" | "esim" }) {
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



  const activeSelectedService = selectedService && filtered.some((service) => service.externalId === selectedService.externalId) ? selectedService : null;

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
                <span className="mt-1 block text-xs text-slate-500">{selectedPlatform?.label === platform.label ? "Showing below" : "View services"}</span>
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
        <section className={mode === "boosting" ? "boosting-results grid gap-5 xl:grid-cols-[1fr_360px]" : "grid gap-5 xl:grid-cols-[1fr_360px]"}>
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-slate-700">{mode === "boosting" && selectedPlatform ? `${selectedPlatform.label} services` : `${filtered.length} services available`}</p>
                {mode === "boosting" && selectedPlatform ? <p className="mt-1 text-xs font-semibold text-slate-400">{filtered.length} matching services. Pick one and the order form opens under it.</p> : null}
              </div>
              <p className="text-xs font-semibold text-slate-400">Select a card to continue</p>
            </div>
            <div className={mode === "logs" ? "grid gap-3 md:grid-cols-2 2xl:grid-cols-3" : "grid gap-3 sm:grid-cols-2 2xl:grid-cols-3"}>
              {filtered.slice(0, visibleCount).map((service) => {
                const selected = selectedService?.externalId === service.externalId;
                return (
                  <div key={service.externalId} className={selected && mode === "boosting" ? "sm:col-span-2 2xl:col-span-3" : ""}>
                    <ServiceCard service={service} selected={selected} onSelect={() => setSelectedService(service)} variant={kind} />
                    {selected && mode === "boosting" ? <div className="mt-3 xl:hidden"><CheckoutPanel service={activeSelectedService} variant={kind} /></div> : null}
                  </div>
                );
              })}
            </div>
            {!filtered.length ? <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">No services match the current filters.</div> : null}
            {filtered.length > visibleCount ? (
              <div className="mt-5 flex justify-center">
                <button type="button" onClick={() => setVisibleCount((value) => value + 60)} className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700">Load more services</button>
              </div>
            ) : null}
          </div>
          <div className={mode === "boosting" ? "hidden xl:block" : ""}>
            <CheckoutPanel service={activeSelectedService} variant={kind} />
          </div>
        </section>
      ) : null}
    </section>
  );
}
export function ServiceExplorer({ kind, mode }: { kind: ServiceExplorerKind; mode: "boosting" | "logs" | "numbers" | "esim" }) {
  if (mode === "boosting" && kind === "boosting") {
    return <BoostAccountBrowser />;
  }

  if (mode === "numbers" && (kind === "foreign-numbers" || kind === "uk-premium")) {
    return <NumberServicePicker kind={kind} />;
  }

  if (mode === "logs") {
    return <LogsMarketplace />;
  }

  if (mode === "esim") {
    return <EsimPlanBrowser />;
  }

  return <ServiceCatalogExplorer kind={kind} mode={mode} />;
}
