/**
 * Loads catalog configuration (for a single entity) to the Vlocity catalog
 *
 * @param {Object} epcConfiguration - catalog configuration in the form of a JSON object (json-object, not string)
 * @return nothing
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
    var sheetToDataraptorMapping = loadSheetToDataraptorMapping();
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
    payloadAsJson.dataRaptorName = sheetToDataraptorMapping[sheetName];

    console.log('*** INFO: Request size (entities): ' + payloadAsJson[sheetName].length);
    if (payloadAsJson[sheetName].length > CONST_HEAVY_LOAD_THRESHOLD) {
        isHeavyLoad = true;
        console.log('*** INFO: A batch (non real-time) mode will be used to process this request');
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

        var chunkPayload = {};
        chunkPayload.chunkNumber = i;
        chunkPayload.entityName = sheetName;

        if (!isHeavyLoad) {
            chunkPayload.dataRaptorName = sheetToDataraptorMapping[sheetName];
            chunkPayload[sheetName] = (payloadAsJson[sheetName]).slice(CHUNK_SIZE * i, CHUNK_SIZE * (i + 1));
        } else {           
            chunkPayload.dataRaptorName = CONST_HEAVY_LOAD_DATARAPTOR_NAME;
            chunkPayload.dataRaptorNameRealtime = sheetToDataraptorMapping[sheetName];
            chunkPayload.dataContent = (payloadAsJson[sheetName]).slice(CHUNK_SIZE * i, CHUNK_SIZE * (i + 1));
        }
        

        addTransactionDetails(chunkPayload);

        var response = invokeVipByNameSafe(vipName, JSON.stringify(chunkPayload));
        var responseContentAsJson = JSON.parse(response.getContentText());

        processedRecords = Math.min((i + 1) * CHUNK_SIZE, payloadAsJson[sheetName].length);
        loadingProcessProgress = processedRecords / payloadAsJson[sheetName].length * 100;
        updateLoadingProcessProgress(Math.round(loadingProcessProgress));

        //error processing
        if (!isHeavyLoad) {
            processDataraptorResponse(responseContentAsJson, chunkPayload[sheetName].length);
        } else {           
            //stub - update me
        }
        
    }


    logProgress(
        "Data Push: " + sheetName,
        arguments.callee.name,
        "Loading process is completed"
    );

    console.log("*** METHOD_EXIT: " + arguments.callee.name);

}