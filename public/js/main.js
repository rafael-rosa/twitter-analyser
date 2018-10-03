angular.module('twitteran', ['ngAnimate', 'ngRoute', 'ngResource'])
	.config(function($routeProvider, $locationProvider) {

		$locationProvider.html5Mode(true);

		$routeProvider.when('/home', {
			templateUrl: 'partials/principal.html',
			controller: 'AppController'
		});

		$routeProvider.otherwise({redirectTo: '/home'});

	});