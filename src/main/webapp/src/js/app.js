var errorToolApp = angular.module('errorToolApp', [
        'ngAnimate',
        'ngRoute',
        'ngCookies',
        'ngTouch',
        'auth',
        'ui.bootstrap',
        'ui.grid',
        'ui.grid.saveState',
        'ui.grid.cellNav',
        'ui.grid.pagination',
        'ui.grid.selection',
        'ui.grid.resizeColumns',
        'ui.grid.moveColumns',
        'ny.logger',
        'angularModalService',
        'ui.grid.exporter',
        'angular-loading-bar',
        'ui.codemirror' ]);

var interceptor = function ($q, $location, $cookies) {
    return {
        request: function (config) {
        	var loggedIn = $cookies.get("loggedIn");
        	var toolsSSOAuth = $cookies.get("tools_sso_auth");
        	if ((loggedIn == null || loggedIn == false) && toolsSSOAuth == null) {
                $location.path("/login");
            }
            return config;
        },

        response: function (result) {
            return result;
        },

        responseError: function (rejection) {
        	//logger.log('Failed with', rejection.status, 'status');
            return $q.reject(rejection);
        }
    }
};

 
errorToolApp.config([ '$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
	$httpProvider.interceptors.push(interceptor);
	$routeProvider
	// Home
	.when("/", {
		templateUrl : "Login.html",
	})
	// Pages
	.when("/login", {
		templateUrl : "Search.html",
	}).when("/search", {
		templateUrl : "Search.html",
	}).when("/report", {
		templateUrl : "Report.html",
	}).when("/docview", {
		templateUrl : "Docview.html",
		controller: 'DocCtrl',
	}).when("/replace", {
		templateUrl : "Replace.html",
		controller: 'ReplaceCtrl',
	}).otherwise({
		templateUrl : 'Login.html',
	});
} ]);

//%2F is the percent-encoding for the forward-slash / character.
//This problem is related to the fact that AngularJS 1.6 has changed the default for hash-bang urls in the $location service.
//To revert to the previous behavior:
errorToolApp.config(['$locationProvider', function($locationProvider) {
	  $locationProvider.hashPrefix('');
	}]);

errorToolApp.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
	cfpLoadingBarProvider.includeSpinner = false;
	cfpLoadingBarProvider.latencyThreshold = 1000;
  }]);

var auth = angular.module('auth', []);

errorToolApp.run(function($http, $rootScope, $location, $cookies, propertiesService, AuthService) {
    // register a listener to watch route changes
    $rootScope.$on("$routeChangeStart", function(event, next, current) {

        var loggedIn = $cookies.get("loggedIn");
        var toolsSSOAuth = $cookies.get("tools_sso_auth");

        if ((loggedIn == null || loggedIn == false) && toolsSSOAuth == null) {
            $location.path("/login");
        } else if ((loggedIn == null || loggedIn == false) && toolsSSOAuth != null) {

            AuthService.attemptSSO(propertiesService.getServiceUrlBase() + "UserAuth/SSO", toolsSSOAuth).then(function(userData) {
                if (userData == null) {
                    $location.path("/login");
                } else {
                    if (next.templateUrl == "Login.html") {
                        $location.path("/search");
                    }
                }
            });

        } else {
            if (next.templateUrl == "Login.html") {
                $location.path("/search");
            }
        }
    });

}); 