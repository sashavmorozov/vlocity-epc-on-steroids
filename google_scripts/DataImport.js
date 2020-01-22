function test_retrieveEntityByName(){
  retrieveEntityByName("Offerings");
}

/**
 * Retreives catalog configuration for a current sheet and redirects to the sandbox sheet. 
 * The retreived data will be stored to "Data Import Sandbox"
 *
 * @return {void} - nothing
 *
 * @example
 *     retrieveCurrentSheetFromCatalog();
 */

function retrieveCurrentSheetFromCatalog() {
  console.log("*** METHOD_ENTRY: " + arguments.callee.name);
  
  var sheetName = SpreadsheetApp.getActive().getActiveSheet().getName();
  var targetSheet = SpreadsheetApp.getActive().getSheetByName(CONST_DATA_IMPORT_SHEET_NAME);
  SpreadsheetApp.getActive().setActiveSheet(targetSheet);
  retrieveSheetFromCatalogByName(sheetName);
  
  console.log("*** METHOD_EXIT: " + arguments.callee.name);
}

/**
 * Retreives catalog configuration for a particular entity (identified by sheet name) and stores it to a target sheet (identified by name)
 *
 * @param {string} sheetName - Key for entity to be retreived from Vlocity
 * @return {void} - nothing
 *
 * @example
 *     retrieveSheetFromCatalogByName("Offerings");
 */

function retrieveSheetFromCatalogByName(sheetName) {
  console.log("*** METHOD_ENTRY: " + arguments.callee.name);
  console.log("*** INFO: " + "Retrieve data for " + sheetName);
  console.log("*** VARIABLE: sheetName: " + sheetName);

  /* validations */
  var sheetToDataraptorMapping2 = loadSheetToDataraptorMapping2();
  
  if (!sheetToDataraptorMapping2[sheetName]) {
    console.log("*** ERROR: " + "No dataraptor to import from Catalog is defined for this sheet");
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return;
  }
  
  /* preparation */
  removeSheetContentByName(CONST_DATA_IMPORT_SHEET_NAME, 1, 1);
  copySheetHeaderByName(sheetName, CONST_DATA_IMPORT_SHEET_NAME);
  
  /*form input for dataraptor */
  //stub

  /* retrieve configuration from the product catalog */
  var vipName = "EPC_LoadGenericEPCDefinitions"; //TODO: Make a separate VIP for data retreival process
  
  
  
  var payload = {
    dataRaptorName: sheetToDataraptorMapping2[sheetName].retreiveFromCatalogDataraptorName
  };

  var retreivedData = invokeVipByNameSafe(vipName, JSON.stringify(payload)); //this should be adopted to accomodate the change. Make is safe also
  console.log("**** VARIABLE: retreivedData: " + retreivedData);
  
  var returnResultsData = (JSON.parse(retreivedData)).Result.returnResultsData;
  storeJsonAsTable(CONST_DATA_IMPORT_SHEET_NAME, JSON.stringify(returnResultsData));
  
  copyDataStyleByName(sheetName, CONST_DATA_IMPORT_SHEET_NAME);

  console.log("*** METHOD_EXIT: " + arguments.callee.name);
}

/**
 * Stores JSON value into a sheet identified by its name. JSON names are matched to sheet header names
 *
 * @param {string} sheetName - sheet name where data will be stored
 * @param {string} jsonValue - JSON value as string
 * @return {void} - nothing
 *
 * @example
 *     storeJsonAsTable(CONST_DATA_IMPORT_SHEET_NAME, jsonValue);
 */

function storeJsonAsTable(sheetName, jsonValue) {
  console.log("*** METHOD_ENTRY: " + arguments.callee.name);

  //if (!jsonValue || isEmpty(jsonValue)) {
  if (!jsonValue) {
    console.log("*** ERROR: " + "JSON data is not provided");
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return;
  }
  
  if (!sheetName) {
    console.log("*** ERROR: " + "Sheet name is not provided");
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return;
  }

  var sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  var lastColumnNumber = sheet.getLastColumn();

  var sheetHeadersValues = sheet
    .getRange(
      CONST_FIRST_HEADER_ROW_NUMBER,
      CONST_FIRST_HEADER_COLUMN_NUMBER,
      CONST_LAST_HEADER_ROW_NUMBER,
      lastColumnNumber
    )
    .getValues();

  var sheetEffectiveHeadersValues = sheetHeadersValues[1];

  console.log(
    "*** VARIABLE: sheetEffectiveHeadersValues: " +
      JSON.stringify(sheetEffectiveHeadersValues)
  );

  var jsonObj = JSON.parse(jsonValue);
  var data = [];
  
  for (var i = 0; i < jsonObj.length; i++) {
    var dataRow = [];

    for (var j = 0; j < sheetEffectiveHeadersValues.length; j++) {
      if (jsonObj[i][sheetEffectiveHeadersValues[j]] || jsonObj[i][sheetEffectiveHeadersValues[j]] == 0) {
        dataRow[j] = jsonObj[i][sheetEffectiveHeadersValues[j]];
      } else {
        dataRow[j] = "";
      }
    }

    data.push(dataRow);
  }

  sheet
    .getRange(
      CONST_FIRST_DATA_ROW_NUMBER,
      CONST_FIRST_DATA_COLUMN_NUMBER,
      Object.keys(jsonObj).length,
      sheetEffectiveHeadersValues.length
    )
    .setValues(data);

  console.log("*** METHOD_EXIT: " + arguments.callee.name);
}

