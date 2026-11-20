---
name: ql-refine-intent
description: >-
  Make one governed, recorded edit to a living intent — relabel, resequence, reclassify, split, compress, edit its scope sections, add a dependency. Grills the Trusted Guide first when the edit isn't settled, for one intent or a flagged list. Build and intent disagree → ask which is right; a wrong build is /ql-diagnose. Triggers — "refine intent", "resequence INT-", "split INT-", "compress this intent", "grill INT-", "grill my intents", "INT- came back for rework", "merge decision records", "/ql-refine-intent".
produces: An edited `intents/INT-NNN/intent.md`, re-validated and re-ratified with the Trusted Guide's absorbed/scope-change call; a `decisions/` record when the edit is a posture change (Step 3); refreshes the README delivery index, and flips the ledger row to Needs re-verify if the edit drifted a delivered intent. A session over more than one intent also writes one `decisions/YYYY-MM-DD-intent-grill.md` record. Step 3b writes superseding decision records. No commit.
---

# Refine an intent — a governed edit to the living scope

The intents under `intents/INT-NNN/intent.md` are **living**: Scopezilla drafts them, but the Trusted Guide owns them and refines them in-repo as the engagement learns. This skill makes one such edit *disciplined* — so a change to scope is always deliberate, recorded, and re-validated, never a silent hand-edit that the rest of the trust chain can't see.

This is the door for changing an intent that already exists, and for tidying the decision records intents cite: for those alone, go to Step 3b. When you know the edit, go straight through; when you don't yet, Step 1b works it out with the Trusted Guide first. For unsorted input — meeting notes, a transcript, an ask that might create *or* change intents — start with **`/ql-capture-intent`**, which extracts the candidates and routes the changes back here.

> **Authorship stays human.** You (the agent) draft the edit and prepare the record; the change to Intent is the Trusted Guide's call. Propose, show the diff, let them ratify — then record it with their call (Step 3). A scope edit leaves any earlier ratification stale, and `deliver` refuses stale. You never quietly redefine scope. Sweep the edited prose against `launchpad/prose-style.md` (its intent rules included, applied to the text you edited) before you show it — refinement should leave the intent cleaner, not just changed.

## When each refinement applies (the cases from the field)

| Situation | Refinement |
|---|---|
| "Release Planning" isn't really an intent — it's a delivery-management capability | **Demote / relabel.** Retire it as an intent (or rewrite it into a real outcome). Record why. |
| The intent assumes a Salesforce build, but the work actually lives in another system | **Reclassify.** Often the right move is: this isn't a build intent, it's an **external dependency** on another intent. Rewrite accordingly. |
| The duplicate-rule intent is sequenced first, but the team wants a demo-able app first | **Resequence.** Change `phase:` in frontmatter. (The scope hash ignores phase, so this never trips false drift.) |
| The title / build target / a guardrail / acceptance is wrong or imprecise | **Edit it.** These four sections *and the title* are the scope hash — editing any of them *does* trip drift on a delivered intent (see below). |
| Another team or system must be ready first; another intent must ship first | **Add a dependency** (external / internal) to the `## Dependencies` section. |
| The intent is too big to land in one build-validate-demo cycle — several demoable slices under one id | **Split** (Step 2c). The parent keeps one slice; each other slice becomes a new intent. |
| The intent has bloated — repeated updates piled on source detail, rationale, mechanics, and duplicated constraints until it's hard to scan and build to | **Compress** (Step 2b). Trim it back to what defines the scope; route the rest to its right home. |
| `/ql-sync-jira` lists intents as `NO STORY`: their Outcome doesn't open with who and why | **Backfill the Outcome sentence** across them (Step 2d). |
| Several decision records say one thing, a record's addenda changed what it chose, or one is stale | **Supersede or merge them** (Step 3b). |

## Step 1 — Locate and read the intent

Take the id from the user (e.g. `INT-007`). Read `intents/INT-NNN/intent.md`. If it doesn't exist, list intents (`node launchpad/scripts/intent-ledger.mjs hash`) and ask. Note its current ledger status — `node launchpad/scripts/intent-ledger.mjs drift` / the ledger row — because **refining a Delivered intent has consequences** (Step 4).

