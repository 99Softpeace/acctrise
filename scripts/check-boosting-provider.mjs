import https from "node:https";
import dns from "node:dns/promises";

// Read-only diagnostics. Never submits an order or prints credentials/balances.
const endpoint = new URL("https://justanotherpanel.com/api/v2");
const key = process.env.JUSTANOTHERPANEL_API_KEY;
if (!key) throw new Error("JUSTANOTHERPANEL_API_KEY is missing");
console.log("[boosting-probe]", JSON.stringify({ phase: "dns", addresses: await dns.lookup(endpoint.hostname, { all: true }) }));
async function probe(family) {
  const start = Date.now();
  return new Promise((resolve) => {
    const body = new URLSearchParams({ key, action: "services" }).toString();
    const request = https.request(endpoint, { method: "POST", family, headers: {
      "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(body)
    } }, (response) => {
      let text = "";
      response.on("data", chunk => { text += chunk; });
      response.on("end", () => {
        clearTimeout(timer);
        let data;
        try { data = JSON.parse(text); } catch {}
        resolve({ family: family || "default", status: response.statusCode, services: Array.isArray(data) ? data.length : null, ms: Date.now() - start });
      });
    });
    const timer = setTimeout(() => request.destroy(Object.assign(new Error("timeout"), { code: "ETIMEDOUT" })), 45_000);
    request.on("error", error => { clearTimeout(timer); resolve({ family: family || "default", code: error.code, ms: Date.now() - start }); });
    request.end(body);
  });
}
for (const result of await Promise.all([probe(undefined), probe(4)])) {
  console.log("[boosting-probe]", JSON.stringify(result));
}
