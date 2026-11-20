---
id: INT-019
phase: 3
epic: E06
confidence: Assumed
surface: console
origin: scopezilla
source: ptsf-lab-2026#INT-019
title: Assessor review queues by region and office
---

# INT-019 — Assessor review queues by region and office

## Outcome

Applications ready for review reach the right assessors automatically, by region and office, in one console.

## Build target

- Applications in 'Ready for review' are pushed to assessors in the matching region and office
- Assessors work applications from a service console showing the application, assessments (without medical history) and patient contact details
- Assessors can record a decision: approve, reject, or return for more information
- Managers see queue backlog by office

## Guardrails

- Assessors never see medical history on any console surface (decisions/0001-medical-history-in-org-governed.md).

## Out of scope

- Must not compute the subsidy amount (handled by INT-020).
- Must not route manager approvals (handled by INT-021).

## Acceptance

Chen in Singapore opens the console and receives Maria's application from the Brisbane queue. He sees Dr Wong's submitted assessment outcome but no medical history, and records 'Approve'. Marcus checks the backlog view and sees Brisbane's queue drop by one.

## Success criteria

_none_

## Dependencies

### Internal
- INT-003
- INT-006
- INT-016

### External
_none_

## Open questions

- Q-035: Which sections of an assessment may assessors see, given they cannot see medical history? (G0601) (Resolver: PTSF clinical governance) — UNANSWERED
- Q-036: Which internal users see which offices' applications? (G0903) (Resolver: PTSF operations lead) — UNANSWERED
- Q-066: Which profile, permission set group and permission sets does each persona this intent affects (assessor) get? The persona files leave this to decide. (Resolver: Trusted Guide) — UNANSWERED

## Grounding

- Persona: assessor
- Requirement: PTSF brief — Users (Assessors); Patient Assessment item 4 (ptsf-lab-2026:discovery-notes/ptsf-brief.md@144731f83592)
- Source: ptsf-lab-2026#INT-019
