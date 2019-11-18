var accessTokenNamedRange = 'accessTokenNamedRange';
var instanceUrlNamedRange = 'instanceUrlNamedRange';

sheetToDataraptorMapping = {};


function loadActiveSheetToVlocityEPC() {
    restoreCurrentTabName();
    var epcConfiguration = exportActiveSheetAsJson();
    loadConfigurationToVlocityEPCChunkable(epcConfiguration);
}

function loadSelectedRowsToVlocityEPC() {
    restoreCurrentTabName();
    var epcConfiguration = exportSelectedRowsAsJson();
    loadConfigurationToVlocityEPCChunkable(epcConfiguration);
}

function loadConfigurationToVlocityEPCChunkable(epcConfiguration) {
    var LOAD_GENERIC_EPC_DEFINITION_VIP = '/services/apexrest/vlocity_cmt/v1/integrationprocedure/EPC_LoadGenericEPCDefinitions';
    var CHUNK_SIZE = 10;
    var accessTokenObj = retrieveStoredAccessToken();
    var sheet = SpreadsheetApp.getActiveSheet();
    var sheetName = sheet.getName();
    var sheetToDataraptorMapping = loadSheetToDataraptorMapping();

    if (!accessTokenObj) {
        Logger.log('Error: Access token should be generated first');

        logProgress(
            sheetName,
            "Process Error",
            "Access token should be generated first. Check the Settings tab"
        );

        operationNotification('Operation failed', 'Access token should be generated first. Check the Settings tab');
        return;
    }

    var accessToken = accessTokenObj.accessToken;
    var url = accessTokenObj.instanceUrl + LOAD_GENERIC_EPC_DEFINITION_VIP;

    var payloadAsJson = epcConfiguration;
    payloadAsJson['dataRaptorName'] = sheetToDataraptorMapping[sheetName];

    Logger.log('*** Request size (entities):' + payloadAsJson[sheetName].length);

    var payloadChunkNumber = payloadAsJson[sheetName].length / CHUNK_SIZE;
    var processedRecords = 0;

    sheet.setName(sheetName + ' (' + processedRecords + '/' + payloadAsJson[sheetName].length + ')');

    logProgress(
        sheetName,
        "Process Info",
        payloadAsJson[sheetName].length + " records to be processed. Loading process will be done in " + Math.ceil(payloadChunkNumber) + " chunks, " + CHUNK_SIZE + " records each"
    );

    for (i = 0; i < payloadChunkNumber; i++) {
        logProgress(
            sheetName,
            "Process Info",
            "Processing chunk " + i
        );

        var chunkPayload = {};
        chunkPayload['dataRaptorName'] = sheetToDataraptorMapping[sheetName];
        chunkPayload[sheetName] = (payloadAsJson[sheetName]).slice(CHUNK_SIZE * i, CHUNK_SIZE * (i + 1));

        Logger.log('*** Chunk range: ' + (CHUNK_SIZE * i) + ', ' + (CHUNK_SIZE * (i + 1)));
        Logger.log('*** Chunk payload: ' + JSON.stringify(chunkPayload));

        var options = {
            'method': 'post',
            'contentType': 'application/json',
            'payload': JSON.stringify(chunkPayload),
            'muteHttpExceptions': true,
            'headers': {
                'Authorization': 'Bearer ' + accessToken
            },
            'escaping': false
        };

        Logger.log('***loadActiveSheetToVlocityEPC request:' + JSON.stringify(UrlFetchApp.getRequest(url, options)));

        logProgress(
            sheetName,
            "Request Payload",
            JSON.stringify(chunkPayload));

        var response = UrlFetchApp.fetch(url, options);
        Logger.log('*** loadActiveSheetToVlocityEPC response:' + response);

        logProgress(
            sheetName,
            "Response Payload",
            response);

        //error processing
        var responseAsJson = JSON.parse(response);
        var errorDetected = false;

        if (responseAsJson) {
            var result = JSON.stringify(responseAsJson['Result']);
            if (result) {
                var hasErrors = JSON.stringify(responseAsJson['Result']['hasErrors']);
                Logger.log('*** hasErrors: ' + hasErrors);
                errorDetected = hasErrors;
            } else {
                sheet.setName(sheetName + ' (Error)');
                errorDetected = true;
            }
        } else {
            sheet.setName(sheetName + ' (Error)');
            errorDetected = true;
        }

        if (errorDetected == true) {
            logProgress(
                sheetName,
                "Process Error",
                "An error detected while loading the current chunk. The loading process terminated. Successfully loaded chunks are not rolled back. Review the logs for more details");
        }

        processedRecords = Math.min((i + 1) * CHUNK_SIZE, payloadAsJson[sheetName].length);
        sheet.setName(sheetName + ' (' + processedRecords + '/' + payloadAsJson[sheetName].length + ')');


    }

    sheet.setName(sheetName + ' (Loaded)');
    sheet.setName(sheetName);


    logProgress(
        sheetName,
        "Process Info",
        "Loading process is completed");

    //operationNotification('Operation completed', 'Selected rows are successfully processed, errors returned: ' + 'TBD');
}

function exportActiveSheetAsJson() {
    var sheet = SpreadsheetApp.getActiveSheet();
    return exportSheetAsJsonByName(sheet.getName());
}

function exportSheetAsJsonByName(sheetName) {
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
}

function saveActiveSheetAsJson() {
    var sheet = SpreadsheetApp.getActiveSheet();
    return saveSheetAsJsonByName(sheet.getName());
}

function saveSheetAsJsonByName(sheetName) {
    var currentdate = new Date();
    var datetime = Utilities.formatDate(currentdate, "GMT", "dd/MM/yyyy@HH:mm:ss");
    var filename = 'Vlocity-' + sheetName + "-" + datetime + ".json";

    DriveApp.createFile(filename, JSON.stringify(exportSheetAsJsonByName(sheetName)), MimeType.PLAIN_TEXT);
}

function exportSelectedRowsAsJson() {

    var sheet = SpreadsheetApp.getActiveSheet();
    var selection = SpreadsheetApp.getSelection();
    var currentCell = selection.getCurrentCell();

    var activeRange = selection.getActiveRange();

    if (activeRange) {
        Logger.log('Active Range first row: ' + selection.getActiveRange().getRow());
        Logger.log('Active Range last row: ' + selection.getActiveRange().getLastRow());

        var numRows = activeRange.getNumRows();
        var numCols = activeRange.getNumColumns();
        var values = activeRange.getValues();
        var rowRangeOffset = Math.max(0, 3 - selection.getActiveRange().getRow());

        var result = [];
        var resultWrapper = {};

        var header = sheet.getDataRange().getValues()[1];
        if (!header) return;

        for (var i = 0; i < header.length; i++) {
            Logger.log(header[i]);
        }

        for (var i = rowRangeOffset; i < values.length; i++) {
            var rowObj = {};
            var row = values[i];
            var emptyRowFlag = true;
            Logger.log('**current row: ' + row);

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
}

function loadSheetToDataraptorMapping() {
    var sheet = SpreadsheetApp.getActive().getSheetByName('Settings');
    var rows = sheet.getDataRange();
    var numRows = rows.getNumRows();
    var numCols = rows.getNumColumns();
    var values = rows.getValues();

    for (i = 1; i < numRows; i++) {
        var row = values[i];
        sheetToDataraptorMapping[row[0]] = row[2];
    }

    Logger.log('***' + JSON.stringify(sheetToDataraptorMapping));
    return sheetToDataraptorMapping;
}