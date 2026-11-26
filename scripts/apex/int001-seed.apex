// INT-001 seed for manual scenes A–F (test-script.md § Manual validation scenes).
// Run, in this order (Salesforce won't mix user/permission inserts with record inserts in one run):
//   sf apex run --file scripts/apex/int001-seed-users.apex -o <org-alias>
//   sf apex run --file scripts/apex/int001-seed.apex -o <org-alias> --api-version 66.0
// (API 67.0+ runs anonymous Apex in user mode and rejects system mode; at 66.0 the seed can write the
// medical-history fields without granting anyone edit access to them.)
// Demo data only, not a deployment step. Safe to re-run: if the seed patient exists, it prints
// the existing Ids and creates nothing. Every record is owned by the running user.

final String PATIENT_REF = 'INT001-SEED-P1';
final String CARDIAC = 'Cardiac surgery — specialist centre';

Id me = UserInfo.getUserId();

void out(String label, Object value) {
    System.debug(LoggingLevel.ERROR, 'INT001_SEED ' + label + ' = ' + value);
}
String prefix(Schema.SObjectType t) {
    return t.getDescribe().getKeyPrefix();
}

String nonOwnerName = 'int001.nonowner.' + UserInfo.getOrganizationId() + '@example.invalid';
List<User> nonOwners = [SELECT Id FROM User WHERE Username = :nonOwnerName LIMIT 1];
if (nonOwners.isEmpty()) {
    throw new IllegalArgumentException('Run scripts/apex/int001-seed-users.apex first.');
}
User nonOwner = nonOwners[0];

List<Account> existing = [SELECT Id FROM Account WHERE Patient_Reference__c = :PATIENT_REF LIMIT 1];
Account patient;
Account practice;
Subsidy_Application__c app;
List<Assessment__c> assessments;
Medical_History__c mh;
List<Contact> practitioners;

if (existing.isEmpty()) {
    Database.DMLOptions allowDup = new Database.DMLOptions();
    allowDup.DuplicateRuleHeader.allowSave = true;
    Map<String, Schema.RecordTypeInfo> rts = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName();

    // Treatment Type catalog: 12 types, one for the cardiac application.
    List<Treatment_Type__c> types = new List<Treatment_Type__c>{
        new Treatment_Type__c(Name = CARDIAC, Code__c = 'INT001-SEED-T00', Active__c = true)
    };
    for (Integer i = 1; i <= 11; i++) {
        String n = String.valueOf(i).leftPad(2, '0');
        types.add(new Treatment_Type__c(Name = 'INT001 Seed Treatment ' + n, Code__c = 'INT001-SEED-T' + n, Active__c = true));
    }
    insert types;

    // Scene A: patient → application → parent and specialist child assessment.
    patient = new Account(RecordTypeId = rts.get('PersonAccount').getRecordTypeId(),
        LastName = 'INT001 Seed Patient', Patient_Reference__c = PATIENT_REF);
    Database.insert(patient, allowDup);
    app = new Subsidy_Application__c(Patient__c = patient.Id, Treatment_Type__c = types[0].Id);
    insert app;
    Assessment__c parent = new Assessment__c(Subsidy_Application__c = app.Id, Assigned_Date__c = System.now());
    insert parent;
    Assessment__c child = new Assessment__c(Subsidy_Application__c = app.Id, Parent_Assessment__c = parent.Id, Assigned_Date__c = System.now());
    insert child;

    // Scene C: practice with two practitioners and their treatment types.
    practice = new Account(RecordTypeId = rts.get('Business_Account').getRecordTypeId(), Name = 'INT001 Seed Practice');
    Database.insert(practice, allowDup);
    practitioners = new List<Contact>{
        new Contact(AccountId = practice.Id, LastName = 'INT001 Seed Practitioner A'),
        new Contact(AccountId = practice.Id, LastName = 'INT001 Seed Practitioner B')
    };
    Database.insert(practitioners, allowDup);
    insert new List<Practitioner_Treatment__c>{
        new Practitioner_Treatment__c(Practitioner__c = practitioners[0].Id, Treatment_Type__c = types[0].Id),
        new Practitioner_Treatment__c(Practitioner__c = practitioners[0].Id, Treatment_Type__c = types[1].Id),
        new Practitioner_Treatment__c(Practitioner__c = practitioners[1].Id, Treatment_Type__c = types[2].Id)
    };

    // Scene D: medical history with one access row, granted and revoked.
    // The running admin holds no field access on medical history (ADR 0001), and anonymous Apex
    // checks field access at compile time, so these fields are set by name.
    mh = new Medical_History__c(Patient__c = patient.Id);
    mh.put('Details__c', 'INT001 seed history (test data).');
    insert mh;
    Medical_History_Access__c grant = new Medical_History_Access__c(Medical_History__c = mh.Id);
    grant.put('Patient__c', patient.Id);
    grant.put('Assessment__c', parent.Id);
    grant.put('Granted_To__c', me);
    grant.put('Granted_At__c', System.now().addDays(-7));
    grant.put('Revoked_At__c', System.now().addDays(-1));
    insert grant;
    out('status', 'created');
} else {
    out('status', 'already seeded; nothing created');
    patient = existing[0];
    practice = [SELECT Id FROM Account WHERE Name = 'INT001 Seed Practice' LIMIT 1];
    practitioners = [SELECT Id FROM Contact WHERE AccountId = :practice.Id ORDER BY LastName];
    app = [SELECT Id FROM Subsidy_Application__c WHERE Patient__c = :patient.Id LIMIT 1];
    mh = [SELECT Id FROM Medical_History__c WHERE Patient__c = :patient.Id LIMIT 1];
}
assessments = [SELECT Id, Parent_Assessment__c FROM Assessment__c WHERE Subsidy_Application__c = :app.Id ORDER BY Name];

out('patient Id', patient.Id);
out('application Id', app.Id);
for (Assessment__c a : assessments) {
    out(a.Parent_Assessment__c == null ? 'parent assessment Id' : 'child assessment Id', a.Id);
}
out('practice Id', practice.Id);
for (Contact c : practitioners) {
    out('practitioner Id', c.Id);
}
out('medical history Id', mh.Id);
out('non-owner username', nonOwnerName);
out('non-owner user Id', nonOwner.Id);
out('Subsidy Application key prefix', prefix(Subsidy_Application__c.SObjectType));
out('Treatment Type key prefix', prefix(Treatment_Type__c.SObjectType));
out('Medical History key prefix', prefix(Medical_History__c.SObjectType));
out('Subsidy Rate records', [SELECT COUNT() FROM Subsidy_Rate__mdt]);
