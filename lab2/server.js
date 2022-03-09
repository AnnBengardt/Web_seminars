const express = require('express');
const app = express();

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
    res.sendFile('../public/index.html')
});

app.post('/scoring', (req, res)=> {
    console.log(req.body);
    scoring = count_scoring(req.body);

    if (scoring > 1.25) {
        res.send('Кредит одобрен!');
    } else {
        res.send('В кредите отказано!');
    }

});

server.listen(port, function(){
    console.log('listening on 3000');
})