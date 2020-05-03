global with sharing class VlocityMaintenanceJobsUtils implements vlocity_cmt.VlocityOpenInterface {
    public VlocityMaintenanceJobsUtils() {

    }

    global Boolean invokeMethod(String methodName, Map<String, Object> inputMap, Map<String, Object> outputMap, Map<String, Object> optionsMap) {
        Boolean result = true;

        System.debug(LoggingLevel.DEBUG, 'VlocityMaintenanceJobsUtils > invokeMethod > methodName: ' + methodName);
        System.debug(LoggingLevel.DEBUG, 'VlocityMaintenanceJobsUtils > invokeMethod > inputMap: ' + inputMap);
        System.debug(LoggingLevel.DEBUG, 'VlocityMaintenanceJobsUtils > invokeMethod > outputMap: ' + outputMap);
        System.debug(LoggingLevel.DEBUG, 'VlocityMaintenanceJobsUtils > invokeMethod > optionsMap: ' + optionsMap);

        switch on methodName {
            when 'invokeTelcoAdminConsoleController' {
                invokeTelcoAdminConsoleController(inputMap, outputMap, optionsMap);
            }
            when else {
                
            }
        }

        return result;
    }

    global void invokeTelcoAdminConsoleController(Map<String, Object> inputMap, Map<String, Object> outputMap, Map<String, Object> optionsMap) {
        vlocity_cmt.TelcoAdminConsoleController adminCntrlr = new vlocity_cmt.TelcoAdminConsoleController();
        adminCntrlr.setParameters(JSON.serialize(inputMap));
        adminCntrlr.invokeMethod();
    }

}