**See what already binds it** before you edit:

```bash
node launchpad/scripts/intent-ledger.mjs decisions INT-NNN
```

An edit that contradicts a **binding** record is a scope change for the Trusted Guide, not a wording fix. Fix any ⚠ citation it reports in this same refinement.

> **Confirm you're editing the latest copy of *this* intent (warn, don't block).** On a parallel team, this exact intent may have moved on the shared branch since your session started — editing a stale copy silently overwrites that change. Run:
>
> ```bash
> node launchpad/scripts/intent-ledger.mjs currency INT-NNN
> ```
>
> If it flags the intent as **changed on the shared branch** (a hash divergence), stop and offer to `git pull --rebase` before editing, then re-read the file. This is a **loud warning, not a wall** — you can proceed if you know the change is yours to make (offline/VDI degrades cleanly; CI `drift` remains the backstop). The point is that overwriting a teammate's edit becomes a *conscious* choice, never a silent one.

> **Reopening a *delivered* intent is a deliberate call — offshoots usually want a new intent.** If the row is ✅ Delivered, first ask whether this is really a *correction to the delivered scope* (refine here — and accept the drift flag that follows, per Step 4) or an **offshoot / follow-on** (the content for pages you shipped, a phase-2 capability). An offshoot is almost always cleaner as a **new intent citing this one** (`/ql-capture-intent`) than as a reopen — "closed is closed" is the default. Reopening isn't forbidden (some projects want it), but say which one you're doing and why, and let the human choose. This mirrors the disposition default in `/ql-capture-intent` Step 3.

## Step 1b — Settle the edit, if it isn't settled

You can draft the before→after only once you know it. If you don't — all you have is the reason (the client's rework note says what's wrong, not what to write), a grader's finding, an intent that reads oversized or thin, or a build that disagrees with it — **don't draft a guess for the Trusted Guide to approve.** Grill it first: follow `.claude/skills/ql-refine-intent/grill.md`, or `.agents/skills/ql-refine-intent/grill.md` on other harnesses, or `${CLAUDE_PLUGIN_ROOT}/skills/ql-refine-intent/grill.md` on a plugin-only checkout. The same file runs a session over a list of flagged intents ("grill my intents", "grill phase 2"). **Done when** the intent meets that file's settled bar; then make the edit in Step 2. When the user hands you the exact change, skip this step.

## Step 2 — Make the edit

Edit the file directly. Keep the format intact — the toolchain parses it:

