import assert from "node:assert/strict";

const base = new URL(process.argv[2] || "http://localhost:3100");
const results = [];
async function check(name, run) {
  try {
    await run();
    results.push({ name, passed: true });
  } catch (error) {
    results.push({ name, passed: false, error: error.message });
  }
}
const request = (path, options = {}) => fetch(new URL(path, base), {
  redirect: "manual", signal: AbortSignal.timeout(45_000), ...options
});

for (const path of ["/", "/terms", "/privacy", "/auth/login", "/auth/signup", "/auth/forgot-password", "/auth/reset-password"]) {
  await check(`Public page ${path}`, async () => {
    const response = await request(path);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /text\/html/);
    assert.equal(response.headers.get("x-frame-options"), "DENY");
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.match(await response.text(), /Acctrise/);
  });
}
await check("Health and MongoDB connectivity", async () => {
  const response = await request("/api/health");
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, "healthy");
  assert.match(response.headers.get("cache-control"), /no-store/);
});
for (const path of ["/dashboard", "/dashboard/wallet", "/dashboard/orders", "/dashboard/boosting", "/dashboard/logs", "/dashboard/foreign-numbers", "/dashboard/uk-premium", "/dashboard/rent-number", "/dashboard/tutorials", "/dashboard/admin"]) {
  await check(`Protected page ${path}`, async () => {
    const response = await request(path);
    assert.equal(response.status, 307);
    const destination = new URL(response.headers.get("location"), base);
    assert.equal(destination.origin, base.origin);
    assert.equal(destination.pathname, "/auth/login");
    assert.equal(destination.searchParams.get("callbackUrl"), path);
  });
}
for (const [path, method] of [["/api/orders", "GET"], ["/api/orders", "POST"], ["/api/wallet/balance", "GET"], ["/api/wallet/transactions", "GET"], ["/api/wallet/virtual-account", "GET"], ["/api/wallet/fund", "POST"], ["/api/providers/services?kind=logs", "GET"], ["/api/admin/users", "GET"], ["/api/admin/providers/status", "GET"], ["/api/auth/devices", "GET"]]) {
  await check(`Unauthorized ${method} ${path}`, async () => {
    const response = await request(path, { method });
    assert.equal(response.status, 401);
    assert.equal((await response.json()).error, "Unauthorized");
  });
}
for (const path of ["/api/auth/register", "/api/auth/forgot-password", "/api/auth/reset-password"]) {
  await check(`Invalid input ${path}`, async () => {
    const response = await request(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    assert.equal(response.status, 400);
  });
}
await check("Auth session", async () => {
  const response = await request("/api/auth/session");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {});
});
await check("Auth provider and callback origin", async () => {
  const response = await request("/api/auth/providers");
  assert.equal(response.status, 200);
  const providers = await response.json();
  assert.equal(providers.credentials.type, "credentials");
  assert.equal(new URL(providers.credentials.callbackUrl).origin, base.origin);
});
await check("CSRF cookie", async () => {
  const response = await request("/api/auth/csrf");
  assert.equal(response.status, 200);
  assert.ok((await response.json()).csrfToken);
  const cookie = response.headers.get("set-cookie");
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Lax/i);
  if (base.protocol === "https:") assert.match(cookie, /Secure/);
});
await check("Email verification missing token redirects locally", async () => {
  const response = await request("/api/auth/verify-email");
  assert.equal(response.status, 307);
  const destination = new URL(response.headers.get("location"), base);
  assert.equal(destination.origin, base.origin);
  assert.equal(destination.pathname, "/auth/login");
});
await check("Cron route rejects unauthenticated requests", async () => {
  assert.equal((await request("/api/cron/sync-boosting")).status, 401);
});
await check("Unsigned webhook is ignored without processing", async () => {
  const response = await request("/api/webhooks/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).ignored, true);
});
await check("Missing page is 404", async () => {
  assert.equal((await request("/migration-nonexistent-page")).status, 404);
});
await check("Static assets load", async () => {
  const html = await (await request("/")).text();
  const paths = [...new Set([...html.matchAll(/(?:src|href)="([^" ]+)"/g)].map(match => match[1]).filter(path => path.startsWith("/_next/static/")))];
  assert.ok(paths.length > 0);
  for (const path of [...paths, "/acctrise-mark.svg"]) {
    assert.equal((await request(path.replaceAll("&amp;", "&"))).status, 200, path);
  }
});
console.log(JSON.stringify({ base: base.origin, passed: results.filter(result => result.passed).length, failed: results.filter(result => !result.passed).length, results }, null, 2));
if (results.some(result => !result.passed)) process.exitCode = 1;
