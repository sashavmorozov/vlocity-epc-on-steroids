/* Restores original tab name if the loading process failed due to some reason and the tab contains the loading counter */
function restoreCurrentTabName() {

    var key = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
    var regex = / \(.*\)$/gi;

    key = key.replace(regex, '');

    SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().setName(key);
    return key;

}

function getConnectedOrgDetails(){
  //return Math.round(Math.random() * 100);
  var orgDetails = {};
  orgDetails.url = PropertiesService.getScriptProperties().getProperty(CONST_INSTANCE_URL_PROPERTY_NAME);
  orgDetails.name = PropertiesService.getScriptProperties().getProperty(CONST_INSTANCE_URL_PROPERTY_NAME);
    
  return orgDetails;
}

//OBSOLETE - REMOVE ME
function getLoadingProcessInfo(){
  //return Math.round(Math.random() * 100);
  var currentProgress = {};
  currentProgress["progress"] = PropertiesService.getUserProperties().getProperty("loadingProcessProgress");
  currentProgress["step"] = PropertiesService.getUserProperties().getProperty("loadingProcessStep");
  currentProgress["error"] = PropertiesService.getUserProperties().getProperty("loadingProcessError");
  currentProgress["warning"] = PropertiesService.getUserProperties().getProperty("loadingProcessWarning");
  currentProgress["BACKEND_PROCESS_STATUS"] = PropertiesService.getUserProperties().getProperty("BACKEND_PROCESS_STATUS");
  
  return currentProgress;
}

function getBackendProcessInfo(){
  var currentBackendProcessInfo = {};

  currentBackendProcessInfo["BACKEND_PROCESS_STATUS"]           = PropertiesService.getUserProperties().getProperty("BACKEND_PROCESS_STATUS");
  currentBackendProcessInfo["BACKEND_PROCESS_PROGRESS"]         = PropertiesService.getUserProperties().getProperty("BACKEND_PROCESS_PROGRESS");
  currentBackendProcessInfo["BACKEND_PROCESS_STEP"]             = PropertiesService.getUserProperties().getProperty("BACKEND_PROCESS_STEP");
  currentBackendProcessInfo["BACKEND_PROCESS_DETAILS"]          = PropertiesService.getUserProperties().getProperty("BACKEND_PROCESS_DETAILS");
  currentBackendProcessInfo["BACKEND_PROCESS_ENTITY_API_NAME"]  = PropertiesService.getUserProperties().getProperty("BACKEND_PROCESS_ENTITY_API_NAME");
  currentBackendProcessInfo["BACKEND_PROCESS_ENTITY_VIEW_URL"]  = PropertiesService.getUserProperties().getProperty("BACKEND_PROCESS_ENTITY_VIEW_URL");

  console.log("*** " + JSON.stringify(currentBackendProcessInfo));
  
  return currentBackendProcessInfo;
}

function setBackendProcessInfoProcessStatus(processStatus) {
  PropertiesService.getUserProperties().setProperty("BACKEND_PROCESS_STATUS", processStatus);
}

function getBackendProcessInfoProcessStatus() {
  PropertiesService.getUserProperties().getProperty("BACKEND_PROCESS_STATUS");
}

function setBackendProcessInfoProcessProgress(processProgress) {
  PropertiesService.getUserProperties().setProperty("BACKEND_PROCESS_PROGRESS", processProgress);
}

function setBackendProcessInfoProcessStep(processStep) {
  PropertiesService.getUserProperties().setProperty("BACKEND_PROCESS_STEP", processStep);
}

function setBackendProcessInfoProcessDetails(processDetails) {
  PropertiesService.getUserProperties().setProperty("BACKEND_PROCESS_DETAILS", processDetails);
}

function setBackendProcessInfoProcessEntityApiName(processDetails) {
  PropertiesService.getUserProperties().setProperty("BACKEND_PROCESS_ENTITY_API_NAME", processDetails);
}

function setBackendProcessInfoProcessEntityViewUrl(processDetails) {
  PropertiesService.getUserProperties().setProperty("BACKEND_PROCESS_ENTITY_VIEW_URL", processDetails);
}


function resetLoadingProcessProgress() {
    updateLoadingProcessProgress(15);
}

