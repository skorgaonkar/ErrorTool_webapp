errorToolApp.controller("ReportQueryCtrl",[	'$scope','$rootScope','$location', '$http', '$cookies',	'propertiesService', 'Logger', 'dateRangeService', 'searchResultService',
   function($scope, $rootScope, $location, $http, $cookies, propertiesService, Logger, dateRangeService, searchResultService) {
      var logger = Logger.getInstance('ReportQueryController.js');
	  logger.log('(ReportQueryCtrl) begin');

	  $scope.datePattern = /\d{4}\d{2}\d{2}/;

	  if ($rootScope.refreshReportTable == null) {
	     $rootScope.refreshReportTable = 1;
	  }
							
	  loadDateRangeTemplate();

	  searchResultService.getProviderList().then(function(data){$scope.partners = data;});
	  
	  $scope.runReport = function() {
		 if( checkSearchParams() ){									
		    $("#runButton").blur();
			if ($scope.IPCode == null) {
	 		   $scope.IPCode = "";
			}
			$cookies.put('reportIPCode', $scope.IPCode);

			if ($scope.startDate == null) {
			   $scope.startDate = "";
			}
			$cookies.put('reportFromDate', $scope.startDate);

			if ($scope.endDate == null) {
			   $scope.endDate = "";
			}
			$cookies.put('reportToDate', $scope.endDate);

			$rootScope.refreshReportTable += 1;

			if ($location.path() != "/report") {
			   $location.path('/report');
			}
		 }
	  };

	  $('.btn').click(function() {
	     $(this).blur();
	  });
							
	  function loadDateRangeTemplate(){
	     dateRangeService.setDateRangeLabel("Activity on/through");
	  }
							
	  function checkSearchParams(){
	     var validateForm = true;
		 dateRangeService.checkDateRange();
		 if( !dateRangeService.hasDateError()) {
		    $scope.startDate =dateRangeService.getStartDate();
		    $scope.endDate =dateRangeService.getEndDate();
		 }
		 else{
		    validateForm = false;
		 }
		 return validateForm;
	  }
}]);
