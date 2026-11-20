# Vet a set — are the intents ready, and do they agree?

Reached from `/ql-vet-intent` when it's given more than one intent: a delivery phase, a list, or the whole set ("vet phase 2", "do the intents agree", "analyze intents"). One-intent vetting reads each intent in isolation, and `validate` checks only the structural floor; neither sees what goes wrong *between* intents. Set mode runs the one-intent checks and that **cross-intent sweep** together, so one run answers "is my Intent ready?"

## Step S1 — Load the set and run the structural check first

```bash
node launchpad/scripts/intent-ledger.mjs validate    # every file parses, deps resolve, no phase inversions, no duplicate ids
```

If `validate` fails, **stop and fix that first** (route to `/ql-refine-intent`). Don't re-report what it already caught. Then load the full digest, every intent in every phase, with build target, out-of-scope, dependencies, and open questions in one view:

```bash
node .claude/skills/ql-check-scope/scope-digest.mjs --deps \
  || node .agents/skills/ql-check-scope/scope-digest.mjs --deps \
  || node "${CLAUDE_PLUGIN_ROOT}/skills/ql-check-scope/scope-digest.mjs" --deps
```

The `--deps` view groups the declared internal (build-order) and external (cross-team) dependencies, which you compare against the dependencies the prose *implies* (the undeclared-dependency dimension below). Read the whole digest even when you were given one phase: a contradiction or overlap with another phase is still a finding. **Done when** `validate` passes and the digest is loaded.

## Step S2 — The per-intent checks, one delivery phase at a time

