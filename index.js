const express = require('express');
const config = require('./configs');
const mongoose = require('mongoose');
const fs = require('fs');
const app = express();
const server = require('http').Server(app);
const https = require('https');

var privateKey  = fs.readFileSync('fakekeys/server.key', 'utf8');
var certificate = fs.readFileSync('fakekeys/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

const httpsServer = https.Server(credentials, app);

config.settingExpress(app);

app.use('/',express.static('./client'));
console.log(__dirname);

const routes = require('./routes')(app);

mongoose.connect(config.mongoUrl, {server: {reconnectTries: Number.MAX_VALUE}});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Mongodb connected at localhost/music')
});

const port = config.port;
const httpsPort = config.httpsPort;

server.listen(port, () => {
    console.log(`Server is running at localhost:${port}`);
});

// httpsServer.listen(httpsPort, () => {
//     console.log(`Https server is running at localhost:${httpsPort}`);
// });


