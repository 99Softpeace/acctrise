import pino from "pino";
import { BulkAccAdapter } from "@/lib/providers/adapters/bulkacc-adapter";
import { SMSPoolAdapter } from "@/lib/providers/adapters/sms-pool-adapter";
import { GrizzlySMSAdapter } from "@/lib/providers/adapters/grizzly-sms-adapter";
import { SMSBowerAdapter } from "@/lib/providers/adapters/sms-bower-adapter";
import type { SmsActivateAdapter } from "@/lib/providers/adapters/sms-activate-adapter";
import { ResellingSMMAdapter } from "@/lib/providers/adapters/smm-adapter";
import type { BaseProviderAdapter, ProviderConfig, ServiceMapping } from "@/lib/providers/base-adapter";
import { applyProfitMargin, PROFIT_MARGIN_PERCENT } from "@/lib/pricing/profit-margin";

export type LiveServiceKind = "boosting" | "logs" | "foreign-numbers" | "uk-premium" | "esim";

type AdapterClass = new (id: string, config: ProviderConfig, logger?: any) => BaseProviderAdapter;

type FetchLiveServicesOptions = {
  countryId?: string;
  countryName?: string;
  query?: string;
  limit?: number;
};

const USA_COUNTRY_ID = "1";
const USA_COUNTRY_NAME = "United States";
const numberDefinitions = [
  { id: "grizzly-sms", name: "GrizzlySMS", envKey: "GRIZZLY_SMS_API_KEY", Adapter: GrizzlySMSAdapter },
  { id: "smsbower", name: "SMSBower", envKey: "SMSBOWER_API_KEY", Adapter: SMSBowerAdapter }
] as const;

const definitions: Record<Exclude<LiveServiceKind, "foreign-numbers" | "uk-premium">, {
  id: string;
  name: string;
  envKey: "BULKACC_API_KEY" | "SMSPOOL_API_KEY" | "JUSTANOTHERPANEL_API_KEY";
  adapter: AdapterClass;
}> = {
  boosting: { id: "justanotherpanel", name: "JustAnotherPanel", envKey: "JUSTANOTHERPANEL_API_KEY", adapter: ResellingSMMAdapter },
  logs: { id: "bulkacc", name: "Bulkacc", envKey: "BULKACC_API_KEY", adapter: BulkAccAdapter },
  esim: { id: "smspool", name: "SMSPool", envKey: "SMSPOOL_API_KEY", adapter: SMSPoolAdapter }
};

export interface LiveCountry {
  id: string;
  name: string;
  shortName?: string;
  dialCode?: string;
  region?: string;
}

export interface LiveService {
  externalId: string;
  name: string;
  description?: string;
  price: number;
  minOrder: number;
  maxOrder?: number;
  provider: string;
  countryId?: string;
  countryName?: string;
  serviceId?: string;
  availability?: string;
  friendlyLabel?: string;
  categoryName?: string;
  groupName?: string;
  stock?: number;
}

export interface LiveServicesResult {
  kind: LiveServiceKind;
  provider: string;
  services: LiveService[];
  fetchedAt: string;
  profitMarginPercent: number;
}

function configured(value: string | undefined) {
  return Boolean(value && value.trim().length > 0);
}

function createAdapter(kind: Exclude<LiveServiceKind, "foreign-numbers" | "uk-premium">) {
  const definition = definitions[kind];
  const apiKey = process.env[definition.envKey];

  if (!configured(apiKey)) {
    throw new Error(`${definition.envKey} is not configured.`);
  }

  const logger = pino({ level: process.env.LOG_LEVEL || "info" });
  return {
    definition,
    adapter: new definition.adapter(definition.id, { apiKey: apiKey!, timeout: 20000 }, logger)
  };
}

function filterServices(kind: LiveServiceKind, services: ServiceMapping[]): ServiceMapping[] {
  if (kind === "foreign-numbers") {
    return services.filter((service) => !/esim|e-sim|data plan|data package/i.test(`${service.name} ${service.description || ""}`));
  }

  if (kind === "esim") {
    return services.filter((service) => /esim|e-sim|data plan|data package/i.test(`${service.name} ${service.description || ""}`));
  }

  return services;
}

