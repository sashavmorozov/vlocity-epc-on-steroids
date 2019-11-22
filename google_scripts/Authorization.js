function getRedirectUri() {

    var redirectUri = 
        ScriptApp.getService().getUrl() + 
        '/auth/callback';
    
    Logger.log(redirectUri);
    return redirectUri;
}

function getScriptId() {
    return ScriptApp.getScriptId();
}


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

function retrieveTokenByCode(authorizationCode) {

  var authenticationPrefix = (organizationType == 'production' ? 'login' : 'test');
    var url = 'https://' + authenticationPrefix + '.salesforce.com/services/oauth2/token';

    var payload =
        'grant_type=authorization_code' + '&' +
        'client_id=' + customerKey + '&' +
        'client_secret=' + customerSecret + '&' +
        'redirect_uri=' + getRedirectUri() + '&' +
        'code=' + authorizationCode;

    var options = {
        'method': 'post',
        'payload': payload,
        'muteHttpExceptions': true,
        'escaping': false
    };

    Logger.log('*** request:' + JSON.stringify(UrlFetchApp.getRequest(url, options)));
    var response = UrlFetchApp.fetch(url, options);
    Logger.log('*** response:' + response);
  
    var responseObj = JSON.parse(response);
  
  if (responseObj['error'] != '' || responseObj['error'] != null) {
   
    logProgress('Authorization', 'retrieveTokenByCode', 'Token retrieved successfully');
    logProgress('Authorization', 'retrieveTokenByCode', response);
    
    Logger.log('**** response.access_token: ' + responseObj.access_token);
    Logger.log('**** response.signature: ' + responseObj.signature);
    Logger.log('**** response.instance_url: ' + responseObj.instance_url);
    Logger.log('**** response.token_type: ' + responseObj.token_type);

    persistTokenInformation(responseObj.access_token, responseObj.instance_url);

    return responseObj;
  } else {
    logProgress('Authorization', 'retrieveTokenByCode', 'Token is not retrieved successfully');
    logProgress('Authorization', 'retrieveTokenByCode', response);
    return responseObj;
  }
}

function persistTokenInformation(accessToken, instanceUrl) {
    scriptProperties.setProperty('accessToken', accessToken);
    scriptProperties.setProperty('instanceUrl', instanceUrl);   
}

function eraseTokenInformation() {
    scriptProperties.setProperty('accessToken', '');
    scriptProperties.setProperty('instanceUrl', '');   
}

/**
  Generate access token to a Salesforce organization and stores it to the Settings tab
*/

function retrieveStoredAccessToken() {

    var accessToken = scriptProperties.getProperty('accessToken');
    var instanceUrl = scriptProperties.getProperty('instanceUrl');
  
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

