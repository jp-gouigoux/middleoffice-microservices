var express  = require('express');
var app = express();
var port = process.env.PORT || 80;
var base_url = process.env.BASE_URL || 'http://localhost/middleoffice';
var api_url = base_url + '/api/requests';

app.get('*', function(req, res) {
    res.send('<html>'
    +'<head>'
    +'<title>MiddleOffice - Requests</title>'
    +'<link rel="stylesheet" href="http://netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css">'
    +'</head>'
    +'<body>'
    +'<h1>Please describe your request</h1>'
    +'<div class="col-sm-5">'
    +'<form method="POST" action="' + api_url + '">'
    +'<div class="form-group">'
    +'<input type="text" class="form-control input-lg" placeholder="Request type (use code)" name="type" required></input>'
    +'<input type="textarea" class="form-control input-lg" placeholder="Text description of the request" name="summary"></input>'
    +'<input type="textarea" class="form-control input-lg" placeholder="Electronic description of the request (JSON, XML or other text formats)" name="payload"></input>'
    +'<button type="submit" class="btn btn-primary btn-lg">Submit</button>'
    +'</div>'
    +'</form>'
    +'</div>'
    +'</body>'
    +'</html>');
});

app.listen(port);
console.log("App listening on port " + port);