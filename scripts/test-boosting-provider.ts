import assert from "node:assert/strict";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { once } from "node:events";
import test from "node:test";
import { ResellingSMMAdapter } from "../src/lib/providers/adapters/smm-adapter";

const catalog = [{ service: 123, name: "Example boost", rate: "2", min: "100", max: "10000", category: "Example" }];
const logger = { info() {}, warn() {}, error() {} };
async function fixture(handler: (form: URLSearchParams, response: ServerResponse) => void) {
  const server = createServer(async (request: IncomingMessage, response) => {
    let body = "";
    for await (const chunk of request) body += chunk;
    handler(new URLSearchParams(body), response);
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const port = (server.address() as { port: number }).port;
  return { baseUrl: `http://127.0.0.1:${port}`, close: () => new Promise<void>(resolve => { server.closeAllConnections(); server.close(() => resolve()); }) };
}
function send(response: ServerResponse, status: number, value: unknown) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(value));
}

test("page and checkout adapter instances share one catalog request", async () => {
  let requests = 0;
  const server = await fixture((_form, response) => { requests++; setTimeout(() => send(response, 200, catalog), 30); });
  try {
    const config = { apiKey: "catalog-key", baseUrl: server.baseUrl };
    const page = new ResellingSMMAdapter("page", config, logger);
    const checkout = new ResellingSMMAdapter("checkout", config, logger);
    const [a, b] = await Promise.all([page.fetchServices(), checkout.fetchServices()]);
    assert.deepEqual(a, b);
    assert.equal((await checkout.fetchServices())[0].externalId, "123");
    assert.equal(requests, 1);
  } finally { await server.close(); }
});

test("a catalog timeout retries once and returns fresh services", async () => {
  let requests = 0;
  const server = await fixture((_form, response) => { if (++requests > 1) send(response, 200, catalog); });
  try {
    const adapter = new ResellingSMMAdapter("retry", { apiKey: "retry-key", baseUrl: server.baseUrl, timeout: 100 }, logger);
    assert.equal((await adapter.fetchServices()).length, 1);
    assert.equal(requests, 2);
  } finally { await server.close(); }
});

test("failed catalogs are not cached and credentials have separate catalogs", async () => {
  let fail = true;
  let requests = 0;
  const server = await fixture((form, response) => {
    requests++;
    send(response, fail ? 503 : 200, fail ? { error: "unavailable" } : [{ ...catalog[0], name: form.get("key") }]);
  });
  try {
    const adapter = new ResellingSMMAdapter("first", { apiKey: "first-key", baseUrl: server.baseUrl }, logger);
    await assert.rejects(adapter.fetchServices(), /taking too long/);
    assert.equal(requests, 2);
    fail = false;
    assert.equal((await adapter.fetchServices())[0].name, "first-key");
    const other = new ResellingSMMAdapter("other", { apiKey: "other-key", baseUrl: server.baseUrl }, logger);
    assert.equal((await other.fetchServices())[0].name, "other-key");
    assert.equal(requests, 4);
  } finally { await server.close(); }
});

test("paid order submission is never retried and errors omit credentials", async () => {
  let requests = 0;
  const server = await fixture((form, response) => { assert.equal(form.get("action"), "add"); requests++; send(response, 503, {}); });
  try {
    const adapter = new ResellingSMMAdapter("order", { apiKey: "secret-order-key", baseUrl: server.baseUrl }, logger);
    await assert.rejects(adapter.placeOrder({ serviceId: "123", quantity: 100, targetUrl: "https://example.com/profile" }), (error: any) => {
      assert.equal(error.status, 503);
      assert.equal(error.config, undefined);
      assert.ok(!JSON.stringify(error).includes("secret-order-key"));
      return true;
    });
    assert.equal(requests, 1);
  } finally { await server.close(); }
});
