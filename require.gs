/* Still in development, don't try anything with this yet */

(function() {
  // ---- Private Helper Functions ----
  const getKey = key => PropertiesService.getScriptProperties().getProperty(key);
  const setKey = (key, val) => PropertiesService.getScriptProperties().setProperty(key, val);
  const fetch = url => UrlFetchApp.fetch(url).getContentText();
  
  var dir = "dir"; // Placeholder, replace with actual directory object when available

  function getDir() {
    return dir;
  }

  function extractFunctionsFromString(codeString) {
    var functionRegex = /function\\s+(\\w+)\\s*\\(([^)]*)\\)\\s*\\{([\\s\\S]*?)\\}/g;
    var functionsObject = {};
    var match;
    while ((match = functionRegex.exec(codeString)) !== null) {
      var name = match[1];
      var params = match[2].trim();
      var body = match[3].trim();
      functionsObject[name] = { params: params, body: body };
    }
    return functionsObject;
  }

  function functionsObjectToJSON(functionsObject) {
    return JSON.stringify(functionsObject);
  }

  function functionsFromJSON(jsonString) {
    var parsed = JSON.parse(jsonString);
    var executableFunctions = {};
    for (var name in parsed) {
      var params = parsed[name].params;
      var body = parsed[name].body;
      executableFunctions[name] = new Function(params, body);
    }
    return executableFunctions;
  }

  function extractRequirementsFromString(code) {
    const configBlock = code.match(/\\/\\*\\s*@GSPM-Config([\\s\\S]*?)\\*\\//);
    if (!configBlock) return [];
    const reqSection = configBlock[1].match(/REQ:([\\s\\S]*?)(?:\\n[A-Z]+:|$)/);
    if (!reqSection) return [];
    return reqSection[1]
      .split('\\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-'))
      .map(line => line.replace(/^-\s*/, ''));
  }

  function extractNameFromString(code) {
    const configBlock = code.match(/\\/\\*\\s*@GSPM-Config([\\s\\S]*?)\\*\\//);
    if (!configBlock) return null;
    const nameMatch = configBlock[1].match(/NAME:\\s*(.+)/);
    return nameMatch ? nameMatch[1].trim() : null;
  }

  // ---- Public Functions ----
  function importPkg(pkgs, direct) {
    if (!(Array.isArray(pkgs) || typeof pkgs === "string")) 
      throw new Error("Illegal import method, must be array or string");  

    if (typeof pkgs === "string") {
      let release, url, text, name;

      if (pkgs.includes("@") && !direct) {
        release = pkgs.split("@")[1];
        pkgs = pkgs.split("@")[0];
      } else if (!direct) {
        release = getDir()[pkgs].newest;
        url = getDir()[pkgs].releases[release];
      } else url = pkgs;

      var result = fetch(url); // gets functions

      if (direct) {
        text = result;
        name = extractNameFromString(result);
      }

      result = extractFunctionsFromString(result); // extracts functions
      result = functionsObjectToJSON(result); // sets to json

      if (direct && name != null && !getKey(name)) setKey(name, result); // stores
      else if (!getKey(pkgs) && name == null) setKey(pkgs, result); // stores
      else {
        if (name == null) Logger.log("Package already installed -- " + pkgs);
        else Logger.log("Package already installed -- " + name);
        return 0;
      }

      if (!direct && getDir()[pkgs].requirements) {
        getDir()[pkgs].requirements.forEach(function(req) {
          importPkg(req);
        });
      } else {
        const requirements = extractRequirementsFromString(text);
        requirements.forEach(function(req) {
          if (req.includes("https://") || req.includes("http://"))
            importPkg(req, true);
          else importPkg(req);
        });
      }

      if (name != null) Logger.log("Package imported: " + name);
      else Logger.log("Package imported: " + pkgs);

    } else pkgs.forEach(function(pkg) {
      if (pkg.includes("https://") || pkg.includes("http://"))
        importPkg(pkg, true);
      else importPkg(pkg);
    });
  }

  function uninstall(pkgs) {
    pkgs.forEach(function(pkg) {
      if (getKey(pkg) != null) PropertiesService.getScriptProperties().deleteProperty(pkg);
      else throw new Error(\`Package not found -- \${pkg}\`);
      Logger.log("Package uninstalled -- " + pkg);
    });
  }

  function requirePkg(pkg) {
    if (getKey(pkg) != null) {
      var package = getKey(pkg);
      return functionsFromJSON(package);
    } else throw new Error("PACKAGE NOT INSTALLED: " + pkg);
  }

  // ---- Expose Only Public Methods ----
  return {
    importPkg: importPkg,
    requirePkg: requirePkg,
    uninstall: uninstall
  };
})()
