/* Generates JSON data structure using rows of a current sheet (active in browser) and export scope
 * @param enum exportScope - export all or only checked rows (CONST_EXPORT_SCOPE_ENUM.INCLUDE_ALL, CONST_EXPORT_SCOPE_ENUM.INCLUDE_ONLY_CHECKED)
 * @return JSON object (not string)
 */

function exportRowsOfActiveSheetAsJson(exportScope) {
    return exportRowsAsJson(SpreadsheetApp.getActiveSheet().getName(), exportScope);
}

/* Generates JSON data structure using rows of a sheet identified by name and export scope
 * @param string sheetName - name of a sheet
 * @param enum exportScope - export all or only checked rows (CONST_EXPORT_SCOPE_ENUM.INCLUDE_ALL, CONST_EXPORT_SCOPE_ENUM.INCLUDE_ONLY_CHECKED)
 * @return JSON object (not string)
 */

function exportRowsAsJson(sheetName, exportScope) {

    if (!sheetName) {
        Logger.log('*** No sheet name provided');
        return null;
    }

    if (!exportScope) {
        Logger.log('*** No export scope provided, using default export scope (include all)');
        exportScope = CONST_EXPORT_SCOPE_ENUM.INCLUDE_ALL;
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    var dataRange = sheet.getDataRange();
  
    if (dataRange) {
        var numRows = dataRange.getNumRows();
        var numCols = dataRange.getNumColumns();

        Logger.log('*** Data Range number of rows: ' + numRows);
        Logger.log('*** Data Range number of columns: ' + numCols);

        var values = dataRange.getValues();
        var rowRangeOffset = CONST_FIRST_DATA_ROW_NUMBER - 1;

        var result = [];
        var resultWrapper = {};

        var header = sheet.getDataRange().getValues()[CONST_LAST_HEADER_ROW_NUMBER - 1]; //CHECK ME
        if (!header) return;

        for (var i = 0; i < header.length; i++) {
            console.log('*** Header item[' + i + ']: ' + header[i]);
        }

        for (var i = rowRangeOffset; i < values.length; i++) {
            var currentRowAsRange = dataRange.offset(i, 0, 1);
          
            var rowObj = {};
            var row = values[i];

            if (!isEmptyArray(row) && !rangeContainsStrikethroughCells(currentRowAsRange)) {
                if ((exportScope === CONST_EXPORT_SCOPE_ENUM.INCLUDE_ONLY_CHECKED &&
                        row[CONST_CHECKED_COLUMN_NUMBER - 1] === true) ||
                    exportScope === CONST_EXPORT_SCOPE_ENUM.INCLUDE_ALL) {

                    for (var j = 0; j < header.length; j++) {
                        var value = row[j];

                        if (value instanceof Date && !isNaN(value.valueOf())) {
                            //apply special formatting for date values
                            value = Utilities.formatDate(value, "GMT", "dd/MM/yyyy");
                        }

                        rowObj[header[j]] = value;
                    }

                    if (rowObj != null) result.push(rowObj);
                }
            }
        }
    }

    if (result && result.length) {
        resultWrapper[sheetName] = result;
        return (resultWrapper);
    } else {
        return null;
    }


}

/**
 * Saves the active sheet content as a JSON file to user's Google Drive
 *
 * @return {File} - created file
 *
 * @example
 *     saveActiveSheetAsJsonToGDrive();
 */

function saveActiveSheetAsJsonToGDrive() {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);

    var sheet = SpreadsheetApp.getActiveSheet();

    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return saveSheetByNameAsJsonToGDrive(sheet.getName());
}

/**
 * Saves the sheet content as a JSON file to user's Google Drive
 *
 * @param {string} sheetName - sheet name
 * @return {File} - created file
 *
 * @example
 *     saveSheetByNameAsJsonToGDrive("Offerings");
 */

function saveSheetByNameAsJsonToGDrive(sheetName) {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);

    var currentdate = new Date();
    var datetime = Utilities.formatDate(currentdate, "GMT", "dd/MM/yyyy@HH:mm:ss");
    var filename = 'Vlocity-' + sheetName + "-" + datetime + ".json";

    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return DriveApp.createFile(filename, JSON.stringify(exportSheetAsJsonByName(sheetName)), MimeType.PLAIN_TEXT);
}