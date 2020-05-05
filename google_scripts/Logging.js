var LOGS_SHEET_NAME = "Logs";
var LOGS_TIMESTAMP_FORMAT = "dd MMM yyyy, HH:mm:ss";
var LOGS_TIMESTAMP_ZONE = "GMT";
var CONST_MAX_LOG_MESSAGE_LENGTH = 5000;

/* Maxiumum number of log entries stored on the Logs sheet. 
 * Once reached - the content of the sheet will be erased
 */
var CONST_MAX_NUMBER_OF_LOG_ENTRIES = 250;

function viewLogs() {
    SpreadsheetApp.setActiveSheet(SpreadsheetApp.getActive().getSheetByName(LOGS_SHEET_NAME)); 
}

function clearLogs() {

    var logsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOGS_SHEET_NAME);
    var lastRowNumber = logsSheet.getLastRow();
    var emptyLogEntries = 10;
    var firstLogEntryRow = 2;
    var firstLogEntryColumn = 1;
  
    if (lastRowNumber > emptyLogEntries) {
      logsSheet.deleteRows(emptyLogEntries, lastRowNumber - emptyLogEntries);
    }
  
    var data = [];
    var LogEntryLength = 4;

    for(var i = 0; i < LogEntryLength; i++) {
      data.push([]);
    }
  
    var dataSet = [];

    for(var i = 0; i < emptyLogEntries; i++) {
      dataSet.push(data);
    }
  
    logsSheet.getRange(firstLogEntryRow, firstLogEntryColumn, emptyLogEntries, LogEntryLength).setValues(dataSet);
}

function logProgress(entityName, entryName, entryDetails) {
  console.log("*** METHOD_ENTRY: " + arguments.callee.name);
  console.time(arguments.callee.name);

  if (!entryDetails) {
    console.log("*** WARNING: " + "Nothing to log");
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    console.timeEnd(arguments.callee.name);
    return;
  }

  if (entryDetails.toString().length > CONST_MAX_LOG_MESSAGE_LENGTH) {
    entryDetails =
      "Logging output too large. Truncating output. " +
      entryDetails.toString().substring(0, CONST_MAX_LOG_MESSAGE_LENGTH);
  }

  var logsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    LOGS_SHEET_NAME
  );
  var lastRowNumber = logsSheet.getLastRow();

  if (lastRowNumber > CONST_MAX_NUMBER_OF_LOG_ENTRIES) {
    console.log("*** INFO: " + "Application logs are recycled");
    clearLogs();
    lastRowNumber = logsSheet.getLastRow();
  }
  var obj = [[]];

  obj[0][0] = Utilities.formatDate(
    new Date(),
    LOGS_TIMESTAMP_ZONE,
    LOGS_TIMESTAMP_FORMAT
  );
  obj[0][1] = entityName;
  obj[0][2] = entryName;
  obj[0][3] = entryDetails;

  var r = logsSheet.getRange(lastRowNumber + 1, 1, 1, obj[0].length);

  r.setValues(obj);
  console.log("*** METHOD_EXIT: " + arguments.callee.name);
  console.timeEnd(arguments.callee.name);
  return;
}
