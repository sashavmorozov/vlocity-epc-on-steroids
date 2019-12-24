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
    //reset connection token and instance URL to force reconnection on every open
    //eraseTokenInformation();
    
    var accessToken = PropertiesService.getScriptProperties().getProperty(CONST_ACCESS_TOKEN_PROPERTY_NAME);
    var refreshToken = PropertiesService.getScriptProperties().getProperty(CONST_REFRESH_TOKEN_PROPERTY_NAME);
    if (!isEmpty(accessToken) && !isEmpty(refreshToken)) {
      //regenerate access token if the application was previously authorized but a session expired
      regenerateToken(refreshToken);
    } else {
      //do nothing if the application was never authorized before
      
    }
  
    buildMenu();
  }

