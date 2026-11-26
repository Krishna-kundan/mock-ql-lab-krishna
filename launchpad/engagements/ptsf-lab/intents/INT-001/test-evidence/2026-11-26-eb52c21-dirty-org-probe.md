---
intent: INT-001
verified_by: ql-verify-build
verified_at: 2026-11-26
target_org: ql-lab (org 00Dbm000017clCfEAI)
branch: feature/ptsf-lab/INT-001-core-data-model
commit: eb52c21-dirty
type: org-probe
---

# INT-001 — Org-probe verification

**Target org:** ql-lab (org 00Dbm000017clCfEAI) · **Commit:** eb52c21-dirty · **Branch:** feature/ptsf-lab/INT-001-core-data-model

**Summary:** 5 confirmed · 0 refuted · 2 unresolved (of 7 criteria)

## Results

### INT-001-C14 — ✅ pass

| Predicate | Expected | Org actual | Verdict |
|-----------|----------|-----------|---------|
| object-exists(Subsidy_Application__c) | exists | EntityDefinition row | ✅ |
| object-exists(Assessment__c) | exists | EntityDefinition row | ✅ |
| object-exists(Medical_History__c) | exists | EntityDefinition row | ✅ |
| object-exists(Medical_History_Access__c) | exists | EntityDefinition row | ✅ |
| object-exists(Treatment_Type__c) | exists | EntityDefinition row | ✅ |
| object-exists(Practitioner_Treatment__c) | exists | EntityDefinition row | ✅ |
| object-exists(Subsidy_Rate__mdt) | exists | EntityDefinition row | ✅ |
| field-type(Subsidy_Application__c.Patient__c, Lookup) | Lookup | FieldDefinition.DataType = Lookup(Account) | ✅ |
| field-required(Subsidy_Application__c.Patient__c) | required | describe: nillable=false, defaultedOnCreate=false | ✅ |
| field-type(Assessment__c.Subsidy_Application__c, MasterDetail) | MasterDetail | FieldDefinition.DataType = Master-Detail(Subsidy Application) | ✅ |
| field-type(Assessment__c.Parent_Assessment__c, Lookup) | Lookup | FieldDefinition.DataType = Lookup(Assessment) | ✅ |
| field-type(Medical_History__c.Patient__c, Lookup) | Lookup | FieldDefinition.DataType = Lookup(Account) | ✅ |
| field-required(Medical_History__c.Patient__c) | required | describe: nillable=false, defaultedOnCreate=false | ✅ |
| field-type(Medical_History_Access__c.Medical_History__c, Lookup) | Lookup | FieldDefinition.DataType = Lookup(Medical History) | ✅ |
| field-type(Medical_History_Access__c.Assessment__c, Lookup) | Lookup | FieldDefinition.DataType = Lookup(Assessment) | ✅ |
| field-type(Medical_History_Access__c.Granted_To__c, Lookup) | Lookup | FieldDefinition.DataType = Lookup(User) | ✅ |
| field-type(Practitioner_Treatment__c.Practitioner__c, MasterDetail) | MasterDetail | FieldDefinition.DataType = Master-Detail(Contact) | ✅ |
| field-type(Practitioner_Treatment__c.Treatment_Type__c, MasterDetail) | MasterDetail | FieldDefinition.DataType = Master-Detail(Treatment Type) | ✅ |
| field-exists(Subsidy_Rate__mdt.Transport_Type__c) | exists | FieldDefinition row: Picklist | ✅ |
| field-exists(Subsidy_Rate__mdt.Distance_Band__c) | exists | FieldDefinition row: Picklist | ✅ |
| field-type(Subsidy_Rate__mdt.Rate__c, Number) | Number | FieldDefinition.DataType = Number(14, 2) | ✅ |

### INT-001-C15 — ⚠ unresolved

| Predicate | Expected | Org actual | Verdict |
|-----------|----------|-----------|---------|
| sharing-model(Subsidy_Application__c, Private) | Private | InternalSharingModel = Private | ✅ |
| sharing-model(Medical_History__c, Private) | Private | InternalSharingModel = Private | ✅ |
| sharing-model(Medical_History_Access__c, Private) | Private | InternalSharingModel = Private | ✅ |
| sharing-model(Assessment__c, ControlledByParent) | ControlledByParent | InternalSharingModel = ControlledByParent | ✅ |
| sharing-model(Practitioner_Treatment__c, ControlledByParent) | ControlledByParent | InternalSharingModel = ControlledByParent | ✅ |
| sharing-model(Treatment_Type__c, Read) | Read | InternalSharingModel = Read | ✅ |
| external-sharing-model(Subsidy_Application__c, Private) | Private | ExternalSharingModel = Private | ✅ |
| external-sharing-model(Medical_History__c, Private) | Private | ExternalSharingModel = Private | ✅ |
| external-sharing-model(Medical_History_Access__c, Private) | Private | ExternalSharingModel = Private | ✅ |
| hierarchy-access(Medical_History__c, false) | false | Not queryable: EntityDefinition has no hierarchy field and CustomObject metadata has none. Trusted Guide reports it cleared in Setup 2026-11-26 (not org-read) | ⚠ |
| hierarchy-access(Medical_History_Access__c, false) | false | Not queryable: EntityDefinition has no hierarchy field and CustomObject metadata has none. Trusted Guide reports it cleared in Setup 2026-11-26 (not org-read) | ⚠ |

