# scout-sdk (Python)

```bash
pip install ./python     # from the repo root, or: pip install scout-sdk (once published)
```

## Sync

```python
from scout_sdk import ScoutClient, default_policy, render_policy

with ScoutClient("http://10.1.8.69:9000") as scout:
    print(scout.health())
    for node in scout.nodes():
        print(node.id, node.platform, node.status)

    task = scout.dispatch_and_wait("prep weekly review")
    print(task.status, task.result)

    print(render_policy(default_policy(), "linux"))   # /etc/clawpilot/policy.json
```

## Async

```python
import asyncio
from scout_sdk import AsyncScoutClient

async def main():
    async with AsyncScoutClient("http://10.1.8.69:9000") as scout:
        print(await scout.health())
        print(await scout.nodes())

asyncio.run(main())
```

## Auth

```python
ScoutClient("http://10.1.8.69:9000", token="<bearer>")
```
