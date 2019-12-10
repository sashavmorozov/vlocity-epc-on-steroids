function regenerateLayoutsForObjectTypes_DELETE_ME() {
  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var activeRange = activeSheet.getActiveRange();
  var activeRangeValues = activeRange.getValues();  
  var selectionWidth = activeRange.getLastColumn();
  var tableWidth = activeSheet.getLastColumn();
  var VIP_PREFIX = '/services/apexrest/vlocity_cmt/v1/integrationprocedure/';
  var vipName = 'EPC_RegenerateLayoutsForObjectType';
  var vipEndpoint = VIP_PREFIX + vipName;
  var inputParameters = {};
  var objectTypes = [];
  
  if (selectionWidth != tableWidth || activeSheet.getName() != 'Object Types') {
    operationNotification(
      "Info",
      "\nTo regenerate layouts for object types:\n\n " +  
      " 1. Navigate to the Object Types tab\n" +
      " 2. Select entire rows\n" + 
      " 3. Start the procedure\n" + 
      "\nThe layouts will be regenerated (removed and recreated) only for the selected object types records"
    );
    return;
  }
  
  for (i = 0; i < activeRange.getValues().length; i++) {
    objectTypes.push(activeRangeValues[i][1]);
  }
  
  inputParameters['targetObjectTypeName'] = objectTypes;
  
  var payload = JSON.stringify(inputParameters);
  Logger.log('*** payload: ' + payload);
  //var result = invokeVipByNameChunkable(vipName, payload);
  
  for (i = 0; i < objectTypes.length; i++) {
    var singleItemPayload = {};
    singleItemPayload['targetObjectTypeName'] = objectTypes[i];
    invokeVipByName(vipName, JSON.stringify(singleItemPayload));
  }
}


/**
 * DEPRECATED. Used to provide a dialog for the connection establishing process. Replaced with specialized UI.
 *
 * @return {void} nothing
 *
 * @example
 *
 *     showSidebarWebServerAuthenticationFlow();
 */
function showSidebarWebServerAuthenticationFlow() {

  var authenticationPrefix = (organizationType == 'production' ? 'login' : 'test');
  var url = 'https://' +
      authenticationPrefix +
      '.salesforce.com/services/oauth2/authorize';

  var parameters =
      'response_type=code' + '&' +
      'client_id=' + customerKey + '&' +
      'redirect_uri=' + getRedirectUri();

  var authorizationUrl = url + '?' + parameters;

  Logger.log('*** authorizationUrl: ' + authorizationUrl);

  var template = HtmlService.createTemplateFromFile('pages/AuthorizationSidebar');
  template.authorizationUrl = authorizationUrl;
  var page = template.evaluate();

  SpreadsheetApp.getUi().showSidebar(page);
}