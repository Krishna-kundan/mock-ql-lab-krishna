---
name: ql-design-intent
description: >-
  Propose the Salesforce build approach for one non-trivial intent before building — data model, sharing/security, automation (standard-first), integration, alternatives, and, in a grounded engagement, conformance to the approved architecture — as a human-ratified design.md. To open and build the intent, use /ql-start-intent. Triggers — "design this intent", "what's the architecture for INT-", "/ql-design-intent".
produces: A co-located, human-ratified `intents/INT-00x/design.md` (scope-hash stamped) + a `decisions/` record for material architecture calls. No commit; doesn't build or edit the intent.
---

# Design an intent — propose the build approach before you build

The build loop runs `/ql-check-scope → /ql-vet-intent → /ql-design-intent → /ql-test-script → build`. This skill fills the step that nothing else does: **a reviewed design before the code exists.** `/ql-vet-intent` confirms the intent is *ready to build against*; this proposes *how* to build it on the Salesforce platform — and puts that approach in front of the Trusted Guide while changing it is still cheap.

Without this step, the first time a human sees the architecture — the object model, the sharing approach, whether this is a Flow or an Apex trigger, the integration pattern — is at **PR review, after the build.** On Salesforce that's expensive: a junction object that should have been master-detail, custom Apex that should have been a standard capability, an automation in the wrong place — all far cheaper to catch at design time than to rework after they're built and the tests are green against the wrong shape. This is the "standard-first, no custom you'll regret" principle given an artifact: the regret gets caught *before* it's committed to code.

> **Authorship stays human — for the approach, too.** You (the agent) *propose* the design; the Trusted Guide *ratifies* it. Same posture as Intent itself. You draft the design.md, show it, and let them approve or redirect before the build proceeds. You don't lock an architecture and start building on your own say-so — a wrong approach ratified by a human is a decision; a wrong approach the agent just ran with is rework. Sweep the design.md prose against `launchpad/prose-style.md` before showing it.

## When to reach for it (optional but recommended)

Not every intent needs a design doc. A single new field + its FLS doesn't; a new object with a sharing model does. Reach for it — and `/ql-vet-intent` will nudge you toward it — when the build will likely cross any of these lines (judge from what the outcome needs, not only what the intent's text names; when unsure, design it):

- **A new object**, or a relationship decision (master-detail vs lookup, a junction).
- **A sharing / security change** — who sees what, a new permission set, FLS that ripples across personas.
- **An integration** — an external system, a callout, a platform event, a named credential.
- **Apex** — a trigger, a service class, a batch/queueable, anything where the standard-vs-custom call matters.
- **Anything you'd want a second architect to sign off on** before you spent a day building it.

A trivial intent (a field, a list view, a validation rule with an obvious shape) can skip straight to `/ql-test-script`. Say so rather than manufacturing a design doc for work that doesn't need one.

## What you produce

One file per intent, **co-located with the intent it designs** — `intents/INT-NNN/design.md`, beside `intent.md` and `test-script.md`:

```markdown
---
intent: INT-001
scope_hash: 59b99f9ee762   # node launchpad/scripts/intent-ledger.mjs stamp INT-001 --in design — at authoring
authored: 2026-06-04
---

# INT-001 — Design

**Intent:** Grant practitioner access to medical history only while assigned to an open application
**Source intent:** `intents/INT-001/intent.md`

## Data model
Objects and fields this intent touches or creates. Relationship choices (master-detail vs lookup vs
junction) WITH the reason. Note what's standard vs custom. The whole model is
`launchpad/data-model.md`: point at its sections for what's already there, and say here what
this intent adds or changes.

## Sharing & security
The sharing model (OWD, sharing rules, Apex-managed sharing, restriction rules). Which
permission set(s) grant access, and the FLS implications. The **cascading consequences**
this implies: app slot, the page / layout / related list each persona reaches it through, list views, profile/perm-set updates —
the work that makes the increment *usable*, not just compiling (see AGENTS.md).

## Automation approach
Declarative-first: validation rule vs Flow vs Apex trigger vs Apex service — and **why not
something simpler**. Standard platform capability before custom. Governor-limit exposure if
it's bulk/recursive.

## Integration (if any)
Point at each external system's entry in `launchpad/systems.md` (`launchpad/systems.md#<slug>`)
instead of restating it, then say what this intent adds: the objects it exchanges, what rides
the metadata deploy vs. what goes in `launchpad/deploy-runbook.md`. Tie each to the intent's
`## Dependencies` (an external dependency here should already be declared there — if it isn't,
flag it back to `/ql-refine-intent`).

