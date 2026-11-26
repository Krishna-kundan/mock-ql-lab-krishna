---
intent: INT-001
phase: 1
proof_hash: 25be1786126c
authored: 2026-11-26
design_hash: 4bd2f82a8da2
---

# INT-001 — Test script

**Intent:** Core subsidy data model built for tens of millions of patients
**Phase:** 1 · **Source intent:** `intents/INT-001/intent.md` · **Design:** `intents/INT-001/design.md` (ratified)
**Rests on:** `decisions/2026-11-26-int-001-data-model.md` (Q-design-1, 3 and 6 provisional), `decisions/2026-11-26-int-001-refinement.md`

## Criteria

> `Type`: ✅ automated · 👁 manual · 🔁 awaiting retest · ⚠️ partial · ⛔ blocked · 📋 accepted gap.
> ✅ rows name an Apex test (`Class.method`), an `org-probe` (see § Org assertions), or a repo
> assertion (a file check anyone can re-run; it reads as unconfirmed in CI and rests on PR review).
> The privacy tests run as a **non-owner test user**: a Standard User profile with
> `PTSF_Data_Model_Admin`, who owns none of the test records and has no share on them. It stands in
> for any internal user given object access, the case the privacy outcome is about.

| ID | Criterion (source) | How proven | Type | Sign-off |
|----|--------------------|------------|------|----------|
| INT-001-C1 | platform-admin: a patient person account holds a Subsidy Application for 'Cardiac surgery — specialist centre' with two Assessments, one the specialist child of the other (acceptance: "sees a Subsidy Application … with two Assessments beneath it"; build target: Assessment "one or more per Subsidy Application … parent assessment") | `INT001_DataModelTest.applicationWithParentAndChildAssessment` | ✅ | (CI) |
| INT-001-C2 | platform-admin: the same records are reachable on the patient page → application page → Assessments related list, with the parent shown (acceptance: "opens a test patient … sees"; design §Sharing, where each step is reached) | Scene A | 👁 | _pending_ |
| INT-001-C3 | platform-admin: the Treatment Type tab lists the catalog (acceptance: "opens the Treatment Type list and finds the catalog"; build target: "Treatment Type catalog (500+ entries)") | Scene B | 👁 | _pending_ |
| INT-001-C4 | platform-admin: a practitioner (contact) under a practice (business account) is registered for two treatment types through Practitioner Treatment (build target: "Practices are business accounts; Medical Practitioners are contacts"; "Practitioner Treatment junction") | `INT001_DataModelTest.practitionerRegisteredForTreatmentTypes` | ✅ | (CI) |
| INT-001-C5 | platform-admin: the practice page shows its practitioners, and each practitioner's page shows its treatment types (acceptance: "opens a practice account and sees its practitioners and the treatment types each is registered for") | Scene C | 👁 | _pending_ |
| INT-001-C6 | platform-admin: Medical History is a separate record looked up to the patient, and a Medical History Access row records the user given access, the patient, the assessment, granted at and revoked at (build target: "Medical History record … held separately"; "Medical History Access record: one row per time-bound grant") | `INT001_DataModelTest.medicalHistoryAccessRowRecordsGrant` | ✅ | (CI) |
| INT-001-C7 | platform-admin: the patient's Medical History opens on its own page with its Access row, and the patient page has no Medical History related list (acceptance: "opens the test patient's Medical History, held on its own record, and a Medical History Access row"; design §Sharing, no related list on the Person Account page) | Scene D | 👁 | _pending_ |
| INT-001-C8 | platform-admin: a Subsidy Rate for one transport type and distance band is changed in Setup, with no deployment (acceptance: "changes a Subsidy Rate … in Setup, with no deployment"; build target: "admin-maintained without code") | Scene E | 👁 | _pending_ |
| INT-001-C9 | non-owner: can't read the test Subsidy Application (acceptance: "A test user who neither owns nor has been given access … can't open them"; build target: "Only users given access can see") | `INT001_PrivacyTest.nonOwnerCannotReadApplication` | ✅ | (CI) |
| INT-001-C10 | non-owner: can't read the test application's Assessments (same acceptance clause; design §Sharing, Assessment Controlled by Parent) | `INT001_PrivacyTest.nonOwnerCannotReadAssessments` | ✅ | (CI) |
| INT-001-C11 | non-owner: can't read the test patient's Medical History, even with object Read granted by a permission set (same acceptance clause; guardrail: "Medical history lives in this org on its own object") | `INT001_PrivacyTest.nonOwnerCannotReadMedicalHistory` | ✅ | (CI) |
| INT-001-C12 | non-owner: opening the application, an assessment or the Medical History by record URL shows insufficient privileges (acceptance: "can't open them", the UI half of C9–C11) | Scene F | 👁 | _pending_ |
| INT-001-C13 | platform-admin: on a seeded org, the Query Plan's first plan for the allocation filter (Practitioner Treatment by treatment type) and the patient-search filter (patient reference) leads with `Index`, not `TableScan` (acceptance: "Query Plan reports the allocation and patient-search filters as selective"; Detail: "Seeded"; build target: "the fields they filter on are indexed") | Scene G | ⚠️ | Covered: the plan is read on a small seed. Open: `ql-lab` has no sandboxes, so this runs in the build org until one exists; the production-scale seed waits on Q-001. |
| INT-001-C14 | admin: the six custom objects and the custom metadata type exist with the ratified relationships: application → patient lookup; assessment → application master-detail; parent assessment self-lookup; medical history → patient lookup; access row lookups; junction master-detail to Contact and Treatment Type (guardrails: "Subsidy Application is a custom object, not Case"; "Medical history … on its own object"; design §Data model) | org-probe (see § Org assertions) | ✅ | (verify — green, 2026-11-26) |
| INT-001-C15 | admin: org-wide defaults are Private on Subsidy Application, Medical History and Medical History Access; Controlled by Parent on Assessment and Practitioner Treatment; Public Read Only internally on Treatment Type; and access through the role hierarchy is off on Medical History and Medical History Access (build target: "Only users given access can see"; design §Sharing table) | org-probe (see § Org assertions) | ✅ | ⚠ org not verified |
| INT-001-C16 | admin: the filter keys are indexed: `Patient_Reference__c` and `Treatment_Type__c.Code__c` are unique External IDs; the junction's Treatment Type link is a relationship field (build target: "the fields they filter on are indexed"; design §Selective access) | org-probe (see § Org assertions) | ✅ | (verify — green, 2026-11-26) |
| INT-001-C17 | admin: reason, both status fields, insurance-check result, transport type, distance band, satellite office and region are restricted picklists holding only `Placeholder 1`–`Placeholder 3` (out of scope: "Must not settle the business values … placeholder values"; decision Q-design-3 provisional) | `INT001_DataModelTest.lifecyclePicklistsHoldPlaceholdersOnly` | ✅ | (CI) |
| INT-001-C18 | admin: the patient and practice record types exist and are active (build target: "Patients are held as individual (person) accounts"; design §Build sequence step 1) | org-probe (see § Org assertions) | ✅ | (verify — green, 2026-11-26) |
| INT-001-C19 | admin: `PTSF_Data_Model_Admin` grants read and edit on the INT-001 fields of the four non-medical objects, plus their tabs (design §Sharing, permission sets; decision call 10, Q-049 for INT-001) | org-probe (see § Org assertions) | ✅ | (verify — green, 2026-11-26) |
| INT-001-C20 | admin: `PTSF_Data_Model_Admin` grants no access to Medical History or Medical History Access (guardrail: "Medical history lives in this org on its own object", ADR 0001; design §Sharing) | `INT001_PrivacyTest.dataModelAdminPermSetGrantsNoMedicalHistory` | ✅ | (CI) |
| INT-001-C21 | admin: `PTSF_Medical_History_Break_Glass` exists and grants read on Medical History and Medical History Access (design §Sharing, break-glass permission set; ADR 0001) | org-probe (see § Org assertions) | ✅ | (verify — green, 2026-11-26) |
| INT-001-C22 | admin: each new custom object has a tab, and the tabs are in the PTSF app (design §Sharing, where the platform owner reaches each record; cascading consequences) | org-probe (see § Org assertions) | ✅ | ⚠ org not verified |
| INT-001-C23 | admin: no Health Cloud, Nonprofit Cloud or OmniStudio object, and not the Industries `Assessment` object, is referenced in `force-app/` (guardrail: "Core platform only"; design §Architecture conformance) | Repo assertion R1 (see § Repo assertions) | ✅ | (PR review) |
| INT-001-C24 | admin: `force-app/` holds exactly one object per concept: no per-office or per-region variant, and no travel-booking or payment object (guardrail: "Do not create a per-office or per-region variant"; out of scope: "Must not model travel booking or payment") | Repo assertion: `ls force-app/main/default/objects/` lists only the six INT-001 objects, `Subsidy_Rate__mdt`, and the `Account` and `PersonAccount` folders, which hold only record types and the Patient Reference field | ✅ | (PR review) |
| INT-001-C25 | admin: INT-001 ships no sharing reason, sharing rule, Apex share code or grant automation (out of scope: "Must not build sharing grants for practitioners") | Repo assertion R2 (see § Repo assertions) | ✅ | (PR review) |
| INT-001-C26 | admin: INT-001 ships no transaction security policy, event-monitoring setup or field lockdown beyond the two permission sets (out of scope: "Must not build field-level lockdown or break-glass monitoring") | Repo assertion: `ls force-app/main/default/transactionSecurityPolicies/` returns nothing, and the PR diff adds no profile | ✅ | (PR review) |
| INT-001-C27 | patient records: no single owner holds enough patient records to cause ownership skew (build target: "No single owner holds enough patient records to cause ownership skew") | Not proven. The ratified owner-pool scheme (Q-design-1) only mitigates skew. | 📋 | accepted by Krishna Kundan — decisions/2026-11-26-int-001-data-model.md (ratified owner-pool scheme only mitigates skew; wording change deferred to a later /ql-refine-intent) |

