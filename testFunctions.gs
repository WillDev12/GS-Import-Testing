function myFunction() {

  Logger.log("Hello world!");

  function2();

}

function function2() {

  Logger.log("From second function");

  return "message";

}

function function3() {

  Logger.log(function2());

}