/**
 * Remove content of a particular sheet (tab). Some predefined number of rows will be retained (and cleaned)
 *
 * @param {string} sheetName - Name of the sheet to be cleaned
 * @return {void} - nothing
 *
 * @example
 *     removeSheetContentByName(CONST_DATA_IMPORT_SHEET_NAME, 1, 1);
 */

function removeSheetContentByName(
  sheetName,
  cleanFromRowNumber,
  cleanFromColumnNumber
) {
  console.log("*** METHOD_ENTRY: " + arguments.callee.name);

  if (!sheetName) {
    console.log("*** ERROR: " + "Sheet names is not provided");
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return;
  }

  /*
  var sheetName = "Data Import Sandbox"; //test data
  cleanFromRowNumber = 1; //test data
  cleanFromColumnNumber = 1; //test data
  */

  var sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  var maxRowNumber = sheet.getMaxRows();
  var maxColumnNumber = sheet.getMaxColumns();
  var emptyEntries = 10;
  var emptyColumns = 4;

  if (maxRowNumber > emptyEntries) {
    sheet.deleteRows(emptyEntries, maxRowNumber - emptyEntries);
  }
  
  if (maxColumnNumber > emptyColumns) {
    sheet.deleteColumns(emptyColumns, maxColumnNumber - emptyColumns);
  }
  
  maxColumnNumber = sheet.getMaxColumns();
  var data = [];
  for (var i = 0; i < maxColumnNumber; i++) {
    data.push([]);
  }

  var dataSet = [];
  for (var i = 0; i < emptyEntries; i++) {
    dataSet.push(data);
  }

  sheet
    .getRange(
      cleanFromRowNumber,
      cleanFromColumnNumber,
      emptyEntries,
      maxColumnNumber
    )
    .setValues(dataSet);
  console.log("*** METHOD_EXIT: " + arguments.callee.name);
}


/**
 * Copy table headers for from one sheet to another. Use to support data retreival process
 *
 * @param {string} sourceSheetName - Copy headers from
 * @param {string} targetSheetName - Copy headers to
 * @return {void} - nothing
 *
 * @example
 *     copySheetHeaderByName("Offerings", CONST_DATA_IMPORT_SHEET_NAME);
 */

function copySheetHeaderByName(sourceSheetName, targetSheetName) {
  console.log("*** METHOD_ENTRY: " +  arguments.callee.name);
  
  if (!sourceSheetName || !targetSheetName) {
    console.log("*** ERROR: " +  "Source and target sheet names are mandatory");
    console.log("*** METHOD_EXIT: " +  arguments.callee.name);
    return;
  }
  
  var copyFromRowNumber = 1;
  var copyFromColumnNumber = 1;
  var copyTillRowNumber = 2;

  /*
  var sourceSheetName = "Offerings"; //test value
  var targetSheetName = CONST_DATA_IMPORT_SHEET_NAME; //test value
  */
  
  var sourceSheet = SpreadsheetApp.getActive().getSheetByName(sourceSheetName);
  var targetSheet = SpreadsheetApp.getActive().getSheetByName(targetSheetName);

  var sourceLastColumnNumber = sourceSheet.getLastColumn();

  var sourceRange = sourceSheet.getRange(
    copyFromRowNumber,
    copyFromColumnNumber,
    copyTillRowNumber,
    sourceLastColumnNumber
  );
  var targetRange = targetSheet.getRange(
    copyFromRowNumber,
    copyFromColumnNumber,
    copyTillRowNumber,
    sourceLastColumnNumber
  );

  sourceRange.copyTo(targetRange);

  sourceRange.copyTo(
    targetRange,
    SpreadsheetApp.CopyPasteType.PASTE_COLUMN_WIDTHS,
    false
  );

  /* copy over row heights from source to target */
  for (var i = copyFromColumnNumber; i < copyTillRowNumber + 1; i++) {
    targetSheet.setRowHeight(i, sourceSheet.getRowHeight(i));
  }
  
  console.log("*** METHOD_EXIT: " +  arguments.callee.name);
}

