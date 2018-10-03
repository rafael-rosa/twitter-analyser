var util = require('util');
var twit = require("twit");
var config = require("./config.js");

var api = {}

api.buscaPosts = function(req,res) {
    console.log('API buscaPosts - request: ' + util.inspect(req.body));
    /*
    console.log("Executando API buscaPosts: %j", req);
    */
    var twApi = new twit(config);
    var twitter = {}

    var params = {
        /*q: '#nodejs, #Nodejs'*/
        q: req.body.query
        ,result_type: 'recent'
        /*,lang: 'pt'*/
        ,count: 100
    } 

    twApi.get('search/tweets', params, function(err, data) {
        if (!err) {
            res.json(data);
        }
        else {
          console.log('Erro ao consultar o Twitter');
        }
    });

}

module.exports = api;