# Build notes — this org's recurring traps

Traps that keep biting builds **in this org**: its quirks, its integrations, the things a new engagement here should know before it builds. Shared by every engagement in the repo. Skim it before building a new automation or lifecycle intent, and append a trap the moment you fight through it twice; per-increment specifics belong in each `delivery/phase-N/README.md` instead.

General Salesforce platform traps live with `/ql-design-intent` (`salesforce-traps.md` beside its skill) and the build toolkits, not here.


- **Related-list columns for a master-detail parent on a junction don't take the bare field name.** On a child's related list, Layout metadata names the column for a master as `<Master>__c.NAME` when that master is a custom object, and as `OBJECT_ID` when it's a standard one like Contact. The bare `Field__c` name, `Field__r.Name` and `CONTACT.NAME` all fail with "Invalid field … in related list". Lookup columns do take the bare field name. If unsure, add the column in Setup and retrieve the layout. (ptsf-lab/INT-001)
