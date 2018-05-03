var express = require("express");
var bodyParser = require("body-parser");
var sign = require('./routes/sign');

var app = express();

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));

app.use('/sign', sign);

app.listen(3333, function() {
    console.log("Waiting to connect...")
})