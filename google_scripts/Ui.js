function buildMenu() {
  var ui = SpreadsheetApp.getUi();

  ui.createMenu("Catalog Scripts")

    .addItem("Load current tab to Vlocity EPC", "pushActiveSheetToVlocityEPC")
    .addItem("Load only checked rows to Vlocity EPC", "pushCheckedRowsToVlocityEPC")
  
    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu("Security")
        .addItem("Connect to Salesforce", "connectToSalesforce")
        .addItem("Disconnect from Salesforce", "disconnectFromSalesforce")
        .addItem("Get callback URL", "retrieveCallbackUrl")
        .addItem("Configure connection to Salesforce", "configureConnectionToSalesforce")
    )

    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu("EPC Jobs")
        .addItem("Product hierarchy maintenance job", "runProductHierarchyMaintenanceJob")
        .addItem("Refresh pricebook job", "runRefreshPricebookJob")
        .addItem("Clear managed platform cache", "runClearManagedPlatformCacheJob")
        .addItem("Generate global keys", "runGenerateGlobalKeysJob")
        .addItem(
          "Regenerate JSONAttribute for selected products",
          "regenerateJsonAttributes"
        )
        .addItem(
          "Regenerate Object Types layouts",
          "regenerateLayoutsForCheckedObjectTypes"
        )
        .addItem(
          "Fix Picklist Values for selected products",
          "runFixPicklistValuesForCheckedProductsJob"
        )
    )

    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu("Data export")
        .addItem("Save current tab as JSON to Drive", "saveActiveSheetAsJsonToGDrive")
    )
  
    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu("Data import")
        .addItem("Import entity for current sheet from Catalog", "retrieveCurrentSheetFromCatalog")
    )

    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu("Miscellaneous")
        .addItem("Get Script Id", "retreiveScriptId")
        .addItem("View logs", "viewLogs")
        .addItem("Clear logs", "clearLogs")
        .addItem("Apply default fonts", "applyDefaultFormattingToCurrentSheet")
        .addItem("Re-execute last business operation", "reexecuteLastBusinessOperation")
        .addItem("Collect data for LucidChart diagram", "collectDataForLucidChartDiagram")
        .addItem("View record in Salesforce", "viewRecordInSalesforce"))
      
    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu("View")
        .addItem("Show all tabs", "showAllSheets")
        .addItem("Show only EPC/CPQ tabs", "showOnlyEpcCpqSheets")
        .addItem("Show only OM tabs", "showOnlyOmSheets")
       
    )
    .addToUi();

  ui.createMenu("Select Rows")

    .addItem("All", "selectAllRows")
    .addItem("Invert", "invertSelection")
    .addItem("Clear", "clearSelection")
    .addToUi();

  ui.createMenu("Logs")
    .addItem("View logs", "viewLogs")
    .addItem("Clear logs", "clearLogs")
    .addToUi();

  /* ui.createMenu("More EOS tools")
    .addItem("Placeholder", "stubFunction")
    .addToUi(); */

  ui.createMenu("EOS help")
    .addItem("Installation and configuration", "redirectToInstallationNotes")
    .addItem("About EPC on Steroids", "showAboutDialog")
    .addItem("Help center", "redirectToHelpCenter")
    .addItem("💡 Suggest an idea", "redirectToSuggestIdea")
    .addItem("🐛 Report an issue", "redirectToReportIssue")
    .addToUi();
}

/**
 * Shows a modal window with a header and a message
 */
