/**
 * Class created for assigning the current values in picklists for attribute assignments.
 * A picklist value is added or removed on that picklist.
 * Note that the attribute assignment on the original product won't hold the new values (field vlocity_cmt__ValidValuesData__c)
 * Attribute assignments will be restored only after 
 * clicking 'Save' from product's tab in EPC ('Attributes' facet).
 * @author M.Ungania* @date 11/07/2019
**/

global with sharing class FixPicklistValuesUpdateJSON implements Database.Batchable <sObject> {
	private String query = '';
	private List <Id> productIds;
	private Boolean updateJSONAttributes = false;

	global FixPicklistValuesUpdateJSON(List <Id> productIds, Boolean updateJSONAttributes) {
		if(!isVersioningOn()){
			this(productIds);
			this.updateJSONAttributes = updateJSONAttributes;
		}
	}

	global FixPicklistValuesUpdateJSON(List <Id> productIds) {
        if(!isVersioningOn()){
			this.productIds = productIds;
			String fields = 'Id, vlocity_cmt__AttributeId__c, vlocity_cmt__AttributeDisplayName__c, vlocity_cmt__AttributeDisplayNameOverride__c,vlocity_cmt__ObjectId__c, vlocity_cmt__ValueDataType__c, vlocity_cmt__PicklistId__c, vlocity_cmt__Value__c, vlocity_cmt__ExcludedPicklistValues__c, vlocity_cmt__DefaultPicklistValueId__c, vlocity_cmt__UIDisplayType__c, vlocity_cmt__ValidValuesData__c';
			query = 'select ' + fields + ' from vlocity_cmt__AttributeAssignment__c where vlocity_cmt__ObjectId__c IN :productIds';
		}
	}

	global Database.QueryLocator start(Database.BatchableContext BC) {
		return Database.getQueryLocator(query);
	}

	global void execute(Database.BatchableContext context, List <SObject> scope) {
		System.debug('scope size: ' + scope.size());
		List <vlocity_cmt__AttributeAssignment__c> attrassignList = (List <vlocity_cmt__AttributeAssignment__c> ) scope;   
        List<SObject> updatedAssignments = AttributeAssignmentFix.updateAttrAssignments(attrassignList);        
        System.debug('updatedAssignments: ' + updatedAssignments.size());

		if (!updatedAssignments.isEmpty()) {
			update updatedAssignments;
		}
	}

	private List <vlocity_cmt__AttributeAssignment__c> filterDraftAssignments(List <SObject> scope) {
		List <vlocity_cmt__AttributeAssignment__c> attrassignList = new List <vlocity_cmt__AttributeAssignment__c> ();
		List <Id> prodIdList = new List <Id> ();
		// get curr prod id list
		for (vlocity_cmt__AttributeAssignment__c attrAssignment: (List <vlocity_cmt__AttributeAssignment__c> ) scope) {
			prodIdList.add(attrAssignment.vlocity_cmt__ObjectId__c);
		}

		// get draft product ids
		List<Id> draftProdIdList = new List <Id> ();
		for (Product2 draftProduct: [select Id from Product2 where vlocity_cmt__Status__c = 'Draft' and Id IN: prodIdList]) {
			draftProdIdList.add(draftProduct.Id);
		}

		for (vlocity_cmt__AttributeAssignment__c attrAssignment: (List <vlocity_cmt__AttributeAssignment__c> ) scope) {
			if (draftProdIdList.contains(attrAssignment.vlocity_cmt__ObjectId__c)) {
				attrassignList.add(attrAssignment);
			}
		}
		return attrassignList;
	}

	global void finish(Database.BatchableContext BC) {
		if (updateJSONAttributes) {
			Database.executeBatch(new vlocity_cmt.EPCProductAttribJSONBatchJob(productIds), 1);
		}
    }
    public Boolean isVersioningOn(){
        if(vlocity_cmt.VlocityFeatureService.isVersioningFeatureEnabled()) {
            throw new VersionException('This job will not execute if versioning is enabled in org.');
        }
        return false;  
    }
	public class VersionException extends Exception{}
}