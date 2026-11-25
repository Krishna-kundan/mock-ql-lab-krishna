---
id: INT-022
phase: 3
epic: E07
confidence: Assumed
surface: experience-cloud
origin: scopezilla
source: ptsf-lab-2026#INT-022
title: Chat with an assessor from both portals
---

# INT-022 — Chat with an assessor from both portals

## Outcome

Patients and practitioners can reach a PTSF assessor by chat at any point in the process.

## Build target

- A chat entry point on the patient portal and the practitioner portal
- Chats from signed-in users carry their identity and current application
- Chats are routed to available assessors in the right region
- Assessors handle chats in the console alongside their review work
- Chat transcripts are kept on the related application
- Patients are shown a notice not to share medical details in chat

## Guardrails

- Enhanced Chat, not legacy Chat; no Einstein Bots (data/memory.json decision_log, 2026-11-16).

## Out of scope

- Must not build an AI agent or bot.
- Must not build the help centre (handled by INT-023).

## Acceptance

Maria clicks 'Chat with us' on the patient portal while her application is under review. Chen picks up the chat in the console, sees Maria's application alongside, and answers. Dr Wong starts a chat from the practitioner portal and reaches an assessor in her region.

## Success criteria

_none_

## Dependencies

### Internal
- INT-004
- INT-005
- INT-019

### External
_none_

## Open questions

- Q-040: Who should a chat reach: the assessor on the application, or any available assessor? (G0702) (Resolver: PTSF operations lead) — UNANSWERED
- Q-041: Expected chat volume and hours by region? (G0703) (Resolver: PTSF operations lead) — UNANSWERED
- Q-069: Which profile, permission set group and permission sets does each persona this intent affects (patient, practitioner, assessor) get? The persona files leave this to decide. (Resolver: Trusted Guide) — UNANSWERED

## Grounding

- Persona: patient
- Persona: practitioner
- Persona: assessor
- Requirement: PTSF brief — Requesting Travel Assistance item 6 (ptsf-lab-2026:discovery-notes/ptsf-brief.md@144731f83592)
- Source: ptsf-lab-2026#INT-022
