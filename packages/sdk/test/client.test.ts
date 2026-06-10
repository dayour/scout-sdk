import { describe, expect, it } from "vitest";
import { ScoutClient } from "../src/client.js";
import { createMockFetch } from "../src/mock.js";
import { ScoutApiError } from "../src/errors.js";

const newClient = () => new ScoutClient({ baseUrl: "http://host:9000", fetch: createMockFetch() });

describe("ScoutClient (mock)", () => {
  it("reads health", async () => {
    expect((await newClient().health()).status).toBe("ok");
  });

  it("lists and fetches nodes", async () => {
    const c = newClient();
    const nodes = await c.listNodes();
    expect(nodes.length).toBeGreaterThan(0);
    const node = await c.getNode(nodes[0]!.id);
    expect(node.id).toBe(nodes[0]!.id);
  });

  it("throws ScoutApiError for a missing node", async () => {
    await expect(newClient().getNode("does-not-exist")).rejects.toBeInstanceOf(ScoutApiError);
  });

  it("dispatchAndWait resolves a terminal task", async () => {
    const task = await newClient().dispatchAndWait({ title: "build" }, { pollMs: 1 });
    expect(task.status).toBe("succeeded");
    expect(task.title).toBe("build");
  });

  it("summarizes the fleet", async () => {
    const summary = await newClient().fleetSummary();
    expect(summary.total).toBeGreaterThan(0);
    expect(summary.byPlatform.windows).toBeGreaterThan(0);
    expect(summary.frontierEnabled).toBeGreaterThan(0);
  });

  it("sets a bearer token header", async () => {
    let seenAuth: string | undefined;
    const fetchSpy: typeof fetch = async (_url, init) => {
      seenAuth = (init?.headers as Record<string, string>)?.authorization;
      return new Response(JSON.stringify({ status: "ok", component: "x", version: "1", fleetNodes: 0, controlAgents: 0 }), {
        headers: { "content-type": "application/json" },
      });
    };
    await new ScoutClient({ baseUrl: "http://h", fetch: fetchSpy, token: "abc" }).health();
    expect(seenAuth).toBe("Bearer abc");
  });
});
