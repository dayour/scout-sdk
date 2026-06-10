"""Asynchronous Scout control-plane client (httpx.AsyncClient)."""
from __future__ import annotations

import asyncio
from typing import Any, Dict, List, Optional

import httpx

from .errors import ScoutApiError, ScoutTimeoutError
from .models import ScoutCatalog, ScoutHealth, ScoutNode, ScoutPolicy, ScoutTask, TERMINAL_TASK_STATES


class AsyncScoutClient:
    """Async client for the gateway scout-api under /scout."""

    def __init__(
        self,
        base_url: str = "http://localhost:9000",
        timeout: float = 60.0,
        token: Optional[str] = None,
        transport: Optional[httpx.AsyncBaseTransport] = None,
    ) -> None:
        self.base = base_url.rstrip("/") + "/scout"
        headers = {"accept": "application/json"}
        if token:
            headers["authorization"] = f"Bearer {token}"
        self._client = httpx.AsyncClient(timeout=timeout, headers=headers, transport=transport)

    async def aclose(self) -> None:
        await self._client.aclose()

    async def __aenter__(self) -> "AsyncScoutClient":
        return self

    async def __aexit__(self, *exc: object) -> None:
        await self.aclose()

    async def _get(self, path: str, **params: Any) -> Any:
        r = await self._client.get(self.base + path, params=params or None)
        self._raise(r)
        return r.json()

    async def _post(self, path: str, body: Dict[str, Any]) -> Any:
        r = await self._client.post(self.base + path, json=body)
        self._raise(r)
        return r.json()

    @staticmethod
    def _raise(r: httpx.Response) -> None:
        if r.is_success:
            return
        try:
            body: Any = r.json()
        except Exception:
            body = r.text
        raise ScoutApiError(f"scout-api {r.status_code} on {r.request.method} {r.request.url.path}", r.status_code, str(r.request.url), body)

    async def health(self) -> ScoutHealth:
        return ScoutHealth(**await self._get("/health"))

    async def catalog(self) -> ScoutCatalog:
        return ScoutCatalog(**await self._get("/catalog"))

    async def nodes(self) -> List[ScoutNode]:
        return [ScoutNode(**n) for n in await self._get("/nodes")]

    async def policy(self, allow_frontier: bool = True) -> ScoutPolicy:
        return ScoutPolicy(**await self._get("/policy", allowFrontier=str(allow_frontier).lower()))

    async def dispatch(self, title: str, prompt: Optional[str] = None, node_id: Optional[str] = None) -> ScoutTask:
        return ScoutTask(**await self._post("/tasks", {"title": title, "prompt": prompt, "nodeId": node_id}))

    async def task(self, task_id: str) -> ScoutTask:
        return ScoutTask(**await self._get(f"/tasks/{task_id}"))

    async def wait_for_task(self, task_id: str, poll: float = 1.0, timeout: float = 120.0) -> ScoutTask:
        loop = asyncio.get_event_loop()
        deadline = loop.time() + timeout
        while True:
            t = await self.task(task_id)
            if t.status in TERMINAL_TASK_STATES:
                return t
            if loop.time() > deadline:
                raise ScoutTimeoutError(f"task {task_id} did not finish in time")
            await asyncio.sleep(poll)
