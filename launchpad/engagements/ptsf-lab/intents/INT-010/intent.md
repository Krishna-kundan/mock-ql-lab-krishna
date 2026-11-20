---
id: INT-010
phase: 2
epic: E02
confidence: Assumed
surface: lwc
origin: scopezilla
source: ptsf-lab-2026#INT-010
title: Patient onboarding wizard with insurer prefill and address validation
---

# INT-010 — Patient onboarding wizard with insurer prefill and address validation

## Outcome

A new patient completes their profile once, prefilled from their insurer where possible, and can't apply for a subsidy until it's complete.

## Build target

- On first login the patient is taken into a multi-step onboarding wizard
- Steps cover name, email, date of birth, address, language preference and insurance
- The wizard requests insurer data in the background and offers it as prefill when it arrives; the patient can carry on meanwhile
- Address is validated in the wizard
- The patient can leave and resume where they stopped
- The patient's preferred language drives the wizard language
- Completing the wizard marks onboarding complete; until then, the 'apply for a subsidy' action is unavailable

## Guardrails

- The wizard is a custom component on the LWR patient site, because it must pause and resume for patients on weak connections (data/memory.json decision_log, 2026-11-16).

## Out of scope

- Must not send the welcome email (handled by INT-011).
- Must not build subsidy application capture (handled by INT-012).

## Acceptance

Maria signs in for the first time and lands in the wizard. Her name and date of birth appear prefilled from her insurer a few seconds after she starts. She stops at the address step, returns the next day and resumes there. Before finishing, the 'Apply for travel support' button is greyed out; after finishing, it is live.

## Success criteria

_none_

## Dependencies

### Internal
- INT-004
- INT-007
- INT-008

### External
_none_

## Open questions

- Q-017: Which languages at launch, and are any right-to-left? (G0202) (Resolver: PTSF digital lead) — UNANSWERED
- Q-018: Which accessibility standard must the portal meet? (G0205) (Resolver: PTSF digital lead) — UNANSWERED
- Q-019: Can patients edit insurer-prefilled fields, and which value wins? (G0203) (Resolver: PTSF operations lead) — UNANSWERED
- Q-057: Which profile, permission set group and permission sets does each persona this intent affects (patient) get? The persona files leave this to decide. (Resolver: Trusted Guide) — UNANSWERED

## Grounding

- Persona: patient
- Requirement: PTSF brief — Patient Onboarding item 2 (ptsf-lab-2026:discovery-notes/ptsf-brief.md@144731f83592)
- Source: ptsf-lab-2026#INT-010
