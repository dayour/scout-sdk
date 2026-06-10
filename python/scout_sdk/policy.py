"""Managed-policy helpers (mirror of the TypeScript policy module)."""
from __future__ import annotations

from typing import Any, Dict

from .models import ScoutPolicy

SCOUT_POLICY_LINUX_PATH = "/etc/clawpilot/policy.json"
SCOUT_POLICY_WINDOWS_KEY = r"HKLM\SOFTWARE\Policies\Scout"
SCOUT_POLICY_MACOS_DOMAIN = "com.microsoft.clawpilot"


def default_policy(allow_frontier: bool = True) -> ScoutPolicy:
    return ScoutPolicy(allowScoutFrontierAccess=allow_frontier)


def to_windows_registry(p: ScoutPolicy) -> Dict[str, Any]:
    def csv(v: list[str]) -> str:
        return ",".join(v)

    return {
        "PolicyVersion": p.version,
        "AllowScoutFrontierAccess": 1 if p.allowScoutFrontierAccess else 0,
        "ForcePrompt": 1 if p.forcePrompt else 0,
        "RestrictToWorkspace": 1 if p.restrictToWorkspace else 0,
        "DisableHeartbeat": 1 if p.disableHeartbeat else 0,
        "DisableWorkflows": 1 if p.disableAutomations else 0,
        "DisabledServers": csv(p.disabledServers),
        "DisabledModels": csv(p.disabledModels),
        "DisabledProviders": csv(p.disabledProviders),
        "DisabledPermissions": csv(p.disabledPermissionKinds),
        "BrowserEgressBlockedOrigins": csv(p.browserEgressBlockedOrigins),
    }


def to_macos_defaults(p: ScoutPolicy) -> Dict[str, Any]:
    return {
        "PolicyVersion": p.version,
        "AllowScoutFrontierAccess": p.allowScoutFrontierAccess,
        "ForcePrompt": p.forcePrompt,
        "RestrictToWorkspace": p.restrictToWorkspace,
        "DisableHeartbeat": p.disableHeartbeat,
        "DisableWorkflows": p.disableAutomations,
        "DisabledServers": p.disabledServers,
        "DisabledModels": p.disabledModels,
        "DisabledProviders": p.disabledProviders,
        "DisabledPermissions": p.disabledPermissionKinds,
        "BrowserEgressBlockedOrigins": p.browserEgressBlockedOrigins,
    }


def render_policy(p: ScoutPolicy, platform: str) -> Dict[str, Any]:
    if platform == "linux":
        return {"path": SCOUT_POLICY_LINUX_PATH, "format": "json", "content": p.model_dump()}
    if platform == "windows":
        return {"path": SCOUT_POLICY_WINDOWS_KEY, "format": "registry", "values": to_windows_registry(p)}
    if platform == "macos":
        return {"domain": SCOUT_POLICY_MACOS_DOMAIN, "format": "managed-preferences", "values": to_macos_defaults(p)}
    raise ValueError(f"unknown platform: {platform}")