function completeLoadingProcessProgress() {
    updateLoadingProcessProgress(100);
}

function updateLoadingProcessProgress(currentProcessProgress) {
    loadingProcessProgress = currentProcessProgress;
    PropertiesService.getUserProperties().setProperty('loadingProcessProgress', loadingProcessProgress);
}

function resetLoadingProcessStep() {
    setLoadingProcessStep("Just started");
}

function setLoadingProcessStep(step) {
  PropertiesService.getUserProperties().setProperty('loadingProcessStep', step);
}

function completeLoadingProcessStep() {
    setLoadingProcessStep("Just finished. You can close the window and check records in Vlocity");
}

function resetLoadingProcessError() {
    setLoadingProcessError(false);
}

function raiseLoadingProcessError() {
    setLoadingProcessError(true);
}

/* loading process warnings section */
function setLoadingProcessWarning(message) {
  PropertiesService.getUserProperties().setProperty('loadingProcessWarning', 'true');
    PropertiesService.getUserProperties().setProperty('loadingProcessWarningMessage', message);
}

function resetLoadingProcessWarning() {
  PropertiesService.getUserProperties().setProperty('loadingProcessWarning', 'false');
    PropertiesService.getUserProperties().setProperty('loadingProcessWarningMessage', 'n/a');
}

function setLoadingProcessError(error) {
  PropertiesService.getUserProperties().setProperty('loadingProcessError', error);
}

function setAggregatedLoadingProcessStatus(processStatus) {
  console.log("*** METHOD_ENTRY: " + arguments.callee.name);
  console.time(arguments.callee.name);

  /* process status can be "SUCCESS", "WARNING" or "ERROR" */
  var currentAggregatedProcessStatus = PropertiesService.getUserProperties().getProperty("BACKEND_PROCESS_STATUS");
  console.log("*** VARIABLE: processStatus = " + processStatus);
  console.log("*** VARIABLE: currentAggregatedProcessStatus = " + currentAggregatedProcessStatus);
  console.log("*** VARIABLE: currentProgress = " + PropertiesService.getUserProperties().getProperty("BACKEND_PROCESS_PROGRESS"));

  /* if (currentAggregatedProcessStatus == null || currentAggregatedProcessStatus == "" ||
      CONST_PROCESS_STATUS_ENUM[processStatus] > CONST_PROCESS_STATUS_ENUM[currentAggregatedProcessStatus]) {
    PropertiesService.getUserProperties().setProperty("BACKEND_PROCESS_STATUS", processStatus);
  } */

  var newProcessStatus = currentAggregatedProcessStatus;
  switch (processStatus) {
    case "ERROR": 
      newProcessStatus = "ERROR";
      break;
    
    case "WARNING":
      if (currentAggregatedProcessStatus !== "ERROR") newProcessStatus = "WARNING";
      break;
      
    case "SUCCESS":
      if (currentAggregatedProcessStatus !== "ERROR" && currentAggregatedProcessStatus !== "WARNING" &&
          PropertiesService.getUserProperties().getProperty("BACKEND_PROCESS_PROGRESS") == "100.0" //this is not nice
      ) newProcessStatus = "SUCCESS";
      break;
  }

  PropertiesService.getUserProperties().setProperty("BACKEND_PROCESS_STATUS", newProcessStatus);

  console.log("*** " + "New value for BACKEND_PROCESS_STATUS is " + PropertiesService.getUserProperties().getProperty("BACKEND_PROCESS_STATUS")); 
  console.timeEnd(arguments.callee.name);
  console.log("*** METHOD_EXIT: " + arguments.callee.name);
}

function getAggregatedLoadingProcessStatus() {
  return PropertiesService.getUserProperties().getProperty("BACKEND_PROCESS_STATUS");
}

function viewUserProperties() {
  console.log(JSON.stringify(PropertiesService.getUserProperties().getProperties()));
}

function deleteUserProperties() {
  console.log("*** METHOD_ENTRY: " + arguments.callee.name);
  console.time(arguments.callee.name);
  
  PropertiesService.getUserProperties().deleteAllProperties();
  
  console.timeEnd(arguments.callee.name);
  console.log("*** METHOD_EXIT: " + arguments.callee.name);
  return;
}

