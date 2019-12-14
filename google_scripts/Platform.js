/**
 * Property objects initialization.
 *
 */

var scriptProperties = PropertiesService.getScriptProperties();
var userProperties = PropertiesService.getUserProperties();

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

