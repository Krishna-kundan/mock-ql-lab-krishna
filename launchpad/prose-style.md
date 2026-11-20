# Prose style — write like a person, not a model

The writing standard for this engagement. Two things live here and behave differently:

- **Quality floor — consistent everywhere.** The AI-tells and concision rules below apply to *all* output: conversation with the Trusted Guide, intent statements, decision records, PR bodies, design docs, test scripts. Bad writing is bad in every register.
- **Register — dialed by audience.** Warmth, formality, and humor shift with who's reading. That split is deliberate; don't collapse it.

Any skill that writes prose reads this file and sweeps its draft against it **before** presenting — on the first draft, not as a cleanup pass.

## Kill the AI tells (everywhere)

These read as machine-written. Cut them as you write:

- **Negative parallelism** — "not just X, but Y" / "it's not about A, it's about B". The single strongest tell. State the positive claim directly: "Y."
- **Rule of three** — reflexive three-item lists ("fast, reliable, and scalable"). Use the number of items the point actually needs; often one.
- **Empty confidence** — "It's important to note", "It's worth mentioning", "Certainly", "Clearly". Delete the preamble and make the claim.
- **Robotic transitions** — "Moving forward", "As previously mentioned", "In today's landscape". Cut, or use a plain connector.
- **Em-dash overuse** — an em dash on every other line is a tell. Prefer a colon, a period, or a spaced hyphen; keep em dashes rare.
- **Redundant intensifiers** — "truly", "fully", "completely", "highly", "very", "really". The unmodified word is stronger.
- **Vague attribution** — "studies show", "best practice says", "it is widely known". Name the source or drop the claim.
- **Symmetry for its own sake** — matched clause pairs and echoing sentence shapes. Vary sentence length and structure so prose doesn't lope.

## Concision

Every sentence earns its place. If one sentence carries the point, don't write three. Answer directly and stop — no acknowledgment preambles, no trailing "let me know if…" unless a decision is genuinely the reader's. Prefer active voice and the concrete noun over the abstraction. (This is the companion to "Signal before detail" and "Be precise, not verbose" in `AGENTS.md` — the same discipline, applied to how each sentence reads.)

## The intent statements specifically

Intent statements are the highest-value application of this standard — they're what the build is measured against, and they're read by the agent building, the human ratifying, and often the customer. So they carry the quality floor *plus* one rule of their own: **write the intent as the plain-English outcome and the concrete build target, nothing more.** No sales framing, no restating the same guardrail three ways, no rationale the builder doesn't need to act. A precise intent is agent-executable; a padded one buries the scope. (Refinement *compresses* — see the compression note under `/ql-refine-intent`.)

The rules for writing one, whether you're drafting it or editing it:

- **What, not how.** The build target says what the increment lets a user or system do ("Reps can't see other reps' accounts"), not the platform mechanics that do it ("Private org-wide default with role hierarchy"). Keep the business's names and values: the customer's name for a record or field, picklist values, thresholds. Leave out mechanics (an API name, a field type, a relationship, Flow vs. trigger, a component) unless they're committed:
  - **Committed** means the customer said it, Scopezilla pre-decided it, or a dated record decided outside the build (the customer or an ARB) says it. Write it as a Guardrail and cite where it came from; when you can't name the source, ask, never mark it committed on a guess. If an inherited ADR or the intent's `## Grounding` already commits it, leave it out (*Cite, don't restate*).
  - **Not committed** is anything from our side, however settled it sounds: the agent, our architect or developer on a call, a design record, a `BLD-` deviation still pending the ARB. When it comes with a reason, write the reason instead: "a picklist so the reasons stay consistent" becomes "Agents choose the close reason from a fixed list". The mechanic itself goes in `design.md`, or becomes a build ruling when there's no design (stop and ask when it needs a person's call).
  - Answered open questions follow the same split.
