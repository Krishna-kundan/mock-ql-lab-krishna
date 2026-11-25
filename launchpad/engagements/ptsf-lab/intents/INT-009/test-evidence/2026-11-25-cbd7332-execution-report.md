---
intent: INT-009
executed_by: Krishna Kundan
executed_at: 2026-11-25T18:26:14Z
environment: ql-lab (production stand-in)
branch: feature/ptsf-lab/INT-009-release-pipeline-evidence
commit: cbd7332c2a7981f37c73c2a1c83602c776f886ee
type: manual
---

# Test Execution Report — INT-009 — 2026-11-25

**Intent:** Environments and source-driven release pipeline
**Environment:** ql-lab (production stand-in)
**Branch @ HEAD:** `feature/ptsf-lab/INT-009-release-pipeline-evidence` @ `cbd7332` (`cbd7332c2a7981f37c73c2a1c83602c776f886ee`)
**Executed by:** Krishna Kundan
**Executed at:** 2026-11-25T18:26:14Z

The repo has no metadata under `force-app/`, so no Scene B run had a delta. The steps that need a deploy or a validation to actually run could not be exercised.

## Scenes run

### Scene B — Production validation, scan report and gated deploy (criteria C3, C7, C12; C9 is an accepted gap)

| Step | Result | Notes |
|------|--------|-------|
| 1. In GitHub → Settings → Environments → `Production`, confirm the Trusted Guide is a required reviewer and the secret points at `ql-lab` | ✅ PASS | |
| 2. Open a PR from a `release/*` branch into `main` with one metadata change | ⏸️ NOT RUN | PR #5 into `main` had no metadata change. `main_pr-validation` skipped validation (run 45665521395) |
| 3. Confirm the deploy step is check-only and the run has a Code Analyzer report artifact | ⏸️ NOT RUN | No delta, so no validation or scan ran. C9 is an accepted gap |
| 4. In `ql-lab`, confirm Deployment Status shows a validation and the change isn't in the org | ⏸️ NOT RUN | No validation ran. Nothing was deployed |
| 5. Merge the PR. Confirm nothing deploys to `ql-lab` on the merge | ✅ PASS | The merge started no `Production` run |
| 6. Run `prod_deploy.yml`. Confirm it stops at "Waiting for review" on `Production` | ✅ PASS | Waited for the required reviewer's approval |
| 7. Approve it. Confirm the deploy runs and Deployment Status shows it succeeded | ⏸️ NOT RUN | After approval the run failed at deploy with `NothingToDeploy` (no metadata in the repo). No successful deploy seen. Finding recorded in `decisions/2026-11-25-INT-009-build-rulings.md` |

**Criteria outcome:** C3 ✅ · C7 ⏸️ not run (no metadata delta, so no check-only validation ran) · C12 ⏸️ not run (approval gate observed in steps 5–6, but step 7's successful deploy after approval wasn't seen)

### Scene G — Refresh runbook review (criterion C16)

| Step | Result | Notes |
|------|--------|-------|
| 1. Open `launchpad/deploy-runbook.md` | ✅ PASS | |
| 2. Confirm the post-refresh order: activate the sandbox, re-issue the `TEST` auth secret, run `credentials_reestablish.yml`, then "masking before access (INT-026)" before anyone is given access | ✅ PASS | |

**Criteria outcome:** C16 ✅

### Scene A — Environments exist, step 4 only (criterion C19; steps 1–3 cover C1 and C2, accepted gaps)

| Step | Result | Notes |
|------|--------|-------|
| 4. Open Setup → Users → the platform-admin user. Confirm the profile is System Administrator and has Manage Sandboxes | ✅ PASS | |

**Criteria outcome:** C19 ✅

## Summary

**Criteria run:** 5 · **Passed:** 3 (C3, C16, C19) · **Failed:** 0 · **Not run:** 2 (C7, C12)
**Defects filed:** none
