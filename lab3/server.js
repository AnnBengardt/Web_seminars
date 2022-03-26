const express = require('express');
const app = express();

const MongoClient = require("mongodb").MongoClient;

const port = 3000;
var server = require('http').createServer(app);

const fetch = require('node-fetch');//npm install node-fetch@2.6.1
const request = require('request'); //http-reqs to external services
const rp = require('request-promise');
const cheerio = require('cheerio');

app.use(
    express.urlencoded({
        extended:true
    })
);

app.use(express.static('public'));


app.get('/currency', function(req, res) {
    res.sendFile('C:/Users/-/Documents/Универ/web/6 семестр/lab3/public/index.html')
});

app.get('/style.css', function(req, res) {
    res.sendFile('C:/Users/-/Documents/Универ/web/6 семестр/lab3/public/css/style.css')
});


app.post('/currency', (req, resp)=> {
    const db_link = "mongodb://localhost:3001/";
    const client = new MongoClient(db_link);

    const url = "https://www.cbr-xml-daily.ru/daily_json.js";

    let curr = req.body.currency;
    let data = "";
    let val = 0;
    let today = new Date().toISOString().slice(0, 10);

    client.connect(function (err, client) {
        const db = client.db('currencies');
        const collection = db.collection('info');
        cursor = collection.findOne({ 'name': curr, 'date': today }, (err, result) => {
            if (err) {
                res.send('error');
                return console.log(err);
            }
            if (!result) {
                fetch(url, {
                    method: 'GET'
                })
                    .then(result => result.json())
                    .then((output) => {
                        data = output;
                        resp.send(`
                            <head>
                                <meta charset="UTF-8">
                                <title>${curr}</title>
                                <link rel="stylesheet" href="style.css">
                            </head>
                            <body>
                            <h1>Курс валюты ${curr} с сайта</h1>
                            <br>
                            <h3>Дата: ${data["Date"].split("T")[0]}</h3>
                            <h2>${data["Valute"][curr]["Value"]}</h2>
                            </body>`);

                        client.connect(function(err, client){
                            const db = client.db('currencies');
                            const collection = db.collection("info");
                            let curr_info = JSON.parse(`{"name": "${curr}", "date": "${data["Date"].split("T")[0]}", "value": ${data["Valute"][curr]["Value"]}}`);
                            collection.insertOne(curr_info, function(err,result) {
                                if (err) {
                                    return console.log(err);
                                }
                                console.log(result);
                                client.close();
                            });
                        });
                    }).catch(err => console.error(err));
            } else {
                val = result.value;
                resp.send(`
                            <head>
                                <meta charset="UTF-8">
                                <title>${curr}</title>
                                <link rel="stylesheet" href="style.css">
                            </head>
                            <body>
                            <h1>Курс валюты ${curr} из MongoDB</h1>
                            <br>
                            <h3>Дата: ${today}</h3>
                            <h2>${val}</h2>
                            </body>`);
            }
        }); });

});

server.listen(port, function(){
    console.log('listening on 3000');
})