- **Cite, don't restate.** When the intent builds on an earlier intent or decision, name it (`INT-012`, `decisions/2026-09-01-<slug>.md`) and write only what's new. A dated decision record that binds this build gets one Guardrails line, `- <the rule in a few words> (decisions/<file>.md)`, and its rules stay in the record; Acceptance still names any value a tester will check. Cite the record itself, not only the intent that cited it: a dated record binds only the intents that cite it. (Standing premises bind every intent already, so leave them uncited, except a `BLD-` deviation the earlier intent declared: it binds only the intents that name or cite it.) The builder follows the pointer, and `node launchpad/scripts/intent-ledger.mjs decisions INT-NNN` prints what the intent cites.
- **Outcome opens with who and why.** Its first paragraph is one sentence a business reader can check: "As a <the person who gets the value>, I want <what changes for them>, so that <why it matters>", or, when no person uses it directly (an integration, a migration, a batch job, a bundle of fixes), "When this ships, <the business effect>". Name the person by the persona or the input's role ("a claims adjuster"), never "a user" or "the system". Two people at most; a third means the intent wants splitting. It's unhashed context, not scope: it restates what the intent delivers and never adds to it.
- **Acceptance leads with the short list.** Open `## Acceptance` with a short list of bullets (rarely more than seven), each one observable outcome a product owner can check ("An adjuster on an open claim sees each coverage's limit without leaving the page"). Branches, edge cases, volumes and Given/When/Then grids go under a `### Detail` heading after them; a small intent needs none. Both parts are hashed and proven. A Detail line only sharpens a bullet or a guardrail; an obligation nothing above it states is a new bullet, not a Detail line.
- **One home per constraint.** Say each constraint once, in the section that owns it: who may do what goes in Guardrails, what isn't built goes in Out of scope, what done looks like goes in Acceptance.
- **Guardrails state the rule that holds.** Write "Only Tier 2 agents can return a case", not "Agents outside Tier 2 must not return cases". The builder and the test script build to the rule; the forbidden case is just the test of it.
- **One name per thing.** Call each object, role and screen by one name throughout, the customer's term where the repo already has one. A "ticket" in the input is the repo's "Case" if that's what it means.

## Register by audience

Same quality floor, different warmth:

- **Conversation with the Trusted Guide** — plain-spoken, direct, warm; a light dry touch of humor is welcome. Contractions natural. Never undercut credibility, never hedge with "you might want to consider…" — recommend, flag the risk, say what you'd do.
- **Build artifacts** (intent statements, decision records, PR bodies, design docs, test scripts) — precise and all-business. No humor, no first-person warmth. State the scope, the decision, the evidence; give context only where it's load-bearing.
- **Client-facing** (a capability map walked through with a Product Owner, anything a customer reads) — business-formal, and **strip internal vocabulary**: `INT-NNN` ids, "the ledger", "scope hash", "the persona", phase/epic shorthand. Write it the way you'd say it to the customer, not the way the repo names it.

Internal delivery vocabulary never appears in anything a client reads, and stays out of chat where a plain word works.

**Flagged word — "sign" / "sign-off".** Fine *internally* for the human accountability act: the human owns the merge (the accountable act), the QA pro signs a criterion. But in **client-facing** copy it must never imply the work is "safe to sign" or otherwise offer a guarantee — say **validate** or **defensible** instead. _Avoid_ (client-facing): "safe to sign", "sign-off guarantees it works", "signed and certified".

### Status symbols → plain phrases (client-facing)

The test-script / PR proof symbols and defect statuses are internal shorthand. When a status reaches a customer — a capability map walked through with a Product Owner, a Jira/Confluence projection, a demo readout — render the plain phrase, never the raw symbol or the code-y status. This is the one canonical mapping; the projection skills (`/ql-sync-jira`, `/ql-capability-map`) render *from* it rather than each inventing its own words.

| Internal | Say to the customer |
|---|---|
| ✅ / 👁 · defect `verified` | Verified |
| 🔁 · defect `fixed` | Fix in, awaiting retest |
| ⛔ · defect `open` / `needs-info` | Blocked |
| ⚠️ | Partially verified |
| 📋 · defect `deferred` | Accepted — no change planned |
| defect `not-a-defect` | Working as designed |

Keep the customer's eye on outcome and state, not the machinery: "This is verified" / "We've accepted this as-is for now," not "INT-014-C3 is 📋."
