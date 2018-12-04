let express = require('express');
let router = express.Router();
let fs = require("fs");
const crypto = require("crypto");
let ikajson = require("./ikaaccess.js");

const applicationId = "amzn1.ask.skill.bcb931ed-be73-4a8a-9476-dcaccb30bee8";

/* signature check */
function signature_check(jsonBody) {
  const appId_check = jsonBody.session.application.applicationId == applicationId;
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
      let msg = "こんにちは、スプラステージです。今のガチマッチを教えて。のように話しかけてください。";
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
  let msg;
  switch(jsonBody.request.intent.name) {
    case "AskNow_Buttle":
      returnJson = asknow(jsonBody);
      break;
    case "AMAZON.HelpIntent":
      msg = "今のガチマッチを教えて。のように話しかけてください。";
      returnJson = Build_response(msg, false);
      break;
    case "AMAZON.CancelIntent":
      msg = "終了します。またのご利用お待ちしています。";
      returnJson = Build_response(msg, true);
      break;
    case "AMAZON.StopIntent":
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
        "type": "PlainText",
        "text": msg,
      },
      "shouldEndSession": shouldEndSession
    }
  }
  return tmp;
}

async function asknow(jsonBody) {
  if (!jsonBody.request.intent.slots.rule.value) {
    let msg = "ごめんなさい、バトルタイプを読み取れませんでした。もう一度お願いします。";
    return Build_response(msg, false);
  }
  const BType = jsonBody.request.intent.slots.rule.resolutions.resolutionsPerAuthority[0].values[0].value.name;
  let msg = await ikajson.getNow(BType);
  //console.log(msg);
  return Build_response(msg, true);
}


/* main */
router.post('/', async function(req, res, next) {
  const body = req.body;
  //const signature = req.headers.signaturecek || req.headers.SignatureCEK;
  if (!signature_check(body)) {
    res.status(403);
    res.send({"message": "認証エラーです"});
  }
  data = await start_session(body);
  res.send(data);
});

module.exports = router;
