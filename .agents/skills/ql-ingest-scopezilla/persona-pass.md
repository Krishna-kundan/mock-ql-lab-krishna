# The persona pass

Reached from `/ql-ingest-scopezilla` Step 4d, after the intents exist. Personas are org-level files, `launchpad/personas/<slug>.md`; `launchpad/personas/README.md` gives the format and the slug rule (decisions/0105). No single upstream field settles them: a project can have stories, intents, or neither. So the set comes out of a short conversation, and the Trusted Guide accepts the files in the pull request that adds them.

**One rule holds even when the Trusted Guide asks you to fill things in:** access nobody gave you is `to decide`. Only a source or the Trusted Guide names a profile, permission set group or permission set, because the build grants whatever the file says.

## 0. Check the engine can check personas

```bash
node launchpad/scripts/intent-ledger.mjs api --at-least 2
```

If it refuses, stop the pass and tell the user to run `/ql-resync` first. An older engine reads a `Persona:` line as architectural grounding and never checks that it resolves.

## 1. Gather candidates

Read what the source has, in place, at the cursor (`source show <name> <path> --at cursor`). Skip any file that isn't there:

- `data/license-needs.json` → `user_groups[]`: the groups of people who log in (`name`). The strongest signal. Their epics, when you need them, are on `needs[].epic_ids` (some projects also list `epic_ids` on the group).
- `data/user-stories.json` → the distinct `persona` values. Workflow actors, often finer-grained than a persona.
- `data/strategy.json` → `strategic_context.strategic_priorities[].audience`. Usually business audiences, not logins; use them as context.
- The living intents you just authored: roles their Outcome and acceptance criteria name ("a supervisor reassigns…").
- `launchpad/personas/`: the personas the org already has, from earlier engagements. Never draft a duplicate; reuse or extend one.

## 2. Propose the set in one table

Show every candidate in one table: its source as a pointer (`license-needs user_groups: agents`), your call (persona, merged into another, or not a persona), the slug (per the README), and its access. The Trusted Guide can correct the whole table in one reply.

- **A persona is someone who logs in with distinct access.** An audience nobody logs in as ("leadership") isn't one. Two names for the same login are one persona.
- **Access** per the rule above: from a source or the Trusted Guide, else `to decide`.

## 3. Write the files

One file per persona in the README's format, `**Introduced by:**` this engagement's slug, with the Trusted Guide's corrections if they gave any. A persona is a role: no person's name, no headcount, no license or SKU detail (the dirty-source membrane in `AGENTS.md`). The files are drafts until the Trusted Guide accepts them in the pull request that adds them, so list them in your Step 8 report.

## 4. Point the intents at them

Propose `Persona: <slug>` lines for each intent's `## Grounding`, from who the intent's text affects and, when the source lists them, the epics each persona works in. The human confirms or corrects the list. Then add the lines, replacing the section's `_none_` placeholder, and give each intent that points at a `to decide` persona a `Q-xxx` asking for that access, so the build asks before granting anything. The pointers sit outside the scope hash, so nothing re-verifies, and a re-ingest never overwrites an existing intent. **Snapshot mode** (`intent_storage: "snapshot"` in `engagement.json`): the tracker holds the text, so make each edit (the lines and any `Q-xxx`) there and pull it back as `/ql-sync-jira` → "Snapshot mode" describes; a line added only in the repo is dropped by the next refresh. Then run:

```bash
node launchpad/scripts/intent-ledger.mjs validate
node launchpad/scripts/intent-ledger.mjs conformance     # lists the personas; flags a pointer with no file
```

**Done when** every candidate is a persona, merged, or ruled out, the files are written, every intent the human pointed at a persona carries its line, and `conformance` reports no unresolved pointer. Report the persona count in Step 8.
