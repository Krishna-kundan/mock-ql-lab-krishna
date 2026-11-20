---
id: INT-018
phase: 3
epic: E05
confidence: Assumed
surface: automation
origin: scopezilla
source: ptsf-lab-2026#INT-018
title: Fifteen-day pending-assessment escalation
---

# INT-018 — Fifteen-day pending-assessment escalation

## Outcome

No assessment sits pending unnoticed: anything still pending 15 days after assignment escalates to the Team Manager.

## Build target

- A daily check finds assessments still pending 15 days after assignment
- Each one escalates to the Team Manager for the application's office
- The escalation is visible on the application and in the manager's list
- An assessment escalates once, not every day

## Guardrails

_none_

## Out of scope

- Must not reassign the assessment automatically — the manager decides.

## Acceptance

An assessment assigned to Dr Patel on 1 March is still pending on 16 March. That morning Marcus, the Team Manager for the Toronto office, sees it in his 'Escalated assessments' list with a notification, and the application shows 'Escalated'.

## Success criteria

_none_

## Dependencies

### Internal
- INT-015

### External
_none_

## Open questions

- Q-034: Is it 15 calendar or business days, and does a specialist request pause the clock? (G0503) (Resolver: PTSF operations lead) — UNANSWERED
- Q-065: Which profile, permission set group and permission sets does each persona this intent affects (practitioner, team-manager) get? The persona files leave this to decide. (Resolver: Trusted Guide) — UNANSWERED

## Grounding

- Persona: practitioner
- Persona: team-manager
- Requirement: PTSF brief — Patient Assessment item 2 (ptsf-lab-2026:discovery-notes/ptsf-brief.md@144731f83592)
- Source: ptsf-lab-2026#INT-018