### Deliberately not tested (out of scope)

- Loading TAMS data (INT-024, INT-025).
- Allocation at production volume (INT-014).
- Patient-record privacy on Account and Contact. No intent owns it yet (Q-design-6, provisional); Account internal sharing stays Public Read/Write in `ql-lab`.

## Automated proofs to write

> Tests create their own data. Accounts are inserted inside `System.runAs` as a user granted both
> the `PersonAccount` and `Business_Account` record types: from API 67.0, Apex DML enforces
> record-type availability for the running user.

**`INT001_DataModelTest`** (runs as an admin test user with both record types)

- **`applicationWithParentAndChildAssessment`**: insert a person account, a Treatment Type, a Subsidy Application named for 'Cardiac surgery — specialist centre', an Assessment, and a second Assessment whose `Parent_Assessment__c` is the first. Re-query through the patient: assert one application, two assessments, and that exactly one has the other as its parent.
- **`practitionerRegisteredForTreatmentTypes`**: insert a business account, a contact under it and two Treatment Types, then two Practitioner Treatment rows. Query from the account to its contacts to their junction rows: assert the contact belongs to the practice and has both treatment types.
- **`medicalHistoryAccessRowRecordsGrant`**: insert a patient, a Medical History for them, an application and an assessment, then an Access row naming a user, the patient, the assessment, `Granted_At__c` and `Revoked_At__c`. Assert all five fields read back, and that Medical History's patient link is a lookup (`Schema` describe: `isCascadeDelete() == false` and the field is not a master-detail).
- **`lifecyclePicklistsHoldPlaceholdersOnly`**: for each field named in C17, describe its picklist. Assert it is restricted and its active values are exactly `Placeholder 1`, `Placeholder 2`, `Placeholder 3`.

