"""Pydantic models mirroring the Scout Cloud Object Model (scloud-om)."""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

TERMINAL_TASK_STATES = {"succeeded", "failed", "cancelled"}


class ScoutPolicy(BaseModel):
    version: int = 1
    allowScoutFrontierAccess: bool = False
    forcePrompt: bool = False
    restrictToWorkspace: bool = False
    disableHeartbeat: bool = False
    disableAutomations: bool = False
    disabledServers: List[str] = Field(default_factory=list)
    disabledModels: List[str] = Field(default_factory=list)
    disabledProviders: List[str] = Field(default_factory=list)
    disabledPermissionKinds: List[str] = Field(default_factory=list)
    browserEgressBlockedOrigins: List[str] = Field(default_factory=list)


class ScoutNode(BaseModel):
    id: str
    name: str
    platform: str
    host: Optional[str] = None
    ip: Optional[str] = None
    scoutVersion: Optional[str] = None
    status: str = "unknown"
    frontierEnabled: bool = False
    githubLogin: Optional[str] = None
    capabilities: List[str] = Field(default_factory=list)
    labels: Dict[str, str] = Field(default_factory=dict)
    endpoints: Dict[str, str] = Field(default_factory=dict)


class ScoutTask(BaseModel):
    id: str
    title: str
    status: str = "pending"
    nodeId: Optional[str] = None
    prompt: Optional[str] = None
    payload: Dict[str, Any] = Field(default_factory=dict)
    result: Optional[Dict[str, Any]] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None


class ScoutHealth(BaseModel):
    status: str
    component: str
    version: str
    fleetNodes: int
    controlAgents: int


class ScoutCatalog(BaseModel):
    counts: Dict[str, int] = Field(default_factory=dict)
    resources: List[Dict[str, Any]] = Field(default_factory=list)
    generatedAt: Optional[str] = None


class ScoutFleet(BaseModel):
    nodes: List[ScoutNode] = Field(default_factory=list)
    agents: List[Dict[str, Any]] = Field(default_factory=list)
