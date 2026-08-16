import "dotenv/config";
import { syncJustAnotherPanelServices } from "@/lib/providers/seed-env-providers";

syncJustAnotherPanelServices()
  .then((result) => {
    console.log(JSON.stringify({ ok: true, ...result }, null, 2));
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