## Alternatives considered
What else was on the table, and why this approach won. The "simpler alternative rejected
because…" note — the guard against over-design AND the record of why the standard path
wasn't taken, if it wasn't.

## Architecture conformance (grounded / ARB-governed engagements only)
Only when the intent carries a `## Grounding` link (a requirement ID / approved-architecture
reference; a `Persona:` pointer isn't one) **or** the engagement carries inherited architecture ADRs (adopted at ingest,
`Source: scopezilla-inherited`). State how this approach CONFORMS to the approved architecture
and the inherited premises — or, where it deviates, say so plainly and route it to the Trusted
Guide / ARB for ratification. A deviation is not forbidden; a SILENT deviation is. Cite the
grounded requirement/architecture and the specific premise (`0004`) you're conforming to (or
departing from). When a deviation stands, this design must have authored the `BLD-NNNN`
superseding ADR (Step 6b) — reference it here. Omit this section entirely in a commercial
engagement with no grounding and no inherited ADRs.

## Neighboring & future scope
How this approach accommodates what's ALREADY built (reuse it, stay consistent) and
what will build ON this later (the downstream cone + epic siblings from Step 2) — the
relationship/object choices that leave room for future intents, and any place a future
intent needs a shape this build would preclude (flagged, not silently cornered).

**Existing org (brownfield):** what already exists in the customer org / repo metadata
that this intent lands on — and the disposition for each (reuse / extend / collision →
Q-design-x / genuinely-different). Note `⚠ org not consulted` if no source was reachable.
Flag anything present in the org but NOT in the repo (untracked).

## Build sequence (when ordering isn't the default cascade)
_Include only when the build order is non-obvious or a step must deploy on its own — a
near-circular dependency, a data migration wedged mid-build, a separate deploy. Omit when the
order is the standard cascade (Step 5 covers why). A short ordered list; tie any separate deploy
to_ `launchpad/deploy-runbook.md`_._

## Open design questions
- Q-design-1: <anything the Trusted Guide must settle before the build starts>
```

## Step 1 — Resolve the intent and confirm it's ready

Take the intent id (e.g. `INT-001`). Load it and confirm it exists:

```bash
node launchpad/scripts/intent-ledger.mjs hash INT-001   # confirms it exists; prints its id, scope hash and title
```

Read the full intent from `intents/INT-NNN/intent.md` — `build_target`, `guardrails`, `out_of_scope`, `acceptance`, and especially `## Dependencies`. If `/ql-vet-intent` hasn't been run, invoke it first (or follow its steps where skills can't chain): **don't design against an intent that isn't ready** — a ⛔ Not-ready finding means the *what* is still in flux, and designing the *how* on top of it is wasted. If the id doesn't match, stop and list intents (`node launchpad/scripts/intent-ledger.mjs hash`).

## Step 2 — Load the neighborhood: what's built, what will build on this

As the **master builder**, you know the neighborhood before you pour a foundation. This is the step that keeps a design from **painting future scope into a corner** — the failure the per-intent loop otherwise invites, because designing one intent in isolation is blind to the intent three phases out that hangs an object off the one you're modeling now. Before you choose a single object or relationship, load the intent's neighborhood:

```bash
node .claude/skills/ql-check-scope/scope-digest.mjs --neighbors INT-NNN \
  || node .agents/skills/ql-check-scope/scope-digest.mjs --neighbors INT-NNN \
  || node "${CLAUDE_PLUGIN_ROOT}/skills/ql-check-scope/scope-digest.mjs" --neighbors INT-NNN
```

