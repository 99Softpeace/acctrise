import pino from "pino";
import { BulkAccAdapter } from "@/lib/providers/adapters/bulkacc-adapter";
import { SMSPoolAdapter } from "@/lib/providers/adapters/sms-pool-adapter";
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

const definitions: Record<LiveServiceKind, {
  id: string;
  name: string;
  envKey: "BULKACC_API_KEY" | "SMSPOOL_API_KEY" | "RESELLER_SMM_API_KEY";
  adapter: AdapterClass;
}> = {
  boosting: { id: "reseller-smm", name: "Reseller SMM", envKey: "RESELLER_SMM_API_KEY", adapter: ResellingSMMAdapter },
  logs: { id: "bulkacc", name: "Bulkacc", envKey: "BULKACC_API_KEY", adapter: BulkAccAdapter },
  "foreign-numbers": { id: "smspool", name: "SMSPool", envKey: "SMSPOOL_API_KEY", adapter: SMSPoolAdapter },
  "uk-premium": { id: "smspool", name: "SMSPool", envKey: "SMSPOOL_API_KEY", adapter: SMSPoolAdapter },
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

function createAdapter(kind: LiveServiceKind) {
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
  const { adapter } = createAdapter(kind);

  if (!(adapter instanceof SMSPoolAdapter)) {
    return [];
  }

  const countries = await adapter.fetchCountries();
  return countries.map((country) => ({
    id: country.id,
    name: country.name,
    shortName: country.shortName,
    dialCode: country.dialCode,
    region: country.region
  }));
}

export async function fetchLiveServices(kind: LiveServiceKind, options: FetchLiveServicesOptions = {}): Promise<LiveServicesResult> {
  const { definition, adapter } = createAdapter(kind);
  let providerServices: ServiceMapping[];

  if (kind === "esim" && adapter instanceof SMSPoolAdapter) {
    providerServices = await adapter.fetchEsimServices();
  } else if ((kind === "foreign-numbers" || kind === "uk-premium") && adapter instanceof SMSPoolAdapter) {
    const countryId = kind === "uk-premium" ? USA_COUNTRY_ID : options.countryId || USA_COUNTRY_ID;
    const countryName = kind === "uk-premium" ? USA_COUNTRY_NAME : options.countryName || USA_COUNTRY_NAME;
    providerServices = await adapter.fetchServicesForCountry(countryId, countryName, {
      query: options.query,
      limit: options.limit || 30,
      includePricing: true
    });
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
      friendlyLabel: service.friendlyLabel
    })),
    fetchedAt: new Date().toISOString(),
    profitMarginPercent: PROFIT_MARGIN_PERCENT
  };
}

export function isLiveServiceKind(value: string | null): value is LiveServiceKind {
  return Boolean(value && value in definitions);
}
