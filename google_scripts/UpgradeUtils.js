/**
 * Methods and functions to support sheet upgrade process to get you to the latest version 
 * of the EPC on Steroids spreadsheet (and corresponding scripts)
 *
 */


var CONST_UPGRADEABLE_SHEETS = [
    "Offerings",
    "Offerings Structure",
    "Attribute Assignments",
    "Pricing-Pricelist Entries",
    "Pricelists",
    "Pricelist Elements-Charges",
    "Pricelist Elements-Adjustments",
    "Time Plans",
    "Time Policies",
    "Object Types",
    "Picklists",
    "Picklist Values",
    "Attribute Categories",
    "Attributes",
    "Attribute-to-Object Type Assignments",
    "Promotions",
    "Promotion Assignments",
    "Specifications",
    "Specs Structure",
    "Specs Attribute Assignments",
    "Decomposition Relationships",
    "Catalogs",
    "Catalogs Hierarchy",
    "Catalog to Product Relationships",
    "Business Accounts",
    "Contacts"
];

/**
 * Imports content from another EPC on Steroids spreadsheet (usually of older version)
 * @param {string} documentId - source spreadsheet document Id
 * @return - nothing
 *
 * @example
 *     var documentId = "1e3Om-8ePjN63z6wlnaZxZpbdDZIeyuFN4Zf0B9sx6xc";
 *     importContentFromAnotherSpreadsheet(documentId);
 */

function importContentFromAnotherSpreadsheet(documentId) {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);
    console.time(arguments.callee.name);

    for (var i = 0; i < targetSheets.length; i++) {
        var sheet = targetSheets[i];
        
        if (!sheet.isSheetHidden()) {
            if (CONST_UPGRADEABLE_SHEETS.indexOf(sheet.getSheetName()) != -1) {
                console.log("*** INFO: " + "importing " + sheet.getSheetName() + "");
               
                SpreadsheetApp.setActiveSheet(sheet);
                importSheetContentFromAnotherSpreadsheet(documentId, targetSheets[i].getSheetName());
    
            } else {
                console.log("*** INFO: " + "skipping import for " + sheet.getSheetName() + " as import is not supported for this sheet");
            }
        } else {
          console.log("*** INFO: " + "skipping import for " + sheet.getSheetName() + " as the sheet is hidden in the targt document");
        }
    }

    console.timeEnd(arguments.callee.name);
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return 1;
}

/**
 * Imports content from a particular sheet of another EPC on Steroids spreadsheet (usually of older version)
 * @param {string} documentId - source spreadsheet document Id
 * @param {string} sheetName - name of the sheet (tab) to import
 * @return - nothing
 *
 * @example
 *     var documentId = "1e3Om-8ePjN63z6wlnaZxZpbdDZIeyuFN4Zf0B9sx6xc";
 *     var sheetName = "Offerings";
 *     importContentFromAnotherSpreadsheet(documentId, sheetName);
 */

