errorToolApp.controller("UserCtrl", ['$scope', '$rootScope', '$location', '$http', '$cookies', 
                                     'userLoginService', 'propertiesService', 'Logger',
 function($scope, $rootScope, $location, $http, $cookies, userLoginService, propertiesService, Logger) {
	var logger = Logger.getInstance('UserController.js'); 
	$scope.noPermission = false;
	$scope.errorLogin = false;
	
	$scope.submit = function() {
		$scope.$parent.loginStatus = false;
		var userCredential = {
			"username" : $scope.userName,
			"password" : $scope.password
		};
		
		logger.log('(UserCtrl) before service call for login');

		$http({
			method : 'POST',
			data : userCredential,
			url : propertiesService.getServiceUrlBase() + "UserAuth/Login",
			headers : {
				'Content-Type' : 'application/json'
			}
		}).then(function (response){
		  	var data = response.data;

            if (data == null || (typeof data === "string")) {

                logger.log('(UserCtrl) after service call for login - failure');
                userLoginService.removeLogin(data);
                $scope.errorLogin = true;
                $location.path('/login');

            } else if (data != null && (typeof data === "object")) {

                var isEdit = false;
                for (var i = 0; i < data.roles.length; i++) {
                   var role = data.roles[i].name;
                   isEdit = role == "ET_EDIT";
                   if (isEdit) {
                       break;
                   }
                }
                if( isEdit ){
                   logger.log('(UserCtrl) after service call for login - success');
                   userLoginService.initLogin(data);
                   $scope.userData = data;
                   $location.path('/search');
                }
                else{
                   logger.error('(UserCtrl) The user has no permission to login.');
                   userLoginService.removeLogin(data);
                   $scope.noPermission = true;
                   $scope.errorLogin = false;
                   $location.path('/login');
                }

            } else {

                logger.error('(UserCtrl) The response returned was not recognized.');
                userLoginService.removeLogin(data);
                $scope.errorLogin = true;
                $location.path('/login');
            }
		});
	};
}]);