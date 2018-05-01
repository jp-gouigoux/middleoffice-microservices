var express = require('express');
var app = express();
var port = process.env.PORT || 80;
var mongodb = require('mongodb');
var mongo_url = process.env.MONGO_URL || 'mongodb://localhost:27017/middleoffice';
var MongoClient = mongodb.MongoClient;
var base_url = process.env.BASE_URL || 'http://localhost/middleoffice/';

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.urlencoded({
    extended: true
}));

app.post('/api/requests/{id}/vote', function(req, res) {
    MongoClient.connect(mongo_url, function (err, db) {
        if (err) {
            console.log('Unable to connect to the MongoDB server: ', err);
            res.status(500).end();
        } else {
            console.log('Connected to MongoDB server');
            db.collection('votes').find({ "request.id": req.params.id }, { _id: 1 }).toArray(function(error, result) {
                if (result.length > 0) {
                    res.status(403).send('Request has already been voted');
                } else {
                    var vote = { 
                        request: {
                            href: base_url + '/api/requests/' + req.params.id,
                            title: 'Request ' + req.params.id,
                            id: req.params.id
                        },
                        choice: req.body.code,
                        author: {
                            displayName: 'Unknown'
                        },
                        date: Date.now().toISOString() // ISO 8601
                    };
                    db.collection('votes').insertOne(vote, function(insertError, insertResult) {
                        if (error) {
                            console.log('Error in recording vote into MongoDB collection: ', insertError);
                            res.status(500).end();
                        } else {
                            db.close();
                            console.log('A vote has been inserted');
                            // TODO : Add a Location header, using an environment variable for base URL
                            res.status(203);
                            res.end();
                        }
                    });        
                }
            });
        }
    });
});

app.listen(port);
console.log("App listening on port " + port);