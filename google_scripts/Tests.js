/* empty */
function invokeVipByName_Test() {
  var vipName = 'EPC_LoadGenericEPCDefinitions';
  var payload = {};
  payload['dataRaptorName'] = 'EPC on Steroids_Export All Offerings';
  return invokeVipByName(vipName, JSON.stringify(payload));
}

function listAllSheets() {
  var sheets = SpreadsheetApp.getActive().getSheets();
  for each (var s in sheets)
  {
    console.log(s.getName());
  } 
}