/* @GSPM-Config
REQ:
- https://raw.githubusercontent.com/WillDev12/GS-Import-Testing/refs/heads/main/requirements/req2.gs
NAME: Test App
*/

function mapArray(array, require) {
  var mapper = require("https://raw.githubusercontent.com/WillDev12/GS-Import-Testing/refs/heads/main/requirements/req2.gs");
  return mapper.function1(array);
}
