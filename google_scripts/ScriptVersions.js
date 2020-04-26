function listScriptVesrions() {
  var url = 'https://script.googleapis.com/v1/projects/{scriptId}/versions';
  url = url.replace('{scriptId}', getScriptId());
  
  var token = ScriptApp.getOAuthToken();
  var options = {
        method: "get",
        //payload: payload,
        muteHttpExceptions: true,
        escaping: false,
        headers: {
            Authorization: 'Bearer ' + token
        }
    };
  
  var response = UrlFetchApp.fetch(url, options);
  var result = JSON.parse(response.getContentText());

  return result;
}

function getScriptVesrion(versionNumber) {
  var url = 'https://script.googleapis.com/v1/projects/{scriptId}/versions/{versionNumber}';
  url = url.replace('{scriptId}', getScriptId());
  url = url.replace('{versionNumber}', versionNumber);
  
  var token = ScriptApp.getOAuthToken();
  var options = {
        method: "get",
        //payload: payload,
        muteHttpExceptions: true,
        escaping: false,
        headers: {
            Authorization: 'Bearer ' + token
        }
    };
  
  var response = UrlFetchApp.fetch(url, options);
  var result = JSON.parse(response.getContentText());
  
  return result;
}

function getLastScriptVesrion() {
  var lastScriptVersionNumber = -1;
  var lastScriptVersion;
  var scriptVersions = listScriptVesrions();
  
  scriptVersions.versions.forEach(function(versions) {
    if (versions.versionNumber > lastScriptVersionNumber) {
      lastScriptVersionNumber = versions.versionNumber;
      lastScriptVersion = versions;
    }
  });
  
  return lastScriptVersion;
}

function createScriptVesrion(description) {
  var url = 'https://script.googleapis.com/v1/projects/{scriptId}/versions';
  url = url.replace('{scriptId}', getScriptId());
  
  var token = ScriptApp.getOAuthToken();
  var request = {
    description: description
  };
  var options = {
        method: "post",
        payload: request,
        muteHttpExceptions: true,
        escaping: false,
        headers: {
            Authorization: 'Bearer ' + token
        }
    };
  
  var response = UrlFetchApp.fetch(url, options);
  var result = JSON.parse(response.getContentText());
  console.log(JSON.stringify(result));
  return result;
}


/********TESTS**********************/

function listScriptVesrions_test() { 
  console.log(JSON.stringify(listScriptVesrions()));
}

function getScriptVesrion_test() {
  var versionNumber = 1;
  console.log(JSON.stringify(getScriptVesrion(versionNumber)));
  
  createScriptVesrion("loligaging");
}

function getLastScriptVesrion_test() { 
  console.log(JSON.stringify(getLastScriptVesrion()));
}

function createScriptVesrion_test() { 
  console.log(JSON.stringify(createScriptVesrion("created via api")));
}
