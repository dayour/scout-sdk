import httpx
import pytest

from scout_sdk import ScoutClient, AsyncScoutClient
from scout_sdk.policy import default_policy, to_windows_registry, render_policy


def handler(request: httpx.Request) -> httpx.Response:
    path = request.url.path
    if path == "/scout/health":
        return httpx.Response(200, json={"status": "ok", "component": "scout-api", "version": "1.0.0", "fleetNodes": 1, "controlAgents": 1})
    if path == "/scout/nodes":
        return httpx.Response(200, json=[{"id": "smax-scout", "name": "smax", "platform": "windows", "status": "online", "frontierEnabled": True}])
    if path == "/scout/tasks" and request.method == "POST":
        return httpx.Response(200, json={"id": "task-1", "title": "build", "status": "succeeded", "payload": {}})
    if path.startswith("/scout/tasks/"):
        return httpx.Response(200, json={"id": "task-1", "title": "build", "status": "succeeded", "payload": {}})
    if path == "/scout/policy":
        return httpx.Response(200, json=default_policy().model_dump())
    return httpx.Response(404, json={"detail": "not found"})


def make_client() -> ScoutClient:
    return ScoutClient(base_url="http://host:9000", transport=httpx.MockTransport(handler))


def test_health():
    with make_client() as c:
        assert c.health().status == "ok"


def test_nodes():
    with make_client() as c:
        nodes = c.nodes()
        assert nodes[0].id == "smax-scout"
        assert nodes[0].platform == "windows"


def test_dispatch_and_wait():
    with make_client() as c:
        task = c.dispatch_and_wait("build", poll=0.01)
        assert task.status == "succeeded"


def test_fleet_summary():
    with make_client() as c:
        summary = c.fleet_summary()
        assert summary["total"] == 1
        assert summary["byPlatform"]["windows"] == 1


def test_policy_helpers():
    reg = to_windows_registry(default_policy())
    assert reg["AllowScoutFrontierAccess"] == 1
    assert render_policy(default_policy(), "linux")["path"] == "/etc/clawpilot/policy.json"


@pytest.mark.asyncio
async def test_async_health():
    async with AsyncScoutClient(base_url="http://host:9000", transport=httpx.MockTransport(handler)) as c:
        health = await c.health()
        assert health.status == "ok"
