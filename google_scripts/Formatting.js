function getUserHeaderTextStyle() {
  var userHeaderTextStyle = SpreadsheetApp.newTextStyle()
    .setFontFamily(userHeaderFormattingSettings["Font Family"])
    .setFontSize(userHeaderFormattingSettings["Font Size"])
    .setForegroundColor(userHeaderFormattingSettings["Font Color"])
    .setBold(userHeaderFormattingSettings["Bold"])
    .setItalic(userHeaderFormattingSettings["Italic"])
    .build();
  return userHeaderTextStyle;
}

function getUserDataTextStyle() {
  var userDataTextStyle = SpreadsheetApp.newTextStyle()
    .setFontFamily(userDataFormattingSettings["Font Family"])
    .setFontSize(userDataFormattingSettings["Font Size"])
    .setForegroundColor(userDataFormattingSettings["Font Color"])
    .setBold(userDataFormattingSettings["Bold"])
    .setItalic(userDataFormattingSettings["Italic"])
    .build();
  return userDataTextStyle;
}

/* Work in progress do not use this yet, take a while to execute */
function menuItem_applyDefaultFonts() {
  var currentSheetName = SpreadsheetApp.getActive().getActiveSheet().getName();
  applyDefaultFormattingToSheetByName(currentSheetName);
}

/* function applyDefaultFormattingToAllSheets() {
  var sheets = SpreadsheetApp.getActive().getSheets();
  for each (var sheet in sheets) {
    applyDefaultFormattingToSheetByName(sheet.getName());
  }
} */


function applyDefaultFormattingToSheetByName(sheetName) {

  if (!sheetName) {
    return;
  }
  
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  var headerRange = sheet.getRange(1, 1, 2, sheet.getLastColumn());
  var dataRange = sheet.getRange(3, 1, sheet.getLastRow(), sheet.getLastColumn());
  

  var userHeaderTextStyle = getUserHeaderTextStyle();
  headerRange.setTextStyle(userHeaderTextStyle);
  headerRange.setBackground(userHeaderFormattingSettings["Background Color"]);
  headerRange.setHorizontalAlignment(userHeaderFormattingSettings["Horizontal Alignment"]);
  headerRange.setVerticalAlignment(userHeaderFormattingSettings["Vertical Alignment"]);
  
  
  dataRange.setTextStyle(getUserDataTextStyle());
  
  /* setBackground and setHorizontalAlignment should be content type sensitive */
  //dataRange.setBackground(userDataFormattingSettings["Background Color"]);
  //dataRange.setHorizontalAlignment(userDataFormattingSettings["Horizontal Alignment"]);
  dataRange.setVerticalAlignment(userDataFormattingSettings["Vertical Alignment"]);
  
}


























