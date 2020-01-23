function doGet(request) {
 
    var template = HtmlService.createTemplateFromFile('pages/AuthorizationConfirmation');
    var tokenResponse = retrieveTokenByCode(request.parameter.code);
    var page;
  
    if (tokenResponse.error) {
      template = HtmlService.createTemplateFromFile('pages/AuthorizationFailed'); 
    }
  
    template.request = request;
    template.tokenResponse = tokenResponse;
    
    page = template.evaluate();

    return page;
}