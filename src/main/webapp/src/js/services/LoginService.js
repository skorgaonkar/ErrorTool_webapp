/* User Login service */
errorToolApp.service('userLoginService', ['$cookies', '$rootScope', '$location', 'propertiesService', function($cookies, $rootScope, $location, propertiesService) {

    this.Status = {
        isLogin : false
    };

    this.getStatus = function() {
        return this.Status;
    };

    this.setIsLogin = function(val) {
        this.Status.isLogin = val;
    };

    this.initLogin = function(data) {

        propertiesService.getProperties().then(function(response) {

            var properties = response.data;
            var expireDate = new Date().setFullYear(new Date().getFullYear() + 1);

            $cookies.put('loggedIn', true, {
                path: properties.SSOCookiePath,
                domain: properties.SSOCookieDomain,
                expires: expireDate.toString(),
                secure: properties.SSOCookieSecure
            });

            $cookies.put('userName', data.samAccountName.toLowerCase(), {
                path: properties.SSOCookiePath,
                domain: properties.SSOCookieDomain,
                expires: expireDate.toString(),
                secure: properties.SSOCookieSecure
            });

            $cookies.put('userEmailAddress', data.primaryEmailAddress, {
               path: properties.SSOCookiePath,
               domain: properties.SSOCookieDomain,
               expires: expireDate.toString(),
               secure: properties.SSOCookieSecure
           });

            $rootScope.displayName = $cookies.get('userName');
        });

        $rootScope.loggedIn = true;
        this.setIsLogin(true);
	};

	this.removeLogin = function() {
		
		var cookies = $cookies.getAll();
		var domain = $location.host();
		if(domain.includes("proquest")){
			domain = ".proquest.com";
		}
		
		angular.forEach(cookies, function (v, k) {
            if (k == "loggedIn" || k == "userName" || k == "userEmailAddress" || k == "JSESSIONID" || k == "tools_sso_auth") {
            	$cookies.remove(k, {domain: domain, path: '/' });
            }
        });
		
        /*propertiesService.getProperties().then(function(response) {

            var properties = response.data;
            var expireDate = new Date().setFullYear(new Date().getFullYear() - 1);

            var cookies = $cookies.getAll();
            angular.forEach(cookies, function (v, k) {
                if (k == "loggedIn" || k == "userName" || k == "userEmailAddress" || k == "JSESSIONID" || k == properties.SSOCookieName) {
                    $cookies.remove(k, {
                        path: properties.SSOCookiePath,
                        domain: properties.SSOCookieDomain,
                        expires: expireDate.toString(),
                        secure: properties.SSOCookieSecure
                    });
                }
            });
        });*/

		$cookies.remove('searchIPCode');
		$cookies.remove('searchReceivedDate');
		$cookies.remove('searchReceivedEndDate');
		$cookies.remove('searchErrorMessage');
		$cookies.remove('searchErrMsgCaseSensitivity');
		$cookies.remove('ETDebugFlag');
		$cookies.remove('ETVersionNumber');
		$cookies.remove('returnToVendorPartners');
		$cookies.remove('searchIDType');
		$cookies.remove('searchID');

        $rootScope.loggedIn = false;
        this.setIsLogin(false);
	};
}]);
