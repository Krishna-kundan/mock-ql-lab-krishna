---
id: INT-020
phase: 3
epic: E06
confidence: Assumed
surface: console
origin: scopezilla
source: ptsf-lab-2026#INT-020
title: Subsidy amount guidance by distance and transport type
---

# INT-020 — Subsidy amount guidance by distance and transport type

## Outcome

Assessors set subsidy amounts consistently, guided by a suggested figure from distance and transport type.

## Build target

- On an approved application, the assessor sees a suggested subsidy amount
- The suggestion uses the travel distance and the expected transport types (air, train, bus, taxi)
- Rates come from the admin-maintained Subsidy Rate guidance table
- The assessor enters the final amount; the suggestion and any difference are recorded

## Guardrails

- Rate guidance is admin-maintained configuration, not hard-coded (decisions/0002-core-platform-no-industry-cloud.md).

## Out of scope

- Must not book travel or pay the subsidy.

## Acceptance

Chen approves Maria's application. The console suggests a subsidy for a 1,600 km return trip by air plus taxi. Chen enters a slightly lower figure; the application records both the suggestion and the final amount.

## Success criteria

_none_

## Dependencies

### Internal
- INT-001
- INT-019

### External
_none_

## Open questions

- Q-037: Share today's subsidy calculation rules and rate card (G0604). (Resolver: PTSF finance lead) — UNANSWERED
- Q-038: Between which two points is distance measured? (G0605) (Resolver: PTSF operations lead) — UNANSWERED
- Q-067: Which profile, permission set group and permission sets does each persona this intent affects (assessor) get? The persona files leave this to decide. (Resolver: Trusted Guide) — UNANSWERED

## Grounding

- Persona: assessor
- Requirement: PTSF brief — Patient Assessment item 4 (ptsf-lab-2026:discovery-notes/ptsf-brief.md@144731f83592)
- Source: ptsf-lab-2026#INT-020
