# Acctrise Railway migration — 2026-09-08

Railway is deployed and healthy at **https://acctrise-production.up.railway.app**. DNS and the Vercel production deployment were not changed. Domain cutover is not yet recommended until the acceptance checks below are completed.

## Deployment and source

| Item | Value |
| --- | --- |
| Railway project | `hospitable-heart` / `4df01a9a-d8c6-4a0e-81d1-3bdbff565763` |
| Environment | `production` / `65e0fd03-ff0a-41da-a1c5-48301b097070` |
| Service | `acctrise` / `b31a06a4-6f4b-4112-8016-39ccb58fd249` |
| Final deployment | `4375979b-e468-405a-9398-a80d048d2f3a` — observed `SUCCESS` |
| Application baseline | `471f8cee55fa9c81670a1cc393b35ecbc4ede4f4`, matching live Vercel |
| Local branch | `migration/railway-production` |
| Worktree | `C:/Users/ACER/Desktop/Acctrise-Railway-production` |
| Runtime | Node 24, Next.js 16.2.10, locked npm dependencies |
| Build / start | Dockerfile: `npm ci`, `npm run build`; `node server.js` |
| Network | `0.0.0.0:3000`, generated Railway domain targets port 3000 |
| Placement | Existing Amsterdam placement, one replica, sleeping disabled |
| Health gate | `/api/health`, 180-second timeout; requires auth secret and successful MongoDB ping |

