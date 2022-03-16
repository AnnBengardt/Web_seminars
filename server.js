const express = require('express');
const app = express();

const MongoClient = require("mongodb").MongoClient;

const port = 3000;
var server = require('http').createServer(app);

app.use(
    express.urlencoded({
        extended:true
    })
);

app.use(express.static('public'));


function count_scoring(data) {
    let score = 0;

    if (data.gender == "female") {
        score += 0.40;
    }

    if (data.lifeperiod > 10){
        score += 0.42;
    } else {
        score += data.lifeperiod *0.042;
    }

    let current = new Date();
    let birth = new Date(data.birthdate);
    let age = Math.trunc((current.getTime() - birth) / (24 * 3600 * 365.25 * 1000));

    if ((age - 20) * 0.1 <= 0.3) {
        score += (age - 20) * 0.1;
    } else {
        score += 0.3
    }

    if ("manager_teacher_developer".includes(data.profession)) {
        score += 0.55;
    } else if ("policeman_driver_pilot".includes(data.profession)) {
        score += 0;
    } else {
        score += 0.16;
    }


    if (data.sphere = "public") {
        score += 0.21;
    }

    score += data.workperiod * 0.059;

    if (data.bankAcc) {
        score += 0.45;
    }
    if (data.realestate) {
        score += 0.35;
    }
    if (data.insurance) {
        score += 0.19;
    }

    console.log("Scoring: ", score);
    return score;

};


app.get('/scoring', function(req, res) {
    res.sendFile('C:/Users/-/Documents/Универ/web/6 семестр/lab2/public/index.html')
});

app.get('/style.css', function(req, res) {
    res.sendFile('C:/Users/-/Documents/Универ/web/6 семестр/lab2/public/css/style.css')
});


app.post('/scoring', (req, res)=> {
    console.log(req.body);
    scoring = count_scoring(req.body);

    const url = "mongodb://localhost:3001/";
    const client = new MongoClient(url);
    client.connect(function(err, client){
       const db = client.db('clients');
       const collection = db.collection("info");
       let client_info = req.body;
       collection.insertOne(client_info, function(err,result) {
           if (err) {
               return console.log(err);
           }
           console.log(result);
           console.log(client_info);
           client.close();
       });
    });

    if (scoring > 1.25) {
        res.send('Кредит одобрен!');
    } else {
        res.send('В кредите отказано!');
    }

});

server.listen(port, function(){
    console.log('listening on 3000');
})



app.post('/search', function(req, res) {

    const url = "mongodb://localhost:3001/";
    const client = new MongoClient(url);

    let clientEmail = req.body.email;
    let clientInfo = "";

    client.connect(function(err, client) {
        const db = client.db('clients');
        const collection = db.collection('info');

        collection.findOne({ "email": clientEmail }, { _id: 0 }, function(err, result) {
            if (err) throw err;
            clientInfo = result;
            const lst = [];
            if (clientInfo.bankAcc == "on") {
                lst.push("Bank account");
            }
            if (clientInfo.realestate == "on") {
                lst.push("Real estate");
            }
            if (clientInfo.insurance == "on") {
                lst.push("Insurance");
            }
            res.send(`
            <head>
                <meta charset="UTF-8">
                <title>Поиск</title>
                <link rel="stylesheet" href="style.css">
            </head>
            <body>
            <form  action="http://localhost:3000/scoring" method="GET">
                <h2>Результат поиска:</h2>  <br>
                <label for="name">Имя и Фамилия </label>
                <input type="text" id="name" name="name" value=${clientInfo.name}> <br>
                <label for="phone">Номер телефона  </label>
                <input type="text" id="phone" name="phone" value=${clientInfo.phone}> <br>
                <label for="email">Электронная почта  </label>
                <input type="text" id="email" name="email" value=${clientInfo.email}> <br>
                <label for="birthdate">Дата рождения  </label>
                <input type="text" id="birthdate" name="birthdate" value=${clientInfo.birthdate}> <br>
                <label for="gender">Пол </label>
                <input type="text" id="gender" name="gender" value=${clientInfo.gender}> <br>
                <label for="lifeperiod">Период проживания в регионе  </label>
                <input type="text" id="lifeperiod" name="lifeperiod" value=${clientInfo.lifeperiod}> <br>
                <label for="profession">Профессия  </label>
                <input type="text" id="profession" name="profession" value=${clientInfo.profession}> <br>
                <label for="sphere">Сфера  </label>
                <input type="text" id="sphere" name="sphere" value=${clientInfo.sphere}> <br>
                <label for="workperiod">Период работы  </label>
                <input type="text" id="workperiod" name="workperiod" value=${clientInfo.workperiod}> <br>
                <label for="additional">Дополнительные параметры:  </label> <br>
                <textarea style="width:150px; height:100px; resize: none;">${lst}</textarea> <br> <br>
                <input type="submit" value="Назад">
            </form>
            </body>`)
            client.close();
        })
    });

})