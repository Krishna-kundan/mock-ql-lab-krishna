# Refine — settle the edit first (the grill)

Reached from `/ql-refine-intent` Step 1b, when the edit isn't settled yet, or for a session over a list of flagged intents. You work out the edit with the Trusted Guide here; refine's Steps 2–4 then make, record and re-validate each one.

## The rule that governs the whole session: facts vs. decisions

**Every source establishes *facts*: what *is*. Every change to Intent is a *decision* the Trusted Guide owns.** Look up facts freely (read the code, the tied Scopezilla project in place with `node launchpad/scripts/intent-ledger.mjs source show <name> <path>`, the notes). Put every decision to the Trusted Guide and wait. This is what keeps the session from grading its own homework:

- The **codebase** is an allowed, valuable source: the build teaches you an intent was oversized, thin, or missing a platform-forced dependency. But code reveals **what got built** (a fact); it **never authors the intent** (a decision). When code and intent disagree, ask it both ways: **"the code does X, the intent says Y — which is right?"** The Trusted Guide picks the direction: refine the intent, **or** treat the build as a defect (`/ql-diagnose`, not a refinement). Never rewrite an intent to match the code by default.
- **No source has precedence.** Scopezilla says X, the code shows Y, the session notes say Z: surface the three-way tension and let the Trusted Guide resolve it. You make the conflict *legible and contestable*; you don't settle it by rule.

> **Harness note.** The steps below use `AskUserQuestion`. In a harness without it, ask the same question as plain text with the options enumerated, then end your turn and wait for the answer — the shape of the question matters, the tool doesn't.

## Step G1 — The worklist

