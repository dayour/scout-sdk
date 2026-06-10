"""scout-sdk Python example (uses an httpx mock transport; no gateway needed).

Run: python examples/example.py
"""
import httpx

from scout_sdk import ScoutClient
from scout_sdk.policy import default_policy, render_policy


def handler(request: httpx.Request) -> httpx.Response:
    if request.url.path == "/scout/health":
        return httpx.Response(200, json={"status": "ok", "component": "scout-api", "version": "1.0.0", "fleetNodes": 1, "controlAgents": 1})
    if request.url.path == "/scout/nodes":
        return httpx.Response(200, json=[{"id": "smax-scout", "name": "smax", "platform": "windows", "status": "online", "frontierEnabled": True}])
    return httpx.Response(404, json={"detail": "not found"})


with ScoutClient("http://mock", transport=httpx.MockTransport(handler)) as scout:
    print("health:", scout.health())
    print("fleet:", scout.fleet_summary())
    print("linux policy:", render_policy(default_policy(), "linux")["path"])
