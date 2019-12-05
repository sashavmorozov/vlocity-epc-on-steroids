function test_shortenInstanceUrl() {
    var instanceUrl = "https://microcom.my.salesforce.com/";
    Logger.log('*** instanceName: ' + shortenInstanceUrl(instanceUrl));
    return shortenInstanceUrl(instanceUrl);
  }


function test_isScriptPropertySet() {
  
  Logger.log(isScriptPropertySet("accessToken"));
  Logger.log(isScriptPropertySet("instanceUrl"));
  Logger.log(isScriptPropertySet("randomProperty"));
  Logger.log(isScriptPropertySet(""));
  Logger.log(isScriptPropertySet());
  Logger.log(isScriptPropertySet(1));
  
  scriptProperties.setProperty("myProperty", undefined);
  Logger.log(isScriptPropertySet("myProperty"));
  
  scriptProperties.setProperty("myProperty", 123);
  Logger.log(isScriptPropertySet("myProperty"));
}

function test_exportCheckedRowsAsJson() {
  //Logger.log(JSON.stringify(exportRowsAsJson("Offerings",CONST_EXPORT_SCOPE_ENUM.INCLUDE_ONLY_CHECKED)));
  Logger.log(JSON.stringify(exportRowsOfActiveSheetAsJson(CONST_EXPORT_SCOPE_ENUM.INCLUDE_ALL)));
}

function test_removeLeadingNumber() {
  Logger.log(removeLeadingNumber("01. Offerings"));
  Logger.log(removeLeadingNumber("012345. Offerings"));
  Logger.log(removeLeadingNumber("Offerings"));
  Logger.log(removeLeadingNumber(". Offerings"));
  Logger.log(removeLeadingNumber("01 Offerings"));
}

function test_getScriptId() {
  Logger.log(getScriptId());
}