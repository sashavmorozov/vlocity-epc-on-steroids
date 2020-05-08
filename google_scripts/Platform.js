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
    console.log(ScriptApp.getScriptId());
    return ScriptApp.getScriptId();
}

function generateViewRecordsUrl(objectApiName) {
  
    if (objectApiName) {
      var viewUrl = PropertiesService.getScriptProperties().getProperty(CONST_INSTANCE_URL_PROPERTY_NAME) + '/lightning/o/' + objectApiName + '/home';
      return viewUrl;
    } else {
      return "Error: nothing to view here";
    }
  }

/**
 * This function is called on spreadsheet open and merely adds necessary menu items into the taskbar
 */
function onOpen() {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);
  
    buildMenu();
  
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
  }