- **Frontmatter** (`id`, `phase`, `epic`, `confidence`, `origin`, `title`). Resequencing = change `phase:`. Relabelling = change `title:`. **Don't change `id`** — it's the join key for the ledger, test script, PRs, and Jira; renumbering orphans all of them.
- **Canonical sections** — keep the exact `## ` headings: `Outcome` (optional), `Build target`, `Guardrails`, `Out of scope`, `Acceptance`, `Success criteria` (optional), `Dependencies`, `Open questions`. Guardrails / Out of scope / Success criteria are bullet lists; Build target is prose; Acceptance is the short list, then an optional `### Detail` (*Acceptance leads with the short list* in `launchpad/prose-style.md`).
- **Outcome** (optional) — the business "why", seeded from Scopezilla's `outcome` field: one sentence (its `summary`) written as *Outcome opens with who and why* says (it leads the Jira story, and `validate` warns on anything past it), optionally followed by `- Baseline:` / `- Target:` / `- Window:` metric bullets when a real, measured baseline exists. It's context, not a build instruction — **excluded from the scope hash** (editing or backfilling it never trips drift), and not required (many intents have only a summary, or none). Don't fabricate a metric; omit the bullets when there's no real baseline. The measurable, *provable* criteria a test can fail live in `Success criteria`, not here.
- **Success criteria** (optional) — measurable, technology-agnostic outcomes (`- SC-1: …`) separated from `Acceptance`: *what* must be objectively true, stated so a test could fail it ("revocation observable within one page refresh", "zero leaked rows via SOQL"), not *how* it's built. It is **excluded from the scope hash** and is **not required** (a thin intent may have none). It's the natural home for the "is this provable?" rigor `/ql-vet-intent` checks; `/ql-test-script` turns each `SC-x` into a proof criterion. **One honesty caveat:** *weakening or removing* an `SC-x` is exactly the silent scope-softening this skill exists to prevent — record a `decisions/` entry saying what you loosened and why, and re-confirm a delivered build still holds. Editing an SC never trips `drift`; on a ✅ Delivered intent it also silently changes what the test script must prove — see Step 4 for the delivered-intent re-check.
- **Open questions** — one bullet per question, its status at the end of the *same* line: `- Q-001: <question> — UNANSWERED`, or once decided, `- Q-001: <question> — ANSWERED: <short answer>. See decisions/<file>.md`. The reasoning lives in the record, not the answer (`validate` warns past ~300 characters). The scripts read only that inline marker, so an answer on a continuation line or in bold (`**[ANSWERED]**`) still counts as open, and `/ql-sync-jira` keeps its sub-task open. When a decision answers a question, write the marker here in the same edit. Fold the answer itself where *What, not how* in `launchpad/prose-style.md` puts it.
- **Dependencies** — under `## Dependencies`, `### Internal` is bullets that start with an intent id (`- INT-003 — reason`); `### External` is bullets in the form `- System name | what's needed | owner: Owner Name`. External dependencies are the cross-team asks the delivery lead lines up before the build needs them.

**Bring an older intent to the current shape when you touch it.** If its Outcome doesn't open with who and why, or its Acceptance doesn't lead with the short list, offer to reshape it in this edit. On a ✅ Delivered or 🔄 intent, offer only the Outcome sentence: it's unhashed, and reshaping Acceptance would re-hash a delivered build for no change in behavior. Reshaping Acceptance is a hashed edit, so show each new bullet and Detail line beside the sentence it came from, and name every change in meaning (an actor widened or narrowed, a qualifier dropped, an obligation added) as a scope change for the Trusted Guide, never as tidying.

**Demoting an intent that isn't really an intent:** prefer rewriting it into the real outcome if there is one. If it genuinely shouldn't exist, retire it: write the decision (Step 3), then run `node launchpad/scripts/intent-ledger.mjs retire INT-NNN --decision decisions/<file>.md`. That flips the row to 🚫 Retired, keeps its PR history, and drops it from drift and coverage. Keep `intent.md` — it's the record of what was de-scoped. Never delete the directory or hand-delete the row; that erases the traceability `retire` exists to keep.

**Reclassifying SF→external:** rewrite the build target to what Salesforce actually does (often "consume / react to" rather than "build"), and add the external system as a `### External` dependency on whichever intent still owns the Salesforce-side behavior.

## Step 2b — Compress, when the intent has bloated

Refinement is additive by default — each update piles on, and nothing sheds weight. Over an engagement an intent can accumulate source detail, rationale, implementation mechanics, fixtures, and constraints duplicated across sections until it's a wall of prose that's *harder* to build to, not more complete. This is the intent-specific face of **"Be precise, not verbose"** (AGENTS.md): an intent should hold what *defines the scope*, and route everything else to its right home. Reach for this when an intent reads bloated (a rough tell: past ~1,000–1,500 words, or when scope is buried in rationale/mechanics) — or when `/ql-vet-intent` surfaces a scannability finding, or `validate` warns on the intent's size, its Outcome, or a long answer. **It's triggered, not mandatory:** a one-line dependency add or a resequence needs no compression pass; don't manufacture one.

Compression is **content redistribution, not deletion** — every rule below *moves* content to where it belongs, or removes a genuine duplicate. Keep only what changes an **outcome, constraint, boundary, dependency, or proof**:

