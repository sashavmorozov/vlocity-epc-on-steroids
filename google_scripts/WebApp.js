function doGet(request) {
    var pageTemplateName;
    var template;  
    var page;

    /* Serve page by name, for testing purposes */
    if (request.parameter.page) {
      //serve a test page by a web app
      pageTemplateName = request.parameter.page;
      template = HtmlService.createTemplateFromFile('pages/' + pageTemplateName);
      template.request = request;
      page = template.evaluate();
      return page;
    }
 
    /* Serve authorization callback page by default */
    var tokenResponse = retrieveTokenByCode(request.parameter.code);

    if (!tokenResponse.error) {
      pageTemplateName = "AuthorizationSuccessPage";
    } else {
      pageTemplateName = "AuthorizationFailurePage";
    }
  
    template = HtmlService.createTemplateFromFile('pages/' + pageTemplateName);
    template.request = request;
    template.tokenResponse = tokenResponse;
    
    page = template.evaluate();

    return page;
}