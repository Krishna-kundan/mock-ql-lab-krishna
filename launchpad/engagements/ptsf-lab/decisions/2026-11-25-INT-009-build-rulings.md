# INT-009: build rulings

**Date:** 2026-11-25 · **Deciders:** agent rulings, pending Trusted Guide review in PR §6 · **Intents:** INT-009 · **Status:** Open (the build is in progress)

routing: recommended sf-pi, picked claude-code, override, the Trusted Guide chose this Claude Code session as the build agent
brief: ptsf-lab/INT-009 scope=34b8c93b947e proof=ab1a4ff5a4f3 design=3c34d5b238fc decisions=d75039ae934b sources=ptsf-lab-2026@144731f83592 agent=claude-code recommended=sf-pi

## Known gaps

- The Full sandbox licence and the Backup and Recover licence are customer purchases the design relies on, but they aren't declared in the intent's External Dependencies. The Trusted Guide deferred the `/ql-refine-intent` edit on 2026-11-25. Until it's made, the dependent criteria (C2, C6, C10, C17) are ⛔ blocked and have no declared dependency to point at. Carry this into the PR's gaps section.

## Rulings

_Format: `<ruling> — <why> — <cost if wrong>`. Stop-and-ask entries: `- ASKED: <question> — <the human's answer>`._

- Use `ql-lab` as the production stand-in for the `Production` GitHub Environment — it's the only reachable org, and it's production-type, so C7 and C12 can be proven for real — if PTSF production authenticates differently, the `Production` secret and the reviewer setup are redone at go-live, but no workflow changes.
- Swap `deploy-simple` for `deploy-multistage` as its own commit on the INT-009 branch (`a2432ae`) — the design calls it its own reviewed change, and a separate commit keeps it reviewable inside the INT-009 PR — if reviewers want it apart, it cherry-picks cleanly into its own PR.
- Production deploys use `full_build: "true"` in `prod_deploy.yml` — a manual run has no push range, so the shared action's delta would fall back to `HEAD~1` and deploy only the last commit — a full deploy takes longer and runs tests across everything in `main`; the 75% coverage risk in `ql-lab` (design §Pipeline) applies.
- `prod_deploy.yml` runs only from `main` (`if: github.ref == 'refs/heads/main'`) and one at a time (`concurrency: prod-deploy`) — a manual run can be started from any branch, and this stops a non-`main` deploy or two overlapping deploys — a run from another branch silently does nothing, which could confuse someone; the run page shows the job as skipped.
- The Code Analyzer report is written as HTML (`--output-file code-analyzer-results.html`) and uploaded as artifact `code-analyzer-<environment>`, even when the scan fails the check — Priya can open HTML straight from the run page — this is a local edit to the resync-managed `action.yml`, so `/ql-resync` will show it as a local diff until contributed upstream; whether the report is still written when the threshold fails is ⚠ unverified until Scene D runs.
- ASKED: Run `main_pr-validation.yml` in its own GitHub Environment, or in `Production`? A required reviewer gates every job in its environment, so validating in `Production` would need an approval per PR (⚠ unverified, GitHub docs not read). — Own environment, `Production-Validate`, no reviewer; production's login secret is stored in both environments (Trusted Guide, 2026-11-25).
- ASKED: Skip the `/ql-refine-intent` edit for the missing licence dependencies? — Skip for now; record it as a known gap (Trusted Guide, 2026-11-25).
- ASKED: Which build agent? — This Claude Code session, not SEAP or sf-pi (Trusted Guide, 2026-11-25).