- **Keep** — build target, guardrails, out-of-scope denials, acceptance, dependencies, open questions: the load-bearing scope. If cutting a sentence would lose something a build or a test acts on, it stays.
- **Move implementation mechanics & fixtures → `design.md`** — *how* to build it (objects, automation choice, sample data, field-level specifics) is design, not scope. If no `design.md` exists yet and the mechanics matter, that's the signal to run `/ql-design-intent`.
- **Move chronology & rationale out of the body** — "we first tried X, then the client asked for Y in the March call" is provenance, not scope. It belongs in git history (the commit message), or in a `decisions/` record when it explains a posture call (Step 3), not accreted in the intent body.
- **Split independently-deliverable outcomes (Step 2c)** — if the intent has quietly grown to cover two things that could ship apart, that's a split, not compression. Don't fork an intent id by hand here.
- **Dedup across sections** — the same constraint restated in Build target, Guardrails, *and* Acceptance is one constraint. State it once, in the section that owns it.
- **Record answers before you shorten them** — an ANSWERED question with no `See decisions/` pointer keeps its reasoning only in the body. Write its record first (Step 3, rule 5), then cut the answer to a short line that cites it.

**This is still a governed edit, not a tidy-up.** Compression touches the hashed scope fields (build target / guardrails / out-of-scope / acceptance), so it runs through the *same* discipline as any refinement: it's a human-ratified change (show the before→after), it records the call at ratification (Step 3), and it re-hashes and trips drift in Step 4 if the intent was ✅ Delivered. **The tripwire to respect:** compression must never quietly drop a load-bearing guardrail or soften a boundary under cover of "trimming." If you're unsure whether a line is noise or signal, it's signal — keep it, or surface the question. Moving text to design.md/decisions is safe; *losing* it is the silent scope drift this whole skill exists to prevent. **Done when** the before→after you show lists every removed sentence with its destination (design.md, a decision, git history, or "duplicate of" the line that keeps it); none goes unaccounted for.

## Step 2c — Split, when the intent is several increments

Agree the slices with the Trusted Guide first (Step 1b usually gets you here). Then:

- **The parent keeps the slice that is still its own.** Edit it here, so its id, ledger row, PR history and tracker link survive.
- **Each other slice becomes a new intent** through `/ql-capture-intent`'s scaffold (its Step 4a), with `derived_from: <parent INT id>` in its frontmatter (plus the parent's own `derived_from:` pointers, if any) and an `### Internal` dependency on the parent when it builds on it.
- **If no slice is the parent's own,** retire the parent (Step 2) once its children exist.
- **A ✅ Delivered parent stays as it is.** Capture the new slices citing it instead: closed is closed, and narrowing it would trip drift (Step 4).

## Step 2d — Backfill the Outcome sentence across intents

For a list of intents whose Outcome doesn't open with who and why (`/ql-sync-jira` lists them as `NO STORY`), draft the sentence for each in one pass. Draft only from what the intent already says; write nothing it doesn't support, and leave a person unnamed rather than guess one. Where the intent already has a hand-written summary (a `## TL;DR` or similar), fold it into the sentence and remove it, so there's one; on a ✅ Delivered or 🔄 intent, leave it in place if removing it moves the hash below. Show the Trusted Guide one table (intent, current first paragraph, proposed sentence, and any summary text being removed) and write only the rows they approve. Replace only Outcome's first paragraph (with no Outcome, add `## Outcome` and the sentence before `## Build target`); its metric bullets and anything after them stay as they are, and nothing outside `## Outcome` changes but that folded summary. Then run `node launchpad/scripts/intent-ledger.mjs hash` before and after: Outcome is unhashed, so no hash should move and the ratify lines stay current. If one does move (the removed summary sat under a hashed heading), that intent's edit goes through Steps 3 and 4 like any scope edit; on a ✅ Delivered or 🔄 intent, put the summary back instead. None of Step 3's record triggers apply to an Outcome-only edit. In snapshot mode, draft the approved rows in the copies as that loop expects, then write each one through the loop in `/ql-sync-jira` → "Snapshot mode", and check each read-back still has its sentence: `pull --check` compares hashes, and Outcome isn't hashed. Reshaping Acceptance stays per intent (Step 2).

## Step 3 — Record the call

