var express  = require('express');
var app = express();
var port = process.env.PORT || 80;
var base_url = process.env.BASE_URL || 'http://localhost/middleoffice';
var apiux_url = base_url + '/api/ux/requests';

app.get('*', function(req, res) {
    console.log(req); // TODO : If possible, retrieve APIUX_URL from current URL
    var content = '<html>'
        +'<head>'
        +'<title>MiddleOffice - Requests to be voted</title>'
        +'<link rel="stylesheet" href="http://netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css">'
        +'</head>'
        +'<body>'
        +'<h1>List of requests to be voted</h1>'
        +'<ul>';
    var requestslist_url = base_url + '/api/requests';
    request(requestslist_url, { json: true}, function(error, result, body) {
        if (error) {
            console.log('Error while calling ' + requestslist_url + ': ', error);
            res.status(500).end();
        } else {
            var liste = JSON.parse(body);
            liste.array.forEach(element => {
                content += '<li><a href="' + apiux_url + '/' + element._id + '/vote">Demande bidon</a></li>';
            });
            content += '</ul>'
                +'</body>'
                +'</html>';
            res.send(content);
        }});
});

app.listen(port);
console.log("App listening on port " + port);