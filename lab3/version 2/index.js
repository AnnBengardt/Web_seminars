const express = require('express');
const axios = require("axios");
const app = express();
const port = 3000;
const server = require("http").createServer(app);

app.get('/', (req, resp)=>{
    resp.sendFile("C:/Users/-/Downloads/currencies/frontcurrenciespi192/index.html")
});

app.get('/get/:val', (req, resp) => {

    let options = {
        method: 'GET',
        uri: "https://www.cbr-xml-daily.ru/daily_json.js",
        json: true
    };

    //console.log(req.params.val)

    let response = null;
    new Promise(async (resolve, reject) => {
                    try {
                        response = await axios("https://www.cbr-xml-daily.ru/daily_json.js");
                    } catch (err) {
                        response = null;
                        //console.log(err);
                        //reject (err);
                    }
                    if (response) {
                        let json = response.data;
                        let value = json["Valute"][req.params.val]["Value"];
                        //console.log(json);
                        //resolve(json);
                        resp.send({"value": value});
                    }
                });

});


server.listen(port, function() {
  console.log(`Listening on port ${port}`);
});