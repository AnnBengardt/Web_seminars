const express = require('express');
const axios = require('axios');
const path = require('path');
const MongoClient = require('mongodb').MongoClient

const app = express()
const port = 3000;
const server = require('http').createServer(app)

app.use(
    express.urlencoded({
        extended: true
    }),
);

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname) + '/frontcurrenciespi192/index.html')
})

app.get('/get/:val', (req, res) => {

    const mondgo_url = 'mongodb://localhost:3001'
    const clientMongo = new MongoClient(mondgo_url)

    clientMongo.connect(function(err, client) {
        if (err) console.log(err);

        const db = client.db('currencies')
        const collection = db.collection('info');
        let current_date = new Date().toISOString().slice(0, 10)

        collection.find({ Date: { $regex: `^${current_date}` } }).toArray(function(err, result) {
            if (err) console.log(err);
            client.close();
            let val = req.params.val
            if (result.length == 0) {
                let options = {
                    method: 'get',
                    uri: 'https://www.cbr-xml-daily.ru/daily_json.js',
                    json: true
                }
                let response = null;
                new Promise(async(resolve, reject) => {
                    try {
                        response = await axios("https://www.cbr-xml-daily.ru/daily_json.js")
                    } catch (er) {
                        response = null;
                        reject(er);
                    }
                    if (response) {
                        let json = response.data;

                        const mondgo_url = 'mongodb://localhost:3001'
                        const clientMongo = new MongoClient(mondgo_url)

                        clientMongo.connect(function(err, client) {
                            if (err) console.log(err);

                            const db = client.db('currencies')
                            const collection = db.collection('info');
                            collection.insertOne(json, function(err, result) {
                                if (err) console.log(err);
                                client.close()
                            })
                        })

                        let value = json['Valute'][val]['Value']
                        res.send({ 'value': value + " (не из БД)"});
                    }
                })
            } else {
                let json = result[0]
                let value = json['Valute'][val]['Value']
                res.send({ 'value': value + " (из БД)"});
            }
        })
    });
});

server.listen(port, function() {
    console.log(`Listening on port ${port}`)
});