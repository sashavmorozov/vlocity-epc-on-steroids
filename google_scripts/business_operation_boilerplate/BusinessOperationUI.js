/* 
 * Copy-paste into UI.js and adjust this snippet to add the function into the menu
 * 
 *  .addItem("My Awesome Function", "menuItem_myAwesomeFunction")
 *
*/

/**
 * Function entry-point that sits behind a corresponding menu item
 * Function name: menuItem_MenuItemTextInCamelCase 
 * @param
 * @return
 *
 * @example
 *
 *     menuItem_MenuItemTextInCamelCase();
 */

function menuItem_MenuItemTextInCamelCase() {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);
    console.time(arguments.callee.name);

    showDialog_menuItemTextInCamelCase();

    console.timeEnd(arguments.callee.name);
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return;
}

/**
 * Show the business operation entry dialog
 * Typically used to capture additional information and operation confirmation
 * @param 
 * @return
 *
 * @example
 *
 *     showDialog_menuItemTextInCamelCase();
 */

function showDialog_menuItemTextInCamelCase() {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);
    console.time(arguments.callee.name);

    var template = HtmlService.createTemplateFromFile(
        "pages/MenuItemTextInCamelCase"
    );
    
    template.dialogParams = {
        activeSheetName: SpreadsheetApp.getActiveSheet().getName()

    };
    var page = template.evaluate();
    page.setWidth(300).setHeight(400);
    SpreadsheetApp.getUi().showModalDialog(page, "MenuItemTextInCamelCase");

    console.timeEnd(arguments.callee.name);
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return;
}