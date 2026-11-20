---
id: INT-005
phase: 1
epic: E01
confidence: Assumed
surface: experience-cloud
origin: scopezilla
source: ptsf-lab-2026#INT-005
title: PTSF-provisioned practitioner logins
---

# INT-005 — PTSF-provisioned practitioner logins

## Outcome

PTSF staff can register a vetted Medical Practitioner and have them signed in to the practitioner portal the same day.

## Build target

- Practitioner portal site with branded login
- PTSF staff register a practitioner against a practice account and the treatment types they cover
- Registration creates the practitioner contact and portal user and sends a welcome-and-set-password email
- PTSF staff can deactivate a practitioner; open assignments are flagged for reassignment
- Bulk creation path for the initial ~4,000 practitioners

## Guardrails

- No practitioner self sign-up; PTSF provisions (G0009 assumption — confirm before build).
- Practitioner portal runs on a Lightning Web Runtime (LWR) site (data/memory.json decision_log, 2026-11-16).

## Out of scope

- Must not build the practitioner work list or assessment form (handled by INT-016).
- Must not build allocation (handled by INT-014).

## Acceptance

Sofia, a PTSF office administrator in Lisbon, registers Dr Amara Osei under 'Costa Clinic' for cardiology and orthopaedics. Dr Osei receives an email, sets her password and signs in to the practitioner portal. Sofia later deactivates Dr Lee, and his one open allocation shows as needing reassignment.

## Success criteria

_none_

## Dependencies

### Internal
- INT-001

### External
_none_

## Open questions

- Q-009: How are practitioners vetted and provisioned today, and is there a register to bulk-load? (G0103, G0401) (Resolver: PTSF practitioner relations lead) — UNANSWERED
- Q-053: Which profile, permission set group and permission sets does each persona this intent affects (office-administrator, practitioner) get? The persona files leave this to decide. (Resolver: Trusted Guide) — UNANSWERED

## Grounding

- Persona: office-administrator
- Persona: practitioner
- Requirement: PTSF brief — Users (ptsf-lab-2026:discovery-notes/ptsf-brief.md@144731f83592)
- Source: ptsf-lab-2026#INT-005
