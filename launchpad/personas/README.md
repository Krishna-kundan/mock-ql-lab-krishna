# Personas — who uses this org

One file per persona: the people who log in and what they can reach. Personas describe the org, like its data model, so every engagement in the repo shares them. Read the persona before building anything that changes who sees or does what: a new field, object, page, permission set or sharing rule.

**The files are the list.** `<slug>.md`, where the slug is lowercase words joined by hyphens (`service-agent`, `portal-customer`). There's no index to keep in step; `node launchpad/scripts/intent-ledger.mjs conformance` prints the set.

## How an intent points at one

In the intent's `## Grounding`, one line per persona:

```
- Persona: service-agent
- Persona: supervisor
```

The pointer sits outside the scope hash, so adding or fixing one never trips re-verify. `conformance` flags a pointer with no matching file. What each persona may see or do still belongs in the intent's acceptance criteria; the pointer only says who the intent affects.

## A persona file

```markdown
# Service agent

**Slug:** service-agent
**Introduced by:** <engagement slug>

Who they are and what they do here, in a sentence or two.

## Access

- **Profile:** <profile>
- **Permission set group:** <group, or none>
- **Permission sets:** <sets, or none>
```

This file owns the persona's access. If the engagement uses Apex test-user classes, they mirror these names rather than define them.

## Where they come from

The agent drafts personas from the scope (the scoping source, notes, intent text), and a person on the team accepts them in the pull request that adds them. Access the agent wasn't given stays `to decide`: only the scoping source, a person on the team, or a design the Trusted Guide ratified names a profile, permission set group or permission set, because the build grants whatever this file says.

Renaming a slug is a governed change: fix every intent that points at the old one in the same pull request.
