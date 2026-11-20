---
id: INT-026
phase: 4
epic: E12
confidence: Assumed
surface: security
origin: scopezilla
source: ptsf-lab-2026#INT-026
title: Masked medical history in non-production environments
---

# INT-026 — Masked medical history in non-production environments

## Outcome

Testing and migration rehearsal can use production-scale data without exposing real medical history to the project team.

## Build target

- After each refresh of a full-copy test environment, medical history and other sensitive patient fields are masked or replaced
- Masking runs before any project user is given access
- A check confirms no unmasked medical history remains

## Guardrails

- Sandbox handling of medical history follows the same rule as production (decisions/0001-medical-history-in-org-governed.md).

## Out of scope

- Must not mask production data.

## Acceptance

Priya refreshes the Full sandbox. Before the test team is let in, masking runs; a tester opening Tomas Reyes's medical history in the sandbox sees placeholder content, and the masking check reports zero unmasked records.

## Success criteria

_none_

## Dependencies

### Internal
- INT-009

### External
- Sandbox data masking product | licensed for the Full sandbox | owner: PTSF platform owner + Salesforce account team

## Open questions

- Q-048: Which fields beyond medical history count as sensitive for masking? (G1203) (Resolver: PTSF compliance lead) — UNANSWERED
- Q-073: Which profile, permission set group and permission sets does each persona this intent affects (platform-admin) get? The persona files leave this to decide. (Resolver: Trusted Guide) — UNANSWERED

## Grounding

- Persona: platform-admin
- decision: ADR 0001 — medical history in org, governed (ptsf-lab-2026:decisions/0001-medical-history-in-org-governed.md@144731f83592)
- Source: ptsf-lab-2026#INT-026
