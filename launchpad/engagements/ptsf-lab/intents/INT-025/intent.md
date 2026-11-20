---
id: INT-025
phase: 4
epic: E10
confidence: Unknown
surface: integration
origin: scopezilla
source: ptsf-lab-2026#INT-025
title: Pilot-office extract, transform, load and reconciliation
---

# INT-025 — Pilot-office extract, transform, load and reconciliation

## Outcome

The pilot office's patients, applications and assessments arrive in Salesforce complete and reconciled, so the office can go live without TAMS.

## Build target

- Extract from the pilot office's TAMS into a staging area
- Map the office's TAMS variant to the target model
- Load patients, then applications, then assessments, in parent-to-child order
- Create or defer portal access for migrated patients per Q-045
- Reconciliation report: counts and key totals by record type, source vs target
- Repeatable rehearsal runs before cutover

## Guardrails

- Extract-transform-load runs off-platform from a staging area into Salesforce bulk loads (data/memory.json decision_log, 2026-11-16).
- Rehearsal data containing medical history follows the same visibility rule (decisions/0001-medical-history-in-org-governed.md).

## Out of scope

- Must not migrate in-flight applications — they finish in TAMS.
- Must not migrate offices beyond the pilot in this phase (later waves reuse this pipeline).

## Acceptance

After the second rehearsal, Sofia, the pilot office's data steward, opens the reconciliation report: patient, application and assessment counts match TAMS, and she spot-checks ten patients end to end. She signs off the office for cutover.

## Success criteria

_none_

## Dependencies

### Internal
- INT-024

### External
- Pilot office TAMS | schema documentation and sample extract; read access for extraction | owner: PTSF pilot office + IT

## Open questions

- Q-044: How many distinct TAMS schemas exist? (G1001) (Resolver: PTSF IT) — UNANSWERED
- Q-045: Create portal users for migrated patients up front, or let them claim accounts? (G0107) (Resolver: PTSF digital lead) — UNANSWERED
- Q-046: Do historic assessments exist only as PDFs outside TAMS? (G1003) (Resolver: PTSF pilot office) — UNANSWERED
- Q-047: Who signs off reconciliation, and against what threshold? (G1006) (Resolver: PTSF data owner) — UNANSWERED
- Q-072: Which profile, permission set group and permission sets does each persona this intent affects (office-administrator) get? The persona files leave this to decide. (Resolver: Trusted Guide) — UNANSWERED

## Grounding

- Persona: office-administrator
- Requirement: PTSF brief — Data item 2 (ptsf-lab-2026:discovery-notes/ptsf-brief.md@144731f83592)
- Source: ptsf-lab-2026#INT-025
