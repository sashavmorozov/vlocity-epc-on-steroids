/**
 * This function is called on spreadsheet open and merely adds necessary menu items into the taskbar
 */
function onOpen() {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('Catalog Scripts')
        .addItem('Save Current Tab as JSON', 'saveActiveSheetAsJson')
        .addItem('Load Current Tab to Vlocity EPC', 'loadActiveSheetToVlocityEPC')
        .addItem('Load Selected Rows to Vlocity EPC', 'loadSelectedRowsToVlocityEPC')
        .addSubMenu(SpreadsheetApp.getUi().createMenu('Security')
            .addItem('Connect to Salesforce', 'showSidebarWebServerAuthenticationFlow'))

        .addSubMenu(SpreadsheetApp.getUi().createMenu('EPC Jobs')
            .addItem('Regenerate JSONAttribute for Selected Products', 'regenerateJsonAttributes')
            .addItem('Clear Platform Cache', 'clearPlatformCache')
            .addItem('Regenerate Object Types Layouts', 'regenerateLayoutsForObjectTypes'))
            
        .addSubMenu(SpreadsheetApp.getUi().createMenu('Miscellaneous')
            .addItem('Clear Logs', 'clearLogs'))
        .addToUi();
}

/**
 * Shows a modal window with a header and a message
 */
function operationNotification(header, msg) {

    var ui = SpreadsheetApp.getUi();
    var result = ui.alert(
        header,
        msg,
        ui.ButtonSet.OK);

}

function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename)
        .getContent();
}