function copyDataStyleByName(sourceSheetName, targetSheetName) {
  console.log("*** METHOD_ENTRY: " +  arguments.callee.name);
  
  if (!sourceSheetName || !targetSheetName) {
    console.log("*** ERROR: " +  "Source and target sheet names are mandatory");
    console.log("*** METHOD_EXIT: " +  arguments.callee.name);
    return;
  }
  
  //Assume data exists or at least some styles configured for a first no-header row
  var copyFromRowNumber = 3;
  var copyFromColumnNumber = 1;
  var copyNumberOfRows = 1;

  /*
  var sourceSheetName = "Offerings"; //test value
  var targetSheetName = CONST_DATA_IMPORT_SHEET_NAME; //test value
  */
  
  var sourceSheet = SpreadsheetApp.getActive().getSheetByName(sourceSheetName);
  var targetSheet = SpreadsheetApp.getActive().getSheetByName(targetSheetName);

  var sourceLastColumnNumber = sourceSheet.getLastColumn();

  var sourceRange = sourceSheet.getRange(
    copyFromRowNumber,
    copyFromColumnNumber,
    copyNumberOfRows,
    sourceLastColumnNumber
  );
  var targetRange = targetSheet.getRange(
    copyFromRowNumber,
    copyFromColumnNumber,
    targetSheet.getMaxRows() - CONST_LAST_HEADER_ROW_NUMBER,
    sourceLastColumnNumber
  );

  sourceRange.copyTo(
    targetRange,
    SpreadsheetApp.CopyPasteType.PASTE_FORMAT,
    false
  );
  
  sourceRange.copyTo(
    targetRange,
    SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION,
    false
  );
  
  sourceRange.copyTo(
    targetRange,
    SpreadsheetApp.CopyPasteType.PASTE_CONDITIONAL_FORMATTING,
    false
  );
  
  console.log("*** METHOD_EXIT: " +  arguments.callee.name);
}


function loadSheetToDataraptorMapping2() {
  console.log("*** METHOD_ENTRY: " + arguments.callee.name);

  var sheet = SpreadsheetApp.getActive().getSheetByName("Settings");
  var rows = sheet.getDataRange();
  var numRows = rows.getNumRows();
  var numCols = rows.getNumColumns();
  var values = rows.getValues();

  var sheetToDataraptorMapping = {};

  for (i = 1; i < numRows; i++) {
    var row = values[i];
    var mappingRow = {
      sheetName: row[0],
      namingPrexif: row[1],
      uploadToCatalogDataraptorName: row[2],
      retreiveFromCatalogDataraptorName: row[3]
    };

    sheetToDataraptorMapping[mappingRow.sheetName] = mappingRow;
  }

  console.log("*** VARIABLE: sheetToDataraptorMapping: " + JSON.stringify(sheetToDataraptorMapping));

  console.log("*** METHOD_EXIT: " + arguments.callee.name);
  return sheetToDataraptorMapping;
}



/********** ABBYSS FOR FUTURE USE, EXPERIMENTAL************/
function retrieveDataChunckable() {
  var keys = [
    "VEPC_OFFERING_EPC_ON_STEROIDS_DEMO_OFFER_L1",
    "VEPC_OFFERING_EPC_ON_STEROIDS_DEMO_OFFER_L2",
    "VEPC_OFFERING_EPC_ON_STEROIDS_DEMO_OFFER_L3",
    "VEPC_OFFERING_EPC_ON_STEROIDS_DEMO_OFFER_L1-1",
    "VEPC_OFFERING_EPC_ON_STEROIDS_DEMO_OFFER_L1-2",
    "VEPC_OFFERING_EPC_ON_STEROIDS_DEMO_OFFER_L1-3",
    "VEPC_OFFERING_EPC_ON_STEROIDS_DEMO_OFFER_L1-4",
    "VEPC_OFFERING_EPC_ON_STEROIDS_DEMO_OFFER_L1-5",
    "VEPC_OFFERING_EPC_ON_STEROIDS_DEMO_OFFER_L1-6",
    "VEPC_OFFERING_EPC_ON_STEROIDS_DEMO_OFFER_L1-7",
    "VEPC_OFFERING_EPC_ON_STEROIDS_DEMO_OFFER_L1-8",
    "VEPC_OFFERING_EPC_ON_STEROIDS_DEMO_OFFER_L1-9",
    "VEPC_OFFERING_EPC_ON_STEROIDS_DEMO_OFFER_L1-10"
  ];

  var dataRaptorName = "EPC on Steroids_Export All Offerings";

  var CHUNK_SIZE = 2;

  var fullPayload = {
    data: keys,
    dataRaptorName: dataRaptorName
  };

  var options = {
    method: "post",
    contentType: "application/json",
    payload: "",
    muteHttpExceptions: true,
    headers: {
      Authorization: "Bearer " + "XXX"
    },
    escaping: false
  };

  var payloadChunkNumber = fullPayload.data.length / CHUNK_SIZE;
  var processedRecords = 0;

  for (var i = 0; i < payloadChunkNumber; i++) {
    var chunkPayload = {};
    chunkPayload.dataRaptorName = fullPayload.dataRaptorName;
    chunkPayload.data = fullPayload.data.slice(
      CHUNK_SIZE * i,
      CHUNK_SIZE * (i + 1)
    );

    console.log(
      "*** Chunk range: [" + CHUNK_SIZE * i + ", " + CHUNK_SIZE * (i + 1) + "]"
    );
    console.log("*** Chunk payload: " + JSON.stringify(chunkPayload));

    /* sending the current chunk for processing (data retrieval) */

    //options.payload = JSON.stringify(chunkPayload);
    //var response = UrlFetchApp.fetch(url, options);

    /* error processing */
    //add some code here

    processedRecords = Math.min((i + 1) * CHUNK_SIZE, fullPayload.data.length);
  }
}