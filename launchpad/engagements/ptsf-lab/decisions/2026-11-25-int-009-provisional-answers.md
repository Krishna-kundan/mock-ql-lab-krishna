# INT-009: provisional answers to Q-016 and Q-056, gate narrowed

**Date:** 2026-11-25 · **Deciders:** Krishna Kundan (Trusted Guide) · **Intents:** INT-009 · **Status:** Provisional — revisit when the PTSF platform owner answers Q-016

## Context

Every phase-1 intent was gated on unanswered open questions, so nothing could start. INT-009 (`intents/INT-009/intent.md`) was gated on Q-016 (source control, release process, release approver) and Q-056 (platform-admin profile, permission set group and permission sets). The Trusted Guide chose to narrow the gate on working assumptions rather than wait.

## Options

- Wait for the customer's answers. Phase 1 stays stalled.
- Rule working assumptions and build now. Rework is possible if the customer's answers differ.
- Resequence a later intent forward. No later intent was asked for.

## Choice

Provisional working assumptions, not customer answers:

- **Q-016:** Source control is git on GitHub. The Trusted Guide approves releases to production.
- **Q-056:** The platform-admin persona gets the default administrator access: the standard System Administrator profile, with no added permission set group or permission sets from this intent.

Build to the rest of the build target as written. Proof criteria that rest on either assumption are marked in the test script as resting on this record.

## Consequences

- Q-016's resolver is the PTSF platform owner. If their answer differs (another source-control host, or a customer-side approver), the pipeline and the approval step are reworked.
- The Acceptance has Priya, the PTSF platform owner, approving the release to production. The Q-016 assumption names the Trusted Guide as approver. These need reconciling before delivery: either both approve (Priya signs off as the customer, and the Trusted Guide instructs the deploy, per the production-deploy guardrail), or the Acceptance changes through a scope-change refinement.
- Default System Administrator access for the platform admin still has to respect ADR 0001. Administrator access to medical history is the governed, logged break-glass exception (INT-003), not a block.
- Q-056-style persona-access questions (Q-049 to Q-055) on other intents stay open. This record answers only Q-056.
