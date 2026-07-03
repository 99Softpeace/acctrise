import "dotenv/config";
import { seedEnvProviders } from "../src/lib/providers/seed-env-providers";
import mongoose from "mongoose";

async function main() {
  const providers = await seedEnvProviders();
  console.log(JSON.stringify({ success: true, providers }, null, 2));
}

main()
  .catch((error) => {
    console.error(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Provider seed failed" }, null, 2));
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
