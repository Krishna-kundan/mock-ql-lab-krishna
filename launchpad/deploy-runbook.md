# Deployment runbook — standing up this engagement on a fresh org

The ordered, **deployment-relevant** steps to bring a clean sandbox to a working state: the metadata
deploy, plus the org configuration the deployed code depends on but that **cannot ride the metadata
deploy** (Setup toggles, Setup-data records, scheduled jobs).

**Scope — what's in / out.** This is a *deployment* runbook, not demo setup. Keep **out** anything
the code runs correctly without: sample-data seeding, demo-persona/user wiring, geo backfills. Those
make a populated demo but aren't required for the system to function — link them from the phase
READMEs instead. Keep **in** only steps a fresh org genuinely needs to make the deployed code behave.

**How this is maintained.** Each delivering PR records its own non-deployable steps in the PR
template's **§4 "Done manually / outside this diff"** table — that's the per-change capture. This
runbook is the **consolidated, ordered** home those steps roll up into. When a PR's §4 adds a step
that is deployment-relevant (not demo data), add it here in dependency order and cross-link the PR.

**When you add a step, keep it executable.** This is a list someone hands to an admin (or agent) and
runs top to bottom, so:
- One step is a **line item or table row** — never a heading. Headings mark the ordered *sections*
  below (features → deploy → Setup-data → jobs), not individual steps.
- Order by **execution sequence, not by intent.** Tag the intent id on the line (`(INT-042)`) as a
  datapoint; don't section the runbook intent-by-intent.
- Keep it to **the action** (and at most a one-line `Verify:`). The *why* — classification rationale,
  KA references — stays in the per-intent `intents/INT-00x/deployment-plan.md`; link it, don't inline it.
- Write each step in **plain language a customer admin can follow** — a clear imperative action, no
  undecoded internal shorthand (KA numbers, control-framework jargon). Same readability bar as an
  intent statement, so a human and an agent both read it the same way.
- **Dedup before adding** — if the step (or an equivalent) is already here, don't add it again.

**Add preconditions when you *design*, not only when a PR trips over them.** §4 rollup is
retrospective — it captures what someone already hit. A **greenfield** org additionally needs the
standard-cloud setup the build *assumes* but no intent names: a Default Case Owner, an Org-Wide Email
Address, Business Hours, a queue, assignment defaults. Nothing deploys these and no intent owns them,
so on a fresh org the metadata lands clean and the increment still doesn't work. `/ql-design-intent`
asks what must already be true about the org for a design to behave and routes the answers here —
add them as they're identified, ahead of the build, rather than after the first person debugs one.
Which setup a given feature actually requires is a platform fact that moves by release: confirm it
against Salesforce documentation instead of working from a remembered checklist.

Legend: 🔁 reversible · ⛔ irreversible · ▶️ anon Apex · ⚙️ Setup UI · 📦 metadata deploy

---

## Go-live gate

Prerequisites that must be true **before this engagement goes live** — and that **no single
intent's deployment plan owns**: a production URL/endpoint to swap in, an external approval, a
credential/token rotation, a DNS or firewall change, a customer sign-off. Nothing deploys these and
no test proves them, so clearing them is the Trusted Guide's call at go-live — this list just makes
sure none of them goes dark.

**Capture a prerequisite the moment you find one** — mid-build, mid-QA, wherever it surfaces. Add a
line here rather than trusting it to a runbook step buried below or a Jira ticket the repo can't see.
One checkbox per prerequisite; check it off when it's cleared. (`👤` go-live gates that
`/ql-generate-deployment-plan` finds per intent roll up here too.)

