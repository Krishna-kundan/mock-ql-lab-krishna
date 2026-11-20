---
id: INT-009
phase: 1
epic: E12
confidence: Assumed
surface: devops
origin: scopezilla
source: ptsf-lab-2026#INT-009
title: Environments and source-driven release pipeline
---

# INT-009 — Environments and source-driven release pipeline

## Outcome

Every change moves from development through test to production through one tracked, scanned pipeline, so the team can release each phase safely.

## Build target

- Development, integration test, Full sandbox for user acceptance and performance testing, and production environments
- Source-controlled metadata with a pipeline promoting changes between environments
- Static code scanning runs on every promotion
- Per-environment integration credentials re-established after each sandbox refresh
- Backup and recovery configured for production

## Guardrails

- Production deploys only on an explicit user instruction, per 04-org-rules.md.

## Out of scope

- Must not build sandbox data masking (handled by INT-026).

## Acceptance

Priya watches a developer's change to the Subsidy Application layout move from development to integration test to the Full sandbox in the pipeline, with the code scan result attached at each step, then approves its release to production.

## Success criteria

_none_

## Dependencies

### Internal
_none_

### External
_none_

## Open questions

- Q-016: Does PTSF have source control and a release process today, and who approves releases? (G1205) (Resolver: PTSF platform owner) — UNANSWERED
- Q-056: Which profile, permission set group and permission sets does each persona this intent affects (platform-admin) get? The persona files leave this to decide. (Resolver: Trusted Guide) — UNANSWERED

## Grounding

- Persona: platform-admin
- Architecture: Solution — Environments, release and governance (ptsf-lab-2026:outputs/01-solution.md@144731f83592)
- Source: ptsf-lab-2026#INT-009
