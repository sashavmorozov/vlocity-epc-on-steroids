/* Restores original tab name if the loading process failed due to some reason and the tab contains the loading counter */
function restoreCurrentTabName() {

    var key = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
    var regex = / \(.*\)$/gi;

    key = key.replace(regex, '');

    SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().setName(key);
    return key;

}





function clearLogs() {

    var logsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Logs");
    var lastRowNumber = logsSheet.getLastRow();

    logsSheet.deleteRows(2, logsSheet.getLastRow() - 2);
    logsSheet.insertRows(2, 10);
    
}

function logProgress(entityName, entryName, entryDetails) {

    var logsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Logs");
    var lastRowNumber = logsSheet.getLastRow();
    var obj = [
        []
    ];

    obj[0][0] = Utilities.formatDate(new Date(), "GMT", "dd MMM yyyy, HH:mm:ss");
    obj[0][1] = entityName;
    obj[0][2] = entryName;
    obj[0][3] = entryDetails;

    var r = logsSheet.getRange(lastRowNumber + 1, 1, 1, obj[0].length);

    r.setValues(obj);
}

function regenerateJsonAttributes() {
  var activeRange = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getActiveRange();
  var activeRangeValues = activeRange.getValues();  
  var selectionWidth = activeRange.getLastColumn();
  var tableWidth = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getLastColumn();
  var VIP_PREFIX = '/services/apexrest/vlocity_cmt/v1/integrationprocedure/';
  var vipName = 'EPC_RegenerateJSONAttributes';
  var vipEndpoint = VIP_PREFIX + vipName;
  var inputParameters = {};
  var productCodes = [];
  
  if (selectionWidth != tableWidth) {
    operationNotification(
      "Info",
      "\nTo regenerate JSONAttributes for products:\n\n " +  
      " 1. Navigate to the Offerings tab\n" +
      " 2. Select entire rows\n" + 
      " 3. Start the prcedure\n" + 
      "\nThe field will be regenerated only for the selected product records"
    );
    return;
  }
  
  for (i = 0; i < activeRange.getValues().length; i++) {
    productCodes.push(activeRangeValues[i][1]);
  }
  
  inputParameters['productCodes'] = productCodes;
  
  var payload = JSON.stringify(inputParameters);
  var result = invokeVipByName(vipName, payload);
  
  return result;
}

function regenerateJsonAttributesForAllProducts() {
  var OFFERINGS_TAB_NAME = "Offerings";
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(OFFERINGS_TAB_NAME);
  var dataRange = sheet.getDataRange();
  var recordsCount = dataRange.getNumRows();
  
  Logger.log('*** ' + recordsCount);
  if (recordsCount > 50) {
    operationNotification(
      "Info",
      "The operation supports up to 150 products at this moment.\n " +  
      "If you have more than 150 rows - update JSONAttribute in chunks manually"
    );
    return;
  }
  
  var VIP_PREFIX = '/services/apexrest/vlocity_cmt/v1/integrationprocedure/';
  var vipName = 'EPC_RegenerateJSONAttributes';
  var vipEndpoint = VIP_PREFIX + vipName;
  var inputParameters = {};
  var productCodes = [];
  var dataValues = dataRange.getValues();
  
  for (i = 0; i < dataValues.length; i++) {
    productCodes.push(dataValues[i][1]);
  }
  
  inputParameters['productCodes'] = productCodes;
  
  var payload = JSON.stringify(inputParameters);
  var result = invokeVipByName(vipName, payload);
  
  return result;
}

function storeJsonAsTable_Test() {
  var tabName = "Upload Test";
  var jsonValue = invokeVipByName_Test();
  storeJsonAsTable(tabName, jsonValue);
}

function storeJsonAsTable(tabName, jsonValue) {
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tabName);
  var headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  Logger.log(JSON.stringify(headerRow));
  
  if (!jsonValue) {
    logProgress(
            "Retrieve Data",
            "Process Error",
            "No results returned by the integration procedure"
        );
    return;
  }
  var obj = JSON.parse(jsonValue);
  var data = [];
  var maxDaraRowLength = 0;
   
  for (i = 0; i < obj.length; i++) {
    var dataRow = []; 
    
    for (j = 0; j < headerRow.length; j++) {  
      if (obj[i][headerRow[j]]) {
        dataRow[j] = obj[i][headerRow[j]];
      } else {
        dataRow[j] = "";
      }
    }
    
    if (dataRow.length > maxDaraRowLength) {
      maxDaraRowLength = dataRow.length;
    }
    
    data.push(dataRow);
  }
  
  sheet.getRange(2, 1, Object.keys(obj).length, maxDaraRowLength).setValues(data);
}

