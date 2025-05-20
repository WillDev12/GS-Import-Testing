function myFunction(funcs) {

  Logger.log("Hello world!");

  funcs.function2();

}

function function2() {

  Logger.log("From second function");

  return "message";

}

function function3(funcs) {

  Logger.log(funcs.function2());

}
