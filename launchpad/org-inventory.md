# Org inventory

A saved snapshot of the org's metadata. The next design re-checks it before relying on it. Metadata only, never record data.

## Account

As of 2026-11-26, org 00Dbm000017clCfEAI

- **Person Accounts:** enabled.
- **Record types:** `Business_Account`, `SDO_Account_Partner`, `SDO_Account_Simple`, `SDO_PersonAccounts` (person), `PersonAccount` (person).
- **Sharing:** internal Public Read/Write, external Private.
- **Custom fields:** 87 unmanaged (demo), 1 from the `maps` namespace. Includes `External_ID__c`. None for patients or practices.
- **Triggers:** `SDO_Tool_SalesforceRewind_Account` (active), `pi.LogAccountChange` (managed, active).
- **Record-triggered Flows:** none active.
- **Validation rules:** none.

## Contact

As of 2026-11-26, org 00Dbm000017clCfEAI

- **Record types:** `SDO_Partner_Contact`, `SDO_Contact`.
- **Sharing:** internal Public Read/Write, external Private.
- **Custom fields:** 28 unmanaged (demo), 23 from the `pi` namespace, 2 from `et4ae5`. Includes `External_ID__c`. None for practitioners.
- **Triggers:** `SDO_Tool_SalesforceRewind_Contact` (active), `pi.LogContactChange` (managed, active).
- **Record-triggered Flows:** none active.
- **Validation rules:** none.
