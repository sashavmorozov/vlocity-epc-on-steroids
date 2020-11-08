function functionA (param1) {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);
    console.time(arguments.callee.name);

    console.log("This is a message from " + arguments.callee.name);
    console.log("Funtion params: " + param1);

    console.timeEnd(arguments.callee.name);
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return;
}