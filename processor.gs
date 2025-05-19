function initiate() {
  UI.initiate();
  UI.msg("OPCVL Helper by WillDevv12 (@WillDev12)");
}

class UI {

  static initiate() {

    DocumentApp.getUi().createMenu("OPCVL ✍️")
    .addItem("Organizer", "launchOutliner")
    .addToUi();

  }

  static msg(val) {
    DocumentApp.getUi().alert(val);
  }

}

function launchOutliner() {
  var ui = DocumentApp.getUi();
  var html = HtmlService.createHtmlOutputFromFile("template")
    .setTitle("")
    .setWidth("600")
    .setHeight("400");

  ui.showModelessDialog(html, "OPCVL Outline");
}

function processData(data) {
  // Define the exact order you want the questions to appear in the doc
  const orderedQuestions = [
    "Who created the source?",
    "When and where was it produced?",
    "Is it primary or secondary?",
    "Author background",
    "Why was it created?",
    "Intended audience",
    "Intent",
    "Potential bias",
    "Information provided",
    "Details or arguments",
    "What's missing?",
    "Usefulness",
    "Unique insight",
    "Credibility",
    "What can be learned?",
    "Supporting evidence",
    "Reliability issues",
    "Bias or propaganda",
    "Author perspective",
    "Misrepresentation",
    "Supporting evidence"
  ];

  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  let currentSection = "";

  orderedQuestions.forEach(question => {

    const bullet = DocumentApp.GlyphType.HOLLOW_BULLET;

    if (data[question] && data[question].ans.length > 0) {

      // Double checks if header
      if (currentSection != data[question].section) {

        if (currentSection != "")
          body.appendParagraph("")
        
        // Sets header for section
        body.appendParagraph(data[question].section)
          //.setGlyphType(bullet)
          .setBold(true);

        currentSection = data[question].section;
      }

      body.appendParagraph(question)
        .setBold(false)
        //.setNestingLevel(1)
        //.setGlyphType(bullet);

      data[question].ans.forEach(response => {

        body.appendListItem(response)
          //.setNestingLevel(1)
          .setGlyphType(bullet);

      })

      //body.appendParagraph("");

    }

  });

  return "Received!";
}

initiate();
