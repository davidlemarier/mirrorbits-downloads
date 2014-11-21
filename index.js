var express = require('express');
var exphbs = require('express3-handlebars');
var request = require('request');
var _ = require('lodash');

var backend = 'http://localhost:8080/'

// express setup
var app = express();
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {

    var file = req.param('p');
    var ip = req.headers['x-forwarded-for']

    console.log(file);

    backendRequest(backend + '' + file, ip, function(err, result) {
        if (!err) {
            res.render('home', {data: result});
        } else {
            res.render('error');
        }
    })
});

app.listen(3000);

var backendRequest = function(url, ip, callback) {

    request({url: url, headers: {'X-Forwarded-For': ip}}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            return callback(false, body);
        } else {
            return callback(error, false);
        }
    })

}
