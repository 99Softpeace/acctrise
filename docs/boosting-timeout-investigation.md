# Boosting order timeout investigation — September 9, 2026

The corrective deployment `fb276200-37eb-4cd3-9a82-dca06823a56a` reached `SUCCESS`, with its production build, TypeScript validation and database health gate passing.

The reported message came from `POST /api/orders`. Railway logged:

```text
[orders/create] Error [AxiosError]: timeout of 20000ms exceeded
code: ECONNABORTED
POST https://justanotherpanel.com/api/v2, action=services
```

The failure occurred in `resolveLiveService`, which fetches the catalog before creating the order or debiting its wallet payment. The boosting API key was present in Railway and matched the working local key. A local read returned 5,779 services. A read-only diagnostic from a Railway deployment also returned HTTP 200 and 5,779 services in 1,062 ms (normal DNS) and 1,196 ms (forced IPv4). DNS resolved to IPv4. These observations support an intermittent upstream/network timeout, not a missing credential or persistent IPv6 problem; they do not distinguish a transient provider slowdown from a transient network interruption.

The app previously fetched the complete catalog again at checkout, independently of the page-level cache. Changes:

- Cache the SMM catalog for 60 seconds at the adapter boundary, sharing a pending request across adapter instances. Scope entries by a SHA-256 hash of provider endpoint and credentials. Do not serve entries beyond the TTL or cache failures.
- Retry transient failures once for read-only `services`, `balance`, and `status` actions. Paid `add` and `cancel` actions are never automatically retried.
- Return a specific temporary-provider-delay message when retries are exhausted.
- Propagate sanitized transport errors instead of Axios objects containing request credentials.

Four local HTTP integration tests passed: shared catalog request across page/checkout instances; recovery from one timeout; failed cache recovery and credential isolation; and no retry/no credential disclosure on a failed paid request. TypeScript validation passed. Run `node node_modules/tsx/dist/cli.mjs --test scripts/test-boosting-provider.ts` to repeat them.

The diagnostic is retained as `scripts/check-boosting-provider.mjs` for manual, read-only maintenance. Its temporary pre-deploy command was removed. No boost was purchased during testing. A successful paid checkout still requires user acceptance testing.

Existing Railway error logs contained the JustAnotherPanel key in an Axios request body. Output shown during this investigation was redacted, and the changed transport no longer propagates that body. Rotate the provider key through JustAnotherPanel and update Railway's `JUSTANOTHERPANEL_API_KEY` plus the local credential source; previous stored logs are not retroactively sanitized by this code change.
