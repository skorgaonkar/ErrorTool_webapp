errorToolApp.controller('MainCtrl', ['$scope', '$rootScope', '$cookies', 'propertiesService', 'Logger',
  function($scope, $rootScope, $cookies, propertiesService, Logger) {
    var color = $cookies.get('color');
    var toolsInstance = $cookies.get('toolsInstance');
    var ETVersionNumber = $cookies.get('ETVersionNumber');
    var ETDebugFlag = $cookies.get('ETDebugFlag');
    var returnToVendorPartners = $cookies.get('returnToVendorPartners');
                	
    if(!color || !toolsInstance || !ETVersionNumber || !ETDebugFlag) {
        propertiesService.getProperties().then(function(response) {
            $scope.properties = response.data;
            if ($scope.properties.toolsInstance == "dev") {
                $scope.properties.toolsInstance = "Development";
                $cookies.put('toolsInstance', 'Development');
                $scope.color = "blue";
                $cookies.put('color', 'blue');	
            } else if ($scope.properties.toolsInstance == "dev2") {
                $scope.properties.toolsInstance = "DevUAT";
                $cookies.put('toolsInstance', 'DevUAT');
                $scope.color = "blue";
                $cookies.put('color', 'blue');	
            } else if ($scope.properties.toolsInstance == "pprd") {
            	$scope.properties.toolsInstance = "Preprod";
            	$cookies.put('toolsInstance', 'Preprod');
            	$scope.color = "green";
                $cookies.put('color', 'green');					
            } else if ($scope.properties.toolsInstance == "prod") {
            	$scope.properties.toolsInstance = "Prod";
            	$cookies.put('toolsInstance', 'Prod');
                $scope.color = "purple";
                $cookies.put('color', 'purple');					
            } else {
            	$scope.color = "blue";
            	$cookies.put('color', 'blue');
            }
            $cookies.put('ETVersionNumber', $scope.properties.ETVersionNumber);
            $scope.version = $scope.properties.ETVersionNumber ;
            $cookies.put('returnToVendorPartners', $scope.properties.returnToVendorPartners);
            $scope.returnToVendorPartners = $scope.properties.returnToVendorPartners;
            $cookies.put('ETDebugFlag', $scope.properties.ETDebugFlag);  
            $scope.ETDebugFlag = $scope.properties.ETDebugFlag ;
                										 
            if ($scope.ETDebugFlag == 'true') {
                Logger.on();
            } else {
            	Logger.off();
            }
       });
    } else {
        $scope.properties = { 'toolsInstance' : toolsInstance ,
                			  'ETVersionNumber' : ETVersionNumber,
                			  'ETDebugFlag' : ETDebugFlag,
                			  'returnToVendorPartners' : returnToVendorPartners
                			};
        $scope.color = color ;
        $scope.version = ETVersionNumber ;
        $scope.ETDebugFlag = ETDebugFlag ; 
        $scope.returnToVendorPartners = returnToVendorPartners;
                				 
        if ($scope.ETDebugFlag == 'true') {
            Logger.on();
        } else {
        	Logger.off();
        }
    }	
}]);

