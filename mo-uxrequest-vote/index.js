var express = require('express');
var app = express();
var port = process.env.PORT || 80;
var base_url = process.env.BASE_URL || 'http://localhost/middleoffice';
var api_url = base_url + '/api/requests/{id}/vote';
var requesttypes_url = base_url + '/api/requesttypes/{code}';
const request = require('request');

app.get('*', function(req, res) {
    var initialURL = req.header('X-Forwarded-Prefix');
    var arr = initialURL.replace('/vote', '').split('/');
    var requestId = arr[arr.length - 1];
    var requestobject_url = base_url + '/api/requests/' + requestId;
    //var requestobject_url = base_url + req.header('X-Forwarded-Prefix').replace('/vote', '').replace('/ux', ''); // TODO : Make this construction less dependent from UX URLs by directly extracting the request id
    console.log('requestobject_url: ' + requestobject_url);
    request(requestobject_url, { json: true }, function(error, result, body) {
        if (error) {
            console.log('Error retrieving request to be voted by calling ' + requestobject_url + ': ', error);
            res.status(500).end();
        } else {
            var content = '<html>'
                +'<head>'
                +'<title>MiddleOffice - Vote</title>'
                +'<link rel="stylesheet" href="http://netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css">'
                +'</head>'
                +'<body>'
                +'<h1>Please provide your vote for the following request</h1>'
                +'<div class="col-sm-5">'
                +'<form method="POST" action="' + api_url.replace('{id}', requestId) + '">'
                +'<div class="form-group">'
                +'<input type="text" class="form-control input-lg" name="id" value="' + body._id + '" readonly></input>'
                +'<input type="text" class="form-control input-lg" name="type" value="' + body.type + '" readonly></input>'
                +'<input type="textarea" class="form-control input-lg" name="summary" value="' + body.summary + '" readonly></input>'
                +'<input type="textarea" class="form-control input-lg" name="payload" value="' + body.payload + '" readonly></input>';
            var requesttypeobject_url = requesttypes_url.replace('{code}', body.type);
            console.log('requesttypeobject_url: ' + requesttypeobject_url);
            request(requesttypeobject_url, { json: true}, function(rterror, rtresult, rtbody) {
                if (rterror) {
                    console.log('Error while calling ' + requesttypeobject_url + ': ', rterror);
                    res.status(500).end();
                } else {
                    content += '<button type="submit" class="btn btn-primary btn-lg" name="vote1">' + rtbody.possibleVotes[0].title[0].value + '</button>';
                    content += '<button type="submit" class="btn btn-primary btn-lg" name="vote2">' + rtbody.possibleVotes[1].title[0].value + '</button>';
                    content += '</div>'
                        +'</form>'
                        +'</div>'
                        +'</body>'
                        +'</html>';
                    res.send(content);
                }});
        }
    });
});

app.listen(port);
console.log("App listening on port " + port);