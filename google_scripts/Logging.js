var LOGS_SHEET_NAME = "Logs";
var LOGS_TIMESTAMP_FORMAT = "dd MMM yyyy, HH:mm:ss";
var LOGS_TIMESTAMP_ZONE = "GMT";

function clearLogs() {

    var logsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOGS_SHEET_NAME);
    var lastRowNumber = logsSheet.getLastRow();
  
    logsSheet.deleteRows(2, lastRowNumber - 1);
    logsSheet.insertRows(2, 10);   
}

function logProgress(entityName, entryName, entryDetails) {

    var logsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOGS_SHEET_NAME);
    var lastRowNumber = logsSheet.getLastRow();
    var obj = [
        []
    ];
    
    obj[0][0] = Utilities.formatDate(new Date(), LOGS_TIMESTAMP_ZONE, LOGS_TIMESTAMP_FORMAT);
    obj[0][1] = entityName;
    obj[0][2] = entryName;
    obj[0][3] = entryDetails;

    var r = logsSheet.getRange(lastRowNumber + 1, 1, 1, obj[0].length);

    r.setValues(obj);
}