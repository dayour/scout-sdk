---
id: client
title: ScoutClient
---

# ScoutClient

```ts
import { ScoutClient } from "scout-sdk";

const gateway = process.env.SCOUT_GATEWAY;
if (!gateway) throw new Error("SCOUT_GATEWAY is required");

const scout = new ScoutClient({
  baseUrl: gateway,
  token: process.env.SCOUT_TOKEN, // optional, sets Authorization
  timeoutMs: 60000,
  retry: { retries: 3 },       // merged with defaults
  onResponse: (ctx) => console.log(ctx.status, ctx.url),
});
```

## Endpoints

| Method | Endpoint |
|--------|----------|
| `health()` | `GET /scout/health` |
| `info()` / `manifest()` / `schema()` | `GET /scout/{info,manifest,schema}` |
| `catalog()` | `GET /scout/catalog` |
| `fleet()` | `GET /scout/fleet` |
| `listNodes()` / `getNode(id)` | `GET /scout/nodes[/{id}]` |
| `listAgents()` | `GET /scout/agents` |
| `getPolicy(allowFrontier?)` | `GET /scout/policy` |
| `renderPolicy(platform, policy?)` | `POST /scout/policy/render` |
| `listSessions()` / `openSession(req)` | `GET/POST /scout/sessions` |
| `listTasks()` / `dispatchTask(req)` / `getTask(id)` | `GET/POST /scout/tasks` |

## Helpers

```ts
// Poll until terminal (succeeded | failed | cancelled)
const task = await scout.waitForTask("task-123", { pollMs: 1000, timeoutMs: 120000 });

// Dispatch + wait in one call
const done = await scout.dispatchAndWait({ title: "build", prompt: "compile and test" });

// Fleet rollup
const summary = await scout.fleetSummary();
// { total, online, frontierEnabled, byPlatform: { windows: 1, ... } }
```
