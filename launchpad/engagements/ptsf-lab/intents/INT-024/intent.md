---
id: INT-024
phase: 4
epic: E10
confidence: Assumed
surface: automation
origin: scopezilla
source: ptsf-lab-2026#INT-024
title: Salesforce-side migration readiness: load mode and duplicate matching
---

# INT-024 — Salesforce-side migration readiness: load mode and duplicate matching

## Outcome

Historic TAMS data can be loaded as a record of the past without firing live automation, and duplicate patients across offices are caught.

## Build target

- A migration mode that suppresses allocation, insurance checks, emails and escalations for records loaded by the migration user
- Migrated applications and assessments keep their historic status and dates
- Duplicate matching rules for patients across offices (name, date of birth, address, any shared identifier)
- A report of suspected duplicates for data stewards to resolve

## Guardrails

- Migration user access to medical history is break-glass and monitored (decisions/0001-medical-history-in-org-governed.md).

## Out of scope

- Must not build the extract, transform and load pipeline (handled by INT-025).

## Acceptance

Priya loads 1,000 test historic applications as the migration user: none are allocated, checked or emailed, and each keeps its original status and dates. Two test patients with the same name and birth date from Brisbane and Cairns appear in the duplicate report for Sofia to resolve.

## Success criteria

_none_

## Dependencies

### Internal
- INT-013
- INT-014
- INT-018
- INT-003

### External
_none_

## Open questions

- Q-043: Can the same patient exist in several offices' TAMS, and is there a shared identifier? (G1002) (Resolver: PTSF data owner) — UNANSWERED
- Q-071: Which profile, permission set group and permission sets does each persona this intent affects (platform-admin) get? The persona files leave this to decide. (Resolver: Trusted Guide) — UNANSWERED

## Grounding

- Persona: platform-admin
- Requirement: PTSF brief — Data items 2–3 (ptsf-lab-2026:discovery-notes/ptsf-brief.md@144731f83592)
- Source: ptsf-lab-2026#INT-024
