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

app.get('/api/requests/:id', function(req, res) {
    console.log('Inside the GET /api/requests/{id}');
    MongoClient.connect(mongo_url, function (err, db) {
        if (err) {
            console.log('Unable to connect to the MongoDB server: ', err);
            res.status(500).end();
        } else {
            console.log('Connected to MongoDB server');
            db.collection('requests').findOne({ "_id": ObjectId(req.params.id) }, function (error, result) {
                if (error) {
                    console.log('Unable to retrieve request ' + req.params.id + ' from MongoDB collection: ', error);
                    res.status(500).end();
                } else if (result == null) {
                    res.status(404).send('Request ' + req.params.id + ' does not exist'); // TODO : create a generic 404 page with Bootstrap
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
                type: req.body.type,
                summary: req.body.summary,
                payload: req.body.payload
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
                    // TODO : Could point to the entity just created, if it suits better the UX
                    // TODO : In an iFrame approach, could point back to the list, which would be in the same UI in this case
                    res.send('<html><head><link rel="stylesheet" href="http://netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css"></head><body><h1>Done !</h1><p>Click <a href="' + base_url + '">here</a> to go back to main menu</p></body></html>');
                }
            });
        }
    });  
});

app.listen(port);
console.log("App listening on port " + port);