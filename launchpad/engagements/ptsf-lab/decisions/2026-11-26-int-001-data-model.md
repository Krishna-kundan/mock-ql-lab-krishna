# INT-001: core data model, sharing and access, with three provisional rulings

**Date:** 2026-11-26 · **Deciders:** Krishna Kundan (Trusted Guide) · **Intents:** INT-001 · **Status:** Accepted, except Q-design-1, Q-design-3 and Q-design-6, which are provisional

## Context

INT-001 (`intents/INT-001/intent.md`) needed a data model, sharing defaults and access before the build. The intent and the 2026-11-26 refinement record ask the design to name the objects, the relationships, the indexed fields, the org-wide defaults and an interim ownership scheme. The design is `intents/INT-001/design.md`, ratified 2026-11-26 at design hash `4bd2f82a8da2`. The existing org (`ql-lab`) was consulted. Person Accounts is on there, and no planned object already exists.

## Options

The alternatives weighed are in the design's *Alternatives considered* section. They are summarized here:

- Subsidy Application master-detail to the patient, or a lookup. A lookup keeps the Owner field, queues and sharing.
- Assessment master-detail to the application, or a lookup with its own sharing.
- Medical History master-detail to the patient, or a lookup. A lookup keeps its own share object.
- Treatment Type and Subsidy Rate as records, custom metadata or a custom setting.
- Ownership spread by automation in INT-001, or a pool of owners in a separate top-level role.

## Choice

All 12 calls ratified as proposed in the design:

1. Patients and practices reuse Account and Contact, with the existing `PersonAccount` and `Business_Account` record types.
2. Subsidy Application has a lookup to the patient.
3. Assessment is master-detail to Subsidy Application. Its parent assessment is a self-lookup.
4. Medical History has a lookup to the patient, never master-detail.
5. Medical History Access has only lookups: to the history, the patient, the assessment and the user given access.
6. Practitioner Treatment is master-detail to Contact and to Treatment Type. If Contact can't be the master, it becomes two required lookups.
7. Treatment Type is held as records, Public Read Only.
8. Subsidy Rate is custom metadata, edited in Setup with no deployment.
9. The new objects are Private. Access through the role hierarchy is off for Medical History and Medical History Access.
10. Permission sets `PTSF_Data_Model_Admin` and a separate `PTSF_Medical_History_Break_Glass`. This answers Q-049 for INT-001.
11. Medical History is left off the patient page.
12. The custom object keeps the label "Assessment" (`Assessment__c`), alongside the org's Industries `Assessment` object.

**Provisional rulings** (working assumptions, not customer answers):

- **Q-design-1, ownership:** patient records are owned by a small pool of owner users in a separate top-level role. Owners are never moved and are kept out of the public groups that sharing rules use. INT-001 builds no assignment automation; each creation intent sets the owner from the pool. Revisit when Q-074 is answered.
- **Q-design-3, office and region:** restricted picklists with placeholder values. Revisit before INT-014, INT-018 or INT-019 is built.
- **Q-design-6, patient-record privacy:** Account and Contact sharing stay as they are in INT-001. Internal Account sharing is Public Read/Write in `ql-lab`. INT-001's privacy outcome covers applications, assessments and medical history, not the patient record. Which intent owns patient-record privacy stays open.

## Consequences

- **Known gap, Q-design-1:** the build target line "No single owner holds enough patient records to cause ownership skew" isn't met as written. The pool mitigates skew rather than avoiding it. The wording change goes to `/ql-refine-intent`. Until it's ratified, the proof criterion for that line is a gap in the test script and the build PR.
- **Q-design-3:** changing picklists to an Office record later means a data migration.
- **Q-design-6:** until an intent owns patient-record privacy, every internal user can see every patient account. Making Account Private also requires Contact to be Private or Controlled by Parent.
- **Assessment as master-detail:** anyone who can see an application sees all its assessments. If Q-005 answers "no", Assessment becomes a lookup with its own sharing. That stays possible because INT-001 adds no roll-up summaries.
- **Q-design-2, Q-design-4 and Q-design-5** don't block the build. They stay open in the design.
- The `platform-admin` persona's access line takes the two permission sets once INT-001 is built.
