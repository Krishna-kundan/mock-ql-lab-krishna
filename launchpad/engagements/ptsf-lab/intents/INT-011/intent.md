---
id: INT-011
phase: 2
epic: E02
confidence: Unknown
surface: automation
origin: scopezilla
source: ptsf-lab-2026#INT-011
title: Welcome email in the patient's language
---

# INT-011 — Welcome email in the patient's language

## Outcome

Every patient who completes onboarding receives a welcome email in their preferred language explaining how to apply.

## Build target

- When onboarding is marked complete, a welcome email is sent to the patient
- The email content is chosen by the patient's language preference
- The email explains the subsidy application process and links to the portal
- Sends go through a channel that handles roughly 7,000 a day in year 1 and growth beyond
- The sending domain is authenticated

## Guardrails

- Do not rely on the org's standard single-email allowance — volume exceeds it; the high-volume channel is a pending decision (G0805).

## Out of scope

- Must not build marketing journeys or newsletters.

## Acceptance

Maria completes onboarding with language set to English and receives the welcome email within minutes. Luis completes onboarding with Spanish selected and receives the Spanish version.

## Success criteria

_none_

## Dependencies

### Internal
- INT-010

### External
- High-volume email channel (product not yet chosen) | a licensed channel able to send ~7,000+ transactional emails a day | owner: PTSF IT + Salesforce account team

## Open questions

- Q-020: Does PTSF have an email sending service or marketing platform today? (G0805) (Resolver: PTSF IT) — UNANSWERED
- Q-021: Who writes and translates the welcome email content? (G0202) (Resolver: PTSF communications lead) — UNANSWERED
- Q-058: Which profile, permission set group and permission sets does each persona this intent affects (patient) get? The persona files leave this to decide. (Resolver: Trusted Guide) — UNANSWERED

## Grounding

- Persona: patient
- Requirement: PTSF brief — Patient Onboarding item 2d (ptsf-lab-2026:discovery-notes/ptsf-brief.md@144731f83592)
- Source: ptsf-lab-2026#INT-011
