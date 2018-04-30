var express = require('express');
var app = express();
var port = process.env.PORT || 80;
var mongodb = require('mongodb');
var mongo_url = process.env.MONGO_URL || 'mongodb://localhost:27017/middleoffice';
var MongoClient = mongodb.MongoClient;

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/api/requesttypes/', function(req, res) {
    MongoClient.connect(mongo_url, function (err, db) {
        if (err) {
            console.log('Unable to connect to the MongoDB server: ', err);
        } else {
            console.log('Connected to MongoDB server');
            var myJson = JSON.stringify(db.collection('requesttypes'));
            res.contentType('application/json');
            res.status(200);
            res.json(myJson);
        }
    });
  });

app.post('/api/requesttypes/', function(req, res) {
    MongoClient.connect(mongo_url, function (err, db) {
        if (err) {
            console.log('Unable to connect to the MongoDB server: ', err);
        } else {
            console.log('Connected to MongoDB server');
            var requesttype = { code: req.params.code, vote1: req.params.vote1, url1: req.params.url1, vote2: req.params.vote2, url2: req.params.url2 };
            db.collection('requesttypes').insert(requesttype);
        }
    });  
});

app.listen(port);
console.log("App listening on port " + port);