/*

 EOS intiates a business operation (upload data, retrieve data, run a job, etc.)
 A business operation can be atomic (run a job, retrieve data) or composite (upload data)
 
 An atomic operation translates into a single transaction (VIP call)
 A composite operation translates into multiple atomic transactions (at this time - sequenced)

 For a composite operation:
  - Need to track aggregated progress progress (e.g. loading progress)
  - Need to track aggregated progress status (e.g. error if at least one error occurs in atomics)
  - Need to track aggregated progress message

*/

  
/* The function strips out leading sequential number from a string, if used. 
* The leading sequential number is assumed to be separated from the main string part with a space
* Examples:
* "01. Offerings"   > "Offerings"
* "1216. Offerings" > "Offerings"
* "Offerings Test"  > "Offerings Test"
*/

function removeLeadingNumber(stringValue) {
    var regex = /[0-9]*\.* /gi;
    stringValue = stringValue.replace(regex, '');
    return stringValue;
}

/*update me to support checkboxes*/
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
    productCodes.push(activeRangeValues[i][2]);
  }
  
  inputParameters['productCodes'] = productCodes;
  
  var payload = JSON.stringify(inputParameters);
  var result = invokeVipByNameSafe(vipName, payload);
  
  return result;
}

/*** DO NOT USE AT THIS MOMENT **/
function regenerateJsonAttributesForAllProducts() {
  var OFFERINGS_TAB_NAME = "Offerings";
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(OFFERINGS_TAB_NAME);
  var dataRange = sheet.getDataRange();
  var recordsCount = dataRange.getNumRows();
  
  console.log('*** ' + recordsCount);
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
  var result = invokeVipByNameSafe(vipName, payload);
  
  return result;
}

/**
 * Invokes an active Vlocity integration procedure by name. 
 * If an authorization error is returned (INVALID_SESSION_ID), the function regenerates an access token 
 * and reexecute the integration procedure
 * Authorization error format: [{"message":"Session expired or invalid","errorCode":"INVALID_SESSION_ID"}]
 *
 * @param {string} vipName - integration procedure identifier (Type_Subtype)
 * @param {string} payload - procedure input as a JSON-based string
 * @return {void} - nothing
 *
 * @example
 *     var vipName = "Hello_World";
 *     var payload = {hello: "world"};
 *     invokeVipByNameSafe(vipName, JSON.stringify(payload));
 */

function invokeVipByNameSafe(vipName, payload) {
  console.log("*** METHOD_ENTRY: " + arguments.callee.name);
  //console.time(arguments.callee.name);
  
  var response = invokeVipByName(vipName, payload);

  if (!response) {
    var message = "Access token is not available. Check settings or connection to Salesforce org";
    console.log("*** ERROR: message: " + message);
    logProgress("Integration Procedure Utils", arguments.callee.name, message);
    return;
  }
  
  var responseContentAsJson = JSON.parse(response.getContentText());
  
  if (Array.isArray(responseContentAsJson)) {
    for (var i = 0; i < responseContentAsJson.length; i++) {
      if (responseContentAsJson[i].errorCode === "INVALID_SESSION_ID") {
        var message = "An access token is expired and should be refreshed";
        console.log("*** INFO: message: " + message);
        logProgress("Integration Procedure Utils", arguments.callee.name, message);
        
        var refreshToken = PropertiesService.getScriptProperties().getProperty(CONST_REFRESH_TOKEN_PROPERTY_NAME);
        var refreshTokenResponse = regenerateToken(refreshToken);
        
        if (refreshTokenResponse.access_token) {
          response = invokeVipByName(vipName, payload);
        }
        else {
          var message = "Unable to regenerate an access token: " + refreshTokenResponse.error_description;
          console.log("*** INFO: message: " + message);
          logProgress("Integration Procedure Utils", arguments.callee.name, message);
        }
      }
    }
  }
  
  //console.timeEnd(arguments.calee.name);
  console.log("*** METHOD_EXIT: " + arguments.callee.name);
  return response;
}

/**
 * Invokes an active Vlocity integration procedure by name
 *
 * @param {string} vipName - integration procedure identifier (Type_Subtype)
 * @param {string} payload - procedure input as a JSON-based string
 * @return {void} - nothing
 *
 * @example
 *     var vipName = "Hello_World";
 *     var payload = {hello: "world"};
 *     invokeVipByName(vipName, JSON.stringify(payload));
 */