**`INT001_PrivacyTest`** (records owned by an admin test user; reads run as the non-owner test user)

- **`nonOwnerCannotReadApplication`**: as the non-owner, `SELECT Id FROM Subsidy_Application__c WHERE Id = :appId` in user mode returns 0 rows.
- **`nonOwnerCannotReadAssessments`**: as the non-owner, `SELECT Id FROM Assessment__c WHERE Subsidy_Application__c = :appId` in user mode returns 0 rows.
- **`nonOwnerCannotReadMedicalHistory`**: give the non-owner a test-only permission set with Read on `Medical_History__c`. In user mode, `SELECT Id FROM Medical_History__c WHERE Id = :mhId` returns 0 rows, and the same for the Access row. This proves the Private default, not the missing object permission, blocks it.
- **`dataModelAdminPermSetGrantsNoMedicalHistory`**: query `ObjectPermissions` for `PTSF_Data_Model_Admin` where `SobjectType` is `Medical_History__c` or `Medical_History_Access__c`. Assert no row grants Read, and that `FieldPermissions` for those objects returns 0 rows.

## Repo assertions

> Re-runnable file checks for the PR-review ✅ rows. Each must print nothing.

- **R1 (INT-001-C23):** `grep -rIlE 'HealthCloudGA__|npsp__|omnistudio__|<referenceTo>Assessment</referenceTo>' force-app/`
- **R2 (INT-001-C25):** `grep -rIlE '__Share|<sharingReasons>|<sharingCriteriaRules>|<sharingOwnerRules>' force-app/; ls force-app/main/default/sharingRules/ 2>/dev/null`