- **One intent** (the usual case: it came back from the client, or you're mid-refine and the edit turned out not to be settled) → that's the worklist. Skip to Step G2.
- **Named set** ("grill phase 2", "these three") → that's the worklist. Read each `intents/INT-NNN/intent.md`.
- **No target** ("grill my intents") → don't grill blind and don't grill everything. Run `node launchpad/scripts/intent-ledger.mjs validate` first (a malformed file makes the rest unreliable), then grade with `/ql-vet-intent` over the set (one phase at a time) and propose *its* flagged set via `AskUserQuestion`. The Trusted Guide trims. **Never re-litigate a clean intent**: grilling solid scope is friction with no payoff.

**Done when** the Trusted Guide has confirmed the worklist. **Cap a session to one delivery phase or an explicit set.** If the flagged set spans more than one phase, work one and list every deferred INT id in the session record: *"14 intents flagged across 3 phases — that's more than one session. Start with phase 1's 5?"*

## Step G2 — The sources to ground against

Auto-detect what's present and confirm via `AskUserQuestion`; default to what's available:

- **The tied Scopezilla project**, read in place with `source show`. Its structured scope (`data/intents.json`) is clean; reading beyond it when a rebuild needs it (discovery notes, transcripts, deliverables) **turns on the scrub** (Step G5).
- **Session content**: the client's rework note, meeting notes, a transcript, an ask the Trusted Guide provides.
- **The codebase / org**: the sfdx source in the repo, or the authed org (offer only if `sfdx-project.json` exists or an org is authed). Bounded by the facts/decisions rule above.

When no Scopezilla project is tied, **offer, never force,** the rich source:

> *If you have the original Scopezilla project handy (the full discovery notes / transcripts), point me at it and I can ground rebuilds in the richer source. (path, or skip)*

An untied project can't be auto-detected; the Trusted Guide supplies it only when they want the extra context, and reading it turns on the scrub too. **Done when** the Trusted Guide has confirmed the sources.

## Step G3 — Grill each intent

**Grill each intent relentlessly.** For a list, use frontier rounds: group the questions whose prerequisites are settled, ask a round, let the answers reshape the tree, recompute. For one to three intents, one at a time. Rounds batch the questions; they never mean asking fewer. For each intent, form a view from the sources, then **talk it through**. The four shapes are *judgment prompts*, not a routing table; the ~24-hour build-validate-demo cycle is the yardstick to reason against, not a gate:

- **Good as-is** → confirm it, stating for each dimension below what in the source supports it. The Trusted Guide's "looks fine" is not that answer: where a source contradicts a dimension (an XL size, a thin acceptance), put that dimension's question to them before confirming. The intent is a source too: a build target holding several demoable slices, or an acceptance no test could fail, contradicts its dimension on its own. "It's their call" without asking is the rubber stamp.
- **Oversized** (won't plausibly land in one build-validate-demo cycle) → **split** it with the Trusted Guide (refine's split row).
- **Thin / vague / drifting** → **tighten or rebuild** into a concrete build target with provable acceptance, written to the intent rules in `launchpad/prose-style.md` (*What, not how*: a mechanic from the source goes to `design.md` unless it's committed). This is the deepest read of any dirty source; hold the membrane.
- **Reconcile against the build** → where the code shows the intent is wrong (or the build diverged), ask it both ways so the Trusted Guide decides: a scope correction or a build defect.

**An intent is settled when** it has one disposition (confirmed / split / rebuilt / reconciled / escalated) and the Trusted Guide's answer on each of: a concrete build target, provable acceptance, size against the cycle, and every source conflict you surfaced. "Looks fine, let's move on" answers none of them, and it isn't an instruction to skip them: if the intent puts a dimension in doubt, your next message asks that question instead of confirming. Move to the next only then.

**Lane boundary: the grill reshapes; it does not originate.** A genuinely net-new outcome discovered mid-session (no intent covers it) is a **`/ql-capture-intent`** proposal, never something the session silently absorbs.

## Step G4 — Make each settled edit

Each settled intent goes through refine's **Steps 1–4** as its own edit, with its own ratification and re-validation: one intent, one ratify, so the trail stays per-change. In a session, Step 1's checks (`decisions`, `currency`, and the delivered-intent call) run for each intent before its edit, not once for the list; a single-intent grill already ran them before Step 1b. A confirmed intent needs no edit. A build defect goes to `/ql-diagnose` or a delivery note, never into the intent.

## Step G5 — The membrane, and the conditional scrub

The **dirty-source membrane** (AGENTS.md) always applies, and the session record is a landing file like any intent. Hold context in the session; keep dirty source out of every scratch file, gitignored ones included.

The independent **scrub-verify pass is conditional**: run it only when a **genuinely dirty source was opened this session** (the Scopezilla project beyond its structured scope — discovery notes, transcripts, deliverables — whether tied or pointed at, or sensitive pasted notes such as a client's rework email). A session grounded only on the tied source's structured scope (`data/intents.json` via `source show`), the in-repo intents and code doesn't need it. Code is not "dirty" for this purpose (the membrane already forbids landing it verbatim), though it can carry secrets; the same derived-prose-only rule covers it.

**When the scrub is warranted,** give a reader that **never saw the source** only the authored output (the changed `intents/` files and any session record, **never** the transcripts or any source path) and ask: *"These files are about to be committed to a repo handed to the customer. Flag anything that reads like a verbatim quote, a personal name, PII, or internal/commercial deal detail — judged purely on the face of these files."* Prefer a fresh-context subagent (in Claude Code, the `Explore` agent: clean context, read-only); if the harness can't, use a fresh session or an isolated re-read, and say which form you used. Resolve every finding before the files are considered landed.

## Step G6 — The session record (a list only)

A session over **more than one intent** writes **one** `decisions/YYYY-MM-DD-intent-grill.md` (copy `launchpad/decisions/TEMPLATE.md`) recording what the sitting **confirmed / split / rebuilt / reconciled / escalated** and **why**, sources cited **by pointer, never quoted**, plus every deferred INT id. Per-edit records are still written by refine's Step 3 as each edit runs. A single-intent grill writes no session record: Step 3 covers it. Sweep the record against `launchpad/prose-style.md` before showing it.

## Step G7 — Close out

Report how many intents were confirmed / split / rebuilt / reconciled / escalated; whether the scrub ran and what it flagged (or "not needed — no dirty source read"); any ✅ Delivered intents flipped to 🔄 Needs re-verify; and any Scopezilla upstream issue drafted. Then refine's Step 5 report covers each edit.