function invokeVipByName(vipName, payload) {
  console.log("*** METHOD_ENTRY: " + arguments.callee.name);

  var CONST_VIP_PREFIX = "/services/apexrest/vlocity_cmt/v1/integrationprocedure/";
  var vipEndpoint = CONST_VIP_PREFIX + vipName;
  var accessTokenObj = retrieveStoredAccessToken();

  //maybe take this out?
  if (!accessTokenObj) {
      var errorMessage =
          "Access token is not available. Check settings or connection to Salesforce org";
      console.log("*** ERROR: " + errorMessage);

      logProgress(vipName, "Error", errorMessage);

      var dialogParams = {
          warningMessage: "Doesn't look good",
          warningMessageDescription: errorMessage
      };
      displayWarningDialog(dialogParams);

      return;
  }

  var accessToken = PropertiesService.getScriptProperties().getProperty(CONST_ACCESS_TOKEN_PROPERTY_NAME);
  var instanceUrl = PropertiesService.getScriptProperties().getProperty(CONST_INSTANCE_URL_PROPERTY_NAME);
  var url = instanceUrl + vipEndpoint;

  var options = {
      method: "post",
      contentType: "application/json",
      payload: payload,
      muteHttpExceptions: true,
      headers: {
          Authorization: "Bearer " + accessToken
      },
      escaping: false
  };

  var request = UrlFetchApp.getRequest(url, options);
  console.log("*** INFO: VIP name: " + vipName);
  console.log("*** INFO: VIP payload: " + payload);
  console.log("*** INFO: VIP request: " + JSON.stringify(request));
  
  logProgress("Integration Procedure Utils", arguments.callee.name + " vipName", vipName);
  logProgress("Integration Procedure Utils", arguments.callee.name + " payload", payload);
  logProgress("Integration Procedure Utils", arguments.callee.name + " request", request);

  var response = UrlFetchApp.fetch(url, options);

  console.log("*** INFO: VIP response: " + response);
  logProgress("Integration Procedure Utils", arguments.callee.name + " response", response);
  
  /* Error detection and processing */
  var responseContentAsJson = JSON.parse(response.getContentText());
  
  
  /* Detect session expiration error */
  if (Array.isArray(responseContentAsJson)) {
    for (var i = 0; i < responseContentAsJson.length; i++) {
      if (responseContentAsJson[i].errorCode === "INVALID_SESSION_ID") {
        console.log("*** ERROR: message: " + responseContentAsJson[i].message);
        logProgress("Integration Procedure Utils", arguments.callee.name + " error message", responseContentAsJson[i].message);
      
        console.log("*** METHOD_EXIT: " + arguments.callee.name);
        return response;
      }
    }
  }

  
  //CONTINUE HERE - CHECK HOW VIP RETURNS ERRORS
  var validationResult = validateVipResponseForGenericErrors(JSON.parse(response));
  logProgress("Integration Procedure Utils", arguments.callee.name + " execution status", validationResult.status);

  //commented - hope nothing will be broken
  /*
  if (responseContentAsJson.Result.returnResultsData) {
    return JSON.stringify(responseContentAsJson.Result.returnResultsData);
  }
  */

  console.log("*** METHOD_EXIT: " + arguments.callee.name);
  return response;
}

///////////////////TTTT
/**
 * Invokes an active Vlocity integration procedure by name. 
 * If an authorization error is returned (INVALID_SESSION_ID), the function regenerates an access token 
 * and reexecute the integration procedure
 * Authorization error format: [{"message":"Session expired or invalid","errorCode":"INVALID_SESSION_ID"}]
 *
 * @param {string} vipName - integration procedure identifier (Type_Subtype)
 * @param {string} payload - procedure input as a JSON-based string
 * @return {void} - nothing
 *
 * @example
 *     var vipName = "Hello_World";
 *     var payload1 = {one: "You shoot me in a dream, you better wake up and apologize"};
 *     var payload2 = {two: "Say what again, I double dare you motherf**ker"};
 *     var payload3 = {three: "Sitting in your chair, I would probably say the same thing"};
 *     var payload4 = {four: "I'm an American, our names don't mean shit"};
 *     var payloadArray = [
 *       JSON.stringify(payload1), 
 *       JSON.stringify(payload2),
 *       JSON.stringify(payload3),
 *       JSON.stringify(payload4)
 *     ];
 *     invokeVipByNameBulkSafe(vipName, payloadArray);
 */