export async function fetchLiveCountries(kind: Extract<LiveServiceKind, "foreign-numbers" | "uk-premium">): Promise<LiveCountry[]> {
  if (kind === "uk-premium") return [{ id: USA_COUNTRY_ID, name: USA_COUNTRY_NAME, shortName: "US", dialCode: "1" }];
  const adapters = createNumberAdapters();
  if (!adapters.length) throw new Error("No number provider is configured.");
  const results = await Promise.allSettled(adapters.map(({ adapter }) => adapter.fetchCountries()));
  const countries = new Map<string, LiveCountry>();
  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const country of result.value) {
      const key = normalizeName(country.name);
      if (!countries.has(key)) countries.set(key, { id: key, name: country.name });
    }
  }
  return [...countries.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchLiveServices(kind: LiveServiceKind, options: FetchLiveServicesOptions = {}): Promise<LiveServicesResult> {
  if (kind === "foreign-numbers" || kind === "uk-premium") return fetchNumberServices(kind, options);
  const { definition, adapter } = createAdapter(kind);
  let providerServices: ServiceMapping[];

  if (kind === "esim" && adapter instanceof SMSPoolAdapter) {
    providerServices = await adapter.fetchEsimServices();
  } else {
    providerServices = await adapter.fetchServices();
  }

  const services = filterServices(kind, providerServices);

  return {
    kind,
    provider: definition.name,
    services: services.map((service) => ({
      externalId: service.externalId,
      name: service.name,
      description: service.description,
      price: applyProfitMargin(service.price),
      minOrder: service.minOrder,
      maxOrder: service.maxOrder,
      provider: definition.name,
      countryId: service.countryId,
      countryName: service.countryName,
      serviceId: service.serviceId,
      availability: service.availability,
      friendlyLabel: service.friendlyLabel,
      categoryName: service.categoryName,
      groupName: service.groupName,
      stock: service.stock
    })),
    fetchedAt: new Date().toISOString(),
    profitMarginPercent: PROFIT_MARGIN_PERCENT
  };
}

function createNumberAdapters(): Array<{ name: string; adapter: SmsActivateAdapter }> {
  const logger = pino({ level: process.env.LOG_LEVEL || "info" });
  return numberDefinitions.flatMap((definition) => {
    const apiKey = process.env[definition.envKey]?.trim();
    return apiKey ? [{ name: definition.name, adapter: new definition.Adapter(definition.id, { apiKey, timeout: 20000 }, logger) }] : [];
  });
}

function normalizeName(value: string) {
  return value.toLowerCase().replace(/\b(inc|app|messenger|verification)\b/g, "").replace(/[^a-z0-9]+/g, "");
}

async function fetchNumberServices(kind: Extract<LiveServiceKind, "foreign-numbers" | "uk-premium">, options: FetchLiveServicesOptions): Promise<LiveServicesResult> {
  const adapters = createNumberAdapters();
  if (!adapters.length) throw new Error("No number provider is configured.");
  const countryName = kind === "uk-premium" ? USA_COUNTRY_NAME : options.countryName || USA_COUNTRY_NAME;
  const results = await Promise.allSettled(adapters.map(async ({ name, adapter }) => ({
    name,
    services: await adapter.fetchServicesForCountry(countryName, { query: options.query, limit: options.limit || 30 })
  })));
  const merged = new Map<string, { service: ServiceMapping; providers: string[] }>();
  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const service of result.value.services) {
      const key = normalizeName(service.name);
      const current = merged.get(key);
      if (!current) merged.set(key, { service, providers: [result.value.name] });
      else {
        if (service.price < current.service.price) current.service = service;
        if (!current.providers.includes(result.value.name)) current.providers.push(result.value.name);
      }
    }
  }
  const services = [...merged.entries()].map(([key, entry]) => ({
    externalId: `${normalizeName(countryName)}:${key}`,
    name: entry.service.name,
    description: entry.service.description,
    price: applyProfitMargin(entry.service.price),
    minOrder: 1,
    maxOrder: 1,
    provider: entry.providers.join(" + "),
    countryId: options.countryId || normalizeName(countryName),
    countryName,
    serviceId: key,
    availability: entry.service.availability,
    friendlyLabel: entry.service.friendlyLabel,
    stock: entry.service.stock
  }));
  return { kind, provider: "GrizzlySMS + SMSBower", services, fetchedAt: new Date().toISOString(), profitMarginPercent: PROFIT_MARGIN_PERCENT };
}

export function isLiveServiceKind(value: string | null): value is LiveServiceKind {
  return Boolean(value && ["boosting", "logs", "foreign-numbers", "uk-premium", "esim"].includes(value));
}
