---
id: errors-and-retries
title: Errors and retries
---

# Errors and retries

## Typed errors

```ts
import { ScoutApiError, ScoutTimeoutError, ScoutNetworkError } from "scout-sdk";

try {
  await scout.getNode("missing");
} catch (err) {
  if (err instanceof ScoutApiError) {
    console.error(err.status, err.url, err.body);   // e.g. 404
  } else if (err instanceof ScoutTimeoutError) {
    console.error("timed out:", err.url);
  } else if (err instanceof ScoutNetworkError) {
    console.error("network:", err.url, err.cause);
  }
}
```

All extend `ScoutError`.

## Retries

Requests retry with exponential backoff + jitter on configurable statuses and on
network/timeout failures.

```ts
const gateway = process.env.SCOUT_GATEWAY;
if (!gateway) throw new Error("SCOUT_GATEWAY is required");

const scout = new ScoutClient({
  baseUrl: gateway,
  timeoutMs: 30000,
  retry: {
    retries: 5,
    backoffMs: 250,
    maxBackoffMs: 4000,
    retryOn: [429, 500, 502, 503, 504],
  },
});
```

Defaults: 3 retries, 250ms base, 4s cap, retry on `429/500/502/503/504`.
4xx (except 429) do not retry.

## Hooks

```ts
new ScoutClient({
  onRequest: (ctx) => console.log("->", ctx.method, ctx.url, "attempt", ctx.attempt),
  onResponse: (ctx) => console.log("<-", ctx.status, ctx.durationMs + "ms"),
});
```