function invokeVipByNameBulkSafe(vipName, payloadArray) {
  console.log("*** METHOD_ENTRY: " + arguments.callee.name);
  console.time(arguments.callee.name);
  
  var refreshToken = PropertiesService.getScriptProperties().getProperty(CONST_REFRESH_TOKEN_PROPERTY_NAME);
  var refreshTokenResponse = regenerateToken(refreshToken);

  var responsesArray;

  if (refreshTokenResponse.access_token) {
    responsesArray = invokeVipByNameBulk(vipName, payloadArray);
  }
  else {
    var message = "Unable to regenerate an access token: " + refreshTokenResponse.error_description;
    console.log("*** INFO: message: " + message);
    logProgress("Integration Procedure Utils", arguments.callee.name, message);
  }

  
  console.timeEnd(arguments.callee.name);
  console.log("*** METHOD_EXIT: " + arguments.callee.name);
  return responsesArray;
}

/**
 * Invokes an active Vlocity integration procedure by name in a batch mode. An integration procedure is invoked as many times as many payload elements are provided. The method relies on batch HTTP request processing provided by the Google Apps Script framework  
 *
 * @param {string} vipName - integration procedure identifier (Type_Subtype)
 * @param {array[string]} payloadArray - array of procedure inputs as a JSON-based string
 * @return {void} - nothing
 *
 * @example
 *     var vipName = "Hello_World";
 *     var payloadArray = [{hello: "world"}, {thanks: "for all the fish"}] --CHANGE ME
 *     invokeVipByNameBulk(vipName, JSON.stringify(payloadArray));
 */

function invokeVipByNameBulk(vipName, payloadArray) {
  console.log("*** METHOD_ENTRY: " + arguments.callee.name);

  var CONST_VIP_PREFIX = "/services/apexrest/vlocity_cmt/v1/integrationprocedure/";
  var vipEndpoint = CONST_VIP_PREFIX + vipName;

  var accessToken = PropertiesService.getScriptProperties().getProperty(CONST_ACCESS_TOKEN_PROPERTY_NAME);
  var instanceUrl = PropertiesService.getScriptProperties().getProperty(CONST_INSTANCE_URL_PROPERTY_NAME);
  var url = instanceUrl + vipEndpoint;

  var requestsArray = [];

  for (var i = 0; i < payloadArray.length; i++) {
    
    var payload = payloadArray[i];
    var options = {
        method: "post",
        contentType: "application/json",
        payload: payload,
        muteHttpExceptions: true,
        headers: {
            Authorization: "Bearer " + accessToken
        },
        escaping: false
    };
    

    var request = UrlFetchApp.getRequest(url, options);
    requestsArray.push(request);

    console.log("*** INFO: VIP name: " + vipName);
    console.log("*** INFO: VIP payload: " + payload);
    console.log("*** INFO: VIP request: " + JSON.stringify(request));
    
    logProgress("Integration Procedure Utils", arguments.callee.name + " vipName", vipName);
    logProgress("Integration Procedure Utils", arguments.callee.name + " payload", payload);
    logProgress("Integration Procedure Utils", arguments.callee.name + " request", request);

  }

  console.log("*** INFO: requestsArray: " + JSON.stringify(requestsArray));
  
  
  var responsesArray = UrlFetchApp.fetchAll(requestsArray);

  for (var i = 0; i < responsesArray.length; i++) {
    var response = responsesArray[i];
    console.log("*** INFO: VIP response: " + "[" + i + "]" + response);
    logProgress("Integration Procedure Utils", arguments.callee.name + " response", response);

  }
  

  
  
  /* Error detection and processing */
  /* var responseContentAsJson = JSON.parse(response.getContentText());
   */
  
  /* Detect session expiration error */
  /* if (Array.isArray(responseContentAsJson)) {
    for (var i = 0; i < responseContentAsJson.length; i++) {
      if (responseContentAsJson[i].errorCode === "INVALID_SESSION_ID") {
        console.log("*** ERROR: message: " + responseContentAsJson[i].message);
        logProgress("Integration Procedure Utils", arguments.callee.name + " error message", responseContentAsJson[i].message);
      
        console.log("*** METHOD_EXIT: " + arguments.callee.name);
        return response;
      }
    }
  }
 */
  
  //CONTINUE HERE - CHECK HOW VIP RETURNS ERRORS
/*   var validationResult = validateVipResponseForGenericErrors(JSON.parse(response));
  logProgress("Integration Procedure Utils", arguments.callee.name + " execution status", validationResult.status);
 */
  //commented - hope nothing will be broken
  /*
  if (responseContentAsJson.Result.returnResultsData) {
    return JSON.stringify(responseContentAsJson.Result.returnResultsData);
  }
  */

  console.log("*** METHOD_EXIT: " + arguments.callee.name);
  //return response;
}

