# INT-009: build rulings

**Date:** 2026-11-25 · **Deciders:** agent rulings, pending Trusted Guide review in PR §6 · **Intents:** INT-009 · **Status:** Open (the build is in progress)

routing: recommended sf-pi, picked claude-code, override, the Trusted Guide chose this Claude Code session as the build agent
brief: ptsf-lab/INT-009 scope=34b8c93b947e proof=ab1a4ff5a4f3 design=3c34d5b238fc decisions=d75039ae934b sources=ptsf-lab-2026@144731f83592 agent=claude-code recommended=sf-pi

## Known gaps

- The Full sandbox licence and the Backup and Recover licence are customer purchases the design relies on, but they aren't declared in the intent's External Dependencies. The Trusted Guide deferred the `/ql-refine-intent` edit on 2026-11-25. Until it's made, the dependent criteria (C2, C6, C10, C17) are ⛔ blocked and have no declared dependency to point at. Carry this into the PR's gaps section.

## Rulings

_Format: `<ruling> — <why> — <cost if wrong>`. Stop-and-ask entries: `- ASKED: <question> — <the human's answer>`._

- Use `ql-lab` as the production stand-in for the `Production` GitHub Environment — it's the only reachable org, and it's production-type, so C7 and C12 can be proven for real — if PTSF production authenticates differently, the `Production` secret and the reviewer setup are redone at go-live, but no workflow changes.
- ASKED: Skip the `/ql-refine-intent` edit for the missing licence dependencies? — Skip for now; record it as a known gap (Trusted Guide, 2026-11-25).
- ASKED: Which build agent? — This Claude Code session, not SEAP or sf-pi (Trusted Guide, 2026-11-25).
