/**
 * Function template
 * @param {enum} exportScope - kek
 * @return {string} URL of the deployed web application
 *
 * @example
 *
 *     getRedirectUri();
 */

function functionTemplate() {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);
    console.time(arguments.callee.name);

    console.timeEnd(arguments.callee.name);
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return 1;
}
