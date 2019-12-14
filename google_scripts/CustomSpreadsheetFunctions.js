/**
 * The function name of the current sheet. Can be used as a formula in the sheets
 *
 * @return {string} name of the current sheet
 *
 * @example
 *
 *     =SheetName() in Google Spreadsheets
 */

function SheetName() {
    var key = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
    return key;
}