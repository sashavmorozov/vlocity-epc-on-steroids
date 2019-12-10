function SheetName() {
    var key = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
    return key;
}

function Underscore(str) {
    var regex = /(-|\.|\(|\)| )/gi;
    var key = str.replace(regex, '_');

    regex = /_{2,}/gi;
    key = key.replace(regex, '_');

    regex = /_$/gi;
    key = key.replace(regex, '');

    return key;
}