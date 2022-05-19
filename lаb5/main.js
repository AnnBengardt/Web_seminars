const path = require('path');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const nodemailer = require("nodemailer");

const port = 5000;

io.on("connection", function(socket){
    console.log("Клиент подключен");
    socket.emit('message', 'Связь настроена!');
    socket.on("eventClient", function(msg){
        let data = msg;
        console.log("Сообщение от клиента: "+data.message);
        console.log("Получатель: "+data.receipient);

        /*var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: config
        })

        var result = transporter.sendMail({
            from: config.mail,
            to: data.receipient,
            subject: "Test",
            text: data.message,
            html: data.message
        });*/
    });
});


pathFile = path.resolve("index.html");

app.get('/', (req, res)=>{
    res.sendFile(pathFile);
});


http.listen(port, function(){
    console.log("Порт: " + port);
});


