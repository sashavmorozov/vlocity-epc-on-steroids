function resetProcessStep () {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);
    console.time(arguments.callee.name);
    
    deleteUserProperties();

    setBackendProcessInfoProcessProgress(0);
    setBackendProcessInfoProcessStatus("");
    setBackendProcessInfoProcessStep("Just started");
    setBackendProcessInfoProcessDetails("Preparing the process, resetting progress");

    console.timeEnd(arguments.callee.name);
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return;
}

function checkConnectionToSalesforceStep () {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);
    console.time(arguments.callee.name);
    
    var state = 1;

    setBackendProcessInfoProcessProgress(10);
    setBackendProcessInfoProcessStatus("");
    setBackendProcessInfoProcessStep("Checking connection to Salesforce");
    setBackendProcessInfoProcessDetails("Quick check of the connection before doing the magic");

    if (!isConnectedToSalesforce()) {
        console.log("*** Error: The application is not yet connected to Salesforce");
        state = 0;
        var dialogParams = {
            "message": "Doesn't look good",
            "messageDescription": "The application is not yet connected to Salesforce. Either connect or re-connect to Salesforce organization"
        };
        displayErrorDialog(dialogParams);
        return state;
    }

    console.timeEnd(arguments.callee.name);
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return state;
}

function collectRecordsToPushStep (exportScope) {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);
    console.time(arguments.callee.name);
    
    var state = 1;

    setBackendProcessInfoProcessProgress(15);
    setBackendProcessInfoProcessStatus("");
    setBackendProcessInfoProcessStep("Exporting data from the spreadsheet");
    setBackendProcessInfoProcessDetails("Gathering data from the spreadsheet to push");

    var sheetName = SpreadsheetApp.getActiveSheet().getName();
    if (nonDataSheets.indexOf(sheetName) !== -1) {
        console.log("*** Error: Upload process is not supported for this sheet: " + sheetName);
        var dialogParams = {
            "message": "Doesn't look good",
            "messageDescription": "Upload process is not supported for this sheet: " + sheetName
        };
        displayWarningDialog(dialogParams);
        state = 0;
        return state;
    }

    var epcConfiguration = exportRowsOfActiveSheetAsJson(exportScope);
    console.log("*** epcConfiguration:" + JSON.stringify(epcConfiguration));

    if (!epcConfiguration) {
        console.log("*** Error: no rows checked, no data to upload");
        var dialogParams = {
            "message": "Doesn't look good",
            "messageDescription": "Please verify you checked the records you want to load. Looks like nothing was selected"
        };
        displayWarningDialog(dialogParams);
        state = 0;
        return state;
    }

    addTransactionDetails(epcConfiguration);

    console.timeEnd(arguments.callee.name);
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return epcConfiguration;
}

function pushConfigurationStep (epcConfiguration) {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);
    console.time(arguments.callee.name);
    
    setBackendProcessInfoProcessProgress(20);
    setAggregatedLoadingProcessStatus("");
    setBackendProcessInfoProcessStep("Loading data to Vlocity");
    setBackendProcessInfoProcessDetails("Loading the collected data into Vlocity");

    showProgressDialog(); //hack
    pushConfigurationToVlocityChunkable(epcConfiguration);

    console.timeEnd(arguments.callee.name);
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return;
}

function completeProcessStep () {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);
    console.time(arguments.callee.name);
    
    setBackendProcessInfoProcessProgress(100);
    setAggregatedLoadingProcessStatus("SUCCESS");
    setBackendProcessInfoProcessStep("Just finished");
    setBackendProcessInfoProcessDetails("We just finished the processing");

    console.timeEnd(arguments.callee.name);
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return;
}