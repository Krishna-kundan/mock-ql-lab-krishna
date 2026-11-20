---
name: ql-delivery-metrics
description: >-
  Show read-only delivery metrics for the intents — scope churn, revisions, time-to-stable, open-question trajectory, throughput. Triggers — "delivery metrics", "scope churn", "how long did intents take", "delivery pace", "/ql-delivery-metrics".
produces: >-
  A console table (or `--json`) of per-intent delivery signals — scope churn, revisions, time-to-stable, open-question trajectory — with an honesty marker per row, and a throughput block (passing, build window elapsed, average days Started → Delivered, projected days to finish); with `--by-agent`, the recorded build outcomes grouped by build agent and kind, with sample sizes. Read-only; a derived view recomputed each run, never edits an intent.
---

# Delivery metrics — see how the intents are actually progressing

This surfaces **Tier-1 within-engagement delivery signals** (decisions/0043) computed from git history: for each intent, how much its scope actually churned, how many times it was revised, how long the *what* kept moving, and how its open questions burned down. It's for a **Trusted Guide** taking stock of pace — "which intents are still settling?", "how much did this one iterate before it stabilized?".

It is a **presenter, not an interpreter:** run the command and relay what it prints verbatim, honesty markers included. Grading the numbers or inferring a cause is the Trusted Guide's call; narration is deferred (0043) until the numbers have proven themselves in the field.

## Build outcomes by build agent (`--by-agent`)

```bash
node launchpad/scripts/intent-ledger.mjs metrics --by-agent [--json]
```

Groups every build that recorded outcomes at close-out (`intent-ledger.mjs outcomes`, in its build-rulings note) by build agent and kind of work: how many builds, median red trust-chain runs before green, median review rounds and rulings, stop-and-asks, how many flipped to 🔄 Needs re-verify within 30 days of delivery (from the ledger's git history, `unknown` without it), and how often the recommended agent was overridden. A group under five builds is marked **too few to compare**. Relay it as printed: which agent suits which work is the Trusted Guide's read.

## What each metric means

- **Scope Δ (scope changes)** — how many times the intent's *hashed scope* actually moved across its history. This uses the **same scope hash the drift gate uses** (the five fields: title, build target, guardrails, out-of-scope, acceptance), so a cosmetic edit — a typo, a dependency, an open-question tweak — is **not** counted. This is the honest "how much did we iterate on the WHAT".
- **Revisions** — total commits touching `intent.md`. The ratio of Scope Δ to revisions says whether edits were substance or polish.
- **Time-to-stable** — days from the intent's first commit to its last scope-changing edit. How long the scope kept moving.
- **Open Qs (now/peak)** — current vs. peak open-question count; `✓burned` means they went to zero.

## Run it

From the engagement repo root (the engine ships into the repo at `launchpad/scripts/`, so the path is repo-relative in every harness):

```bash
node launchpad/scripts/intent-ledger.mjs metrics            # table, all intents
node launchpad/scripts/intent-ledger.mjs metrics INT-014    # one intent
node launchpad/scripts/intent-ledger.mjs metrics --json     # machine-readable
```

If it prints **"intents/ not present yet"**, scope hasn't been ingested — tell the user to type `/ql-ingest-scopezilla` first. The command is read-only and never gates on what it finds (only a filter naming no real intent exits non-zero).

## Throughput

Below the table, `metrics` prints a throughput block from the ledger's `Started` / `Delivered` stamps and the test scripts (decisions/0105): passing, build window elapsed, average days Started → Delivered, projected days to finish. Each line says what it's computed from, or prints `unknown` with the reason; relay it as printed. It needs engine API 2: check with `node launchpad/scripts/intent-ledger.mjs api --at-least 2` and, if it refuses, say `/ql-resync` is needed instead of relaying the block.

- **Passing** is stricter than `coverage --gate`: ✅ Delivered, every criterion proven, no unresolved defect, and no org-probe ✅ left unverified.
- **Build window:** if it's unknown and the Trusted Guide gives you the dates, add `"build_window": {"start": "YYYY-MM-DD", "end": "YYYY-MM-DD"}` to the engagement's `engagement.json`. Never guess them.
- **Projected days to finish** needs `--resources <n>`, the number of people building. Ask for it only when someone wants a projection; it's stored nowhere, so staffing stays out of the repo.

A ledger seeded before the stamps has no date columns until `/ql-resync` adds them (`sync --add-date-columns`), and dates start from then: nothing is backfilled. The average runs Started → Delivered, two stamps: an intent delivered while a 👁 was still pending counts from its Delivered date, not from the later sign-off. Comparing passing against elapsed (is the engagement behind?) is the Trusted Guide's read, not this skill's.

## Read the honesty markers before you relay

Every row carries a **Coverage** marker. Surface it — never drop it, and never present a partial/unknown number as if it were solid:

- **full** — clean multi-revision history, every revision parsed. Trust the numbers.
- **partial** — some history was skipped or is suspect; the `↳` note says why. Cases: a revision that couldn't be parsed at its commit (skipped, so churn is computed over the rest); a **shallow clone** (history truncated — common in CI); a **rename-truncated** history (pre-rename revisions unreadable); a **single-commit / possibly-squashed** history; or a **dirty working tree** (uncommitted edits ahead of the history counted). In every partial case the count can only **undercount** — relay the note.
- **unknown** — no git history for this intent (uncommitted), or not a git work tree. The **history-derived** numbers (scope Δ, time-to-stable) show as `—` (and are `null` in `--json`), never `0` — say the data isn't there rather than implying zero churn. The open-question count still reflects the *current file* (it's a present-state reading, not history), so it may show a real number even on an unknown row.

The command never fabricates a number — a gap is always surfaced as partial/unknown. **Done when** every row you relay carries its Coverage marker and any `↳` note.

**Run it from any branch — the numbers don't change with your checkout.** It reads the intent's real file-change history, so an intent iterated on a feature branch and merged into `develop`/`main` reports the same churn and revisions whether you run from the feature branch or the integration branch. (A branch-internal edit-and-revert that netted to no change reads as unchanged once merged — the churn that was *kept* is what's counted; nothing is inflated.)

One limitation it *cannot* self-detect: a **squash-merge workflow** collapses a PR's revisions into one commit. A single squashed commit is flagged `partial` (single-commit history), but an intent delivered across *several* squashed PRs shows multiple commits and can read `full` while still undercounting the within-PR churn each squash hid. If you know the engagement squashes PRs, read churn as a floor, not an exact count.

## What this does NOT do

- It does **not** edit, create, or resequence intents. Scope changes go through `/ql-refine-intent` / `/ql-capture-intent`.
- It does **not** report time-to-prod: no deploy event is stamped.
- It does **not** reach GitHub or any network — it reads local git history only.
