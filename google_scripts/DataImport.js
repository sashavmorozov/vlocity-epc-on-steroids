function storeJsonAsTable_Test() {
  var tabName = "Upload Test";
  var jsonValue = invokeVipByName_Test();
  storeJsonAsTable(tabName, jsonValue);
}

function storeJsonAsTable(tabName, jsonValue) {
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tabName);
  var headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  Logger.log(JSON.stringify(headerRow));
  
  if (!jsonValue) {
    logProgress(
            "Retrieve Data",
            "Process Error",
            "No results returned by the integration procedure"
        );
    return;
  }
  var obj = JSON.parse(jsonValue);
  var data = [];
  var maxDaraRowLength = 0;
   
  for (i = 0; i < obj.length; i++) {
    var dataRow = []; 
    
    for (j = 0; j < headerRow.length; j++) {  
      if (obj[i][headerRow[j]]) {
        dataRow[j] = obj[i][headerRow[j]];
      } else {
        dataRow[j] = "";
      }
    }
    
    if (dataRow.length > maxDaraRowLength) {
      maxDaraRowLength = dataRow.length;
    }
    
    data.push(dataRow);
  }
  
  sheet.getRange(2, 1, Object.keys(obj).length, maxDaraRowLength).setValues(data);
}