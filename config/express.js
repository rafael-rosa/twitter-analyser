/*
  O express load permite o carregamento dos modulos da aplicacao ja na inicializacao da applicacao.
  Como o app.js chama o express.js, a ideia e que aqui ele carregue os modulos que o app precisa.
  Isto evita ficar espalhando um monte de 'require' pela aplicacao
*/
var express 		= require("express");
var load 			= require("express-load");
var bodyParser 		= require("body-parser");
routes				= require('../app/routes');

module.exports = function(){

	var app = express();

	app.use(express.static("./public"));

	/*
	  extented true permite fazer o tratamento de requisicoes de forms mais complexos (como objeto dentro de obj por exemplo) 

	  O use recebe funcoes que serao aplicadas ao request na ordem que definirmos. Isto e conhecido como Midleware.
	  o use aplica estas funcoes que serao executadas no momento em que a requisicao estiver trafegando da view (html) para o controller (rota)
	  req -> midlewareBodyParser -> midlewareDeAutenticacao -> funcao que trata a requisiao
	*/
	app.use(bodyParser.urlencoded({extended : true})); 
	app.use(bodyParser.json());

	/*
	  O express load carrega o objeto e ja instancia ele, chamando a funcao de inicializacao ()
	  No modulo de infra, que possui a conexao com o banco, isto pode nao ser o comportamento 
	  desejado, pois criara uma conexao com o banco ja na inicializacao. Por este motivo,
	  no objeto connectionFactory a funcao de inicializacao foi encapsulada em outra funcao (wrapper)
	*/
	load('routes',{cwd:'app'}) //passar o cwd facilita o trabalho do exprress-load que nao precisa procurar a pasta routes por toda as pastas
		.then('infra') //o cwd e opcional
		.into(app);

	routes(app);

	return app;
}