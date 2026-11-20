---
id: INT-016
phase: 3
epic: E05
confidence: Unknown
surface: lwc
origin: scopezilla
source: ptsf-lab-2026#INT-016
title: Practitioner work list and digital assessment form
---

# INT-016 — Practitioner work list and digital assessment form

## Outcome

Practitioners complete patient assessments digitally in the portal, replacing the download-print-scan-email PDF process and PTSF's re-keying.

## Build target

- Practitioner home shows offered, assigned, pending and submitted assessments
- Opening an assigned assessment shows the patient's permitted details, the service description and (while open) medical history
- The assessment form captures the assessment content; required fields are enforced before submission
- The form varies by treatment type where PTSF's form requires it
- Practitioners can save a draft and return
- Submitting moves the Assessment to 'Submitted' and the application to 'Ready for review'

## Guardrails

- The assessment form is a custom component on the LWR practitioner site (data/memory.json decision_log, 2026-11-16).
- Medical history displayed here comes only through the time-bound grant (decisions/0001-medical-history-in-org-governed.md).

## Out of scope

- Must not build specialist requests (handled by INT-017).
- Must not build escalation (handled by INT-018).
- Must not accept paper or PDF uploads as an alternative path unless Q-031 says so.

## Acceptance

Dr Wong signs in and sees Maria's assessment under 'Assigned'. She opens it, reads Maria's medical history, fills in the assessment, saves a draft at lunch and submits it in the afternoon. The assessment shows 'Submitted' and Chen sees Maria's application in 'Ready for review'.

## Success criteria

_none_

## Dependencies

### Internal
- INT-002
- INT-015

### External
_none_

## Open questions

- Q-030: What does the assessment form contain, and does it vary by treatment type? (G0501) (Resolver: PTSF clinical lead + practitioner representatives) — UNANSWERED
- Q-031: Is the paper/PDF path retired entirely once the portal is live? (G0005) (Resolver: PTSF operations lead) — UNANSWERED
- Q-032: Does a submitted assessment need a formal signature or attestation? (G0505) (Resolver: PTSF compliance lead) — UNANSWERED
- Q-063: Which profile, permission set group and permission sets does each persona this intent affects (practitioner) get? The persona files leave this to decide. (Resolver: Trusted Guide) — UNANSWERED

## Grounding

- Persona: practitioner
- Requirement: PTSF brief — Patient Assessment item 1 (ptsf-lab-2026:discovery-notes/ptsf-brief.md@144731f83592)
- Source: ptsf-lab-2026#INT-016
