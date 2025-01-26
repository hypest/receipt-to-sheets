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
  html.addMetaTag("viewport", "width=device-width, initial-scale=1");

  return html;
}

function qrcodeFound(qrcode) {
  const ss = SpreadsheetApp.getActive();
  const dataSheet = ss.getSheetByName(DATASHEET);

  dataSheet.appendRow([new Date().toLocaleString(), qrcode]);
}

/**
 * INCLUDE HTML PARTS, EG. JAVASCRIPT, CSS, OTHER HTML FILES
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