- [ ] PTSF has bought a Full sandbox licence for UAT and performance testing. Not yet declared in the intent's dependencies (known gap, `decisions/2026-11-25-INT-009-build-rulings.md`). (INT-009)
- [ ] PTSF has bought Backup and Recover, and the objects, files and retention are agreed (Q-design-5). (INT-009)
- [ ] The `SFDX_URL` secret on the `Production` and `Production-Validate` GitHub Environments is re-issued against PTSF production. Until then it points at the lab stand-in org. (INT-009)
- [ ] How the customer's release approval is captured is settled, and the approver has the GitHub access it needs (Q-design-3). (INT-009)
- [ ] The deployment user is named, and it and the backup-restore admins are in the break-glass monitoring (Q-design-6, INT-003). (INT-009)
- [ ] No repo-level `SFDX_URL` secret remains; every GitHub Environment has its own, and `Production` has its required reviewer. (INT-009)

Surface what's still open at any time (advisory — never blocks):

```bash
node launchpad/scripts/intent-ledger.mjs golive
```

---

## Order of operations

### 0. ⚙️ Pipeline and environments — *once, before the first deploy*
Setup detail for each step: `.github/workflows/README.md` (CI, TEST) and `.github/workflows/PRODUCTION.md` (Production, credentials).

- 🔁 Enable GitHub Actions for the repo (Settings → Actions → General). (INT-009)
- 🔁 In production, create a Developer sandbox for development and a Developer Pro sandbox for integration test; create the Full sandbox for UAT once it's licensed. (INT-009)
- 🔁 Before any workflow runs, delete any repo-level `SFDX_URL` secret (Settings → Secrets and variables → Actions → Repository secrets). A job reads a repo-level secret when its environment has none, so a stage without its own secret logs in to whatever org the repo-level one points at. (INT-009)
- 🔁 Create every GitHub Environment by hand **before** any workflow that uses it runs. GitHub creates a missing environment the first time a job names it, with no protection rules, so a first `prod_deploy.yml` run against a missing `Production` would deploy without a reviewer. Verify: Settings → Environments lists all four, and `Production` shows its required reviewer. (INT-009)
- 🔁 In GitHub, create the Environments `CI` (Developer Pro sandbox), `TEST` (Full sandbox), `Production` (with the Trusted Guide as required reviewer) and `Production-Validate` (no reviewer). Give each an `SFDX_URL` secret for its org; `Production` and `Production-Validate` both hold production's. (INT-009)
- 🔁 On `CI` and `TEST`, add the `EXTERNAL_CREDENTIAL_SECRETS` secret holding the values for every External Credential listed in `config/credentials.json`. (INT-009)

### 1. ⚙️ Org features / toggles — *before the metadata deploy where the model depends on them*
Features that must be enabled before metadata referencing them will deploy or behave (e.g. Person
Accounts, multi-currency, a cloud/feature license). Note ⛔ for irreversible enablements. Cross-link
the PR/phase that introduced each.
- ⛔ **Person Accounts**: turn on in every org (development, CI, TEST, UAT, production) before deploying any metadata that references person accounts. Irreversible: once on, it can't be turned off, and each person account uses more storage than a business account. Check installed packages for compatibility first. The enablement steps and prerequisites are confirmed at design time. (ptsf-lab/INT-001)

### 2. 📦 Deploy metadata
```bash
sf project deploy start -o <org-alias>
```
Deploys objects/fields, Apex, Flows, permission sets, layouts, apps, etc. When deploying a subset,
deploy **classes/fields before Flows** that reference them — `rollbackOnError` is whole-transaction
and will silently un-deploy a class if a co-bundled Flow fails (`build-notes.md`).

- ⚙️ **Turn off hierarchy access on the medical-history objects**, right after the first deploy that creates them. Setup → Sharing Settings → Organization-Wide Defaults → Edit → clear **Grant Access Using Hierarchies** for **Medical History** and **Medical History Access** → Save. Needs the Manage Sharing permission. The CustomObject metadata type has no field for this setting, so the deploy can't set it [docs:https://help.salesforce.com/s/articleView?id=platform.security_controlling_access_using_hierarchies.htm&release=264.0.0&type=5]. Verify: both rows show the box cleared (INT-001-C15). Until it's cleared, a manager inherits access to history that a user below them holds (ADR 0001). (ptsf-lab/INT-001)

