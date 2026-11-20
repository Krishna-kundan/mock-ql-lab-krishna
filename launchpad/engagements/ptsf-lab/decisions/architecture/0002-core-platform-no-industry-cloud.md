# 0002 — Build on the core Salesforce platform with Experience Cloud and Service Cloud; no industry cloud

**Adopted-from:** ptsf-lab-2026@144731f83592:decisions/0002-core-platform-no-industry-cloud.md

**Date:** 2026-11-16 · **Status:** accepted · **Source:** scopezilla-inherited

## Context
PTSF handles medical history and assessments, which makes Health Cloud a candidate. The brief's processes are subsidy casework: onboarding, application, practitioner allocation, assessment, approval, chat and self-service deflection (gap G0004).

## Decision
Use the core platform with Experience Cloud (patient and practitioner portals) and Service Cloud (Enhanced Chat, Knowledge for deflection). No Health Cloud or Nonprofit Cloud data model.

## Consequences
- Custom objects for subsidy application, assessment, medical history and access grants (E03, E05, E09).
- OmniStudio-dependent features (OmniScript, Business Rules Engine decision matrices) are not assumed licensed; forms default to Screen Flow with Lightning Web Components (G0501) and subsidy rules to Flow/custom metadata (G0604).
- Revisit if PTSF already licenses an industry cloud or if clinical-care scope appears.

## Grounds
- `discovery-notes/ptsf-brief.md`, Business Process Requirements and Users of the System sections.
- General Salesforce guidance (not KB-grounded); scoper endorsed 2026-11-16, client confirmation pending.
