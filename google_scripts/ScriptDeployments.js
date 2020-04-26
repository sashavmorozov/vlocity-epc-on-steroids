/************DEPLOYMENTS******************/

function listDeployments() {
  var url = 'https://script.googleapis.com/v1/projects/{scriptId}/deployments';
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

function getDeployment(deploymentId) {
  var url = 'https://script.googleapis.com/v1/projects/{scriptId}/deployments/{deploymentId}';
  url = url.replace('{scriptId}', getScriptId());
  url = url.replace('{deploymentId}', deploymentId);
  
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

function getLastDeployment() {
  var lastDeployment;
  var lastScriptDeploymentVersion = -1;
  var scriptDeployments = listDeployments();
  
  scriptDeployments.deployments.forEach(function(deployments) {
    if (deployments.deploymentConfig.versionNumber) {
      if (deployments.deploymentConfig.versionNumber > lastScriptDeploymentVersion) {
        lastScriptDeploymentVersion = deployments.deploymentConfig.versionNumber;
        lastDelpoyment = deployments;
      }
    }    
  });
  
  return lastDelpoyment;
}

function createDeployment(versionNumber, manifestFileName, description) {
  var url = 'https://script.googleapis.com/v1/projects/{scriptId}/deployments';
  url = url.replace('{scriptId}', getScriptId());
  
  if (!manifestFileName) {
    manifestFileName = "appsscript";
  }
  
  var token = ScriptApp.getOAuthToken();
  var request = {
    versionNumber: versionNumber,
    manifestFileName: manifestFileName,
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
  return result;
}

function createDeploymentAndNewVersion(manifestFileName, description) {
  var scriptVersion = createScriptVesrion(description);
  createDeployment(scriptVersion.versionNumber.toString(), manifestFileName, description);
}
  

function deleteDeployment(deploymentId) {
  var url = 'https://script.googleapis.com/v1/projects/{scriptId}/deployments/{deploymentId}';
  url = url.replace('{scriptId}', getScriptId());
  url = url.replace('{deploymentId}', deploymentId);
  
  var token = ScriptApp.getOAuthToken();
  var options = {
        method: "delete",
        //payload: request,
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

  
function deleteAllDeployments() {
  var scriptDeployments = listDeployments();
  
  scriptDeployments.deployments.forEach(function(deployments) {
    if (deployments.deploymentConfig.versionNumber) {
      deleteDeployment(deployments.deploymentId);
    }    
  });
}

function resetDeployments() {
  var scriptDeployments = listDeployments();
  
  deleteAllDeployments();
  createDeploymentAndNewVersion("appsscript", "Reset Deployment")
}


/******TEST METHODS******/

function listDeployments_test() { 
  console.log(JSON.stringify(listDeployments()));
}

function getDeployment_test() { 
  console.log(JSON.stringify(getDeployment(listDeployments().deployments[0].deploymentId)));
}

function getLastDeployment_test() { 
  console.log(JSON.stringify(getLastDeployment()));
}

function createDeployment_test() { 
  console.log(JSON.stringify(createDeployment("1", "appsscript", "api-based deployment")));
}

function createDeploymentAndNewVersion_test() {
  console.log(JSON.stringify(createDeploymentAndNewVersion("appsscript", "look, a new deployment!")));
}

function deleteDeployment_test() {
  console.log(JSON.stringify(deleteDeployment("AKfycbxKdMvqgvcHnDPooHz1R4aVF7PE7XbZOZU5R2fgSzfX4Afh5NH0GC32_8VaZthVmC22")));
}
