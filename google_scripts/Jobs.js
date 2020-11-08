function runProductHierarchyMaintenanceJob() {
    var vipName = 'EOS_startProductHierarchyJob';
    var inputParameters = {};

    saveLastBusinessOperationDetails(
        SpreadsheetApp.getActiveSheet().getName(),
        arguments.callee.name,
        "",
        "",
        ""
    );

    var payload = JSON.stringify(inputParameters);
    var result = invokeVipByNameSafe(vipName, payload);

    return result;
}

function runRefreshPricebookJob() {
    var vipName = 'EOS_refreshPriceBookJob';
    var inputParameters = {};

    saveLastBusinessOperationDetails(
        SpreadsheetApp.getActiveSheet().getName(),
        arguments.callee.name,
        "",
        "",
        ""
    );

    var payload = JSON.stringify(inputParameters);
    var result = invokeVipByNameSafe(vipName, payload);

    return result;
}

function runClearManagedPlatformCacheJob() {
    var vipName = 'EOS_clearPlatformCacheJob';
    var inputParameters = {};

    saveLastBusinessOperationDetails(
        SpreadsheetApp.getActiveSheet().getName(),
        arguments.callee.name,
        "",
        "",
        ""
    );

    var payload = JSON.stringify(inputParameters);
    var result = invokeVipByNameSafe(vipName, payload);

    return result;
}

function runGenerateGlobalKeysJob() {
    var vipName = 'EOS_generateGlobalKeysJob';
    var inputParameters = {};

    saveLastBusinessOperationDetails(
        SpreadsheetApp.getActiveSheet().getName(),
        arguments.callee.name,
        "",
        "",
        ""
    );

    var payload = JSON.stringify(inputParameters);
    var result = invokeVipByNameSafe(vipName, payload);

    return result;
}


function runFixPicklistValuesForCheckedProductsJob() {
    var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    if (activeSheet.getName() != 'Offerings' &&
        activeSheet.getName() != 'Specifications') {
        operationNotification(
            "Info",
            "\nTo fix picklist attributes:\n\n " +
            " 1. Navigate to the Offerings or Specification tab\n" +
            " 2. Check products to fix picklist attributes for\n" +
            " 3. Start the procedure\n" +
            "\nAllow some time for the job to complete. The picklist attributes will be fixed only for the selected product records"
        );
        return;
    }

    var inputData = exportRowsOfActiveSheetAsJson(CONST_EXPORT_SCOPE_ENUM.INCLUDE_ONLY_CHECKED);
    console.log('*** ' + JSON.stringify(inputData));

    if (!inputData) {
        operationNotification(
            "Info",
            "\nTo fix picklist attributes:\n\n " +
            " 1. Navigate to the Offerings or Specification tab\n" +
            " 2. Check products to fix picklist attributes for\n" +
            " 3. Start the procedure\n" +
            "\nAllow some time for the job to complete. The picklist attributes will be fixed only for the selected product records"
        );
        return;
    }

    runFixPicklistValuesJob(inputData, activeSheet.getName());
}

function runFixPicklistValuesJob(inputData, entityName) {
    var vipName = "EOS_fixPicklistValuesJob";

    var keyCode;
    var inputDataRecords = inputData[entityName]; //or product specifications
    var inputParameters = {};
    inputParameters.productCodes = [];

    if (entityName == "Offerings") {
        keyCode = "Offering Code";
    } else {
        keyCode = "Spec Code";
    }

    for (i = 0; i < inputDataRecords.length; i++) {
        inputParameters.productCodes.push(inputDataRecords[i][keyCode]);
    }

    saveLastBusinessOperationDetails(
        SpreadsheetApp.getActiveSheet().getName(),
        arguments.callee.name,
        "",
        "",
        ""
    );

    var payload = JSON.stringify(inputParameters);
    var result = invokeVipByNameSafe(vipName, payload);

    return result;

}

function regenerateLayoutsForCheckedObjectTypes() {
    var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    if (activeSheet.getName() != 'Object Types') {
        operationNotification(
            "Info",
            "\nTo regenerate layouts for object types:\n\n " +
            " 1. Navigate to the Object Types tab\n" +
            " 2. Check object types to regenerate layouts for\n" +
            " 3. Start the procedure\n" +
            "\nThe layouts will be regenerated (removed and recreated) only for the selected object types records"
        );
        return;
    }

    var objectTypesData = exportRowsOfActiveSheetAsJson(CONST_EXPORT_SCOPE_ENUM.INCLUDE_ONLY_CHECKED);
    console.log('*** ' + JSON.stringify(objectTypesData));

    if (!objectTypesData) {
        operationNotification(
            "Info",
            "\nTo regenerate layouts for object types:\n\n " +
            " 1. Navigate to the Object Types tab\n" +
            " 2. Check object types to regenerate layouts for\n" +
            " 3. Start the procedure\n" +
            "\nThe layouts will be regenerated (removed and recreated) only for the selected object types records"
        );
        return;
    }

    regenerateLayouts(objectTypesData);
}

function regenerateLayouts(objectTypesData) {
    var vipName = 'EPC_RegenerateLayoutsForObjectType';
    var objectTypesArray = objectTypesData["Object Types"];
  
    for (i = 0; i < objectTypesArray.length; i++) {
      var singleItemPayload = {};
      singleItemPayload['targetObjectTypeName'] = objectTypesArray[i]["Object Type"];
      console.log('*** Regenerating layout for  ' + JSON.stringify(singleItemPayload));
      logProgress(
            "Object Types (Layouts)",
            "Info",
            "Regenerating layout for " + objectTypesArray[i]["Object Type"]
        );
      invokeVipByNameSafe(vipName, JSON.stringify(singleItemPayload));
    }
    
}