sheetToDataraptorMapping = {};

var loadingProcessProgress = 0;

/**
 * Analyses the response message from a dataraptor/integration procedure. Check response status and validates the number of create/updated records
 *
 * @param {object} response - integration procedure response as object
 * @param {number} inputRecordsCount - number of records to process (typically a chunk length)
 * @return {void} - nothing
 *
 * @example
 *     processDataraptorResponse(responseAsJson, chunkPayload[sheetName].length);
 */

function processDataraptorResponse(response, inputRecordsCount) {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);
    
    /* this structure will be returned as a result of the processing business logic */
    var validationResult = {
        status: "SUCCESS",
        code: "",
        message: "",
        description: ""
    }

    console.log("*** VARIABLE: response: " + JSON.stringify(response));

    /* check if response is not empty */
    if (!response) {
        console.log('*** ERROR: An empty response (or no response) received from dataraptor');
        setAggregatedLoadingProcessStatus("ERROR");
        
        validationResult.status = "ERROR";
        validationResult.code = "EMPTY_RESPONSE";
        validationResult.message = "An empty response (or no response) received from dataraptor";
        validationResult.description = "An empty response (or no response) received from dataraptor";
        
        return validationResult;
    }

    /* check if response returned non-error status */
    var dataRaptorStatus = response.Status;

    if (!dataRaptorStatus) {
        console.log('*** ERROR: An empty status (or no status) received from dataraptor');
        setAggregatedLoadingProcessStatus("ERROR");
        
        validationResult.status = "ERROR";
        validationResult.code = "EMPTY_RESPONSE_STATUS";
        validationResult.message = "An empty status (or no status) received from dataraptor";
        validationResult.description = "An empty status (or no status) received from dataraptor";
        
        return validationResult;
    } else {
        if (dataRaptorStatus === "Failed") {
            console.log("*** ERROR: " + "Failed status received from dataraptor. Please review the process logs and make necessary corrections");
            setAggregatedLoadingProcessStatus("ERROR");
        
            validationResult.status = "ERROR";
            validationResult.code = "FAILED_RESPONSE_STATUS";
            validationResult.message = "Failed status received from dataraptor. Please review the process logs and make necessary corrections";
            validationResult.description = "Failed status received from dataraptor. Please review the process logs and make necessary corrections";
            
            return validationResult;

        } else {
            //other search
        }
    }

    /* execution result records count */
    var dataRaptorResult = response.Result;

    /* check if response result is not empty */
    if (!dataRaptorResult) {
        console.log('*** ERROR: An empty result (or no result) received from dataraptor');
        setAggregatedLoadingProcessStatus("ERROR");
        
        validationResult.status = "ERROR";
        validationResult.code = "EMPTY_RESPONSE_RESULT";
        validationResult.message = "An empty result (or no result) received from dataraptor";
        validationResult.description = "An empty result (or no result) received from dataraptor";
        
        return validationResult;
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
            setAggregatedLoadingProcessStatus("ERROR");
        
            validationResult.status = "ERROR";
            validationResult.code = "NO_OBJECTS_CREATED";
            validationResult.message = "No objects were created/updated";
            validationResult.description = "No objects were created/updated";
            
            return validationResult;
        }

        var createdObjectsByTypeEffective = dataRaptorResult.createdObjectsByType[dataraptorName];

        var createdObjectsByTypeEffectiveKeyMap = Object.keys(createdObjectsByTypeEffective);
      
        for (var i = 0; i < createdObjectsByTypeEffectiveKeyMap.length; i++) { 
            var key = createdObjectsByTypeEffectiveKeyMap[i];
            createdObjectsCount += createdObjectsByTypeEffective[key].length;
        }

        var expectedCreatedObjectsCount = inputRecordsCount * createdObjectsByTypeEffectiveKeyMap.length;

        console.log("*** VARIABLE: inputRecordsCount: " + inputRecordsCount);
        console.log("*** VARIABLE: expectedCreatedObjectsCount: " + expectedCreatedObjectsCount);
        console.log("*** VARIABLE: createdObjectsCount: " + createdObjectsCount);

        if (createdObjectsCount !== expectedCreatedObjectsCount) {
            /* console.log("*** WARNING: Looks like the process created/updated less records than expected. Expected: " + expectedCreatedObjectsCount + ", actually created/updated: " + createdObjectsCount);

            var dialogParams = {
                "message": "Looks okay but not quite right",
                "messageDescription": "The process is completed and no technical errors detected. However, it looks like the process created/updated less records than expected.\n" +
                "<ul>" +  
                "<li>Expected: " + expectedCreatedObjectsCount + "</li>"+
                "<li>Actually created/updated: " + createdObjectsCount + "</li>" +
                "</ul><br>" + 
                "This could occur if some baseline records are not yet uploaded to the catalog. For example, a parent picklist should be uploaded before uploading picklist values"
            };
            displayWarningDialog(dialogParams); */
            
            console.log("*** WARNING: " + "Looks like the process created/updated less records than expected. Expected: " + expectedCreatedObjectsCount + ", actually created/updated: " + createdObjectsCount);
            setAggregatedLoadingProcessStatus("WARNING");
        
            validationResult.status = "WARNING";
            validationResult.code = "LESS_THAN_EXPECTED_NUMBER_OF_OBJECTS_CREATED";
            validationResult.message = "Looks like the process created/updated less records than expected. Expected: " + expectedCreatedObjectsCount + ", actually created/updated: " + createdObjectsCount;
            validationResult.description = "Looks like the process created/updated less records than expected. Expected: " + expectedCreatedObjectsCount + ", actually created/updated: " + createdObjectsCount;
            
            return validationResult;
        }
    }
    return validationResult;
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



function exportSelectedRowsAsJson() {

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

    console.log('***' + JSON.stringify(sheetToDataraptorMapping));
    return sheetToDataraptorMapping;
}