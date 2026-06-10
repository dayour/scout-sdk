# Security Policy

Report vulnerabilities privately via GitHub Security Advisories on this repository
(Security tab -> Report a vulnerability). Do not open public issues for sensitive reports.

## Notes

- The client never logs credentials. A `token` is sent only as `Authorization` to the
  configured gateway.
- Retries apply to idempotent failures (configurable statuses) and never replay a
  successful mutation.
