# Copilot instructions for `dayour/scout-sdk`

## Repository overview
- Monorepo with a TypeScript SDK (`packages/sdk`), Python SDK (`python`), OpenAPI spec (`openapi/scout-api.yaml`), and Docusaurus docs (`docs`).
- Root workspace uses npm workspaces (`packages/*`, `docs`).

## Fast start for cloud agents
1. Install deps:
   - `npm ci`
   - `python -m pip install "./python[test]"`
2. Validate baseline before and after changes:
   - `npm run build`
   - `npm test`
   - `npm run docs:build`
   - `pytest python/tests -q`

## Where to change code
- TypeScript SDK code: `packages/sdk/src`
- TypeScript tests: `packages/sdk/test/*.test.ts`
- Python SDK code: `python/scout_sdk`
- Python tests: `python/tests`
- Docs content: `docs/docs`

## Project conventions
- Keep TS and Python SDK surfaces aligned when changing client methods or policy helpers.
- Prefer minimal, surgical changes; do not refactor unrelated areas.
- No emojis in source/docs/comments/output (use labels like `[OK]`, `[ERROR]`).
- Keep Node on 20+ (CI uses Node 20) and Python on 3.10+ (CI uses 3.12).

## CI/workflow notes
- Main CI workflow (`.github/workflows/ci.yml`) runs two jobs:
  - TypeScript job: `npm ci`, `npm run build`, `npm test`, `npm run docs:build`
  - Python job: `pip install "./python[test]"`, `pytest python/tests -q`
- Docs deploy workflow (`.github/workflows/docs.yml`) builds docs then publishes to GitHub Pages.

## Errors encountered and workarounds
- Historical docs deployment failure ([actions run 27283542007](https://github.com/dayour/scout-sdk/actions/runs/27283542007)):
  - Error: `Failed to create deployment (status: 404)` / `Ensure GitHub Pages has been enabled`.
  - Workaround: enable GitHub Pages for the repository (`Settings -> Pages`) before expecting deploy jobs to pass.
- Historical docs build failure on a Dependabot branch ([actions run 27283731188](https://github.com/dayour/scout-sdk/actions/runs/27283731188)):
  - Error: `TypeError: Cannot read properties of undefined (reading 'useCssCascadeLayers')` while running `docusaurus build`.
  - Workaround: update Docusaurus packages as a compatible set (core/preset/types/tsconfig/module aliases) and re-run `npm run docs:build`.
- Local validation in this branch succeeded for all baseline commands listed above.
