---
id: INT-001
phase: 1
epic: E09
confidence: Assumed
surface: data-model
origin: scopezilla
source: ptsf-lab-2026#INT-001
title: Core subsidy data model built for tens of millions of patients
ratified: 2026-11-26 by Krishna Kundan @ 4a7cc08387e3 · absorbed
---

# INT-001 — Core subsidy data model built for tens of millions of patients

## Outcome

Every later journey has one global place to hold patients, applications, assessments, treatment types and medical history, designed from day one for 5M patients growing to ~38M.

## Build target

- Patients are held as individual (person) accounts
- Practices are business accounts; Medical Practitioners are contacts under their practice
- Subsidy Application record: treatment type, reason, status, insurance-check result, approved amount, assigned practitioner, satellite office, region
- Assessment record: one or more per Subsidy Application, each with its own assigned practitioner, status, assigned date and parent assessment (for specialist requests)
- Medical History record: patient's medical history, held separately from the patient and the application
- Medical History Access record: one row per time-bound grant (who, which patient, which assessment, granted at, revoked at)
- Treatment Type catalog (500+ entries) and Practitioner Treatment junction (which practitioner is registered for which treatment type)
- Subsidy Rate guidance table, admin-maintained without code (rate by transport type and distance band)
- Allocation and patient search find their records selectively: the fields they filter on are indexed
- No single owner holds enough patient records to cause ownership skew
- Only users given access can see a Subsidy Application, Assessment or Medical History record they don't own

## Guardrails

- Core platform only — no Health Cloud, Nonprofit Cloud or OmniStudio objects (decisions/architecture/0002-core-platform-no-industry-cloud.md).
- Patients are person accounts; Subsidy Application is a custom object, not Case (data/memory.json decision_log, 2026-11-16).
- Medical history lives in this org on its own object (decisions/architecture/0001-medical-history-in-org-governed.md).
- Do not create a per-office or per-region variant of any object; one global model serves all 30 satellite offices.

## Out of scope

- Must not build sharing grants for practitioners (handled by INT-002).
- Must not build field-level lockdown or break-glass monitoring (handled by INT-003).
- Must not load any TAMS data (handled by INT-024 and INT-025).
- Must not model travel booking or payment — the system records the approved subsidy only.
- Must not settle the business values of application and assessment status, reason, insurance-check result, transport type or distance band; this intent builds the fields with placeholder values, and the intents that drive each lifecycle set them.
- Must not prove allocation at production volume (handled by INT-014).

## Acceptance

- The PTSF platform owner opens a test patient (person account) and sees a Subsidy Application for 'Cardiac surgery — specialist centre' with two Assessments beneath it, one a specialist child of the other.
- The PTSF platform owner opens the Treatment Type list and finds the catalog.
- The PTSF platform owner opens a practice account and sees its practitioners and the treatment types each is registered for.
- The PTSF platform owner opens the test patient's Medical History, held on its own record, and a Medical History Access row showing who was granted access, for which assessment, and when it was granted and revoked.
- The PTSF platform owner changes a Subsidy Rate for one transport type and distance band in Setup, with no deployment.
- A test user who neither owns nor has been given access to the test Subsidy Application, its Assessments or its Medical History can't open them.
- On a seeded sandbox, the Query Plan reports the allocation and patient-search filters as selective.

### Detail

- "Seeded" means enough patient and application rows for the Query Plan to reflect indexed access; the production-scale seed waits on Q-001.

## Success criteria

_none_

## Dependencies

### Internal
_none_

### External
_none_

## Open questions

- Q-001: Is the current patient count 3.5M or 5M? It sets volume seeding and ownership-spread design (G0001). (Resolver: PTSF data owner) — UNANSWERED
- Q-002: Who owns the 500+ treatment-type catalog, and is it one global list? (G0304) (Resolver: PTSF head office operations + design authority) — UNANSWERED
- Q-003: How long must each record type be kept, and when do closed applications archive? (G0904) (Resolver: PTSF compliance lead) — UNANSWERED
- Q-049: Which profile, permission set group and permission sets does each persona this intent affects (platform-admin) get? The persona files leave this to decide. (Resolver: Trusted Guide) — UNANSWERED
- Q-074: Who owns patient records (per satellite office, a pool of integration users, or another scheme), so no owner holds enough to cause skew? (Resolver: PTSF data owner + design authority) — UNANSWERED
- Q-075: What are the business values for application and assessment status, application reason, insurance-check result, transport type and distance band? INT-001 builds the fields with placeholder values until the lifecycle intents set them. (Resolver: PTSF head office operations) — UNANSWERED

## Grounding

- Persona: platform-admin
- Requirement: PTSF brief — Requesting Travel Assistance; Data (ptsf-lab-2026:discovery-notes/ptsf-brief.md@144731f83592)
- decision: ADR 0001 — medical history in org, governed (ptsf-lab-2026:decisions/0001-medical-history-in-org-governed.md@144731f83592)
- decision: ADR 0002 — core platform, no industry cloud (ptsf-lab-2026:decisions/0002-core-platform-no-industry-cloud.md@144731f83592)
- Source: ptsf-lab-2026#INT-001
