---
id: python
title: Python SDK
---

# Python SDK

A complete sync + async SDK with pydantic models.

```bash
pip install ./python      # or: pip install scout-sdk (once published)
```

## Sync

```python
import os
from scout_sdk import ScoutClient, default_policy, render_policy

with ScoutClient(
    os.environ["SCOUT_GATEWAY"],
    token=os.environ.get("SCOUT_TOKEN"),
) as scout:
    print(scout.health())
    for node in scout.nodes():
        print(node.id, node.platform, node.status)

    task = scout.dispatch_and_wait("prep weekly review")
    print(task.status, task.result)

    print(render_policy(default_policy(), "linux"))   # /etc/clawpilot/policy.json
    print(scout.fleet_summary())
```

## Async

```python
import asyncio
import os
from scout_sdk import AsyncScoutClient

async def main():
    async with AsyncScoutClient(os.environ["SCOUT_GATEWAY"]) as scout:
        print(await scout.health())
        task = await scout.dispatch("build")
        print(await scout.wait_for_task(task.id))

asyncio.run(main())
```

## Models

`ScoutPolicy`, `ScoutNode`, `ScoutTask`, `ScoutHealth`, `ScoutCatalog`,
`ScoutFleet` are pydantic v2 models. Policy helpers: `default_policy`,
`render_policy`, `to_windows_registry`, `to_macos_defaults`.

Set `SCOUT_GATEWAY` to the deployment-specific control-plane origin and use
`SCOUT_TOKEN` only when the gateway requires bearer authentication.
