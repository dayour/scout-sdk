import type { A2AMessage, A2ATask, AgentCard } from "./a2a.js";

export interface A2AClientOptions {
  fetch?: typeof fetch;
  headers?: Record<string, string>;
}

/**
 * Minimal Agent2Agent client. Resolves a peer's {@link AgentCard} and exchanges
 * {@link A2AMessage} envelopes over HTTP.
 */
export class A2AClient {
  private readonly url: string;
  private readonly doFetch: typeof fetch;
  private readonly headers: Record<string, string>;

  constructor(agentBaseUrl: string, options: A2AClientOptions = {}) {
    this.url = agentBaseUrl.replace(/\/+$/, "");
    const f = options.fetch ?? globalThis.fetch;
    if (!f) throw new Error("No fetch implementation available; pass options.fetch");
    this.doFetch = f;
    this.headers = { accept: "application/json", "content-type": "application/json", ...options.headers };
  }

  /** Fetch the peer agent card from the well-known path. */
  async card(): Promise<AgentCard> {
    const res = await this.doFetch(`${this.url}/.well-known/agent-card.json`, { headers: this.headers });
    if (!res.ok) throw new Error(`agent-card ${res.status}`);
    return (await res.json()) as AgentCard;
  }

  /** Send a message and receive the resulting task. */
  async send(message: A2AMessage): Promise<A2ATask> {
    const res = await this.doFetch(`${this.url}/a2a/messages`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(message),
    });
    if (!res.ok) throw new Error(`a2a send ${res.status}`);
    return (await res.json()) as A2ATask;
  }

  /** Poll a task by id. */
  async task(taskId: string): Promise<A2ATask> {
    const res = await this.doFetch(`${this.url}/a2a/tasks/${encodeURIComponent(taskId)}`, { headers: this.headers });
    if (!res.ok) throw new Error(`a2a task ${res.status}`);
    return (await res.json()) as A2ATask;
  }
}
