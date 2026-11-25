---
id: INT-004
phase: 1
epic: E01
confidence: Assumed
surface: experience-cloud
origin: scopezilla
source: ptsf-lab-2026#INT-004
title: Patient self-registration with email or Facebook
---

# INT-004 — Patient self-registration with email or Facebook

## Outcome

A patient can create an account with email and password or with Facebook, and registration stays responsive during sign-up spikes.

## Build target

- Branded login and registration pages on the patient portal site
- Sign-up with email and password
- Sign-up and login with Facebook
- Each new patient gets a person account and a portal user
- Registration requests are processed asynchronously in small batches so spikes don't fail
- A patient who registered one way and later uses the other is matched to the same account, not duplicated

## Guardrails

- Patient portal runs on a Lightning Web Runtime (LWR) site (data/memory.json decision_log, 2026-11-16).
- Patients are person accounts on Customer Community licences (data/memory.json decision_log, 2026-11-16).

## Out of scope

- Must not build the onboarding wizard (handled by INT-010).
- Must not create portal users for migrated patients (handled by INT-025).

## Acceptance

Maria, a patient in rural Queensland, opens the patient portal, chooses 'Continue with Facebook', and lands in her new account. Her neighbour Ben signs up with email and password and receives a verification email. Later Maria tries email sign-up with the same address and is told she already has an account.

## Success criteria

_none_

## Dependencies

### Internal
- INT-001

### External
- Facebook developer app | PTSF-owned app id and secret for the login provider | owner: PTSF digital team

## Open questions

- Q-008: When the same person uses both email and Facebook, link them automatically or ask the patient? (G0101) (Resolver: PTSF digital lead) — UNANSWERED
- Q-052: Which profile, permission set group and permission sets does each persona this intent affects (patient) get? The persona files leave this to decide. (Resolver: Trusted Guide) — UNANSWERED

## Grounding

- Persona: patient
- Requirement: PTSF brief — Patient Onboarding item 1 (ptsf-lab-2026:discovery-notes/ptsf-brief.md@144731f83592)
- Source: ptsf-lab-2026#INT-004
