---
id: INT-003
phase: 1
epic: E09
confidence: Assumed
surface: security
origin: scopezilla
source: ptsf-lab-2026#INT-003
title: Medical-history lockdown for internal users with monitored break-glass access
---

# INT-003 — Medical-history lockdown for internal users with monitored break-glass access

## Outcome

No PTSF Assessor or Manager can see medical history anywhere in the system, and any administrator, integration or migration access is logged and reviewed by a named owner.

## Build target

- Assessor and Manager access is defined in permission sets that grant no access to the Medical History object or its fields
- Medical History is absent from internal list views, reports, search results and related lists
- Administrator, integration and migration users are a documented break-glass group
- Access to medical history by the break-glass group is captured and reviewable by the named owner
- A periodic review report lists every break-glass access event

## Guardrails

- Field-level security is the control for internal users; administrator access is governed, not technically prevented (decisions/0001-medical-history-in-org-governed.md).
- Event Monitoring is the monitoring source for break-glass access (decisions/0001-medical-history-in-org-governed.md).
- Permission sets only — do not edit standard profiles.

## Out of scope

- Must not build practitioner grants (handled by INT-002).
- Must not build sandbox masking (handled by INT-026).

## Acceptance

Chen, an Assessor in the Singapore office, opens Tomas Reyes's Subsidy Application, searches for 'diabetes', and runs the application report: no medical-history content appears anywhere. Priya, the platform owner, opens the break-glass review and sees the one access event from the migration user during last night's test load, with user, time and record.

## Success criteria

_none_

## Dependencies

### Internal
- INT-001

### External
- Event Monitoring licence | licensed and enabled in the org | owner: PTSF platform owner + Salesforce account team

## Open questions

- Q-006: Is governed, logged administrator access acceptable, or must the rule hold technically against administrators? (G0901) (Resolver: PTSF executive sponsor + compliance lead) — UNANSWERED
- Q-007: Must PTSF show who viewed (not just changed) medical history, and for how long? (G0905) (Resolver: PTSF compliance lead) — UNANSWERED
- Q-051: Which profile, permission set group and permission sets does each persona this intent affects (assessor, platform-admin) get? The persona files leave this to decide. (Resolver: Trusted Guide) — UNANSWERED

## Grounding

- Persona: assessor
- Persona: platform-admin
- Requirement: PTSF brief — Visibility & Accessibility (ptsf-lab-2026:discovery-notes/ptsf-brief.md@144731f83592)
- decision: ADR 0001 — medical history in org, governed (ptsf-lab-2026:decisions/0001-medical-history-in-org-governed.md@144731f83592)
- Source: ptsf-lab-2026#INT-003
