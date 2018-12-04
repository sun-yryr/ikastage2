let express = require('express');
let router = express.Router();
const clova = require('@line/clova-cek-sdk-nodejs');
let fs = require("fs");
const crypto = require("crypto");
let ikajson = require("./ikaaccess.js");

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

/* start */
function start_session(jsonBody) {
  return new Promise(function(resolve, reject) {
    resolve(request_check(jsonBody));
  });
}

function request_check(jsonBody) {
  let returnJson;
  switch(jsonBody.request.type) {
    case "LaunchRequest":
      let msg = "こんにちは、イカステージです。今のガチマッチを教えて。のように話しかけてください。";
      returnJson = Build_response(msg, false);
      break;
    case "IntentRequest":
      returnJson = intent_check(jsonBody);
      break;
    case "SessionEndedRequest":
      break;
  }
  return returnJson;
}

function intent_check(jsonBody) {
  let returnJson;
  switch(jsonBody.request.intent.name) {
    case "AskNow_Buttle":
      returnJson = asknow(jsonBody);
      break;
    case "Clova.GuideIntent":
      break;
    case "Clova.CancelIntent":
      break;
    case "Clova.YesIntent":
      let msg = "テスト";
      returnJson = Build_response(msg, false);
      break;
    case "Clova.NoIntent":
      break;
  }
  return returnJson;
}

/* Build response */
function Build_response(msg, shouldEndSession) {
  let tmp = {
    "version": "1.0",
    "sessionAttributes": {},
    "response": {
      "outputSpeech": {
        "type": "SimpleSpeech",
        "values": {
            "type": "PlainText",
            "lang": "ja",
            "value": msg
        }
      },
      "card": {},
      "directives": [],
      "shouldEndSession": shouldEndSession
    }
  }
  return tmp;
}

async function asknow(jsonBody) {
  if (!jsonBody.request.intent.slots) {
    let msg = "ごめんなさい、バトルタイプを読み取れませんでした。もう一度お願いします。";
    return Build_response(msg, false);
  }
  const BType = jsonBody.request.intent.slots.ButtleType.value;
  let msg = await ikajson.getNow(BType);
  console.log(msg);
  return Build_response(msg, true);
}


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* main */
router.post('/', async function(req, res, next) {
  const body = req.body;
  const signature = req.headers.signaturecek || req.headers.SignatureCEK;
  if (!signature_check(body, signature)) {
    res.status(403);
    res.send({"message": "認証エラーです"});
  }
  data = await start_session(body);
  res.send(data);
});

module.exports = router;
