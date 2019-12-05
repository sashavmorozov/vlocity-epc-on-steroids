function getApplicationName() {
  return CONST_APPLICATION_NAME;
}

function getApplicationVersion() {
  return CONST_APPLICATION_VERSION;
}

function getLatestAvailableVersion() {
  return CONST_APPLICATION_VERSION;
}

function getSpreadsheetName() {
  return SpreadsheetApp.getActive().getName();
}

function getSpreadsheetUrl() {
  return SpreadsheetApp.getActive().getUrl();
}

function generateUploadTransactionId() {
  return uuidv4();
}

function generateUploadTransactionTimestampAsString() {
  var timeZone = "GMT";
  var currentdate = new Date();
  var datetime = Utilities.formatDate(currentdate, timeZone, "dd/MM/yyyy@HH:mm:ss");
  datetime += timeZone;
  return datetime;
}

function getCurrentUser() {
  return Session.getActiveUser().getEmail();
}

function addTransactionDetails(jsonObject) {
  //test
  //var jsonObject = exportRowsOfActiveSheetAsJson(CONST_EXPORT_SCOPE_ENUM.INCLUDE_ONLY_CHECKED);
  
  if (!jsonObject) return;
  
  var applicationVersion = getApplicationVersion();
  var spreadsheetName = getSpreadsheetName();
  var spreadsheetUrl = getSpreadsheetUrl();
  var transactionId = generateUploadTransactionId();
  var transactionTimestamp = generateUploadTransactionTimestampAsString();
  var currentUser = getCurrentUser();
  
  jsonObject["Transaction Details"] = {};
  jsonObject["Transaction Details"]["Application Version"] = applicationVersion;
  jsonObject["Transaction Details"]["Spreadsheet Name"] = spreadsheetName;
  jsonObject["Transaction Details"]["Spreadsheet URL"] = spreadsheetUrl;
  jsonObject["Transaction Details"]["Transaction ID"] = transactionId;
  jsonObject["Transaction Details"]["Transaction Timestamp"] = transactionTimestamp;
  jsonObject["Transaction Details"]["Executed By"] = currentUser;
    
  return jsonObject;
}