/**
* Class created for assigning the current values in picklists for attribute assignments.
* A picklist value is added or removed on that picklist.
* Note that the attribute assignment on the original product won't hold the new values (field vlocity_cmt__ValidValuesData__c)
* Attribute assignments will be restored only after clicking 'Save' from product's tab in EPC ('Attributes' facet).
** @author M.Ungania* @date 11/07/2019
*/
public with sharing class AttributeAssignmentFix {

	public static List <vlocity_cmt__AttributeAssignment__c> updateAttrAssignments(List <SObject> objects) {

		List <Id> attributeIdToCheckList = new List <Id> ();
		Map <Id, vlocity_cmt__AttributeAssignment__c> picklistIdToAttrAssign = new Map <Id,vlocity_cmt__AttributeAssignment__c> ();
		Map <Id, List <vlocity_cmt__AttributeAssignment__c>> picklistIdToAttrAssignments = new Map <Id, List <vlocity_cmt__AttributeAssignment__c>> ();
		List <vlocity_cmt__AttributeAssignment__c> aaList = new List <vlocity_cmt__AttributeAssignment__c> ();
		
        // populate maps        
		for (SObject so: objects) {
			vlocity_cmt__AttributeAssignment__c attrAssign = (vlocity_cmt__AttributeAssignment__c) so;
			if (attrAssign.vlocity_cmt__ValueDataType__c == 'Picklist' || attrAssign.vlocity_cmt__ValueDataType__c == 'Multi Picklist') {
				// picklist attribute assignments will be added to retval after thevalues update                
				if (attrAssign.vlocity_cmt__PicklistId__c != null) {
					if (!picklistIdToAttrAssignments.containsKey(attrAssign.vlocity_cmt__PicklistId__c)) {
						picklistIdToAttrAssignments.put(attrAssign.vlocity_cmt__PicklistId__c, new List <vlocity_cmt__AttributeAssignment__c> ());
					}
					picklistIdToAttrAssignments.get(attrAssign.vlocity_cmt__PicklistId__c).add(attrAssign);
				}
			} else {
				// add non picklist attribute assignments to retval as they are                
				aaList.add(attrAssign);
			}
		}
		if (!picklistIdToAttrAssignments.keySet().isEmpty()) {
			List <vlocity_cmt__AttributeAssignment__c> assignmentsToUpdate = serializePicklistValues(picklistIdToAttrAssignments);
			System.debug('assignmentsToUpdate: ' + assignmentsToUpdate.size() + ' - ' + assignmentsToUpdate);
			aaList.addAll(assignmentsToUpdate);
		}
		// update display labels        
		updateDisplayLabels(aaList);
		return aaList;
	}

	private static List <vlocity_cmt__AttributeAssignment__c> serializePicklistValues(Map <Id, List <vlocity_cmt__AttributeAssignment__c>> picklistIdToAttrAssignments) {
		List <vlocity_cmt__AttributeAssignment__c> updatedAttrAssignments = new List <vlocity_cmt__AttributeAssignment__c> ();
		Set <Id> picklistIds = picklistIdToAttrAssignments.keySet();
		Map <Id, List <vlocity_cmt__PicklistValue__c>> picklistIdToPicklistValueList = buildPicklistMap(picklistIds);

		// OPT 1        
		for (Id picklistId: picklistIds) {
			System.debug('PicklistId: ' + picklistId);
			List <vlocity_cmt__PicklistValue__c> picklistEntries = picklistIdToPicklistValueList.get(picklistId);
			for (vlocity_cmt__AttributeAssignment__c attrAssign: picklistIdToAttrAssignments.get(picklistId)) {
				System.debug('curr values: ' + attrAssign.vlocity_cmt__ValidValuesData__c);
				attrAssign.vlocity_cmt__ValidValuesData__c = serializePicklistValues(picklistEntries, attrAssign);
				System.debug('updated values: ' + attrAssign.vlocity_cmt__ValidValuesData__c);
				if (attrAssign.vlocity_cmt__UIDisplayType__c == null) {
					attrAssign.vlocity_cmt__UIDisplayType__c = 'Dropdown';
				}
				updatedAttrAssignments.add(attrAssign);
			}
		}
		return updatedAttrAssignments;
	}
	private static Map <Id, List <vlocity_cmt__PicklistValue__c>> buildPicklistMap(Set <Id> picklistIdList) {
		Map <Id, List <vlocity_cmt__PicklistValue__c>> picklistIdToPicklistValueList = new Map <Id, List <vlocity_cmt__PicklistValue__c>> ();
		for (vlocity_cmt__PicklistValue__c picklistEntry: [select Id, vlocity_cmt__PicklistId__c, vlocity_cmt__Value__c, Name, vlocity_cmt__IsDefault__c, vlocity_cmt__Sequence__c, vlocity_cmt__GlobalKey__c from vlocity_cmt__PicklistValue__c where vlocity_cmt__IsActive__c = true and vlocity_cmt__PicklistId__c IN: picklistIdList order by vlocity_cmt__PicklistId__c, vlocity_cmt__Sequence__c]) {
			if (!picklistIdToPicklistValueList.containsKey(picklistEntry.vlocity_cmt__PicklistId__c)) {
				picklistIdToPicklistValueList.put(picklistEntry.vlocity_cmt__PicklistId__c, new List <vlocity_cmt__PicklistValue__c> ());
			}
			picklistIdToPicklistValueList.get(picklistEntry.vlocity_cmt__PicklistId__c).add(picklistEntry);
		}
		return picklistIdToPicklistValueList;
	} 
    
    // snippet taken from EPCAdminAttributeService and adapted to work in bulk    
	private static String serializePicklistValues(List <vlocity_cmt__PicklistValue__c> picklistEntries, vlocity_cmt__AttributeAssignment__c aa) {
		String retval;
		//If no picklistEntries defined, just return an empty list.        
		if (picklistEntries.size() == 0) {
			return JSON.serialize(picklistEntries);
		}

		Map <String, vlocity_cmt__PicklistValue__c> mapPicklistValueName = new Map <String, vlocity_cmt__PicklistValue__c> ();
		for (vlocity_cmt__PicklistValue__c pv: picklistEntries) {
			mapPicklistValueName.put(pv.Name, pv);
		}
		//get vlocity_cmt__Value__c from AttributeAssignment        
		Set <String> attributeValuesSplit = new Set <String> ();
		if (aa.vlocity_cmt__Value__c != null) {
			attributeValuesSplit.addAll(aa.vlocity_cmt__Value__c.split(';'));
		}

		//get Excluded Picklist Item Ids from AttributeAssignment        
		Set <Id> excludedPicklistItemIdsSet = new Set <Id> ();
		if (!String.isBlank(aa.vlocity_cmt__ExcludedPicklistValues__c)) {
			List <Id> excludedPicklistItemIdsList = aa.vlocity_cmt__ExcludedPicklistValues__c.split(',');
			excludedPicklistItemIdsSet.addAll(excludedPicklistItemIdsList);
		} 
        
        //get Default Picklist Item Id from AttributeAssignment        
		Id defaultPicklistItemId;
		if (!String.isBlank(aa.vlocity_cmt__DefaultPicklistValueId__c)) {
			defaultPicklistItemId = aa.vlocity_cmt__DefaultPicklistValueId__c;
		}

		List <PicklistRow> picklistRows = new List <PicklistRow> ();
		Integer i = 1;
		Integer seq;

		for (vlocity_cmt__PicklistValue__c pse: picklistEntries) {
			//if pse.Id not in ExcludedPicklistItemIds...            
			if (!excludedPicklistItemIdsSet.contains(pse.Id)) {
				PicklistRow newRow = new PicklistRow();
				newRow.id = pse.vlocity_cmt__GlobalKey__c != null ? pse.vlocity_cmt__GlobalKey__c: pse.vlocity_cmt__Sequence__c != null ? String.valueOf(pse.vlocity_cmt__Sequence__c) : String.valueOf(i);
				newRow.displayText = pse.Name;
				newRow.value = pse.vlocity_cmt__Value__c;
				newRow.isEditable = false;
				newRow.sequence = pse.vlocity_cmt__Sequence__c;

				// If Picklist Value is in AttributeAssignment.Value, mark it as "default"                
				if (attributeValuesSplit.contains(pse.vlocity_cmt__Value__c)) {
					newRow.isDefault = true;
				} else {
					newRow.isDefault = false;
				}
				picklistRows.add(newRow);
				i++;
			}
		}
		retval = JSON.serialize(picklistRows);
		return retval;
	}

	private static void updateDisplayLabels(List <vlocity_cmt__AttributeAssignment__c> aaList) {
		// bulk        
		List <Id> attrIdList = new List <Id> ();
		for (vlocity_cmt__AttributeAssignment__c aa: aaList) {
			attrIdList.add(aa.vlocity_cmt__AttributeId__c);
		}
		Id prodId = aaList.get(0).vlocity_cmt__ObjectId__c;

		// assume all aa refer to same product and objectId valued              
		Id objTypeId = [select vlocity_cmt__ObjectTypeId__c from Product2 where Id = :prodId].get(0).vlocity_cmt__ObjectTypeId__c;
		//List <vlocity_cmt__AttributeAssignment__c> result = [select Id, vlocity_cmt__AttributeId__c, vlocity_cmt__AttributeDisplayName__c from vlocity_cmt__AttributeAssignment__c where vlocity_cmt__AttributeId__c in :attrIdList and vlocity_cmt__ObjectId__c = :objTypeId];
		List <vlocity_cmt__AttributeAssignment__c> result = [select Id, vlocity_cmt__AttributeId__c, vlocity_cmt__AttributeDisplayName__c from vlocity_cmt__AttributeAssignment__c where vlocity_cmt__AttributeId__c in :attrIdList and vlocity_cmt__ObjectId__c = :prodId];
		
		Map <Id, String> attrIdToDisplayLabel = new Map <Id,String> ();
		
        for (vlocity_cmt__AttributeAssignment__c aa: result) {
			System.debug(aa);
			attrIdToDisplayLabel.put(aa.vlocity_cmt__AttributeId__c, aa.vlocity_cmt__AttributeDisplayName__c);
		}

		for (vlocity_cmt__AttributeAssignment__c aa: aaList) {
			String displayLabel = aa.vlocity_cmt__AttributeDisplayName__c;
			String latestDisplayLabel = attrIdToDisplayLabel.get(aa.vlocity_cmt__AttributeId__c);
			System.debug('displayLabel: ' + displayLabel + ', latestDisplayLabel: ' + latestDisplayLabel);
			if (displayLabel != latestDisplayLabel) {
				aa.vlocity_cmt__AttributeDisplayNameOverride__c = latestDisplayLabel;
			}
		}
	}

	public class PicklistRow {
		String id;
		String displayText;
		String value;
		Boolean isEditable;
		Boolean isDefault;
		Decimal sequence;
		public PicklistRow() {}
	}
}