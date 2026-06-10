"""Synchronous Scout control-plane client (httpx)."""
from __future__ import annotations

import time
from typing import Any, Dict, List, Optional

import httpx

from .errors import ScoutApiError, ScoutTimeoutError
from .models import ScoutCatalog, ScoutFleet, ScoutHealth, ScoutNode, ScoutPolicy, ScoutTask, TERMINAL_TASK_STATES


class ScoutClient:
    """Synchronous client for the gateway scout-api under /scout."""

    def __init__(
        self,
        base_url: str = "http://localhost:9000",
        timeout: float = 60.0,
        token: Optional[str] = None,
        transport: Optional[httpx.BaseTransport] = None,
    ) -> None:
        self.base = base_url.rstrip("/") + "/scout"
        headers = {"accept": "application/json"}
        if token:
            headers["authorization"] = f"Bearer {token}"
        self._client = httpx.Client(timeout=timeout, headers=headers, transport=transport)

    def close(self) -> None:
        self._client.close()

    def __enter__(self) -> "ScoutClient":
        return self

    def __exit__(self, *exc: object) -> None:
        self.close()

    def _get(self, path: str, **params: Any) -> Any:
        r = self._client.get(self.base + path, params=params or None)
        self._raise(r)
        return r.json()

    def _post(self, path: str, body: Dict[str, Any]) -> Any:
        r = self._client.post(self.base + path, json=body)
        self._raise(r)
        return r.json()

    @staticmethod
    def _raise(r: httpx.Response) -> None:
        if r.is_success:
            return
        body: Any
        try:
            body = r.json()
        except Exception:
            body = r.text
        raise ScoutApiError(f"scout-api {r.status_code} on {r.request.method} {r.request.url.path}", r.status_code, str(r.request.url), body)

    # --- endpoints ---
    def health(self) -> ScoutHealth:
        return ScoutHealth(**self._get("/health"))

    def info(self) -> Dict[str, Any]:
        return self._get("/info")

    def catalog(self) -> ScoutCatalog:
        return ScoutCatalog(**self._get("/catalog"))

    def fleet(self) -> ScoutFleet:
        return ScoutFleet(**self._get("/fleet"))

    def nodes(self) -> List[ScoutNode]:
        return [ScoutNode(**n) for n in self._get("/nodes")]

    def node(self, node_id: str) -> ScoutNode:
        return ScoutNode(**self._get(f"/nodes/{node_id}"))

    def policy(self, allow_frontier: bool = True) -> ScoutPolicy:
        return ScoutPolicy(**self._get("/policy", allowFrontier=str(allow_frontier).lower()))

    def render_policy(self, platform: str, policy: Optional[ScoutPolicy] = None) -> Dict[str, Any]:
        return self._post("/policy/render", {"platform": platform, "policy": policy.model_dump() if policy else None})

    def tasks(self) -> List[ScoutTask]:
        return [ScoutTask(**t) for t in self._get("/tasks")]

    def dispatch(self, title: str, prompt: Optional[str] = None, node_id: Optional[str] = None) -> ScoutTask:
        return ScoutTask(**self._post("/tasks", {"title": title, "prompt": prompt, "nodeId": node_id}))

    def task(self, task_id: str) -> ScoutTask:
        return ScoutTask(**self._get(f"/tasks/{task_id}"))

    # --- helpers ---
    def wait_for_task(self, task_id: str, poll: float = 1.0, timeout: float = 120.0) -> ScoutTask:
        deadline = time.monotonic() + timeout
        while True:
            t = self.task(task_id)
            if t.status in TERMINAL_TASK_STATES:
                return t
            if time.monotonic() > deadline:
                raise ScoutTimeoutError(f"task {task_id} did not finish in time")
            time.sleep(poll)

    def dispatch_and_wait(self, title: str, prompt: Optional[str] = None, node_id: Optional[str] = None, poll: float = 1.0, timeout: float = 120.0) -> ScoutTask:
        t = self.dispatch(title, prompt, node_id)
        return self.wait_for_task(t.id, poll=poll, timeout=timeout)

    def fleet_summary(self) -> Dict[str, Any]:
        nodes = self.nodes()
        by_platform: Dict[str, int] = {}
        for n in nodes:
            by_platform[n.platform] = by_platform.get(n.platform, 0) + 1
        return {
            "total": len(nodes),
            "online": sum(1 for n in nodes if n.status == "online"),
            "frontierEnabled": sum(1 for n in nodes if n.frontierEnabled),
            "byPlatform": by_platform,
        }
