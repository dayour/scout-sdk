/** Base class for all Scout SDK errors. */
export class ScoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScoutError";
  }
}

/** A non-2xx response from the Scout API. */
export class ScoutApiError extends ScoutError {
  constructor(
    message: string,
    readonly status: number,
    readonly url: string,
    readonly body: unknown,
  ) {
    super(message);
    this.name = "ScoutApiError";
  }
}

/** The request exceeded the configured timeout. */
export class ScoutTimeoutError extends ScoutError {
  constructor(
    message: string,
    readonly url: string,
  ) {
    super(message);
    this.name = "ScoutTimeoutError";
  }
}

/** A transport/network failure (DNS, connection refused, etc.). */
export class ScoutNetworkError extends ScoutError {
  constructor(
    message: string,
    readonly url: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ScoutNetworkError";
  }
}
