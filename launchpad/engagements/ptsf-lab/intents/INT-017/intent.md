---
id: INT-017
phase: 3
epic: E05
confidence: Assumed
surface: experience-cloud
origin: scopezilla
source: ptsf-lab-2026#INT-017
title: Specialist assessment requests
---

# INT-017 — Specialist assessment requests

## Outcome

A practitioner who needs a specialist opinion can request an additional assessment without leaving the portal.

## Build target

- From an open assessment, the practitioner requests an additional specialist assessment, stating the specialty and reason
- The request creates a child Assessment linked to the original
- The specialist assessment is allocated and accepted like any other assessment
- The original practitioner sees the specialist assessment's status and, once submitted, its outcome

## Guardrails

- A specialist request is a child Assessment on the same application, not a new application (data/memory.json decision_log, 2026-11-16).

## Out of scope

- Must not create a new Subsidy Application for the specialist.

## Acceptance

Dr Wong, assessing Maria, requests an orthopaedic specialist assessment. Dr Silva receives the offer, accepts and submits. Dr Wong sees the specialist assessment marked 'Submitted' under her own.

## Success criteria

_none_

## Dependencies

### Internal
- INT-014
- INT-016

### External
_none_

## Open questions

- Q-033: Who is the specialist — any registered practitioner, or one the requester names? (G0502) (Resolver: PTSF clinical lead) — UNANSWERED
- Q-064: Which profile, permission set group and permission sets does each persona this intent affects (practitioner) get? The persona files leave this to decide. (Resolver: Trusted Guide) — UNANSWERED

## Grounding

- Persona: practitioner
- Requirement: PTSF brief — Patient Assessment item 3 (ptsf-lab-2026:discovery-notes/ptsf-brief.md@144731f83592)
- Source: ptsf-lab-2026#INT-017
