import pino from "pino";
import { BulkAccAdapter } from "@/lib/providers/adapters/bulkacc-adapter";
import { SMSPoolAdapter } from "@/lib/providers/adapters/sms-pool-adapter";
import { ResellingSMMAdapter } from "@/lib/providers/adapters/smm-adapter";
import type { BaseProviderAdapter, ProviderConfig, ProviderHealth } from "@/lib/providers/base-adapter";

type AdapterClass = new (id: string, config: ProviderConfig, logger?: any) => BaseProviderAdapter;

const providerDefinitions: Array<{
  id: string;
  name: string;
  envKey: "BULKACC_API_KEY" | "SMSPOOL_API_KEY" | "JUSTANOTHERPANEL_API_KEY";
  adapter: AdapterClass;
}> = [
  { id: "bulkacc", name: "Bulkacc", envKey: "BULKACC_API_KEY", adapter: BulkAccAdapter },
  { id: "smspool", name: "SMSPool", envKey: "SMSPOOL_API_KEY", adapter: SMSPoolAdapter },
  { id: "justanotherpanel", name: "JustAnotherPanel", envKey: "JUSTANOTHERPANEL_API_KEY", adapter: ResellingSMMAdapter }
];

export interface ProviderEnvStatus {
  id: string;
  name: string;
  envKey: string;
  configured: boolean;
  status: "configured" | "missing" | "active" | "error";
  message: string;
  lastCheck: string | null;
}

function hasConfiguredValue(value: string | undefined) {
  return Boolean(value && value.trim().length > 0);
}

function toStatus(definition: (typeof providerDefinitions)[number], health?: ProviderHealth): ProviderEnvStatus {
  const configured = hasConfiguredValue(process.env[definition.envKey]);
  if (!configured) {
    return {
      id: definition.id,
      name: definition.name,
      envKey: definition.envKey,
      configured: false,
      status: "missing",
      message: `${definition.envKey} is not configured.`,
      lastCheck: null
    };
  }

  if (!health) {
    return {
      id: definition.id,
      name: definition.name,
      envKey: definition.envKey,
      configured: true,
      status: "configured",
      message: `${definition.name} key is configured. Live provider check was not requested.`,
      lastCheck: null
    };
  }

  return {
    id: definition.id,
    name: definition.name,
    envKey: definition.envKey,
    configured: true,
    status: health.isHealthy ? "active" : "error",
    message: health.message || (health.isHealthy ? `${definition.name} is reachable.` : `${definition.name} is not reachable.`),
    lastCheck: health.lastCheck.toISOString()
  };
}

export async function getProviderEnvStatuses({ liveCheck = false }: { liveCheck?: boolean } = {}): Promise<ProviderEnvStatus[]> {
  const logger = pino({ level: "silent" });

  return Promise.all(
    providerDefinitions.map(async (definition) => {
      const apiKey = process.env[definition.envKey];
      if (!hasConfiguredValue(apiKey) || !liveCheck) {
        return toStatus(definition);
      }

      try {
        const adapter = new definition.adapter(definition.id, { apiKey: apiKey!, timeout: 10000 }, logger);
        const health = await adapter.checkHealth();
        return toStatus(definition, health);
      } catch (error) {
        return {
          id: definition.id,
          name: definition.name,
          envKey: definition.envKey,
          configured: true,
          status: "error",
          message: error instanceof Error ? error.message : "Provider check failed.",
          lastCheck: new Date().toISOString()
        };
      }
    })
  );
}
