# INT-009: release pipeline on GitHub Actions multi-stage, not DevOps Center

**Date:** 2026-11-25 · **Deciders:** Krishna Kundan (Trusted Guide), ratifying 'intents/INT-009/design.md' · **Intents:** INT-009 · **Status:** Accepted. Revisit when PTSF answers data residency (G0002).

## Context

INT-009 needs dev → integration test → Full sandbox → production promotion with a code scan at each step ('intents/INT-009/intent.md'). The tied solution's "Environments, release and governance" section names DevOps Center with Code Analyzer. It also says Lifecycle Center isn't the default while residency is open, because Lifecycle Center isn't available in the EU Operating Zone. The repo ran the simple feature → main pipeline, which has no test stages. This record departs from the grounding's named tool. It isn't an inherited ADR, so there is no 'BLD-' ADR.

## Options

- **GitHub Actions multi-stage add-on, plus engagement-owned production workflows.** Works under any residency answer. The repo stays the single source of truth with the trust chain. Code Analyzer already runs on each PR validation. The cost is a less visual promotion view for the customer admin, and two engagement-owned workflows to maintain.
- **Lifecycle Center.** Native, click-based, with quality gates before every promotion. Not available in the EU Operating Zone, and it runs its own stage branches beside this repo's flow.
- **DevOps Center managed package.** Named in the grounding, but Lifecycle Center is its successor with a migration path. Starting on it now corners a later move.
- **Keep the simple pipeline.** No integration-test or Full sandbox stage, so it can't meet the Acceptance.

## Choice

GitHub Actions multi-stage, as ratified in 'intents/INT-009/design.md':

1. Swap to the 'deploy-multistage' add-on through '/ql-resync'.
2. Production deploys only through a manual 'prod_deploy.yml', behind the GitHub Environment 'Production' with the Trusted Guide as required reviewer. PRs into 'main' get a check-only validation.
3. No Apex or 'SandboxPostCopy'. A manual 'credentials_reestablish.yml' writes External Credential secrets from GitHub Environment secrets through the Connect REST API after each refresh.
4. No sharing or FLS change. platform-admin gets System Administrator (provisional, per 'decisions/2026-11-25-int-009-provisional-answers.md'). Backup access and deployment users are ADR 0001 governed exceptions.
5. Each scan result is saved with '--output-file' and uploaded as a run artifact. This is a local edit to a resync-managed file until it's contributed upstream.

**Provisional — the build proceeds; criteria that depend on them stay ⛔ blocked until answered:**

- Q-design-2: hold Full sandbox refreshes, or pull INT-026 forward, before production holds patient data
- Q-design-3: how the PTSF platform owner's customer sign-off is captured (GitHub PR approval, or an outside record cited in the PR)
- Q-design-4: proving the credential workflow with a throwaway test External Credential
- Q-design-5: backup product, licences and retention
- Q-design-6: the deployment user's licence and profile, and whether INT-003's monitoring covers it

## Consequences

- If residency allows Lifecycle Center, switching keeps the metadata, because the repo remains the source. The two production workflows are retired, and the promotion view moves to Lifecycle Center.
- The '--output-file' change makes '/ql-resync' show a local diff on the add-on's shared action until it's upstream.
- In the lab, validating against the production-type 'ql-lab' org can fail 75% coverage because of its untracked demo Apex. PTSF production is greenfield.
- Full sandbox and Backup and Recover licences are customer purchases not yet declared in the intent's Dependencies. They go through '/ql-refine-intent'.