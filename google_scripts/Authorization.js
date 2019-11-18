/**
  Generate access token to a Salesforce organization and stores it to the Settings tab
*/

function retrieveStoredAccessToken() {

    var accessToken = SpreadsheetApp.getActive().getSheetByName("Settings").getRange(accessTokenNamedRange).getValue();
    var instanceUrl = SpreadsheetApp.getActive().getSheetByName("Settings").getRange(instanceUrlNamedRange).getValue();

    if (accessToken != null && instanceUrl != null &&
        accessToken != '' && instanceUrl != '') {
        var obj = {};
        obj['accessToken'] = accessToken;
        obj['instanceUrl'] = instanceUrl;

        Logger.log('Successfully retrieved access token: ' + accessToken);
        Logger.log('Successfully retrieved access instanceUrl: ' + instanceUrl);

        return obj;
    } else {
        Logger.log('Error: Unable to retrieved access token');
        return null;
    }
}

//TODO: generate deploymentId runtime

function getRedirectUri() {

    var deploymentId = 'AKfycbyjMo4nSKyEhgXrnoeTyw-4lbDdzXWOTwc9_J6EeA'
    var redirectUri = 'https://script.google.com/a/vlocity.com/macros/s/' + 
        deploymentId + 
        '/exec' + 
        '/auth/callback';
    
    Logger.log(redirectUri);
    return redirectUri;
}

function getScriptId() {
    return ScriptApp.getScriptId();
}


function showSidebarWebServerAuthenticationFlow() {

    //var organizationType = 'production';
    //var customerKey = '3MVG9tzQRhEbH_K3fNsB5WwrTEIXFGc17ncx_flHhKpEXWieXdnvupHW0G5rN24xdj81nKtl0mNzjTuNk.MXa';
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

function retrieveTokenByCode(authorizationCode) {
    //var organizationType = 'production';
    //var customerKey = '3MVG9tzQRhEbH_K3fNsB5WwrTEIXFGc17ncx_flHhKpEXWieXdnvupHW0G5rN24xdj81nKtl0mNzjTuNk.MXa';
    //var customerSecret = '8157374DC963037C29BA3406942DEF67C0C9168E93818FA731D31FFC9C1D8365';
    var authenticationPrefix = (organizationType == 'production' ? 'login' : 'test');
    var url = 'https://' + authenticationPrefix + '.salesforce.com/services/oauth2/token';

    var payload =
        'grant_type=authorization_code' + '&' +
        'client_id=' + customerKey + '&' +
        'client_secret=' + customerSecret + '&' +
        'redirect_uri=' + getRedirectUri() + '&' +
        'code=' + authorizationCode

    var options = {
        'method': 'post',
        //'contentType': 'application/json',
        'payload': payload,
        'muteHttpExceptions': true,
        'escaping': false
    };

    Logger.log('***request:' + JSON.stringify(UrlFetchApp.getRequest(url, options)));
    var response = UrlFetchApp.fetch(url, options);
    Logger.log('***response:' + response);

    var responseObj = JSON.parse(response);

    Logger.log('**** response.access_token: ' + responseObj.access_token);
    Logger.log('**** response.signature: ' + responseObj.signature);
    Logger.log('**** response.instance_url: ' + responseObj.instance_url);
    Logger.log('**** response.token_type: ' + responseObj.token_type);

    persistTokenInformation(responseObj.access_token, responseObj.instance_url);

    return responseObj;
}

function persistTokenInformation(accessToken, instanceUrl) {
    var accessTokenCell = SpreadsheetApp.getActive().getSheetByName("Settings").getRange(accessTokenNamedRange);
    var instanceUrlCell = SpreadsheetApp.getActive().getSheetByName("Settings").getRange(instanceUrlNamedRange);
    accessTokenCell.setValue(accessToken);
    instanceUrlCell.setValue(instanceUrl);
}

function usercallback() {}