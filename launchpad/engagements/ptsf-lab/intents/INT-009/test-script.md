---
intent: INT-009
phase: 1
proof_hash: ab1a4ff5a4f3
authored: 2026-11-25
design_hash: 3c34d5b238fc
---

# INT-009 — Test script

**Intent:** Environments and source-driven release pipeline
**Phase:** 1 · **Source intent:** `intents/INT-009/intent.md` · **Design:** `intents/INT-009/design.md` (ratified)
**Rests on:** `decisions/2026-11-25-int-009-provisional-answers.md` (Q-016, Q-056), `decisions/2026-11-25-int-009-release-pipeline-tool.md` (Q-design-2 to 6 provisional)

## Criteria

> `Type`: ✅ automated · 👁 manual · 🔁 awaiting retest · ⚠️ partial · ⛔ blocked · 📋 accepted gap.
> No Apex or Flow ships in this intent, so no ✅ names a `Class.method`. The ✅ rows are repo
> assertions (a file check anyone can re-run). They read as unconfirmed in CI and rest on PR review.
> Pipeline behaviour is proven by watching real GitHub Actions runs (👁).
> `ql-lab` is a production-type org with no sandboxes, so it stands in for production only.

| ID | Criterion (source) | How proven | Type | Sign-off |
|----|--------------------|------------|------|----------|
| INT-009-C1 | admin: a Developer sandbox and a Developer Pro integration-test sandbox exist, each tied to its GitHub Environment (build target: "Development, integration test … environments"; design §Environments) | Scene A, steps 1–2 | ⛔ | Blocked: `ql-lab` has no sandboxes; sandbox licences unconfirmed for PTSF |
| INT-009-C2 | admin: a Full sandbox exists for UAT and performance testing, tied to GitHub Environment `TEST` (build target: "Full sandbox for user acceptance and performance testing"; design §Environments) | Scene A, step 3 | ⛔ | Blocked: no Full sandbox licence in `ql-lab`; licence not declared in the intent's Dependencies |
| INT-009-C3 | admin: production is tied to GitHub Environment `Production`, with the Trusted Guide as required reviewer (build target: "… and production environments"; design §Pipeline) | Scene B, step 1 | 👁 | _pending_ |
| INT-009-C4 | The repo is the metadata source: the `deploy-multistage` add-on workflows are present, and `sf-validate.yml` and `sf-deploy.yml` are gone (build target: "Source-controlled metadata"; design §Pipeline) | Repo assertion: `ls .github/workflows/` lists `feature-ci_deploy.yml`, `feature-release-test_deploy.yml`, `main_pr-validation.yml`, `prod_deploy.yml`, `credentials_reestablish.yml`, and neither `sf-validate.yml` nor `sf-deploy.yml` | ✅ | (PR review) |
| INT-009-C5 | A merge into `develop` deploys to the integration-test sandbox (build target: "pipeline promoting changes between environments") | Scene C, steps 1–3 | ⛔ | Blocked: needs the `CI` sandbox (C1) |
| INT-009-C6 | A merge into `release/*` deploys to the Full sandbox (build target: "pipeline promoting changes"; acceptance: "to the Full sandbox") | Scene C, steps 4–6 | ⛔ | Blocked: needs the `TEST` Full sandbox (C2) |
| INT-009-C7 | A PR into `main` runs a check-only validation against production and deploys nothing (design §Pipeline, `main_pr-validation.yml`) | Scene B, steps 2–4 (against `ql-lab` as the production stand-in) | 👁 | _pending_ |
| INT-009-C8 | Code Analyzer fails the check when a change has a violation at severity 2 or worse (build target: "Static code scanning runs on every promotion"; design §Static code scanning) | Scene D (deliberate violation, PR into `main`) | 👁 | _pending_ |
| INT-009-C9 | The scan report is attached as a run artifact on the PR into `main` (acceptance: "code scan result attached at each step") | Scene B, step 3 | 👁 | _pending_ |
| INT-009-C10 | The scan report is attached as a run artifact on the PRs into `develop` and `release/*` (acceptance: "code scan result attached at each step") | Scene C, steps 2 and 5 | ⛔ | Blocked: needs the `CI` and `TEST` sandboxes (C1, C2) |
| INT-009-C11 | Guardrail ("Production deploys only on an explicit user instruction"): no workflow deploys to production on a push or merge; `prod_deploy.yml` triggers only on `workflow_dispatch` | Repo assertion: `prod_deploy.yml` has `on: workflow_dispatch` and no other trigger; it's the only workflow that runs in the `Production` environment (`main_pr-validation.yml` runs in `Production-Validate`, check-only) | ✅ | (PR review) |
| INT-009-C12 | Guardrail ("Production deploys only on an explicit user instruction"): a `prod_deploy.yml` run waits for the Trusted Guide's approval and deploys only after it | Scene B, steps 5–7 (against `ql-lab`) | 👁 | _pending_ |
| INT-009-C13 | platform-admin: Priya approves the release as the customer before the production deploy (acceptance: "then approves its release to production"; provisional-answers record, two-part approval) | Scene E | ⛔ | Blocked: Q-design-3 (how Priya's sign-off is captured) |
| INT-009-C14 | `credentials_reestablish.yml` writes each listed External Credential's secret from GitHub Environment secrets after a refresh (build target: "Per-environment integration credentials re-established after each sandbox refresh"; design §Credentials) | Scene F | ⛔ | Blocked: Q-design-4 (test credential), and no sandbox in `ql-lab` |
| INT-009-C15 | No credential secret is in the repo: `config/credentials.json` holds credential and principal names only (design §Credentials) | Repo assertion: `config/credentials.json` keys are only `credential`, `principal` and `principalType`; the secret-literal grep (see Automated proofs, C15) over `config/` and `.github/` returns no matches | ✅ | (PR review) |
| INT-009-C16 | admin: the deploy runbook orders the post-refresh steps: re-issue `TEST` auth, run the credential workflow straight after activation, and leave a "masking before access" step for INT-026 (design §Environments, §Credentials; Neighboring scope) | Scene G (runbook review) | 👁 | _pending_ |
| INT-009-C17 | admin: Backup and Recover is enabled on production, with objects, files and retention set (build target: "Backup and recovery configured for production") | Scene H | ⛔ | Blocked: Q-design-5 (product, licences, retention); no backup licence in `ql-lab` |
| INT-009-C18 | Out of scope ("Must not build sandbox data masking"): no `SandboxPostCopy` class or masking automation ships | Repo assertion: `git grep -n "SandboxPostCopy" force-app/` returns nothing | ✅ | (PR review) |
| INT-009-C19 | platform-admin: has the System Administrator profile, including Manage Sandboxes (Q-056 provisional; design §Sharing and security) | Scene A, step 4 | 👁 | _pending_ |
| INT-009-C20 | ADR 0001: the deployment user and backup-restore admins are named in INT-003's break-glass monitoring (design §Sharing and security, §Backup and recovery) | Scene H, step 4 | ⛔ | Blocked: Q-design-6 (deployment user), and INT-003 not built |
| INT-009-C21 | Acceptance end to end: a change to the Subsidy Application layout moves development → integration test → Full sandbox → production, with the scan report at each step (acceptance) | Scene E (full walkthrough) | ⛔ | Blocked: Full sandbox (C2), Q-design-3, and the Subsidy Application layout doesn't exist until INT-001 ships |

## Automated proofs to write

None as Apex. The four repo assertions (C4, C11, C15, C18) are shell checks the reviewer re-runs on the PR's commit:

- **C4:** `ls .github/workflows/` shows the five named workflows and no `sf-validate.yml` or `sf-deploy.yml`.
- **C11:** `yq '.on | keys' .github/workflows/prod_deploy.yml` prints only `workflow_dispatch`. `grep -lE "environment: Production$" .github/workflows/*.yml` prints only `prod_deploy.yml`. `grep -n "mode:" .github/workflows/main_pr-validation.yml` prints only `mode: validate` (the shared action adds `--dry-run` for that mode).
- **C15:** `jq '[.[] | keys[]] | unique - ["credential","principal","principalType"]' config/credentials.json` prints `[]` (no other keys, so no secret values). `git grep -nIE "(password|secret|token|client_secret)\s*[:=]" -- config/ .github/` returns no literal values (references to `${{ secrets.* }}` are expected and fine).
- **C18:** `git grep -n "SandboxPostCopy" force-app/` exits 1.

## Org assertions

None. No criterion is an object, field, FLS or Flow fact. The profile check (C19) is outside the predicate set, so it's a 👁 Setup check.

## Manual validation scenes

> GitHub steps run in the repo's Actions and Pull requests tabs. Org steps run in Setup.
> "Trusted Guide" and "developer" are GitHub actors, not org personas, so neither has a persona file.

### Scene A — Environments exist (persona: admin, then platform-admin; criteria C1, C2, C19)
1. In production, open Setup → Sandboxes. Confirm a Developer sandbox and a Developer Pro sandbox are listed and Completed.
2. In GitHub → Settings → Environments, confirm `CI` exists and its `SFDX_URL` secret authenticates to the Developer Pro sandbox (run `feature-ci_deploy.yml` once and read the org id in its log).
3. Back in Setup → Sandboxes, confirm a **Full** sandbox is listed and Completed, and that GitHub Environment `TEST` authenticates to it (same check as step 2).
4. Log in as platform-admin. Open Setup → Users → the platform-admin user. Confirm the profile is System Administrator, and that the profile has Manage Sandboxes.
**Expected:** every environment exists and each GitHub Environment reaches the right org. **Sign-off:** _name / date / pass·fail_.

### Scene B — Production validation, scan report and gated deploy (persona: admin, Trusted Guide in GitHub; criteria C3, C7, C9, C12)
1. In GitHub → Settings → Environments → `Production`, confirm the Trusted Guide is a required reviewer and the secret points at `ql-lab` (the lab's production stand-in).
2. Open a PR from a `release/*` branch into `main` with one metadata change.
3. Confirm `main_pr-validation.yml` runs, the deploy step is check-only (the log shows `--dry-run`), and the run has a Code Analyzer report artifact you can download and open.
4. In `ql-lab`, open Setup → Deployment Status. Confirm the run shows as a validation, not a deployment, and the change isn't in the org.
5. Merge the PR. Confirm nothing deploys to `ql-lab` on the merge (no `Production` run starts).
6. Run `prod_deploy.yml` from the Actions tab. Confirm it stops at "Waiting for review" on the `Production` environment.
7. As the Trusted Guide, approve it. Confirm the deploy then runs and Setup → Deployment Status shows it succeeded.
**Expected:** production changes only after the manual run and the reviewer's approval. If step 3 fails on test coverage, record it: `ql-lab`'s untracked demo Apex can fail the 75% check (design §Pipeline). That's a lab artifact, not a pipeline fault. **Sign-off:** _name / date / pass·fail_.

### Scene C — Promotion through the test stages (persona: developer in GitHub, admin; criteria C5, C6, C10)
1. Open a PR from a feature branch into `develop`.
2. Confirm the PR validation runs and its run carries a Code Analyzer report artifact.
3. Merge it. Confirm `feature-ci_deploy.yml` deploys to the `CI` sandbox (Setup → Deployment Status there).
4. Open a PR from `develop` into a `release/*` branch.
5. Confirm the validation runs and carries a Code Analyzer report artifact.
6. Merge it. Confirm `feature-release-test_deploy.yml` deploys to the `TEST` Full sandbox.
**Expected:** each merge deploys to the next stage, and each PR carries its scan report. **Sign-off:** _name / date / pass·fail_.

### Scene D — The scan blocks a violation (persona: developer in GitHub; criterion C8)
1. Commit the branch so it's clean.
2. Make one minimal edit that breaks a severity-2 rule (for example, an Apex class with a SOQL query inside a loop).
3. Open a PR into `main` once. Confirm the Code Analyzer step fails the check and the report names the violation.
4. Close the PR, `git restore` the file, and confirm `git status` is clean.
**Expected:** the PR check goes red on the violation. **Sign-off:** _name / date / pass·fail_.

### Scene E — Acceptance walkthrough (persona: platform-admin; criteria C13, C21)
1. A developer changes the Subsidy Application page layout on a feature branch.
2. Priya watches it move through Scene C (into `develop`, then `release/*`) and opens the scan report at each step.
3. Priya opens the `release/*` → `main` PR and opens its scan report.
4. Priya records her approval of the release, in the way Q-design-3 settles.
5. The Trusted Guide runs `prod_deploy.yml` and approves it (Scene B, steps 6–7).
6. Priya opens a Subsidy Application record in production by Classic URL (`/<record Id>`) and sees the layout change.
**Expected:** Priya sees the change at every stage and approves it before it reaches production. **Sign-off:** _name / date / pass·fail_.

### Scene F — Credentials after a refresh (persona: admin; criterion C14)
1. Add one throwaway test External Credential to the sandbox and to `config/credentials.json` (if Q-design-4 allows it).
2. Add its entry to the `EXTERNAL_CREDENTIAL_SECRETS` secret on the sandbox's GitHub Environment (format: `.github/workflows/README.md`).
3. Refresh the sandbox, or clear the principal's secret by hand.
4. Run `credentials_reestablish.yml` for that environment.
5. In the sandbox, open Setup → Named Credentials → External Credentials → the test credential. Confirm the principal shows its authentication as set.
6. Remove the test credential from the org and the list.
**Expected:** the workflow restores the secret without anyone typing it into the org. **Sign-off:** _name / date / pass·fail_.

### Scene G — Refresh runbook review (persona: admin; criterion C16)
1. Open `launchpad/deploy-runbook.md`.
2. Confirm the post-refresh steps run in this order: activate the sandbox, re-issue the `TEST` auth secret, run `credentials_reestablish.yml`, then a "masking before access (INT-026)" step before anyone is given access.
**Expected:** a cold reader can refresh the Full sandbox from the runbook alone. **Sign-off:** _name / date / pass·fail_.

### Scene H — Backup and recovery (persona: admin; criteria C17, C20)
1. In production, open Setup → Backup (the product Q-design-5 picks).
2. Confirm backups are enabled for the agreed objects and files, with the agreed retention.
3. Confirm the latest daily backup completed.
4. Confirm the deployment user and the backup-restore admins are listed in INT-003's break-glass monitoring.
**Expected:** production is backed up, and access to backed-up medical history is monitored. **Sign-off:** _name / date / pass·fail_.

## Deliberately not tested (out of scope)

- Sandbox data masking: INT-026 builds it. C18 proves only that this intent doesn't.
- Whether Full sandbox refreshes are held until INT-026 ships (Q-design-2): a release-policy call, not a pipeline behaviour. It becomes a runbook step once answered.
