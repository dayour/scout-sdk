---
id: getting-started
title: Getting started
---

# Getting started

```bash
git clone https://github.com/dayour/scout-sdk.git
cd scout-sdk
npm install
npm run build
npm test
npm run docs:build
```

## TypeScript

```ts
import { ScoutClient, defaultPolicy, renderPolicy } from "scout-sdk";

const scout = new ScoutClient({ baseUrl: "https://scout-gateway.example.com" });

const health = await scout.health();
const catalog = await scout.catalog();              // every DLMCP resource
const nodes = await scout.listNodes();               // the Microsoft Scout fleet

// Dispatch a task and wait for it to finish
const task = await scout.dispatchAndWait({ title: "prep weekly review" });

// Render the Linux managed policy
console.log(renderPolicy(defaultPolicy(), "linux"));  // /etc/clawpilot/policy.json
```

## Without a gateway (mock)

```ts
import { ScoutClient, createMockFetch } from "scout-sdk";

const scout = new ScoutClient({ baseUrl: "http://mock", fetch: createMockFetch() });
console.log(await scout.health());        // { status: "ok", ... }
```

## Python

```bash
pip install ./python
```

```python
from scout_sdk import ScoutClient
with ScoutClient("https://scout-gateway.example.com") as scout:
    print(scout.health())
```
