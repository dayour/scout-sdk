import { describe, expect, it } from "vitest";
import { defaultPolicy, parsePolicy, toWindowsRegistry, toMacosDefaults, renderPolicy, diffPolicy } from "../src/policy.js";
import { textMessage, newTask, messageText, A2A_PROTOCOL_VERSION } from "../src/a2a.js";

describe("policy", () => {
  it("defaults enable Frontier", () => {
    expect(defaultPolicy().allowScoutFrontierAccess).toBe(true);
    expect(defaultPolicy(false).allowScoutFrontierAccess).toBe(false);
  });

  it("parsePolicy fills defaults", () => {
    const p = parsePolicy({ forcePrompt: true });
    expect(p.forcePrompt).toBe(true);
    expect(p.version).toBe(1);
    expect(p.disabledServers).toEqual([]);
  });

  it("renders Windows registry (PascalCase + DWORD)", () => {
    const reg = toWindowsRegistry(defaultPolicy());
    expect(reg.AllowScoutFrontierAccess).toBe(1);
    expect(reg.DisableWorkflows).toBe(0);
    expect(reg.DisabledServers).toBe("");
  });

  it("renders macOS defaults and the Linux path", () => {
    expect(toMacosDefaults(defaultPolicy()).AllowScoutFrontierAccess).toBe(true);
    expect(renderPolicy(defaultPolicy(), "linux").path).toBe("/etc/clawpilot/policy.json");
    expect(renderPolicy(defaultPolicy(), "macos").domain).toBe("com.microsoft.clawpilot");
  });

  it("diffPolicy reports changed keys", () => {
    const a = defaultPolicy();
    const b = { ...a, forcePrompt: true, disabledServers: ["filesystem"] };
    expect(diffPolicy(a, b).sort()).toEqual(["disabledServers", "forcePrompt"]);
  });
});

describe("a2a", () => {
  it("builds text messages and tasks", () => {
    const msg = textMessage("hello");
    expect(msg.protocol).toBe(A2A_PROTOCOL_VERSION);
    expect(messageText(msg)).toBe("hello");
    const task = newTask(msg);
    expect(task.state).toBe("submitted");
    expect(task.messages[0]?.taskId).toBe(task.id);
  });
});
