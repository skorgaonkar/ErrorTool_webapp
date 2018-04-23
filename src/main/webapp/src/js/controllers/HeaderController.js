errorToolApp.controller("HeaderCtrl", function($scope, $http, $rootScope, $location, $cookies, $window, userLoginService,
		                                       selectedDocumentService, searchResultService, ModalService, replaceService, propertiesService,
		                                       Logger, $timeout) {
	var logger = Logger.getInstance('HeaderController.js');
	$scope.Status = userLoginService.getStatus();
	$rootScope.loggedIn = $cookies.get('loggedIn');
	$scope.logout = function() {
		if ($rootScope.docChanged == true) {
			ModalService.showModal({
				templateUrl : 'templates/docChangedWarning.html',
				controller : "ModalCtrl"
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(result) {
					if (result == "Yes") {
						$rootScope.docChanged = false;
						exit();
					}
					;
				});
			});
		}else if(replaceService.isReplaced()){
			ModalService.showModal({
 				templateUrl : 'templates/docReplacedWarning.html',
 				controller : "ModalCtrl"
 			}).then(function(modal) {
 				modal.element.modal();
 				modal.close.then(function(result) {
 					if (result == "Yes") {
 						commitReplace(false);
 						exit();
 						
 					};
 					if (result == "No") {
 						//reset all variables to initial values, ignore all replace changes
 						replaceService.setReplaceData( null );
 						replaceService.setReplaced(false);
 						exit();
 						
 					};
 				});
 			});
		}else {
			exit();
		}
	};

	function exit() {
		unLockAllUserDocs();

		userLoginService.removeLogin();

		selectedDocumentService.setSelectedDocIds([]);
		selectedDocumentService.setSelectedDoc(null);
		searchResultService.setErrorEvents(null, true);
		searchResultService.setSearchIPCode(null);
		searchResultService.setSearchReceivedDate(null);
		searchResultService.setSearchReceivedEndDate(null);
		searchResultService.setSearchErrorMessage(null);  
		searchResultService.setSearchErrMsgCaseSensitivity(null);
		searchResultService.setSearchIDType(null);
		searchResultService.setSearchID(null);
		replaceService.setDocs([]);
		replaceService.setReplaceData(null);
		
		$window.location.reload();
	}

	$scope.setUserName = function() {
		$scope.userName = $cookies.get('userName');
	};

	$scope.isActive = function(viewLocation) {
		return viewLocation === $location.path();
	};

	$scope.switchPage = function(viewLocation) {
		if ($rootScope.docChanged == true) {
			ModalService.showModal({
				templateUrl : 'templates/docChangedWarning.html',
				controller : "ModalCtrl"
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(result) {
					if (result == "Yes") {
						$location.path(viewLocation);
						$rootScope.docChanged = false;
					}
					;
				});
			});
		}else if(replaceService.isReplaced()){
			ModalService.showModal({
 				templateUrl : 'templates/docReplacedWarning.html',
 				controller : "ModalCtrl"
 			}).then(function(modal) {
 				modal.element.modal();
 				modal.close.then(function(result) {
 					if (result == "Yes") {
 						commitReplace(true);
 						if( viewLocation == "/search"){
 						   replaceService.setShowCommitMessage(true);
 						}
 						$location.path(viewLocation);
 						
 					};
 					if (result == "No") {
 						//reset all variables to initial values, ignore all replace changes
 						replaceService.setReplaceData( null );
 						replaceService.setReplaced(false);
 						$location.path(viewLocation);
 						
 					};
 				});
 			});
			
		}else {
			$location.path(viewLocation);
		}
	};
	
	function unLockAllUserDocs(){
	var userName = $cookies.get('userName');
	
	
    logger.log('(HeaderCtrl) before service call for unlovk');
	var getJson = $http({
              method : 'POST',
              data : userName,
              url : propertiesService.getServiceUrlBase() + "Doc/UnlockAll",
              headers : {'Content-Type' : 'application/json'}
         });

        getJson.then(function (response){
		  	var data = response.data;
            logger.log('(HeaderCtrl) after service call for unlovk - success');
            if ( data.eventIds.length > 0 ) {
            	//Todo
            }else {
            	//Todo
            }
        });
	
	}

	
	function commitReplace( waitforResponse ){
        var replaceData = replaceService.getReplaceData();
        if( !replaceService.isCurDocReplaced() ){
            replaceData.docContents = "";
        }
        else{
            replaceData.docContents = replaceService.getModifiedDocument();
        }
    	
        logger.log('(HeaderCtrl) before service call for commit');
    	var getJson = $http({
                  method : 'POST',
                  data : replaceData,
                  url : propertiesService.getServiceUrlBase() + "Replace/Commit",
                  headers : {'Content-Type' : 'application/json'}
             });

    	if( waitforResponse ){
            getJson.then(function (response){
    		  	var data = response.data;
                logger.log('(HeaderCtrl) after service call for commit - success');
                if ( data.curIndex != -1 ) {
                   replaceService.setReplaceData( data );
                   //wait up to 2 seconds, update chosenFormat and INT/Raw columns when commit is done.
                   $timeout(function () {
                	  var errorEvents = replaceService.updateSearchResult(searchResultService.getErrorEvents(), data.replaceList);
                      searchResultService.setErrorEvents(errorEvents, false);
                   }, 2000);
                }
            });
    	}
        replaceService.setReplaced(false);
	}
});