Run the one-intent checks (`SKILL.md` Steps 1–3, skipping Step 1's `validate`, which S1 ran) on each intent you were given: a named list or one delivery phase, every intent in it. **Given the whole set, cap it to one delivery phase per run:** vet the earliest unbuilt phase and offer the next: *"Phase 1's 6 intents are vetted; phases 2–3 hold 14 more. Vet phase 2 next?"* The cross-intent sweep in S3 still covers the whole set.

Two one-intent dimensions overlap the sweep. Report each finding once: an internal build-order dependency the prose implies but doesn't declare goes under **Undeclared dependency** (S3), and a name used two ways across intents goes under **Terminology drift** (S3). *Dependency soundness* and *Written to the intent rules* keep what's inside one intent.

**Done when** every intent you vetted has its one-intent verdict and its findings. Leave the design and brownfield nudges (`SKILL.md` Step 4) to each intent's `/ql-start-intent` run.

## Step S3 — Sweep for cross-intent inconsistencies

This is a reasoning task, not a grep: intents are prose, so the conflicts are semantic. **Sweep relentlessly, pair by pair:** within each epic, compare every intent's build target and guardrails against every other intent's, and against the previous phase's delivered intents; then across epics for anything sharing an object. Read each intent's `design.md` too, when it exists: the data model and sharing live there, so two designs that create one thing twice, set opposite sharing on one object, or use another intent's object without a declared dependency are findings here. Check each design against `launchpad/data-model.md` and the engagement's `solution.md` too, when they exist: a design that creates an object the model credits to another intent, gives an existing relationship another type, or changes a step in a cross-intent flow without editing the flow is a **Contradiction** finding, the fix being to reuse the model or to update the file in that design's change (`/ql-design-intent`). For terminology drift, first list every object, field, and role noun with the intent ids that use it (from the intents and their designs), then scan that list for two names for one thing and one name for two things. For every finding, capture **which intents** (always a pair or group), **the conflict** (quote both sides), **severity**, and **the concrete fix** (including which skill makes it).

| Dimension | The question it asks | What a finding looks like |
|---|---|---|
| **Overlap / duplication** | Do two intents build the **same capability**, or does one's `build target` substantially contain another's? Distinguish genuine duplication (build it twice) from a legitimate dependency (one builds on the other) or a deliberate phase split (POC now, real later). | "INT-012 'dedupe Contacts on email' and INT-027 'block duplicate Contacts' describe the same rule. Merge, or one should depend on the other — not two separate builds." |
| **Contradiction** | Does one intent's `guardrail` or `acceptance` **conflict** with another's `build target` or `out_of_scope`? A thing one intent forbids that another requires; a boundary they draw incompatibly. | "INT-005 guardrail (the customer's integration standard) says Salesforce never waits on Billing during a save; INT-018 acceptance says the rep sees Billing's confirmation number before the save completes. These can't both hold — reconcile the pattern." |
| **Terminology drift** | Is the **same real-world thing named differently** across intents (Application vs. Case vs. Request; Practitioner vs. Provider vs. Agent), or the **same name used for two different things**? This fractures the data model before it's built. | "INT-003 says 'Subsidy Application', INT-009 says 'Benefit Case' — same object? If so, one name across the set; if not, say how they differ. Left ambiguous, the build creates two objects." |
| **Undeclared dependency** | Does one intent's prose clearly **assume another has shipped** (references its object, its field, its automation) without declaring it under `## Dependencies → ### Internal`? `validate` checks declared deps resolve; it can't see a dependency the prose implies but never declares. | "INT-021 lets managers reassign the assignments INT-014 creates, but INT-021's `### Internal` is `_none_`. Declare INT-014 so the build order is right." |
| **Seam gap** | Is there a capability the set clearly needs that **falls between two intents and neither owns** — each assuming the other handles it? The classic "who's building the sharing rule?" gap. | "INT-007 grants access 'once assigned'; INT-011 revokes 'when assignment ends'. Neither owns the *sharing mechanism* both depend on — is it a missing intent?" |
| **Sequencing coherence** | Beyond `validate`'s phase-inversion check: do the **phases tell a buildable story**? A foundational object split across a later phase than the intents that use it; a phase that can't demo because its enabling intent is scheduled after it. | "INT-002 (phase 2) is the data model INT-015/016/017 (phase 1) all build on. Phase 1 can't ship without it — resequence INT-002 to phase 1." |

**Name both intents and quote the conflicting text.** Two intents touching the same object is normal (that's what epics are); a finding needs genuine overlap, contradiction, or an undeclared dependency. **Done when** each of the six dimensions reads "checked, none" or carries its findings, and every epic was swept.

Severity uses the same markers as one-intent vetting (`SKILL.md` Step 3), read across the set:

- **⛔ Blocks build** — building the set as-is means building something twice, shipping a contradiction, or fracturing the data model. (Genuine duplication, a hard contradiction between a guardrail and a build target, an object named two ways.)
- **⚠️ Weakens the plan** — buildable, but the plan is soft until fixed. (An undeclared-but-inferable dependency, a seam gap that's probably covered elsewhere, terminology that's likely-but-not-certainly the same thing.)
- **💡 Polish** — tightens the set without changing the build. (Wording aligned across intents, a phase order that works but reads awkwardly.)

## Step S4 — Report

Lead with **two verdicts**, then the findings, then the routes:

- **Readiness** — each vetted intent's one-intent verdict (✅ Ready / ⚠️ Buildable with caveats / ⛔ Not ready), plus the phases not yet vetted.
- **Coherence** — one of **✅ Coherent** (no ⛔, at most minor ⚠️/💡) · **⚠️ Coherent with caveats** · **⛔ Conflicts to resolve** (reconcile before building the affected intents).
- **Coverage** — one line per S3 dimension (checked, none, or the count of findings), and for each vetted intent, its one-intent coverage line.
- **Per-intent findings** — a table: *Intent · Section · Finding (quoted) · Severity · Fix*, every ⛔ and ⚠️ from S2.
- **Cross-intent findings** — a table: *Intents (the pair/group) · Conflict (both sides quoted) · Dimension · Severity · Fix*.
- In both tables, report every ⛔ and ⚠️, merging only exact duplicates; summarize the 💡 by count.
- **Routes** — `SKILL.md` Step 4's routes, plus:
  - A **known edit to reconcile two intents** (align a name, add the missing dependency, sharpen a guardrail, resequence, merge a duplicate) → `/ql-refine-intent` on each intent, as separate ratified edits so the trail is per-change.
  - **Several conflicting or overlapping intents that need judgment and splitting** → hand the flagged set to `/ql-refine-intent` as one session (its Step 1b grill).
  - A **seam gap that's really a missing capability** → `/ql-capture-intent`.
  - A **systematic Scopezilla defect** (the generator emits overlapping intents or inconsistent naming every run) → offer the upstream handoff, as Step 4 says for one intent.
  - **Delivered-intent caution** — if a reconciling edit would change an intent the ledger marks ✅ Delivered, say so: `/ql-refine-intent` will flip it to 🔄 Needs re-verify.

**Done when** both verdicts are given, every S3 dimension and every vetted intent has its coverage line, and every ⛔ and ⚠️ has a route. Close by pointing back into the loop: once the ⛔ findings are resolved through the ratified edits, each intent proceeds through `/ql-start-intent` as usual.
