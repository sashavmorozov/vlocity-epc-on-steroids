/**
 * The function returns unique identifier of the application script. The Id is used to support development tools.
 *
 * @return {string} unique script identifier
 *
 * @example
 *
 *     var scriptId = getScriptId();
 */

function getScriptId() {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);
    console.log(ScriptApp.getScriptId());

    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return ScriptApp.getScriptId();
}

/**
 * This function is called on spreadsheet open and merely adds necessary menu items into the taskbar
 * 
 * @param 
 * 
 * @return 
 * 
 * @example
 *  //This function is not intended to be called explicitly
 */

function onOpen() {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);
    
    buildMenu();
  
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
  }

