/**
 * scout-sdk basic example (uses the built-in mock; no gateway needed).
 * Build first (npm run build), then: npx tsx examples/basic.ts
 */
import { ScoutClient, createMockFetch, defaultPolicy, renderPolicy } from "scout-sdk";

const scout = new ScoutClient({
  baseUrl: process.env.SCOUT_GATEWAY ?? "http://mock",
  fetch: process.env.SCOUT_GATEWAY ? undefined : createMockFetch(),
  onResponse: (ctx) => console.log(`<- ${ctx.status} ${ctx.url} (${ctx.durationMs}ms)`),
});

console.log("health:", await scout.health());
console.log("fleet:", await scout.fleetSummary());

const task = await scout.dispatchAndWait({ title: "demo task", prompt: "summarize open work" }, { pollMs: 50 });
console.log("task:", task.id, task.status);

console.log("linux policy path:", renderPolicy(defaultPolicy(), "linux").path);
