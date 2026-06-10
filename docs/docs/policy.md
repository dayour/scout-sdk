---
id: policy
title: Managed policy
---

# Managed policy

One policy object renders to each platform's native surface.

```ts
import { defaultPolicy, parsePolicy, renderPolicy, toWindowsRegistry, diffPolicy } from "scout-sdk";

const policy = defaultPolicy();                  // allowScoutFrontierAccess: true
const strict = parsePolicy({ forcePrompt: true, restrictToWorkspace: true });

renderPolicy(policy, "linux").content;           // /etc/clawpilot/policy.json body (camelCase)
renderPolicy(policy, "windows").values;          // HKLM\SOFTWARE\Policies\Scout (DWORD/REG_SZ)
renderPolicy(policy, "macos").values;            // com.microsoft.clawpilot keys

toWindowsRegistry(policy).AllowScoutFrontierAccess;  // 1
diffPolicy(policy, strict);                          // ["forcePrompt", "restrictToWorkspace"]
```

| Platform | Target | Key style |
|----------|--------|-----------|
| Linux | `/etc/clawpilot/policy.json` | camelCase JSON |
| Windows | `HKLM\SOFTWARE\Policies\Scout` | PascalCase registry values |
| macOS | `com.microsoft.clawpilot` | PascalCase keys |

> On Linux the loader reads camelCase keys; Windows/macOS use PascalCase value
> names. The render helpers translate automatically.
