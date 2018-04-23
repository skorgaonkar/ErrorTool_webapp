errorToolApp.controller("SearchCtrl", ['$scope', '$rootScope','$location', '$cookies', 'searchResultService',	'propertiesService','selectedDocumentService','Logger',
    function($scope, $rootScope, $location, $cookies, searchResultService, propertiesService, selectedDocumentService, Logger) {
	   var logger = Logger.getInstance('SearchController.js'); 
	   logger.log('(SearchCtrl) begin');
	   
	   $scope.noSearchData = false;
	   $scope.noStartDate = false;
	   $scope.datePattern = /\d{4}\d{2}\d{2}/;
	   $scope.invalidDateInputFlag = false;
	   $scope.invalidDateFormatFlag = false;
	   $scope.invalidDateFlag = false;
	   $scope.invalidEndDateInputFlag = false;
	   $scope.invalidEndDateFormatFlag = false;
	   $scope.invalidEndDateFlag = false;
	   
	   if($cookies.getObject('collapse') != undefined){
		   $scope.collapse = $cookies.getObject('collapse');
	   }else{
		   $scope.collapse = true;
	   }
	   if($cookies.getObject('expand') != undefined){
		   $scope.expand = $cookies.getObject('expand');
	   }else{
		   $scope.expand = false;
	   }
	   $scope.syntaxSearchString = $cookies.get('syntaxSearchString');

	   $scope.invalidSyntaxFlag = false;
	   $scope.noIDType = false;
	   $scope.searchButtonText = 'Search';
	   $scope.isSearching = false;
	// $scope.myVar = 'Bumblebee';
	  
	  
	  // propertiesService.setServiceUrlBase($scope.myVar);
	   
	   /*
	    searchResultService.getProviderList().then(function(data){
		   $scope.partners = data;
		   });
		   */
	  
	   
	   if ($rootScope.refreshResultTable == null){
	       $rootScope.refreshResultTable = 1;
	   }

	   $scope.doCollapse = function() {
		  $scope.noIDType = false;
		  $scope.noSearchData = false;
	      if ((!$scope.receivedDate || $scope.receivedDate == "")
			&& ($scope.receivedEndDate != null && $scope.receivedEndDate.length > 0 ) ) {
			  $scope.noStartDate = true;
			  $scope.invalidDateInputFlag = true;
		  }
		  if( $scope.invalidDateInputFlag == false && $scope.invalidEndDateInputFlag == false ) {
		      $scope.collapse = false;
			  $scope.expand = true;
					
			  var syntaxStart = false;
			  $scope.syntaxSearchString = "";
			  //build syntax string in default order. 
			  if( $scope.IPCode != null && $scope.IPCode !="" && $scope.IPCode.length > 0 ) {
			      $scope.syntaxSearchString ="ip(" + $scope.IPCode + ")";
				  syntaxStart = true;
			  }
			  if( $scope.receivedDate != null && $scope.receivedDate !="" && $scope.receivedDate.length > 0 ) {
			      if( syntaxStart ) {
				      $scope.syntaxSearchString += " AND ";	
				  }
				  $scope.syntaxSearchString += "rcv(" + $scope.receivedDate;
				  if( !syntaxStart ) {
				      syntaxStart = true;
				  }
				  if( $scope.receivedEndDate != null && $scope.receivedEndDate !="" && $scope.receivedEndDate.length > 0 ) {
				      $scope.syntaxSearchString +="-" + $scope.receivedEndDate;
				  }
				  $scope.syntaxSearchString += ")";
		      }
			  if( $scope.IDType != null && $scope.IDType != "" && $scope.searchID != null && $scope.searchID != "") {
				  if( syntaxStart ) {
					  $scope.syntaxSearchString += " AND ";
				  }
				  if ($scope.IDType == 1) {
					  $scope.syntaxSearchString +="pubid(" + $scope.searchID + ")";
				  }
				  else if ($scope.IDType == 2) {
					  $scope.syntaxSearchString +="docid(" + $scope.searchID + ")";					  
				  }
				  syntaxStart = true;
			  }
		      if( $scope.searchErrorMessage != null && $scope.searchErrorMessage !="" && $scope.searchErrorMessage.length > 0 ) {
		         if( syntaxStart ) {
			        $scope.syntaxSearchString += " AND ";	
			     }
			     $scope.syntaxSearchString +="err(" + $scope.searchErrorMessage + ")";
			     syntaxStart = true;
		      }
	      }

		  $cookies.putObject('collapse', $scope.collapse);
		  $cookies.putObject('expand', $scope.expand);
		  $cookies.put('syntaxSearchString',$scope.syntaxSearchString);
	   };
	   
	   function setSearchParamsBySyntax(){
	      var syntaxValues = 	searchResultService.getParamsFromSyntax();
		  $scope.IPCode = syntaxValues.ip;
		  if($scope.IPCode == null ) {
		     $scope.IPCode = "";
		  }
		  $cookies.put('searchIPCode', $scope.IPCode);
				
		  var dateRange = syntaxValues.rcv;
		  if(dateRange != null && dateRange.length > 0) {
		     var index = dateRange.indexOf("-");
			    if( index > - 1) {
				   $scope.receivedDate = dateRange.substring( 0, index ).trim();
				   $scope.receivedEndDate = dateRange.substring(index +1 ).trim();
				   $cookies.put('searchReceivedDate', $scope.receivedDate);
				   $cookies.put('searchReceivedEndDate', $scope.receivedEndDate);
				}
				else {
				   $scope.receivedDate = dateRange;
				   $cookies.put('searchReceivedDate', $scope.receivedDate);
				}
		  }
		  else{
		     $scope.receivedDate = "";
			 $scope.receivedEndDate="";
		  }
		  var IDvar = syntaxValues.pubid;
		  if(IDvar != null && IDvar.length > 0) {
			  $scope.IDType = 1;
			  $cookies.put('searchIDType', $scope.IDType);
			  $scope.searchID = IDvar;
			  $cookies.put('searchID', IDvar);
		  }
		  else {
			  IDvar = syntaxValues.docid;
			  if(IDvar != null && IDvar.length > 0) {
				  $scope.IDType = 2;
				  $cookies.put('searchIDType', $scope.IDType);
				  $scope.searchID = IDvar;
				  $cookies.put('searchID', IDvar);
			  }
			  else {
				  $scope.IDType = "";
				  $scope.searchID = "";
			  }
		  }
		  $scope.searchErrorMessage = syntaxValues.err;
		  if($scope.searchErrorMessage == null ) {
		     $scope.searchErrorMessage = "";
		  }
		  $cookies.put('searchErrorMessage', $scope.searchErrorMessage);
		  $cookies.put('searchErrMsgCaseSensitivity', $scope.searchErrMsgCaseSensitivity);
	   }
	   
	   $scope.doExpand = function() {
	   //if syntax string is not null, validate it and populate in parameters. 
	      invalidSyntaxFlag = false;
		  if( $scope.syntaxSearchString != null && $scope.syntaxSearchString.length > 0) {
		     var validSyntax = searchResultService.validateSyntax($scope.partners, $scope.syntaxSearchString);
			 if( validSyntax ) {
			    $scope.invalidSyntaxFlag = false;
				setSearchParamsBySyntax();
				$scope.collapse = true;
				$scope.expand = false;
		     }
			 
			 
			 else {
			    $scope.invalidSyntaxFlag = true;
			 }
		  }
		  else {
		     $scope.cleanSearchParams();
			 $scope.collapse = true;
			 $scope.expand = false;
			 $scope.invalidSyntaxFlag = false;
		  }

		  $cookies.putObject('collapse', $scope.collapse);
		  $cookies.putObject('expand', $scope.expand);
	  };
			
	  $scope.submit = function() {
	     $rootScope.$broadcast('$handleCleanResultMessagesEvent');
	     
	     $("#searchButton").blur();
				
		 $scope.invalidDateInputFlag = $scope.searchForm.receivedDate.$invalid ? true : false;
		 if( $scope.invalidDateInputFlag == false ) {
		    if(  !$scope.receivedDate || $scope.receivedDate == "" ) {
		       $scope.invalidDateFlag = false;
		    }
		    else {
		 	  $scope.invalidDateFlag = searchResultService.checkDate($scope.receivedDate );
		    }
		 }
		 $scope.invalidEndDateInputFlag = $scope.searchForm.receivedEndDate.$invalid ? true : false;
		 if( $scope.invalidEndDateInputFlag == false ) {
		    if(  !$scope.receivedEndDate || $scope.receivedEndDate == "" ) {
			   $scope.invalidEndDateFlag = false;
			}
			else {
			   $scope.invalidEndDateFlag = searchResultService.checkDate($scope.receivedEndDate );
			}
		 }
		 $scope.hasDateError = false;
		 if ($scope.searchForm.receivedDate.$invalid == true || $scope.invalidDateFlag == true) {
		    $scope.noSearchData = false
			$scope.noStartDate = false;
			$scope.noIDType = false;
		
			if( $scope.invalidDateFlag ) {
			   $scope.invalidDateInputFlag = true;
			   $scope.invalidDateFormatFlag = false;
			}
			else {
			   $scope.invalidDateFormatFlag = true;
			   $scope.invalidDateInputFlag = true;
			}
			$scope.hasDateError = true;
		 }
		 if ($scope.searchForm.receivedEndDate.$invalid == true || $scope.invalidEndDateFlag == true) {
		    $scope.noSearchData = false;
			$scope.noStartDate = false;
			$scope.noIDType = false;
					
			if( $scope.invalidEndDateFlag ) {
			   $scope.invalidEndDateInputFlag = true;
			   $scope.invalidEndDateFormatFlag = false;
			}
			else {
			   $scope.invalidEndDateFormatFlag = true;
			   $scope.invalidEndDateInputFlag = true;
			}
			$scope.hasDateError = true;
		 }
		 if( !$scope.hasDateError ) {
		    $scope.invalidDateInputFlag = false;
			$scope.invalidDateFormatFlag = false;
			$scope.invalidDateFlag = false;
			$scope.invalidEndDateInputFlag = false;
			$scope.invalidEndDateFormatFlag = false;
			$scope.invalidEndDateFlag = false;
			$scope.noSearchData = false;
			$scope.noStartDate = false;
			$scope.noIDType = false;

			if ((!$scope.receivedDate || $scope.receivedDate == "")
				&& (!$scope.receivedEndDate || $scope.receivedEndDate == "")
				&& (!$scope.IPCode || $scope.IPCode == "")
				&& (!$scope.searchErrorMessage || $scope.searchErrorMessage == "")) {
			   $scope.noSearchData = true;
			}
			else if ((!$scope.receivedDate || $scope.receivedDate == "")
					&& ($scope.receivedEndDate != null && $scope.receivedEndDate.length > 0 ) ) {
			   $scope.noStartDate = true;
			   $scope.invalidDateInputFlag = true;
			}
			else if ((!$scope.IDType || $scope.IDType == "")
				&& ($scope.searchID != null && $scope.searchID.length > 0)) {
				$scope.noIDType = true;
			}
			else {
			   $scope.noIDType = false;
			   if (!$scope.IPCode || $scope.IPCode == "") {
			      $cookies.put('searchIPCode', "");
			   }
			   else {
				  $cookies.put('searchIPCode', $scope.IPCode);
			   }
 			   if ($scope.receivedDate == null) {
			      $scope.receivedDate = "";
			   }
			   $cookies.put('searchReceivedDate', $scope.receivedDate);
						
			   if ($scope.receivedEndDate == null) {
			      $scope.receivedEndDate = "";
			   }
			   $cookies.put('searchReceivedEndDate', $scope.receivedEndDate);
						 
			   if ($scope.searchErrorMessage == null) {
			      $scope.searchErrorMessage = "";
			   }
			   $cookies.put('searchErrorMessage', $scope.searchErrorMessage);
						
			   if ($scope.searchErrMsgCaseSensitivity == null) {
			      $scope.searchErrMsgCaseSensitivity = false;
			   }
			   $cookies.put('searchErrMsgCaseSensitivity', $scope.searchErrMsgCaseSensitivity);
			   
			   if (!$scope.IDType || $scope.IDType == "") {
				      $scope.IDType = "";
				   }
			   $cookies.put('searchIDType', $scope.IDType);
			   
			   if ($scope.searchID == null) {
				   $scope.searchID = "";
			   }
			   $cookies.put('searchID', $scope.searchID);
			   
			   searchResultService.setSearchIPCode(null);
			   searchResultService.setSearchReceivedDate(null);
			   searchResultService.setSearchReceivedEndDate(null);
			   searchResultService.setSearchErrorMessage(null); 
			   searchResultService.setSearchErrMsgCaseSensitivity(null);
			   searchResultService.setSearchIDType(null);
			   searchResultService.setSearchID(null);
			   

			   $rootScope.refreshResultTable += 1;

			   if ($location.path() != "/search") {
			      $location.path('/search');
			   }
			}
		}
	};
			
	$scope.validateDateInput = function() {
	   $("#searchButton").blur();
	   $scope.noStartDate = false;
	   $scope.invalidDateInputFlag= $scope.searchForm.receivedDate.$invalid ? true : false;
				
	   if( $scope.invalidDateInputFlag == false ) {
	      $scope.invalidDateFormatFlag = false;
		  $scope.invalidDateFlag = searchResultService.checkDate( $scope.receivedDate );
		  if( $scope.invalidDateFlag ) {
		     $scope.invalidDateInputFlag = true;
		  }
		  else {
		     if( $scope.invalidDateInputFlag ) {
			   $scope.invalidDateFormatFlag = true;
			 }
		  }
	   }
	   else {
		  $scope.invalidDateFormatFlag = true;
		  $scope.invalidDateFlag = false;
	   }
	};
			
	$scope.validateEndDateInput = function() {
	   $("#searchButton").blur();
	   $scope.invalidEndDateInputFlag= $scope.searchForm.receivedEndDate.$invalid ? true : false;
	   if( $scope.invalidEndDateInputFlag == false ) {
	      $scope.invalidEndDateFormatFlag = false;
		  $scope.invalidEndDateFlag = searchResultService.checkDate( $scope.receivedEndDate );
		  if( $scope.invalidEndDateFlag ) {
		     $scope.invalidEndDateInputFlag = true;
		  }
		  else {
		     if( $scope.invalidEndDateInputFlag ) {
			    $scope.invalidEndDateFormatFlag = true;
			 }
		  }
	   }
	   else {
	      $scope.invalidEndDateFormatFlag = true;
		  $scope.invalidEndDateFlag = false;
	   }
	};
	$('.btn').click(function() { $(this).blur(); });
			
	$scope.cleanSearchParams = function() {
		
	  
	   $rootScope.$broadcast('$cleanSearchData');	
	   $cookies.remove('searchIPCode');
	   $cookies.remove('searchReceivedDate');
	   $cookies.remove('searchReceivedEndDate');
	   $cookies.remove('searchErrorMessage');
	   $cookies.remove('searchErrMsgCaseSensitivity');
	   $cookies.remove('searchIDType');
	   $cookies.remove('searchID');
	   $cookies.remove('syntaxSearchString');
       $cookies.remove('collapse');
       $cookies.remove('expand');

	   $scope.receivedDate = "";
	   $scope.receivedEndDate = "";
	   $scope.searchErrorMessage = "";  
	   $scope.searchErrMsgCaseSensitivity = false; 
	   $scope.IPCode="";
	   $scope.IDType="";
	   $scope.searchID="";
	   

	   propertiesService.setServiceUrlBase($scope.myVar);
		     // alert(propertiesService.getServiceUrlBase());
	         
	   
		  	 searchResultService.getProviderList().then(function(data){
			   $scope.partners = data;
		  	   });
	   
	};
	
	
	$scope.syntaxSubmit = function() {
	   $rootScope.$broadcast('$handleCleanResultMessagesEvent');
	   
	   $cookies.put('searchIPCode', "");
	   $cookies.put('searchReceivedDate', "");
	   $cookies.put('searchReceivedEndDate', "");
	   $cookies.put('searchErrorMessage', "");
	   $cookies.put('searchIDType', "");
	   $cookies.put('searchID', "");
	   if( $scope.syntaxSearchString != null && $scope.syntaxSearchString.length > 0 ) {
	      var validSyntax = searchResultService.validateSyntax($scope.partners, $scope.syntaxSearchString);
		  if( validSyntax ) {
		     $scope.invalidSyntaxFlag = false;
			 setSearchParamsBySyntax();
			 if ((!$scope.receivedDate || $scope.receivedDate == "")
				&& (!$scope.IPCode || $scope.IPCode == "")
				&& (!$scope.searchErrorMessage || $scope.searchErrorMessage == "")) {
				 $scope.noSearchData = true;
			 }
			 else {
				 $rootScope.refreshResultTable += 1;
			 }
		  }
		  else {
		     $scope.invalidSyntaxFlag = true;
		  }
	   }
    };
    
    $scope.clearNoIDType = function() {
    	if ($scope.IDType != null && ($scope.IDType == 1 || $scope.IDType == 2)) {
    		$scope.noIDType = false;
    	}
    };
    
    $scope.$on('$handleSearchEvent', function() {
 	   $scope.searchButtonText = searchResultService.getSearchButtonText();
	   $scope.isSearching = searchResultService.getIsSearching();
 	});
    

     
    
    function cleanMessages() {
       $scope.noSearchData = false;
       $scope.noStartDate = false;
       $scope.invalidDateInputFlag = false;
       $scope.invalidDateFormatFlag = false;
       $scope.invalidDateFlag = false;
       $scope.invalidEndDateInputFlag = false;
       $scope.invalidEndDateFormatFlag = false;
       $scope.invalidEndDateFlag = false;
       $scope.invalidSyntaxFlag = false;
       $scope.noIDType = false;
    };
    
    $scope.$on('$handleCleanSearchMessagesEvent', function() {
       cleanMessages();
    });
}]);   
