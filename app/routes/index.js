var api = require('../api'),
    path = require('path');

module.exports  = function(app) {

    app.route('/v1/twitter')
        .post(api.buscaPosts);


    app.post("/v1/metricas",function(request,response,next){ 
        var twitter = request.body;
        var twitterDAO = new app.infra.TwitterDAO(app);
    
        twitterDAO.salva(twitter,function(err, results){
            if (err) {
                console.log('Erro ao gravar na base' + err);
            }
            //response.redirect('/home');
            //response.status(200);
            //response.json(results); Array muito grande para ir para view
            response.json({registros:results.length, status:'insert db ok'});
        });

    });


    app.post("/v1/metricas/getPopularUsers",function(request,response,next){ 
        var subject = request.body;
        var twitterDAO = new app.infra.TwitterDAO(app);
    
        twitterDAO.listaUsuarios(subject,function(err, results){
            if (err) {
                console.log('Erro ao obter usuarios mais populares' + err);
            }
            response.json(results); 
        });

    });


    app.post("/v1/metricas/getTweetsCountHour",function(request,response,next){ 
        var subject = request.body;
        var twitterDAO = new app.infra.TwitterDAO(app);
    
        twitterDAO.listaContTweetsHora(subject,function(err, results){
            if (err) {
                console.log('Erro ao obter contagem de tweets por hora' + err);
            }
            response.json(results); 
        });

    });
  
    app.post("/v1/metricas/getTweetsCountLang",function(request,response,next){ 
        var subject = request.body;
        var twitterDAO = new app.infra.TwitterDAO(app);
    
        twitterDAO.listaContTweetsIdioma(subject,function(err, results){
            if (err) {
                console.log('Erro ao obter contagem de tweets por idioma' + err);
            }
            response.json(results); 
        });

    });

    // habilitando HTML5MODE
    app.all('/*', function(req, res) {
        res.sendFile(path.resolve('public/index.html'));
    });
};