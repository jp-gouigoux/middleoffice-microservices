var express  = require('express');
var app = express();
var port = process.env.PORT || 80;
var urlapi = process.env.URLAPI || '/api/requesttypes';

app.use(express.static(__dirname + '/public'));

app.get('*', function(req, res) {
    res.send('<html>'
    +'<head>'
    +'<title>MiddleOffice - Request types</title>'
    +'<link rel="stylesheet" href="http://netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css">'
    +'</head>'
    +'<body>'
    +'<div class="col-sm-5">'
    +'<form method="POST" action="' + urlapi + '">'
    +'<div class="form-group">'
    +'<input type="text" class="form-control input-lg" placeholder="Request type code" name="code"></input>'
    +'<input type="text" class="form-control input-lg" placeholder="Label for vote #1" name="vote1"></input>'
    +'<input type="text" class="form-control input-lg" placeholder="URL to call upon vote #1" name="url1"></input>'
    +'<input type="text" class="form-control input-lg" placeholder="Label for vote #2" name="vote2"></input>'
    +'<input type="text" class="form-control input-lg" placeholder="URL to call upon vote #2" name="url2"></input>'
    +'<button type="submit" class="btn btn-primary btn-lg">Enregistrer</button>'
    +'</div>'
    +'</form>'
    +'</div>'
    +'</body>'
    +'</html>');
});

app.listen(port);
console.log("App listening on port " + port);