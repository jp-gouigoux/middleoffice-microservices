var express = require('express');
var app = express();
var port = process.env.PORT || 80;
var base_url = process.env.BASE_URL || 'http://localhost/middleoffice';
var api_url = base_url + '/api/requests/{id}/vote';
var requesttypes_url = base_url + '/api/requesttypes/{id}';
const request = require(request);

app.get('*', function(req, res) {
    console.log('URL called is ' + req.url);
    var requestobject_url = req.url.replace('/vote', '');
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
                +'<form method="POST" action="' + api_url.replace('{id}', req.params.id) + '">'
                +'<div class="form-group">'
                +'<input type="text" class="form-control input-lg" name="id" readonly>' + body._id + '</input>'
                +'<input type="text" class="form-control input-lg" name="type" readonly>' + body.type + '</input>'
                +'<input type="textarea" class="form-control input-lg" name="summary" readonly>' + body.summary + '</input>'
                +'<input type="textarea" class="form-control input-lg" name="payload" readonly>' + body.payload + '</input>';
            var requesttypeobject_url = requesttypes_url.replace('{id}', body.type);
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