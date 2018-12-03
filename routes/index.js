const express = require('express');
const clova = require('@line/clova-cek-sdk-nodejs');
const bodyParser = require('body-parser');
const fs = require('fs');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/clova', function(req, res, next) {
  /* LINE認証 */
  const body = req.body; // Request body string
  const signatureStr = req.getHeader("SignatureCEK");
  let publickey = String(fs.readFileSync("./routes/public-key.pem"));
  publickey = publickey
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "");
  const pubkey = new Buffer(publickey, "base64");
  const signature = crypto
      .createHmac('RSA-SHA256', pubkey)
      .update(JSON.stringify(body));
  console.log(signatureStr == signature);
  //if (req.header("x-line-signature") == signature) {
})

module.exports = router;
