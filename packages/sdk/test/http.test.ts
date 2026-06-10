import { describe, expect, it, vi } from "vitest";
import { requestJson, defaultRetry } from "../src/http.js";
import { ScoutApiError } from "../src/errors.js";

function res(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

const fastRetry = { ...defaultRetry, backoffMs: 1, maxBackoffMs: 3 };

describe("requestJson", () => {
  it("retries on 503 then succeeds", async () => {
    let calls = 0;
    const fetchMock = vi.fn(async () => {
      calls += 1;
      return calls < 3 ? res({}, 503) : res({ ok: true });
    });
    const out = await requestJson<{ ok: boolean }>("http://h/scout/health", "GET", undefined, {
      fetch: fetchMock as unknown as typeof fetch,
      headers: {},
      timeoutMs: 1000,
      retry: fastRetry,
    });
    expect(out.ok).toBe(true);
    expect(calls).toBe(3);
  });

  it("does not retry on 400 and throws ScoutApiError", async () => {
    const fetchMock = vi.fn(async () => res({ detail: "bad" }, 400));
    await expect(
      requestJson("http://h/scout/x", "GET", undefined, {
        fetch: fetchMock as unknown as typeof fetch,
        headers: {},
        timeoutMs: 1000,
        retry: fastRetry,
      }),
    ).rejects.toBeInstanceOf(ScoutApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("invokes onRequest / onResponse hooks", async () => {
    const events: string[] = [];
    await requestJson("http://h/scout/health", "GET", undefined, {
      fetch: (async () => res({ ok: true })) as unknown as typeof fetch,
      headers: {},
      timeoutMs: 1000,
      retry: fastRetry,
      onRequest: () => events.push("req"),
      onResponse: (ctx) => events.push(`res:${ctx.status}`),
    });
    expect(events).toEqual(["req", "res:200"]);
  });
});
