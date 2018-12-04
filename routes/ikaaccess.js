var request = require('request');

function ikajson(body, num) {
    const tmp = {
        "rule": body.result[num].rule_ex.name,
        "stage": [
            {
                "name": body.result[num].maps_ex[num].name,
                "image": body.result[num].maps_ex[num].image
            },
            {
                "name": body.result[num].maps_ex[1].name,
                "image": body.result[num].maps_ex[1].image
            }
        ],
        "end_t": body.result[0].end_t
    }
    return tmp;
}

exports.getNow = function(ButtleType) {
    return new Promise(function(resolve, reject) {
        buttle = {"ガチマッチ": "gachi", "レギュラーマッチ": "regular", "リーグマッチ": "league"};
        let url = "https://spla2.yuu26.com/{p1}/{p2}"
            .replace("{p1}", buttle[ButtleType])
            .replace("{p2}", "schedule");
        let date = new Date();
        let now_unix = Math.round( date.getTime() / 1000 );
        const option = {url: url, encoding: "utf8"};
        request.get(option, function(error, res, body) {
            const first = ikajson(JSON.parse(body), 0);
            let msg = "ただいまのルールは" +first.rule+ "。";
            msg += "ステージは" +first.stage[0].name+ "と" +first.stage[1].name+ "です。";
            if (first.end_t - now_unix < 1800) {
                const second = ikajson(body, 1);
                msg += "次のルールは" +second.rule+ "。";
                msg += "ステージは" +second.stage[0].name+ "と" +second.stage[1].name+ "です。";
            }
	    msg += "次のステージまで、残り" +parseInt((first.end_t - now_unix)/60)+ "分です。";
            resolve(msg);
        });
    });
}
