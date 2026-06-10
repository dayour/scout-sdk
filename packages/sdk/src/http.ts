import { ScoutApiError, ScoutNetworkError, ScoutTimeoutError } from "./errors.js";

export interface RetryOptions {
  /** Max retry attempts after the first try. */
  retries: number;
  /** Base backoff in ms (exponential). */
  backoffMs: number;
  /** Cap on backoff in ms. */
  maxBackoffMs: number;
  /** HTTP statuses that trigger a retry. */
  retryOn: number[];
}

export const defaultRetry: RetryOptions = {
  retries: 3,
  backoffMs: 250,
  maxBackoffMs: 4000,
  retryOn: [429, 500, 502, 503, 504],
};

export interface RequestContext {
  method: string;
  url: string;
  attempt: number;
}

export interface ResponseContext extends RequestContext {
  status: number;
  durationMs: number;
}

export interface HttpOptions {
  fetch: typeof fetch;
  headers: Record<string, string>;
  timeoutMs: number;
  retry: RetryOptions;
  onRequest?: (ctx: RequestContext) => void;
  onResponse?: (ctx: ResponseContext) => void;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function backoffDelay(attempt: number, retry: RetryOptions): number {
  const exp = retry.backoffMs * 2 ** attempt;
  const jitter = Math.random() * retry.backoffMs;
  return Math.min(retry.maxBackoffMs, exp + jitter);
}

function pathOf(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function isAbort(err: unknown): boolean {
  return err instanceof Error && (err.name === "AbortError" || err.name === "TimeoutError");
}

/**
 * Perform a JSON request with timeout, exponential backoff retries, and typed
 * errors. Retries on configured statuses and on network/timeout failures.
 */
export async function requestJson<T>(url: string, method: string, body: unknown, opts: HttpOptions): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= opts.retry.retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), opts.timeoutMs);
    const started = Date.now();
    const headers: Record<string, string> = { ...opts.headers };
    const init: RequestInit = { method, headers, signal: controller.signal };
    if (body !== undefined) {
      init.body = JSON.stringify(body);
      headers["content-type"] = "application/json";
    }
    opts.onRequest?.({ method, url, attempt });

    try {
      const res = await opts.fetch(url, init);
      clearTimeout(timer);
      opts.onResponse?.({ method, url, attempt, status: res.status, durationMs: Date.now() - started });
      const text = await res.text();
      const parsed = text ? safeJson(text) : undefined;

      if (res.ok) return parsed as T;

      if (opts.retry.retryOn.includes(res.status) && attempt < opts.retry.retries) {
        await sleep(backoffDelay(attempt, opts.retry));
        continue;
      }
      throw new ScoutApiError(`scout-api ${res.status} on ${method} ${pathOf(url)}`, res.status, url, parsed ?? text);
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof ScoutApiError) throw err;
      lastError = isAbort(err)
        ? new ScoutTimeoutError(`request timed out after ${opts.timeoutMs}ms: ${method} ${pathOf(url)}`, url)
        : new ScoutNetworkError(`network error: ${method} ${pathOf(url)}`, url, err);
      if (attempt < opts.retry.retries) {
        await sleep(backoffDelay(attempt, opts.retry));
        continue;
      }
      throw lastError;
    }
  }
  throw lastError;
}
