/**
 * Process-function to orchestrate steps and track process progress
 * Process-function calls process-step-functions
 * Add input parameters if required
 * @param 
 * @return
 *
 * @example
 *     process_menuItemTextInCamelCase(param1, param2);
 */

function process_menuItemTextInCamelCase(param1, param2) {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);
    console.time(arguments.callee.name);

    /* Before loading */
    processStep_resetProcess();
    processStep_showProgressDialog();

    processStep_functionA(param1);    
    //processStep_functionB(param2);    
    //processStep_functionC(param1, param2);    

    /* After loading */
    processStep_completeProcess();

    console.timeEnd(arguments.callee.name);
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return;
}

/**
 * Process-step-function used to invoke particular business logic
 * Process-step-function updates overall progress progress, status and step details
 * Add input parameters if required
 * @param 
 * @return
 *
 * @example
 *     processStep_functionA(param1);
 */

function processStep_functionA (param1) {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);
    console.time(arguments.callee.name);

    var processProgress = 20;
    var processStatus = "";
    var processStep = "Sample process step";
    var processDetails = "Sample process details";
    
    setBackendProcessInfoProcessProgress(processProgress);
    setAggregatedLoadingProcessStatus(processStatus);
    setBackendProcessInfoProcessStep(processStep);
    setBackendProcessInfoProcessDetails(processDetails);
    
    //Add a call to business logic here
    functionA(param1);

    console.timeEnd(arguments.callee.name);
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return;
}