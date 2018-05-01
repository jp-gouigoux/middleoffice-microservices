var express  = require('express');
var app = express();
var port = process.env.PORT || 80;
var base_url = process.env.BASE_URL || 'http://localhost/middleoffice';
var api_url = base_url + '/api/requesttypes';

app.get('*', function(req, res) {
    res.send('<html>'
    +'<head>'
    +'<title>MiddleOffice - Request types</title>'
    +'<link rel="stylesheet" href="http://netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css">'
    +'</head>'
    +'<body>'
    +'<h1>Please provide the following characteristics for the new request type</h1>'
    +'<div class="col-sm-5">'
    +'<form method="POST" action="' + api_url + '">'
    +'<div class="form-group">'
    +'<input type="text" class="form-control input-lg" placeholder="Request type code" name="code" required></input>'
    +'<input type="text" class="form-control input-lg" placeholder="Label for vote #1" name="vote1" required></input>'
    +'<input type="text" class="form-control input-lg" placeholder="URL to call upon vote #1" name="url1"></input>'
    +'<input type="text" class="form-control input-lg" placeholder="Label for vote #2" name="vote2" required></input>'
    +'<input type="text" class="form-control input-lg" placeholder="URL to call upon vote #2" name="url2"></input>'
    +'<button type="submit" class="btn btn-primary btn-lg">Record</button>'
    +'</div>'
    +'</form>'
    +'</div>'
    +'</body>'
    +'</html>');
});

app.listen(port);
console.log("App listening on port " + port);