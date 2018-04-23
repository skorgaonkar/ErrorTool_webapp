auth.factory('AuthService', ['$http', '$location', 'userLoginService', function($http, $location, userLoginService) {
    return {
        attemptSSO : function(path, toolsSSOAuth) {
            return $http({
                method: 'POST',
                url: path,
                headers: {
                    'Content-Type': 'text/plain',
                    'Accept': 'application/json'
                },
                data: toolsSSOAuth
            }).then(
                function success(response) {
                    userLoginService.initLogin(response.data);
                    return response.data;
                },
                function error(response) {
                    userLoginService.removeLogin();
                    return null;
                }
            );
        }
    };
}]);