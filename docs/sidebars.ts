import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docs: [
    "intro",
    "getting-started",
    {
      type: "category",
      label: "TypeScript",
      items: ["client", "policy", "a2a", "errors-and-retries", "mock"],
    },
    "python",
  ],
};

export default sidebars;
