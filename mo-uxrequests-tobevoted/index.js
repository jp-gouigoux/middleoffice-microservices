var express = require('express');
var app = express();
var port = process.env.PORT || 80;
var base_url = process.env.BASE_URL || 'http://localhost/middleoffice';
var apiux_url = base_url + '/api/ux/requests';
const request = require('request');

app.get('*', function(req, res) {
    var content = '<html>'
        +'<head>'
        +'<title>MiddleOffice - Requests to be voted</title>'
        +'<link rel="stylesheet" href="http://netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css">'
        +'</head>'
        +'<body>'
        +'<h1>List of requests to be voted</h1>'
        +'<ul>';
    // TODO : if the "voted" parameter on the request was to disappear because consistency is found to be better
    // done by reading votes only, then the following should rather retrieve the date from a consolidated index
    // in the manner of CQRS views, with one of them grouping requests and votes information
    var requestslist_url = base_url + '/api/requests';
    request(requestslist_url, { json: true}, function(error, result, body) {
        if (error) {
            console.log('Error while calling ' + requestslist_url + ': ', error);
            res.status(500).end();
        } else {
            for (i = 0; i < body.length; i++) {
                content += '<li><a href="' + apiux_url + '/' + body[i]._id + '/vote">' + body[i].summary + '</a></li>';
            }
            content += '</ul>'
                +'</body>'
                +'</html>';
            res.send(content);
        }});
});

app.listen(port);
console.log("App listening on port " + port);