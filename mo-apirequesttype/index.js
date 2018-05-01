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

app.get('/api/requesttypes', function(req, res) {
    MongoClient.connect(mongo_url, function (err, db) {
        if (err) {
            console.log('Unable to connect to the MongoDB server: ', err);
            res.status(500).end();
        } else {
            console.log('Connected to MongoDB server');
            // TODO : remove stringify if the following API confirms it is useless
            var myJson = JSON.stringify(db.collection('requesttypes').find({}).toArray(function (error, results) {
                if (error) {
                    console.log('Unable to retrieve request types from MongoDB collection: ', error);
                    res.status(500).end();
                } else {
                    res.contentType('application/json');
                    res.status(200);
                    res.json(results);
                }
            }));
        }
    });
  });

app.get('/api/requesttypes/{id}', function(req, res) {
    MongoClient.connect(mongo_url, function (err, db) {
        if (err) {
            console.log('Unable to connect to the MongoDB server: ', err);
            res.status(500).end();
        } else {
            console.log('Connected to MongoDB server');
            db.collection('requesttypes').findOne({ _id: req.params.id }, function (error, result) {
                if (error) {
                    console.log('Unable to retrieve request type ' + req.params.id + ' from MongoDB collection: ', error);
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

app.post('/api/requesttypes', function(req, res) {
    MongoClient.connect(mongo_url, function (err, db) {
        if (err) {
            console.log('Unable to connect to the MongoDB server: ', err);
            res.status(500).end();
        } else {
            console.log('Connected to MongoDB server');
            var requesttype = { 
                code: req.body.code,
                possibleVotes: [{
                    code: req.body.vote1,
                    title: [{ lang: 'fr-FR', value: req.body.vote1}],
                    actions: req.body.url1.length == 0 ? [] : [{ type: 'webcall', link: { href: req.body.url1, method: 'POST', body: '{payload}' }}]
                },{
                    code: req.body.vote2,
                    title: [{ lang: 'fr-FR', value: req.body.vote2}],
                    actions: req.body.url2.length == 0 ? [] : [{ type: 'webcall', link: { href: req.body.url2, method: 'POST', body: '{payload}' }}]
                }]
            };
            db.collection('requesttypes').insertOne(requesttype, function(error, result) {
                if (error) {
                    console.log('Error in inserting request type into MongoDB collection: ', error);
                    res.status(500).end();
                } else {
                    db.close();
                    console.log('A request type has been inserted');
                    // TODO : Add a Location header, using an environment variable for base URL
                    res.status(203);
                    // TODO : Could point to the entity just created, if it suits better the UX
                    // TODO : In an iFrame approach, could point back to the list, which would be in the same UI in this case
                    res.send('<html><body><h1>Done !</h1><p>Click <a href="' + base_url + '">here</a> to go back to main menu</p></body></html>');
                }
            });
        }
    });  
});

app.listen(port);
console.log("App listening on port " + port);