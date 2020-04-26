/**
 * Activates a sheet by name
 * @param {string} sheetName - name of a sheet to clear
 * @return 
 *
 * @example
 *     activateSheetByName();
 */
function activateSheetByName(sheetName) {
    SpreadsheetApp.setActiveSheet(SpreadsheetApp.getActive().getSheetByName(sheetName)); 
}

/**
 * 
 * Erases content of a sheet, leaving a defined number of empty rows
 * @param {string} sheetName - name of a sheet to clear
 * @param {integer} numberOfHeaderRows - number of header rows
 * @param {integer} numberOfEmptyDataRowsToKeep - number of empty data rows to keep
 * @return 
 *
 * @example
 *     var sheetName = CONST_STATUS_REPORT_SHEET_NAME;
 *     var numberOfHeaderRows = 1;
 *     var numberOfEmptyDataRowsToKeep = 10;
 *     clearSheetContentByName(sheetName, numberOfHeaderRows, numberOfEmptyDataRowsToKeep);
 */
function clearSheetContentByName(sheetName, numberOfHeaderRows, numberOfEmptyDataRowsToKeep) {

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    var lastRowNumber = sheet.getLastRow();
    var lastColumnNumber = sheet.getLastColumn();
   
    if (lastRowNumber > numberOfEmptyDataRowsToKeep) {
        sheet.deleteRows(numberOfEmptyDataRowsToKeep, lastRowNumber - numberOfEmptyDataRowsToKeep);
    }
  
    var rowData = [];
    for (var i = 0; i < lastColumnNumber; i++) {
        rowData.push([]);
    }
  
    var rangeData = [];
    for (var i = 0; i < numberOfEmptyDataRowsToKeep; i++) {
        rangeData.push(rowData);
    }
  
    sheet.getRange(numberOfHeaderRows + 1, 1, numberOfEmptyDataRowsToKeep, lastColumnNumber).setValues(rangeData);
}