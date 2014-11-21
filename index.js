var express = require('express');
var exphbs = require('express3-handlebars');
var request = require('request');
var _ = require('lodash');
var cluster = require('cluster');

var backend = 'http://localhost:8080';



if (cluster.isMaster) {

    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

} else {

hbs = exphbs.create({
    // Specify helpers which are only registered on this instance.
    helpers: {
        cleanUrl: function (url) { return  }
    }
    });

    // express setup
    var app = express();
    app.engine('handlebars', hbs.engine);
    app.set('view engine', 'handlebars');

    app.get('*', function (req, res) {

        var file = req.originalUrl;
        var ip = req.headers['x-forwarded-for']

        backendRequest(backend + '' + file, ip, function(err, data) {
            if (!err) {

                var result = {};

                // make URL
                _.each(data.MirrorList, function(value, key) {
                    var tempValue = value.HttpURL + file;
                    value.OfficialURL = tempValue.replace(/([^:]\/)\/+/g, "$1");
                });

                // set our templates vars
                result.mirror = _.first(data.MirrorList);
                result.mirrors = _.without(data.MirrorList, _.first(data.MirrorList));
                result.sha1 = data.FileInfo.Sha1;
                result.fileName = data.FileInfo.Path.split('/').reverse()[0];
                result.path = file;

                // render
                res.render('home', result);
            } else {
                res.render('error');
            }
        })
    });

    app.listen(3000);
    console.log('Application running!');

};

var backendRequest = function(url, ip, callback) {
    request({url: url, headers: {'X-Forwarded-For': ip}}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            return callback(false, JSON.parse(body));
        } else {
            return callback(error, false);
        }
    })

}
