# Engagement kickoff — PTSF Lab

**Date:** 2026-11-18
**Source:** ptsf-lab-2026 (Scopezilla project ptsf-lab), reviewed at 144731f83592

## Context

PTSF is replacing about 30 locally run copies of a legacy case-management system with one global Salesforce process for patient travel subsidies. The process covers patient self-registration and onboarding, subsidy applications with an automatic insurance check, nearest-practitioner allocation, digital assessments, assessor review and approval, chat and self-service help. Medical history is protected throughout. The build runs in phases: foundations, the patient journey, and the practitioner and assessor journey, then migration and a pilot-office go-live, then regional rollout waves.

## Choice

- **Quantum Leap blueprint:** Mixed / multi-cloud (no single blueprint)
- **Clouds in scope:** Experience Cloud, Service Cloud (core platform; no industry cloud)
- **Target org:** `PTSF Production` (production; build_allowed=true)
- **Phase plan:** 8 phases over 73 weeks
- **Depth mode:** epic-level

## Consequences (cross-cutting commitments)

- One org on the core platform with Experience Cloud and Service Cloud. No Health Cloud, Nonprofit Cloud or OmniStudio ([ADR 0002](architecture/0002-core-platform-no-industry-cloud.md)).
- Medical history lives in this org on its own private object, granted record by record per assessment ([ADR 0001](architecture/0001-medical-history-in-org-governed.md)).
- Administrator, integration and migration access to medical history is a monitored break-glass exception, not a technical block ([ADR 0001](architecture/0001-medical-history-in-org-governed.md)).
- Patients are person accounts on Customer Community licences. Practitioners are contacts under practice accounts on Customer Community Plus licences.
- Both portals are Lightning Web Runtime sites.
- Subsidy Application is a custom object, not Case.
- Integrations are direct callouts from the org, with no middleware.
- The target org is production, so every deploy needs explicit confirmation.

These were locked during scoping. Do not re-litigate; surface them as constraints to the build agent.

## Align evidence from pre-sales

4 of 4 Align evidence items weren't fully captured in scoping; see the `## Align evidence from pre-sales` table in the tied source's `01-engagement-intent.md` at the cursor above. This is evidence toward ADF's Align gate; log its gaps as risks at Internal Onboarding.
