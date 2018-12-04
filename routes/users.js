var express = require('express');
var router = express.Router();
const clova = require('@line/clova-cek-sdk-nodejs');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', function(req, res, next) {
  const clovaMiddleware = clova.Middleware({ applicationId: "com.sun-yryr.api.ikastage" });
  console.log(clovaMiddleware);
  res,send("ok");
});

module.exports = router;
