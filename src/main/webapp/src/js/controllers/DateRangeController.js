errorToolApp.controller("DateRangeCtrl", ['$scope', 'dateRangeService', function($scope, dateRangeService) {
   $scope.noStartDate = false;
   $scope.datePattern = /\d{4}\d{2}\d{2}/;
   $scope.invalidDateInputFlag = false;
   $scope.invalidDateFormatFlag = false;
   $scope.invalidDateFlag = false;
   $scope.invalidEndDateInputFlag = false;
   $scope.invalidEndDateFormatFlag = false;
   $scope.invalidEndDateFlag = false;
	   
   $scope.dateRangeLabel = dateRangeService.getDateRangeLabel();
	
   $scope.$on('$handleCheckDateRangeEvent', function() {
      checkDateRange();
   });
	 
   function checkDateRange() {
	  var hasDateError = false;
      $scope.invalidDateInputFlag = $scope.dateRangeForm.startDate.$invalid ? true : false;
	  if( $scope.invalidDateInputFlag == false ) {
		 if(  !$scope.startDate || $scope.startDate == "" ) {
		    $scope.invalidDateFlag = false;
		 }
		 else {
		    $scope.invalidDateFlag = dateRangeService.checkDate($scope.startDate );
		 }
	  }
		  
	  $scope.invalidEndDateInputFlag = $scope.dateRangeForm.endDate.$invalid ? true : false;
	  if( $scope.invalidEndDateInputFlag == false ) {
	     if(  !$scope.endDate || $scope.endDate == "" ) {
		    $scope.invalidEndDateFlag = false;
		 }
		 else {
		    $scope.invalidEndDateFlag = dateRangeService.checkDate($scope.endDate );
		 }
	  }
	
	  $scope.noStartDate = false;
	  if ($scope.dateRangeForm.startDate.$invalid == true || $scope.invalidDateFlag == true) {
	     if( $scope.invalidDateFlag ) {
	 	    $scope.invalidDateInputFlag = true;
			$scope.invalidDateFormatFlag = false;
		 }
		 else {
			$scope.invalidDateFormatFlag = true;
			$scope.invalidDateInputFlag = true;
		 }
		 hasDateError = true;
	  }

	  if ($scope.dateRangeForm.endDate.$invalid == true || $scope.invalidEndDateFlag == true) {
	     if( $scope.invalidEndDateFlag ) {
		   $scope.invalidEndDateInputFlag = true;
		   $scope.invalidEndDateFormatFlag = false;
		 }
		 else {
		   $scope.invalidEndDateFormatFlag = true;
		   $scope.invalidEndDateInputFlag = true;
		 }
		 hasDateError = true;
	  }
	  
	  if( !hasDateError ) {
	     $scope.invalidDateInputFlag = false;
		 $scope.invalidDateFormatFlag = false;
		 $scope.invalidDateFlag = false;
		 $scope.invalidEndDateInputFlag = false;
		 $scope.invalidEndDateFormatFlag = false;
		 $scope.invalidEndDateFlag = false;
		 $scope.noStartDate = false;
		
		 if ((!$scope.startDate || $scope.startDate == "")
		   && ($scope.endDate != null && $scope.endDate.length > 0 ) ) {
		    $scope.noStartDate = true;
			$scope.invalidDateInputFlag = true;
			hasDateError = true; 
		 }
		 else {
 		    if ($scope.startDate == null) {
			   $scope.startDate = "";
			}
			dateRangeService.setStartDate($scope.startDate);
						
			if ($scope.endDate == null) {
			   $scope.endDate = "";
			}
			dateRangeService.setEndDate($scope.endDate);
		 }
	  }
	  dateRangeService.setDateError(hasDateError);
   };
	   
   $scope.validateStartDateInput = function() {
      $scope.noStartDate = false;
	  $scope.invalidDateInputFlag=  $scope.dateRangeForm.startDate.$invalid ? true : false;
	  if( $scope.invalidDateInputFlag == false ) {
	     $scope.invalidDateFormatFlag = false;
		 $scope.invalidDateFlag = dateRangeService.checkDate( $scope.startDate );
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
      $scope.invalidEndDateInputFlag= $scope.dateRangeForm.endDate.$invalid ? true : false;
	  if( $scope.invalidEndDateInputFlag == false ) {
	     $scope.invalidEndDateFormatFlag = false;
		 $scope.invalidEndDateFlag = dateRangeService.checkDate( $scope.endDate );
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
}]);