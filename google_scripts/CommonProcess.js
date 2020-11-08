/**
 * Process-step-function to reset overall process progress
 * @param 
 * @return
 *
 * @example
 *     processStep_resetProcess();
 */

function processStep_resetProcess () {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);
    console.time(arguments.callee.name);
    
    deleteUserProperties();

    var processProgress = 0;
    var processStatus = "";
    var processStep = "Just started";
    var processDetails = "Preparing the process, resetting progress";
    
    setBackendProcessInfoProcessProgress(processProgress);
    setAggregatedLoadingProcessStatus(processStatus);
    setBackendProcessInfoProcessStep(processStep);
    setBackendProcessInfoProcessDetails(processDetails);

    console.timeEnd(arguments.callee.name);
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return;
}

/**
 * Process-step-function to show the progress dialog. Used for operations taking long time to complete
 * @param 
 * @return
 *
 * @example
 *     processStep_showProgressDialog();
 */

function processStep_showProgressDialog () {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);
    console.time(arguments.callee.name);

    showProgressDialog();

    console.timeEnd(arguments.callee.name);
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return;
}

/**
 * Process-step-function to complete overall process progress
 * @param 
 * @return
 *
 * @example
 *     processStep_completeProcess();
 */

function processStep_completeProcess () {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);
    console.time(arguments.callee.name);

    var processProgress = 100;
    var processStatus = "SUCCESS";
    var processStep = "Just finished";
    var processDetails = "We just finished the processing";
    
    setBackendProcessInfoProcessProgress(processProgress);
    setAggregatedLoadingProcessStatus(processStatus);
    setBackendProcessInfoProcessStep(processStep);
    setBackendProcessInfoProcessDetails(processDetails);

    console.timeEnd(arguments.callee.name);
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return;
}