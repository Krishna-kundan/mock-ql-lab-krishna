---
id: INT-008
phase: 1
epic: E08
confidence: Unknown
surface: integration
origin: scopezilla
source: ptsf-lab-2026#INT-008
title: Address validation and geocoding service
---

# INT-008 — Address validation and geocoding service

## Outcome

Patient and practice addresses are validated and carry coordinates, so allocation can rank practitioners by distance.

## Build target

- A reusable service that validates an address and returns a standardized address with coordinates
- Patient addresses validated at onboarding; practice addresses validated at practice registration
- Addresses that can't be validated (remote or informal) are accepted with a flag for office review rather than blocking the patient
- Credentials held per environment, never in code

## Guardrails

- Direct callouts from the org; no middleware (data/memory.json decision_log, 2026-11-16).

## Out of scope

- Must not compute travel distance or routes (straight-line distance is the assumption, G0010).
- Must not build allocation (handled by INT-014).

## Acceptance

Sofia registers 'Costa Clinic' with a Lisbon street address; it saves with coordinates. Maria in rural Queensland enters a property name with no street number; she can continue, and her record shows 'address needs review' in the office's list.

## Success criteria

_none_

## Dependencies

### Internal
- INT-001

### External
- Address validation provider (not yet named) | licensed provider, API contract and test credentials | owner: PTSF IT

## Open questions

- Q-014: Does PTSF license an address-validation provider, and does it cover all three regions? (G0802) (Resolver: PTSF IT) — UNANSWERED
- Q-015: What happens when a remote address can't be validated? (G0206) (Resolver: PTSF operations lead) — UNANSWERED
- Q-055: Which profile, permission set group and permission sets does each persona this intent affects (office-administrator, patient) get? The persona files leave this to decide. (Resolver: Trusted Guide) — UNANSWERED

## Grounding

- Persona: office-administrator
- Persona: patient
- Requirement: PTSF brief — Patient Onboarding item 2b (ptsf-lab-2026:discovery-notes/ptsf-brief.md@144731f83592)
- Source: ptsf-lab-2026#INT-008