function operationNotification(header, msg) {
  var ui = SpreadsheetApp.getUi();
  var result = ui.alert(header, msg, ui.ButtonSet.OK);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

//DEPRECATED
function getRedirectUriMessageBox() {
  console.log("*** " + ScriptApp.getService().getUrl());
  operationNotification(
    "Callback URL",
    "Copy this URL into the Callback URL field of the connected app in Salesforce:\n\n" +
      getRedirectUri()
  );
}

function retrieveCallbackUrl() {
    showDialogCallbackUrl();
}

function retreiveScriptId() {
    showDialogScriptId();
}

function connectToSalesforce() {
  if (!areAuthorizationProperiesSet) {
    operationNotification(
      "Authorization Properties Are not Set",
      "\nLooks like application consumer key or secret are not set. Please verify configuration was done properly"
    );
  }

  if (!isConnectedToSalesforce()) {
    showDialogWebServerAuthenticationFlow();
  } else {
    showDialogAuthorizationAlreadyCompleted();
  }
}

function disconnectFromSalesforce() {
  if (isConnectedToSalesforce()) {
    showDialogDisconnectFromSalesforce();
  } else {
    showDialogAlreadyDisconnected();
  }
}

function showDialogWebServerAuthenticationFlow() {
  var authenticationPrefix =
    PropertiesService.getScriptProperties().getProperty(CONST_ORG_TYPE_PROPERTY_NAME) == "Production" ? "login" : "test";
  var url =
    "https://" +
    authenticationPrefix +
    ".salesforce.com/services/oauth2/authorize";

  var parameters =
    "response_type=code" +
    "&" +
    "client_id=" +
    PropertiesService.getScriptProperties().getProperty(CONST_CUSTOMER_KEY_PROPERTY_NAME) +
    "&" +
    "redirect_uri=" +
    getRedirectUri();

  var authorizationUrl = url + "?" + parameters;

  console.log("*** authorizationUrl: " + authorizationUrl);

  var template = HtmlService.createTemplateFromFile(
    "pages/AuthorizationDialog"
  );
  template.authorizationUrl = authorizationUrl;
  var page = template.evaluate();

  page.setWidth(300).setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(page, "Connect to Salesforce");
}

function showDialogAuthorizationAlreadyCompleted() {
  var template = HtmlService.createTemplateFromFile(
    "pages/AlreadyConnectedDialog"
  );
  template.instanceUrl = PropertiesService.getScriptProperties().getProperty("instanceUrl");
  var page = template.evaluate();

  page.setWidth(300).setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(page, "Already Connected");
}

function showDialogCallbackUrl() {
  var template = HtmlService.createTemplateFromFile(
    "pages/GetCallbackUrlDialog"
  );
  template.callbackUrl = getRedirectUri();
  var page = template.evaluate();

  page.setWidth(300).setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(page, "Callback URL");
}

function showDialogScriptId() {
  var template = HtmlService.createTemplateFromFile(
    "pages/GetScriptIdDialog"
  );
  template.scriptId = getScriptId();
  var page = template.evaluate();

  page.setWidth(300).setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(page, "Script Id");
}

function showDialogDisconnectFromSalesforce() {
  var template = HtmlService.createTemplateFromFile("pages/DisconnectDialog");
  template.instanceUrl = PropertiesService.getScriptProperties().getProperty("instanceUrl");
  var page = template.evaluate();

  page.setWidth(300).setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(page, "Disconnect?");
}

function showDialogAlreadyDisconnected() {
  var template = HtmlService.createTemplateFromFile(
    "pages/AlreadyDisconnectedDialog"
  );
  var page = template.evaluate();

  page.setWidth(300).setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(page, "Already Disconnected");
}

function showGenericModalDialog(pageTemplateName, pageTitle, pageParams) {
  var template = HtmlService.createTemplateFromFile(pageTemplateName);
  template.pageParams = pageParams;
  
  var page = template.evaluate();

  page.setWidth(300).setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(page, pageTitle);
}

function showAboutDialog() {
  showGenericModalDialog("pages/About", "About " + getApplicationName());
}

function showProgressDialog() {
  showGenericModalDialog("pages/OperationInProgress", "Buckle up!");
}

/****************** Selection Management **********************/

//.addItem('All', 'selectAllRows')
//      .addItem('Invert', 'invertSelection')
//    .addItem('Clear', 'clearSelection')

function selectAllRows() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var numRows = sheet.getLastRow();
  var checkedColumn = sheet.getRange(
    1,
    CONST_CHECKED_COLUMN_NUMBER,
    numRows,
    1
  );

  var currentState = checkedColumn.getValues();
  var targetState = [];

  if (!currentState) return;

  if (currentState[1].toString() !== "Checked") {
    console.log(
      '*** This sheet does not seem to support rows checking. Make sure the header column is called "Checked"'
    );
    operationNotification(
      "Error",
      'This sheet does not seem to support rows checking. Make sure the header column is called "Checked"'
    );
    return;
  }

  //push header information as-is
  targetState.push(currentState[0]);
  targetState.push(currentState[1]);

  //craft a target selection state
  for (var i = 2; i < currentState.length; i++) {
    console.log("&&& " + currentState[i][0]);
    var targetStateItems = currentState[i][0] !== "" ? true : "";
    targetState.push([targetStateItems]);
  }

  checkedColumn.setValues(targetState);
}