Every refinement ends with the Trusted Guide's call: **absorbed** (a refinement within agreed scope) or **scope-change** (it changes what was agreed with the customer). Recommend a call with a one-line reason (it goes in the commit message); they make it. Git history keeps what changed; the ratify line keeps their call.

**First check each line below. If any is true, write a `decisions/YYYY-MM-DD-<slug>.md` record:**

1. The intent is ✅ Delivered and the edit touched a hashed field (title, build target, guardrails, out of scope, acceptance). Step 4's `reverify --decision` needs this record's ref.
2. The Trusted Guide called it `--scope-change`.
3. It loosens a guardrail, an out-of-scope line, or a success criterion.
4. It retires the intent (`retire --decision`).
5. It records a customer's answer to an open question (the Q line's `See decisions/<file>.md` points here).
6. It formalizes a deferred 👁 criterion (below).
7. It's a **posture change**: it changes scope, architecture, the validation chain, or a customer commitment beyond this intent's own wording.

If none is true, the ratify line and git history are the whole trail: write no record.

The record carries Context (what prompted it: review, demo, stakeholder call), the change (before → after), and Consequences (a dependency, a phase plan, a delivered build), with `**Intents:** INT-NNN` in its header. If it binds this intent's build, cite it with one Guardrails line (`- <the rule> (decisions/<file>.md)`) instead of restating it.

**Then ratify, last:** `node launchpad/scripts/intent-ledger.mjs ratify INT-NNN --by "<name>" --absorbed` (or `--scope-change`). Ratify after the citing Guardrails line is in: Guardrails is hashed, so an edit after ratifying leaves the ratification stale.

**Formalizing a deferred 👁 criterion** (a `deferred-as-is` Sign-off from `/ql-record-test-execution`): once the decision exists, append ` / → decisions/<this-file>.md` to that criterion's Sign-off cell in `test-script.md`. Until it carries that pointer, `coverage` treats the deferral as unrouted and gates a Delivered intent.

**When to write it: now, in the same working change as the intent edit — before any commit or PR, and never gated on PR approval.** When a record is due, it and the edited `intent.md` are one change that lands together; the record is *why* the edit was made, so it can't lag behind the edit. Don't defer it to "after the PR is approved," and **don't ask the human to pick an interval or a timing** — there is no schedule to choose. (The `Decision record(s)` field in the PR template and the ARB `accepted-by-ARB` hand-edit are downstream *references to* a record that already exists — they are not when it gets created.) You draft the record as part of the refinement; the Trusted Guide ratifies the change, not a calendar for it.

## Step 3b — Supersede or merge decision records

Read the engagement's dated records and the org's (`launchpad/decisions/`; architecture ADRs excepted, since they change only as their own template says) for ones that say one thing, addenda that changed a choice, and records the build has overtaken. Propose one move each and let the Trusted Guide pick: **merge** them into one new record that supersedes them all, **supersede** one whose choice changed, or **leave it** (a long record that still holds is fine). Write it as `launchpad/decisions/TEMPLATE.md` says. Before the Trusted Guide ratifies it, check the draft against every record it supersedes, in a fresh subagent where your harness has one: list each rule still in force that the draft drops and each one whose meaning it changes, restore the ones the move didn't mean to change, and show the Trusted Guide the rest. Then clear the citation warnings `validate` prints and go on to Step 4. Where a superseded record's body keeps misleading readers, offer to cut it to a tombstone: title, date and Status, with the body left to git history.

## Step 4 — Re-validate and surface drift

**Snapshot mode** (`intent_storage: "snapshot"` in `engagement.json`): the tracker holds the text, so once the Trusted Guide approves the edit, write it there and pull it back with the loop in `/ql-sync-jira` → "Snapshot mode".

```bash
node launchpad/scripts/intent-ledger.mjs validate         # the file still parses, deps resolve, no phase inversions
node launchpad/scripts/intent-ledger.mjs drift             # did this change a DELIVERED intent?
node launchpad/scripts/intent-ledger.mjs index --write     # refresh the README delivery index (phase/title may have moved)
```

