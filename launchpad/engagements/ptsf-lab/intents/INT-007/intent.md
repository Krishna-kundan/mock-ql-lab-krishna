---
id: INT-007
phase: 1
epic: E08
confidence: Unknown
surface: integration
origin: scopezilla
source: ptsf-lab-2026#INT-007
title: Background Health Insurance Checker service with retry
---

# INT-007 — Background Health Insurance Checker service with retry

## Outcome

The system can ask the Health Insurance Checker about a patient without making anyone wait up to 15 seconds, and failed calls recover on their own.

## Build target

- A reusable service that sends a patient's details to the Health Insurance Checker and stores the result against the requesting record
- Calls run in the background; the requesting user or process never waits on the response
- A synchronous-feeling path for the onboarding wizard that does not block the page while waiting
- Automatic retry on timeout or error; after repeated failures the service pauses calls and alerts the integration owner
- Credentials held per environment, never in code
- Call outcomes (success, retried, failed) are visible to the integration owner

## Guardrails

- Direct callouts from the org; no MuleSoft or other middleware (data/memory.json decision_log, 2026-11-16).
- Never make a synchronous blocking call to the Checker from a user transaction.

## Out of scope

- Must not decide eligibility or reject applications (handled by INT-013).
- Must not build the onboarding prefill screens (handled by INT-010).

## Acceptance

Raj, PTSF's integration owner, submits a test patient against the Checker test environment and sees the insurance result stored within seconds. He switches the test endpoint to time out; the call retries, then pauses, and Raj receives an alert. When the endpoint recovers, queued checks complete without anyone re-submitting.

## Success criteria

_none_

## Dependencies

### Internal
- INT-001

### External
- Health Insurance Checker | integration contract (endpoints, authentication, rate limits, fields) and a test environment | owner: PTSF IT + Checker provider

## Open questions

- Q-012: Share the Checker contract: endpoints, auth, rate limits, returned fields, hosting (G0801). (Resolver: PTSF IT) — UNANSWERED
- Q-013: Who is alerted and who fixes a failing integration out of hours? (G0804) (Resolver: PTSF platform owner) — UNANSWERED

## Grounding

- Requirement: PTSF brief — Current systems (Health Insurance Checker) (ptsf-lab-2026:discovery-notes/ptsf-brief.md@144731f83592)
- Source: ptsf-lab-2026#INT-007
