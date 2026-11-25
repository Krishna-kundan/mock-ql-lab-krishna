---
id: INT-006
phase: 1
epic: E01
confidence: Assumed
surface: security
origin: scopezilla
source: ptsf-lab-2026#INT-006
title: Single sign-on for staff across three regional directories
---

# INT-006 — Single sign-on for staff across three regional directories

## Outcome

Each of the ~500 Assessors and Managers signs in with their existing regional credentials, routed automatically to the right directory.

## Build target

- Three identity provider connections, one per regional directory (APAC, EMEA, AMER)
- The login page routes each staff member to their own regional directory from their username or email
- First sign-in creates or updates the staff user with the right region, office and permission sets
- Leavers disabled in their directory can no longer sign in

## Guardrails

- Staff identity stays in the three regional directories; Salesforce does not become the master for staff identity.

## Out of scope

- Must not consolidate or change the regional directories.
- Must not cover patient or practitioner login (handled by INT-004, INT-005).

## Acceptance

Chen in Singapore, Sofia in Lisbon and Marcus in Toronto each type their work email on the login page and land on their own region's sign-in screen; after signing in, each sees the console with their office's queues.

## Success criteria

_none_

## Dependencies

### Internal
_none_

### External
- Three regional Active Directory federation services | a SAML or OpenID Connect identity provider per region, with test accounts and metadata | owner: PTSF regional IT

## Open questions

- Q-010: Does each regional directory sit behind a federation service that can act as an identity provider? (G0003) (Resolver: PTSF regional IT leads) — UNANSWERED
- Q-011: Can each federation service enforce multi-factor authentication? (G0105) (Resolver: PTSF security lead) — UNANSWERED
- Q-054: Which profile, permission set group and permission sets does each persona this intent affects (assessor, team-manager, office-administrator) get? The persona files leave this to decide. (Resolver: Trusted Guide) — UNANSWERED

## Grounding

- Persona: assessor
- Persona: team-manager
- Persona: office-administrator
- Requirement: PTSF brief — Current systems (Active Directory) (ptsf-lab-2026:discovery-notes/ptsf-brief.md@144731f83592)
- Source: ptsf-lab-2026#INT-006
