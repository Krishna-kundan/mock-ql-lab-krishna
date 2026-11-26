# INT-001 build rulings

**Date:** 2026-11-26 · **Deciders:** agent rulings, pending Trusted Guide review in PR §6 · **Intents:** INT-001

routing: recommended sf-pi, picked claude-code, override, Trusted Guide chose to build in this Claude Code session
brief: ptsf-lab/INT-001 scope=4a7cc08387e3 proof=25be1786126c design=4bd2f82a8da2 decisions=cd04a58ca365 sources=ptsf-lab-2026@144731f83592 agent=claude-code recommended=sf-pi

## Rulings

- `launchpad/data-model.md` created on this branch with all eight INT-001 objects, ahead of the metadata — the design left the shared-file edits to the build branch, and the file describes what merges to `develop` with this PR — if the build PR is cut back, the file must be trimmed to match before merge.
- Record names: Treatment Type keeps a text Name; Subsidy Application, Assessment, Medical History, Medical History Access and Practitioner Treatment use auto-numbers (`SA-`, `AS-`, `MH-`, `MHA-`, `PT-` + 7 digits) — transactions and audit rows have no natural name; approved by the Trusted Guide before build — the display format can be changed later without data loss.
- Required patient lookups (application → patient, medical history → patient) and access row → medical history use *Don't allow deletion* — a required lookup can't clear on parent delete, and the audit row must outlive nothing it references — a patient or history can't be deleted while a child row points at it.
- Office and region picklists hold values on each field, not a global value set — Q-design-3 is provisional, and either path to an Office record is a migration — moving to a global value set later is a metadata change.
- Field sizes: Approved Amount Currency(16,2); Details Long Text Area 32,768; Patient Reference and Code Text(50) — the design named types, not sizes — widening Text later is safe; shrinking isn't.
- `PTSF_Data_Model_Admin` grants Contact Read — the platform refuses Read on Practitioner Treatment without Read on its Contact master (deploy error "Permission Read Practitioner_Treatment__c depends on permission(s): Read Contact"); approved by the Trusted Guide 2026-11-26 — it widens the set beyond the design's object list by one read-only standard object.
- The person-account record type lives at `objects/PersonAccount/recordTypes/PersonAccount.recordType-meta.xml` — that is where the retrieve places it; the `Account.PersonAccount` name isn't found — the C24 repo assertion's object list must include `PersonAccount` (a folder, not a new object).
- The placeholder Subsidy Rate record is labelled `Placeholder 1 (placeholder rate)`, rate 0 — the Trusted Guide asked for a labelled placeholder; custom metadata labels cap at 40 characters — INT-020 replaces it.
- Grant Access Using Hierarchies is cleared by a manual runbook step, not metadata — the CustomObject metadata type has no field for it; approved by the Trusted Guide 2026-11-26 — until the step runs, C15's hierarchy half fails in that org.
- INT-001 test classes insert their setup data and read structure in system mode (`insert as system`, `WITH SYSTEM_MODE`); the privacy reads under test stay `WITH USER_MODE` — from API 67.0 Apex runs in user mode by default, and the test admin's profile holds no field access on the new fields (first run: 6 of 8 failed with "fields being inaccessible") [docs:https://developer.salesforce.com/docs/platform/apex-dev/references/apex-dev/apex-classes-enforce-usermode.html] — the sharing proofs still run as the real non-owner user.
- The two junction related-list columns were set in Setup by the Trusted Guide, then retrieved: Contact layout → `Treatment_Type__c.NAME`; Treatment Type layout → `OBJECT_ID` (the Practitioner master, a Contact) — no field-name form deployed from source; only those two lines are taken from the retrieve, and the rest of the org's copy (button order, Custom Links section, summary layout) is left out — `build-notes.md` records the naming.
