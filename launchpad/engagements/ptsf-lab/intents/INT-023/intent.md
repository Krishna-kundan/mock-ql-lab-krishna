---
id: INT-023
phase: 3
epic: E07
confidence: Assumed
surface: experience-cloud
origin: scopezilla
source: ptsf-lab-2026#INT-023
title: Self-service help centre
---

# INT-023 — Self-service help centre

## Outcome

Patients and practitioners answer common questions themselves, reducing routine contacts to PTSF.

## Build target

- A searchable help centre on both portals, built from today's FAQs
- Articles organized by audience (patient, practitioner) and topic
- Articles available in the launch languages
- Help suggestions shown before a user starts a chat
- PTSF staff can author, review and publish articles

## Guardrails

_none_

## Out of scope

- Must not build an AI-generated answer experience.

## Acceptance

Ben searches 'what does the subsidy cover' on the patient portal and finds the article. Before starting a chat, Maria is shown three suggested articles. Sofia drafts a new practitioner article and publishes it after review.

## Success criteria

_none_

## Dependencies

### Internal
- INT-004
- INT-005

### External
_none_

## Open questions

- Q-042: Is the static website retired, or kept as the public front door? (G0705) (Resolver: PTSF digital lead) — UNANSWERED
- Q-070: Which profile, permission set group and permission sets does each persona this intent affects (patient) get? The persona files leave this to decide. (Resolver: Trusted Guide) — UNANSWERED

## Grounding

- Persona: patient
- Requirement: PTSF brief — Current systems (static website FAQs); Requesting Travel Assistance item 6 (ptsf-lab-2026:discovery-notes/ptsf-brief.md@144731f83592)
- Source: ptsf-lab-2026#INT-023
