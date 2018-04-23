errorToolApp
		.controller(
				"ReportResultCtrl",
				[
						'$scope',
						'$rootScope',
						'$http',
						'$location',
						'$cookies',
						'propertiesService',
						'Logger',
						function($scope, $rootScope, $http, $location,
								$cookies, propertiesService, Logger) {
							var logger = Logger
									.getInstance('ReportResultController.js');
							logger.log('(ReportResultCtrl) begin');

							$scope.reportServiceFailure = false;
							$scope.dateDisplay = "";
							$scope.IPDisplay = "";

							$scope.data = [];

							$scope.gridOptions = {			
								enableGridMenu: true,
								gridMenuShowHideColumns : false,	
								rowHeight : 18,
								data : 'data',

								columnDefs : [ {
									name : 'Date',
									field : 'date',
									width : '14%',
									enableColumnMenu : false, 
									type : 'string'
								}, {
									name : 'Username',
									field : 'username',
									width : '14%',
									enableColumnMenu : false, 
									type : 'string'
								}, {
									name : 'IP Code',
									field : 'provider',
									width : '14%',
									enableColumnMenu : false, 
									type : 'string'
								}, {
									name : 'Resubmitted Docs',
									field : 'numOfResubmitted',
									width : '14%',
									enableColumnMenu : false, 
									type : 'number'
								}, {
									name : 'Deleted Docs',
									field : 'numOfDeleted',
									width : '14%',
									enableColumnMenu : false, 
									type : 'number'
								}, {
									name : 'Total Docs by IP',
									field : 'totalByIP', 
									width : '14%',
									enableColumnMenu : false,
									type : 'number'
								}, {
									name : 'User Total',
									field : 'userTotal',
									width : '16%',
									enableColumnMenu : false,
									type : 'number'
								} ]
							};

							$scope.$watch(function() {
								return $rootScope.refreshReportTable;
							}, function(newValue, oldValue) {
								if ((!oldValue && oldValue != 0)
										|| (!newValue && newValue != 0)
										|| (newValue == oldValue)) {
									return;
								}
								runReport();
							});

							$('.btn-default').click(function() {
								$(this).blur();
							});

							function runReport() {								

								$scope.reportServiceFailure = false;
								var IPCode = $cookies.get('reportIPCode');
								var fromDate = $cookies.get('reportFromDate');
								var toDate = $cookies.get('reportToDate');
								$scope.dateDisplay = calculateDate(fromDate, toDate);
								$scope.IPDisplay = calculateIP(IPCode, fromDate);

								var queryData = {
									"username" : "ALL",
									"provider" : IPCode,
									"startTime" : fromDate,
									"endTime" : toDate
								};

								logger
										.log('(ReportResultCtrl) before service call for report');

								var getJson = $http({
									method : 'POST',
									data : queryData,
									url : propertiesService.getServiceUrlBase()
											+ "ActivityLog/Report",
									headers : {
										'Content-Type' : 'application/json'
									}
								});

								getJson.then(function (response){
								  	var data = response.data;
											logger
													.log('(ReportResultCtrl) after service call for report - success');											
											if (!data || !data.statusCode) {
												$scope.reportServiceFailure = true;
											} else {											
												if (data.statusCode > 0) {
													$scope.reportServiceFailure = true;
												} else {
													$scope.reportServiceFailure = false;
													$scope.data = data.activityReportData;		
													angular
													.forEach(
															$scope.data,
															function(
																	value,
																	key) {
																$scope.data[key].date = $scope.dateDisplay;
															});
												}
											}
										});
							}
							;
							
							function calculateDate(myFromDate, myToDate) {
								if(myFromDate == "") return "";
								if(myToDate == "") return myFromDate;
								return "" + myFromDate + " - " + myToDate;
								
							}
							
							function calculateIP(myIPCode, myFromDate) {
								var text = "";
								if(myIPCode == "") {
									text = "All Providers";
								} else {
									text = myIPCode;
								}
								
								if(myFromDate == "") {
									return text;
								} else {
									return "" + text + " - ";
								}
							}

						} ]);