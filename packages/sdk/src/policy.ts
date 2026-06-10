import type { ScoutPlatform, ScoutPolicy } from "./types.js";

export const SCOUT_POLICY_LINUX_PATH = "/etc/clawpilot/policy.json";
export const SCOUT_POLICY_WINDOWS_KEY = "HKLM\\SOFTWARE\\Policies\\Scout";
export const SCOUT_POLICY_MACOS_DOMAIN = "com.microsoft.clawpilot";

/** Baseline managed policy (Frontier enabled, governance permissive). */
export function defaultPolicy(allowFrontier = true): ScoutPolicy {
  return {
    version: 1,
    allowScoutFrontierAccess: allowFrontier,
    forcePrompt: false,
    restrictToWorkspace: false,
    disableHeartbeat: false,
    disableAutomations: false,
    disabledServers: [],
    disabledModels: [],
    disabledProviders: [],
    disabledPermissionKinds: [],
    browserEgressBlockedOrigins: [],
  };
}

/** Normalize a partial policy into a complete one (fills defaults). */
export function parsePolicy(partial: Partial<ScoutPolicy>): ScoutPolicy {
  return { ...defaultPolicy(false), ...partial };
}

/** The exact object written to /etc/clawpilot/policy.json (camelCase). */
export function toLinuxJson(policy: ScoutPolicy): ScoutPolicy {
  return { ...policy };
}

/** Windows ADMX registry value map (PascalCase; DisableAutomations -> DisableWorkflows). */
export function toWindowsRegistry(policy: ScoutPolicy): Record<string, number | string> {
  const csv = (v: string[]) => v.join(",");
  return {
    PolicyVersion: policy.version,
    AllowScoutFrontierAccess: policy.allowScoutFrontierAccess ? 1 : 0,
    ForcePrompt: policy.forcePrompt ? 1 : 0,
    RestrictToWorkspace: policy.restrictToWorkspace ? 1 : 0,
    DisableHeartbeat: policy.disableHeartbeat ? 1 : 0,
    DisableWorkflows: policy.disableAutomations ? 1 : 0,
    DisabledServers: csv(policy.disabledServers),
    DisabledModels: csv(policy.disabledModels),
    DisabledProviders: csv(policy.disabledProviders),
    DisabledPermissions: csv(policy.disabledPermissionKinds),
    BrowserEgressBlockedOrigins: csv(policy.browserEgressBlockedOrigins),
  };
}

/** macOS managed-preferences key map for com.microsoft.clawpilot. */
export function toMacosDefaults(policy: ScoutPolicy): Record<string, unknown> {
  return {
    PolicyVersion: policy.version,
    AllowScoutFrontierAccess: policy.allowScoutFrontierAccess,
    ForcePrompt: policy.forcePrompt,
    RestrictToWorkspace: policy.restrictToWorkspace,
    DisableHeartbeat: policy.disableHeartbeat,
    DisableWorkflows: policy.disableAutomations,
    DisabledServers: policy.disabledServers,
    DisabledModels: policy.disabledModels,
    DisabledProviders: policy.disabledProviders,
    DisabledPermissions: policy.disabledPermissionKinds,
    BrowserEgressBlockedOrigins: policy.browserEgressBlockedOrigins,
  };
}

export function renderPolicy(policy: ScoutPolicy, platform: ScoutPlatform): Record<string, unknown> {
  switch (platform) {
    case "linux":
      return { path: SCOUT_POLICY_LINUX_PATH, format: "json", content: toLinuxJson(policy) };
    case "windows":
      return { path: SCOUT_POLICY_WINDOWS_KEY, format: "registry", values: toWindowsRegistry(policy) };
    case "macos":
      return { domain: SCOUT_POLICY_MACOS_DOMAIN, format: "managed-preferences", values: toMacosDefaults(policy) };
  }
}

/** Shallow diff of two policies: keys whose values differ. */
export function diffPolicy(a: ScoutPolicy, b: ScoutPolicy): string[] {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]) as Set<keyof ScoutPolicy>;
  const changed: string[] = [];
  for (const key of keys) {
    if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) changed.push(String(key));
  }
  return changed;
}
