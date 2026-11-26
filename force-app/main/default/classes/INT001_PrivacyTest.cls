/**
 * INT-001 privacy proofs: C9, C10, C11, C20. Records are owned by an admin test user;
 * reads run as a Standard User holding PTSF_Data_Model_Admin who owns nothing and has no share.
 * Setup DML runs in system mode (API 67.0+ defaults to user mode); the reads under test stay WITH USER_MODE.
 */
@IsTest
private class INT001_PrivacyTest {

    private class Fixture {
        Id applicationId;
        Id medicalHistoryId;
        Id accessRowId;
    }

    private static Fixture ownedRecords(User owner) {
        Fixture f = new Fixture();
        System.runAs(owner) {
            Account patient = INT001_TestData.patient('INT001 Private Patient');
            Treatment_Type__c tt = INT001_TestData.treatmentTypes(1)[0];
            Subsidy_Application__c app = INT001_TestData.application(patient.Id, tt.Id);
            Assessment__c parent = INT001_TestData.assessment(app.Id, null);
            INT001_TestData.assessment(app.Id, parent.Id);
            Medical_History__c mh = INT001_TestData.medicalHistory(patient.Id);
            Medical_History_Access__c row = new Medical_History_Access__c(
                Medical_History__c = mh.Id, Patient__c = patient.Id, Assessment__c = parent.Id,
                Granted_At__c = System.now()
            );
            insert as system row;
            f.applicationId = app.Id;
            f.medicalHistoryId = mh.Id;
            f.accessRowId = row.Id;
        }
        return f;
    }

    @IsTest
    static void nonOwnerCannotReadApplication() {
        Fixture f = ownedRecords(INT001_TestData.adminUser());
        User nonOwner = INT001_TestData.nonOwnerUser();
        Id appId = f.applicationId;

        System.runAs(nonOwner) {
            Test.startTest();
            List<Subsidy_Application__c> seen = [SELECT Id FROM Subsidy_Application__c WHERE Id = :appId WITH USER_MODE];
            Test.stopTest();
            Assert.areEqual(0, seen.size(), 'A non-owner with object access but no share should not see the application');
        }
    }

    @IsTest
    static void nonOwnerCannotReadAssessments() {
        Fixture f = ownedRecords(INT001_TestData.adminUser());
        User nonOwner = INT001_TestData.nonOwnerUser();
        Id appId = f.applicationId;

        System.runAs(nonOwner) {
            Test.startTest();
            List<Assessment__c> seen = [SELECT Id FROM Assessment__c WHERE Subsidy_Application__c = :appId WITH USER_MODE];
            Test.stopTest();
            Assert.areEqual(0, seen.size(), 'A non-owner should not see the assessments of an application they cannot see');
        }
    }

    @IsTest
    static void nonOwnerCannotReadMedicalHistory() {
        Fixture f = ownedRecords(INT001_TestData.adminUser());
        User nonOwner = INT001_TestData.nonOwnerUser();
        Id mhId = f.medicalHistoryId;
        Id rowId = f.accessRowId;

        // Test-only permission set: object Read, so only the Private default can block the read.
        System.runAs(new User(Id = UserInfo.getUserId())) {
            PermissionSet readHistory = new PermissionSet(Name = 'INT001_Test_Read_History', Label = 'INT001 Test Read History');
            insert as system readHistory;
            insert as system new List<ObjectPermissions>{
                new ObjectPermissions(ParentId = readHistory.Id, SobjectType = 'Medical_History__c', PermissionsRead = true),
                new ObjectPermissions(ParentId = readHistory.Id, SobjectType = 'Medical_History_Access__c', PermissionsRead = true)
            };
            INT001_TestData.assignPermissionSet(nonOwner.Id, readHistory.Id);
        }

        System.runAs(nonOwner) {
            Test.startTest();
            Boolean canRead = Schema.SObjectType.Medical_History__c.isAccessible();
            List<Medical_History__c> histories = [SELECT Id FROM Medical_History__c WHERE Id = :mhId WITH USER_MODE];
            List<Medical_History_Access__c> rows = [SELECT Id FROM Medical_History_Access__c WHERE Id = :rowId WITH USER_MODE];
            Test.stopTest();
            Assert.isTrue(canRead, 'The test permission set should grant object Read, so sharing alone is under test');
            Assert.areEqual(0, histories.size(), 'A non-owner with object Read should not see the medical history');
            Assert.areEqual(0, rows.size(), 'A non-owner with object Read should not see the access row');
        }
    }

    @IsTest
    static void dataModelAdminPermSetGrantsNoMedicalHistory() {
        Set<String> medical = new Set<String>{ 'Medical_History__c', 'Medical_History_Access__c' };

        Test.startTest();
        List<ObjectPermissions> objectGrants = [
            SELECT SobjectType, PermissionsRead FROM ObjectPermissions
            WHERE Parent.Name = 'PTSF_Data_Model_Admin' AND SobjectType IN :medical
        ];
        List<FieldPermissions> fieldGrants = [
            SELECT Field FROM FieldPermissions
            WHERE Parent.Name = 'PTSF_Data_Model_Admin' AND SobjectType IN :medical
        ];
        Test.stopTest();

        for (ObjectPermissions op : objectGrants) {
            Assert.isFalse(op.PermissionsRead, 'PTSF_Data_Model_Admin should not grant Read on ' + op.SobjectType);
        }
        Assert.areEqual(0, fieldGrants.size(), 'PTSF_Data_Model_Admin should grant no field access on medical objects');
        Assert.areEqual(1, [SELECT COUNT() FROM PermissionSet WHERE Name = 'PTSF_Data_Model_Admin'], 'The permission set under test should exist');
    }
}
