errorToolApp
		.controller(
				'ReplaceCtrl', [
						'$scope',
						'$filter',
						'$location',
						'$http',
						'$cookies',
						'$timeout',
						'selectedDocumentService',
						'propertiesService',
						'Logger',
                        '$sce',
                        'ModalService',
                        'searchResultService',
						'replaceService',
function($scope, $filter, $location, $http, $cookies, $timeout, selectedDocumentService, propertiesService, Logger, $sce, ModalService, searchResultService, replaceService) {

    var logger = Logger.getInstance('ReplaceController.js');
    logger.log('(ReplaceCtrl) begin');

    $scope.curSelectedDoc = 0;
    $scope.totalSelectedDoc = 0;
    $scope.docsModified = 0;
    $scope.numReplaces = 0;
    $scope.noDocs = false;
    $scope.replaced = false;
    $scope.choiceFormat = replaceService.getChoiceFormat();
    $scope.curDocIsNew = true;
    $scope.disableActionBtn = false;
    $scope.curDocReplaced = false;
    $scope.replaceAllSuccess = false;   
    $scope.replaceAllInProcess = false;  
    $scope.getJsonError = false; 
    $scope.clearCounts = false;  
    $scope.noINTFiles = replaceService.isNoINTFiles();
    
    loadDocument();
    
    function loadDocument() {
        $scope.totalSelectedDoc = replaceService.getTotalNumDocs();
        $scope.showDocError = false;
        var docs = replaceService.getDocs();
		
        if( docs != null && docs.length > 0 ) {
           var replaceData = {
              "replaceList" : docs,
              "replFormat" : $scope.choiceFormat,
              'userName': $cookies.get('userName')
           };

           logger.log('(ReplaceCtrl) before service call for load-document');

           var getJson = $http({
              method : 'POST',
              data : replaceData,
              url : propertiesService.getServiceUrlBase() + "Replace/FindFirst",
              headers : {'Content-Type' : 'application/json'}
           });

           getJson.then(function (response){
   		  	var data = response.data;
              if (angular.isUndefined(data.docContents) || data.curIndex == -1 ) {
            	  logger.log('(ReplaceCtrl) after service call for load-document - switching to raw');
                  $scope.showDocError = true;                 
                  $scope.origDocument = "";
                  $scope.wysiwygDocument = "";
                  if($scope.choiceFormat == 'INT') {
                	  $scope.noINTFiles = true;  
                	  $scope.choiceFormat = 'RAW';               	                  	                  	  
                  }
              } else {
            	  logger.log('(ReplaceCtrl) after service call for load-document - success');
            	  $scope.curDocReplaced = false;
            	  $scope.curSelectedDoc = data.curIndex + 1;
            	  replaceService.setReplaceData( data );
                  $scope.origDocument = data.docContents;
                  $scope.wysiwygDocument = $sce.trustAsHtml($scope.origDocument.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
              }
           });
        }
    };
    
    $scope.$watch('choiceFormat', function(newValue, oldValue) {    	
    	if(!oldValue || (newValue == oldValue)) {
    		return;
    	}   	
    	
    	if( $scope.showCommitSuccess ){
       	   $scope.showCommitSuccess = false;
      	}
    	$scope.replaceAllSuccess = false;  
    	$scope.getJsonError = false;
    	$scope.regExError = false;
    	
    	loadDocument();
    });
    
    var currentSearchState = SearchState.IDLE;
    $scope.findText = "";
    $scope.replaceWithText = "";

    var currentSearchResult = null;
    var regExp = null;
    
    function doFindNext(fn){
    	currentSearchState = SearchState.FIND;
        $scope.showFindNextResults = false;

        if ($scope.findReplaceForm.findText.$dirty) {

            if (regExp === null || (regExp !== null && regExp.source != $scope.findText)) {
                regExp = new RegExp($scope.findText, "g");
            }

            var searchDocument = $scope.origDocument;
            var searchResult = null;

            if ((searchResult = regExp.exec(searchDocument)) !== null) {

                currentSearchResult = searchResult;
                var tmpData = searchDocument.substring(0, searchResult.index).replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    tmpData += "<span class='scroll-to-highlight'>" + searchResult[0].replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</span>";
                    tmpData += searchDocument.substring((searchResult.index + searchResult[0].length), searchDocument.length).replace(/</g, "&lt;").replace(/>/g, "&gt;");

                $scope.wysiwygDocument = $sce.trustAsHtml(tmpData);

                $scope.$watch(
                    function() {
                        return wysiwygDocument;
                    },
                    function(newValue, oldValue) {
                        $(".scroll-to-highlight:first").get(0).scrollIntoView(false);

                        if (fn) {
                            fn();
                        }
                    }
                );
            } else {
                currentSearchResult = null;
            	loadNextDocument(fn);
                regExp = null;
            }
        }
    
    };
    
    $scope.findNext = function(fn) {
    	
    	if($scope.clearCounts == true) {
    		$scope.clearCounts = false;
    		$scope.docsModified = 0;
    		$scope.numReplaces = 0;
    	} 
    	
        doFindNext(fn);
    };

    function loadNextDocument(fn){
       var replaceData = replaceService.getReplaceData();
       logger.log('(ReplaceCtrl) before service call for find-next-document');
       if( !$scope.curDocReplaced ){
          replaceData.docContents = "";
       }
       else{
          replaceData.docContents = $scope.origDocument;
       }
       
       replaceData.findExpression = $scope.findText;
       var getJson = $http({
                method : 'POST',
                data : replaceData,
                url : propertiesService.getServiceUrlBase() + "Replace/FindNext",
                headers : {'Content-Type' : 'application/json'}
           });
        
       getJson.then(function (response){
		  	var data = response.data;
          logger.log('(ReplaceCtrl) after service call for find-next-document - success');
          if ( data.curIndex == -1 ) {
             $scope.showFindNextResults = true;
          } else {
             replaceService.setReplaceData( data );
             $scope.curSelectedDoc = data.curIndex + 1;
             $scope.origDocument = data.docContents;
             $scope.wysiwygDocument = $sce.trustAsHtml($scope.origDocument.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
             $scope.curDocIsNew = true;
             $scope.curDocReplaced = false;
             doFindNext(fn);
          }
       });
    }
    
    $scope.replace = function() {

        var fn = function() {
            if(regExp.source != null &&  regExp.source !== '(?:)') {

                currentSearchState = SearchState.REPLACE;
                var replaceWithText = $scope.replaceWithText.replace(/\\n/g, "\n").replace(/\\r/g, "\n");
                var replaceRegExp = new RegExp(regExp.source);

                var searchDocument = $scope.origDocument.substring(0, currentSearchResult.index);
                searchDocument = searchDocument + $scope.origDocument.substring(currentSearchResult.index, $scope.origDocument.length).replace(replaceRegExp, replaceWithText);
                regExp.lastIndex = regExp.lastIndex - currentSearchResult[0].length + $scope.replaceWithText.length;

                $scope.origDocument = searchDocument;
                replaceService.setModifiedDocument($scope.origDocument);

                var $scrollToHighlight = $(".scroll-to-highlight:first");
                $scrollToHighlight.text($scrollToHighlight.text().replace(new RegExp(regExp.source), replaceWithText));
                $scrollToHighlight.addClass("scroll-to-highlight-modified");

                $scope.replaced = true;
                replaceService.setReplaced($scope.replaced);

                if (!$scope.curDocReplaced) {
                  $scope.curDocReplaced = true;
                  replaceService.setCurDocReplaced($scope.curDocReplaced);
                }

                if ($scope.curDocIsNew) {
                   $scope.curDocIsNew = false;
                   $scope.docsModified++;
                }

                $scope.numReplaces++;
                replaceService.setDocsModified( $scope.docsModified );
            }
        };

        if (currentSearchState === SearchState.FIND) {
            fn();
        } else {
            $scope.findNext(fn);
        }
    };
    
    $scope.replaceAll = function() {
    	$scope.disableActionBtn = true;
    	$scope.replacedBak = $scope.replaced;
    	$scope.replaced = true;
    	replaceService.setReplaced($scope.replaced);
    	$scope.replaceAllInProcess = true;
    	$scope.showFindNextResults = false;
    	$scope.replaceAllSuccess = false; 
    	var replaceData = replaceService.getReplaceData();
        logger.log('(ReplaceCtrl) before service call for replaceAll');
        
        replaceData.docContents = "";                      
        replaceData.findExpression = $scope.findText;
        replaceData.replExpression = $scope.replaceWithText; 
        
        var getJson = $http({
                 method : 'POST',
                 data : replaceData,
                 url : propertiesService.getServiceUrlBase() + "Replace/ReplaceAll",
                 headers : {'Content-Type' : 'application/json'}
            });

        getJson.then(function (response){
		  	var data = response.data;               
            if (!data || !data.statusCode) {
        	  replaceAllError(); 
			} else {
				//handle the regular expression error
				if (data.statusCode > 0) {
					logger.log('(ReplaceCtrl) after service call for replaceAll - regular expression error'); 
					$scope.regExError = true;
					$scope.replaceAllInProcess = false;
					$scope.disableActionBtn = false;
					$scope.replaced = $scope.replacedBak;
					replaceService.setReplaced($scope.replaced);
				} else {
					$scope.clearCounts = true;  		    	
					$scope.regExError = false;
					logger.log('(ReplaceCtrl) after service call for replaceAll - success');                   	  
					replaceService.setReplaceData( data );
					$scope.curSelectedDoc = data.curIndex + 1;
					$scope.origDocument = data.docContents;
					$scope.wysiwygDocument = $sce.trustAsHtml($scope.origDocument.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
					$scope.docsModified = data.docsModified;
					$scope.numReplaces = data.modifiedCount;
					                         
					//update chosen format and INT/RAW column in results page	   
					var errorEvents = replaceService.updateSearchResult( searchResultService.getErrorEvents(), data.replaceList );
					searchResultService.setErrorEvents( errorEvents, false);
					                    
					$scope.replaced = false;
					replaceService.setReplaced($scope.replaced);     
					$scope.replaceAllInProcess = false;
					$scope.replaceAllSuccess = true;   
					$scope.disableActionBtn = false;
					$scope.curDocIsNew = true;
				}
			}        	
        },function (response){
			replaceAllError();
	 });

    };
    
    function replaceAllError() {
    	logger.log('(ReplaceCtrl) after service call for replaceAll - error');
		$scope.replaced = false;
		replaceService.setReplaced($scope.replaced); 
		$scope.replaceAllInProcess = false;
		$scope.disableActionBtn = false;
		$scope.getJsonError = true;
    }
    
    $scope.commit = function() {
    	$scope.disableActionBtn = true;
    	var replaceData = replaceService.getReplaceData();
    	
    	if( !$scope.curDocReplaced ){
            replaceData.docContents = "";
        }
        else{
            replaceData.docContents = $scope.origDocument;
        }
    	logger.log('(ReplaceCtrl) before service call for commit');
    	
    	var getJson = $http({
                  method : 'POST',
                  data : replaceData,
                  url : propertiesService.getServiceUrlBase() + "Replace/Commit",
                  headers : {'Content-Type' : 'application/json'}
             });

         getJson.then(function (response){
 		  	var data = response.data;
            logger.log('(ReplaceCtrl) after service call for commit - success');
            $scope.clearCounts = true;  	
            if ( data.curIndex != -1 ) {
               replaceService.setReplaceData( data );
               $scope.curSelectedDoc = data.curIndex + 1;
               $scope.committedDocs = data.docsModified;
               $scope.origDocument = data.docContents;
               $scope.wysiwygDocument = $sce.trustAsHtml($scope.origDocument.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
               $scope.curDocIsNew = true;
               $scope.curDocReplaced = false;
               $scope.showCommitSuccess= true;
               $scope.showFindNextResults = false;
               //update chosenFormat and INT/Raw columns
               var errorEvents = replaceService.updateSearchResult( searchResultService.getErrorEvents(), data.replaceList );
               searchResultService.setErrorEvents( errorEvents, true);
            }
            $scope.disableActionBtn = false;
         });
        $scope.replaced = false;
     	replaceService.setReplaced($scope.replaced);
    };
    
    $scope.exit = function() {
       if ($scope.replaced == true) {
 			ModalService.showModal({
 				templateUrl : 'templates/docReplacedWarning.html',
 				controller : "ModalCtrl"
 			}).then(function(modal) {
 				modal.element.modal();
 				modal.close.then(function(result) {
 					if (result == "Yes") {
 						var replaceData = replaceService.getReplaceData();
 				    	
 				    	if( !$scope.curDocReplaced ){
 				            replaceData.docContents = "";
 				        }
 				        else{
 				            replaceData.docContents = $scope.origDocument;
 				        }
 				    	logger.log('(ReplaceCtrl)-Exit before service call for commit');
 				    	
 				    	var getJson = $http({
 				                  method : 'POST',
 				                  data : replaceData,
 				                  url : propertiesService.getServiceUrlBase() + "Replace/Commit",
 				                  headers : {'Content-Type' : 'application/json'}
 				             });

 				         getJson.then(function (response){
 						  	var data = response.data;
 				            logger.log('(ReplaceCtrl)-Exit after service call for commit - success');
 				            if ( data.curIndex != -1 ) {
 				               replaceService.setReplaceData( data );
 				               //wait up to 2 seconds, update chosenFormat and INT/Raw columns when commit is done.
 			                   $timeout(function () {
 			                	  var errorEvents = replaceService.updateSearchResult(searchResultService.getErrorEvents(), data.replaceList);
 			                      searchResultService.setErrorEvents(errorEvents, false);
 			                   }, 2000);
 				            }
 				            
 				         });
  				        replaceService.setShowCommitMessage(true);
 				        $scope.replaced = false;
 						replaceService.setReplaced($scope.replaced);
 						$location.path('/search');
 						
 					};
 					if (result == "No") {
 						//reset all variables to initial values, ignore all replace changes
 						replaceService.setReplaceData( null );
 						$scope.replaced = false;
 						replaceService.setReplaced($scope.replaced);
 						$location.path('/search');
 						
 					};
 				});
 			});
 		} else {
 			$location.path('/search');
 		}
    };
    
    $('.btn-default').click(function() {
        $(this).blur();
        if( $scope.showCommitSuccess ){
       	   $scope.showCommitSuccess = false;
      	}
        $scope.replaceAllSuccess = false;  
    	$scope.getJsonError = false;
    	$scope.regExError = false;
    	$scope.showDocError = false;  
    });
}]);

var SearchState = {
    FIND : 0,
    REPLACE : 1,
    IDLE : 2
};