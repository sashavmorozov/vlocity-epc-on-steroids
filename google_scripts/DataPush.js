var loadingProcessProgress = 0;

/**
 * Uploads (pushes) catalog configuration (whole records from the active sheet) to the Vlocity catalog. Assigned to a menu item
 *
 * @param nothing
 * @return nothing
 *
 * @example
 *     pushActiveSheetToVlocityEPC();
 */

function pushActiveSheetToVlocityEPC() {

    /* Before loading */
    processStep_resetProcess();

    /* Verify connection */
    if (!checkConnectionToSalesforceStep()) {
        return;
    }

    /* collect data to push */
    var epcConfiguration = collectRecordsToPushStep(CONST_EXPORT_SCOPE_ENUM.INCLUDE_ALL);
    if (!epcConfiguration) {
        return;
    }

    saveLastBusinessOperationDetails(
        SpreadsheetApp.getActiveSheet().getName(),
        arguments.callee.name,
        epcConfiguration,
        "",
        ""
    )

    pushConfigurationStep(epcConfiguration);    

    /* After loading */
    processStep_completeProcess();
}

/**
 * Uploads (pushes) catalog configuration (only checked records from the active sheet) to the Vlocity catalog. Assigned to a menu item
 *
 * @param nothing
 * @return nothing
 *
 * @example
 *     pushCheckedRowsToVlocityEPC();
 */

function pushCheckedRowsToVlocityEPC() {
    /* Before loading */
    processStep_resetProcess();

    /* Verify connection */
    if (!checkConnectionToSalesforceStep()) {
        return;
    }
    
    /* collect data to push */
    var epcConfiguration = collectRecordsToPushStep(CONST_EXPORT_SCOPE_ENUM.INCLUDE_ONLY_CHECKED);
    if (!epcConfiguration) {
        return;
    }

    saveLastBusinessOperationDetails(
        SpreadsheetApp.getActiveSheet().getName(),
        arguments.callee.name,
        epcConfiguration,
        "",
        ""
    )

    pushConfigurationStep(epcConfiguration);    

    /* After loading */
    processStep_completeProcess();
}

/**
 * Loads catalog configuration (for a single entity) to the Vlocity catalog
 *
 * @param {Object} epcConfiguration - catalog configuration in the form of a JSON object (json-object, not string)
 * @return {nothing}
 *
 * @example
 *     var epcConfiguration = exportRowsOfActiveSheetAsJson(CONST_EXPORT_SCOPE_ENUM.INCLUDE_ONLY_CHECKED);
 *     pushConfigurationToVlocityChunkable(epcConfiguration);
 */

