angular.module('twitteran')
	.controller('AppController', function($scope, $http) {

		$scope.twitter      = {};
		$scope.mensagem     = '';
		$scope.usuarios     = {};
		$scope.tweetsHora   = {};
		$scope.tweetsIdioma = {};

		$scope.submeter = function() {
			console.log("controller - query");
			console.log($scope.twitter);
			
			//Consultar twitter
			$http.post('/v1/twitter',$scope.twitter)
			.success(function(data){
				//console.log(data.statuses[0]);
				$scope.mensagem = "Foram encontrados " + data.statuses.length + " Tweets para esta pesquisa";

				var twitter    = {};
				twitter.query  = $scope.twitter.query;
				twitter.tweets = [];

				for(var i = 0; i < data.statuses.length; i++){
					
					var tweet = {
						/*data  : data.statuses[i].created_at,*/
						hora  : new Date(data.statuses[i].created_at).getHours(),
						user  : '@' + data.statuses[i].user.screen_name,
						lang  : data.statuses[i].user.lang,
						followerscount : data.statuses[i].user.followers_count
					}
					twitter.tweets.push(tweet);	
	
				}

				console.log(twitter);

				//Salvar na base
				$http.post('/v1/metricas',twitter)
				.success(function(data){
					console.log(data);

					var subject = { 
						search_tags : $scope.twitter.query
					};

					//Obter lista de usuarios mais populares
					$http.post('/v1/metricas/getPopularUsers',subject)
					.success(function(data){
						console.log(data);

						if(data.length > 0){
							if(data[0].length > 0){
								$scope.usuarios = data[0];
							}
						}

						//Obter contagem de tweets por hora
						$http.post('/v1/metricas/getTweetsCountHour',subject)
						.success(function(data){
							console.log(data);

							if(data.length > 0){
								if(data[0].length > 0){
									$scope.tweetsHora = data[0];
								}
							}

							//Obter contagem de tweets por idioma
							$http.post('/v1/metricas/getTweetsCountLang',subject)
							.success(function(data){
								console.log(data);

								if(data.length > 0){
									if(data[0].length > 0){
										$scope.tweetsIdioma = data[0];
									}
								}
							})
							.error(function(erro){
								console.log(erro);
							});

						})
						.error(function(erro){
							console.log(erro);
						});


					})
					.error(function(erro){
						console.log(erro);
					});

				})
				.error(function(erro){
					console.log(erro);
				});

			})
			.error(function(erro){
				console.log(erro);
			});
					
		};
	});