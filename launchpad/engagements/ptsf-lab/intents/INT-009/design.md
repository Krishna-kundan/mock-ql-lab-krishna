---
intent: INT-009
scope_hash: 34b8c93b947e
authored: 2026-11-25
ratified: 2026-11-25 by Krishna Kundan @ 3c34d5b238fc
---

# INT-009 — Design

**Intent:** Environments and source-driven release pipeline
**Source intent:** `intents/INT-009/intent.md`
**Binding:** `decisions/2026-11-25-int-009-provisional-answers.md` (Q-016, Q-056 provisional), ADR 0001, ADR 0002

## Approach in one line

Promote changes with the repo's **GitHub Actions multi-stage pipeline**: develop → integration-test sandbox, `release/*` → Full sandbox, `main` → production on a manual, reviewer-gated run. Code Analyzer runs on every promotion and attaches its result. Per-environment credential values live in GitHub Environment secrets, and a manual workflow re-applies them after each refresh. Backup and Recover covers production. Lifecycle Center is the alternative if the residency answer allows it (Q-design-1).

## Data model

No objects, fields or relationships. `launchpad/data-model.md` doesn't change.

## Environments

| Stage | Org | Branch | Deployed by |
|---|---|---|---|
| Development | Developer sandbox per developer. `ql-lab` isn't a Dev Hub (probe: `ScratchOrgInfo` unsupported), so scratch orgs aren't an option here; sandbox type fit ⚠ unverified. | `feature/<eng>/INT-NNN-*` | the developer |
| Integration test | Developer Pro sandbox (GitHub Environment `CI`); type fit ⚠ unverified | `develop` | `feature-ci_deploy.yml` on merge |
| UAT and performance | **Full** sandbox (GitHub Environment `TEST`) | `release/*` | `feature-release-test_deploy.yml` on merge |
| Production | PTSF production (GitHub Environment `Production`) | `main` | new `prod_deploy.yml`, manual run only |