- **`validate` must pass.** If you renamed a heading or broke the dependency format, fix it now — a malformed intent file makes drift detection unreliable, and CI gates on `validate`.
- **A size warning on this intent is yours to raise, even if it predates your edit.** Tell the Trusted Guide what it found and offer the Step 2b pass as the next refinement, separate from this edit.
- **Drift is the honest consequence, not a bug.** If you edited the **title / build target / guardrails / out-of-scope / acceptance** of an intent the ledger marks ✅ Delivered, its scope hash moved and `drift` fails on it. Acknowledge it in this same change: `node launchpad/scripts/intent-ledger.mjs reverify INT-NNN --decision decisions/<this-file>.md` flips the row to 🔄 Needs re-verify (keeping the recorded hash + PR), after which `drift` reports it as acknowledged instead of failing. That is correct: you changed what "done" means, so the delivered build must be re-checked against the new text (and its test script re-confirmed via `/ql-test-script` → `coverage`). Surface this to the user as an action item. Once the build is re-verified against the new scope, `deliver INT-NNN` re-stamps it; never re-stamp without that re-verify.
- **Everything else is context and never trips drift** — the hash excludes phase, Outcome, Success criteria, Dependencies, Grounding, and Open questions. So resequencing, noting a cross-team dependency, or backfilling grounding on a delivered intent is cheap and safe. (The `drift` output prints this same boundary when it flags — the scope contract is those five hashed fields, nothing more.)
- **Success criteria are the exception to "safe" — drift-free but *proof-relevant*.** Editing an `SC-x` never trips drift, but every `SC-x` drives a `test-script.md` criterion (`/ql-test-script`), so the test script's `proof_hash` includes them: an SC edit leaves the ledger alone but flips the test script to 🔄 in `coverage` — refresh it with `/ql-test-script`. (A script still stamped with a legacy `scope_hash:` can't see SC edits; re-stamp it as `proof_hash` when you touch it.)
- **A design.md needs the change, not just the stamp.** If the intent has `intents/INT-NNN/design.md`, name the before→after and update every design section it touches (data model, FLS, layouts and pages, automation) before re-stamping (`stamp INT-NNN --in design`). When it touches none, report "no design impact": said, never assumed. A ratified design goes stale on that edit: the Trusted Guide re-ratifies it (`ratify INT-NNN --design --by "<name>"`).

If the edit acts on a `/ql-vet-intent` finding, re-run `/ql-vet-intent` on the intent; that finding should now read clear, not just reworded.

## Step 5 — Report

If Step 1b ran a session, report its close-out first (`grill.md` Step G7). Then, for each edit, tell the user: which intent changed, the before→after, the call recorded at ratification, the decision file if one was due, whether `validate` passed, whether the edit drifted a delivered intent (and the re-verify it implies), and whether the README index moved. If the change is really a Scopezilla *defect* — the generator emitted something systematically wrong (a non-intent like "Release Planning", or SF-assumed work that should be external) — say so and offer to feed it upstream via the cross-repo handoff (see AGENTS.md), so the *next* engagement's scoping output is better, not just this repo's copy.

**Gate nudge** (AGENTS.md, *Delivery governance follows ADF*): once per scope-change call, one line built from it, nothing asked, for example: "ADF Orchestrate: you called INT-007's edit (a supervisor approval step) a scope change, so it goes through change control before it's built; cite `decisions/2026-11-04-supervisor-approval.md` (usually the Delivery Lead's call)." An absorbed refinement: say nothing.

## What this does NOT do

- It does **not** rewrite an intent to match the code (Step 1b).
- It does **not** author brand-new intents from raw input — that's `/ql-capture-intent` (which calls back into these mechanics for the targeted changes it finds).
- It does **not** re-run Scopezilla or pull from upstream — refinement is in-repo. Upstream regeneration + reconcile is `/ql-ingest-scopezilla`.
- It does **not** mark a drifted Delivered intent "done" by re-stamping the hash on your own. Re-verification is a human-validated act; you prepare it, the Trusted Guide signs it.
- It does **not** sign off or close the loop in Jira — status projection is `/ql-sync-jira`, one-way.
