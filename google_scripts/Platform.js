/**
 * The function returns unique identifier of the application script. The Id is used to support development tools.
 *
 * @return {string} unique script identifier
 *
 * @example
 *
 *     getScriptId();
 */

function getScriptId() {
    console.log(ScriptApp.getScriptId());
    return ScriptApp.getScriptId();
}

function generateViewRecordsUrl(objectApiName) {
  
  if (objectApiName) {
    var viewUrl = PropertiesService.getScriptProperties().getProperty(CONST_INSTANCE_URL_PROPERTY_NAME) + "/lightning/o/" + objectApiName + "/home";
    return viewUrl;
  } else {
    console.log("*** ERROR: nothing to view here");
    return;
  }
}

function generateViewSingleRecordsUrl(objectApiName, recordId) {
  
  if (objectApiName && recordId) {
    var viewUrl = PropertiesService.getScriptProperties().getProperty(CONST_INSTANCE_URL_PROPERTY_NAME) + "/lightning/r/" + objectApiName + "/" + recordId + "/view";
    return viewUrl;
  } else {
    console.log("*** ERROR: nothing to view here");
    return;
  }
}

function menuItem_reexecuteLastBusinessOperation() {
  
  console.log("*** METHOD_ENTRY: " + arguments.callee.name);

  var userProperties  = PropertiesService.getUserProperties();
  var activeSheetName = userProperties.getProperty('LAST_ACTIVE_SHEET');
  var operationName   = userProperties.getProperty('LAST_BUSINESS_OPERATION');
  var param1          = userProperties.getProperty('LAST_BUSINESS_OPERATION_PARAM1');
  var param2          = userProperties.getProperty('LAST_BUSINESS_OPERATION_PARAM2');
  var param3          = userProperties.getProperty('LAST_BUSINESS_OPERATION_PARAM3');

  if (!activeSheetName || !operationName) {
    console.log("*** ERROR: " + "Nothing to re-execute");
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return;
  }

  var pageParams = {
    operationName: operationName
  };

  showGenericModalDialog('pages/ReexecuteOperationDialog', 'Re-execute Last Operation', pageParams);
  Utilities.sleep(5000);

  SpreadsheetApp.setActiveSheet(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(activeSheetName));
  this[operationName](param1, param2, param3);

  console.log("*** METHOD_EXIT: " + arguments.callee.name);
}

function saveLastBusinessOperationDetails(activeSheetName, operationName, param1, param2, param3) {
  
  var userProperties  = PropertiesService.getUserProperties();
  var lastBusinessOperationProperties = {
    LAST_ACTIVE_SHEET: activeSheetName,
    LAST_BUSINESS_OPERATION: operationName,
    LAST_BUSINESS_OPERATION_PARAM1: param1,
    LAST_BUSINESS_OPERATION_PARAM2: param2,
    LAST_BUSINESS_OPERATION_PARAM3: param3
  };
  
  userProperties.setProperties(lastBusinessOperationProperties);
  
}

/**
 * This function is called on spreadsheet open and merely adds necessary menu items into the taskbar
 */
function onOpen() {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);
  
    buildMenu();
  
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
  }

