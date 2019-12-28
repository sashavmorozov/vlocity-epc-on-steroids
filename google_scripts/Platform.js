/**
 * The function returns unique identifier of the application script. The Id is used to support development tools.
 *
 * @return {string} unique script identifier
 *
 * @example
 *
 *     getScriptId();
 */

function getScriptId() {
    Logger.log(ScriptApp.getScriptId());
    return ScriptApp.getScriptId();
}

/**
 * This function is called on spreadsheet open and merely adds necessary menu items into the taskbar
 */
function onOpen() {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);
    
    var accessToken = PropertiesService.getScriptProperties().getProperty(CONST_ACCESS_TOKEN_PROPERTY_NAME);
    var refreshToken = PropertiesService.getScriptProperties().getProperty(CONST_REFRESH_TOKEN_PROPERTY_NAME);
  
    console.log("*** VARIABLE: accessToken: " + accessToken);
    console.log("*** VARIABLE: refreshToken: " + refreshToken);
  
    if (isScriptPropertySet(CONST_ACCESS_TOKEN_PROPERTY_NAME) && isScriptPropertySet(CONST_REFRESH_TOKEN_PROPERTY_NAME)) {
      //regenerate access token if the application was previously authorized but a session expired
      console.log("*** INFO: " + "regenerating access token");
      regenerateToken(refreshToken);
    } else {
      //do nothing if the application was never authorized before
      console.log("*** INFO: " + "NOT regenerating access token");
    }
  
    buildMenu();
  
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
  }

