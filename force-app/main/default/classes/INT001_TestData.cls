/**
 * INT-001 test data factory. Test-only: builds the users, patients, practices and
 * subsidy records the INT001_* tests need. Creates no production automation.
 */
@IsTest
public class INT001_TestData {
    public static final String APPLICATION_TITLE = 'Cardiac surgery — specialist centre';

    private static Database.DMLOptions allowDuplicates() {
        Database.DMLOptions opts = new Database.DMLOptions();
        opts.DuplicateRuleHeader.allowSave = true;
        return opts;
    }

    private static Id recordTypeId(String developerName) {
        return Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName()
            .get(developerName).getRecordTypeId();
    }

    public static User newUser(String profileName, String alias) {
        Profile p = [SELECT Id FROM Profile WHERE Name = :profileName LIMIT 1];
        String unique = alias + System.currentTimeMillis() + Crypto.getRandomInteger();
        User u = new User(
            ProfileId = p.Id,
            Alias = alias,
            LastName = 'INT001 ' + alias,
            Email = alias + '@int001.test.invalid',
            Username = unique + '@int001.test.invalid',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            TimeZoneSidKey = 'GMT'
        );
        if (Schema.SObjectType.User.fields.getMap().containsKey('DefaultCurrencyIsoCode')) {
            u.put('DefaultCurrencyIsoCode', UserInfo.getDefaultCurrency());
        }
        insert as system u;
        return u;
    }

    public static User adminUser() {
        return newUser('System Administrator', 'i1adm');
    }

    /** A Standard User holding PTSF_Data_Model_Admin, who owns nothing and has no share. */
    public static User nonOwnerUser() {
        User u = newUser('Standard User', 'i1non');
        assignPermissionSet(u.Id, [SELECT Id FROM PermissionSet WHERE Name = 'PTSF_Data_Model_Admin' LIMIT 1].Id);
        return u;
    }

    public static void assignPermissionSet(Id userId, Id permissionSetId) {
        insert as system new PermissionSetAssignment(AssigneeId = userId, PermissionSetId = permissionSetId);
    }

    public static Account patient(String lastName) {
        Account a = new Account(RecordTypeId = recordTypeId('PersonAccount'), LastName = lastName);
        Database.insert(a, allowDuplicates(), AccessLevel.SYSTEM_MODE);
        return a;
    }

    public static Account practice(String name) {
        Account a = new Account(RecordTypeId = recordTypeId('Business_Account'), Name = name);
        Database.insert(a, allowDuplicates(), AccessLevel.SYSTEM_MODE);
        return a;
    }

    public static Contact practitioner(Id practiceId, String lastName) {
        Contact c = new Contact(AccountId = practiceId, LastName = lastName);
        Database.insert(c, allowDuplicates(), AccessLevel.SYSTEM_MODE);
        return c;
    }

    public static List<Treatment_Type__c> treatmentTypes(Integer count) {
        List<Treatment_Type__c> types = new List<Treatment_Type__c>();
        for (Integer i = 0; i < count; i++) {
            types.add(new Treatment_Type__c(Name = 'INT001 Treatment ' + i, Code__c = 'INT001-T' + i, Active__c = true));
        }
        insert as system types;
        return types;
    }

    public static Subsidy_Application__c application(Id patientId, Id treatmentTypeId) {
        Subsidy_Application__c app = new Subsidy_Application__c(Patient__c = patientId, Treatment_Type__c = treatmentTypeId);
        insert as system app;
        return app;
    }

    public static Assessment__c assessment(Id applicationId, Id parentAssessmentId) {
        Assessment__c a = new Assessment__c(
            Subsidy_Application__c = applicationId,
            Parent_Assessment__c = parentAssessmentId,
            Assigned_Date__c = System.now()
        );
        insert as system a;
        return a;
    }

    public static Medical_History__c medicalHistory(Id patientId) {
        Medical_History__c mh = new Medical_History__c(Patient__c = patientId, Details__c = 'INT001 test history');
        insert as system mh;
        return mh;
    }
}
