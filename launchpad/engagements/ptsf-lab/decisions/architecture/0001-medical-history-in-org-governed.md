# 0001 — Medical history lives in the PTSF org; internal business users are blocked by field-level security and administrator access is a governed, logged exception

**Adopted-from:** ptsf-lab-2026@144731f83592:decisions/0001-medical-history-in-org-governed.md

**Date:** 2026-11-16 · **Status:** accepted · **Source:** scopezilla-inherited

## Context
The brief states that PTSF internal users "cannot see medical history at all" and that practitioners see it only while they hold an open assigned assessment. On the Salesforce platform, View All Data and Modify All Data override sharing on every object [KA-10493], restriction rules do not bind those users or system-mode code [KA-10379], and encryption does not act as authorization [KA-9968]. A technical guarantee against administrators is therefore not available in a single org. Alternatives were an external medical-history store surfaced via Salesforce Connect, or a separate org (gap G0901).

## Decision
Store medical history in the PTSF org on a dedicated object. Remove object and field access from every internal business profile and permission set (Assessor, Manager). Grant practitioners time-bound access only (G0902). Treat administrator, integration and migration access as a documented break-glass exception, monitored with Event Monitoring and reviewed by a named owner (G0905).

## Consequences
- E09 carries the field-level security model, the access-grant design and break-glass policy; E08 may carry a security-monitoring feed.
- Event Monitoring (and possibly Shield) becomes a licensing question for license-needs.
- Sandbox handling of medical history (G1203) and rehearsal data (G1004) must follow the same rule.
- Revisit if the regulation answer (G0002) requires a stronger technical separation; that would reopen the external-store option.

## Grounds
- `discovery-notes/ptsf-brief.md`, Visibility & Accessibility section (internal users cannot see medical history; practitioner time-bound access).
- [KA-10493], [KA-10379], [KA-9968], [KA-10487].
- Scoper selected option (a) on 2026-11-16 (user-endorsed; client confirmation pending).
