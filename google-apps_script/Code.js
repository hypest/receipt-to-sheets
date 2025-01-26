/**
 * Project: Bar/QR Code Scanner Web App
 * Developed By: bpwebs.com
 *
 * This web app uses the html5-qrcode library from GitHub: https://github.com/mebjas/html5-qrcode.
 * The html5-qrcode library is used to scan QR codes from the user's webcam.
 */

//Constants
const DATASHEET = "Data";

function doGet() {
  let template = HtmlService.createTemplateFromFile("Index");
  let html = template.evaluate().setTitle("QR Code Scanner");

  html.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  // html.addMetaTag("viewport", "width=device-width, initial-scale=1");

  return html;
}

function qrcodeFound(qrcode) {
  const ss = SpreadsheetApp.getActive();
  const dataSheet = ss.getSheetByName(DATASHEET);

  // Fetch the page content from the URL
  const response = UrlFetchApp.fetch(qrcode);
  var docId = Drive.Files.create(
    { title: "temporalDocument", mimeType: MimeType.GOOGLE_DOCS },
    response.getBlob()
  ).id;
  var tables = DocumentApp.openById(docId).getBody().getTables();
  var res = tables.map(function (table) {
    var values = [];
    for (var row = 0; row < table.getNumRows(); row++) {
      var temp = [];
      var cols = table.getRow(row);
      for (var col = 0; col < cols.getNumCells(); col++) {
        temp.push(cols.getCell(col).getText());
      }
      values.push(temp);
    }
    return values;
  });
  Drive.Files.remove(docId);
  console.log(res);

  // const htmlContent = response.getContentText();

  // // Parse the HTML content to extract the table data
  // const document = XmlService.parse(htmlContent);
  // const table = document.getRootElement().getChild("body").getChild("table");
  // const headers = table
  //   .getChild("thead")
  //   .getChildren("th")
  //   .map((th) => th.getText().trim());
  // const rows = table
  //   .getChild("tbody")
  //   .getChildren("tr")
  //   .map((tr) => {
  //     const cells = tr.getChildren("td");
  //     const rowObject = {};
  //     cells.forEach((cell, index) => {
  //       rowObject[headers[index]] = cell.getText().trim();
  //     });
  //     return rowObject;
  //   });

  // // Log the rows to the console (for debugging purposes)
  // console.log(rows);

  // rows.forEach((row) => {
  //   const rowData = headers.map((header) => row[header]);
  //   dataSheet.appendRow(rowData);
  // });

  // // Extract and log the bottom left data
  // const bottomLeftData = document
  //   .getRootElement()
  //   .getChild("body")
  //   .getChild("div")
  //   .getText()
  //   .trim();
  // // console.log(bottomLeftData);
}

/**
 * INCLUDE HTML PARTS, EG. JAVASCRIPT, CSS, OTHER HTML FILES
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