[Railway service dashboard](https://railway.com/project/4df01a9a-d8c6-4a0e-81d1-3bdbff565763/service/b31a06a4-6f4b-4112-8016-39ccb58fd249?environmentId=65e0fd03-ff0a-41da-a1c5-48301b097070)

An existing Railway service initially ran the newer `main` revision without application variables or a public domain. It was reused. The user explicitly selected the live Vercel revision instead of four newer workspace commits that change pricing, tutorials, and boosting synchronization. Railway's GitHub source was disconnected so future `main` pushes cannot silently replace that revision. Vercel's GitHub connection remains unchanged.

## Vercel inspection

- Project `prj_0llDKZRvGhBrpfbShe39cYZnESJ0`, team `404peaceolowosagbagmailcoms-projects`.
- Live deployment `dpl_57eESMSsHMHErszuNVpzojRLeXh6`, created August 16, observed `READY`; reconfirmed unchanged after migration.
- Next.js preset, repository root, `npm run build`, default install and output settings, Node `24.x`. Functions use `iad1`; middleware is distributed.
- `www.acctrise.com` is canonical. `acctrise.com` redirects there with HTTP 308 and preserves path/query. `acctrise.vercel.app` and deployment/branch aliases also exist.
- Live `vercel.json` only sets the build command. The project and deployed release have **no cron definitions**. No Railway scheduler or BullMQ worker was enabled. The newer workspace's hourly cron is intentionally excluded.
- No Vercel platform webhooks were listed. This does not establish PocketFi's merchant webhook configuration; that is managed externally.
- Final DNS inspection still showed the existing apex A record `216.198.79.1`. No DNS write operations or Vercel deployment/removal operations were performed.

## Changes required for Railway

1. Added Next.js standalone output and a Node 24 Docker image running as the unprivileged `node` user. Static/public assets are copied explicitly. Environment files, dependencies, build output and local data are excluded from the Docker context.
2. Added an uncached database readiness endpoint returning only healthy/unhealthy status.
3. Moved the Vercel apex-to-www redirect into Next.js, scoped to requests whose host is `acctrise.com`. The temporary Railway host remains usable. Validate this again with the real domain before final cutover acceptance.
4. Fixed a reproduced proxy-origin defect: verification redirects used `https://0.0.0.0:3000`. Verification redirects and the payment-return fallback now use the trusted `NEXTAUTH_URL`. Email link construction shares the same helper.
5. Added `scripts/migration-smoke.mjs`, a repeatable HTTP acceptance suite that does not create accounts, orders, payments or completed webhook transactions.

The application baseline and lockfile are preserved. No database migration, seeding, paid provider operation, email delivery, or real financial transaction was performed.

## Environment transfer

Vercel refused to export 28 variables marked Sensitive, returning `[SENSITIVE]` placeholders. The user explicitly confirmed that the local `.env` contains production credentials. Those confirmed values were used; placeholders and Vercel-generated/OIDC/build-cache variables were not transferred. Railway readback matched all **28 imported variables** byte-for-byte against the intended values. This is not an independent equality check against Vercel's unreadable secret values.

Imported names:

```text
BULKACC_API_KEY CRON_SECRET GRIZZLY_SMS_API_KEY JUSTANOTHERPANEL_API_KEY
JWT_SECRET LOGS_PROVIDER LOGS_PROVIDER_API_KEY LOG_LEVEL MONGODB_URI
NEXTAUTH_SECRET NEXTAUTH_URL NODE_ENV NUMBER_PROVIDER NUMBER_PROVIDER_API_KEY
PAYMENT_FALLBACK_EMAIL POCKETFI_BASE_URL POCKETFI_BUSINESS_ID
POCKETFI_FALLBACK_PHONE POCKETFI_MODE POCKETFI_PUBLIC_KEY POCKETFI_SECRET_KEY
SERVICE_SYNC_INTERVAL_MINUTES SMM_PROVIDER SMM_PROVIDER_API_KEY
SMSBOWER_API_KEY SMSPOOL_API_KEY PORT HOSTNAME
```

Explicit platform adjustments: `NEXTAUTH_URL=https://acctrise-production.up.railway.app`, `NODE_ENV=production`, `LOG_LEVEL=info`, `PORT=3000`, `HOSTNAME=0.0.0.0`.

- `REDIS_URL` was not imported: the local value points to localhost and would be invalid on Railway. Redis/BullMQ modules have no callers in this release's web runtime. Supply the actual production Redis endpoint before separately enabling workers.
- `RESELLER_SMM_API_KEY` has no local value and no source references in this release; it remains unavailable. Restore it from its issuer if a future release requires it.
- `RESEND_API_KEY` is absent from Vercel production's variable list and empty locally. Email is consequently disabled, consistent with the inspected configuration. Email verification/reset delivery requires a valid key and verified sender before it can be accepted as working.
- MongoDB remains the existing external database; no replacement database was provisioned. Railway can ping it successfully even though the initial workstation probe timed out.

## Test evidence

The corrected deployment passed **39/39 HTTP checks**: public pages and security headers; all ten dashboard redirects; ten unauthorized API checks; input validation for registration/forgot/reset; auth session/provider URLs; Secure, HttpOnly, SameSite cookies; email verification redirect; absent cron; unsigned webhook handling; 404 behavior; and linked JavaScript/CSS/public assets. Evidence: `docs/railway-smoke-results.json`.

Additional checks:

| Check | Result |
| --- | --- |
| Signed PocketFi pending event | HTTP 200, `pending: true`; no transaction processing |
| Invalid PocketFi signature | Rejected with HTTP 500 and signature error; existing behavior, should use an appropriate 4xx response in a follow-up |
| Never-issued verification token | HTTP 307 to the correct Railway login URL with `verified=invalid` |
| Final configuration redeployment | `SUCCESS`; health HTTP 200, home HTTP 200, providers HTTP 200, correct verification redirect |
| Runtime logs | Container starts normally; no errors in the bounded final log inspection |
| Build | Remote Node 24 production builds and TypeScript validation succeeded |

Limitations: the user elected to continue without a test account. Successful login, role-specific screens, wallet/order reads and writes, checkout return, completed/duplicate payment webhooks, email delivery, and provider purchases are unverified. Browser automation had no available browser, so visual rendering, hydration, browser console and mobile interactions were not verified. SSH diagnostics for provider egress timed out; therefore GrizzlySMS, SMSBower, Bulkacc, JustAnotherPanel, PocketFi API access and exchange-rate retrieval from the container remain unverified. The temporary SSH key was revoked after the attempt.

## Before domain cutover

1. Complete signed-in browser acceptance with a dedicated account: login/logout, roles, service listings, wallet, order history, and checkout. Verify that provider dashboards allow Railway egress; MongoDB connectivity alone does not prove provider connectivity.
2. Confirm the PocketFi merchant webhook is `https://www.acctrise.com/api/webhooks/payments`. Its configured external URL could not be inspected. Leave current delivery unchanged during parallel testing. Arrange an authorized test event/transaction and verify completed and duplicate delivery, callback handling, and background `after()` work before moving traffic.
3. Resolve or explicitly accept existing dependency advisories. `npm audit --omit=dev` reported six affected packages: one critical, four high, one moderate. NextAuth and Next.js are among them. Severity does not establish that every advisory is exploitable in this credentials-only app. The exact production lockfile was retained; upgrades need a separately verified change. See `docs/npm-audit-production.json`.
4. Decide whether to enable email delivery by configuring Resend. This is an existing production gap, not a successful migration test.
5. At the separately authorized cutover, add both custom domains in Railway and use Railway's actual returned verification/routing records. Set Railway `NEXTAUTH_URL=https://www.acctrise.com`; keep `NEXTAUTH_SECRET` unchanged. Verify HTTPS, apex 308 including paths/query strings, cookies, callbacks, and webhook delivery on the canonical host.
6. Keep the Vercel deployment and original DNS records available for rollback. Database state is shared, so DNS rollback does not roll back data changes.
7. Establish future deployment automation on the reviewed migration branch only after review. Do not reconnect Railway directly to the newer `main` until its pricing/cron changes are intended. No branch was pushed and no Vercel rebuild was triggered by this work.

## Repeat deployment and tests

Run from this migration worktree after reviewing changes:

```powershell
railway up --project 4df01a9a-d8c6-4a0e-81d1-3bdbff565763 --environment 65e0fd03-ff0a-41da-a1c5-48301b097070 --service b31a06a4-6f4b-4112-8016-39ccb58fd249 --detach --message "Reviewed production migration update"
railway deployment list --project 4df01a9a-d8c6-4a0e-81d1-3bdbff565763 --environment 65e0fd03-ff0a-41da-a1c5-48301b097070 --service b31a06a4-6f4b-4112-8016-39ccb58fd249 --json
node scripts/migration-smoke.mjs https://acctrise-production.up.railway.app
```

Wait for a terminal `SUCCESS`; an upload acknowledgement is not deployment success. The service settings were applied with the Railway CLI and read back; there is no generated TypeScript IaC configuration to apply. See [Railway configuration](https://docs.railway.com/cli/environment) and [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting) for platform behavior.
