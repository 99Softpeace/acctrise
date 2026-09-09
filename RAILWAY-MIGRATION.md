# Acctrise Railway production

Acctrise runs on Railway and uses `www.acctrise.com` as its canonical production URL.

## Production resources

| Item | Value |
| --- | --- |
| Railway project | `hospitable-heart` / `4df01a9a-d8c6-4a0e-81d1-3bdbff565763` |
| Environment | `production` / `65e0fd03-ff0a-41da-a1c5-48301b097070` |
| Web service | `acctrise` / `b31a06a4-6f4b-4112-8016-39ccb58fd249` |
| GitHub source | `99Softpeace/acctrise`, branch `main` |
| Canonical URL | `https://www.acctrise.com` |
| Railway URL | `https://acctrise-production.up.railway.app` |
| Health check | `/api/health` |

## Build and runtime

Railway reads the committed `railway.json` and builds the multi-stage `Dockerfile`.
Next.js uses standalone output and starts as the unprivileged `node` user with
`node server.js` on port 3000. Railway gates deployments on `/api/health`, which
checks required auth configuration and MongoDB connectivity.

The service is connected to GitHub. Successful pushes to `main` trigger Railway
deployments automatically. Always verify the exact new deployment reaches
`SUCCESS`; a successful Git push alone is not proof that production updated.

## Required production configuration

Store credentials only in Railway variables. At minimum, production requires:

- `NODE_ENV=production`
- `NEXTAUTH_URL=https://www.acctrise.com`
- `NEXTAUTH_SECRET`
- `MONGODB_URI`
- `CRON_SECRET`
- the enabled payment, email, number, logs, and boosting provider credentials

Keep `NEXTAUTH_SECRET` stable between deployments. The application constructs
verification redirects and payment-return URLs from `NEXTAUTH_URL` so proxy
headers or the internal container address cannot leak into customer callbacks.

## Verification

Run the non-mutating production smoke suite after a deployment:

```powershell
node scripts/migration-smoke.mjs https://www.acctrise.com
```

The suite checks public pages, protected redirects, unauthorized API behavior,
authentication origins and cookies, the secured cron endpoint, webhook rejection,
health, missing routes, and static assets. It does not create users, orders,
payments, or provider purchases.

Useful Railway checks:

```powershell
npx @railway/cli deployment list --project 4df01a9a-d8c6-4a0e-81d1-3bdbff565763 --environment 65e0fd03-ff0a-41da-a1c5-48301b097070 --service b31a06a4-6f4b-4112-8016-39ccb58fd249 --json
npx @railway/cli logs --project 4df01a9a-d8c6-4a0e-81d1-3bdbff565763 --environment 65e0fd03-ff0a-41da-a1c5-48301b097070 --service b31a06a4-6f4b-4112-8016-39ccb58fd249 --lines 100 --json
```

## Scheduled boosting synchronization

`/api/cron/sync-boosting` is retained as a secured endpoint and rejects requests
without `Authorization: Bearer <CRON_SECRET>`. Schedule it through a dedicated
Railway cron service or another trusted scheduler; do not convert the persistent
web service itself into a cron service.

## Legacy platform cleanup

The repository-level Vercel configuration has been removed. Railway is the
canonical deployment target. Any remaining Vercel project integration should be
disabled separately so it no longer creates deployment checks for `main`.
