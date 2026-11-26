// INT-001 seed, step 1 of 2: users and permission sets for manual scenes A–F.
// Run: sf apex run --file scripts/apex/int001-seed-users.apex -o <org-alias>, then int001-seed.apex.
// Assigns PTSF_Data_Model_Admin to the running user (Scenes A–C) and creates the non-owner test user
// for Scene F (Standard User + PTSF_Data_Model_Admin, no welcome email). Safe to re-run.

Id psId = [SELECT Id FROM PermissionSet WHERE Name = 'PTSF_Data_Model_Admin' LIMIT 1].Id;
Id me = UserInfo.getUserId();

// Data-model admin permission set for the running user (Scenes A–C).
if ([SELECT COUNT() FROM PermissionSetAssignment WHERE AssigneeId = :me AND PermissionSetId = :psId] == 0) {
    insert new PermissionSetAssignment(AssigneeId = me, PermissionSetId = psId);
}

// Non-owner test user (Scene F).
String nonOwnerName = 'int001.nonowner.' + UserInfo.getOrganizationId() + '@example.invalid';
List<User> nonOwners = [SELECT Id FROM User WHERE Username = :nonOwnerName LIMIT 1];
User nonOwner;
if (nonOwners.isEmpty()) {
    nonOwner = new User(
        ProfileId = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1].Id,
        Username = nonOwnerName, Alias = 'i1nonown', LastName = 'INT001 Non-owner',
        Email = 'int001.nonowner@example.invalid',
        EmailEncodingKey = 'UTF-8', LanguageLocaleKey = 'en_US', LocaleSidKey = 'en_US', TimeZoneSidKey = 'GMT'
    );
    Database.DMLOptions noEmail = new Database.DMLOptions();
    noEmail.EmailHeader.triggerUserEmail = false;
    Database.insert(nonOwner, noEmail);
    insert new PermissionSetAssignment(AssigneeId = nonOwner.Id, PermissionSetId = psId);
} else {
    nonOwner = nonOwners[0];
}

System.debug(LoggingLevel.ERROR, 'INT001_SEED non-owner username = ' + nonOwnerName);
System.debug(LoggingLevel.ERROR, 'INT001_SEED non-owner user Id = ' + nonOwner.Id);
