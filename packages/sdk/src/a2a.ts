/**
 * Agent2Agent (A2A) protocol types for the Scout SDK. Transport-agnostic: agents
 * publish an {@link AgentCard}; peers exchange {@link A2AMessage} envelopes that
 * carry typed {@link A2APart} content and drive {@link A2ATask} lifecycles.
 */

export const A2A_PROTOCOL_VERSION = "0.2";

export type A2ARole = "user" | "agent" | "system";

export type A2ATaskState =
  | "submitted"
  | "working"
  | "input-required"
  | "completed"
  | "failed"
  | "canceled";

export type A2APart =
  | { kind: "text"; text: string }
  | { kind: "data"; mimeType: string; data: unknown }
  | { kind: "file"; name: string; mimeType: string; uri?: string; bytesBase64?: string };

export interface A2AMessage {
  protocol: typeof A2A_PROTOCOL_VERSION;
  messageId: string;
  role: A2ARole;
  parts: A2APart[];
  taskId?: string;
  contextId?: string;
  createdAt: string;
  from?: string;
  to?: string;
}

export interface A2ATask {
  id: string;
  state: A2ATaskState;
  contextId?: string;
  messages: A2AMessage[];
  result?: A2APart[];
  error?: { code: string; message: string };
  createdAt: string;
  updatedAt: string;
}

export interface A2ASkill {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  inputModes?: string[];
  outputModes?: string[];
}

export interface AgentCard {
  protocolVersion: typeof A2A_PROTOCOL_VERSION;
  id: string;
  name: string;
  description?: string;
  url: string;
  version: string;
  skills: A2ASkill[];
  capabilities?: {
    streaming?: boolean;
    pushNotifications?: boolean;
    stateTransitionHistory?: boolean;
  };
  defaultInputModes?: string[];
  defaultOutputModes?: string[];
}

let counter = 0;
function rid(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`;
}

/** Construct a well-formed text message. */
export function textMessage(text: string, role: A2ARole = "user", opts: Partial<A2AMessage> = {}): A2AMessage {
  return {
    protocol: A2A_PROTOCOL_VERSION,
    messageId: opts.messageId ?? rid("msg"),
    role,
    parts: [{ kind: "text", text }],
    createdAt: new Date().toISOString(),
    ...opts,
  };
}

/** Start a task seeded with an initial message. */
export function newTask(initial: A2AMessage): A2ATask {
  const now = new Date().toISOString();
  const id = initial.taskId ?? rid("task");
  return {
    id,
    state: "submitted",
    contextId: initial.contextId,
    messages: [{ ...initial, taskId: id }],
    createdAt: now,
    updatedAt: now,
  };
}

/** Concatenate the text of all text parts in a message. */
export function messageText(message: A2AMessage): string {
  return message.parts
    .filter((p): p is Extract<A2APart, { kind: "text" }> => p.kind === "text")
    .map((p) => p.text)
    .join("");
}
