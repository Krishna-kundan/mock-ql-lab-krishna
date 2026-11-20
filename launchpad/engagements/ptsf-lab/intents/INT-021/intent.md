---
id: INT-021
phase: 3
epic: E06
confidence: Assumed
surface: automation
origin: scopezilla
source: ptsf-lab-2026#INT-021
title: Manager approval for higher-value subsidies
---

# INT-021 — Manager approval for higher-value subsidies

## Outcome

More expensive subsidies get a manager's sign-off before they're granted; the rest go straight through.

## Build target

- When an assessor sets an amount above the approval threshold, the application goes to the assessor's manager for approval
- The manager approves or rejects with a comment
- Approved applications become 'Granted'; rejected ones return to the assessor
- Amounts at or below the threshold become 'Granted' immediately

## Guardrails

_none_

## Out of scope

- Must not notify the patient of payment or booking details.

## Acceptance

Chen sets a subsidy above the threshold for Maria. Marcus receives an approval request, reviews it and approves; Maria's application shows 'Granted'. A smaller subsidy Chen sets for Ben's later application is granted immediately.

## Success criteria

_none_

## Dependencies

### Internal
- INT-020

### External
_none_

## Open questions

- Q-039: What makes a subsidy 'more expensive' — a fixed amount, a percentage above guidance, or per region? (G0603) (Resolver: PTSF finance lead) — UNANSWERED
- Q-068: Which profile, permission set group and permission sets does each persona this intent affects (assessor, team-manager) get? The persona files leave this to decide. (Resolver: Trusted Guide) — UNANSWERED

## Grounding

- Persona: assessor
- Persona: team-manager
- Requirement: PTSF brief — Users (Managers) (ptsf-lab-2026:discovery-notes/ptsf-brief.md@144731f83592)
- Source: ptsf-lab-2026#INT-021
