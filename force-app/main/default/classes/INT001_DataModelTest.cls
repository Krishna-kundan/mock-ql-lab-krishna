/**
 * INT-001 structure proofs: C1, C4, C6, C17. Runs as an admin test user granted both
 * Account record types (from API 67.0, Apex DML enforces record-type availability).
 * Setup DML and the structural reads run in system mode: from API 67.0 Apex defaults to
 * user mode, and the admin test user's profile holds no FLS on the INT-001 fields.
 */
@IsTest
private class INT001_DataModelTest {

    @IsTest
    static void applicationWithParentAndChildAssessment() {
        System.runAs(INT001_TestData.adminUser()) {
            // Given
            Account patient = INT001_TestData.patient('INT001 Patient');
            Treatment_Type__c cardiac = new Treatment_Type__c(Name = INT001_TestData.APPLICATION_TITLE, Code__c = 'INT001-CARDIAC');
            insert as system cardiac;

            // When
            Test.startTest();
            Subsidy_Application__c app = INT001_TestData.application(patient.Id, cardiac.Id);
            Assessment__c parent = INT001_TestData.assessment(app.Id, null);
            Assessment__c child = INT001_TestData.assessment(app.Id, parent.Id);
            Test.stopTest();

            // Then
            List<Subsidy_Application__c> apps = [
                SELECT Id, Treatment_Type__r.Name,
                    (SELECT Id, Parent_Assessment__c FROM Assessments__r)
                FROM Subsidy_Application__c WHERE Patient__c = :patient.Id WITH SYSTEM_MODE
            ];
            Assert.areEqual(1, apps.size(), 'The patient should hold exactly one application');
            Assert.areEqual(INT001_TestData.APPLICATION_TITLE, apps[0].Treatment_Type__r.Name, 'The application should be for cardiac surgery');
            Assert.areEqual(2, apps[0].Assessments__r.size(), 'The application should hold two assessments');
            Integer children = 0;
            for (Assessment__c a : apps[0].Assessments__r) {
                if (a.Parent_Assessment__c == parent.Id) {
                    children++;
                    Assert.areEqual(child.Id, a.Id, 'The specialist child should point at the parent');
                }
            }
            Assert.areEqual(1, children, 'Exactly one assessment should be the specialist child of the other');
        }
    }

    @IsTest
    static void practitionerRegisteredForTreatmentTypes() {
        System.runAs(INT001_TestData.adminUser()) {
            // Given
            Account practice = INT001_TestData.practice('INT001 Practice');
            Contact practitioner = INT001_TestData.practitioner(practice.Id, 'INT001 Practitioner');
            List<Treatment_Type__c> types = INT001_TestData.treatmentTypes(2);

            // When
            Test.startTest();
            insert as system new List<Practitioner_Treatment__c>{
                new Practitioner_Treatment__c(Practitioner__c = practitioner.Id, Treatment_Type__c = types[0].Id),
                new Practitioner_Treatment__c(Practitioner__c = practitioner.Id, Treatment_Type__c = types[1].Id)
            };
            Test.stopTest();

            // Then
            List<Contact> contacts = [SELECT Id, AccountId FROM Contact WHERE AccountId = :practice.Id WITH SYSTEM_MODE];
            Assert.areEqual(1, contacts.size(), 'The practice should have its practitioner');
            Set<Id> registered = new Set<Id>();
            for (Practitioner_Treatment__c pt : [SELECT Treatment_Type__c FROM Practitioner_Treatment__c WHERE Practitioner__c = :contacts[0].Id WITH SYSTEM_MODE]) {
                registered.add(pt.Treatment_Type__c);
            }
            Assert.areEqual(new Set<Id>{ types[0].Id, types[1].Id }, registered, 'The practitioner should be registered for both treatment types');
        }
    }

    @IsTest
    static void medicalHistoryAccessRowRecordsGrant() {
        User grantee = INT001_TestData.newUser('Standard User', 'i1gnt');
        System.runAs(INT001_TestData.adminUser()) {
            // Given
            Account patient = INT001_TestData.patient('INT001 Patient');
            Treatment_Type__c tt = INT001_TestData.treatmentTypes(1)[0];
            Subsidy_Application__c app = INT001_TestData.application(patient.Id, tt.Id);
            Assessment__c assessment = INT001_TestData.assessment(app.Id, null);
            Medical_History__c mh = INT001_TestData.medicalHistory(patient.Id);
            Datetime grantedAt = Datetime.newInstanceGmt(2026, 11, 1, 9, 0, 0);
            Datetime revokedAt = Datetime.newInstanceGmt(2026, 11, 8, 9, 0, 0);

            // When
            Test.startTest();
            Medical_History_Access__c row = new Medical_History_Access__c(
                Medical_History__c = mh.Id, Patient__c = patient.Id, Assessment__c = assessment.Id,
                Granted_To__c = grantee.Id, Granted_At__c = grantedAt, Revoked_At__c = revokedAt
            );
            insert as system row;
            Test.stopTest();

            // Then
            Medical_History_Access__c saved = [
                SELECT Medical_History__c, Patient__c, Assessment__c, Granted_To__c, Granted_At__c, Revoked_At__c
                FROM Medical_History_Access__c WHERE Id = :row.Id WITH SYSTEM_MODE
            ];
            Assert.areEqual(mh.Id, saved.Medical_History__c, 'Access row should name the history');
            Assert.areEqual(patient.Id, saved.Patient__c, 'Access row should name the patient');
            Assert.areEqual(assessment.Id, saved.Assessment__c, 'Access row should name the assessment');
            Assert.areEqual(grantee.Id, saved.Granted_To__c, 'Access row should name the user given access');
            Assert.areEqual(grantedAt, saved.Granted_At__c, 'Access row should keep granted at');
            Assert.areEqual(revokedAt, saved.Revoked_At__c, 'Access row should keep revoked at');

            Schema.DescribeFieldResult patientLink = Medical_History__c.Patient__c.getDescribe();
            Assert.areEqual(Schema.DisplayType.REFERENCE, patientLink.getType(), 'Patient link should be a relationship');
            Assert.isFalse(patientLink.isCascadeDelete(), 'Patient link should be a lookup, not master-detail');
            Assert.isNull(patientLink.getRelationshipOrder(), 'Patient link should not be a master-detail');
        }
    }

    @IsTest
    static void lifecyclePicklistsHoldPlaceholdersOnly() {
        List<Schema.SObjectField> fields = new List<Schema.SObjectField>{
            Subsidy_Application__c.Reason__c,
            Subsidy_Application__c.Status__c,
            Subsidy_Application__c.Insurance_Check_Result__c,
            Subsidy_Application__c.Satellite_Office__c,
            Subsidy_Application__c.Region__c,
            Assessment__c.Status__c,
            Subsidy_Rate__mdt.Transport_Type__c,
            Subsidy_Rate__mdt.Distance_Band__c
        };
        List<String> expected = new List<String>{ 'Placeholder 1', 'Placeholder 2', 'Placeholder 3' };

        Test.startTest();
        for (Schema.SObjectField f : fields) {
            Schema.DescribeFieldResult d = f.getDescribe();
            List<String> active = new List<String>();
            for (Schema.PicklistEntry e : d.getPicklistValues()) {
                if (e.isActive()) {
                    active.add(e.getValue());
                }
            }
            Assert.isTrue(d.isRestrictedPicklist(), d.getName() + ' should be a restricted picklist');
            Assert.areEqual(expected, active, d.getName() + ' should hold only the placeholder values');
        }
        Test.stopTest();
    }
}
