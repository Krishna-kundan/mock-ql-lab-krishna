---
intent: INT-001
scope_hash: 4a7cc08387e3
authored: 2026-11-26
ratified: 2026-11-26 by Krishna Kundan @ 4bd2f82a8da2
---

# INT-001 — Design

**Intent:** Core subsidy data model built for tens of millions of patients
**Source intent:** `intents/INT-001/intent.md`

## Data model

Patients and practices reuse standard Account and Contact. Everything else is custom on the core platform (ADR 0002). Medical history and its grants are their own private objects (ADR 0001).

| Object | Standard / custom | One record is | Relationships, and why |
|---|---|---|---|
| Account (record type `PersonAccount`) | Standard, existing | A patient | Existing person-account record type, reused. |
| Account (record type `Business_Account`) | Standard, existing | A practice | Existing business record type, reused. |
| Contact | Standard, existing | A medical practitioner | Standard `AccountId` to the practice. |
| `Subsidy_Application__c` | Custom, new | One travel-subsidy request | **Lookup** (required) to the patient Account. A master-detail would make the application's access *Controlled by Parent* and drop its Owner field, so no queues and no sharing of its own. INT-019 routes applications to office queues, and INT-002 shares them per practitioner [docs:https://help.salesforce.com/s/articleView?id=platform.overview_of_custom_object_relationships.htm&release=264.0.0&type=5]. Lookups to `Treatment_Type__c` and to the assigned practitioner (Contact). |
| `Assessment__c` | Custom, new | One practitioner's assessment of an application | **Master-detail** to `Subsidy_Application__c`: whoever can see the application sees all its assessments, which is INT-002's "practitioners see all assessments on applications they are assigned to", with no sharing code and no Owner to skew [docs:https://help.salesforce.com/s/articleView?id=platform.overview_of_custom_object_relationships.htm&release=264.0.0&type=5]. Lookup to the assigned practitioner (Contact). `Parent_Assessment__c` is a **self-lookup**, because a self-relationship can only be a lookup [docs:https://help.salesforce.com/s/articleView?id=platform.relationships_considerations.htm&release=264.0.0&type=5]. No roll-up summaries, so a later conversion to lookup stays open (Q-design-2). |
| `Medical_History__c` | Custom, new | A patient's medical history | **Lookup** (required) to the patient Account, never master-detail. A detail-side object has no share object of its own [docs:https://developer.salesforce.com/docs/platform/apex-dev/references/apex-dev/apex-bulk-sharing-creating-with-apex.html], which would make INT-002's record-by-record grants impossible and would expose history to anyone who can see the patient. |
| `Medical_History_Access__c` | Custom, new | One time-bound grant | Lookups to `Medical_History__c`, the patient Account, `Assessment__c` and the grantee User. Lookup, not master-detail, so the audit row survives and is secured separately from the history it audits. Delete of a referenced Medical History is restricted ("Don't allow deletion") [docs:https://help.salesforce.com/s/articleView?id=platform.relationships_considerations.htm&release=264.0.0&type=5]. |
| `Treatment_Type__c` | Custom, new | One catalog entry (500+) | A record (not custom metadata) because applications and the junction look it up. `Code__c` is a unique External ID for the catalog load. |
| `Practitioner_Treatment__c` | Custom, new (junction) | A practitioner registered for a treatment type | **Master-detail** to Contact (primary) and to `Treatment_Type__c`. Access follows both parents [docs:https://help.salesforce.com/s/articleView?id=platform.relationships_considerations.htm&release=264.0.0&type=5]. Whether Contact can be the master of a custom junction is ⚠ unverified; confirm at build with the first deploy, and fall back to two required lookups if it can't be. |
| `Subsidy_Rate__mdt` | Custom metadata type, new | A rate for one transport type and distance band | Admins add and edit records in Setup → Custom Metadata Types → Manage Records, with Customize Application and no deployment [docs:https://help.salesforce.com/s/articleView?id=platform.custommetadatatypes_ui_populate.htm&release=264.0.0&type=5]. |

**Key fields** (each gets a Setup `description` naming INT-001):

- `Subsidy_Application__c`: `Patient__c`, `Treatment_Type__c`, `Reason__c`, `Status__c`, `Insurance_Check_Result__c`, `Approved_Amount__c` (Currency), `Assigned_Practitioner__c` (Contact), `Satellite_Office__c`, `Region__c`.
- `Assessment__c`: `Subsidy_Application__c`, `Assigned_Practitioner__c` (Contact), `Status__c`, `Assigned_Date__c` (Date/Time, so INT-015 and INT-018 can count from it), `Parent_Assessment__c`.
- `Medical_History__c`: `Patient__c`, `Details__c` (Long Text Area, interim until INT-012 names the content, Q-design-4).
- `Medical_History_Access__c`: `Medical_History__c`, `Patient__c`, `Assessment__c`, `Granted_To__c` (User), `Granted_At__c`, `Revoked_At__c` (Date/Time).
- `Treatment_Type__c`: Name, `Code__c` (Text, External ID, unique), `Active__c`.
- `Subsidy_Rate__mdt`: `Transport_Type__c`, `Distance_Band__c`, `Rate__c` (Number).
- Patient (person account): `Patient_Reference__c` (Text, External ID, unique), the indexed key for patient search and later migration matching (Q-design-5).

**Placeholder values (Q-075).** `Reason__c`, both `Status__c` fields, `Insurance_Check_Result__c`, `Transport_Type__c` and `Distance_Band__c` are restricted picklists holding `Placeholder 1`–`Placeholder 3`. The lifecycle intents replace them, never append, per `decisions/2026-11-26-int-001-refinement.md`. `Satellite_Office__c` and `Region__c` wait on Q-design-3.

**Selective access (allocation and patient search).** The platform indexes lookup and master-detail foreign keys, Name, Contact Email and External ID fields. A custom index on any other field needs Salesforce Support or a Metadata API custom-index deployment [docs:https://developer.salesforce.com/docs/platform/salesforce-large-data-volumes-bp/guide/ldv-deployments-infrastructure-indexes.html]. So:

- **Allocation** (INT-014) is event-driven per application, read by Id. Its candidate filter is `Practitioner_Treatment__c WHERE Treatment_Type__c = :id`, an indexed foreign key.
- **Patient search** filters on `Patient_Reference__c` (External ID), Name, or person-account email. That the person-account email uses the Contact Email index is ⚠ unverified; the Query Plan check settles it.
- **Acceptance check:** on the seeded sandbox, the Query Plan for these filters reports an index plan. A custom index uses its index only while the filter matches under 10% of the first million rows; a standard index, under 30% [docs:https://developer.salesforce.com/docs/platform/salesforce-large-data-volumes-bp/guide/ldv-deployments-infrastructure-indexes.html]. How the plan is read (Developer Console Query Plan, or the REST `explain` parameter) is ⚠ unverified and gets fixed in the test script.

## Sharing & security

| Object | Internal default | External default | Grant Access Using Hierarchies |
|---|---|---|---|
| `Subsidy_Application__c` | Private | Private | On |
| `Assessment__c` | Controlled by Parent | Controlled by Parent | n/a |
| `Medical_History__c` | Private | Private | **Off**, so a manager never inherits a practitioner's or owner's access (ADR 0001) |
| `Medical_History_Access__c` | Private | Private | Off |
| `Treatment_Type__c` | Public Read Only | Private (INT-012 opens patient read) | On |
| `Practitioner_Treatment__c` | Controlled by Parent | Controlled by Parent | n/a |

Hierarchy access can be turned off only for custom objects that aren't Controlled by Parent, and internal and external defaults must match when either is Controlled by Parent [docs:https://help.salesforce.com/s/articleView?id=platform.admin_sharing.htm&release=264.0.0&type=5]. Apex managed sharing (INT-002) needs the object's default below Public Read/Write [docs:https://developer.salesforce.com/docs/platform/apex-dev/references/apex-dev/apex-bulk-sharing-creating-with-apex.html]; Private meets that. INT-001 adds no sharing reason, rule or grant: those are INT-002's.

**Who gets access, and where they reach it.** Q-049 is open, so these permission sets are proposed for ratification. Once ratified, they go on the `platform-admin` persona's access line.

| Permission set | Grants | Persona |
|---|---|---|
| `PTSF_Data_Model_Admin` | CRUD + FLS on Subsidy Application, Assessment, Treatment Type, Practitioner Treatment, and `Patient_Reference__c`; tab visibility; the app. No View All / Modify All. | platform-admin |
| `PTSF_Medical_History_Break_Glass` | Read + FLS on Medical History and Medical History Access, plus their tabs. Assigned only under the ADR 0001 break-glass exception; INT-003 adds the monitoring. | platform-admin, on governed assignment |

| Acceptance step | Where the platform owner reaches it |
|---|---|
| Patient → application → two assessments | Person Account page: *Subsidy Applications* related list → application page: *Assessments* related list showing `Parent_Assessment__c` |
| Treatment Type catalog | *Treatment Types* tab, `All` list view |
| Practice → practitioners → treatment types | Business Account page: *Contacts* related list → Contact page: *Practitioner Treatments* related list |
| Patient's Medical History and its Access row | *Medical Histories* tab (list view filtered by patient) → Medical History page: *Medical History Access* related list. **No Medical History related list on the Person Account page**, so INT-003's "absent from internal related lists" isn't cornered. |
| Subsidy Rate change | Setup → Custom Metadata Types → Subsidy Rate → Manage Records |
| Privacy denial | A test user on a standard profile with `PTSF_Data_Model_Admin`'s object Read, but no ownership or share, gets *insufficient privileges* |

## Automation approach

None. INT-001 is schema, security and UI only: no Flow, no trigger, no Apex service. The considered alternative, an owner-assignment trigger for ownership spread, is in *Alternatives* and Q-design-1. Allocation, grants and lifecycle automation belong to INT-014, INT-002 and the lifecycle intents. The privacy and structure criteria are proven by Apex tests that create no production automation, plus org-probes, drafted in `/ql-test-script`.

## Integration

None. INT-001 declares no external dependency, and none is needed.

## Alternatives considered

- **Health Cloud patient and clinical objects.** Rejected by ADR 0002, and the guardrail forbids them. The org's standard `Assessment` object (Industries) is not used: same label, different product.
- **Subsidy Application master-detail to the patient.** Rejected: it removes the Owner field, so no queues for INT-019 and no sharing of its own for INT-002.
- **Assessment as a lookup with its own sharing.** Kept in reserve for Q-design-2. Master-detail is simpler and matches INT-002's build target today. A master-detail with no roll-ups can be converted to a lookup later [docs:https://help.salesforce.com/s/articleView?id=platform.relationships_considerations.htm&release=264.0.0&type=5].
- **Medical History master-detail to the patient.** Rejected: no share object for record-by-record grants, and patient visibility would open history.
- **Treatment Type as custom metadata.** Rejected: applications and the junction need to look records up. That a custom-object lookup can't target a custom metadata record is ⚠ unverified, but the catalog is also business data with its own owner (Q-002), which belongs in records.
- **Subsidy Rate as a custom object or custom setting.** Custom metadata wins: Setup-editable without deployment, and its records move between orgs with the metadata.
- **Owner-assignment automation in INT-001.** Not proposed (Q-design-1). Spreading 38M patients under 10,000 records per owner [docs:https://developer.salesforce.com/docs/platform/draes/guide/draes-group-membership-data-skew.html] needs about 3,800 owning users, and every creation path (INT-004, INT-012, INT-025) sets the owner, not INT-001.

**Traps that apply:**
- [trap:A new custom object has no nav entry until its tab ships and is visible] — tabs ship with tab visibility in both permission sets.
- [trap:Page layouts must mark universally required fields Required] — every new layout.
- [trap:From API 67.0, Apex DML enforces record-type availability for the running user] — tests insert person and business accounts inside `System.runAs` with a user granted both record types.
- [trap:rollbackOnError is whole-transaction] — deploy and re-verify what persisted.

## Architecture conformance

- **ADR 0001 (medical history in org, governed):** conforms. Medical History is its own Private object with hierarchy access off, outside the patient and the application. Admin access is a separate break-glass permission set, and the monitoring is INT-003's. No sharing rule or criteria-based access is created.
- **ADR 0002 (core platform, no industry cloud):** conforms. Standard Account/Contact, custom objects, custom metadata. No Health Cloud, Nonprofit Cloud or OmniStudio objects; the org's Industries `Assessment` object is deliberately not used.
- **Kickoff commitments** (`decisions/2026-11-18-engagement-kickoff.md`): patients are person accounts; practitioners are contacts under practices; Subsidy Application is custom, not Case; one global model, with no per-office variant.

No deviation, so no `BLD-` ADR.

## Neighboring & future scope

**Built on:** nothing. INT-001 has no internal dependencies.

**Builds on this:**

| Intent | How this design leaves room |
|---|---|
| INT-002 grants | Medical History is Private with its own share object; Assessments follow the application, so one application share covers them. Access rows carry patient, assessment, grantee and both timestamps. |
| INT-003 lockdown | Medical History is kept off the Person Account page and out of `PTSF_Data_Model_Admin`. Break-glass is a separate permission set for INT-003 to monitor. |
| INT-004 / INT-005 portals | Patients are person accounts; practitioners are contacts under a business account. Portal user creation needs the account owner to hold a role (⚠ unverified), which shapes Q-design-1. |
| INT-007 / INT-013 insurance | `Insurance_Check_Result__c` placeholder field on the application. |
| INT-008 geocoding | Addresses are standard Account address fields; nothing custom added. |
| INT-010 / INT-011 onboarding | Nothing here precludes onboarding fields on the person account. |
| INT-012 application capture | Treatment Type is searchable by Name; external read is opened there. Medical history writes to `Medical_History__c`, never the application. |
| INT-014 allocation | Indexed junction filter; application read by Id; no Omni-Channel dependency. |
| INT-015 reassignment | `Assigned_Practitioner__c` on Assessment is editable; Date/Time assigned stamp. |
| INT-016 work list | Assessments visible through the application; no shape conflict. |
| INT-017 specialist | `Parent_Assessment__c` self-lookup on the same application. |
| INT-018 escalation / INT-019 queues | Application keeps its Owner, so office queues work. Office and region shape is Q-design-3. |
| INT-020 rate guidance / INT-021 approval | `Subsidy_Rate__mdt` holds the rates; `Approved_Amount__c` holds the final figure. INT-020 adds the suggestion and difference fields. |
| INT-022 / INT-023 chat, help | No dependency on these objects. |
| INT-024 / INT-025 migration | External IDs (`Patient_Reference__c`, `Code__c`) support parent-first upsert loads. Owner on loaded rows is Q-design-1. Lookup locking on a heavily referenced Treatment Type during bulk loads is ⚠ unverified; INT-025 should plan batch ordering. |

**Epic siblings:** none.

**Existing org (brownfield).** Consulted on 2026-11-26. Repo: `force-app/` holds no metadata. Org: `ql-lab`, org id `00Dbm000017clCfEAI`, API 68.0, through `sf` tooling and data queries. Snapshot in `launchpad/org-inventory.md`.

| What this intent touches | Already present? | Repo / org | Disposition |
|---|---|---|---|
| Person Accounts enabled | Yes. `SELECT IsPersonAccount, COUNT(Id) n FROM Account GROUP BY IsPersonAccount` → `true` 30, `false` 52 (2026-11-26) | Org (feature, not metadata) | Reused. Matches deploy-runbook §1. |
| Account record type `PersonAccount` (person) | Yes, active | Untracked-in-org | Reused for patients. A second person record type, `SDO_PersonAccounts`, is demo data: genuinely different, not used. Retrieve `PersonAccount` into the repo at build. |
| Account record type `Business_Account` | Yes, active | Untracked-in-org | Reused for practices. Retrieve at build. |
| Account / Contact sharing | Internal Public Read/Write, external Private, on both | Org | Not changed by INT-001 (Q-design-6). |
| Account / Contact custom fields | 88 on Account, 53 on Contact (demo and package fields); none named for patients, practices or practitioners | Org | Net-new `Patient_Reference__c`; no reuse candidate. |
| Account / Contact triggers | `SDO_Tool_SalesforceRewind_Account`, `pi.LogAccountChange`, `SDO_Tool_SalesforceRewind_Contact`, `pi.LogContactChange`, all active | Untracked-in-org | Genuinely different (demo and Pardot). They fire on bulk loads in this org; noted for INT-025 rehearsals. |
| Account / Contact Flows and validation rules | None active | Org | No collision. |
| Subsidy Application, Assessment, Medical History, Medical History Access, Treatment Type, Practitioner Treatment | No custom object by these names (custom object scan and name scan) | Neither | Net-new. |
| Standard `Assessment` object (Industries) | Yes | Org (standard) | Genuinely different. Not used (ADR 0002). The label clash is the Q-design-7 ratification line. |
| Subsidy Rate custom metadata | No; the only rate-like type is `B2B_SPC_Tax_Rates__mdt` | Org | Net-new. |
| Ownership skew today | Top Account owner holds 55 records | Org | No skew present. |
| Installed packages | 50, including FSL, Pardot and Marketing Cloud | Org | Person Accounts already on, so no compatibility check is needed here. Production still runs the runbook §1 check. |
| Person Account page layout | Not retrieved | Untracked-in-org | Retrieve, then extend (add *Subsidy Applications* related list). Not overwritten blind. |

## Build sequence

The standard cascade, with two org-first steps:

1. Confirm in the target org that the `Business_Account` and `PersonAccount` record types exist and are available to the System Administrator profile [docs:https://help.salesforce.com/s/articleView?id=commerce.commerce_enable_person_accounts.htm&release=264.0.0&type=5]. In `ql-lab` they do. Runbook §1.
2. Retrieve the Person Account and Contact layouts before editing them.
3. Objects and fields → permission sets and tabs → app, layouts and list views → custom metadata records → tests.

## Open design questions

- **Q-design-1 (blocks the ownership build-target line only):** Spreading ownership below the 10,000-per-owner skew line [docs:https://developer.salesforce.com/docs/platform/draes/guide/draes-group-membership-data-skew.html] at 38M patients needs about 3,800 owning users. **Recommendation:** INT-001 builds no assignment automation. The interim scheme, pending Q-074: records are owned by a small pool of owner users in a dedicated top-level role, never moved, and kept out of public groups used by sharing rules. This is the documented mitigation when ownership must concentrate [docs:https://developer.salesforce.com/docs/platform/draes/guide/draes-group-membership-data-skew.html]. Each creation intent sets the owner from that pool. That doesn't meet "no single owner holds enough to cause skew" as written, so route the outcome wording to `/ql-refine-intent` (mitigate skew, rather than avoid it). The Trusted Guide decides.
- **Q-design-2 (non-blocking, ties to Q-005):** Assessment is master-detail, so anyone who sees the application sees every assessment on it. If Q-005 answers "no", Assessment converts to a lookup with its own grants. That conversion stays open because INT-001 adds no roll-ups.
- **Q-design-3 (non-blocking for INT-001, needed before INT-014/018/019):** Satellite office and region as restricted picklists from global value sets, or as an Office record that can also hold its team manager and queue? Picklist → lookup later is a data migration. **Recommendation:** decide before build. INT-001 builds the picklists with `Placeholder 1`–`3` unless you choose the record.
- **Q-design-4 (non-blocking):** Is Medical History one record per patient or one per entry, and which fields does it hold? INT-001 builds a one-to-many lookup with a single `Details__c` until INT-012 settles it.
- **Q-design-5 (non-blocking):** Which fields does patient search filter on? INT-001 indexes `Patient_Reference__c` (External ID) and relies on Name and email. A date-of-birth filter would need a custom index, created by Salesforce Support or a Metadata API deployment [docs:https://developer.salesforce.com/docs/platform/salesforce-large-data-volumes-bp/guide/ldv-deployments-infrastructure-indexes.html].
- **Q-design-6 (non-blocking for INT-001):** Account (patient) internal sharing is Public Read/Write in this org, so every internal user sees every patient. Making Account Private requires Contact to be Private or Controlled by Parent [docs:https://help.salesforce.com/s/articleView?id=platform.admin_sharing.htm&release=264.0.0&type=5], and a person account is shared as a whole account [docs:https://help.salesforce.com/s/articleView?id=sales.security_sharing_b2c_contact_sharing.htm&release=264.0.0&type=5]. INT-001's privacy outcome covers applications, assessments and history, not the patient. Which intent owns patient-record privacy?
- **Q-design-7 (ratification line):** Keep the label "Assessment" (`Assessment__c`) next to the org's standard Industries `Assessment` object, or label it "Subsidy Assessment"? **Recommendation:** keep "Assessment", as the intent names it.