### INT-001-C16 — ✅ pass

| Predicate | Expected | Org actual | Verdict |
|-----------|----------|-----------|---------|
| field-type(Account.Patient_Reference__c, Text) | Text | FieldDefinition.DataType = Text(50)  (External ID) (Unique Case Insensitive) | ✅ |
| field-external-id(Account.Patient_Reference__c) | External ID | FieldDefinition.DataType = Text(50)  (External ID) (Unique Case Insensitive) | ✅ |
| field-external-id(Treatment_Type__c.Code__c) | External ID | FieldDefinition.DataType = Text(50)  (External ID) (Unique Case Insensitive) | ✅ |
| field-type(Practitioner_Treatment__c.Treatment_Type__c, MasterDetail) | MasterDetail | FieldDefinition.DataType = Master-Detail(Treatment Type) | ✅ |

### INT-001-C18 — ✅ pass

| Predicate | Expected | Org actual | Verdict |
|-----------|----------|-----------|---------|
| record-type-exists(Account.PersonAccount) | exists | RecordType row, active | ✅ |
| record-type-exists(Account.Business_Account) | exists | RecordType row, active | ✅ |

### INT-001-C19 — ✅ pass

| Predicate | Expected | Org actual | Verdict |
|-----------|----------|-----------|---------|
| permset-exists(PTSF_Data_Model_Admin) | exists | PermissionSet row | ✅ |
| fls(edit, Subsidy_Application__c.Status__c, permset=PTSF_Data_Model_Admin) | edit | FieldPermissions Read=True Edit=True | ✅ |
| fls(edit, Subsidy_Application__c.Approved_Amount__c, permset=PTSF_Data_Model_Admin) | edit | FieldPermissions Read=True Edit=True | ✅ |
| fls(edit, Subsidy_Application__c.Assigned_Practitioner__c, permset=PTSF_Data_Model_Admin) | edit | FieldPermissions Read=True Edit=True | ✅ |
| fls(edit, Assessment__c.Status__c, permset=PTSF_Data_Model_Admin) | edit | FieldPermissions Read=True Edit=True | ✅ |
| fls(edit, Assessment__c.Assigned_Practitioner__c, permset=PTSF_Data_Model_Admin) | edit | FieldPermissions Read=True Edit=True | ✅ |
| fls(edit, Assessment__c.Parent_Assessment__c, permset=PTSF_Data_Model_Admin) | edit | FieldPermissions Read=True Edit=True | ✅ |
| fls(edit, Treatment_Type__c.Code__c, permset=PTSF_Data_Model_Admin) | edit | FieldPermissions Read=True Edit=True | ✅ |
| fls(edit, Account.Patient_Reference__c, permset=PTSF_Data_Model_Admin) | edit | FieldPermissions Read=True Edit=True | ✅ |

### INT-001-C21 — ✅ pass

| Predicate | Expected | Org actual | Verdict |
|-----------|----------|-----------|---------|
| permset-exists(PTSF_Medical_History_Break_Glass) | exists | PermissionSet row | ✅ |
| fls(read, Medical_History__c.Details__c, permset=PTSF_Medical_History_Break_Glass) | read | FieldPermissions Read=True Edit=False | ✅ |
| fls(read, Medical_History_Access__c.Granted_At__c, permset=PTSF_Medical_History_Break_Glass) | read | FieldPermissions Read=True Edit=False | ✅ |
| fls(read, Medical_History_Access__c.Revoked_At__c, permset=PTSF_Medical_History_Break_Glass) | read | FieldPermissions Read=True Edit=False | ✅ |

### INT-001-C22 — ⚠ unresolved

| Predicate | Expected | Org actual | Verdict |
|-----------|----------|-----------|---------|
| tab-exists(Subsidy_Application__c) | exists | TabDefinition row | ✅ |
| tab-exists(Assessment__c) | exists | TabDefinition row | ✅ |
| tab-exists(Medical_History__c) | exists | TabDefinition row | ✅ |
| tab-exists(Medical_History_Access__c) | exists | TabDefinition row | ✅ |
| tab-exists(Treatment_Type__c) | exists | TabDefinition row | ✅ |
| tab-exists(Practitioner_Treatment__c) | exists | TabDefinition row | ✅ |
| object-in-app(PTSF_Subsidy, Subsidy_Application__c) | member | AppDefinition returns 0 rows to the probing user (app not visible to them), so AppTabMember can't settle it. Org metadata read (CustomApplication:PTSF_Subsidy retrieve) lists tab Subsidy_Application__c | ⚠ |
| object-in-app(PTSF_Subsidy, Treatment_Type__c) | member | AppDefinition returns 0 rows to the probing user (app not visible to them), so AppTabMember can't settle it. Org metadata read (CustomApplication:PTSF_Subsidy retrieve) lists tab Treatment_Type__c | ⚠ |
| object-in-app(PTSF_Subsidy, Medical_History__c) | member | AppDefinition returns 0 rows to the probing user (app not visible to them), so AppTabMember can't settle it. Org metadata read (CustomApplication:PTSF_Subsidy retrieve) lists tab Medical_History__c | ⚠ |
