var express = require('express');
var app = express();
var port = process.env.PORT || 80;
var mongodb = require('mongodb');
var mongo_url = process.env.MONGO_URL || 'mongodb://localhost:27017/middleoffice';
var MongoClient = mongodb.MongoClient;
var base_url = process.env.BASE_URL || 'http://localhost/middleoffice/';
const request = require('request');

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.urlencoded({
    extended: true
}));

function executeVote(requestobject, vote) {
    var webhooks = JSON.parse(process.env.WEBHOOKS || '[]');
    var execvotehooks = webhooks.items.filter(function(item){
        return item.topic == 'POST+*/execvote';
    });

    var requestobjecttype_url = base_url + '/api/requesttypes/' + requestobject.type;
    console.log('requestobjecttype_url: ' + requestobjecttype_url);
    request(requestobjecttype_url, { json: true }, function(error, result, body) {
        if (error) {
            console.log('Error retrieving request type by calling ' + requestobjecttype_url + ': ', error);
            res.status(500).end();
        } else {
            var content = { 'request': requestobject, 'vote': vote, 'type': body };
            for (i = 0; i < execvotehooks.length; i++) {
                request({
                    url: execvotehooks[i].callback,
                    method: execvotehooks[i].method,
                    body: JSON.stringify(content)
                }, function (err, res, bodyhook) {
                    if (!err && res.statusCode == 200) {
                        console.log('Incorrect call to webhook ' + execvotehooks[i].callback + '. Return was: ' + bodyhook);
                    }
                });
            }
        }
    });
}

app.post('/api/requests/:id/vote', function(req, res) {
    MongoClient.connect(mongo_url, function (err, db) {
        if (err) {
            console.log('Unable to connect to the MongoDB server: ', err);
            res.status(500).end();
        } else {
            console.log('Connected to MongoDB server');

            // TODO : check that the successive find / insertOne / find on votes collection is enough to elaborate a strong and distributed two-phase commit
            // TODO : if necessary, implement a better two-phase commit, with critical section or using a centralized Redis / a message queue

            // Failfast test on the local persistence
            db.collection('votes').find({ "request.id": req.params.id }, { _id: 1 }).toArray(function(error, result) {
                if (result.length > 0) {
                    res.status(403).send('A vote is already associated to this request');
                } else {

                    // Second test in order to enforce further a unique vote per request
                    var requestobject_url = base_url + '/api/requests/' + req.params.id;
                    console.log('requestobject_url: ' + requestobject_url);
                    request(requestobject_url, { json: true }, function(error, result, body) {
                        if (error) {
                            console.log('Error retrieving request to be voted by calling ' + requestobject_url + ': ', error);
                            res.status(500).end();
                        } else {
                            var requestobject = body;
                            if (body.voted == true) {
                                res.status(403).send('Request has already been voted');
                            } else {

                                // Considering the request as voted before sending the vote is better for consistency,
                                // as it is acceptable to lose a request if a race condition ever appears,
                                // while the occurrence of two votes on a unique request should be an impossible event
                                // TODO : check that the ADD operation does not fail is the VOTED attribute preexists
                                request(requestobject_url, { method: 'PATCH', json: true, body: [{ "op": "add", "path": "/voted", "value": true }] }, function(patchError, patchResult, patchBody) {
                                    if (patchError) {
                                        console.log('Error while patching request as voted: ', patchError);
                                        res.status(500).end();
                                    } else {

                                        // The crossed checking having been realized, it is now possible to actually write the vote,
                                        // with a strong limitation of race condition, while not complete since several containers
                                        // could be run on different machines and even the collections can be on separate databases
                                        var momentTraitementVote = new Date();
                                        var vote = { 
                                            request: {
                                                href: base_url + '/api/requests/' + req.params.id,
                                                title: 'Request ' + req.params.id,
                                                id: req.params.id
                                            },
                                            choice: req.body.code,
                                            author: {
                                                displayName: 'Unknown' // TODO : connect to identification once authentication will be plugged
                                            },
                                            date: momentTraitementVote.toISOString(), // ISO 8601
                                            timestamp: momentTraitementVote.getTime() // Partial redundancy with previous parameter, but the uses are different : first one is for business information, whereas second one is there to prevent race condition on two votes for the same request
                                        };
                                        db.collection('votes').insertOne(vote, function(insertError, insertResult) {
                                            if (error) {
                                                console.log('Error in recording vote into MongoDB collection: ', insertError);
                                                res.status(500).end();
                                            } else {

                                                // As a last check (crossed with the verification of the voted status, for better lock),
                                                // we verify that there still is one and only one vote to be treated; by retrieving the
                                                // list, we ensure that further modification of the database will not matter
                                                db.collection('votes').find({ "request.id": req.params.id }, { _id: 1 }).toArray(function(error, result) {
                                                    if (result.length != 1) {
                                                        res.status(500).send('A race condition has been encountered in casting vote for this request, leading to its cancellation');
                                                        // TODO : implement a business-oriented solution to this, by contacting an administrator or providing the request origin in order to ask to repeat the transaction
                                                    } else {
                                                        db.close();
                                                        console.log('A vote has been inserted');

                                                        // Now and only now the vote transaction has been secured, the events are called
                                                        executeVote(requestobject, vote);

                                                        // TODO : Add a Location header, using an environment variable for base URL
                                                        res.status(203);
                                                        // TODO : Could point to the entity just created, if it suits better the UX
                                                        // TODO : In an iFrame approach, could point back to the list, which would be in the same UI in this case
                                                        res.send('<html><head><link rel="stylesheet" href="http://netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css"></head><body><h1>Your vote has been cast !</h1><p>Click <a href="' + base_url + '">here</a> to go back to main menu</p></body></html>');
                                                    }
                                                });
                                            }
                                        });        
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
    });
});

app.listen(port);
console.log("App listening on port " + port);