function pushConfigurationToVlocityChunkable(epcConfiguration) {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);

    var accessTokenObj = retrieveStoredAccessToken();
    var sheet = SpreadsheetApp.getActiveSheet();
    var sheetName = sheet.getName();
    var sheetToDataraptorMapping = loadSheetToDataraptorMapping2();

    console.log('*** sheetToDataraptorMapping: ' + JSON.stringify(sheetToDataraptorMapping));

    var isHeavyLoad = false;

    console.log("*** VARIABLE: epcConfiguration: " + JSON.stringify(epcConfiguration));

    clearStatusReport();

    if (!epcConfiguration) {
        var message = "No data provided to push";
        console.log("*** ERROR: " + message);
        logProgress("Data Push: " + sheetName, arguments.callee.name, message);

        console.log("*** METHOD_EXIT: " + arguments.callee.name);
        return;
    }

    if (!accessTokenObj[CONST_ACCESS_TOKEN_PROPERTY_NAME] ||
        !accessTokenObj[CONST_INSTANCE_URL_PROPERTY_NAME]) {

        var message = "The application is not connected to Salesforce yet";
        console.log("*** ERROR: " + message);
        logProgress("Data Push: " + sheetName, arguments.callee.name, message);

        console.log("*** METHOD_EXIT: " + arguments.callee.name);
        return;
    }

    var vipName = 'EPC_LoadGenericEPCDefinitions';
    //var vipName = 'EPC_AsyncWrapper';

    var payloadAsJson = epcConfiguration;
    payloadAsJson.dataRaptorName = sheetToDataraptorMapping[sheetName].uploadToCatalogDataraptorName;
    setBackendProcessInfoProcessEntityApiName(sheetToDataraptorMapping[sheetName].objectApiName);
    setBackendProcessInfoProcessEntityViewUrl(generateViewRecordsUrl(sheetToDataraptorMapping[sheetName].objectApiName));

    console.log("*** INFO: Request size (entities): " + payloadAsJson[sheetName].length);
    if (payloadAsJson[sheetName].length > CONST_HEAVY_LOAD_THRESHOLD) {
        isHeavyLoad = true;
        console.log("*** INFO: A batch (non real-time) mode will be used to process this request");
    }

    var payloadChunkNumber = payloadAsJson[sheetName].length / CHUNK_SIZE;
    var processedRecords = 0;

    logProgress(
        "Data Push: " + sheetName,
        arguments.callee.name,
        payloadAsJson[sheetName].length + " records to be processed. Loading process will be done in " + Math.ceil(payloadChunkNumber) + " chunks, " + CHUNK_SIZE + " records per chunk"
    );

    for (var i = 0; i < payloadChunkNumber; i++) {

        console.log("*** INFO: " + "Processing chunk number " + (i + 1));
        console.log("*** INFO: " + "Chunk range: " + (CHUNK_SIZE * i) + ", " + (CHUNK_SIZE * (i + 1)));
        console.log("*** INFO: " + "Chunk payload: " + JSON.stringify(chunkPayload));

        logProgress(
            "Data Push: " + sheetName,
            arguments.callee.name,
            "Processing chunk number " + (i + 1)
        );

        var processingStarted = new Date();
        var chunkPayload = {};
        chunkPayload.chunkNumber = i;
        chunkPayload.entityName = sheetName;

        if (!isHeavyLoad) {
            chunkPayload.dataRaptorName = sheetToDataraptorMapping[sheetName].uploadToCatalogDataraptorName;
            chunkPayload[sheetName] = (payloadAsJson[sheetName]).slice(CHUNK_SIZE * i, CHUNK_SIZE * (i + 1));
        } else {           
            chunkPayload.dataRaptorName = CONST_HEAVY_LOAD_DATARAPTOR_NAME;
            chunkPayload.dataRaptorNameRealtime = sheetToDataraptorMapping[sheetName].uploadToCatalogDataraptorName;
            chunkPayload.dataContent = (payloadAsJson[sheetName]).slice(CHUNK_SIZE * i, CHUNK_SIZE * (i + 1));
        }
        
        addTransactionDetails(chunkPayload);

        var response = invokeVipByNameSafe(vipName, JSON.stringify(chunkPayload));
        var responseContentAsJson = JSON.parse(response.getContentText());

        var validationResult = validateVipResponseForGenericErrors(JSON.parse(response));
        var processingDetails = "";

        switch (validationResult.status) {
            case "Error": 
                processingDetails = "Some error are detected while processing chunk number " + (i + 1) + ". Review the detailed logs for more information";
                break;
            case "Warning": 
                processingDetails = "Some warnings are detected while processing chunk number " + (i + 1) + ". Review the detailed logs for more information";
                break;
            default:
                processingDetails = "Successfully processed chunk number " + (i + 1);
        }

        logProgress(
            "Data Push: " + sheetName,
            arguments.callee.name,
            processingDetails
        );
        setAggregatedLoadingProcessStatus(validationResult.status.toUpperCase());

        var processingCompleted = new Date();
        
        var statusReportItem = {};
        statusReportItem["Chunk Number"] = i + 1;
        statusReportItem["Processing Started"] = Utilities.formatDate(
            processingStarted,
            CONST_STATUS_REPORT_TIMESTAMP_ZONE,
            CONST_STATUS_REPORT_TIMESTAMP_FORMAT
        );
        statusReportItem["Processing Completed"] = Utilities.formatDate(
            processingCompleted,
            CONST_STATUS_REPORT_TIMESTAMP_ZONE,
            CONST_STATUS_REPORT_TIMESTAMP_FORMAT
        );
        statusReportItem["Status"] = validationResult.status;
        statusReportItem["Details"] = processingDetails;

        //writeStatusReportItem(statusReportItem);

        processedRecords = Math.min((i + 1) * CHUNK_SIZE, payloadAsJson[sheetName].length);
        loadingProcessProgress = processedRecords / payloadAsJson[sheetName].length * 100;
        setBackendProcessInfoProcessProgress(Math.round(loadingProcessProgress));

        //error processing
        if (!isHeavyLoad) {
            var validationResult = processDataraptorResponse(responseContentAsJson, chunkPayload[sheetName].length);
            if (validationResult.status != "SUCCESS") {
                statusReportItem["Status"] = validationResult.status;
                statusReportItem["Details"] = validationResult.description;
            }
            
        } else {           
            //stub - update me
        }

        writeStatusReportItem(statusReportItem);
        
    }

    logProgress(
        "Data Push: " + sheetName,
        arguments.callee.name,
        "Loading process is completed"
    );

    console.log("*** METHOD_EXIT: " + arguments.callee.name);

}

