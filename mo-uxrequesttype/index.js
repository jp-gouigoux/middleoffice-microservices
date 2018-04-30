var express  = require('express');
var app = express();
var port = process.env.PORT || 80;
var urlapi = process.env.URLAPI || '/api/requesttypes';

app.use(express.static(__dirname + '/public'));

app.get('*', function(req, res) {
	res.send('<html><head><title>MiddleOffice - Request types</title></head><body><form method="POST" action="' + urlapi + '"><input type="text" name="code"></input><button type="submit"></button></form></body></html>');
});

app.listen(port);
console.log("App listening on port " + port);