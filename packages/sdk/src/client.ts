import { defaultRetry, requestJson, type HttpOptions, type RequestContext, type ResponseContext, type RetryOptions } from "./http.js";
import { ScoutTimeoutError } from "./errors.js";
import {
  TERMINAL_TASK_STATES,
  type DispatchTaskRequest,
  type OpenSessionRequest,
  type PolicyRenderResult,
  type ScoutAgent,
  type ScoutCatalog,
  type ScoutFleet,
  type ScoutHealth,
  type ScoutNode,
  type ScoutPlatform,
  type ScoutPolicy,
  type ScoutSession,
  type ScoutTask,
} from "./types.js";

export interface ScoutClientOptions {
  /** Gateway base URL, default http://localhost:9000 */
  baseUrl?: string;
  /** Custom fetch (tests / non-global environments). */
  fetch?: typeof fetch;
  /** Extra headers on every request. */
  headers?: Record<string, string>;
  /** Bearer token (sets Authorization). */
  token?: string;
  /** Per-request timeout in ms (default 60000). */
  timeoutMs?: number;
  /** Retry overrides (merged with defaults). */
  retry?: Partial<RetryOptions>;
  onRequest?: (ctx: RequestContext) => void;
  onResponse?: (ctx: ResponseContext) => void;
}

export interface WaitOptions {
  pollMs?: number;
  timeoutMs?: number;
}

export interface FleetSummary {
  total: number;
  online: number;
  frontierEnabled: number;
  byPlatform: Record<string, number>;
}

/**
 * The canonical typed client for the DarbotLM Scout control plane (scout-api),
 * served by the gateway under `/scout`. Includes retries, typed errors, and
 * high-level task/fleet helpers.
 */
export class ScoutClient {
  readonly baseUrl: string;
  private readonly base: string;
  private readonly http: HttpOptions;

  constructor(options: ScoutClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "http://localhost:9000").replace(/\/+$/, "");
    this.base = this.baseUrl + "/scout";
    const f = options.fetch ?? globalThis.fetch;
    if (!f) throw new Error("No fetch implementation available; pass options.fetch");
    const headers: Record<string, string> = { accept: "application/json", ...options.headers };
    if (options.token) headers["authorization"] = `Bearer ${options.token}`;
    this.http = {
      fetch: f,
      headers,
      timeoutMs: options.timeoutMs ?? 60_000,
      retry: { ...defaultRetry, ...options.retry },
      onRequest: options.onRequest,
      onResponse: options.onResponse,
    };
  }

  private req<T>(method: string, path: string, body?: unknown): Promise<T> {
    return requestJson<T>(this.base + path, method, body, this.http);
  }

  // --- Health / info ---
  health(): Promise<ScoutHealth> {
    return this.req("GET", "/health");
  }
  info(): Promise<Record<string, unknown>> {
    return this.req("GET", "/info");
  }
  manifest(): Promise<Record<string, unknown>> {
    return this.req("GET", "/manifest");
  }
  schema(): Promise<Record<string, unknown>> {
    return this.req("GET", "/schema");
  }

  // --- Catalog / fleet / nodes / agents ---
  catalog(): Promise<ScoutCatalog> {
    return this.req("GET", "/catalog");
  }
  fleet(): Promise<ScoutFleet> {
    return this.req("GET", "/fleet");
  }
  listNodes(): Promise<ScoutNode[]> {
    return this.req("GET", "/nodes");
  }
  getNode(id: string): Promise<ScoutNode> {
    return this.req("GET", `/nodes/${encodeURIComponent(id)}`);
  }
  listAgents(): Promise<ScoutAgent[]> {
    return this.req("GET", "/agents");
  }

  // --- Policy ---
  getPolicy(allowFrontier = true): Promise<ScoutPolicy> {
    return this.req("GET", `/policy?allowFrontier=${allowFrontier ? "true" : "false"}`);
  }
  renderPolicy(platform: ScoutPlatform, policy?: ScoutPolicy): Promise<PolicyRenderResult> {
    return this.req("POST", "/policy/render", { platform, policy: policy ?? null });
  }

  // --- Sessions / tasks ---
  listSessions(): Promise<ScoutSession[]> {
    return this.req("GET", "/sessions");
  }
  openSession(req: OpenSessionRequest = {}): Promise<ScoutSession> {
    return this.req("POST", "/sessions", req);
  }
  listTasks(): Promise<ScoutTask[]> {
    return this.req("GET", "/tasks");
  }
  dispatchTask(req: DispatchTaskRequest): Promise<ScoutTask> {
    return this.req("POST", "/tasks", req);
  }
  getTask(id: string): Promise<ScoutTask> {
    return this.req("GET", `/tasks/${encodeURIComponent(id)}`);
  }

  // --- High-level helpers ---

  /** Poll a task until it reaches a terminal state or the timeout elapses. */
  async waitForTask(id: string, opts: WaitOptions = {}): Promise<ScoutTask> {
    const pollMs = opts.pollMs ?? 1000;
    const deadline = Date.now() + (opts.timeoutMs ?? 120_000);
    for (;;) {
      const task = await this.getTask(id);
      if (TERMINAL_TASK_STATES.has(task.status)) return task;
      if (Date.now() > deadline) {
        throw new ScoutTimeoutError(`task ${id} did not reach a terminal state in time`, `${this.base}/tasks/${id}`);
      }
      await new Promise((resolve) => setTimeout(resolve, pollMs));
    }
  }

  /** Dispatch a task and wait for it to finish. */
  async dispatchAndWait(req: DispatchTaskRequest, opts: WaitOptions = {}): Promise<ScoutTask> {
    const task = await this.dispatchTask(req);
    return this.waitForTask(task.id, opts);
  }

  /** Summarize the fleet (counts by status and platform). */
  async fleetSummary(): Promise<FleetSummary> {
    const nodes = await this.listNodes();
    const byPlatform: Record<string, number> = {};
    for (const n of nodes) byPlatform[n.platform] = (byPlatform[n.platform] ?? 0) + 1;
    return {
      total: nodes.length,
      online: nodes.filter((n) => n.status === "online").length,
      frontierEnabled: nodes.filter((n) => n.frontierEnabled).length,
      byPlatform,
    };
  }
}