function invokeVipByName_Test() {
  var vipName = 'EPC_LoadGenericEPCDefinitions';
  var payload = {};
  payload['dataRaptorName'] = 'EPC on Steroids_Export All Offerings';
  return invokeVipByName(vipName, JSON.stringify(payload));
}

function invokeVipByName(vipName, payload) {
    var VIP_PREFIX = '/services/apexrest/vlocity_cmt/v1/integrationprocedure/';
    var vipEndpoint = VIP_PREFIX + vipName;
    var accessTokenObj = retrieveStoredAccessToken();

    if (!accessTokenObj) {
        Logger.log('Error: Access token should be generated first');

        logProgress(
            sheetName,
            "Process Error",
            "Access token should be generated first. Check the Settings tab"
        );

        operationNotification('Operation failed', 'Access token should be generated first. Check the Settings tab');
        return;
    }

    var accessToken = accessTokenObj.accessToken;
    var url = accessTokenObj.instanceUrl + vipEndpoint;

    var options = {
        'method': 'post',
        'contentType': 'application/json',
        'payload': payload,
        'muteHttpExceptions': true,
        'headers': {
            'Authorization': 'Bearer ' + accessToken
        },
        'escaping': false
    };

    Logger.log('*** invokeVipByName request:' + JSON.stringify(UrlFetchApp.getRequest(url, options)));

    logProgress(
        vipName,
        "Request Payload",
        payload);

    var response = UrlFetchApp.fetch(url, options);
    Logger.log('*** invokeVipByName response:' + response);

    logProgress(
        vipName,
        "Response Payload",
        response);

    //error processing
    var responseAsJson = JSON.parse(response);
    var errorDetected = false;

    if (responseAsJson) {
        var result = JSON.stringify(responseAsJson['Result']);
        if (result) {
            var hasErrors = JSON.stringify(responseAsJson['Result']['hasErrors']);
            Logger.log('*** hasErrors: ' + hasErrors);
            errorDetected = hasErrors;
        } else {
            errorDetected = true;
        }
    } else {
        errorDetected = true;
    }

    if (errorDetected == true) {
        logProgress(
            vipName,
            "Process Error",
            "An error detected while invoking the integration procedure. Review the logs for more details");
        return STRING_EMPTY_STRING_CONST;
    }

    logProgress(
        vipName,
        "Process Info",
        "Invokation process is completed successfully");

    return JSON.stringify(responseAsJson['Result']['returnResultsData']);
}

function clearPlatformCache() {
  var VIP_PREFIX = '/services/apexrest/vlocity_cmt/v1/integrationprocedure/';
  var vipName = 'EPC_ClearPlatformCache';
  var vipEndpoint = VIP_PREFIX + vipName;
  var inputParameters = {};
  
  var payload = JSON.stringify(inputParameters);
  var result = invokeVipByName(vipName, payload);
  
  return result;
}

function regenerateLayoutsForObjectTypes() {
  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var activeRange = activeSheet.getActiveRange();
  var activeRangeValues = activeRange.getValues();  
  var selectionWidth = activeRange.getLastColumn();
  var tableWidth = activeSheet.getLastColumn();
  var VIP_PREFIX = '/services/apexrest/vlocity_cmt/v1/integrationprocedure/';
  var vipName = 'EPC_RegenerateLayoutsForObjectType';
  var vipEndpoint = VIP_PREFIX + vipName;
  var inputParameters = {};
  var objectTypes = [];
  
  if (selectionWidth != tableWidth || activeSheet.getName() != 'Object Types') {
    operationNotification(
      "Info",
      "\nTo regenerate layouts for object types:\n\n " +  
      " 1. Navigate to the Object Types tab\n" +
      " 2. Select entire rows\n" + 
      " 3. Start the procedure\n" + 
      "\nThe layouts will be regenerated (removed and recreated) only for the selected object types records"
    );
    return;
  }
  
  for (i = 0; i < activeRange.getValues().length; i++) {
    objectTypes.push(activeRangeValues[i][0]);
  }
  
  inputParameters['targetObjectTypeName'] = objectTypes;
  
  var payload = JSON.stringify(inputParameters);
  Logger.log('*** payload: ' + payload);
  //var result = invokeVipByNameChunkable(vipName, payload);
  
  for (i = 0; i < objectTypes.length; i++) {
    var singleItemPayload = {};
    singleItemPayload['targetObjectTypeName'] = objectTypes[i];
    invokeVipByName(vipName, JSON.stringify(singleItemPayload));
  }
  
  //return result;
}