function clearPlatformCache2() {
  var VIP_PREFIX = '/services/apexrest/vlocity_cmt/v1/integrationprocedure/';
  var vipName = 'EPC_ClearPlatformCache';
  var vipEndpoint = VIP_PREFIX + vipName;
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

function runProductHierarchyMaintenanceJob() {
  var VIP_PREFIX = '/services/apexrest/vlocity_cmt/v1/integrationprocedure/';
  var vipName = 'EOS_startProductHierarchyJob';
  var vipEndpoint = VIP_PREFIX + vipName;
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
  var VIP_PREFIX = '/services/apexrest/vlocity_cmt/v1/integrationprocedure/';
  var vipName = 'EOS_refreshPriceBook';
  var vipEndpoint = VIP_PREFIX + vipName;
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

function runClearManagedPlatformCache() {
  var VIP_PREFIX = '/services/apexrest/vlocity_cmt/v1/integrationprocedure/';
  var vipName = 'EOS_clearPlatformCache';
  var vipEndpoint = VIP_PREFIX + vipName;
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

function viewScriptProperties() {
  var keys = PropertiesService.getScriptProperties().getKeys();
  
  for (var i = 0; i < keys.length; i++) {
    console.log('*** ' + keys[i] + ': ' + PropertiesService.getScriptProperties()[keys[i]]);
  }
}

function shortenInstanceUrl(instanceUrl) {
  
  if (instanceUrl) {
    var tag = instanceUrl.match(/https:\/\/(.*?)\./);
    if (tag) {
      console.log('*** shortenInstanceUrl: ' + tag[1]);
      return tag[1];
    } else {
      return instanceUrl;
    }
    
  } else {
    return "Error: nothing to shorten here";
  }
}

/* The function checks if a propery has a non-empty/non-undefined value */
function isScriptPropertySet(propertyName) {
  var isPropertySet = false;
  var propertyValue = PropertiesService.getScriptProperties().getProperty(propertyName);
  if (propertyValue !== null &&
      propertyValue !== undefined &&
      propertyValue !== "undefined" &&
      propertyValue !== "") {
    isPropertySet = true;
  } 
  
  return isPropertySet;
}

/* The function checks if access token and instance URL are set */
function isConnectedToSalesforce() {
  var isConnected = false;
  
  if (isScriptPropertySet(CONST_ACCESS_TOKEN_PROPERTY_NAME) && 
      isScriptPropertySet(CONST_INSTANCE_URL_PROPERTY_NAME)) {
    isConnected = true;
  } 
  
  return isConnected;
}

/* The function generates UUID, credit to https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript */

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/* The function verifies that properties for authorization are properly set */

function areAuthorizationProperiesSet() {
  if (!PropertiesService.getScriptProperties().getProperty(CONST_CUSTOMER_KEY_PROPERTY_NAME) || PropertiesService.getScriptProperties().getProperty(CONST_CUSTOMER_KEY_PROPERTY_NAME) === "PUT_YOUR_VALUE_HERE") return false;
  if (!PropertiesService.getScriptProperties().getProperty(CONST_CUSTOMER_SECRET_PROPERTY_NAME) || PropertiesService.getScriptProperties().getProperty(CONST_CUSTOMER_SECRET_PROPERTY_NAME) === "PUT_YOUR_VALUE_HERE") return false;
  if (!PropertiesService.getScriptProperties().getProperty(CONST_ORG_TYPE_PROPERTY_NAME) || PropertiesService.getScriptProperties().getProperty(CONST_ORG_TYPE_PROPERTY_NAME) === "PUT_YOUR_VALUE_HERE") return false;
  
  return true;
}

function isEmptyArray(inputArray){
  
  var isEmpty = true;
  
  /* ignore specially marked rows */
  if (inputArray[0] === "H") {
    return true;
  }

  for (var i = 1; i < inputArray.length; i++) {
    if (inputArray[i] !== "" &&
        inputArray[i] !== null &&
        inputArray[i] !== false &&
        inputArray[i] !== undefined) {
      isEmpty = false;
    }  
  }
  
  return isEmpty;
}

/* Checks if an object is empty: https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object */
function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}

/**
 * Returns true if a sheet range contains at least one strikethrough cell
 *
 * @param {Range} sheetRange - Google sheet range (usually a row)
 * @return {boolean} - result of the check
 *
 * @example
 *     var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
 *     var sheetRange = sheet.getRange('A1:D10');
 *     var containsStrikethroughCells = rangeContainsStrikethroughCells(sheetRange);
 */

function rangeContainsStrikethroughCells(sheetRange) {
  console.log("*** METHOD_ENTRY: " + arguments.callee.name);
  console.time(arguments.callee.name);
  
  //var sheetRange = SpreadsheetApp.getActiveSheet().getRange('A31:D34'); //test data
  
  if (sheetRange) {
    var numRows = sheetRange.getNumRows();
    var numCols = sheetRange.getNumColumns();
    var sheetRangeTextStyles = sheetRange.getTextStyles();
    
    for (var i = 0; i < numRows; i++) {
      for (var j = 0; j < numCols; j++) {
        if (sheetRangeTextStyles[i][j].isStrikethrough()) {
          return true;
        }
      }
    }
  }
  
  console.timeEnd(arguments.callee.name);
  
  console.log("*** METHOD_EXIT: " + arguments.callee.name);
  return false;
}

/* ADD DOCS

  validationResult = {
    status (Successful, Failed)
    errorCode
    errorMessage
    errorDetails
  }
*/

function validateVipResponseForGenericErrors(response) {
  console.log("*** METHOD_ENTRY: " + arguments.callee.name);
  var result = {
    status: "Success",
    errorCode: "",
    errorMessage: "",
    errorDescription: ""
  }

  console.log("*** VARIABLE: response: " + JSON.stringify(response));

  if (!response) {
      console.log('*** ERROR: An empty response (or no response) received from an integration procedure');
      result.status = "Failed";
      result.errorCode = "No response";
      result.errorMessage = "No response provided for validation";
      result.errorDescription = "No response provided for validation";
      return result;
  }

  /* quick status check */
  var vipStatus = response.Status;

  if (!vipStatus) {
      console.log('*** ERROR: An empty status (or no status) received from an integration procedure');
      result.status = "Failed";
      result.errorCode = "No status";
      result.errorMessage = "No status provided for validation";
      result.errorDescription = "No status provided in the response";
      return result;
  } else {
      if (vipStatus === "Failed") {
          console.log("*** ERROR: " + "Failed status received from an integration procedure. Please review the process logs and make necessary corrections");
          result.status = "Failed";
          result.errorCode = "Failed status";
          result.errorMessage = "Failed status returned";
          result.errorDescription = "Failed status received from an integration procedure. Please review the process logs and make necessary corrections";
          return result;
      } else {
          //other search
      }
  }

  console.log("*** METHOD_EXIT: " + arguments.callee.name);
  return result;
}

/**
 * Returns an empty array of a specified size, filled with a specified (filler) content
 *
 * @param {Integer} arrayLength - size of a new array
 * @param {Object} filler - filler content
 * @return {Array} - an array of a given size with each item initialized with the filler content
 *
 * @example
 *     var emptyArray = createEmptyArray(5, "");
 */

function createEmptyArray(arrayLength, filler) {
  console.log("*** METHOD_ENTRY: " + arguments.callee.name);
  
  var a = [];
  for (var i = 0; i < arrayLength; i++) {
    a.push(filler);
  }
  
  console.log("*** METHOD_EXIT: " + arguments.callee.name);
  return a;
}