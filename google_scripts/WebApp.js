function doGet(request) {
 
    var template = HtmlService.createTemplateFromFile('pages/AuthorizationConfirmation');
    var tokenResponse = retrieveTokenByCode(request.parameter.code);
    template.request = request;
    template.instance_url = tokenResponse.instance_url;

    var page = template.evaluate();

    return page;
}