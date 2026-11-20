---
name: ql-capability-map
disable-model-invocation: true
description: Generate a self-contained, offline interactive capability map of the whole scope — Phase to Epic to Intent — to present or walk a client through, plus release notes and a validation pack from what's delivered. Read-only; never edits scope.
produces: >-
  `delivery/capability-map.html` — a self-contained, offline interactive Phase to Epic to Intent map — and, on request, `delivery/release-notes[-phase-N].md` and `delivery/validation-pack[-phase-N].md`. Read-only over scope; derived views recomputed each run, never edit an intent.
---

# Capability map — see and present the whole scope

This produces one self-contained HTML file — `delivery/capability-map.html` — that lays out the engagement as **Phase → Epic → Intent (capability)**, color-coded by phase, with click-to-drill-down panels. No server, no network, no dependencies: it opens from `file://` and works offline in a conference room. It's built for the **Intent & Align** phase — an Engagement Architect walking a Product Owner through scope, or facilitating an intent gap-closing session.

It is a **derived view**, the same family of artifact as the README delivery index: computed fresh from canonical sources every run, never hand-maintained. It is strictly **read-only over scope** — it displays and helps you interrogate the intents; it never edits one. Refinement still flows through `/ql-refine-intent` and `/ql-capture-intent` (the governed, ratified paths).

## What it reads (all read-only)

- `intents/INT-NNN/intent.md` — the living canonical intents (the capabilities), including their internal dependencies. **This is the structural authority:** each intent's own `phase:`/`epic:` frontmatter decides which phase band and epic column it lands in.
- each tied Scopezilla source's `data/epics.json` — epic names, descriptions, confidence, KB sources (**enrichment** for the columns the intents define)
- each source's `data/roadmap.json` — phase names and the preferred epic column order (**enrichment + ordering**, not placement)

Both are read in place at the commit last reviewed (`source show … --at cursor`) and merged across sources. With no tied source, the map is built from the intents alone and says so.
- `delivery/intent-ledger.md` — per-intent delivery status, overlaid as a badge
- the engagement's `README.md` (ENGAGEMENT block) — optional; the "Client / project" line becomes the map title

**The intents drive structure; the source only enriches.** Living intents are refined in-repo while a tied source moves only at the next `/ql-ingest-scopezilla`, so the intent always wins on placement and the source supplies names, descriptions, KB sources, and column order. Where they diverge, the map follows the intent and surfaces the divergence as a data note.

## Step 1 — Regenerate

Run from the engagement repo root (the generator is vendored with this skill into the harness's skills dir — `.claude/skills/` or `.agents/skills/` — so the chain tries both, then falls back to the plugin for a plugin-only checkout). It reads the repo from your current directory and writes the map there:

```bash
node .claude/skills/ql-capability-map/capability-map.mjs --open \
  || node .agents/skills/ql-capability-map/capability-map.mjs --open \
  || node "${CLAUDE_PLUGIN_ROOT}/skills/ql-capability-map/capability-map.mjs" --open
```

It writes `delivery/capability-map.html` and prints the `file://` URL plus a one-line summary (intents · epics · phases) and any data notes. `--out <file>` writes somewhere else.

If the script exits with **"No intents/ directory yet"** or **"Missing … Run /ql-ingest-scopezilla"**, scope hasn't been ingested into this repo yet — tell the user to type `/ql-ingest-scopezilla` first, then re-run this. (The map can only show what's been ingested; it never invents scope.)

## Step 2 — Open it

Open the printed `file://` URL in a browser (or `open delivery/capability-map.html` on macOS). Each phase is a band; each epic a column; each intent a card you can click for its full panel (build target, acceptance, dependencies, ledger status).

## Step 3 — Read what it surfaces, then facilitate

Before presenting, check two things in the map and tell the user what you find, with ids. Both are the conversations a gap-closing session exists to have:

- **Low-confidence intents**: the **Assumed**, **Unknown** and **Draft** confidence chips filter to the scope still to be validated with the Product Owner.
- **Unanswered open questions**: the **❓ Has open questions** chip filters to the intents carrying them (each card's ❓ badge counts them); they're the decision points blocking lock-down.

Then read every **data note** the script printed (also in the map's footer) and tell the user each one by type (below) with its ids, or say "no data notes". They are signals worth knowing going in, not bugs in the map:

- **No Scopezilla source** tied to the engagement, or **an intent file that can't be read**: the map is built from what it could read; fix the file or tie the source.
- **Dependency cycles** between intents (A depends on B *and* B depends on A) — sequencing isn't yet settled. Worth flagging to the Engagement Architect as a resequencing candidate, not something this skill fixes.
- **Source-reconcile notes** ("placed in phase N per the intent, but the Scopezilla source schedules its epic in phase M", or "epic X isn't in the Scopezilla source") — the intents have been restructured in-repo since the last `/ql-ingest-scopezilla`. The map is showing the *current* intent structure (correct); the note is telling you the source, as last reviewed, is behind. Run `/ql-ingest-scopezilla` to reconcile the source when convenient — the map is right either way, but reconciling clears the notes and restores the source's epic/phase names.

Use the drill-down live: when the PO questions a capability, open its card and ground the discussion in the actual build target and acceptance. When the session surfaces a change, **don't edit scope here** — route it: a correction to a known intent → `/ql-refine-intent`; net-new scope from the discussion → `/ql-capture-intent`. Both record a decision and re-validate. Then **re-run Step 1** so the map reflects the ratified change.

## Release notes and the validation pack

Two markdown views of what's delivered, for the Trusted Guide to send:

```bash
node .claude/skills/ql-capability-map/delivery-views.mjs release-notes --phase 1 \
  || node .agents/skills/ql-capability-map/delivery-views.mjs release-notes --phase 1 \
  || node "${CLAUDE_PLUGIN_ROOT}/skills/ql-capability-map/delivery-views.mjs" release-notes --phase 1
```

(`validation-pack` in place of `release-notes` for the other; leave out `--phase 1` for every phase.)

- **Release notes** (`delivery/release-notes[-phase-N].md`): each ✅ Delivered intent with its title, its Outcome summary and the PR it shipped in, plus the 🔄 ones listed as re-verifying.
- **Validation pack** (`delivery/validation-pack[-phase-N].md`): every criterion of each delivered intent with its evidence mark, `not proven yet` wherever `coverage` counts it unproven, whether a 👁 passed or is still to run, and the scenes the customer still needs to run. It uses the engine's own criteria parser, so its marks agree with `coverage`.

Both are stamped as generated and are never read back as input. They name no signer and claim no approval: a sign-off is a named person's verdict on one 👁 criterion, recorded by `/ql-record-test-execution`. Read each before it goes out, checking every `not proven yet` and still-to-run line is one you expect; the Trusted Guide sends it. They need engine API 2; on an older engine the script says to run `/ql-resync`.

## What this does NOT do

- It does **not** edit, create, or resequence intents. It's a read-only view; scope changes go through `/ql-refine-intent` / `/ql-capture-intent`, which the Trusted Guide ratifies.
- It does **not** update on its own. Re-run after any refinement to see the current shape.
