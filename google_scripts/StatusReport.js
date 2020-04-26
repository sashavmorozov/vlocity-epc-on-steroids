var CONST_STATUS_REPORT_SHEET_NAME = "Status Report";
var CONST_STATUS_REPORT_TIMESTAMP_FORMAT = "dd MMM yyyy, HH:mm:ss";
var CONST_STATUS_REPORT_TIMESTAMP_ZONE = "GMT";
var CONST_STATUS_REPORT_MAX_DETAILS_MESSAGE_LENGTH = 5000;
var CONST_STATUS_REPORT_COLUMNS = Object.freeze({
        "Chunk Number": 0,
        "Processing Started": 1,
        "Processing Completed": 2,
        "Status": 3,
        "Details": 4
    }
);

/**
 * Redirects to the status report tab in the document
 * @param 
 * @return 
 *
 * @example
 *     viewStatusReport();
 */
function viewStatusReport() {
    activateSheetByName(CONST_STATUS_REPORT_SHEET_NAME); 
}

/**
 * Clears status report
 * @param 
 * @return 
 *
 * @example
 *     clearStatusReport();
 */
function clearStatusReport() {
    var sheetName = CONST_STATUS_REPORT_SHEET_NAME;
    var numberOfHeaderRows = 1;
    var numberOfEmptyDataRowsToKeep = 10;
    clearSheetContentByName(sheetName, numberOfHeaderRows, numberOfEmptyDataRowsToKeep); 
}

/**
 * Writes a status report record into the status report
 * @param {Object} statusReportItem - status report item, following the structure of the status report table
 * @return 
 *
 * @example
 *    var statusReportItem = {};
 *
 *    //Success
 *    statusReportItem["Chunk Number"] = 1;
 *    statusReportItem["Processing Started"] = Utilities.formatDate(
 *        new Date(),
 *        CONST_STATUS_REPORT_TIMESTAMP_ZONE,
 *        CONST_STATUS_REPORT_TIMESTAMP_FORMAT
 *    );
 *    statusReportItem["Processing Completed"] = Utilities.formatDate(
 *        new Date(),
 *        CONST_STATUS_REPORT_TIMESTAMP_ZONE,
 *        CONST_STATUS_REPORT_TIMESTAMP_FORMAT
 *    );
 *    statusReportItem["Status"] = "SUCCESS";
 *    statusReportItem["Details"] = "All good here";
 * 
 *    writeStatusReportItem(statusReportItem);
 */
 
function writeStatusReportItem(statusReportItem) {
  console.log("*** METHOD_ENTRY: " + arguments.callee.name);

  if (!statusReportItem) {
    console.log('*** No content to write provided');
        
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return null;
  }

  if (!statusReportItem["Details"]) {
    statusReportItem["Details"] = "";
  }

  if (statusReportItem["Details"].toString().length > CONST_STATUS_REPORT_MAX_DETAILS_MESSAGE_LENGTH) {
    statusReportItem["Details"] =
      "Data too large. Truncating output. " +
      statusReportItem["Details"].toString().substring(0, CONST_STATUS_REPORT_MAX_DETAILS_MESSAGE_LENGTH);
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONST_STATUS_REPORT_SHEET_NAME);
  var lastRowNumber = sheet.getLastRow();
  var obj = [[]];

  obj[0][CONST_STATUS_REPORT_COLUMNS["Chunk Number"]] = statusReportItem["Chunk Number"];
  obj[0][CONST_STATUS_REPORT_COLUMNS["Processing Started"]] = statusReportItem["Processing Started"];
  obj[0][CONST_STATUS_REPORT_COLUMNS["Processing Completed"]] = statusReportItem["Processing Completed"];
  obj[0][CONST_STATUS_REPORT_COLUMNS["Status"]] = statusReportItem["Status"];
  obj[0][CONST_STATUS_REPORT_COLUMNS["Details"]] = statusReportItem["Details"];

  var range = sheet.getRange(lastRowNumber + 1, 1, 1, obj[0].length);

  range.setValues(obj);
  console.log("*** METHOD_EXIT: " + arguments.callee.name);
}

