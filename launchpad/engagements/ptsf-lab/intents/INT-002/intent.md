---
id: INT-002
phase: 1
epic: E09
confidence: Assumed
surface: security
origin: scopezilla
source: ptsf-lab-2026#INT-002
title: Time-bound practitioner access to medical history
---

# INT-002 — Time-bound practitioner access to medical history

## Outcome

A Medical Practitioner can read a patient's medical history only while they hold an open assigned assessment for that patient, and every grant is provable after the fact.

## Build target

- When an Assessment opens with an assigned practitioner, that practitioner gains read access to the patient's Medical History
- When the Assessment is submitted, closed or reassigned, that access is removed
- Each grant and revocation writes a Medical History Access record
- Practitioners see only the patient's name, phone, email and the service description on the Subsidy Application — no other patient fields
- Practitioners see all assessments on applications they are assigned to
- Grant logic tolerates bulk changes (many assessments opening or closing at once) without losing a revocation

## Guardrails

- Access is granted record by record from code against a private Medical History default; no criteria- or role-based sharing opens medical history (decisions/0001-medical-history-in-org-governed.md).
- A revocation must never be skipped silently — if removal fails, retry and alert; leaving access open is the worst failure mode.
- Practitioners are Customer Community Plus contacts under a practice account (data/memory.json decision_log, 2026-11-16).

## Out of scope

- Must not give any internal user access to medical history (handled by INT-003).
- Must not build the assessment form itself (handled by INT-016).

## Acceptance

Dr Amara Osei, a practitioner, is assigned an assessment for patient Tomas Reyes. She opens the practitioner portal and can read Tomas's medical history. She submits the assessment; on refresh the medical history is gone, and Priya, the platform owner, sees two Medical History Access rows — granted at 09:12, revoked at 10:47. A second practitioner, Dr Lee, with no assessment for Tomas, never sees it.

## Success criteria

_none_

## Dependencies

### Internal
- INT-001
- INT-005

### External
_none_

## Open questions

- Q-004: Does access start at acceptance or at assessment open, and end at submission or at application close? (G0902) (Resolver: PTSF clinical governance + Solution Architect) — UNANSWERED
- Q-005: 'All assessments for patients related to a subsidy application' — does a practitioner see other practitioners' assessments on the same application? (G0906) (Resolver: PTSF clinical governance) — UNANSWERED
- Q-050: Which profile, permission set group and permission sets does each persona this intent affects (practitioner) get? The persona files leave this to decide. (Resolver: Trusted Guide) — UNANSWERED

## Grounding

- Persona: practitioner
- Requirement: PTSF brief — Visibility & Accessibility (ptsf-lab-2026:discovery-notes/ptsf-brief.md@144731f83592)
- decision: ADR 0001 — medical history in org, governed (ptsf-lab-2026:decisions/0001-medical-history-in-org-governed.md@144731f83592)
- Source: ptsf-lab-2026#INT-002