## Org assertions

> Run by `/ql-verify-build` against the build org before the PR. Predicates outside the standard set
> (`sharing-model`, `external-sharing-model`, `hierarchy-access`, `field-external-id`) read
> `EntityDefinition` and `FieldDefinition` (⚠ the verifier may not support them yet: if it doesn't,
> it reports them unverified, never as passed).

- **INT-001-C14** (objects and relationships):
  - `object-exists(Subsidy_Application__c)` · `object-exists(Assessment__c)` · `object-exists(Medical_History__c)` · `object-exists(Medical_History_Access__c)` · `object-exists(Treatment_Type__c)` · `object-exists(Practitioner_Treatment__c)` · `object-exists(Subsidy_Rate__mdt)`
  - `field-type(Subsidy_Application__c.Patient__c, Lookup)` · `field-required(Subsidy_Application__c.Patient__c)`
  - `field-type(Assessment__c.Subsidy_Application__c, MasterDetail)`
  - `field-type(Assessment__c.Parent_Assessment__c, Lookup)`
  - `field-type(Medical_History__c.Patient__c, Lookup)` · `field-required(Medical_History__c.Patient__c)`
  - `field-type(Medical_History_Access__c.Medical_History__c, Lookup)` · `field-type(Medical_History_Access__c.Assessment__c, Lookup)` · `field-type(Medical_History_Access__c.Granted_To__c, Lookup)`
  - `field-type(Practitioner_Treatment__c.Practitioner__c, MasterDetail)` · `field-type(Practitioner_Treatment__c.Treatment_Type__c, MasterDetail)` (if the build fell back to two lookups, the PR names that ruling and these read `Lookup` plus `field-required`)
  - `field-exists(Subsidy_Rate__mdt.Transport_Type__c)` · `field-exists(Subsidy_Rate__mdt.Distance_Band__c)` · `field-type(Subsidy_Rate__mdt.Rate__c, Number)`
- **INT-001-C15** (sharing defaults):
  - `sharing-model(Subsidy_Application__c, Private)` · `sharing-model(Medical_History__c, Private)` · `sharing-model(Medical_History_Access__c, Private)`
  - `sharing-model(Assessment__c, ControlledByParent)` · `sharing-model(Practitioner_Treatment__c, ControlledByParent)`
  - `sharing-model(Treatment_Type__c, Read)`
  - `external-sharing-model(Subsidy_Application__c, Private)` · `external-sharing-model(Medical_History__c, Private)` · `external-sharing-model(Medical_History_Access__c, Private)`
  - `hierarchy-access(Medical_History__c, false)` · `hierarchy-access(Medical_History_Access__c, false)`
