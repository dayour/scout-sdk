---
id: mock
title: Mock (createMockFetch)
---

# Mock

`createMockFetch()` returns a fake `fetch` that serves canned `/scout/*` responses
with a tiny in-memory task store, so you can run the SDK with no live gateway -
ideal for tests, demos, and examples.

```ts
import { ScoutClient, createMockFetch } from "scout-sdk";

const scout = new ScoutClient({ baseUrl: "http://mock", fetch: createMockFetch() });

await scout.health();                       // { status: "ok", ... }
await scout.listNodes();                     // one mock fleet node
const task = await scout.dispatchAndWait({ title: "build" }); // resolves "succeeded"
```

Override the fleet:

```ts
createMockFetch({
  nodes: [
    { id: "mac-1", name: "mac-1", platform: "macos", status: "online", frontierEnabled: true, capabilities: [], labels: {}, endpoints: {} },
  ],
});
```
