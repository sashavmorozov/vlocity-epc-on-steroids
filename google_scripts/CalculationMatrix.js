function getCalculationMatrixHeadersFromActiveSheet() {
    var sheet = SpreadsheetApp.getActiveSheet();
    return getCalculationMatrixHeadersBySheetName(sheet.getName());
}

function getCalculationMatrixDataFromActiveSheet() {
}

function getCalculationMatrixHeadersBySheetName(sheetName) {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);

    console.log(JSON.stringify(exportSheetAsJsonByName2(sheetName, "HEADERS", "DATA", "headersInformation")));
    console.log(JSON.stringify(exportSheetAsJsonByName2(sheetName, "DATA", "", "dataInformation")));

    console.log("*** METHOD_EXIT: " + arguments.callee.name);
}

function getCalculationMatrixDataBySheetName(sheetName) {
}

function exportSheetAsJsonByName2(sheetName, fromSection, toSection, wrapperNodeName) {
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

    var firstDataRowNumber = dataRowOffset;
    var lastDataRowNumber = numRows;

    for (var i = 0; i < numRows; i++) {
        var row = values[i];
        if (fromSection && row[1] === fromSection) {
            header = values[i + 1];
            firstDataRowNumber = i + 2;
        }

        if (toSection && row[1] === toSection) {
            lastDataRowNumber = i ;
        }
    }

    for (var i = firstDataRowNumber; i < lastDataRowNumber; i++) {
        emptyStringFlag = true;

        var row = values[i];

        for (var a = 0; a < numCols; a++) {
            if (row[a] != "") emptyStringFlag = false;
        }

        if (!emptyStringFlag) {
            rowObj = {};
            for (var a = 0; a < numCols; a++) {
                if (row[a]) {
                    if (row[a] instanceof Date && !isNaN(row[a].valueOf())) {
                        //apply special formatting for date values
                        rowObj[header[a]] = Utilities.formatDate(row[a], "GMT", "dd/MM/yyyy");
                    } else {
                        rowObj[header[a]] = row[a];
                    }
                }
            }

            if (rowObj != null) result.push(rowObj);
        }
    }

    resultWrapper[wrapperNodeName] = result;
    return (resultWrapper);
}