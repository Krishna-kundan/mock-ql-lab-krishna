---
id: INT-012
phase: 2
epic: E03
confidence: Assumed
surface: screen-flow
origin: scopezilla
source: ptsf-lab-2026#INT-012
title: Subsidy application capture with medical-history confirmation
---

# INT-012 — Subsidy application capture with medical-history confirmation

## Outcome

An onboarded patient can apply for travel support online by choosing a treatment type, stating the reason and confirming their medical history.

## Build target

- 'Apply for travel support' on the patient portal, available only after onboarding
- Patient searches and selects a treatment type from the 500+ catalog
- Patient states the reason for the request
- Patient reviews and confirms (or updates) their medical history on every application
- Submission creates a Subsidy Application linked to the patient, satellite office and region
- Patient sees their applications and each one's status

## Guardrails

- Medical history entered here is written to the Medical History object, never onto the application (decisions/0001-medical-history-in-org-governed.md).

## Out of scope

- Must not run the insurance check or reject (handled by INT-013).
- Must not allocate a practitioner (handled by INT-014).

## Acceptance

Maria selects 'Cardiac surgery', writes 'Surgery at Brisbane specialist centre, not available locally', confirms her medical history is unchanged, and submits. She sees the application listed as 'Submitted'. Chen, the Assessor, can see the application and its reason but no medical history.

## Success criteria

_none_

## Dependencies

### Internal
- INT-001
- INT-003
- INT-010

### External
_none_

## Open questions

- Q-022: What does 'verified with each application' mean — patient re-confirms, or someone checks? (G0301) (Resolver: PTSF clinical governance) — UNANSWERED
- Q-023: Beyond onboarding and insurance, what other eligibility rules apply? (G0305) (Resolver: PTSF operations lead) — UNANSWERED
- Q-059: Which profile, permission set group and permission sets does each persona this intent affects (patient) get? The persona files leave this to decide. (Resolver: Trusted Guide) — UNANSWERED

## Grounding

- Persona: patient
- Requirement: PTSF brief — Requesting Travel Assistance items 1–2 (ptsf-lab-2026:discovery-notes/ptsf-brief.md@144731f83592)
- Source: ptsf-lab-2026#INT-012
