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

app.get('/api/requests', function(req, res) {
    MongoClient.connect(mongo_url, function (err, db) {
        if (err) {
            console.log('Unable to connect to the MongoDB server: ', err);
            res.status(500).end();
        } else {
            console.log('Connected to MongoDB server');
            db.collection('requests').find({}).toArray(function (error, results) {
                if (error) {
                    console.log('Unable to retrieve requests from MongoDB collection: ', error);
                    res.status(500).end();
                } else {
                    // TODO : pagination management
                    res.contentType('application/json');
                    res.status(200);
                    res.json(results);
                }
            });
        }
    });
  });

app.get('/api/requests/{id}', function(req, res) {
    MongoClient.connect(mongo_url, function (err, db) {
        if (err) {
            console.log('Unable to connect to the MongoDB server: ', err);
            res.status(500).end();
        } else {
            console.log('Connected to MongoDB server');
            db.collection('requests').findOne({ _id: req.params.id }, function (error, result) {
                if (error) {
                    console.log('Unable to retrieve request ' + req.params.id + ' from MongoDB collection: ', error);
                    res.status(500).end();
                } else {
                    res.contentType('application/json');
                    res.status(200);
                    res.json(result);
                }
            });
        }
    });
});

app.post('/api/requests', function(req, res) {
    MongoClient.connect(mongo_url, function (err, db) {
        if (err) {
            console.log('Unable to connect to the MongoDB server: ', err);
            res.status(500).end();
        } else {
            console.log('Connected to MongoDB server');
            var request = {
                type: req.type,
                summary: req.summary,
                payload: req.payload
            };
            db.collection('requests').insertOne(request, function(error, result) {
                if (error) {
                    console.log('Error in inserting request into MongoDB collection: ', error);
                    res.status(500).end();
                } else {
                    db.close();
                    console.log('A request has been inserted');
                    // TODO : Add a Location header, using an environment variable for base URL
                    res.status(203);
                    res.end();
                }
            });
        }
    });  
});

app.listen(port);
console.log("App listening on port " + port);