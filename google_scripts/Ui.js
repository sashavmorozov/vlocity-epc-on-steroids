/**
 * This function is called on spreadsheet open and merely adds necessary menu items into the taskbar
 */
function onOpen() {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('Catalog Scripts')
        
        .addItem('Load Current Tab to Vlocity EPC', 'loadActiveSheetToVlocityEPC')
        .addItem('Load Selected Rows to Vlocity EPC', 'loadSelectedRowsToVlocityEPC')
        .addSubMenu(SpreadsheetApp.getUi().createMenu('Security')
            .addItem('Connect to Salesforce', 'connectToSalesforce')
            .addItem('Disconnect from Salesforce', 'disconnectFromSalesforce')
            .addItem('Get Callback URL', 'getRedirectUriMessageBox'))

        .addSubMenu(SpreadsheetApp.getUi().createMenu('EPC Jobs')
            .addItem('Regenerate JSONAttribute for Selected Products', 'regenerateJsonAttributes')
            .addItem('Clear Platform Cache', 'clearPlatformCache')
            .addItem('Regenerate Object Types Layouts', 'regenerateLayoutsForObjectTypes'))

        .addSubMenu(SpreadsheetApp.getUi().createMenu('Data Export')
            .addItem('Save Current Tab as JSON to Drive', 'saveActiveSheetAsJson')
            )
    
        .addSubMenu(SpreadsheetApp.getUi().createMenu('Miscellaneous')
            .addItem('View Logs', 'viewLogs')
            .addItem('Clear Logs', 'clearLogs')
            .addItem('Make Fancy Fonts', 'applyUniformFontsAndAlignment')
            )
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

function getRedirectUriMessageBox() {
    Logger.log('*** ' + ScriptApp.getService().getUrl());
    operationNotification('Callback URL',
        'Copy this URL into the Callback URL field of the connected app in Salesforce:\n\n' +
        getRedirectUri());
}


function connectToSalesforce(){
  if (scriptProperties.getProperty('instanceUrl') && scriptProperties.getProperty('accessToken')) {
    showDialogAuthorizationAlreadyCompleted();
  } else {
    showDialogWebServerAuthenticationFlow();
  }
}

function disconnectFromSalesforce(){
    if (scriptProperties.getProperty('instanceUrl') && scriptProperties.getProperty('accessToken')) {
        showDialogDisconnectFromSalesforce();
    } else {
        showDialogAlreadyDisconnected();
    }
  }

function showDialogWebServerAuthenticationFlow() {

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

    var template = HtmlService.createTemplateFromFile('pages/AuthorizationDialog');  
    template.authorizationUrl = authorizationUrl;
    var page = template.evaluate();
  
    page.setWidth(300)
      .setHeight(400);

    SpreadsheetApp.getUi().showModalDialog(page, 'Connect to Salesforce');
}

function showDialogAuthorizationAlreadyCompleted() {  
    var template = HtmlService.createTemplateFromFile('pages/AlreadyConnectedDialog'); 
    template.instanceUrl = scriptProperties.getProperty('instanceUrl'); 
    var page = template.evaluate();
  
    page.setWidth(300)
      .setHeight(400);

    SpreadsheetApp.getUi().showModalDialog(page, 'Already Connected');
}

function showDialogDisconnectFromSalesforce() {  
    var template = HtmlService.createTemplateFromFile('pages/DisconnectDialog'); 
    template.instanceUrl = scriptProperties.getProperty('instanceUrl'); 
    var page = template.evaluate();
  
    page.setWidth(300)
      .setHeight(400);

    SpreadsheetApp.getUi().showModalDialog(page, 'Disconnect?');
}

function showDialogAlreadyDisconnected() {  
    var template = HtmlService.createTemplateFromFile('pages/AlreadyDisconnectedDialog');  
    var page = template.evaluate();
  
    page.setWidth(300)
      .setHeight(400);

    SpreadsheetApp.getUi().showModalDialog(page, 'Already Disconnected');
}