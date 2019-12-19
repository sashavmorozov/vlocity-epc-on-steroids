sheetToDataraptorMapping = {};

var loadingProcessProgress = 0;


function loadActiveSheetToVlocityEPC() {
    /* Before loading */
    resetLoadingProcessProgress();
    resetLoadingProcessStep();
    resetLoadingProcessError();
    resetLoadingProcessWarning();

    showProgressDialog();

    restoreCurrentTabName();

    /* Verify connection */
    setLoadingProcessStep('Checking connection to Salesforce');
    if (!isConnectedToSalesforce()) {
        console.log("*** Error: The application is not yet connected to Salesforce");
        var dialogParams = {
            "message": "Doesn't look good",
            "messageDescription": "The application is not yet connected to Salesforce. Either connect or re-connect to Salesforce organization"
        };
        displayErrorDialog(dialogParams);
        return;
    }

    setLoadingProcessStep('Exporting data from the spreadsheet');

    /* Loading */
    var sheetName = SpreadsheetApp.getActiveSheet().getName();
    if (nonDataSheets.indexOf(sheetName) !== -1) {
        console.log("*** Error: Upload process is not supported for this sheet: " + sheetName);
        var dialogParams = {
            "message": "Doesn't look good",
            "messageDescription": "Upload process is not supported for this sheet: " + sheetName
        };
        displayWarningDialog(dialogParams);
        return;
    }

    var epcConfiguration = exportRowsOfActiveSheetAsJson(CONST_EXPORT_SCOPE_ENUM.INCLUDE_ALL);
    console.log("*** epcConfiguration:" + epcConfiguration);

    if (!epcConfiguration) {
        console.log("*** Error: an empty sheet, no data to upload");
        var dialogParams = {
            "message": "Doesn't look good",
            "messageDescription": "Please verify the spreadsheet has data to upload. Looks like an empty spreadsheet now"
        };
        displayWarningDialog(dialogParams);
        return;
    }

    setLoadingProcessStep('Adding transactional data for tracking');
    addTransactionDetails(epcConfiguration);

    setLoadingProcessStep('Loading data to Vlocity');
    loadConfigurationToVlocityEPCChunkable(epcConfiguration);

    /* After loading */
    completeLoadingProcessStep();
    completeLoadingProcessProgress();
    //resetLoadingProcessError();
}

/** DEPRECATED, REPLACED WITH loadCheckedRowsToVlocityEPC **/
function loadSelectedRowsToVlocityEPC() {
    restoreCurrentTabName();
    var epcConfiguration = exportSelectedRowsAsJson();
    loadConfigurationToVlocityEPCChunkable(epcConfiguration);
}

function loadCheckedRowsToVlocityEPC() {
    /* Before loading */
    resetLoadingProcessProgress();
    resetLoadingProcessStep();
    resetLoadingProcessError();
    resetLoadingProcessWarning();

    showProgressDialog();

    restoreCurrentTabName();

    /* Verify connection */
    setLoadingProcessStep('Checking connection to Salesforce');
    if (!isConnectedToSalesforce()) {
        console.log("*** Error: The application is not yet connected to Salesforce");
        var dialogParams = {
            "message": "Doesn't look good",
            "messageDescription": "The application is not yet connected to Salesforce. Either connect or re-connect to Salesforce organization"
        };
        displayErrorDialog(dialogParams);

        return;
    }

    setLoadingProcessStep('Exporting data from the spreadsheet');

    /* Loading */
    var sheetName = SpreadsheetApp.getActiveSheet().getName();
    if (nonDataSheets.indexOf(sheetName) !== -1) {
        console.log("*** Error: Upload process is not supported for this sheet: " + sheetName);
        var dialogParams = {
            "message": "Doesn't look good",
            "messageDescription": "Upload process is not supported for this sheet: " + sheetName
        };
        displayWarningDialog(dialogParams);
        return;
    }

    var epcConfiguration = exportRowsOfActiveSheetAsJson(CONST_EXPORT_SCOPE_ENUM.INCLUDE_ONLY_CHECKED);
    console.log("*** epcConfiguration:" + epcConfiguration);

    if (!epcConfiguration) {
        console.log("*** Error: no rows checked, no data to upload");
        var dialogParams = {
            "message": "Doesn't look good",
            "messageDescription": "Please verify you checked the records you want to load. Looks like nothing was selected"
        };
        displayWarningDialog(dialogParams);
        return;
    }

    setLoadingProcessStep('Adding transactional data for tracking');
    addTransactionDetails(epcConfiguration);

    setLoadingProcessStep('Loading data to Vlocity');
    loadConfigurationToVlocityEPCChunkable(epcConfiguration);

    /* After loading */
    completeLoadingProcessStep();
    completeLoadingProcessProgress();
    //resetLoadingProcessError();
}