function clearSelection() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var numRows = sheet.getLastRow();
  var checkedColumn = sheet.getRange(
    1,
    CONST_CHECKED_COLUMN_NUMBER,
    numRows,
    1
  );

  var currentState = checkedColumn.getValues();
  var targetState = [];

  if (!currentState) return;

  if (currentState[1].toString() !== "Checked") {
    console.log(
      '*** This sheet does not seem to support rows checking. Make sure the header column is called "Checked"'
    );
    operationNotification(
      "Error",
      'This sheet does not seem to support rows checking. Make sure the header column is called "Checked"'
    );
    return;
  }

  //push header information as-is
  targetState.push(currentState[0]);
  targetState.push(currentState[1]);

  //craft a target selection state
  for (var i = 2; i < currentState.length; i++) {
    console.log("&&& " + currentState[i][0]);
    var targetStateItems = currentState[i][0] !== "" ? false : "";
    targetState.push([targetStateItems]);
  }

  checkedColumn.setValues(targetState);
}

function invertSelection() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var numRows = sheet.getLastRow();
  var checkedColumn = sheet.getRange(
    1,
    CONST_CHECKED_COLUMN_NUMBER,
    numRows,
    1
  );

  var currentState = checkedColumn.getValues();
  var targetState = [];

  if (!currentState) return;

  if (currentState[1].toString() !== "Checked") {
    console.log(
      '*** This sheet does not seem to support rows checking. Make sure the header column is called "Checked"'
    );
    operationNotification(
      "Error",
      'This sheet does not seem to support rows checking. Make sure the header column is called "Checked"'
    );
    return;
  }

  //push header information as-is
  targetState.push(currentState[0]);
  targetState.push(currentState[1]);

  //craft a target selection state
  for (var i = 2; i < currentState.length; i++) {
    var targetStateItem =
      currentState[i][0] !== ""
        ? currentState[i][0] === true
          ? false
          : true
        : "";
    targetState.push([targetStateItem]);
  }

  checkedColumn.setValues(targetState);
}

function redirectToUrl(url) {
  var template = HtmlService.createTemplateFromFile("pages/Redirect");
  template.targetUrl = url;

  var page = template.evaluate();
  page.setWidth(300).setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(page, "Redirecting...");
}

function redirectToInstallationNotes() {
  var url =
    "https://github.com/sashavmorozov/vlocity-epc-on-steroids/wiki/Installation-Instructions";
  redirectToUrl(url);
}

function redirectToHelpCenter() {
  var url = "https://github.com/sashavmorozov/vlocity-epc-on-steroids/wiki";
  redirectToUrl(url);
}

function redirectToSuggestIdea() {
  var url =
    "https://github.com/sashavmorozov/vlocity-epc-on-steroids/wiki/Suggest-an-Idea";
  redirectToUrl(url);
}

function redirectToReportIssue() {
  var url =
    "https://github.com/sashavmorozov/vlocity-epc-on-steroids/wiki/Report-an-Issue";
  redirectToUrl(url);
}

function displayDialog(dialogPage, dialogTitle, dialogParams) {
  var template = HtmlService.createTemplateFromFile(dialogPage);
  template.dialogParams = dialogParams;
  
  var page = template.evaluate();
  page.setWidth(300).setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(page, dialogTitle);
}

function displayWarningDialog(dialogParams) {
  var dialogPage = "pages/WarningDialog";
  var dialogTitle = "Warning";

  displayDialog(dialogPage, dialogTitle, dialogParams);
}

