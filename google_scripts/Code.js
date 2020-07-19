sheetToDataraptorMapping = {};

var loadingProcessProgress = 0;



/* function exportActiveSheetAsJson() {
    var sheet = SpreadsheetApp.getActiveSheet();
    return exportSheetAsJsonByName(sheet.getName());
} */

/* function exportSheetAsJsonByName(sheetName) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

    var rows = sheet.getDataRange();
    var numRows = rows.getNumRows();
    var numCols = rows.getNumColumns();
    var values = rows.getValues();

    var result = [];
    var resultWrapper = {};

    var groupHeader = values[0];
    var header = values[1];
    var dataRowOffset = 2;
    var emptyStringFlag = true;

    for (var i = dataRowOffset; i < numRows; i++) {
        emptyStringFlag = true;

        var row = values[i];

        for (var a = 0; a < numCols; a++) {
            if (row[a] != "") emptyStringFlag = false;
        }

        if (!emptyStringFlag) {
            rowObj = {};
            for (var a = 0; a < numCols; a++) {
                if (row[a] instanceof Date && !isNaN(row[a].valueOf())) {
                    //apply special formatting for date values
                    rowObj[header[a]] = Utilities.formatDate(row[a], "GMT", "dd/MM/yyyy");
                } else {
                    rowObj[header[a]] = row[a];
                }
            }

            if (rowObj != null) result.push(rowObj);
        }
    }

    resultWrapper[sheet.getName()] = result;
    return (resultWrapper);
} */



/* function exportSelectedRowsAsJson() {

    var sheet = SpreadsheetApp.getActiveSheet();
    var selection = SpreadsheetApp.getSelection();
    var currentCell = selection.getCurrentCell();

    var activeRange = selection.getActiveRange();

    if (activeRange) {
        console.log('Active Range first row: ' + selection.getActiveRange().getRow());
        console.log('Active Range last row: ' + selection.getActiveRange().getLastRow());

        var numRows = activeRange.getNumRows();
        var numCols = activeRange.getNumColumns();
        var values = activeRange.getValues();
        var rowRangeOffset = Math.max(0, 3 - selection.getActiveRange().getRow());

        var result = [];
        var resultWrapper = {};

        var header = sheet.getDataRange().getValues()[1];
        if (!header) return;

        for (var i = 0; i < header.length; i++) {
            console.log(header[i]);
        }

        for (var i = rowRangeOffset; i < values.length; i++) {
            var rowObj = {};
            var row = values[i];
            var emptyRowFlag = true;
            console.log('**current row: ' + row);

            for (var j = 0; j < header.length; j++) {
                if (row[j] != "") emptyRowFlag = false;
            }
            if (!emptyRowFlag) {
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

    resultWrapper[sheet.getName()] = result;
    return (resultWrapper);
} */



/* function loadSheetToDataraptorMapping() {
    var sheet = SpreadsheetApp.getActive().getSheetByName('Settings');
    var rows = sheet.getDataRange();
    var numRows = rows.getNumRows();
    var numCols = rows.getNumColumns();
    var values = rows.getValues();

    for (i = 1; i < numRows; i++) {
        var row = values[i];
        sheetToDataraptorMapping[row[0]] = row[2];
    }

    console.log('***' + JSON.stringify(sheetToDataraptorMapping));
    return sheetToDataraptorMapping;
} */