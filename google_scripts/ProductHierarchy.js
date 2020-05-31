var CONST_VISUALIZATION_SOURCE_SHEET_NAME = "Offerings Structure";
var CONST_VISUALIZATION_TARGET_SHEET_NAME = "Vis-Offerings Structure2";

function test_createVisualizationSheet2() {
  var rootProductCode = "VEPC_OFFERING_EOS_SAMPLE_ROOT_OFFER"
  createVisualizationSheet2(rootProductCode);
}

function createVisualizationSheet2(rootProductCode) {
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
  
  
  
  /* final touch */
  targetDataRange.clearDataValidations();
  copyDataStyleByName(CONST_VISUALIZATION_SOURCE_SHEET_NAME, CONST_VISUALIZATION_TARGET_SHEET_NAME);
  targetSheet.deleteRow(1);
  
  /* add visualization-specific columns */
  
  /* Specification Type*/
  //=IFNA(VLOOKUP(E2,Offerings!C:AA,4,false),"")
  addExtraColumn(
   targetSheet,
   "Specification Type",
   "=IFNA(VLOOKUP(E2,Offerings!C:AA,4,false),\"\")");
  
  /* Specification Type Icon */
  addExtraColumn(
   targetSheet,
   "Specification Type Icon",
   "=IFNA(IFS(" + "\n" +
   "P2 = \"Offer\", \"https://img.icons8.com/ios/50/000000/price-tag-euro.png\"," + "\n" +
   "P2 = \"Product\", \"https://img.icons8.com/ios/50/000000/product.png\"," + "\n" +
   "P2 = \"Service (CFS)\", \"https://img.icons8.com/ios/50/000000/service.png\"," + "\n" +
   "P2 = \"Resource (RFS)\", \"https://img.icons8.com/ios/50/000000/networking-manager.png\"" + "\n" +
   "), \"\")");
  
  /* Object Type */
  addExtraColumn(
   targetSheet,
   "Object Type",
   "=IFNA(VLOOKUP(E2,Offerings!C:AA,3,false),\"\")");
  
  /* Cardinality Column */
  addExtraColumn(
   targetSheet,
   "Cardinality",
   "=IF(NOT(OR(I2=\"\", J2=\"\", K2=\"\")), I2&\"/\"&J2&\"/\"&K2, \"Data issue\")");
}
    
function addExtraColumn(sheet, columnName, columnFormula) {
  var lastColumnNumber = sheet.getLastColumn();
  var lastRowNumber = sheet.getLastRow();
  
  sheet.insertColumnAfter(lastColumnNumber);  
  sheet.getRange(1, lastColumnNumber + 1, 1).setValue(columnName);
  sheet.getRange(2, lastColumnNumber + 1, lastRowNumber - 1).setFormula(columnFormula).clearDataValidations();
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