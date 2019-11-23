function test_shortenInstanceUrl() {
    var instanceUrl = "https://microcom.my.salesforce.com/";
    Logger.log('*** instanceName: ' + shortenInstanceUrl(instanceUrl));
    return shortenInstanceUrl(instanceUrl);
  }