function importSheetContentFromAnotherSpreadsheet(documentId, sheetName) {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);
    console.time(arguments.callee.name);

    console.log("*** VARIABLE: " + "documentId: " + documentId);
    console.log("*** VARIABLE: " + "sheetName: " + sheetName);
    
    var targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  
    var targetSheetRange = targetSheet.getDataRange();
    if (targetSheetRange) {
        var targetSheetValues = targetSheetRange.getValues();

        if (targetSheetValues) {
            
            var sourceSheetValues = getSheetContentFromAnotherSpreadsheet(documentId, sheetName);
            if (sourceSheetValues) {
                var targetHeaderValues = targetSheetValues[CONST_LAST_HEADER_ROW_NUMBER - 1];
                var sourceHeaderValues = sourceSheetValues[CONST_LAST_HEADER_ROW_NUMBER - 1];

                //source data values without headers
                var sourceDataValues = sourceSheetValues.slice(CONST_LAST_HEADER_ROW_NUMBER);
            
                //find mapping between source and target headers
                var targetHeaderToSourceHeaderIndexMap = {};
                for (var i = 0; i < targetHeaderValues.length; i++) {
                    targetHeaderToSourceHeaderIndexMap[targetHeaderValues[i]] = sourceHeaderValues.indexOf(targetHeaderValues[i]);
                }

                console.log("*** VARIABLE: " + "targetHeaderToSourceHeaderIndexMap: " + JSON.stringify(targetHeaderToSourceHeaderIndexMap, null, 2));
                
                //form a template (filler) data (necessary to retain formulas)
                var templateRowNumber = 3;

                if (targetSheet.getLastRow() < templateRowNumber) {
                    var message = "The target sheet does not include the filler-row (not empty row #3). This row is mandatory for the import capability";
                    console.log("*** ERROR: " + message);
                    console.timeEnd(arguments.callee.name);   
                    console.log("*** METHOD_EXIT: " + arguments.callee.name);
                    return null;
                }

                var templateRange = targetSheet.getRange(templateRowNumber, 1, 1, targetSheet.getLastColumn());
                var templateRangeFormulas = templateRange.getFormulas()[0];
                var templateData = templateRange.getValues()[0];
                
                console.log("*** INFO: " + "templateRangeFormulas: " + templateRangeFormulas);
                console.log("*** INFO: " + "templateData: " + templateData);
                
                //create space for imported data and prefill range with a template data (necessary to retain formulas)
                

                targetSheet.insertRowsAfter(targetSheet.getLastRow(), 1);

                var focusRange = targetSheet.getRange(targetSheet.getLastRow(), 1, 1, targetSheet.getLastColumn());
                focusRange.setBackground("#f8e9a1");
                targetSheet.setActiveRange(focusRange);

                var dummyRange = targetSheet.getRange(targetSheet.getMaxRows(), 1, 1, targetSheet.getLastColumn());
                var dummyData = [];
                
                for(var i = 0; i < targetSheet.getLastColumn(); i++) {
                    dummyData.push("");
                }
              
                dummyRange.setValues([dummyData]);
              
                var targetRangeFirstRowNumber = targetSheet.getLastRow() + 1;
                targetSheet.insertRows(targetRangeFirstRowNumber, sourceDataValues.length + 2); //add extra 2 rows as an empty space
                templateRange.copyTo(targetSheet.getRange(targetRangeFirstRowNumber, 1, sourceDataValues.length, targetSheet.getLastColumn()), SpreadsheetApp.CopyPasteType.PASTE_NORMAL);
                
                //iterate over source data and create target values line-by-line
                var dataSet = [];
                var targetRange = targetSheet.getRange(targetRangeFirstRowNumber, 1, sourceDataValues.length, targetSheet.getLastColumn());
                var targetValues = targetRange.getValues();
                var targetFormulas = targetRange.getFormulas();
                
                for (var i = 0; i < sourceDataValues.length; i++) {
                    console.log("*** INFO: " + "processing row " + i);
                    console.log("*** VARIABLE: " + "sourceDataValues[" + i +"]: " + sourceDataValues[i]);
                
                    var data = targetValues[i];
                    
                    for (var j = 0; j < targetHeaderValues.length; j++) {
                        if (targetHeaderToSourceHeaderIndexMap[targetHeaderValues[j]] != -1) {
                            if (!templateRangeFormulas[j]) {
                                //copy data from source sheet
                                data[j] = sourceDataValues[i][targetHeaderToSourceHeaderIndexMap[targetHeaderValues[j]]];
                            } else {
                                //retain prefilled formula
                                data[j] = targetFormulas[i][j];
                            }
                        } else {
                            //retain prefilled static data
                            data[j] = targetValues[i][j];
                        }
                    }
                
                    console.log("*** INFO: " + "data: " + data);
                    dataSet.push(data);    
                }
            
                targetRange.setValues(dataSet);
                targetRange.setBackground("#f8e9a1");

            } else {
                var message = "The source sheet is empty or unavailable and will be ignored.";
                console.log("*** ERROR: " + message);
                console.timeEnd(arguments.callee.name);   
                console.log("*** METHOD_EXIT: " + arguments.callee.name);
                return null;
            }

        } else {
            var message = "The target sheet is empty and will be ignored.";
            console.log("*** ERROR: " + message);
            console.timeEnd(arguments.callee.name);   
            console.log("*** METHOD_EXIT: " + arguments.callee.name);
            return null;
        }
    } else {
        var message = "The target sheet is empty and will be ignored.";
        console.log("*** ERROR: " + message);
        console.timeEnd(arguments.callee.name);   
        console.log("*** METHOD_EXIT: " + arguments.callee.name);
        return null;
    }    

    console.timeEnd(arguments.callee.name);
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return 1;
}

/**
 * Gets the content (headers and data) from a particular sheet of another spreadsheet
 * @param {string} documentId - spreadsheet document Id
 * @param {string} sheetName - name of the sheet (tab)
 * @return {Object[][]} - a rectangular grid of values for this sheet (including headers)
 *
 * @example
 *     var documentId = "1e3Om-8ePjN63z6wlnaZxZpbdDZIeyuFN4Zf0B9sx6xc";
 *     var sheetName = "Offerings";
 *     getSheetContentFromAnotherSpreadsheet(documentId, sheetName);
 */