(The generator is vendored with `/ql-check-scope` into the harness's skills dir — `.claude/skills/` or `.agents/skills/` — so the chain tries both, then falls back to the plugin for a plugin-only checkout.)

It prints a compact, focused digest — not the whole intent set — of three things:

- **BUILT ON** — the upstream intents this one depends on, tagged with delivery status. A ✅ Delivered upstream is a shape you must **build consistent with and reuse**, not reinvent — the same object, the same permission set, the same automation entry point where it fits.
- **BUILDS ON THIS** — the downstream forward cone: future intents that (transitively) depend on this one. This is the core of forward-looking design. Read each one's build target and ask: *does my data model / relationship / sharing choice leave room for it?* A lookup where a later intent needs a master-detail roll-up, a per-record flag where a later intent needs a related object — decide it now, with the future intent in view, not at the PR where that intent finally lands.
- **EPIC SIBLINGS** — intents in the same epic with no declared dependency. The honest proxy for "probably touches the same objects" that the dependency graph can't see — scan them for shared objects/fields you should design for once.

The neighbors digest also prints this intent's **GROUNDING** (its approved requirement/architecture link) when the engagement is grounded, and its `Persona:` pointers on their own as **PERSONAS**. In a regulated / ARB-governed engagement, that grounded architecture is the standard your approach must conform to — read it before you choose the data model, and fill the design's **`## Architecture conformance`** section against it (conform, or flag the deviation for ARB ratification — never build silently past the approved design).

**Other engagements in this repo.** When the intent or your drafted `## Data model` names custom metadata (`Tier__c`) and the repo holds more than one engagement, run `node launchpad/scripts/intent-ledger.mjs brief INT-NNN` and read its **Other engagements in this repo** section: the other engagements' decisions, intents and designs that mention the same metadata. A hit that shapes this design is a cross-engagement dependency: once `node launchpad/scripts/intent-ledger.mjs api --at-least 2` passes, record it in the intent's `## Dependencies` → Internal as `<slug>/INT-NNN` via `/ql-refine-intent` (an older engine reads that as this engagement's own id, so otherwise name it in the design and say `/ql-resync` is needed), and design consistent with it.

**Load the decisions that bear on it** (skip if `/ql-start-intent` already printed them this session):

```bash
node launchpad/scripts/intent-ledger.mjs decisions INT-NNN
```

**Binding** records (standing premises, and records the intent cites) constrain the design; **pending** rulings are earlier agent calls awaiting review, and **ratified** rulings are how-calls the Trusted Guide accepted — design consistent with both or say why not; **history** is already reflected in the intent. If the design must contradict a binding record, raise it as an open question for the Trusted Guide, or, to stray from an inherited premise, declare the deviation (Step 6b); never design past it silently.

**Read the inherited architecture premises, too (decisions/0009).** Beyond per-intent grounding, a grounded engagement carries **standing architecture premises** the whole build must honor — the ADRs adopted at ingest (`Source: scopezilla-inherited`, in `launchpad/decisions/architecture/` or the engagement's `decisions/architecture/`; `node launchpad/scripts/intent-ledger.mjs decisions INT-NNN` lists them as standing premises): single-org, LWR-over-Aura, reuse-over-per-program-customization, PII-residency, and the like. **This is the detector for a *silent* deviation** — the dangerous case the `conformance` report can't see, because it only audits deviations that were already declared. So before you settle the approach, read every inherited premise this intent's build could touch and judge honestly: does the approach conform? If it strays — you're forced to (an agent-tooling gap, a platform limit) or you're choosing to after weighing it — **push back first** (is there a conforming approach? say so and prefer it). If the stray still stands, it is a **deviation**, and a deviation must be *declared*, never silent: author the `BLD-NNNN` superseding ADR in Step 6b and reference it in `## Architecture conformance`. Skip it when `decisions INT-00x` lists no standing premises (the common case).

**Read the whole picture: `launchpad/data-model.md` and the engagement's `solution.md`.** The data model holds the org's objects this repo's work has built and how they relate. The solution overview holds what this engagement delivers and the process flows that cross intents. Read the sections this intent's objects and flows touch before choosing an approach, and design consistent with them: an object the model credits to another intent is reused or extended, never created twice, and a flow step another intent owns keeps its shape unless the design says why. A design that has to change either is fine; Step 4 edits it in the same change. Neither file yet is the common case early on.

Fold what you learn into the design's **Data model / Sharing / Automation** sections, and — critically — where a future intent needs a shape this build would **preclude**, say so explicitly in **`## Neighboring & future scope`** and (if it forces a real trade-off) raise it as a `Q-design-x`. Flagging a corner is in-scope; silently picking an approach that boxes in INT-011 is exactly the trust-chain erosion this step exists to prevent. You are **not** building the future intents now (that's scope creep — `/ql-check-scope` still governs); you're *designing so they remain buildable*. **Done when** that section has a line for every BUILT ON, BUILDS ON THIS, and EPIC SIBLING intent the digest printed.

### PRESENT IN ORG — what already exists that this intent lands on (brownfield)

**Be relentless about what's already there:** for every object, field, and automation this intent names or this design proposes, search the repo, then the org, before choosing the data model. The digest above knows *our* scope — it is blind to the **customer's existing org**. Most engagements are brownfield: the org (and often this repo's metadata) already holds objects, fields, automation, and sharing config this intent lands on top of. Designing against a blank slate is how a design reinvents a field that exists, or proposes a Flow that collides with an existing trigger — caught only when it fails in the sandbox. So before you choose the data model, **consult what's already there** (ADR `decisions/0005`). Two sources, cheapest-and-always-available first — this is questions-first, not a fixed command; prefer the build toolkit's skills and fall back to the `sf` CLI floor shown here:

1. **Local repo metadata first** (always available, no org auth) — search `force-app/**` (per `sfdx-project.json`) for the objects/fields/automation this intent names. A plain file search; the repo is the source of truth for metadata. With a tied Scopezilla source, also read its head-start prototype briefs (AGENTS.md, brownfield).
2. **Live org query second** (when an org is reachable) — what's actually *deployed*. What to find out, not how:
   - *Does this object/field already exist?* — `sf sobject describe --sobject <Object> --json` (read `.fields[].name`), `sf org list metadata --metadata-type CustomObject`.
   - *Existing automation on this object I'd collide with?* — tooling API: `sf data query --use-tooling-api -q "SELECT DeveloperName FROM FlowDefinition"`, likewise `ApexTrigger` (filter `TableEnumOrId`), `ValidationRule`.
   - *The shape of what exists*, when reuse is on the table — describe/retrieve the specific component.
3. **Neither reachable?** Record **`⚠ org not consulted`** in the design and flag it for a human-confirm — never guess that something doesn't exist.

**The saved org inventory, `launchpad/org-inventory.md`.** Before the live query, read the entry for each object this intent touches. Reuse an entry, saying how old it is, unless it records no org or a different org than the one you'd query, or older than the last commit that changed any metadata in the package directories (`git log -1 --format=%cs -- <each packageDirectories path in sfdx-project.json>`), since a Flow or trigger on the object lives outside its folder; then query again. After a query, write what you found back to it: one `## <Object>` section per object with its key fields and types and the existing automation on it (Flows, triggers, validation rules), stamped `As of YYYY-MM-DD, org <18-character org id>` (`sf org display --json` → `result.id`; an alias only means something on one machine). Metadata only, never record data. Create the file on first use, headed with one line saying it's a saved snapshot of the org's metadata that the next design re-checks. Entries are drafts accepted in the PR that adds them.

**Hand the reading to a subagent.** In a large org the describes and tooling results run to tens of KB per object and matter only until the dispositions are set, so where your harness has subagents, give the reading to one read-only subagent; otherwise run it here. First decide here what to look for: every object, field and automation to check, and which objects still need a live query after any inventory check. The subagent gets that list, the `packageDirectories` paths, the target org alias and any tied prototype-brief path. It returns facts only, per item: its **repo** presence and its **org** presence, each `found` (with the file path or component name, plus the shape a disposition turns on: a field's type, an automation's type and trigger, a relationship's kind, an object's sharing model), `not found`, `couldn't search` (with why) or `uncertain`; for each object it queried, the key fields with types and the automation on it; and the org id the inventory stamp needs, with the query date. Whatever the subagent couldn't reach, try here before recording it. The delta, the dispositions, `⚠ org not consulted` and the inventory write stay in this session, and `couldn't search` or `uncertain` counts as unknown, never as absent.

**The org-vs-repo delta is its own signal.** Something present in the *org* but not the *repo* is **untracked** — a bigger flag than plain existence (you'd build against something source control doesn't know about). Call it out distinctly; it leans toward stop-and-surface.

**Then apply the dispositions — grill posture, human decides.** You present what you found *with a recommendation*; the Trusted Guide decides. Weight the ceremony by how hard the mistake is to reverse:

- **Stop-and-route** (proceeding creates something hard to undo):
  - **Collision / conflict** (an existing trigger, an OWD that fights the sharing plan, a wrong-type field you'd migrate data off later) → raise a `Q-design-x`; the human settles it before build.
  - **Structural duplicate** (the thing exists but this intent would create a *differently-shaped* dupe — a second field where one should be extended, a lookup where the existing is master-detail) → record "extend existing, not create" in this design. Route to `/ql-refine-intent` only when the intent itself names the duplicate (in its build target or a committed guardrail). Shipping the duplicate *is* the irreversible mistake.
  - **Untracked-in-org** (the delta above) → leans here; warrants a human look.
- **Note-and-proceed** (a recorded trace is enough): **clean-match reuse** (exists in exactly the shape the intent wants — build *on* it, record one line) and **genuinely different** (same name, different purpose — note *why*, proceed).
- **When unsure which side of the line you're on, treat it as hard-to-reverse and stop.** A false stop costs ~30 seconds; a false proceed ships the duplicate/collision. Bias toward surfacing.

Fold the findings and their dispositions into **`## Neighboring & future scope`** (§ below), and surface the stop-and-route ones to the Trusted Guide as `Q-design-x` / a `/ql-refine-intent` route. **Done when** every metadata item the intent names or the design proposes has one disposition (or the design records `⚠ org not consulted`).

## Step 3 — Ground platform decisions in authoritative docs

Before you settle the approach, read the **Salesforce build traps** section for every area the design touches (deploys, roles and record types, Flow XML, Apex tests, Experience Cloud), and name each trap that applies in *Alternatives considered* or *Open design questions*: `.claude/skills/ql-design-intent/salesforce-traps.md`, or `.agents/skills/ql-design-intent/salesforce-traps.md` on other harnesses, or `${CLAUDE_PLUGIN_ROOT}/skills/ql-design-intent/salesforce-traps.md` on a plugin-only checkout. This org's own traps are in `launchpad/build-notes.md`, and the build brief carries them.

**Every platform claim in the design is grounded or marked.** A platform claim is any statement about Salesforce behavior the design relies on: what a flow type can call, what a sharing setting or permission grants, what a relationship type allows, what a feature needs enabled, a governor limit, a metadata shape. Ground each one, usually in official Salesforce documentation (the **`salesforce-docs`** MCP if wired: `list` to pick the doc collection, `search` it to find the page, `fetch` to read the body; else `developer.salesforce.com` / `help.salesforce.com` / `architect.salesforce.com`), and cite inline exactly the source you used, one you read in this session, as `[<kind>:<pointer>]` precise enough for someone else to re-read it: `[docs:<url>]` for a page you fetched and read (only a URL a docs tool returned), `[kb:<entry>]`, `[trap:<name>]` from `salesforce-traps.md`, `[build-note:<heading>]` from `launchpad/build-notes.md`, `[spike:<what ran → result>]`. Those are the common kinds, not a closed list: a source that fits none of them gets its own plain kind label. A claim you can't ground carries `⚠ unverified`; give it a `Q-design-x` in *Open design questions* when the approach turns on it. This holds for claims that feel certain too: those are the ones a design gets wrong, and a ratified wrong claim fails at build.

**Reach order:** a curated architecture KB first, when your session has one (it grounds the *approach*: patterns, anti-patterns, when-not-to); then the docs MCP for a *capability or limit* fact; then the public doc sites. A missing KB or MCP never blocks the design. When reading can't settle a runtime fork, spike it in a throwaway scratch org and never commit its metadata. How to search, scope to the engagement's clouds, read before citing, and spike: `.claude/skills/ql-design-intent/docs-grounding.md`, or `.agents/skills/ql-design-intent/docs-grounding.md` on other harnesses, or `${CLAUDE_PLUGIN_ROOT}/skills/ql-design-intent/docs-grounding.md` on a plugin-only checkout.

**Stop once the right kind of source settles the claim** (the docs for a capability or limit, the KB for an approach), and move to the next one; search further only for a distinct risk the source left open. Cite a page you already fetched and read this session rather than fetching it again.

## Step 4 — Draft the design

Write `intents/INT-NNN/design.md` (the intent's directory already exists), then stamp the **current** scope hash into its frontmatter:

```bash
node launchpad/scripts/intent-ledger.mjs stamp INT-NNN --in design    # writes scope_hash:
```

The stamp ties the design to the version of the intent it was drawn for — like the test script. If the intent's scope later moves, the design (and its proof plan) should be revisited; the stamp makes that checkable. A revisit updates the sections the change touches, then stamps (`/ql-refine-intent` Step 4). A design is a companion file: once its proof plan exists, any edit to its body flips the plan to 🔄 in `coverage` until `/ql-test-script` refreshes and re-stamps it, and `deliver` refuses a design edited since it was ratified, so re-ratify after a revisit. Set `authored:` to today.

Fill each section from what the intent actually supports. Be concrete and Salesforce-specific — name the objects, the relationship types, the permission sets, the automation tool. Where the intent is silent on something the design needs, write an **`## Open design questions`** `Q-design-x` rather than inventing a requirement — an honest gap beats a fabricated one, exactly as in the intent itself. **Standard-first**: if you're proposing custom (Apex, a custom object where a standard one fits), the "Alternatives considered" section must say why the standard path doesn't work.

**A system with no entry yet in `launchpad/systems.md`.** Draft one in the same change: a `## <slug>` section (kebab-case, like a persona slug) with the system's pattern (platform event / callout / named credential / middleware), direction, trigger, objects exchanged, error handling and monitoring, plus the Named Credential, endpoint host and auth type when known. Never a credential, token, key, or a URL carrying one. Create the file on first use, headed with one line saying it describes the org's external systems and never holds a secret. Entries are drafts accepted in the PR that adds them; an existing entry this design changes is edited in place.

**Update the data model and the solution overview in the same change**, on the intent's feature branch (on any other branch, leave them to the build branch and say so). When the design creates or changes an object or a relationship, edit `launchpad/data-model.md`; when it adds or changes a step in a flow that crosses intents, edit that flow in `launchpad/engagements/<slug>/solution.md`. Create either file on first use, drafting the overview from the current intents and their designs when the engagement has none yet. The format, and why the data model describes only what's merged: `.claude/skills/ql-design-intent/solution-docs.md`, or `.agents/skills/ql-design-intent/solution-docs.md` on other harnesses, or `${CLAUDE_PLUGIN_ROOT}/skills/ql-design-intent/solution-docs.md` on a plugin-only checkout. Both are accepted in the PR that changes them.

**Plan each component's native `description`.** When the design adds or changes a custom field, object, permission set or flow, give it a one-to-two sentence `description` for the admin reading it in Setup: what it's for, in plain words, plus the intent id (`Tracks whether the assessor has consented. INT-012.`). The rationale stays in this design and the decision records; the intent id points there.

## Step 5 — Surface cascading consequences (and sequence them when the order isn't obvious)

This section earns its place. A Salesforce design that lists a new object/field but ignores what it takes to *use* it isn't a design — it's a half-plan that ships an unusable increment. For every object and field the design creates, give each ripple item a disposition — in the design, deferred to the PR, or n/a with why: FLS on the right permission sets, the app slot, the page, layout or related list each persona reaches it through, list views, permission-set access, the tests new Flows/Apex imply. **Done when** no created component lacks one. The bar is a *usable* increment (AGENTS.md → Cascading consequences).

**Name who gets access, and where they reach it.** For each new field, object or page, name the personas (`launchpad/personas/<slug>.md`) who get it, through which permission set, and the Lightning record page, page layout or related list each one opens it from. A list view lists records but shows no record's children: a child object a persona reaches from its parent needs a related list on the parent's page. When the intent doesn't say, raise a `Q-design-x` instead of choosing. When the design gives a persona a new permission set, say so in the design, and once the Trusted Guide ratifies it, update that persona's access line in its file: the file owns access, and every engagement builds from it.

**The ripple includes org configuration the design *assumes*, not just metadata it creates.** A standard-object build often depends on org-level setup that isn't anyone's build target and isn't in the metadata deploy — a Default Case Owner, an Org-Wide Email Address, Business Hours, a queue, a case-assignment default. On a **greenfield org these do not exist yet**, so the increment deploys clean and still doesn't work: the real failure mode this catches. Ask, for this design: *what must already be true about the org for this to behave?* Name each precondition, whether it exists in the target org (check, don't assume), and route it to `launchpad/deploy-runbook.md` — the ordered list a fresh org is stood up from. Catching it here is the point; the runbook is otherwise filled *reactively* from each PR's §4, which means the first person to discover a missing prerequisite is whoever is debugging it.

Don't work from a remembered list of a cloud's prerequisites. Which setup a given feature requires is a **platform fact** that changes by release — ground it in Salesforce documentation (Step 3) rather than reciting a checklist. If a precondition is genuinely someone else's decision (who *should* own unassigned cases?), it's a `Q-design-x`, not a guess.

**When the build order isn't obvious, sequence it into `## Build sequence`.** The standard cascade — object/fields before their FLS, FLS before the app/page/layout/list-view that surfaces them, those before the automation and its tests, config and data last — is a given; don't spend a section restating it. Reach for the section when the ordering is genuinely non-obvious or a step must deploy on its own: a data migration wedged mid-build, a near-circular dependency, anything that ties to `launchpad/deploy-runbook.md`. Then a short ordered list earns its place; a rote copy of the default cascade is boilerplate the reader already knows.

## Step 6 — Present for ratification, then hand off

**Check the citations in a reader that never saw your reasoning.** Give it the design and nothing else. For each citation, it re-reads the source (re-fetching a `[docs:]` page from whichever docs source the session has) and reports whether it supports the claim as written, or that it couldn't reach the source. It also lists every platform claim that carries no citation and no `⚠ unverified`, rationale and *Alternatives considered* included. Each claim whose source doesn't support it becomes `⚠ unverified`; one it couldn't reach is reported as unchecked. Prefer a fresh-context subagent (in Claude Code, the `Explore` agent); if the harness can't, use a fresh session, then an isolated re-read last, and say which form you used. **Done when** every platform claim is cited or `⚠ unverified`, and you present the design with the counts (grounded / unchecked / unverified).

Show the design to the Trusted Guide and let them ratify or redirect — **the approach is theirs to approve.** List each relationship choice, the standard-vs-custom call, and the sharing model as its own line for ratification. Then:

- **Record the material architecture calls in `decisions/`.** In AI-native delivery terms an architecture choice *is* a Decision — so when a ratified design makes a real one (the relationship model, the sharing approach, standard-vs-custom, the integration pattern), write it to `decisions/YYYY-MM-DD-<slug>.md`: the `design.md` is the working *approach*, the decision file is the *why this over the alternatives* that belongs in the engagement's permanent record. Don't let `design.md` become a parallel architecture log that competes with `decisions/` — the design proposes, the decision records the ratified call. (A genuinely routine design that settles nothing notable — wiring an obvious field — needs no decision file; the bar is "a call future-you would want to look up," same as any other decision.)
- **If a `Q-design-x` blocks the build**, it's an action item for the human, not something to guess past.
- **Hand off to `/ql-test-script`** — now that the approach is agreed, the proof plan is drafted against a real design (which tests, against which objects, which manual scenes for which UI surfaces). A design ratified, then proven: that's the sequence.

## Step 6b — Declare a deviation from an inherited premise (only when one stands)

Fires **only** when Step 2 found this approach must deviate from an inherited architecture premise (an adopted ADR, `Source: scopezilla-inherited`) and, after you pushed back, the Trusted Guide accepts the stray. A deviation that stands must be **declared**, so the `conformance` report can prove it later got an ARB signature — a silent one is the single forbidden case. Author a **build-authored architecture ADR** — this is a first-class `launchpad/decisions/architecture/` record, distinct from the routine `decisions/YYYY-MM-DD-*.md` build note in Step 6:

```markdown
# BLD-NNNN — <the deviating premise, in our words>
**Date:** YYYY-MM-DD · **Source:** build-authored · **Supersedes:** 0004 · **Deviation:** pending-ARB
## Context      — why we're forced to / choosing to deviate; the pushback that happened first
## Decision     — the standing rule we're adopting instead, in our words
## Consequences — what this cascades into; what reverting it would cost
## Grounds      — the inherited premise (0004) it departs from, and the reason it can't be met as written
```

- **Numbering:** `BLD-NNNN`, the next free number **in the `BLD-` sequence**, from `node launchpad/scripts/intent-ledger.mjs next-id bld` (one sequence across the org's and the engagement's architecture records). Inherited ADRs keep Scopezilla's `00XX` numbers; the `BLD-` prefix is a separate namespace so the two can never collide across re-ingests.
- **`Supersedes:`** names the **live** inherited ADR id(s) this departs from — this is the edge the `conformance` report reads. (A premise SZ already retired during scoping — `Status: superseded-by-NNNN` — is historical, not standing; there's nothing to deviate from, so don't supersede it.) **Do not edit the inherited ADR** (it was adopted once, with an `Adopted-from:` line, and is the engagement's record of the premise; a deviation supersedes it rather than rewriting it). The link is one-directional, from the `BLD-` ADR only.
- **`Deviation: pending-ARB`** is the open state. The ARB sign-off is an **accountability act that stays human** — you draft the record pre-filled `pending-ARB`; when the ARB signs, a human flips it by hand to `accepted-by-ARB (YYYY-MM-DD, <who>)`. There is no skill for the flip, by design. Tell the Trusted Guide plainly: "this deviation needs ARB sign-off — flip the `Deviation:` line to `accepted-by-ARB` with the date once they approve."
- Reference the `BLD-NNNN` id from the design's `## Architecture conformance` section.

## What this does NOT do

- It does **not** build the intent or write metadata. It proposes the approach; the build is yours from there, against the ratified design.
- It does **not** edit the intent (`intents/INT-NNN/intent.md`). If designing reveals the *what* is wrong or a dependency is undeclared, route to `/ql-refine-intent` — design proposes *how*, it doesn't redefine scope.
- It does **not** ratify its own design. The approach is the Trusted Guide's to approve, like Intent itself — you draft and present, they sign off.
- It does **not** replace the PR review. It moves architecture review *earlier* (before code); the PR still validates the built result against the design and the proof plan.
- It is **not** mandatory. An intent that creates no object, changes no existing sharing or FLS, and adds no integration or Apex skips it (a new field with its own FLS doesn't need one).
