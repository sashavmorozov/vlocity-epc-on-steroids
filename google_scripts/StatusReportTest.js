function writeStatusReportItemTest() {
    var statusReportItem = {};

    //Success
    statusReportItem["Chunk Number"] = 1;
    statusReportItem["Processing Started"] = Utilities.formatDate(
        new Date(),
        CONST_STATUS_REPORT_TIMESTAMP_ZONE,
        CONST_STATUS_REPORT_TIMESTAMP_FORMAT
      );
    statusReportItem["Processing Completed"] = Utilities.formatDate(
        new Date(),
        CONST_STATUS_REPORT_TIMESTAMP_ZONE,
        CONST_STATUS_REPORT_TIMESTAMP_FORMAT
      );
    statusReportItem["Status"] = "SUCCESS";
    statusReportItem["Details"] = "All good here";

    writeStatusReportItem(statusReportItem);

    //Warning
    statusReportItem["Chunk Number"] = 2;
    statusReportItem["Processing Started"] = Utilities.formatDate(
        new Date(),
        CONST_STATUS_REPORT_TIMESTAMP_ZONE,
        CONST_STATUS_REPORT_TIMESTAMP_FORMAT
      );
    statusReportItem["Processing Completed"] = Utilities.formatDate(
        new Date(),
        CONST_STATUS_REPORT_TIMESTAMP_ZONE,
        CONST_STATUS_REPORT_TIMESTAMP_FORMAT
      );
    statusReportItem["Status"] = "WARNING";
    statusReportItem["Details"] = "Looks good, but a little weird";

    writeStatusReportItem(statusReportItem);

    //Error
    statusReportItem["Chunk Number"] = 3;
    statusReportItem["Processing Started"] = Utilities.formatDate(
        new Date(),
        CONST_STATUS_REPORT_TIMESTAMP_ZONE,
        CONST_STATUS_REPORT_TIMESTAMP_FORMAT
      );
    statusReportItem["Processing Completed"] = Utilities.formatDate(
        new Date(),
        CONST_STATUS_REPORT_TIMESTAMP_ZONE,
        CONST_STATUS_REPORT_TIMESTAMP_FORMAT
      );
    statusReportItem["Status"] = "ERROR";
    statusReportItem["Details"] = "Not good";

    writeStatusReportItem(statusReportItem);
}


function writeStatusReportItemTestLongString() {
    var statusReportItem = {};

    //Success
    statusReportItem["Chunk Number"] = 1;
    statusReportItem["Processing Started"] = Utilities.formatDate(
        new Date(),
        CONST_STATUS_REPORT_TIMESTAMP_ZONE,
        CONST_STATUS_REPORT_TIMESTAMP_FORMAT
      );
    statusReportItem["Processing Completed"] = Utilities.formatDate(
        new Date(),
        CONST_STATUS_REPORT_TIMESTAMP_ZONE,
        CONST_STATUS_REPORT_TIMESTAMP_FORMAT
      );
    statusReportItem["Status"] = "SUCCESS";

    var details = "long_string_element";
    var iterations = 1000;
    for (var i = 0; i < iterations; i++) {
        details += details + details;
    }

    statusReportItem["Details"] = details;

    writeStatusReportItem(statusReportItem);
}