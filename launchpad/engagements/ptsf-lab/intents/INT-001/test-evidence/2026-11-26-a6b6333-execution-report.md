---
intent: INT-001
executed_by: Krishna Kundan
executed_at: 2026-11-26T17:29:59Z
environment: ql-lab (SDO, build org; not production)
branch: feature/ptsf-lab/INT-001-core-data-model
commit: a6b63335b46dda8a17a5dcfc173090c0cb3bf1e5
type: manual
---

# Test Execution Report — INT-001 — 2026-11-26

**Intent:** Core subsidy data model built for tens of millions of patients
**Environment:** ql-lab (SDO, build org; not production)
**Branch @ HEAD:** `feature/ptsf-lab/INT-001-core-data-model` @ `a6b6333` (`a6b63335b46dda8a17a5dcfc173090c0cb3bf1e5`)
**Executed by:** Krishna Kundan
**Executed at:** 2026-11-26T17:29:59Z

Test data: `scripts/apex/int001-seed-users.apex` then `scripts/apex/int001-seed.apex`, run in ql-lab on 2026-11-26.

## Scenes run

### Scene A — Patient → application → assessments (criteria C2)

| Step | Result | Notes |
|------|--------|-------|
| 1. Log in as a platform admin with `PTSF_Data_Model_Admin` | ✅ PASS | |
| 2. Open the test patient at `/<patient Id>` | ✅ PASS | |
| 3. Subsidy Applications related list: one application for 'Cardiac surgery — specialist centre'; open it | ✅ PASS | |
| 4. Assessments related list: two assessments, one shows the other in Parent Assessment | ✅ PASS | |

**Criteria outcome:** C2 ✅

### Scene B — Treatment Type catalog (criteria C3)

| Step | Result | Notes |
|------|--------|-------|
| 1. From the app navigation, open the Treatment Types tab | ✅ PASS | |
| 2. Choose the `All` list view; seeded types listed with names and codes | ✅ PASS | 12 seeded types |

**Criteria outcome:** C3 ✅

### Scene C — Practice → practitioners → treatment types (criteria C5)

| Step | Result | Notes |
|------|--------|-------|
| 1. Open the test practice at `/<practice Id>` | ✅ PASS | |
| 2. Contacts related list shows both practitioners; open the first | ✅ PASS | |
| 3. Practitioner Treatments related list shows its treatment types; repeat for the second | ✅ PASS | A: 2 types, B: 1 type |

**Criteria outcome:** C5 ✅

### Scene D — Medical History on its own record (criteria C7)

| Step | Result | Notes |
|------|--------|-------|
| 1. Assign `PTSF_Medical_History_Break_Glass` for this scene only | ✅ PASS | Held for Scenes D and I, then removed by the tester; a query afterwards showed 0 assignments |
| 2. Test patient page has no Medical History related list | ✅ PASS | |
| 3. Medical Histories tab → the test patient's record opens | ✅ PASS | |
| 4. Medical History Access row shows Granted To, Patient, Assessment, Granted At, Revoked At | ✅ PASS | |

**Criteria outcome:** C7 ✅

### Scene I — Every new object has a tab in the PTSF Subsidy app (criteria C22)

Run with Scene D, so steps 3–4 (with break-glass) ran before steps 1–2 (without it).

| Step | Result | Notes |
|------|--------|-------|
| 3. With break-glass, reload PTSF Subsidy | ✅ PASS | |
| 4. All six tabs show and each opens; remove break-glass | ✅ PASS | |
| 1. Without break-glass, open PTSF Subsidy from the App Launcher | ✅ PASS | |
| 2. Four tabs show; the two medical-history tabs don't | ✅ PASS | |

**Criteria outcome:** C22 ✅

### Scene E — Change a Subsidy Rate without deploying (criteria C8)

| Step | Result | Notes |
|------|--------|-------|
| 1. Setup → Custom Metadata Types → Subsidy Rate → Manage Records | ✅ PASS | |
| 2. Open a record, note its rate, edit and save | ✅ PASS | Placeholder 1 record |
| 3. Re-open: new rate shows; Deployment Status shows no deployment | ✅ PASS | |
| 4. Set the rate back | ✅ PASS | Restored to 0 |

**Criteria outcome:** C8 ✅

### Scene H — Sharing defaults and hierarchy access (criteria C15)

| Step | Result | Notes |
|------|--------|-------|
| 1. Log in as a platform admin with Manage Sharing | ✅ PASS | |
| 2. Setup → Sharing Settings → Organization-Wide Defaults | ✅ PASS | |
| 3. Six rows match the expected internal/external defaults | ✅ PASS | |
| 4. Grant Access Using Hierarchies cleared on Medical History and Medical History Access | ✅ PASS | |

**Criteria outcome:** C15 ✅

### Scene F — Non-owner can't open the records (criteria C12)

| Step | Result | Notes |
|------|--------|-------|
| 1. Log in as the non-owner test user (Standard User + `PTSF_Data_Model_Admin`) | ✅ PASS | Via Setup login-as |
| 2. Open the test application by record URL | ✅ PASS | Insufficient privileges |
| 3. Open each assessment by record URL | ✅ PASS | Insufficient privileges, both |
| 4. Open the Medical History by record URL | ✅ PASS | Insufficient privileges |
| 5. `/<Subsidy Application key prefix>/o`, `All` view | ✅ PASS | None of the seeded applications listed |

**Criteria outcome:** C12 ✅

## Not run

- Scene G (C13): its volume seed script doesn't exist yet, and the production-scale seed waits on Q-001. C13 stays ⚠️.

## Summary

**Criteria run:** 8 · **Passed:** 8 · **Failed:** 0 · **Not run:** 1 (C13)
**Defects filed:** none
