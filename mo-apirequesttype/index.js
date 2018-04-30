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
            var requesttype = { code: req.body.code, vote1: req.body.vote1, url1: req.body.url1, vote2: req.body.vote2, url2: req.body.url2 };
            db.collection('requesttypes').insertOne(requesttype, function(error, result) {
                if (error) {
                    console.log('Error in inserting request type into MongoDB collection: ', error);
                } else {
                    db.close();
                    console.log('A request type has been inserted');
                    res.status(203);
                    res.end();
                }
            });
        }
    });  
});

app.listen(port);
console.log("App listening on port " + port);