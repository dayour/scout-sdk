# Contributing to scout-sdk

```bash
npm install
npm run build       # tsc -b
npm test            # vitest
npm run docs:build  # Docusaurus

pip install "./python[test]"
pytest python/tests -q
```

## Conventions

- TypeScript, ESM, NodeNext resolution; Python 3.10+ with pydantic v2.
- No emojis in source, docs, comments, or output. Use text labels (`[OK]`, `[ERROR]`).
- Keep the TypeScript and Python surfaces in sync (client methods, policy helpers).
- Add tests for behavior changes (`packages/sdk/test/*.test.ts`, `python/tests/`).
- CI must pass: TS build + tests + docs build, and Python pytest.
