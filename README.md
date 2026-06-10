# scout-sdk

The canonical SDK for the **DarbotLM Scout control plane** (scout-api). TypeScript
first, with a complete Python SDK alongside.

Part of the Scout stack: [scout-swe](https://github.com/dayour/scout-swe),
[aether](https://github.com/dayour/aether), [weave](https://github.com/dayour/weave),
[scout-cli](https://github.com/dayour/scout-cli), [scout-app](https://github.com/dayour/scout-app).

## Features

- **Typed client** for every `/scout/*` endpoint
- **Retries** (exponential backoff + jitter), configurable timeout, request/response hooks
- **Typed errors**: `ScoutApiError`, `ScoutTimeoutError`, `ScoutNetworkError`
- **Task helpers**: `waitForTask`, `dispatchAndWait`, `fleetSummary`
- **Agent2Agent (A2A)** types + client
- **Managed-policy** model + render (Linux / Windows / macOS) + `diffPolicy`
- **Built-in mock** (`createMockFetch`) - run with no gateway
- **Python SDK** (sync + async) with pydantic models
- **OpenAPI** spec at `openapi/scout-api.yaml`

## Layout

```
packages/sdk/      scout-sdk (TypeScript): client, http(retry), a2a, policy, mock, types
python/            scout_sdk (Python): client (sync) + aio (async) + models + policy
openapi/           scout-api.yaml (OpenAPI 3)
docs/              Docusaurus reference
examples/          runnable examples
```

## TypeScript

```bash
npm install        # workspace install
npm run build      # tsc -b
npm test           # vitest
```

```ts
import { ScoutClient, defaultPolicy, renderPolicy } from "scout-sdk";

const scout = new ScoutClient({ baseUrl: "https://scout-gateway.example.com", token: process.env.SCOUT_TOKEN });
console.log(await scout.health());
console.log(await scout.fleetSummary());

const task = await scout.dispatchAndWait({ title: "prep weekly review" });
console.log(task.status);

console.log(renderPolicy(defaultPolicy(), "linux").content); // /etc/clawpilot/policy.json
```

No gateway? Use the built-in mock:

```ts
import { ScoutClient, createMockFetch } from "scout-sdk";
const scout = new ScoutClient({ baseUrl: "http://mock", fetch: createMockFetch() });
```

## Python

```bash
pip install ./python
```

```python
from scout_sdk import ScoutClient
with ScoutClient("https://scout-gateway.example.com") as scout:
    print(scout.health())
    print(scout.fleet_summary())
```

## Documentation

`npm run docs:start` for the local reference site, or browse `docs/docs/`.

## License

MIT (c) 2026 Daryl Yourk. See [LICENSE](LICENSE).