- **INT-001-C16** (indexed filter keys):
  - `field-type(Account.Patient_Reference__c, Text)` · `field-external-id(Account.Patient_Reference__c)`
  - `field-external-id(Treatment_Type__c.Code__c)`
  - `field-type(Practitioner_Treatment__c.Treatment_Type__c, MasterDetail)`
- **INT-001-C18** (record types):
  - `record-type-exists(Account.PersonAccount)` · `record-type-exists(Account.Business_Account)`
- **INT-001-C19** (data-model admin permission set):
  - `permset-exists(PTSF_Data_Model_Admin)`
  - `fls(edit, Subsidy_Application__c.Status__c, permset=PTSF_Data_Model_Admin)` · `fls(edit, Subsidy_Application__c.Approved_Amount__c, permset=PTSF_Data_Model_Admin)` · `fls(edit, Subsidy_Application__c.Assigned_Practitioner__c, permset=PTSF_Data_Model_Admin)`
  - `fls(edit, Assessment__c.Status__c, permset=PTSF_Data_Model_Admin)` · `fls(edit, Assessment__c.Assigned_Practitioner__c, permset=PTSF_Data_Model_Admin)` · `fls(edit, Assessment__c.Parent_Assessment__c, permset=PTSF_Data_Model_Admin)`
  - `fls(edit, Treatment_Type__c.Code__c, permset=PTSF_Data_Model_Admin)` · `fls(edit, Account.Patient_Reference__c, permset=PTSF_Data_Model_Admin)`
- **INT-001-C21** (break-glass permission set):
  - `permset-exists(PTSF_Medical_History_Break_Glass)`
  - `fls(read, Medical_History__c.Details__c, permset=PTSF_Medical_History_Break_Glass)` · `fls(read, Medical_History_Access__c.Granted_At__c, permset=PTSF_Medical_History_Break_Glass)` · `fls(read, Medical_History_Access__c.Revoked_At__c, permset=PTSF_Medical_History_Break_Glass)`
