var CONST_VISUALIZATION_SOURCE_SHEET_NAME = "Offerings Structure";
var CONST_VISUALIZATION_TARGET_SHEET_NAME = "LucidChart-Offerings Structure";

function test_createVisualizationSheet() {
  var rootProductCode = "VEPC_OFFERING_EOS_SAMPLE_ROOT_OFFER"
  createVisualizationSheet(rootProductCode);
}

function createVisualizationSheet(rootProductCode) {
  console.log("*** METHOD_ENTRY: " + arguments.callee.name);
  
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(CONST_VISUALIZATION_SOURCE_SHEET_NAME);
  
  /* preparation */
  var targetSheet = SpreadsheetApp.getActive().getSheetByName(CONST_VISUALIZATION_TARGET_SHEET_NAME);
  removeSheetContentByName(CONST_VISUALIZATION_TARGET_SHEET_NAME, 1, 1);
  copySheetHeaderByName(CONST_VISUALIZATION_SOURCE_SHEET_NAME, CONST_VISUALIZATION_TARGET_SHEET_NAME);
  SpreadsheetApp.getActive().setActiveSheet(targetSheet);
  
  
    
  /* collect data */
  //var rootProductCode = "VEPC_OFFERING_EOS_SAMPLE_ROOT_OFFER"
  var productHierarchyData = collectProductHierarchyData(rootProductCode);
  
  if (!productHierarchyData) {
    var message = "No data found for the product";
    console.log("*** ERROR: " + message);
    logProgress("Data Visualization", arguments.callee.name, message);
    
    var dialogParams = {
         "message": "Doesn't look good",
         "messageDescription": message
     };
    
     displayErrorDialog(dialogParams);
     console.log("*** METHOD_EXIT: " + arguments.callee.name);
     return;
  }
  
  console.log(productHierarchyData.length + ",  " + productHierarchyData[0].length);
  
  /* insert a root record */
  var rootProductHierarchyDataItem = createEmptyArray(productHierarchyData[0].length, "");
  
  rootProductHierarchyDataItem[3] = rootProductCode;
  rootProductHierarchyDataItem[4] = rootProductCode;
  productHierarchyData.push(rootProductHierarchyDataItem);
    
  var targetDataRange = targetSheet.getRange(3, 1, productHierarchyData.length, productHierarchyData[0].length);
  targetDataRange.setValues(productHierarchyData);
  
  targetSheet.deleteColumns(productHierarchyData[0].length + 1, targetSheet.getMaxColumns() - productHierarchyData[0].length);
  
  /* final touch */
  targetDataRange.clearDataValidations();
  copyDataStyleByName(CONST_VISUALIZATION_SOURCE_SHEET_NAME, CONST_VISUALIZATION_TARGET_SHEET_NAME);
  targetSheet.deleteRow(1);
  
  /* add visualization-specific columns */
  
  /* Specification Type*/
  addExtraColumn(
   targetSheet,
   "Specification Type",
   "=IFNA(VLOOKUP(E2,Offerings!C:AA,4,false),\"\")");
  
  /* Specification Type Icon */
  addExtraColumn(
   targetSheet,
   "Specification Type Icon",
   "=IFNA(IFS(" + "\n" +
   "P2 = \"Offer\", \"https://img.icons8.com/clouds/100/000000/packaging.png\"," + "\n" +
   "P2 = \"Product\", \"https://img.icons8.com/clouds/100/000000/product.png\"," + "\n" +
   "P2 = \"Service (CFS)\", \"https://img.icons8.com/clouds/100/000000/work.png\"," + "\n" +
   "P2 = \"Resource (RFS)\", \"https://img.icons8.com/clouds/100/000000/video-card.png\"" + "\n" +
   "), \"\")");
  
  /* Object Type */
  addExtraColumn(
   targetSheet,
   "Object Type",
   "=IFNA(VLOOKUP(E2,Offerings!C:AA,3,false),\"\")");
  
  /* Min/Max/Def Column */
  addExtraColumn(
   targetSheet,
   "Min/Max/Def",
   "=IF(NOT(OR(I2=\"\", J2=\"\", K2=\"\")), I2&\"/\"&J2&\"/\"&K2, \"Data issue\")");
}
    
function addExtraColumn(sheet, columnName, columnFormula) {
  var lastColumnNumber = sheet.getLastColumn();
  var lastRowNumber = sheet.getLastRow();
  
  sheet.insertColumnAfter(lastColumnNumber);  
  sheet.getRange(1, lastColumnNumber + 1, 1)
    .setValue(columnName)
    .setBackground("#B4A7D6")
    .setFontColor("#FFFFFF");
  
  sheet.getRange(2, lastColumnNumber + 1, lastRowNumber - 1)
    .setFormula(columnFormula)
    .clearDataValidations()
    .setBackground("#F3F3F3")
    .setFontColor("#000000");
}

function collectProductHierarchyData(productCode) {
  var CONST_MAX_HIERARCHY_DEPTH = 10;
  
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(CONST_VISUALIZATION_SOURCE_SHEET_NAME);
  
  var dataValues = sheet.getDataRange().getValues();
  var filteredDataValues = [];
 
  var productCodesArray = [];
  productCodesArray.push(productCode);
  
  var iterationNumber = 1;
  
  while (productCodesArray.length > 0 && iterationNumber < CONST_MAX_HIERARCHY_DEPTH) {
    console.log("Current match iteration: " + iterationNumber++);
    console.log("Current match array content: " + JSON.stringify(productCodesArray));
    
    tProductCodesArray = [];
    for (var i = 0; i < dataValues.length; i++) {
      if (productCodesArray.indexOf(dataValues[i][2]) > -1) {
        filteredDataValues.push(dataValues[i]);        
        tProductCodesArray.push(dataValues[i][4]);
      }
    }
 
    productCodesArray = tProductCodesArray;
  }
  
  console.log(JSON.stringify(filteredDataValues));
  return filteredDataValues;
}

function collectDataForLucidChartDiagram() {
  var CONST_OFFERINGS_SHEET_NAME = "Offerings";
  var data = exportRowsAsJson(CONST_OFFERINGS_SHEET_NAME, CONST_EXPORT_SCOPE_ENUM.INCLUDE_ONLY_CHECKED);

  console.log("Data: " + JSON.stringify(data));

  if (!data) {
    console.log("*** Error: no rows checked, no data to visualize");
    var dialogParams = {
        "message": "Doesn't look good",
        "messageDescription": "Please verify you checked the root record you want to visualize on the \"Offerings\" tab. Looks like nothing was selected"
    };
    displayWarningDialog(dialogParams);
    state = 0;
    return state;
  }

  if (data[CONST_OFFERINGS_SHEET_NAME].length != 1) {
    console.log("*** Error: too many rows selected, select only one");
    var dialogParams = {
        "message": "Doesn't look good",
        "messageDescription": "Please verify you checked only one product (will be used as the root). Looks like more than one row was selected"
    };
    displayWarningDialog(dialogParams);
    state = 0;
    return state;
  }
  
  var rootProductCode = data[CONST_OFFERINGS_SHEET_NAME][0]["Offering Code"];
  createVisualizationSheet(rootProductCode);

  var dialogParams = {
      "message": "All set",
      "messageDescription": "The data is prepared for you diagram (check the \"LucidChart-Offerings Structure\" tab"
  };
  displaySuccessDialog(dialogParams);

  state = 1;
  return state;
}