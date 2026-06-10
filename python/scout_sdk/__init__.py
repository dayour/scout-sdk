"""scout-sdk - Python SDK for the DarbotLM Scout control plane."""
from __future__ import annotations

__version__ = "0.1.0"

from .client import ScoutClient
from .aio import AsyncScoutClient
from .errors import ScoutError, ScoutApiError
from .models import ScoutPolicy, ScoutNode, ScoutTask, ScoutHealth, ScoutCatalog, ScoutFleet
from .policy import default_policy, render_policy, to_windows_registry, to_macos_defaults

__all__ = [
    "__version__",
    "ScoutClient",
    "AsyncScoutClient",
    "ScoutError",
    "ScoutApiError",
    "ScoutPolicy",
    "ScoutNode",
    "ScoutTask",
    "ScoutHealth",
    "ScoutCatalog",
    "ScoutFleet",
    "default_policy",
    "render_policy",
    "to_windows_registry",
    "to_macos_defaults",
]
