/* .addItem("Import configuration for current tab from another file", "peps")
.addItem("Import configuration for all tabs from another file", "peps")
 */

/**
 * Function template
 * @param {enum} exportScope - kek
 * @return {string} URL of the deployed web application
 *
 * @example
 *
 *     getRedirectUri();
 */

function menuItem_importConfigurationFromAnotherFile() {

    showDialog_importConfigurationFromAnotherFile();

}

/**
 * Show the dialog to capture source file identifier
 * @param 
 * @return
 *
 * @example
 *
 *     showDialog_importConfigurationFromAnotherFile();
 */

function showDialog_importConfigurationFromAnotherFile() {
    var template = HtmlService.createTemplateFromFile(
        "pages/ImportConfiguration"
    );
    
    template.dialogParams = {
        activeSheetName: SpreadsheetApp.getActiveSheet().getName()

    };
    var page = template.evaluate();

    page.setWidth(300).setHeight(400);

    SpreadsheetApp.getUi().showModalDialog(page, "Import Configuration");
}