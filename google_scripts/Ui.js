/**
 * This function is called on spreadsheet open and merely adds necessary menu items into the taskbar
 */
function onOpen() {
  //reset connection token and instance URL to force reconnection on every open
  eraseTokenInformation();

  buildMenu();
}

function buildMenu() {
  var ui = SpreadsheetApp.getUi();

  ui.createMenu("Catalog Scripts")

    .addItem("Load Current Tab to Vlocity EPC", "loadActiveSheetToVlocityEPC")
    .addItem("Load Only Checked Rows to Vlocity EPC", "loadCheckedRowsToVlocityEPC")
  
    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu("Security")
        .addItem("Connect to Salesforce", "connectToSalesforce")
        .addItem("Disconnect from Salesforce", "disconnectFromSalesforce")
        .addItem("Get Callback URL", "getRedirectUriMessageBox")
    )

    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu("EPC Jobs")
        .addItem(
          "Regenerate JSONAttribute for Selected Products",
          "regenerateJsonAttributes"
        )
        .addItem("Clear Platform Cache", "clearPlatformCache")
        .addItem(
          "Regenerate Object Types Layouts",
          "regenerateLayoutsForCheckedObjectTypes"
        )
    )

    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu("Data Export")
        .addItem("Save Current Tab as JSON to Drive", "saveActiveSheetAsJson")
    )

    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu("Miscellaneous")
        .addItem("📜 View Logs", "viewLogs")
        .addItem("🧹 Clear Logs", "clearLogs")
        .addItem("🗛 Make Fancy Fonts", "applyUniformFontsAndAlignment")
    )
    .addToUi();

  ui.createMenu("Select Rows")

    .addItem("All", "selectAllRows")
    .addItem("Invert", "invertSelection")
    .addItem("Clear", "clearSelection")
    .addToUi();

  ui.createMenu("Logs")
    .addItem("📜 View Logs", "viewLogs")
    .addItem("🧹 Clear Logs", "clearLogs")
    .addToUi();

  /* ui.createMenu("More EOS tools")
    .addItem("Placeholder", "stubFunction")
    .addToUi(); */

  ui.createMenu("EOS help")
    .addItem("Installation and Configuration", "redirectToInstallationNotes")
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

function getRedirectUriMessageBox() {
  Logger.log("*** " + ScriptApp.getService().getUrl());
  operationNotification(
    "Callback URL",
    "Copy this URL into the Callback URL field of the connected app in Salesforce:\n\n" +
      getRedirectUri()
  );
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
    organizationType == "production" ? "login" : "test";
  var url =
    "https://" +
    authenticationPrefix +
    ".salesforce.com/services/oauth2/authorize";

  var parameters =
    "response_type=code" +
    "&" +
    "client_id=" +
    customerKey +
    "&" +
    "redirect_uri=" +
    getRedirectUri();

  var authorizationUrl = url + "?" + parameters;

  Logger.log("*** authorizationUrl: " + authorizationUrl);

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
  template.instanceUrl = scriptProperties.getProperty("instanceUrl");
  var page = template.evaluate();

  page.setWidth(300).setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(page, "Already Connected");
}

function showDialogDisconnectFromSalesforce() {
  var template = HtmlService.createTemplateFromFile("pages/DisconnectDialog");
  template.instanceUrl = scriptProperties.getProperty("instanceUrl");
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

function showGenericModalDialog(pageTemplateName, pageTitle) {
  var template = HtmlService.createTemplateFromFile(pageTemplateName);
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
    Logger.log(
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
    Logger.log("&&& " + currentState[i][0]);
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
    Logger.log(
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
    Logger.log("&&& " + currentState[i][0]);
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
    Logger.log(
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
