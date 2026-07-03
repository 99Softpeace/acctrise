import pino from "pino";
import { BulkAccAdapter } from "@/lib/providers/adapters/bulkacc-adapter";
import { SMSPoolAdapter } from "@/lib/providers/adapters/sms-pool-adapter";
import { ResellingSMMAdapter } from "@/lib/providers/adapters/smm-adapter";
import type { BaseProviderAdapter, ProviderConfig, ServiceMapping } from "@/lib/providers/base-adapter";

export type LiveServiceKind = "boosting" | "logs" | "foreign-numbers" | "uk-premium" | "esim";

type AdapterClass = new (id: string, config: ProviderConfig, logger?: any) => BaseProviderAdapter;

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

export interface LiveService {
  externalId: string;
  name: string;
  description?: string;
  price: number;
  minOrder: number;
  maxOrder?: number;
  provider: string;
}

export interface LiveServicesResult {
  kind: LiveServiceKind;
  provider: string;
  services: LiveService[];
  fetchedAt: string;
}

function configured(value: string | undefined) {
  return Boolean(value && value.trim().length > 0);
}

function filterServices(kind: LiveServiceKind, services: ServiceMapping[]): ServiceMapping[] {
  if (kind === "uk-premium") {
    return services.filter((service) => /uk|united kingdom|premium/i.test(`${service.name} ${service.description || ""}`));
  }

  if (kind === "foreign-numbers") {
    return services.filter((service) => !/uk premium|esim/i.test(`${service.name} ${service.description || ""}`));
  }

  if (kind === "esim") {
    return services.filter((service) => /esim|e-sim|data plan|data package/i.test(`${service.name} ${service.description || ""}`));
  }

  return services;
}

export async function fetchLiveServices(kind: LiveServiceKind): Promise<LiveServicesResult> {
  const definition = definitions[kind];
  const apiKey = process.env[definition.envKey];

  if (!configured(apiKey)) {
    throw new Error(`${definition.envKey} is not configured.`);
  }

  const logger = pino({ level: process.env.LOG_LEVEL || "info" });
  const adapter = new definition.adapter(definition.id, { apiKey: apiKey!, timeout: 20000 }, logger);
  let providerServices: ServiceMapping[];

  if (kind === "esim" && adapter instanceof SMSPoolAdapter) {
    providerServices = await adapter.fetchEsimServices();
  } else if (kind === "uk-premium" && adapter instanceof SMSPoolAdapter) {
    providerServices = await adapter.fetchServicesForCountry("2", "United Kingdom");
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
      price: service.price,
      minOrder: service.minOrder,
      maxOrder: service.maxOrder,
      provider: definition.name
    })),
    fetchedAt: new Date().toISOString()
  };
}

export function isLiveServiceKind(value: string | null): value is LiveServiceKind {
  return Boolean(value && value in definitions);
}
