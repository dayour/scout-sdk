"""Typed errors for the Scout SDK."""
from __future__ import annotations

from typing import Any


class ScoutError(Exception):
    """Base class for all Scout SDK errors."""


class ScoutApiError(ScoutError):
    """A non-2xx response from the Scout API."""

    def __init__(self, message: str, status: int, url: str, body: Any = None) -> None:
        super().__init__(message)
        self.status = status
        self.url = url
        self.body = body


class ScoutTimeoutError(ScoutError):
    """An operation (e.g. waiting for a task) exceeded its deadline."""
