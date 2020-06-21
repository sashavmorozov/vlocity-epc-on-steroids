global with sharing class EPConSteroidsUtils implements vlocity_cmt.VlocityOpenInterface {

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

    public static String generateGuid(){
        Blob b = Crypto.GenerateAESKey(128);
        String h = EncodingUtil.ConvertTohex(b);
        String guid = h.SubString(0,8)+ '-' + h.SubString(8,12) + '-' + h.SubString(12,16) + '-' + h.SubString(16,20) + '-' + h.substring(20);
        return guid;
    }

}