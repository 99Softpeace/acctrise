import "dotenv/config";
import { fetchLiveServices, type LiveServiceKind } from "../src/lib/providers/live-services";
import { getProviderEnvStatuses } from "../src/lib/providers/env-status";

const kinds: LiveServiceKind[] = ["boosting", "logs", "foreign-numbers", "uk-premium", "esim"];

async function main() {
  const health = await getProviderEnvStatuses({ liveCheck: true });
  const serviceResults = [];

  for (const kind of kinds) {
    try {
      const result = await fetchLiveServices(kind);
      serviceResults.push({
        kind,
        provider: result.provider,
        passed: true,
        serviceCount: result.services.length,
        sampleNames: result.services.slice(0, 3).map((service) => service.name)
      });
    } catch (error) {
      serviceResults.push({
        kind,
        passed: false,
        error: error instanceof Error ? error.message : "Service fetch failed"
      });
    }
  }

  console.log(JSON.stringify({ success: true, health, services: serviceResults }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Provider diagnostics failed" }, null, 2));
  process.exitCode = 1;
});