function pushConfigurationToVlocityChunkable2(epcConfiguration) {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);

    var accessTokenObj = retrieveStoredAccessToken();
    var sheet = SpreadsheetApp.getActiveSheet();
    var sheetName = sheet.getName();
    var sheetToDataraptorMapping = loadSheetToDataraptorMapping2();
    
    console.log('*** sheetToDataraptorMapping: ' + JSON.stringify(sheetToDataraptorMapping));

    var isHeavyLoad = false;

    console.log("*** VARIABLE: epcConfiguration: " + JSON.stringify(epcConfiguration));

    if (!epcConfiguration) {
        var message = "No data provided to push";
        console.log("*** ERROR: " + message);
        logProgress("Data Push: " + sheetName, arguments.callee.name, message);

        console.log("*** METHOD_EXIT: " + arguments.callee.name);
        return;
    }

    if (!accessTokenObj[CONST_ACCESS_TOKEN_PROPERTY_NAME] ||
        !accessTokenObj[CONST_INSTANCE_URL_PROPERTY_NAME]) {

        var message = "The application is not connected to Salesforce yet";
        console.log("*** ERROR: " + message);
        logProgress("Data Push: " + sheetName, arguments.callee.name, message);

        console.log("*** METHOD_EXIT: " + arguments.callee.name);
        return;
    }

    var vipName = 'EPC_LoadGenericEPCDefinitions';
    //var vipName = 'EPC_AsyncWrapper';

    var payloadAsJson = epcConfiguration;
    payloadAsJson.dataRaptorName = sheetToDataraptorMapping[sheetName].uploadToCatalogDataraptorName;

    console.log("*** INFO: Request size (entities): " + payloadAsJson[sheetName].length);
    if (payloadAsJson[sheetName].length > CONST_HEAVY_LOAD_THRESHOLD) {
        isHeavyLoad = true;
        console.log("*** INFO: A batch (non real-time) mode will be used to process this request");
    }

    var payloadChunkNumber = payloadAsJson[sheetName].length / CHUNK_SIZE;
    var processedRecords = 0;

    logProgress(
        "Data Push: " + sheetName,
        arguments.callee.name,
        payloadAsJson[sheetName].length + " records to be processed. Loading process will be done in " + Math.ceil(payloadChunkNumber) + " chunks, " + CHUNK_SIZE + " records per chunk"
    );

    var payloadArray = [];

    for (var i = 0; i < payloadChunkNumber; i++) {

        console.log("*** INFO: " + "Processing chunk number " + (i + 1));
        console.log("*** INFO: " + "Chunk range: " + (CHUNK_SIZE * i) + ", " + (CHUNK_SIZE * (i + 1)));
        console.log("*** INFO: " + "Chunk payload: " + JSON.stringify(chunkPayload));

        logProgress(
            "Data Push: " + sheetName,
            arguments.callee.name,
            "Processing chunk number " + (i + 1)
        );

        var chunkPayload = {};
        chunkPayload.chunkNumber = i;
        chunkPayload.entityName = sheetName;

        if (!isHeavyLoad) {
            chunkPayload.dataRaptorName = sheetToDataraptorMapping[sheetName].uploadToCatalogDataraptorName;;
            chunkPayload[sheetName] = (payloadAsJson[sheetName]).slice(CHUNK_SIZE * i, CHUNK_SIZE * (i + 1));
        } else {           
            chunkPayload.dataRaptorName = CONST_HEAVY_LOAD_DATARAPTOR_NAME;
            chunkPayload.dataRaptorNameRealtime = sheetToDataraptorMapping[sheetName].uploadToCatalogDataraptorName;;
            chunkPayload.dataContent = (payloadAsJson[sheetName]).slice(CHUNK_SIZE * i, CHUNK_SIZE * (i + 1));
        }
        

        addTransactionDetails(chunkPayload);

        payloadArray.push(JSON.stringify(chunkPayload));
        
        
        /* var response = invokeVipByNameSafe(vipName, JSON.stringify(chunkPayload));
        var responseContentAsJson = JSON.parse(response.getContentText());

        processedRecords = Math.min((i + 1) * CHUNK_SIZE, payloadAsJson[sheetName].length);
        loadingProcessProgress = processedRecords / payloadAsJson[sheetName].length * 100;
        setBackendProcessInfoProcessProgress(Math.round(loadingProcessProgress));

        //error processing
        if (!isHeavyLoad) {
            processDataraptorResponse(responseContentAsJson, chunkPayload[sheetName].length);
        } else {           
            //stub - update me
        } */
        
    }

    invokeVipByNameBulkSafe(vipName, payloadArray);


    logProgress(
        "Data Push: " + sheetName,
        arguments.callee.name,
        "Loading process is completed"
    );

    console.log("*** METHOD_EXIT: " + arguments.callee.name);

}

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