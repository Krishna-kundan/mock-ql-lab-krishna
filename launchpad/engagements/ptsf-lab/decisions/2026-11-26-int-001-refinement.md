# INT-001: narrow the volume proof, defer business value sets, restate build mechanics as outcomes

**Date:** 2026-11-26 · **Deciders:** Krishna Kundan · **Intents:** INT-001, INT-014

## Context

A `/ql-vet-intent` pass on `intents/INT-001/intent.md` graded it not ready to build. Its acceptance called for a data-volume walkthrough of the allocation and patient-search queries on a volume-seeded sandbox, but the allocation query is built in INT-014, the seed volume waits on Q-001, and "selectively" had no pass condition. The vet also found:

- acceptance didn't cover Medical History, Medical History Access, admin-maintained Subsidy Rates or record privacy
- business value sets and patient record ownership were left unstated, with no open question for either
- two build-target lines stated mechanisms rather than outcomes
- the guardrail paths to ADR 0001 and ADR 0002 were wrong

This refinement is absorbed: nothing agreed with the customer is dropped. It loosens one out-of-scope line, which is why this record exists.

## Options

- **Volume proof:** keep the full volume-seeded proof in INT-001 (gated on Q-001, with the sandbox declared as an external dependency); narrow it to an index check in INT-001 and move allocation at volume to INT-014; or drop it from INT-001 entirely.
- **Value sets:** add an open question and build placeholders, or declare the values owned by the lifecycle intents.
- **Ownership skew:** add an open question, state a per-owner ceiling as a guardrail, or defer it to the migration intents.

## Choice

- INT-001 proves that the Query Plan reports the allocation and patient-search filters as selective on a seeded sandbox. Allocation at production volume is proved in INT-014, which already requires allocation to stay selective as volume grows. The production-scale seed waits on Q-001.
- INT-001 builds the status, reason, insurance-check result, transport type and distance band fields with placeholder values. The intents that drive each lifecycle set the business values (Q-075). This is the loosened out-of-scope line.
- Ownership skew stays an outcome of INT-001; who owns patient records is Q-074.
- "Indexed lookup paths" and "org-wide defaults private" are restated as outcomes (selective search, and only users given access see records they don't own). The mechanisms move to `design.md`, which must still propose them.
- Acceptance becomes a short list covering every build-target item, with the named persona replaced by the role.
- The guardrail citations now point to `decisions/architecture/`.

## Consequences

- INT-014's proof plan must carry the allocation-at-volume criterion that INT-001 no longer holds.
- The lifecycle intents (INT-012, INT-013, INT-016, INT-017, INT-020) inherit setting their business values. Placeholder values deployed by INT-001 must be replaced, not appended to.
- `/ql-design-intent` for INT-001 must name the indexed fields, the org-wide defaults and an interim ownership scheme pending Q-074.
- Person Accounts enablement is recorded as an irreversible step in `launchpad/deploy-runbook.md` §1.