function displayErrorDialog(dialogParams) {
  var dialogPage = "pages/ErrorDialog";
  var dialogTitle = "Error";

  displayDialog(dialogPage, dialogTitle, dialogParams);
}

function displaySuccessDialog(dialogParams) {
  var dialogPage = "pages/SuccessDialog";
  var dialogTitle = "Success";

  displayDialog(dialogPage, dialogTitle, dialogParams);
}

function configureConnectionToSalesforce(dialogParams) {
  var dialogPage = "pages/ConnectionConfigurationDialog";
  var dialogTitle = "Configuration";
  dialogParams = {
    configurationObj: getConfiguration()
  };
  

  displayDialog(dialogPage, dialogTitle, dialogParams);
}

/**
 * Shows all sheets in the app
 *
 * @param {string} accessToken - Retreived access token
 * @param {string} instanceUrl - URL of the Salesforce organization
 * @return {void} - nothing
 *
 * @example
 *     var token = "00D4J000000EIWs!AR8AQOKkJLSxq7bp8eqnkcfyUC.gKwqM8V_63fF7YvWHO_xWn3HtjQ8qkUfviBoqbjJo05FDQcjeL";
 *     var url = "https://softb.my.salesforce.com";
 *     persistTokenInformation(token, url);
 */

function showAllSheets() {
  console.log("*** METHOD_ENTRY: " + arguments.callee.name);

  /*
  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  for each (var s in sheets) {
    if (s.isSheetHidden()) {
      s.showSheet();
    }
  }
  */
  
  showOnlySpecificDomainSheets(commonSheets.concat(cpqSheets, omSheets));

  console.log("*** METHOD_EXIT: " + arguments.callee.name);
}

/**
 * Shows only common and OM-related sheets in the app
 *
 * @return {void} - nothing
 *
 * @example
 *     showOnlyOmSheets()
 */

function showOnlyOmSheets() {
  console.log("*** METHOD_ENTRY: " + arguments.callee.name);
  showOnlySpecificDomainSheets(omSheets);
  console.log("*** METHOD_EXIT: " + arguments.callee.name);
}

/**
 * Shows only common and EPC/CPQ-related sheets in the app
 *
 * @return {void} - nothing
 *
 * @example
 *     showOnlyOmSheets()
 */

function showOnlyEpcCpqSheets() {
  console.log("*** METHOD_ENTRY: " + arguments.callee.name);
  showOnlySpecificDomainSheets(cpqSheets);
  console.log("*** METHOD_EXIT: " + arguments.callee.name);
}

/**
 * Shows all sheets related to a specific domain (parameter)
 *
 * @param {string[]} domainSheets - Array of names of related sheets
 * @return {void} - nothing
 *
 * @example
 *     showOnlySpecificDomainSheets(cpqSheets);
 */

function showOnlySpecificDomainSheets(domainSheets) {
  console.log("*** METHOD_ENTRY: " + arguments.callee.name);

  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  var sheetNamesToHide = [];
  var sheetNamesToUnhide = [];
  for (var i = 0; i < sheets.length; i++) { 
    var s = sheets[i];
    var sheetName = s.getName();
    if (domainSheets.indexOf(sheetName) === -1 &&
       commonSheets.indexOf(sheetName) === -1) {
      sheetNamesToHide.push(sheetName);
    }
    
    if (domainSheets.indexOf(sheetName) !== -1 ||
       commonSheets.indexOf(sheetName) !== -1) {
      sheetNamesToUnhide.push(sheetName);
    }
  }
  
  console.log("*** VARIABLE: sheetsNamesToHide: " + JSON.stringify(sheetNamesToHide));
  
  for (var i = 0; i < sheetNamesToHide.length; i++) { 
    var sheetName = sheetNamesToHide[i];
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet.isSheetHidden()) {
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName).hideSheet();
    }
  }
  
  for (var i = 0; i < sheetNamesToUnhide.length; i++) { 
    var sheetName = sheetNamesToUnhide[i];
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (sheet.isSheetHidden()) {
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName).showSheet();
    }
  }

  console.log("*** METHOD_EXIT: " + arguments.callee.name);
}





