var util = require('util');

function TwitterDAO(app) {
    this._app = app;
}

TwitterDAO.prototype.salva = function(twitter,callback){
    
    console.log("TwitterDAO - Salva - itens: " + twitter.tweets.length);
    //console.log(util.inspect(twitter));

    this._app.infra.connectionFactory(function(err, connection) {
    
        var sql = '';

        for (var i = 0; i < twitter.tweets.length; i++) {
            
            /*https://stackoverflow.com/questions/44304777/er-truncated-wrong-value-incorrect-datetime-value*/
            /*var dataAux = connection.escape(new Date(twitter.tweets[i].data));*/
            var horaAux = twitter.tweets[i].hora;
            var userAux = twitter.tweets[i].user;
            var langAux = twitter.tweets[i].lang;
            var follAux = twitter.tweets[i].followerscount;
        
            sql += "INSERT INTO TWITTER_SEARCH_RESULTS (TWITTER_SEARCH_TAGS,DATE_OF_SEARCH,TWEET_HOUR,USER,USER_LANGUAGE,FOLLOWERS_COUNT) "
                    + "VALUES ('" + twitter.query + "', NOW(), " + horaAux + ", '" + userAux + "', '" + langAux + "', " + follAux + ");\n ";
        }

        connection.query(sql,function(erros, results) {
                    connection.release();

                    console.log('TwitterDAO - Salva - fim');
                    
                    callback(erros,results);
                  });
            
    });

}


TwitterDAO.prototype.listaUsuarios = function(subject,callback){
    
    console.log("TwitterDAO - ListaUsuarios - subject: " + subject.search_tags);

    this._app.infra.connectionFactory(function(err, connection) {
    
        var sql = "CALL getMostPopularUsersBySubject(?,NOW(),5);";

        connection.query(sql,subject.search_tags,function(erros, results) {
                    connection.release();
                    console.log('TwitterDAO - ListaUsuarios - fim');
                    callback(erros,results);
        });
            
    });

}

TwitterDAO.prototype.listaContTweetsHora = function(subject,callback){
    
    console.log("TwitterDAO - listaContTweetsHora - subject: " + subject.search_tags);

    this._app.infra.connectionFactory(function(err, connection) {
    
        var sql = "CALL getTweetsCountPeerHour(?,NOW());";

        connection.query(sql,subject.search_tags,function(erros, results) {
                    connection.release();
                    console.log('TwitterDAO - listaContTweetsHora - fim');
                    callback(erros,results);
        });
            
    });

}

TwitterDAO.prototype.listaContTweetsIdioma = function(subject,callback){
    
    console.log("TwitterDAO - listaContTweetsIdioma - subject: " + subject.search_tags);

    this._app.infra.connectionFactory(function(err, connection) {
    
        var sql = "CALL getTweetsCountPeerLanguage(?,NOW());";

        connection.query(sql,subject.search_tags,function(erros, results) {
                    connection.release();
                    console.log('TwitterDAO - listaContTweetsIdioma - fim');
                    callback(erros,results);
        });
            
    });

}

module.exports = function(){
	return TwitterDAO;
};


/*
A ideia era passar connection como parametro da funcao exports, mas o express-load carrega o modulo e passa o objeto do express
como parametro, o que daria erro. Explicação:
O problema é que o express-load já chama o que é atribuído ao export, no caso, a função. Mas, ele chama passando um objeto do express. Quando abrimos o produtosBanco.js temos o connection que na verdade é objeto do express e tenta chamar um método query que não está definido no objeto do express. Por isso, recebemos uma mensagem falando que está ocorrendo um erro.
Portanto, é preciso dar uma enganada no express-load. Dessa maneira, no arquivo produtosBanco.js nós vamos criar uma função que retorna uma outra função e essa sim receberá a connection como argumento!

module.exports = function(){
    return function(connection){
        this.lista = function(callback){
            connection.query('select * from produtos',callback);
        }
    return this;    
    };
}
*/