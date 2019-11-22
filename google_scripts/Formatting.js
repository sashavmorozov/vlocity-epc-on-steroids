/* for future use */

function applyUniformFontsAndAlignment() {
  var activeSheet = SpreadsheetApp.getActive().getActiveSheet();  
  var range = activeSheet.getRange(1, 1, activeSheet.getLastRow(), activeSheet.getLastColumn());
  
  //range.setFontColor("black");
  range.setFontFamily("Roboto");
  range.setFontSize(9);
  
  range.setBorder(false, false, false, false, false, false);
  //range.setHorizontalAlignment("left");
  range.setVerticalAlignment("middle");
}