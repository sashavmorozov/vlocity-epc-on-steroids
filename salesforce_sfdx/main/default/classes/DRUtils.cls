global with sharing class DRUtils implements Callable {
        
    public Object call(String action, Map<String, Object> args) {

        Map<String, Object> input = (Map<String, Object>)args.get('input');
        Map<String, Object> output = (Map<String, Object>)args.get('output');
        Map<String, Object> options = (Map<String, Object>)args.get('options');

        return invokeMethod(action, input, output, options);
    }

    global Boolean invokeMethod(String methodName, Map<String, Object> inputMap, Map<String, Object> outputMap, Map<String, Object> optionsMap) {
        Boolean result = true;

        System.debug(LoggingLevel.ERROR, 'OtterTools > DRUtils > invokeMethod: methodName: ' + methodName);
        System.debug(LoggingLevel.ERROR, 'OtterTools > DRUtils > invokeMethod: inputMap: ' + inputMap);

        if (methodName.equals('invokeDataRaptorByName')) {
           DRUtils.invokeDataRaptorByName(inputMap, outputMap, optionsMap);
        } else {
          result = false;
        }

        return result;
    }


    public static void invokeDataRaptorByName (Map<String, Object> inputMap, Map<String, Object> outputMap, Map<String, Object> optionsMap) {
        
        final String DATARAPTOR_KEY = 'dataRaptorName';
        final String PARENT_PRODUCT_CODE_KEY = 'parentProductCode';
        
        String dataRaptorName = (String) inputMap.get(DATARAPTOR_KEY);
        String parentProductCode = (String) inputMap.get(PARENT_PRODUCT_CODE_KEY);
        
        System.debug(LoggingLevel.INFO, 'OtterTools > DRUtils > invokeDataRaptorByName: input value ' + 
            '(' + DATARAPTOR_KEY + 
            '): ' + dataRaptorName);

        vlocity_cmt.DRProcessResult result = vlocity_cmt.DRGlobal.process(inputMap, dataRaptorName);
        
        
        //System.debug('***' + JSON.serialize(resultMap));
        Map<String, Object> resultMap = result.convertToMap();
        outputMap.put('Result', resultMap);

        Map<String, Object> errors = (Map<String, Object>)resultMap.get('errors');
        outputMap.put('Errors', errors);
 
        if (resultMap.get('hasErrors') == false) {
            outputMap.put('Status', 'Success');
            outputMap.put('Message', 'The dataraptor was invoked successfully, no errors observed');
        } else {
            outputMap.put('Status', 'Failed');
            outputMap.put('Message', 'Some errors observed while executing the dataraptor. Please check the errors-node in the response for more details');
        }
    }
}