- A Full sandbox refreshes at most every 29 days. Each refresh changes the sandbox's org ID, and creating or refreshing one needs the Manage Sandboxes permission [docs:https://help.salesforce.com/s/articleView?id=platform.data_sandbox_refresh.htm&release=264.0.0&type=5]. The org ID change means the CI auth secret (`SFDX_URL`) for `TEST` must be re-issued after each refresh. That goes in the refresh runbook step below.
- Creating the sandboxes is a Setup step (Setup → Sandboxes) [docs:https://help.salesforce.com/s/articleView?id=platform.data_sandbox_refresh.htm&release=264.0.0&type=5], listed in `launchpad/deploy-runbook.md`.
- The Full sandbox licence is a customer purchase (⚠ unverified for PTSF's edition; the refresh page shows sandbox licences are counted per org [docs:https://help.salesforce.com/s/articleView?id=platform.data_sandbox_refresh.htm&release=264.0.0&type=5]). It isn't declared in the intent's `## Dependencies`, so route it to `/ql-refine-intent`.

## Pipeline and promotion

- **Swap the deploy add-on** from `deploy-simple` to `deploy-multistage` through `/ql-resync`. The repo allows only one deploy pipeline [repo:.github/workflows/README.md].
  - The add-on brings the `CI` and `TEST` deploys, PR validation for each, delta packages and Code Analyzer [repo:add-ons/deploy-multistage/add-on.json].
  - `sf-validate.yml` and `sf-deploy.yml` are removed.
- **The add-on has no production stage**: its workflows trigger on `develop` and `release/*` only [repo:add-ons/deploy-multistage/files/.github/workflows]. This build adds two engagement-owned workflows:
  - `main_pr-validation.yml`: a check-only validation (`--dry-run`, as the shared action already does [repo:add-ons/deploy-multistage/files/.github/actions/multistage/action.yml]) against production on PRs into `main`, with Code Analyzer. It reuses the add-on's shared action in validate mode.
  - `prod_deploy.yml`: `workflow_dispatch` only, never on push. It targets the GitHub Environment `Production` with the Trusted Guide as required reviewer, and it deploys what `main` holds.
  - Together these make the guardrail "production deploys only on an explicit user instruction" mechanical. GitHub required reviewers on environments: ⚠ unverified (GitHub docs not read this session).
- **Release approval, as ruled:** Priya approves the `release/*` → `main` PR as the customer. The Trusted Guide then runs `prod_deploy.yml` and approves the `Production` environment gate. How Priya's approval is captured is Q-design-3.
- **Test level against production.** With `RunLocalTests` against a production-type org, the 75% coverage requirement counts all unmanaged Apex in the org, including Apex outside this repo [repo:.github/workflows/README.md, "Unset or RunLocalTests"]. `ql-lab` holds 323 unmanaged Apex classes from demo content, so production validation there can fail on coverage this repo never touched. PTSF production is greenfield and shouldn't hit this.

## Static code scanning

- The shared action runs `sf code-analyzer run --workspace delta --config-file code-analyzer.yml --severity-threshold 2` on each PR validation. A violation at that severity or worse fails the check [repo:add-ons/deploy-multistage/files/.github/actions/multistage/action.yml].
- **"Attached at each step"**: the build adds `--output-file` to that call and uploads the result as a run artifact, so each promotion PR carries its scan report. Code Analyzer's CI guidance recommends both `--output-file` and `--severity-threshold`, and its GitHub Action is `run-code-analyzer` v2 (v1 is retired) [docs:https://developer.salesforce.com/docs/platform/salesforce-code-analyzer/guide/ci-cd.html].
- The add-on is managed by `/ql-resync`, so the `--output-file` change is either an upstream contribution or a local edit that resync will flag. Recorded as a build ruling.
- Scans run at all three promotions: PR into `develop`, PR into `release/*`, PR into `main`.

## Credentials after a sandbox refresh

- Named and External Credential **definitions** ride the metadata deploy. Their **secrets** don't: the Metadata API can't carry tokens or certificates, and they're populated through the UI or the Connect REST API (`/named-credentials/credential/`) [docs:https://developer.salesforce.com/docs/platform/named-credentials/guide/nc-populate-external-credentials.html].
- **Mechanism:** a `credentials_reestablish.yml` workflow, manual and run per GitHub Environment. It reads each environment's secrets from GitHub Environment secrets and calls that Connect REST endpoint for each External Credential in a checked-in, secret-free list (`config/credentials.json`: credential name and principal name only). No secret lives in the repo or in Apex. This matches the "never in code" guardrails on INT-007 and INT-008.
- **Why not `SandboxPostCopy`:** it runs as the Automated Process user, which can't reach every object and feature [docs:https://developer.salesforce.com/docs/platform/apex-ref/references/apex-ref/apex-interface-system-sandboxpostcopy.html], and it would have to get secrets from somewhere other than code. Whether Apex can write External Credential principals at all: ⚠ unverified. Leaving the post-copy slot free also keeps it open for INT-026's masking.
- **There's nothing to re-establish yet.** PTSF's first integrations are INT-007 (Health Insurance Checker) and INT-008 (address validation). This intent ships the workflow and an empty list, and proves it with one test credential (Q-design-4).
- Whether a refresh copies production credential secrets and endpoints into the sandbox: ⚠ unverified. The workflow overwrites them either way, but a sandbox could call a production endpoint between refresh and re-run. The runbook orders the re-run immediately after activation.

## Backup and recovery

- Salesforce Backup and Recover takes daily backups of data, attached files and metadata, and needs the add-on licence on Enterprise, Unlimited or Developer Edition [docs:https://help.salesforce.com/s/articleView?id=xcloud.backup_recover_o_overview.htm&release=264.0.0&type=5].
- The REST API names separate Backup & Recover Data and Files licences [docs:https://help.salesforce.com/s/articleView?id=xcloud.backup_recover_api.htm&release=264.0.0&type=5]. Which product and licences PTSF buys is Q-design-5.
- Setup only: enable it, choose the objects and files, set retention (steps ⚠ unverified; read the setup page at build). All of it goes in the runbook. Whether any of it is deployable metadata: ⚠ unverified.
- **ADR 0001:** backups hold medical history, so viewing or restoring backup data is administrator access to medical history. It follows the governed, logged break-glass exception, and backup-and-restore admins are named in INT-003's monitoring.
- Not declared in `## Dependencies`. Route to `/ql-refine-intent`.

## Sharing and security

- **No sharing or FLS change.** No objects are created.
- **platform-admin** gets the standard System Administrator profile, provisionally (Q-056 record). That it covers sandbox and Backup and Recover administration is ⚠ unverified; the refresh page names Manage Sandboxes as the permission needed [docs:https://help.salesforce.com/s/articleView?id=platform.data_sandbox_refresh.htm&release=264.0.0&type=5]. Once ratified, the persona file's access line is updated to say so, marked provisional.
- **Deployment identity:** each GitHub Environment authenticates with `SFDX_URL` or JWT [repo:.github/workflows/README.md]; using a dedicated deployment user per org is this design's choice. The deploy user's required rights (likely administrator-level) are ⚠ unverified, so under ADR 0001 its access to medical history is the monitored exception. Which licence and profile it uses is Q-design-6.
- **Who reaches what:**

  | Persona | Gets | Reached through |
  |---|---|---|
  | platform-admin (Priya) | System Administrator access | Setup (sandboxes, Backup and Recover) and GitHub (PR approval, Actions runs) |
  | Trusted Guide | `Production` environment reviewer | GitHub Actions |

  No app slot, page layout or list view is involved.

## Cascading consequences

| Ripple | Disposition |
|---|---|
| FLS on permission sets | n/a: no fields |
| App slot, page, layout, list view | n/a: no Salesforce UI. The surfaces are Setup and GitHub. |
| Permission-set updates | n/a: default System Administrator (provisional). Persona file line updated after ratification. |
| Tests for new Flow or Apex | n/a: no Apex or Flow. Workflows are proven by dry-run and live runs in the test script. |
| Deploy runbook | Done in the build: sandbox creation, CI auth per environment, post-refresh credential re-run, `TEST` auth re-issue, Backup and Recover setup, GitHub Environment and reviewer setup |
| Go-live gate | Full sandbox licence; Backup and Recover licence; PTSF production auth secret; Priya's GitHub access (Q-design-3) |
| `solution.md` / `data-model.md` / `systems.md` | n/a: no cross-intent flow, object or external system changes. GitHub is the delivery toolchain, not an org integration. |

## Integration

None. No external system exchanges data with the org in this intent.

## Alternatives considered

- **Lifecycle Center** (formerly next-generation DevOps Center).
  - What it offers: native, with no package to install, and test suites and quality gates that run before every promotion [docs:https://help.salesforce.com/s/articleView?id=platform.next_generation_devops_center.htm&release=264.0.0&type=5]. Code Analyzer can be one of its test providers [docs:https://developer.salesforce.com/docs/platform/salesforce-code-analyzer/guide/ci-cd.html]. Its UI is click-based [docs:https://help.salesforce.com/s/articleView?id=platform.next_generation_devops_center.htm&release=264.0.0&type=5], which in our judgement suits Priya watching a change move through and the customer's admin owning it.
  - Not recommended now because it isn't available in the EU Operating Zone [docs:https://help.salesforce.com/s/articleView?id=platform.next_generation_devops_center.htm&release=264.0.0&type=5], and PTSF's residency (G0002) is unanswered. The grounding says the same.
  - It also runs its own stage branches. Each stage is an org plus a branch, and promotion merges and then deploys [docs:https://help.salesforce.com/s/articleView?id=platform.devops_center_work_items_promote.htm&release=264.0.0&type=5]. That would sit beside this repo's `feature/* → develop` trust chain. Salesforce advises a new repository for Lifecycle Center where possible, because reusing one with existing branches can cause naming conflicts [docs:https://help.salesforce.com/s/articleView?id=platform.devops_center_managed_package_migration.htm&release=264.0.0&type=5] (stated for migration; ⚠ unverified for a fresh start).
  - The best switch target once residency is answered (Q-design-1). The repo stays the source of truth either way, so switching keeps the metadata.
- **DevOps Center (managed package).** The grounding names it. Lifecycle Center now has a migration path from it, and pipeline and source-control credentials don't migrate [docs:https://help.salesforce.com/s/articleView?id=platform.devops_center_managed_package_migration.htm&release=264.0.0&type=5]. Starting fresh on the predecessor corners a later move. Whether the managed package is available in the EU Operating Zone: ⚠ unverified. It isn't installed in `ql-lab`.
- **Keep the simple pipeline.** Rejected: it deploys only on a push to `main` [repo:.github/workflows/sf-deploy.yml], with no integration-test or Full sandbox stage, so it can't meet the Acceptance.
- **`SandboxPostCopy` for credentials.** Rejected (see Credentials).

## Architecture conformance

- **Grounding** (ptsf-lab-2026 solution, "Environments, release and governance"):
  - **Conforms:** source-driven development, Code Analyzer in the pipeline, a Full sandbox for UAT and performance, Backup and Recover for recovery, and Lifecycle Center not the default while residency is open.
  - **Departs on the tool:** GitHub Actions instead of DevOps Center. This isn't an inherited ADR (the standing premises are 0001 and 0002), so no `BLD-` ADR is needed. It's surfaced for ratification here and recorded in a `decisions/` record once ratified.
- **ADR 0001:** conforms. Backup access and deployment users are named as governed administrator exceptions. No sandbox exposure is added: masking stays with INT-026 (see the risk below).
- **ADR 0002:** conforms. Core platform only.

## Neighboring and future scope

- **BUILT ON:** none.
- **BUILDS ON THIS:**
  - **INT-026** (masking after a Full sandbox refresh, phase 4): the post-copy slot is left free for it, and the refresh runbook leaves a "masking before access" step for it to fill.
  - **Risk:** a Full sandbox refresh can copy all production object data [docs:https://help.salesforce.com/s/articleView?id=platform.data_sandbox_refresh.htm&release=264.0.0&type=5]. One refreshed after production holds real medical history, but before INT-026 ships, copies it unmasked. Production is greenfield today, so the risk opens with the pilot go-live (INT-025). Q-design-2.
- **EPIC SIBLINGS:** none.
- **Not declared, but relevant:**
  - INT-007 and INT-008 should add their External Credentials to `config/credentials.json`. That's a note for their designs, not a dependency edge.
  - Every later build PR runs through this pipeline.

**Existing org (`ql-lab`, `00Dbm000017clCfEAI`, probed 2026-11-25, read-only):**

| Item | Repo | Org | Disposition |
|---|---|---|---|
| Org type | — | Production-type Enterprise, not a Dev Hub | Genuinely different from PTSF production. The lab stands in for production, and the production stage in the lab deploys to a production-type org. |
| Sandboxes | — | none | ⛔ No Full sandbox in the lab. Proof criteria that need one stay blocked. |
| DevOps Center package (`sf_devops`) | not found | not found | n/a for the recommended approach |
| Lifecycle Center permission sets (`force` namespace) | not found | found (standard) | Clean reuse candidate if Q-design-1 picks Lifecycle Center |
| Named Credentials (10) and External Credentials (5) | not found | found | Genuinely different: demo content unrelated to PTSF, not touched. ⚠ Untracked in the org, but outside this intent. |
| `SandboxPostCopy` class | not found | not found | Slot free (kept free for INT-026) |
| Backup add-on | — | not found | ⛔ Licence needed |
| System Administrator profile | — | found | Clean reuse (Q-056, provisional) |
| 323 unmanaged Apex classes | not found | found | Untracked demo Apex. It only matters for production test-level coverage (see Pipeline). |

`launchpad/org-inventory.md` isn't written: this intent touches no objects.

## Build sequence

1. `/ql-resync` swaps to the `deploy-multistage` add-on (its own reviewed change).
2. Create the GitHub Environments `CI`, `TEST` and `Production`, with the `Production` reviewer, plus their secrets. Runbook step. Real secrets are the Trusted Guide's to add.
3. Add `main_pr-validation.yml`, `prod_deploy.yml`, `credentials_reestablish.yml`, `config/credentials.json`, and the scan-artifact change.
4. Sandboxes and Backup and Recover: Setup, in runbook order, once licences exist.

## Open design questions

- **Q-design-1:** Which promotion tool: GitHub Actions multi-stage (recommended while residency is open), Lifecycle Center, or the DevOps Center managed package? It turns on G0002. — RATIFIED 2026-11-25: GitHub Actions multi-stage. See decisions/2026-11-25-int-009-release-pipeline-tool.md
- **Q-design-2:** Until INT-026 ships, should Full sandbox refreshes be held after production holds patient data, or should INT-026 be pulled forward ahead of the pilot go-live? — PROVISIONAL (open; build proceeds, dependent criteria ⛔). See decisions/2026-11-25-int-009-release-pipeline-tool.md
- **Q-design-3:** How is Priya's customer sign-off captured: as a GitHub PR approval (she needs a GitHub seat) or recorded outside GitHub and cited in the PR? — PROVISIONAL (open; build proceeds, dependent criteria ⛔). See decisions/2026-11-25-int-009-release-pipeline-tool.md
- **Q-design-4:** May the build prove the credential workflow with a throwaway test External Credential in a sandbox, removed afterwards? — PROVISIONAL (open; build proceeds, dependent criteria ⛔). See decisions/2026-11-25-int-009-release-pipeline-tool.md
- **Q-design-5:** Which backup product and licences does PTSF buy (Backup and Recover, or Backup & Recover Next with its Data and Files licences [docs:https://help.salesforce.com/s/articleView?id=xcloud.backup_recover_api.htm&release=264.0.0&type=5])? And what retention? — PROVISIONAL (open; build proceeds, dependent criteria ⛔). See decisions/2026-11-25-int-009-release-pipeline-tool.md
- **Q-design-6:** What licence and profile does the per-environment deployment user get, and is it in INT-003's break-glass monitoring? — PROVISIONAL (open; build proceeds, dependent criteria ⛔). See decisions/2026-11-25-int-009-release-pipeline-tool.md
