var mysql = require("mysql");

/*
Toda esta implementação funcionou bem enquanto a aplicacao rodava localmente e o banco estava em uma VM local também
Quando subi a aplicacao para o heroku, ela funcionava por alguns instantes, respondendo com algumas paginas e depois
dava crash. O problema estava no banco de dados do heroku, o cleardb que possui recursos limitados e somente 10 conexoes
a solucao foi passar a utilizar um pool de conexoes para gerenciar as conexoes com mais eficiencia

--
https://github.com/mysqljs/mysql
https://cursos.alura.com.br/forum/topico-local-funciona-bem-da-crash-no-heroku-error-quit-inactivity-timeout-22985  (solucao)
https://www.codementor.io/codeforgeek/node-js-mysql-8b5nh45r9
https://github.com/jonathas/casadocodigo/blob/master/app/infra/connectionFactory.js
https://stackoverflow.com/questions/32715273/node-mysql-throwing-connection-timeout
https://stackoverflow.com/questions/35914736/node-js-and-mysql-connection-pool-does-not-export
https://stackoverflow.com/questions/23266854/node-mysql-multiple-statements-in-one-query
--


function createDBConnection(){
	if (!process.env.NODE_ENV || process.env.NODE_ENV === 'dev') { //Se nao defini o ambiente (== null), considere como DEV
		//=== compara dois valores CONSIDERANDO o tipo de dado ex: '1' === 1 = falso / '1' == 1 = verdadeiro
		return mysql.createConnection({
				host:'w7bdvm',
				user:'root',
				password:'1234',
				database:'casadocodigo_nodejs'
			});
	}
	if (process.env.NODE_ENV == 'test') {
		return mysql.createConnection({
				host:'w7bdvm',
				user:'root',
				password:'1234',
				database:'casadocodigo_nodejs_test'
			});
	}
	if (process.env.NODE_ENV == 'production') { //heroku define automaticamente como production

		//Se deixarmos os dados da conexao com o BD chapados no codigo e 
		//subirmos nosso projeto em um repositorio publico, todos terao acesso ao banco!!
		var urlDeConexao = process.env.CLEARDB_DATABASE_URL;
		var dadosConexao = urlDeConexao.match(/mysql:\/\/(.*):(.*)@(.*)\/(.*)\?reconnect=true/);
		
		--
		Explicando a regex: toda regex deve comecar com / e finalizar com /
			1.Vai começar com mysql: com duas // escapadas \/\/
			2.Depois das barras vem o login (.*) indica que queremos pegar este grupo que tem qualquer caracter 
			  repetido um numero x de vezes até encontrar o :
			3.Depois dos : vem um outro grupo de caracteres que queremos pegar que é a senha (ate o @)
			4.Depois vem o host ate a /
			5.Depois vem o nome do banco (ate o ?)

			O match devolve um array e a primeira posicao e a string inteira, entao a 0 = 1
		--

		return mysql.createConnection({
				host:dadosConexao[3],
				user:dadosConexao[1],
				password:dadosConexao[2],
				database:dadosConexao[4],
				connectTimeout: 1000000
				--
				opcoes validas somente para pool
				connectionLimit: 10, default 10
        		queueLimit: 30,
				acquireTimeout: 1000000
				--
			});
	}
}
*/

var pool = null;

function _criaPool() {

	
	var urlDeConexao = process.env.CLEARDB_DATABASE_URL;

	if(urlDeConexao || process.env.NODE_ENV === 'production'){

		var dadosConexao = urlDeConexao.match(/mysql:\/\/(.*):(.*)@(.*)\/(.*)\?reconnect=true/);

		pool = mysql.createPool({
			connectionLimit : 10, //limite ClearDB
			host			: dadosConexao[3],
			user			: dadosConexao[1],
			password		: dadosConexao[2],
			database 		: dadosConexao[4],
			debug    		: false
		});
	

	}else if (!process.env.NODE_ENV || process.env.NODE_ENV === 'dev') { 

		pool = mysql.createPool({
			connectionLimit : 100,
			host			: 'w7bdvm',
			user			: 'root',
			password		: '1234',
			database 		: 'casadocodigo_nodejs',
			multipleStatements : true,
			debug    		: false
		});

	}
    // Se a fila ta cheia
    pool.on('enqueue', function () {
        //console.error('Waiting for available connection slot');
    });

}

_criaPool();

var connectMySQL = function(callback) {

    return pool.getConnection(function (err, connection) {
        if(err) {
            //return callback(err);
            console.log('Error getting mysql_pool connection: ' + err);
            pool.end(function onEnd(error) {
                if(error) {
                    console.log('Erro ao terminar o pool: ' + error);
                }
                // All connections are now closed once they have been returned with connection.release()
                // i.e. this waits for all consumers to finish their use of the connections and ends them.
                // Recria o pool
                _criaPool();
            });
            return;
        }
        return callback(null, connection);
    });

};


/*
  O express load carrega o objeto e ja instancia ele, chamando a funcao de inicializacao ()
  No modulo de infra, que possui a conexao com o banco, isto pode nao ser o comportamento 
  desejado, pois criara uma conexao com o banco ja na inicializacao. Por este motivo,
  no objeto connectionFactory a funcao de inicializacao foi encapsulada em outra funcao (wrapper)
*/
module.exports = function(){
	return connectMySQL;	
	//return createDBConnection;

	//return createDBConnection();
	/*
	  Cuidado para nao exportar a conexao aberta, mas sim a funcao que cria a conexao. 
	  Isto causaria problemas porque uma unica conexao circularia pelo sistema inteiro, 
	  e qualquer connection.end faria a aplicacao parar de funcionar
	  No seu código dentro no return da função do module.exports, você está executando a função createDBConnection(). 
	  Já no código do Ícaro ele não executa a função createDBConnection. Essa é a diferença do seu código para o do Ícaro.
	  Por favor, retire os parênteses que vem depois da função para você retorno a a função em vez da execução da mesma.
	*/
};