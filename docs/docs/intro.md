---
id: intro
title: Scout SDK
slug: /
---

# Scout SDK

The canonical SDK for the **DarbotLM Scout control plane** (scout-api). TypeScript
first, with a complete Python SDK alongside.

Part of the Scout stack: [scout-swe](https://github.com/dayour/scout-swe),
[aether](https://github.com/dayour/aether), [weave](https://github.com/dayour/weave),
[scout-cli](https://github.com/dayour/scout-cli), [scout-app](https://github.com/dayour/scout-app).

## Features

- **Typed client** for every `/scout/*` endpoint.
- **Retries** with exponential backoff + jitter, configurable timeout, request hooks.
- **Typed errors**: `ScoutApiError`, `ScoutTimeoutError`, `ScoutNetworkError`.
- **Task helpers**: `waitForTask`, `dispatchAndWait`, `fleetSummary`.
- **Agent2Agent (A2A)** types + client.
- **Managed-policy** model + render for Linux / Windows / macOS + `diffPolicy`.
- **Built-in mock** (`createMockFetch`) for tests and demos - no live gateway needed.
- **Python SDK** (sync + async) with pydantic models.
- **OpenAPI** spec in `openapi/scout-api.yaml`.

## Install (TypeScript)

```bash
npm install scout-sdk
```

```ts
import { ScoutClient } from "scout-sdk";

const scout = new ScoutClient({ baseUrl: "http://10.1.8.69:9000", token: process.env.SCOUT_TOKEN });
console.log(await scout.health());
console.log(await scout.fleetSummary());
```

Continue with [Getting started](getting-started).
