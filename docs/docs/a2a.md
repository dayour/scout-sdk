---
id: a2a
title: Agent2Agent (A2A)
---

# Agent2Agent (A2A)

```ts
import { textMessage, newTask, messageText, A2AClient } from "scout-sdk";

const msg = textMessage("scan the repo and open issues");
const peer = new A2AClient("https://agent.example.com");

const card = await peer.card();      // GET /.well-known/agent-card.json
const task = await peer.send(msg);   // POST /a2a/messages
```

## Types

- `A2AMessage` - envelope with typed `A2APart[]` (`text` | `data` | `file`).
- `A2ATask` - lifecycle: `submitted -> working -> input-required -> completed | failed | canceled`.
- `AgentCard` - discovery doc (`id`, `url`, `skills`, `capabilities`).

Helpers: `textMessage`, `newTask`, `messageText`.
