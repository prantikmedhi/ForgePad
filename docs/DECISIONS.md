# Architecture Decisions

## Decision 001

We will not ship as a fork or derivative codebase.

Reason:

- preserves originality
- avoids credit confusion
- gives us a cleaner security model

## Decision 002

The desktop agent owns filesystem and command execution authority.

Reason:

- least privilege
- simpler trust boundaries
- better auditing

## Decision 003

AI providers will be integrated through a common adapter contract.

Reason:

- unified mobile UX
- easier testing
- lower lock-in