### 3. ⚙️ Create Setup-data records the code reads
Records that are **not** deployable metadata. Pattern: the deployed Apex falls back to a hardcoded
default when each is absent, so the system runs without them but with default behavior. List each:
what it is, the field(s), the fallback, and the exact Setup location.

- **🔁 Business Hours** *(if any SLA/timer intent uses `BusinessHours.add()`)* — Setup → Company
  Settings → Business Hours. Define the working window; **leave non-working days BLANK** (a day saved
  as `00:00–00:00` reads as *open 24h*, not closed). Verify with
  `BusinessHours.isWithin(id, <a non-working day>)` → must be `false`. Business Hours are **not**
  Apex-insertable or deployable — Setup UI only.
- **🔁 Named credentials / external service config** *(if integrations are live)* — per the
  integration's decision file.
- **🔁 External Credential secrets in sandboxes** — never typed into the org. Run
  `credentials_reestablish.yml` for the sandbox's environment; it writes each credential in
  `config/credentials.json` from the environment's `EXTERNAL_CREDENTIAL_SECRETS`. (INT-009)

### 4. ⚙️ Enable features used by routing/automation *(when the consuming intent ships)*
e.g. Omni-Channel for queue routing, Email Deliverability, Experience Cloud. Queues/objects deploy;
the feature toggle + runtime config are Setup.

### 5. ▶️ Schedule operational jobs
Scheduled-Apex / cron jobs the runtime needs (e.g. an SLA-scan job). Note that schedule-*triggered*
Flows can't run sub-daily — sub-daily cadence lives in a `Schedulable` Apex run once via anon Apex.
Give the exact command and how to reverse it (`System.abortJob`).
```bash
sf apex run --file scripts/apex/<schedule-job>.apex -o <org-alias>
```

- 🔁 Turn on Backup and Recover daily backups in production for the agreed objects and files, once licensed (Q-design-5). (INT-009)

### After every sandbox refresh — *in this order, before anyone is given access*
1. 🔁 Activate the refreshed sandbox (Setup → Sandboxes in production). (INT-009)
2. 🔁 Log in to it with the sf CLI, run `sf org auth show-sfdx-auth-url`, and paste the URL into that environment's `SFDX_URL` secret. A refresh invalidates the old one. (INT-009)
3. 🔁 Run `credentials_reestablish.yml` from the Actions tab for that environment. Verify: the run log shows `Re-established` for each listed credential. (INT-009)
4. ⛔ Mask sensitive data before anyone is given access (INT-026). Until INT-026 ships, keep access closed; whether Full sandbox refreshes wait for it is Q-design-2. (INT-009)

### Production release — *only on an explicit instruction*
- 📦 Merge the `release/*` → `main` PR once its `main_pr-validation` check is green and the customer has signed off on the release. Nothing deploys on the merge. (INT-009)
- 📦 Run `prod_deploy.yml` from the Actions tab on `main`. It waits for the Trusted Guide's approval on the `Production` environment, then deploys all of `main`. (INT-009)

---

## Quick checklist (fresh org)

- [ ] 0. Sandboxes and GitHub Environments (`CI`, `TEST`, `Production`, `Production-Validate`) with their secrets
- [ ] 1. Org features / toggles enabled (mark ⛔ irreversible ones)
- [ ] 2. `sf project deploy start`
- [ ] 3. Setup-data records created (Business Hours with **non-working days blank**; CMDT records if non-default)
- [ ] 4. Routing/automation features enabled (when their intents ship)
- [ ] 5. Scheduled jobs installed
- [ ] After a sandbox refresh: activate → re-issue `SFDX_URL` → `credentials_reestablish.yml` → masking before access
- [ ] _(optional, demo only)_ seed + persona-wiring scripts — see phase READMEs, **not** required for the code to run
