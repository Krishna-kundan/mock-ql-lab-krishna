# Launchpad

Everything the Quantum Leap Launchpad keeps in this repo lives in this folder, so it never mixes with the rest of the codebase.

- `engagements/<slug>/` holds one engagement each: its intents, delivery ledger and test evidence, its own decisions, a `README.md` with the delivery index, and `solution.md`, the overview of the whole solution, once it's drafted. An engagement that has closed stays here, frozen, as the audit record.
- `decisions/` holds records that apply to the whole org. `decisions/architecture/` holds the standing premises every engagement builds on.
- `build-notes.md` and `deploy-runbook.md` describe this org, so every engagement shares them.
- `personas/` holds the people who use this org and their access, one file each. Intents point at them by slug.
- `systems.md` (the external systems this org connects to), `org-inventory.md` (a saved snapshot of the org's metadata) and `data-model.md` (the objects this repo's work has built and how they relate) appear once `/ql-design-intent` first needs them (or when the on-ramp from another template maps them in). Designs point at them instead of restating them.
- `scripts/` is the engine CI runs to prove the trust chain. `/ql-resync` keeps it current; don't edit it by hand.
- `REVIEW.md` is how build PRs are reviewed. `prose-style.md` is the writing standard for intents, decisions and PRs.
