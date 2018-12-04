let express = require('express');
let router = express.Router();
const clova = require('@line/clova-cek-sdk-nodejs');
let fs = require("fs");
const crypto = require("crypto");

/* read file & static */
const cert = fs.readFileSync("./routes/signature-public-key.pem", "utf8");
const applicationId = "com.sun-yryr.api.ikastage";

/* signature check */
function signature_check(jsonBody, headerSignature) {
  let verifer = crypto.createVerify("RSA-SHA256");
  verifer.update(JSON.stringify(jsonBody), "utf8");
  //console.log("header", headerSignature);
  //console.log("cert", cert);
  const signature = verifer.verify(cert, headerSignature, "base64");
  if (!signature) return false;
  //console.log(signature); trueで認証成功
  const appId_check = jsonBody.context.System.application.applicationId == applicationId;
  if (!appId_check) return false;
  //console.log(appId_check);
  return true;
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', function(req, res, next) {
  const body = req.body;
  const signature = req.headers.signaturecek || req.headers.SignatureCEK;
  if (!signature_check(body, signature)) {
    res.send(no);
  }
  res.send("ok");
});

module.exports = router;
