function test_functionA (param1) {
    console.log("*** METHOD_ENTRY: " + arguments.callee.name);
    console.time(arguments.callee.name);

    var param1 = "hello world";
    functionA(param1);

    console.timeEnd(arguments.callee.name);
    console.log("*** METHOD_EXIT: " + arguments.callee.name);
    return;
}