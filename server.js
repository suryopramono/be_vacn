'use strict';

require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var cron = require('node-cron');
const axios = require('axios');

var app = express();
var server = http.Server(app);
// var io = socket(server);
var port = process.env.PORT || 3014;
var fungsi = require('./fungsi');

const Logger = require('./lib/logger')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();

});

// if (process.env.DEBUG == 0) {
// cron.schedule('* * * * *', async ()  => {
    // axios.get('http://192.168.11.232:3010/')
    // .then(function (response) {
      // // handle success 
        // // console.log(response);
        // // fungsi.sendTelegram('data');
    // })
    // .catch(function (error) {
      // // handle error
    // //   console.log('error =================================')
    // //   console.log(error);
    // Logger.error('cron cek backend service telegram '+ error)
    // fungsi.sendTelegram('backend serrvice telegram http://192.168.11.232:3010/ \n'+error);
    // });
  // });
// }

var routes = require('./routes');
routes(app);

app.listen(port, async () => {
    Logger.info(` 🚀 Service Handling Flutter SBE Running on Port ${port}`);

});