function getSheetContentFromAnotherSpreadsheet(documentId, sheetName) {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);
    console.time(arguments.callee.name);

    var spreadsheet = SpreadsheetApp.openById(documentId);
    if (spreadsheet) {
        var sheet = spreadsheet.getSheetByName(sheetName);
        if (sheet != null) {
            
            range = sheet.getDataRange();

            if (range) {
                values = range.getValues();

                if (values) {  
                    console.timeEnd(arguments.callee.name);   
                    console.log("*** METHOD_EXIT: " + arguments.callee.name);
                    return values;
                } else {
                    var message = "Sheet is found but it has no data.";
                    console.log("*** ERROR: " + message);
                    console.timeEnd(arguments.callee.name);   
                    console.log("*** METHOD_EXIT: " + arguments.callee.name);
                    return null;    
                }
            } else {
                var message = "Unable to find the data range. Please verify the sheet is not empty.";
                console.log("*** ERROR: " + message);
                console.timeEnd(arguments.callee.name);   
                console.log("*** METHOD_EXIT: " + arguments.callee.name);
                return null;
            }

        } else {
            var message = "Unable to find the sheet by name. Please verify input.";
            console.log("*** ERROR: " + message);
            console.timeEnd(arguments.callee.name);   
            console.log("*** METHOD_EXIT: " + arguments.callee.name);
            return null;
        }
    } else {
        var message = "Unable to find the spreadsheet by Id. Please verify input or check that you have access to the document.";
        console.log("*** ERROR: " + message);
        console.timeEnd(arguments.callee.name);   
        console.log("*** METHOD_EXIT: " + arguments.callee.name);
        return null;
    }

    console.timeEnd(arguments.callee.name);
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return null;
}

/*************************************** */
/**
 * Process-function to orchestrate steps in the configuration import from another file 
 * Processes only one tab <----
 * @param nothing
 * @return nothing
 *
 * @example
 *     process_importConfigurationFromAnotherFileAllTabs();
 */

function process_importConfigurationFromAnotherFileActiveTab(documentId, sheetName) {

    /* Before loading */
    processStep_resetProcess();

    processStep_importConfigurationFromAnotherFileActiveTab(documentId, sheetName);    

    /* After loading */
    processStep_completeProcess();
}

function process_importConfigurationFromAnotherFileAllTabs(documentId) {

    /* Before loading */
    processStep_resetProcess();

    processStep_importConfigurationFromAnotherFileAllTabs(documentId);    

    /* After loading */
    processStep_completeProcess();
}

/*************************************** */


function processStep_importConfigurationFromAnotherFileActiveTab (documentId, sheetName) {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);
    console.time(arguments.callee.name);

    showProgressDialog();
    
    setBackendProcessInfoProcessProgress(20);
    setAggregatedLoadingProcessStatus("");
    setBackendProcessInfoProcessStep("Importing configuration from another document");
    setBackendProcessInfoProcessDetails("Importing configuration from another document");

    importSheetContentFromAnotherSpreadsheet(documentId, sheetName); 

    console.timeEnd(arguments.callee.name);
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return;
}

function processStep_importConfigurationFromAnotherFileAllTabs (documentId) {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);
    console.time(arguments.callee.name);

    showProgressDialog();
    
    setBackendProcessInfoProcessProgress(20);
    setAggregatedLoadingProcessStatus("");
    setBackendProcessInfoProcessStep("Importing configuration from another document");
    setBackendProcessInfoProcessDetails("Importing configuration from another document");

    //prepare variables for progress calculation
    var numberOfSheetsToImport = 0;
    var numberOfProcessedSheets = 0;
    var loadingProcessProgress = 0;
    var targetSheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();

    for (var i = 0; i < targetSheets.length; i++) {
        var sheet = targetSheets[i];
        
        if (!sheet.isSheetHidden() && CONST_UPGRADEABLE_SHEETS.indexOf(sheet.getSheetName()) != -1) {
            numberOfSheetsToImport++;
        }
    }

    //import configuration tab by tab
    for (var i = 0; i < targetSheets.length; i++) {
        var sheet = targetSheets[i];
        
        if (!sheet.isSheetHidden()) {
            if (CONST_UPGRADEABLE_SHEETS.indexOf(sheet.getSheetName()) != -1) {
                console.log("*** INFO: " + "importing " + sheet.getSheetName() + "");
               
                SpreadsheetApp.setActiveSheet(sheet);
                importSheetContentFromAnotherSpreadsheet(documentId, targetSheets[i].getSheetName());
                numberOfProcessedSheets++; 

                loadingProcessProgress = numberOfProcessedSheets / numberOfSheetsToImport * 100;
                setBackendProcessInfoProcessProgress(Math.round(loadingProcessProgress));

            } else {
                console.log("*** INFO: " + "skipping import for " + sheet.getSheetName() + " as import is not supported for this sheet");
            }
        } else {
          console.log("*** INFO: " + "skipping import for " + sheet.getSheetName() + " as the sheet is hidden in the targt document");
        }
    }

    console.timeEnd(arguments.callee.name);
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return;
}