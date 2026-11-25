---
id: INT-015
phase: 2
epic: E04
confidence: Assumed
surface: automation
origin: scopezilla
source: ptsf-lab-2026#INT-015
title: Three-business-day acceptance window and automatic reassignment
---

# INT-015 — Three-business-day acceptance window and automatic reassignment

## Outcome

A practitioner accepts or declines an offered application; if they decline or don't respond within 3 business days, it moves to the next-nearest practitioner automatically.

## Build target

- The offered practitioner can accept or decline from the practitioner portal
- Accepting moves the Assessment to 'Assigned' and starts the 15-day assessment clock
- Declining, or no response within 3 business days, re-offers the application to the next-nearest eligible practitioner
- Practitioners who already declined or timed out on this application are skipped
- When no candidates remain, the application is flagged to the satellite office
- The business-day clock respects the relevant business hours and holidays

## Guardrails

- Reassignment uses the same ranking as INT-014; do not build a second ranking.

## Out of scope

- Must not build the practitioner work list or assessment form (handled by INT-016).
- Must not build the 15-day escalation (handled by INT-018).

## Acceptance

Dr Osei is offered Maria's application on Monday and does nothing. On Thursday morning it is offered to Dr Patel, the next nearest, and Dr Osei no longer sees it. Dr Patel declines; it goes to Dr Wong, who accepts, and the assessment shows 'Assigned' with the 15-day clock started.

## Success criteria

_none_

## Dependencies

### Internal
- INT-014

### External
_none_

## Open questions

- Q-028: Whose business days apply — the practitioner's, the office's or the patient's? (G0405) (Resolver: PTSF operations lead) — UNANSWERED
- Q-029: What can a practitioner see about an application before accepting? (G0407) (Resolver: PTSF clinical governance) — UNANSWERED
- Q-062: Which profile, permission set group and permission sets does each persona this intent affects (practitioner) get? The persona files leave this to decide. (Resolver: Trusted Guide) — UNANSWERED

## Grounding

- Persona: practitioner
- Requirement: PTSF brief — Requesting Travel Assistance item 5 (ptsf-lab-2026:discovery-notes/ptsf-brief.md@144731f83592)
- Source: ptsf-lab-2026#INT-015
