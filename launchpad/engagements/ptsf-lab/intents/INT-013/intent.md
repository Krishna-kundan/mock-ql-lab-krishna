---
id: INT-013
phase: 2
epic: E03
confidence: Assumed
surface: automation
origin: scopezilla
source: ptsf-lab-2026#INT-013
title: Automatic rejection when insurance covers travel
---

# INT-013 — Automatic rejection when insurance covers travel

## Outcome

Applications where the patient's insurance already covers travel are rejected automatically and the patient is told why, so assessors never spend time on them.

## Build target

- On submission, each application triggers a background insurance check
- While the check is pending, the application shows 'Checking insurance'
- If insurance covers travel, the application is set to Rejected with reason 'Covered by insurance' and the patient is notified in their language
- If not covered, the application moves on to allocation
- If the check fails after retries, the application is held for office review rather than rejected

## Guardrails

- The Checker is called only through the shared background service (INT-007); never call it directly here.

## Out of scope

- Must not allocate a practitioner (handled by INT-014).
- Must not handle partial cover until the rule is defined (Q-024).

## Acceptance

Ben submits an application; his insurer covers travel. Within a minute his application shows 'Rejected — covered by your insurance' and he receives a notification. Maria's application, not covered, moves to 'Allocating'. When the Checker test endpoint is down, Luis's application waits in 'Insurance check pending — office review' and the office sees it in its list.

## Success criteria

_none_

## Dependencies

### Internal
- INT-007
- INT-012

### External
_none_

## Open questions

- Q-024: If insurance covers only part of the cost, is the application still auto-rejected? (G0302) (Resolver: PTSF operations lead) — UNANSWERED
- Q-025: How is the patient told of a rejection — channel, language, wording? (G0306) (Resolver: PTSF communications lead) — UNANSWERED
- Q-060: Which profile, permission set group and permission sets does each persona this intent affects (patient) get? The persona files leave this to decide. (Resolver: Trusted Guide) — UNANSWERED

## Grounding

- Persona: patient
- Requirement: PTSF brief — Requesting Travel Assistance item 3 (ptsf-lab-2026:discovery-notes/ptsf-brief.md@144731f83592)
- Source: ptsf-lab-2026#INT-013