- **INT-001-C22** (tabs and app):
  - `tab-exists(Subsidy_Application__c)` · `tab-exists(Assessment__c)` · `tab-exists(Medical_History__c)` · `tab-exists(Medical_History_Access__c)` · `tab-exists(Treatment_Type__c)` · `tab-exists(Practitioner_Treatment__c)`
  - `object-in-app(PTSF_Subsidy, Subsidy_Application__c)` · `object-in-app(PTSF_Subsidy, Treatment_Type__c)` · `object-in-app(PTSF_Subsidy, Medical_History__c)` (the app's API name is a build how-call; the build ruling records it and these predicates follow it)

## Manual validation scenes

> Run cold, in the build org, after the deploy. Open records by Classic URL (`/<record Id>`) and
> lists by `/<key prefix>/o`. Get each key prefix with
> `SELECT KeyPrefix FROM EntityDefinition WHERE QualifiedApiName = '<Object>'`.
> **Setup for A–F:** run the seed script the build provides (`scripts/apex/int001-seed.apex`). It
> creates the test patient, the 'Cardiac surgery — specialist centre' application with a parent
> and a child assessment, a practice with two practitioners and their treatment types, the
> patient's Medical History with one Access row (granted and revoked), and at least 10 Treatment
> Types. It prints each record Id.

### Scene A — Patient → application → assessments (persona: platform-admin; criterion C2)
1. Log in as a platform admin with `PTSF_Data_Model_Admin`.
2. Open the test patient at `/<patient Id>`.
3. In the **Subsidy Applications** related list, confirm one application for 'Cardiac surgery — specialist centre'. Open it.
4. In the **Assessments** related list, confirm two assessments. Confirm one shows the other in **Parent Assessment**.
**Expected:** the platform owner reaches both assessments from the patient in two clicks, and the specialist child is identifiable. **Sign-off:** _name / date / pass·fail_.

### Scene B — Treatment Type catalog (persona: platform-admin; criterion C3)
1. From the app navigation, open the **Treatment Types** tab.
2. Choose the `All` list view.
**Expected:** the seeded treatment types are listed with their names and codes. **Sign-off:** _name / date / pass·fail_.

### Scene C — Practice → practitioners → treatment types (persona: platform-admin; criterion C5)
1. Open the test practice at `/<practice Id>`.
2. In the **Contacts** related list, confirm both practitioners. Open the first.
3. In the **Practitioner Treatments** related list, confirm the treatment types it is registered for. Repeat for the second practitioner.
**Expected:** each practitioner's registrations are visible from the practice in two clicks. **Sign-off:** _name / date / pass·fail_.

### Scene D — Medical History on its own record (persona: platform-admin, break-glass; criterion C7)
1. Assign yourself `PTSF_Medical_History_Break_Glass` for this scene only, and remove it at the end. This is the governed ADR 0001 exception; record that you held it in the sign-off.
2. Open the test patient at `/<patient Id>`. Confirm the page has **no Medical History related list**.
3. Open the **Medical Histories** tab and find the test patient's record. Open it.
4. In the **Medical History Access** related list, open the row. Confirm it shows who was given access, the patient, the assessment, **Granted At** and **Revoked At**.
**Expected:** Medical History sits on its own record, reached from its own tab, and the Access row carries all five values. **Sign-off:** _name / date / pass·fail_.

### Scene E — Change a Subsidy Rate without deploying (persona: platform-admin; criterion C8)
1. In Setup, go to **Custom Metadata Types**, find **Subsidy Rate**, and click **Manage Records**.
2. Open one record (one transport type and distance band). Note its rate. Click **Edit**, change the rate, and save.
3. Re-open the record and confirm the new rate. Confirm in **Deployment Status** that no deployment ran.
4. Set the rate back to its original value.
**Expected:** an admin changes a rate in Setup, with no deployment. **Sign-off:** _name / date / pass·fail_.

### Scene F — Non-owner can't open the records (persona: platform-admin as non-owner test user; criterion C12)
1. Log in as (or log in as through Setup) the non-owner test user: a Standard User profile with `PTSF_Data_Model_Admin`. They own none of the seeded records and have no share on them.
2. Open the test application at `/<application Id>`.
3. Open each assessment at `/<assessment Id>`.
4. Open the Medical History at `/<medical history Id>`.
5. Open `/<Subsidy Application key prefix>/o` and choose the `All` list view.
**Expected:** steps 2–4 show *insufficient privileges*; step 5 lists none of the seeded applications. **Sign-off:** _name / date / pass·fail_.

### Scene G — Query Plan is selective (persona: platform-admin; criterion C13)
1. Seed the org with enough rows for the plan to reflect indexed access: at least 10,000 patients with distinct `Patient_Reference__c` values, 100 Treatment Types, and 5,000 Practitioner Treatment rows spread across them. The build provides the seed script (`scripts/apex/int001-volume-seed.apex`). The production-scale seed waits on Q-001.
2. Get the plan for each query in one of two ways:
   - **REST:** call the Query resource with the `explain` parameter, which returns the plan without running the query: `/services/data/v68.0/query/?explain=<SOQL with spaces as +>` [docs:https://developer.salesforce.com/docs/platform/api-rest/guide/dome-query-explain.html].
   - **Query Plan tool:** in the Salesforce web console's SOQL query builder, click **Get Query Plan**; the plan opens in the Output tab [docs:https://developer.salesforce.com/docs/platform/webconsole/guide/retrieve-query-plans.html].
3. Allocation: `SELECT Id, Practitioner__c FROM Practitioner_Treatment__c WHERE Treatment_Type__c = '<one Treatment Type Id>'`
4. Patient search: `SELECT Id, Name FROM Account WHERE Patient_Reference__c = '<one seeded reference>'`
5. For each, record the first plan's `leadingOperationType`, `relativeCost` and any notes. The first plan is the one that runs, and plans are sorted best first [docs:https://developer.salesforce.com/docs/platform/api-rest/guide/dome-query-explain.html].
**Expected:** both first plans lead with `Index`, not `TableScan`, using the filter field. **Sign-off:** _name / date / pass·fail_, with the org, row counts and both plan outputs attached.
