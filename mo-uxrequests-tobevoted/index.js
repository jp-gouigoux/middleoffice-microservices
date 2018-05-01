var express  = require('express');
var app = express();
var port = process.env.PORT || 80;
var base_url = process.env.BASE_URL || 'http://localhost/middleoffice';
var apiux_url = base_url + '/api/ux/requests';

app.get('*', function(req, res) {
    console.log(req);
    var content = '<html>'
        +'<head>'
        +'<title>MiddleOffice - Requests to be voted</title>'
        +'<link rel="stylesheet" href="http://netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css">'
        +'</head>'
        +'<body>'
        +'<h1>List of requests to be voted</h1>'
        +'<ul>';
    content += '<li><a href="' + apiux_url + '/id/vote">Demande bidon</a></li>'
    content += '</ul>'
        +'</body>'
        +'</html>';
    res.send(content);
});

app.listen(port);
console.log("App listening on port " + port);