function loadConfigurationToVlocityEPCChunkable(epcConfiguration) {
    var LOAD_GENERIC_EPC_DEFINITION_VIP = '/services/apexrest/vlocity_cmt/v1/integrationprocedure/EPC_LoadGenericEPCDefinitions';
    var CHUNK_SIZE = 10;
    var accessTokenObj = retrieveStoredAccessToken();
    var sheet = SpreadsheetApp.getActiveSheet();
    var sheetName = sheet.getName();
    var sheetToDataraptorMapping = loadSheetToDataraptorMapping();

    Logger.log("*** epcConfiguration: " + epcConfiguration);

    if (!epcConfiguration) {
        console.log("*** Error: no data to upload");
        return;
    }

    //setLoadingProcessStep("Connecting to Salesforce");
    if (!accessTokenObj ||
        !accessTokenObj.accessToken ||
        !accessTokenObj.instanceUrl) {
        Logger.log('Error: Access token should be generated first');

        logProgress(
            sheetName,
            "Process Error",
            "Access token should be generated first. Connect to Salesforce organization"
        );

        operationNotification('Operation failed', 'Access token should be generated first. Connect to Salesforce organization');
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

        addTransactionDetails(chunkPayload);

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

        Logger.log('*** loadActiveSheetToVlocityEPC request:' + JSON.stringify(UrlFetchApp.getRequest(url, options)));

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

        processDataraptorResponse(responseAsJson, chunkPayload[sheetName].length);

        var errorDetected = false;

        /* if (responseAsJson) {
           

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
        } */

        //this none-sense doesn't work
        Logger.log('errorDetected = ' + errorDetected);
        if (errorDetected == true) {
            raiseLoadingProcessError();

            logProgress(
                sheetName,
                "Process Error",
                "An error detected while loading the current chunk. The loading process terminated. Successfully loaded chunks are not rolled back. Review the logs for more details");
        }

        processedRecords = Math.min((i + 1) * CHUNK_SIZE, payloadAsJson[sheetName].length);
        sheet.setName(sheetName + ' (' + processedRecords + '/' + payloadAsJson[sheetName].length + ')');

        loadingProcessProgress = processedRecords / payloadAsJson[sheetName].length * 100;
        updateLoadingProcessProgress(Math.round(loadingProcessProgress));
    }

    sheet.setName(sheetName + ' (Loaded)');
    sheet.setName(sheetName);

    completeLoadingProcessProgress();
    completeLoadingProcessStep();

    logProgress(
        sheetName,
        "Process Info",
        "Loading process is completed");

    //operationNotification('Operation completed', 'Selected rows are successfully processed, errors returned: ' + 'TBD');
}

/**
 * Analyses the response message from a dataraptor/integration procedure. Check response status and validates the number of create/updated records
 *
 * @param {object} response - integration procedure response as object
 * @param {number} inputRecordsCount - number of records to process (typically a chunk length)
 * @return {voic} - nothing
 *
 * @example
 *     processDataraptorResponse(responseAsJson, chunkPayload[sheetName].length);
 */

function processDataraptorResponse(response, inputRecordsCount) {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);

    console.log("*** VARIABLE: response: " + JSON.stringify(response));

    if (!response) {
        console.log('*** ERROR: An empty response (or no response) received from dataraptor');
        raiseLoadingProcessError();
        return null;
    }

    /* quick status check */
    var dataRaptorStatus = response.Status;

    if (!dataRaptorStatus) {
        console.log('*** ERROR: An empty status (or no status) received from dataraptor');
        raiseLoadingProcessError();
        return;
    } else {
        if (dataRaptorStatus === "Failed") {
            console.log("*** ERROR: " + "Failed status received from dataraptor. Please review the process logs and make necessary corrections");
            var dialogParams = {
                "message": "Doesn't look right",
                "messageDescription": "Failed status received from dataraptor. Please review the process logs and make necessary corrections"
            };
            displayErrorDialog(dialogParams);
            return;
        } else {
            //other search
        }
    }

    /* execution result records count */
    var dataRaptorResult = response.Result;

    if (!dataRaptorResult) {
        console.log('*** ERROR: An empty result (or no result) received from dataraptor');
        raiseLoadingProcessError();
        return null;
    } else {
        /* result is received and is not empty */
        var itnerfaceInfo = dataRaptorResult.interfaceInfo;
        var itnerfaceInfoKeyMap = Object.keys(itnerfaceInfo);
        var dataraptorName = itnerfaceInfoKeyMap[0];
        console.log('*** VARIABLE: dataraptorName: ' + dataraptorName);

        var createdObjectsCount = 0;
        var createdObjectsByType = dataRaptorResult.createdObjectsByType;

        if (isEmpty(createdObjectsByType)) {
            console.log("*** ERROR: " + "No objects were created/updated");

            var dialogParams = {
                "message": "Doesn't look right",
                "messageDescription": "No objects were created/updated"
            };
            displayErrorDialog(dialogParams);
            return;
        }

        var createdObjectsByTypeEffective = dataRaptorResult.createdObjectsByType[dataraptorName];

        var createdObjectsByTypeEffectiveKeyMap = Object.keys(createdObjectsByTypeEffective);
        for each (var key in createdObjectsByTypeEffectiveKeyMap) {
            createdObjectsCount += createdObjectsByTypeEffective[key].length;
        }

        var expectedCreatedObjectsCount = inputRecordsCount * createdObjectsByTypeEffectiveKeyMap.length;

        console.log("*** VARIABLE: inputRecordsCount: " + inputRecordsCount);
        console.log("*** VARIABLE: expectedCreatedObjectsCount: " + expectedCreatedObjectsCount);
        console.log("*** VARIABLE: createdObjectsCount: " + createdObjectsCount);

        if (createdObjectsCount !== expectedCreatedObjectsCount) {
            console.log("*** WARNING: Looks like the process created/updated less records than expected. Expected: " + expectedCreatedObjectsCount + ", actually created/updated: " + createdObjectsCount);

            var dialogParams = {
                "message": "Looks okay but not quite right",
                "messageDescription": "The process is completed and no technical errors detected. However, it looks like the process created/updated less records than expected.\n" +
                "<ul>" +  
                "<li>Expected: " + expectedCreatedObjectsCount + "</li>"+
                "<li>Actually created/updated: " + createdObjectsCount + "</li>" +
                "</ul><br>" + 
                "This could occur if some baseline records are not yet uploaded to the catalog. For example, a parent picklist should be uploaded before uploading picklist values"
            };
            displayWarningDialog(dialogParams);
            return;
        }
    }

    console.log("*** METHOD_EXIT: " + arguments.callee.name);
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
            var rowObj = {};
            var row = values[i];

            if (!isEmptyArray(row)) {
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