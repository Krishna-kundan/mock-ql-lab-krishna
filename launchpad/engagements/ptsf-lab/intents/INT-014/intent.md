---
id: INT-014
phase: 2
epic: E04
confidence: Assumed
surface: automation
origin: scopezilla
source: ptsf-lab-2026#INT-014
title: Nearest-practitioner allocation by treatment type
---

# INT-014 — Nearest-practitioner allocation by treatment type

## Outcome

Each eligible application is offered automatically to the nearest practitioner registered for its treatment type, with no manual allocation.

## Build target

- When an application passes the insurance check, the system finds practitioners registered for its treatment type
- Candidates are ranked by straight-line distance from the patient's address to the practice
- The nearest active candidate is offered the application and notified
- An Assessment is created for the offered practitioner in 'Offered' status
- If no registered practitioner exists, the application is flagged to the satellite office
- Allocation performs at year-1 volume (~1M applications a year) and stays selective as volume grows

## Guardrails

- Allocation is custom code ranking by straight-line distance, not Omni-Channel routing — practitioners are portal users (data/memory.json decision_log, 2026-11-16).

## Out of scope

- Must not handle the 3-business-day window or reassignment (handled by INT-015).
- Must not grant medical-history access at offer stage (handled by INT-002).

## Acceptance

Maria's cardiac surgery application passes the insurance check. Three cardiologists are registered within 400 km; the application is offered to Dr Osei, the closest at 120 km, who receives a notification. A test application for a treatment type with no registered practitioner appears in the Brisbane office's 'Needs allocation' list.

## Success criteria

_none_

## Dependencies

### Internal
- INT-001
- INT-005
- INT-008
- INT-013

### External
_none_

## Open questions

- Q-026: Is straight-line distance acceptable, or is travel distance/time required? (G0402) (Resolver: PTSF operations lead) — UNANSWERED
- Q-027: Should allocation consider workload or availability, and can it cross office or country boundaries? (G0403, G0404) (Resolver: PTSF operations lead + design authority) — UNANSWERED
- Q-061: Which profile, permission set group and permission sets does each persona this intent affects (patient, practitioner) get? The persona files leave this to decide. (Resolver: Trusted Guide) — UNANSWERED

## Grounding

- Persona: patient
- Persona: practitioner
- Requirement: PTSF brief — Requesting Travel Assistance item 4 (ptsf-lab-2026:discovery-notes/ptsf-brief.md@144731f83592)
- Source: ptsf-lab-2026#INT-014
