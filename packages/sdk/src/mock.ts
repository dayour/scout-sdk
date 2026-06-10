import type { ScoutNode, ScoutTask } from "./types.js";

export interface MockOptions {
  nodes?: ScoutNode[];
}

const defaultNodes: ScoutNode[] = [
  {
    id: "smax-scout",
    name: "smax (Microsoft Scout)",
    platform: "windows",
    ip: "192.0.2.10",
    scoutVersion: "0.22.333",
    status: "online",
    frontierEnabled: true,
    capabilities: ["file_system", "shell", "browser_automation"],
    labels: { fleet: "microsoft-scout" },
    endpoints: {},
  },
];

/**
 * Build an in-memory fake `fetch` that serves canned `/scout/*` responses,
 * including a tiny task store so `dispatchTask` -> `getTask` (and `waitForTask`)
 * work without a live gateway. Useful for tests, demos, and examples.
 */
export function createMockFetch(options: MockOptions = {}): typeof fetch {
  const nodes = options.nodes ?? defaultNodes;
  const tasks = new Map<string, ScoutTask>();

  const json = (body: unknown, status = 200): Response =>
    new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

  const handler = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const href = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const url = new URL(href);
    const path = url.pathname.replace(/^\/scout/, "");
    const method = (init?.method ?? "GET").toUpperCase();
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;

    if (path === "/health")
      return json({ status: "ok", component: "scout-api", version: "1.0.0", fleetNodes: nodes.length, controlAgents: 1 });
    if (path === "/info") return json({ name: "DarbotLM Scout", surfaces: {} });
    if (path === "/catalog")
      return json({ counts: { service: 2, agent: 1 }, resources: [], generatedAt: new Date().toISOString() });
    if (path === "/fleet") return json({ nodes, agents: [] });
    if (path === "/nodes") return json(nodes);
    if (path.startsWith("/nodes/")) {
      const id = decodeURIComponent(path.slice("/nodes/".length));
      const node = nodes.find((n) => n.id === id);
      return node ? json(node) : json({ detail: `not found: ${id}` }, 404);
    }
    if (path === "/agents") return json([]);
    if (path === "/policy")
      return json({
        version: 1,
        allowScoutFrontierAccess: true,
        forcePrompt: false,
        restrictToWorkspace: false,
        disableHeartbeat: false,
        disableAutomations: false,
        disabledServers: [],
        disabledModels: [],
        disabledProviders: [],
        disabledPermissionKinds: [],
        browserEgressBlockedOrigins: [],
      });
    if (path === "/policy/render" && method === "POST")
      return json({ platform: body?.platform, render: { path: "/etc/clawpilot/policy.json", format: "json" } });
    if (path === "/sessions" && method === "GET") return json([]);
    if (path === "/sessions" && method === "POST")
      return json({ id: "sess-mock", status: "active", startedAt: new Date().toISOString() });
    if (path === "/tasks" && method === "GET") return json([...tasks.values()]);
    if (path === "/tasks" && method === "POST") {
      const id = `task-${tasks.size + 1}`;
      const now = new Date().toISOString();
      const task: ScoutTask = {
        id,
        title: String(body?.title ?? "task"),
        status: "succeeded",
        nodeId: body?.nodeId,
        prompt: body?.prompt,
        payload: {},
        result: { executor: "mock" },
        createdAt: now,
        updatedAt: now,
      };
      tasks.set(id, task);
      return json(task);
    }
    if (path.startsWith("/tasks/")) {
      const id = decodeURIComponent(path.slice("/tasks/".length));
      const task = tasks.get(id);
      return task ? json(task) : json({ detail: `not found: ${id}` }, 404);
    }
    return json({ detail: `mock: unhandled ${method} ${path}` }, 404);
  };

  return handler as unknown as typeof fetch;
}
