/**
 * scout-sdk - the canonical SDK for the DarbotLM Scout control plane.
 *
 * @example
 * import { ScoutClient } from "scout-sdk";
 * const gateway = process.env.SCOUT_GATEWAY;
 * if (!gateway) throw new Error("SCOUT_GATEWAY is required");
 * const scout = new ScoutClient({ baseUrl: gateway });
 * const health = await scout.health();
 */
export const VERSION = "0.1.0";

export * from "./types.js";
export * from "./errors.js";
export * from "./http.js";
export * from "./client.js";
export * from "./a2a.js";
export * from "./a2a-client.js";
export * from "./policy.js";
export * from "./mock.js";
