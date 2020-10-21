/**
 * Simple manual tests for UpgradeUtils 
 *
 */

function test_importContentFromAnotherSpreadsheet () {
    var documentId = "1CHnjyLwBfkvEDF4vzilwPmEqDWgbHqOGoobQ3OQ9Dbo"; //Business Internet
    importContentFromAnotherSpreadsheet(documentId);
}

function test_importSheetContentFromAnotherSpreadsheet () {
    var documentId = "1CHnjyLwBfkvEDF4vzilwPmEqDWgbHqOGoobQ3OQ9Dbo"; //Business Internet
    var sheetName = "Promotion Assignments";
    importSheetContentFromAnotherSpreadsheet(documentId, sheetName);
}

function test_getSheetContentFromAnotherSpreadsheet () {
    var documentId = "1CHnjyLwBfkvEDF4vzilwPmEqDWgbHqOGoobQ3OQ9Dbo"; //Business Internet
    var sheetName = "Offerings";
    var content = getSheetContentFromAnotherSpreadsheet(documentId, sheetName);
    
    for (var i = 0; i < content.length; i++) {
      console.log(content[i].toString());
    }
}