errorToolApp.controller("ResultCtrl", ['$scope','$rootScope','$http','$location','$cookies','$interval','$timeout'
                                      ,'$filter','selectedDocumentService','searchResultService','propertiesService'
                                      ,'uiGridConstants','Logger','vendorService','replaceService','$q', 'ModalService',
   function($scope, $rootScope, $http, $location, $cookies, $interval, $timeout, $filter, selectedDocumentService
		   ,searchResultService,propertiesService, uiGridConstants, Logger,	vendorService, replaceService, $q, ModalService) {
      var logger = Logger.getInstance('ResultController.js');
	  logger.log('(ResultCtrl) begin');
	  var canceler = $q.defer();
	  var selectedPartners = [];
	  var docsSelectedList = [];
	  var actionFromDocView = false; 
	  
	  $scope.sortByField = 'errorMessage';
	  $scope.sortByFieldTxt = 'Error Message';
	  $scope.sortOrderTxt = 'Ascending';
	  $scope.noResult = false;
	  $scope.noDocs = false;
	  $scope.totalOfErrors = 0;
	  $scope.resubmitSuccess = false;
	  $scope.resubmitFailure = false;
	  $scope.rollbackSuccess = false;
	  $scope.rollbackFailure = false;
	  $scope.deleteSuccess = false;
	  $scope.deleteFailure = false;
	  $scope.returnToVendorSuccess = false;
	  $scope.returnToVendorFailure = false;
	  $scope.blurDeleteButton = false;
	  $scope.blurReturnToVendorButton = false;
	  $scope.searchServiceFailure = false;
	  $scope.disableBtn = true;
	  $scope.hideVendorBtn = true;
	  $scope.disableVendorBtn = false;
	  $scope.mixVendors = false;
	  $scope.state = {};
	  $scope.data = [];
	  $scope.hideNoDocs = false;
	  $scope.searchTimeout = false;
	  
	  if ($rootScope.previousURL == undefined) {
		  $rootScope.previousURL = '';
	  }
	  
	  $scope.$on('$locationChangeSuccess',function(evt, absNewUrl, absOldUrl) {
		  $rootScope.previousURL = absNewUrl;
		});
	  
	  $scope.hasCommit = false;
	  $scope.commitSuccess = replaceService.getShowCommitMessage();
	  if ($scope.commitSuccess) {
	     $scope.requestLength = replaceService.getDocsModified();
	  }
	  
	  $scope.gridOptions = { enableFiltering: true,
			  				 enablePaginationControls : true,
							 enableRowSelection : true,
							 enableRowHeaderSelection : false,
							 enableSelectAll : false,
							 enableGridMenu : true,
							 exporterCsvFilename: 'Opti_ErrorTool_Results.csv',
							 exporterPdfDefaultStyle: {fontSize: 9},
							 exporterPdfPageSize: 'LEGAL',
							 exporterPdfMaxGridWidth: 800,
							 gridMenuShowHideColumns : true,
							 rowHeight : 18,
							 data : 'data',
							 paginationPageSizes : [ 300, 1000, 2000, 3000,	5000 ],
							 paginationPageSize : 3000,
							 multiSelect : true,    
							 modifierKeysToMultiSelect : true,
							 columnDefs : [{name : 'Provider', 
								            field : 'partnerName',
								            width : '5%',
									        enableColumnMenu : true,
									        type : 'string',
									        allowCellFocus : false
								         },{name : 'Orig Rcv Date',
									        field : 'time',
									        width : '8%',
									        enableColumnMenu : true,
									        type : 'string',
									        allowCellFocus : false
								         },{name : 'Orig Event',
									        field : 'originalEventId',
									        width : '5%',
									        enableColumnMenu : true,
									        type : 'string',
									        allowCellFocus : false
								         },{name : 'Curr Event',
									        field : 'eventId',
									        width : '5%',
									        enableColumnMenu : true,
									        type : 'string',
									        allowCellFocus : false
								         },{name : 'Error Message',
									        field : 'errorMessage',
									        width : '25%',
									        enableColumnMenu : true,
									        cellTooltip : true,
									        allowCellFocus : false,
									        type : 'string',
							 sort : { // set default sorting
										direction : uiGridConstants.ASC,
									}
								}, {
			                  name : 'Orig Filename',
			                  field : 'origRawFileName',
			                  width : '10%',
			                  enableColumnMenu : true,
			                  type : 'string',
			                  allowCellFocus : false
								}, {
									name : 'Raw Filename',
									field : 'rawFileName',
									width : '13%',
									enableColumnMenu : true,
									type : 'string',
									allowCellFocus : false
								}, {
									name : 'Locked',
									field : 'lockedUsername',
									width : '5%',
									enableColumnMenu : true,
									type : 'string',
									allowCellFocus : false
								}, {
									name : 'Chosen',
									field : 'fileChoice',
									width : '3%',
									enableColumnMenu : true,
									type : 'string',
									allowCellFocus : false
								}, {
									name : 'RAW',
									field : 'RAWModified',
									width : '3%',
									enableColumnMenu : true,
									type : 'string',
									allowCellFocus : false
								}, {
									name : 'INT',
									field : 'INTModified',
									width : '3%',
									enableColumnMenu : true,
									type : 'string',
									allowCellFocus : false
								},	{
									name : 'Source Name',
									field : 'publicationTitle',
									width : '10%',
									enableColumnMenu : true,
									type : 'string',
									allowCellFocus : false
								},	{
									name : 'Src Code',
									field : 'sourceCode',
									width : '5%',
									enableColumnMenu : true,
									type : 'string',
									allowCellFocus : false
								},	{
									name : 'Pub Id',
									field : 'fullPubId',
									width : '5%',
									enableColumnMenu : true,
									type : 'string',
									allowCellFocus : false
                        }, {
									name : 'Doc Id',
									field : 'docId',
									width : '5%',
									enableColumnMenu : true,
									type : 'string',
									allowCellFocus : false
								} ]
							};							

      $scope.$watch(function() { return $rootScope.refreshResultTable;},
	     function(newValue, oldValue) {
		    if ((!oldValue && oldValue != 0) || (!newValue && newValue != 0) || (newValue == oldValue)) {
			   if ($rootScope.deleteEvents != null) {
			     actionFromDocView = true;
			     $scope.hideNoDocs = true;
				  $scope.deleteSuccess = true;
				  $scope.cleanDocument($rootScope.deleteEvents);
				  $rootScope.deleteEvents = null;
			   }
			   if ($rootScope.resubmitEvents != null) {
			     actionFromDocView = true;
				  $scope.hideNoDocs = true;
				  $scope.resubmitSuccess = true;
				  $scope.cleanDocument($rootScope.resubmitEvents);
				  $rootScope.resubmitEvents = null;
			   }
			   if ($rootScope.returnToVendorEvents != null) {
			     actionFromDocView = true;
			     $scope.hideNoDocs = true;
				  $scope.returnToVendorSuccess = true;
				  $scope.cleanDocument($rootScope.returnToVendorEvents);
				  $rootScope.returnToVendorEvents = null;
			   }
			   return;
	     }
	     // close all documents
	     closeDocuments();
	     doSearch();
	  });

      $scope.$on("$destroy", function() {
	     var gridState = null;
	     if ($scope.gridApi) {
	        gridState = $scope.gridApi.saveState.save();
		    searchResultService.setGridState(gridState);
	     }
	     else {
		    searchResultService.setGridState(null);
	     }
	  });
      
      
	  var updateSelected = function(action, id, partnerName, originalEventId) {
	     if ($scope.noDocs) {
		    $scope.noDocs = false;
		 }
	     
	    var selectedDoc =  {"eventId" : id,
                           "originalEventId" : originalEventId,
                           "partnerName"   : partnerName
                          }; 
	    
		 if (action === 'add' && $scope.selected.indexOf(id) === -1) {
		    $scope.selected.push(id);
		    docsSelectedList.push(selectedDoc);
		    
		    $scope.disableBtn = false;
			
			 if (!$scope.hideVendorBtn && $scope.mixVendors) {
			    selectedPartners.push(partnerName);	 
			 }
		 }
		 if (action === 'remove' && $scope.selected.indexOf(id) !== -1) {
			$scope.selected.splice($scope.selected.indexOf(id), 1);
			docsSelectedList.splice(docsSelectedList.indexOf(selectedDoc), 1);
			
			if ($scope.selected.length == 0) {
			   $scope.disableBtn = true;
			}
			if (!$scope.hideVendorBtn && $scope.mixVendors) {
			   selectedPartners.splice(selectedPartners.indexOf(partnerName), 1);	 
			}
		 }
		 selectedDocumentService.setSelectedDocIds($scope.selected);
	  };

	  $scope.gridOptions.onRegisterApi = function(gridApi) {
	     $scope.gridApi = gridApi;
	     gridApi.selection.on.rowSelectionChanged( $scope,	function(row) {
		   var action = 'remove';
			if (row.isSelected) {
			   action = 'add';
			   // clear error message
			   $scope.noResult = false;
			   $scope.noDocs = false;
			   if( !actionFromDocView ){
			      cleanActionMessages();
			   }
			   $scope.searchServiceFailure = false;
			}
			updateSelected(action, row.entity.eventId, row.entity.partnerName, row.entity.originalEventId);
	     });

	     gridApi.selection.on.rowSelectionChangedBatch( $scope, function(rows) {
	        var addFlag = false;
		    for (var i = 0; i < rows.length; i++) {
			   var row = rows[i];
			   var action = 'remove';
			   if (row.isSelected) {
			      addFlag = true;
				  action = 'add';
			   }
			   updateSelected(action, row.entity.eventId, row.entity.partnerName, row.entity.originalEventId);
			}
			if (addFlag) {
			   // clear error message
			   $scope.noResult = false;
			   $scope.noDocs = false;
			   cleanActionMessages();
			   $scope.searchServiceFailure = false;
			}
			if(actionFromDocView){
	         actionFromDocView = false;
	      }
	     });

		// pagination
		 gridApi.pagination.on.paginationChanged( $scope, function(currentPage, pageSize) {
		    $scope.saveState('pageSize', pageSize);
			$(".ui-grid-viewport").scrollTop(0);
		 });
	  };

	  $scope.saveState = function(name, value) {
	     if (!$scope.state){
		    $scope.state = {};
	     }
		 $scope.state[name] = value;
		 searchResultService.setTableState($scope.state);
	  };

	  var selectedLocal = [];
	  var stateLocal = {};
	  var restoreGridState = function() {
	     if ($scope.commitSuccess) {
		    $scope.hasCommit = true;
		 }
 		 $scope.selected = selectedDocumentService.getSelectedDocIds();
		 selectedLocal = angular.copy($scope.selected);
		 if (selectedLocal.length > 0) {
		    $scope.disableBtn = false;
		 }

		 stateLocal = angular.copy(searchResultService.getTableState());

		 if ($scope.gridApi) {
		    var gridState = searchResultService.getGridState();
			if (gridState) {
			   $scope.gridApi.saveState.restore($scope, gridState);
			}
			restoreOtherState();
		 }

		 if ($scope.hasCommit) {
		    $scope.hasCommit = false;
		 }
	  };

	  var restoreOtherState = function() {
	     if ($scope.gridApi) {
		    $scope.gridApi.selection.clearSelectedRows();
			$scope.selected = [];
			selectedDocumentService.setSelectedDocIds($scope.selected);
			docsSelectedList = [];
			
			if (selectedLocal) {
			   for (var i = 0; i < selectedLocal.length; i++) {
			      var entity = $filter('filter')($scope.data,{eventId : selectedLocal[i]})[0];
				  $scope.gridApi.selection.selectRow(entity);
			   }
			}

			if (stateLocal && stateLocal['pageSize']) {
			   $scope.gridOptions.paginationPageSize = stateLocal['pageSize'];
			}

			$scope.state = angular.copy(stateLocal);
			searchResultService.setTableState($scope.state);
			$scope.gridApi.grid.buildColumns();
			$scope.gridApi.grid.refresh();
		 }
	  };

	  $scope.$parent.IPCode = $cookies.get('searchIPCode');
	  $scope.$parent.receivedDate = $cookies.get('searchReceivedDate');
	  $scope.$parent.receivedEndDate = $cookies.get('searchReceivedEndDate');
	  $scope.$parent.searchErrorMessage = $cookies.get('searchErrorMessage');
	  $scope.$parent.searchErrMsgCaseSensitivity = $cookies.get('searchErrMsgCaseSensitivity');
	  $scope.$parent.searchID = $cookies.get('searchID');
	  $scope.$parent.IDType = $cookies.get('searchIDType');
	  
	  if (($rootScope.previousURL.includes("/docview")) || ($rootScope.previousURL.includes("/replace")) || ($rootScope.previousURL.includes("/report"))) {
		  if ((searchResultService.getSearchIPCode() == null && $cookies.get('searchIPCode') != null)
		   || (searchResultService.getSearchReceivedDate() == null && $cookies.get('searchReceivedDate') != null)
		   || (searchResultService.getSearchReceivedEndDate() == null && $cookies.get('searchReceivedEndDate') != null)
		   || (searchResultService.getSearchErrorMessage() == null && $cookies.get('searchErrorMessage') != null)
		   || (searchResultService.getSearchErrMsgCaseSensitivity() == null && $cookies.get('searchErrMsgCaseSensitivity') != null)
		   || (searchResultService.getSearchID() == null && $cookies.get('searchID') != null)
		   || (searchResultService.getSearchIDType() == null && $cookies.get('searchIDType') != null)) {
	
		     searchResultService.setSearchAction(true, 'Searching');
		 	 //wait up to 15 minutes and 5 seconds for results, then stop search and display timeout alert
			 var timerPromise = $timeout(function () {
		 	    if (searchResultService.getIsSearching() == true) {
		 		   logger.log('(ResultCtrl) after service call for search - timeout occured');
		 		   $scope.searchTimeout = true;
		 		   searchResultService.setSearchAction(false, 'Search');canceler.resolve();
		 		}
		 	 }, 905000);
	
			 var pubIDValue = "";
			 var docIDValue = "";
			 if ($cookies.get('searchIDType') == 1) {
			    pubIDValue = $cookies.get('searchID');
			 } else if ($cookies.get('searchIDType') == 2) {
			    docIDValue = $cookies.get('searchID');
			 }
			 if ($cookies.get('searchErrMsgCaseSensitivity') == null) {
			    $cookies.put('searchErrMsgCaseSensitivity',false);
			 }
			 
			 var queryData = { "IPCode" : $cookies.get('searchIPCode'),
							       "receivedDate" : $cookies.get('searchReceivedDate'),
							       "receivedEndDate" : $cookies.get('searchReceivedEndDate'),
							       "errMessage" : $cookies.get('searchErrorMessage'),
							       "errMsgCaseSensitivity" : $cookies.get('searchErrMsgCaseSensitivity').toString(),
							       "legacyPlatform" : "ALL",
							       "pubId" : pubIDValue,
							       "docId" : docIDValue,
							   	 "userName" : $cookies.get('userName')
							 };
	
			 logger.log('(ResultCtrl) before service call for search');
	
			 var getJson = $http({ method : 'POST',
								   data : queryData,
								   timeout: canceler.promise,
								   url : propertiesService.getServiceUrlBase() + "ErrorData/Search",
								   headers : { 'Content-Type' : 'application/json' }
								 });
	
			 getJson.then(function (response){
				var data = response.data;
			    logger.log('(ResultCtrl) after service call for search - success');
				var selectedDoc = selectedDocumentService.getSelectedDoc();
				if (selectedDoc != null) {
				   selectedDocumentService.setSelectedDoc(null);
				}
				searchResultService.setSearchIPCode($cookies.get('searchIPCode'));
				searchResultService.setSearchReceivedDate($cookies.get('searchReceivedDate'));
				searchResultService.setSearchReceivedEndDate($cookies.get('searchReceivedEndDate'));
				searchResultService.setSearchErrorMessage($cookies.get('searchErrorMessage'));
				searchResultService.setSearchErrMsgCaseSensitivity($cookies.get('searchErrMsgCaseSensitivity'));
				searchResultService.setSearchIDType($cookies.get('searchIDType'));
				searchResultService.setSearchID($cookies.get('searchID'));
	
				searchResultService.setSearchAction(false, 'Search');
				$timeout.cancel(timerPromise);
	
				if (!data || !data.statusCode) {
				   $scope.searchServiceFailure = true;
				} else {
				   if (data.statusCode > 0) {
					  $scope.searchServiceFailure = true;
				   } else {
					  $scope.searchServiceFailure = false;
					  searchResultService.setErrorEvents(data.errorData, true);
				   }
				}
			 },function (response){
				$scope.searchStatus = response.status;
				$scope.searchError = response.data;
			    logger.log('(ResultCtrl) after service call for search - error: ' + $scope.searchError + $scope.searchStatus);
			 });
		  } else {
		     loadErrorEvents();
			 $interval(function() { restoreGridState(); }, 0, 1);
		  }
}
	  $scope.clearSelections = function() {
	     $scope.noDocs = false;
		 $scope.gridApi.selection.clearSelectedRows();
	  };
      
	  $scope.clickMore = function() {
	     if (!$scope.hideVendorBtn && $scope.mixVendors) {
	        $scope.disableVendorBtn = true;
	    	    
	    	var seen ={};
	    	var uniqueSelectedPartners = selectedPartners.filter(function(partnerName){
	    	   if(seen.hasOwnProperty(partnerName)){
	    	      return false;
	    	   }else{
	    	      seen[partnerName] = true;
	    	      return true;
	    	   }
	    	});
	    	for( var i = 0; i < uniqueSelectedPartners.length; i++ ){
	    	   if (vendorService.isEligible(uniqueSelectedPartners[i])){
	    	      $scope.disableVendorBtn = false;
	    		  break;
	    	   }
	    	} 
	 	 }
	  };
	      
	  $scope.resubmit = function() {
	    $rootScope.$broadcast('$handleCleanSearchMessagesEvent');
	    $scope.hideNoDocs = false;
		 if ($scope.noDocs) {
		    $scope.noDocs = false;
		 }
		 var docDataList = [];
		 var resubmitEvents = [];
		 for (var i = 0; i < $scope.selected.length; i++) {
		   var errorData = $filter('filter')($scope.data, {eventId : $scope.selected[i]})[0];
		   var fileChoice = "";
			var rawFileName = "";
			var intFileName = "";
			if (angular.isUndefined(errorData.fileChoice)) {
			   fileChoice = "NONE";
			   rawFileName = errorData.rawFileName;
			} else {
			   fileChoice = errorData.fileChoice;
			}

			if (fileChoice == "RAW") {
			   rawFileName = errorData.selectedFileName;
			} else if (fileChoice == "INT") {
			   intFileName = errorData.selectedFileName;
			}

			resubmitEvents.push(errorData.eventId);
			var docData = { "workingDirectory" : errorData.workingDirectory,
			  			       "rawFileName" : rawFileName,
						       "intFileName" : intFileName,
							    "fileChoice" : fileChoice,
							    "docContent" : "NULL",
							    "eventId" : errorData.eventId,
							    "originalEventId" : errorData.originalEventId,
							    "partnerName" : errorData.partnerName,
							    "profileId" : errorData.profileId,
						      };
			docDataList.push(docData);
		 }
		 var resubmitDoc = { "docData" : docDataList,
							 "userName" : $cookies.get('userName')
						   };

		 logger.log('(ResultCtrl) before service call for resubmit');

		 var doResubmit = $http({ method : 'POST',
								        data : resubmitDoc,
								        url : propertiesService.getServiceUrlBase() + "Doc/Resubmit",
								        headers : { 'Content-Type' : 'application/json' }
							        });

		 cleanActionMessages();
		 $scope.resubmitSuccess = true;
		 $scope.cleanDocument(resubmitEvents);

		 doResubmit.then(function (response){
			  	var data = response.data;
		 },function (response){
				logger.log('(ResultCtrl) after service call for resubmit - error');
				$scope.resubmitFailure = true;
				$scope.resubmitSuccess = false;
		 });
	  };
	  
	  $scope.confirmResubmitOriginalFile = function() {
			ModalService.showModal({
				templateUrl : 'templates/docResubmitOriginalFileWarning.html',
				controller : "ModalCtrl"
			}).then(function(modal) {
				modal.element.modal();
				modal.scope.noOfDocs = $scope.selected.length;
				modal.scope.resubmitOriginalFile = function(result) {
						resubmitFile(result);
				};
			});
	};
	  
	  $scope.resubmitRAW = function(fileChoice) {
			resubmitFile(fileChoice);
		}

	  function resubmitFile(fileChoice) {
	    $rootScope.$broadcast('$handleCleanSearchMessagesEvent');
	    $scope.hideNoDocs = false;
		 if ($scope.noDocs) {
		    $scope.noDocs = false;
		 }
		 var docDataList = [];
		 var resubmitEvents = [];
		 for (var i = 0; i < $scope.selected.length; i++) {
		   var errorData = $filter('filter')( $scope.data, {eventId : $scope.selected[i] })[0];
			resubmitEvents.push(errorData.eventId);
			var docData = { "workingDirectory" : errorData.workingDirectory,
							    "rawFileName" : errorData.rawFileName,
							    "intFileName" : "",
							    "fileChoice" : fileChoice,
							    "docContent" : "NULL",
							    "eventId" : errorData.eventId,
							    "originalEventId" : errorData.originalEventId,
							    "partnerName" : errorData.partnerName,
							    "profileId" : errorData.profileId,
						     };
			docDataList.push(docData);
		 }

		 var resubmitDoc = { "docData" : docDataList,
							 "userName" : $cookies.get('userName')
						   };

		 logger.log('(ResultCtrl) before service call for resubmit RAW');

		 var doResubmit = $http({ method : 'POST',
								  data : resubmitDoc,
								  url : propertiesService.getServiceUrlBase() + "Doc/Resubmit",
								  headers : { 'Content-Type' : 'application/json' }
								});

		 cleanActionMessages();
		 $scope.resubmitSuccess = true;
		 $scope.cleanDocument(resubmitEvents);

		 doResubmit.then(function (response){
			  	var data = response.data;
		 },function (response){
				logger.log('(ResultCtrl) after service call for resubmit RAW - error');
				$scope.resubmitFailure = true;
				$scope.resubmitSuccess = false;
		 });
	  };

	  $scope.bulkRollback = function(fileFormat) {
	    $rootScope.$broadcast('$handleCleanSearchMessagesEvent');
	    $scope.hideNoDocs = false;
		 if ($scope.noDocs) {
		    $scope.noDocs = false;
		 }
		 var docDataList = [];								
		 for (var i = 0; i < $scope.selected.length; i++) {
		   var errorData = $filter('filter')( $scope.data, {eventId : $scope.selected[i]})[0];
		   var docData = { "workingDirectory" : errorData.workingDirectory,
						       "rawFileName" : errorData.rawFileName,
						       "eventId" : errorData.eventId,
						       "originalEventId" : errorData.originalEventId
						     };
		   docDataList.push(docData);
		 }

		 var rollbackQuery = { "selectedDocs" : docDataList,
							        "userName" : $cookies.get('userName'),
							        "fileFormat" : fileFormat   
							      };

		 logger.log('(ResultCtrl) before service call for bulk rollback ' + fileFormat);

		 var doRollback = $http({ method : 'POST',
								  data : rollbackQuery,
								  url : propertiesService.getServiceUrlBase() + "Doc/BulkRollBack",
								  headers : { 'Content-Type' : 'application/json' }});

		 cleanActionMessages();
		 $scope.rollbackSuccess = true; 
		 $scope.requestLength = $scope.selected.length;							

		 doRollback.then(function (response){
			  	var data = response.data;
		 },function (response){
		    logger.log('(ResultCtrl) after service call for bulk rollback ' + fileFormat + ' - error');
			$scope.rollbackFailure = true;
			$scope.rollbackSuccess = false;
		 });

		 doRollback.then(function (response){
			  	var data = response.data;
		    logger.log('(ResultCtrl) after service call for bulk rollback ' + fileFormat + ' - success');
			$scope.rollbackFailure = false;
											
			var statusCode = data.statusCode;
			var updatedEvents = data.updatedEvents;
			var skippedEventIds = data.skippedEventIds;
			var updatedEventIds = [];
			var totalEventsCount = 0;
			
			logger.log('(ResultCtrl) service call for bulk rollback ' + fileFormat + ' - statusCode=' + statusCode);

			if (statusCode == 0) {	
			   var fieldName = 'RAWModified';
			   if(fileFormat=='INT'){
			      fieldName = 'INTModified';
			   }
			   for( var i = 0; i < updatedEvents.length; i++){
			      updatedEventIds.push(updatedEvents[i].eventId);
			   }
			   totalEventsCount = updatedEventIds.length + skippedEventIds.length;
			   
			   logger.log( '(ResultCtrl) service call for bulk rollback ' +  ' - totalEventsCount=' + totalEventsCount);
			   
			   if( totalEventsCount > 0 ){
			      var count = 0;
			      for (var i = 0; i < $scope.data.length; i++) {
			         var errorEvent = $scope.data[i];
			         var eventIndex =  updatedEventIds.indexOf(errorEvent.eventId);
			     
				      if (eventIndex > -1) {
				         $scope.data[i].fileChoice = fileFormat;  
					      $scope.data[i][fieldName] = "N";
					      $scope.data[i].selectedFileName = updatedEvents[eventIndex].fileName;
					      $scope.data[i].lockedUsername = $cookies.get('userName');
					      count++;
				      }

				      if (skippedEventIds.indexOf(errorEvent.eventId) > -1) {
				         $scope.data[i].lockedUsername = $cookies.get('userName');
				         count++;
				      }
				      
				      //break from events data loop after updated all selected events, it improves the updates performance
				      if(count == totalEventsCount){
				         break;
				      }
			      }
			   }
				searchResultService.setErrorEvents($scope.data,	false);
			}
		 });
	  };

	  $scope.deleteDocument = function() {
	    $rootScope.$broadcast('$handleCleanSearchMessagesEvent');
	    $scope.hideNoDocs = false;
		 if ($scope.noDocs) {
		    $scope.noDocs = false;
		 }
		 var deleteEvents = [];
		 for (var i = 0; i < $scope.selected.length; i++) {	 
	       deleteEvents.push($scope.selected[i]);
		 }
		 
		 var deleteDoc = { "errorData" : docsSelectedList,
						   "userName" : $cookies.get('userName')
						 };

		 logger.log('(ResultCtrl) before service call for delete');

		 var doDelete = $http({ method : 'POST',
								data : deleteDoc,
								url : propertiesService.getServiceUrlBase()	+ "Doc/Delete",
								headers : {	'Content-Type' : 'application/json' }
		                     });

		 $("#deleteButton").blur();
		 cleanActionMessages();
		 $scope.deleteSuccess = true;
		 $scope.cleanDocument(deleteEvents);
		 doDelete.then(function (response){
			  	var data = response.data;
		 },function (response){
		    logger.log('(ResultCtrl) after service call for delete - error');
			$("#deleteButton").blur();
			$scope.deleteFailure = true;
			$scope.deleteSuccess = false;
		 });
	  };

	  $scope.returnToVendorDocument = function() {
	    $rootScope.$broadcast('$handleCleanSearchMessagesEvent');
	    $scope.hideNoDocs = false;
		 if ($scope.noDocs) {
		    $scope.noDocs = false;
		 }
		 var errorDataList = [];
		 var returnToVendorEvents = [];
		 for (var i = 0; i < $scope.selected.length; i++) {
		    var errorData = $filter('filter')( $scope.data, { eventId : $scope.selected[i] })[0];
			returnToVendorEvents.push(errorData.eventId);
		    errorDataList.push(errorData);
		 }
		 var returnToVendorDoc = { "errorData" : errorDataList,
								         "userName" : $cookies.get('userName'),
								         "userEmailAddress": $cookies.get('userEmailAddress')
								       };

		 logger.log('(ResultCtrl) before service call for return-to-vendor');

		 var doReturnToVendor = $http({ method : 'POST',
									    data : returnToVendorDoc,
									    url : propertiesService.getServiceUrlBase()	+ "Doc/ReturnToVendor",
									    headers : { 'Content-Type' : 'application/json' }
								     });

		 $("#returnToVendorButton").blur();
		 cleanActionMessages();
		 $scope.returnToVendorSuccess = true;
		 $scope.cleanDocument(returnToVendorEvents);

		 doReturnToVendor.then(function (response){
			  	var data = response.data;
		 },function (response){
		    logger.log('(ResultCtrl) after service call for return-to-vendor - error');
		    $("#returnToVendorButton").blur();
		    $scope.returnToVendorFailure = true;
		    $scope.returnToVendorSuccess = false;
	     });
	  };

	  $scope.cleanDocument = function(eventIds) {
	    $rootScope.$broadcast('$handleCleanSearchMessagesEvent');
	    if (eventIds != null) {
		    $scope.requestLength = eventIds.length;
		 }
		 selectedDocumentService.setSelectedDoc(null);
		 if (eventIds != null && eventIds.length > 0) {
		    if( $scope.selected != null && $scope.selected.length > 0 ){
		       for (var i = 0; i < eventIds.length; i++) {
			       var index = $scope.selected.indexOf(eventIds[i]);
			       if (index > -1) {
			         $scope.selected.splice(index, 1);
			       }
			    }
		    }
		    if ($scope.selected == null || $scope.selected.length == 0) {
		       $scope.disableBtn = true;
		    }
	     }

	     $scope.gridApi.selection.clearSelectedRows();
	     
	     var count = 0;
	     for (var i = 0; i < $scope.data.length; i++) {
	       var errorEvent = $scope.data[i];
		    if (eventIds.indexOf(errorEvent.eventId) > -1) {
		       $scope.data.splice(i, 1);
			    i--;
			    count++;
			    //break from loop after removed all selected events
			    if(count == eventIds.length){
			       break;
			    }
		    }
	     }
	     $scope.totalOfErrors = $scope.data.length;

	     // close the document if it was open.
	     var curDocIndex = selectedDocumentService.getCurDocIndex();
	     var lockedDocs = selectedDocumentService.getSelectedDocs();
	     if (lockedDocs != null && lockedDocs.length > 0) {
		    for (var i = 0; i < eventIds.length; i++) {
		       for (var j = 0; j < lockedDocs.length; j++) {
			      if (eventIds[i] == lockedDocs[j].eventId) {
			         lockedDocs.splice(j, 1);
			      }
			   }
		    }
		    selectedDocumentService.setSelectedDocs(lockedDocs);
		    selectedDocumentService.setTotalDocs(lockedDocs.length);
		    if (lockedDocs.length > 0) {
		       if (curDocIndex > lockedDocs.length) {
			      selectedDocumentService.setCurDocIndex(lockedDocs.length);
			   }
		    } else {
			   selectedDocumentService.setCurDocIndex(0);
		    }
	     }
      };

	  $scope.viewDocument = function() {
	    $rootScope.$broadcast('$handleCleanSearchMessagesEvent');
	    cleanActionMessages();

		 var userName = $cookies.get('userName');
		 var lockData = { "eventIds" : $scope.selected,
						  "userName" : userName
					    };

		 logger.log('(ResultCtrl) before service call for lock');

		 var doLock = $http({ method : 'POST',
							  data : lockData,
							  url : propertiesService.getServiceUrlBase() + "Doc/Lock",
							  headers : { 'Content-Type' : 'application/json'}
		                   });
		 doLock.then(function (response){
			  	var data = response.data;
			logger.log('(ResultCtrl) after service call for lock - success');
			if (data.eventIds != null && data.eventIds.length > 0) {
			   var lockedEventIds = data.eventIds;
			   // update locked column in result table
			   var errors = searchResultService.getErrorEvents();
			   for (var i = 0; i < errors.length; i++) {
			      if (lockedEventIds.indexOf(errors[i].eventId) != -1) {
				     errors[i].lockedUsername = userName;
				  }
			   }
			   searchResultService.setErrorEvents(errors, false);

			   // set the documents viewed by selected order
			   var newLockedEventIds = [];
			   for (var i = 0; i < $scope.selected.length; i++) {
			      if (lockedEventIds.indexOf($scope.selected[i]) > -1) {
				     newLockedEventIds.push($scope.selected[i]);
				  }
			   }
			   var lockedDocs = [];
			   for (var i = 0; i < newLockedEventIds.length; i++) {
				  var entity = $filter('filter')($scope.data,{eventId : newLockedEventIds[i]})[0];
				  lockedDocs.push(entity);
			   }
			   selectedDocumentService.setSelectedDocs(lockedDocs);
			   selectedDocumentService.setCurDocIndex(1);
			   selectedDocumentService.setTotalDocs(newLockedEventIds.length);
			   $location.path('/docview');
			} else {
			   $scope.noDocs = true;
			}
		 });
	  };

	  $scope.searchAndReplace = function() {
	    $rootScope.$broadcast('$handleCleanSearchMessagesEvent');
	    cleanActionMessages();

		 var userName = $cookies.get('userName');
		 var lockData = { "eventIds" : $scope.selected,
						  "userName" : userName
						};

		 logger.log('(ResultCtrl) before service call for lock');

		 var doLock = $http({ method : 'POST',
							  data : lockData,
							  url : propertiesService.getServiceUrlBase() + "Doc/Lock",
							  headers : { 'Content-Type' : 'application/json'}
							});
		 doLock.then(function (response){
			  	var data = response.data;
		    logger.log('(ResultCtrl) after service call for lock - success');
			if (data.eventIds != null && data.eventIds.length > 0) {
			   var lockedEventIds = data.eventIds;
			   // update locked column in result table
			   var errors = searchResultService.getErrorEvents();
			   for (var i = 0; i < errors.length; i++) {
			      if (lockedEventIds.indexOf(errors[i].eventId) != -1) {
				     errors[i].lockedUsername = userName;
				  }
			   }
			   searchResultService.setErrorEvents(errors, false);

			   // set the documents viewed by selected order
			   var newLockedEventIds = [];
			   for (var i = 0; i < $scope.selected.length; i++) {
			      if (lockedEventIds.indexOf($scope.selected[i]) > -1) {
				     newLockedEventIds.push($scope.selected[i]);
				  }
			   }
			   var lockedDocs = [];
			   for (var i = 0; i < newLockedEventIds.length; i++) {
				  var entity = $filter('filter')($scope.data,{eventId : newLockedEventIds[i]})[0];
				  lockedDocs.push(entity);
			   }
			   selectedDocumentService.setSelectedDocs(lockedDocs);
			   selectedDocumentService.setCurDocIndex(1);
			   selectedDocumentService.setTotalDocs(newLockedEventIds.length);

			   replaceService.setDocs(lockedDocs);
			   replaceService.setChoiceFormat("INT");
			   replaceService.setTotalNumDocs(newLockedEventIds.length);
												
			   $location.path('/replace');
			} else {
			   $scope.noDocs = true;
			}
		 });
	  };

	  $scope.unlockDocuments = function() {
	    $rootScope.$broadcast('$handleCleanSearchMessagesEvent');
		 cleanActionMessages();

		 var userName = $cookies.get('userName');
		 var unlockData = { "eventIds" : $scope.selected,
						    "userName" : userName
						  };

		 logger.log('(ResultCtrl) before service call for unlock');

		 var doUnlock = $http({ method : 'POST',
								data : unlockData,
								url : propertiesService.getServiceUrlBase()	+ "Doc/Unlock",
								headers : { 'Content-Type' : 'application/json'}
							 });

		 doUnlock.then(function (response){
			  	var data = response.data;
		    logger.log('(ResultCtrl) after service call for unlock');
			if (data.eventIds != null && data.eventIds.length > 0) {
			   var unlockedEventIds = data.eventIds;
			   var errors = searchResultService.getErrorEvents();
			   for (var i = 0; i < errors.length; i++) {
			      if (unlockedEventIds.indexOf(errors[i].eventId) != -1) {
				     errors[i].lockedUsername = null;
				  }
			   }
			   searchResultService.setErrorEvents(errors,false);

			   var lockedDocs = selectedDocumentService.getSelectedDocs();
			   var curDocIndex = selectedDocumentService.getCurDocIndex();
			   var totalDocs = selectedDocumentService.getTotalDocs();

			   for (var i = 0; i < unlockedEventIds.length; i++) {
			      var index = lockedDocs.map(function(e) {return e.eventId;}).indexOf(unlockedEventIds[i]);
				  if (index != -1) {
				     lockedDocs.splice(index, 1);
				 	 totalDocs--;
					 // curDocIndex starts at 1; index starts at 0
					 if (index == (curDocIndex - 1)) { 
					    if (curDocIndex > totalDocs) {
						   curDocIndex = 1;
						}
					 } else if (index < (curDocIndex - 1)) {
					    curDocIndex--;
					 }
				  }
			   }

			   selectedDocumentService.setSelectedDocs(lockedDocs);
			   selectedDocumentService.setCurDocIndex(curDocIndex);
			   selectedDocumentService.setTotalDocs(totalDocs);
			}
	     });
	  };

	  $scope.$on('$handleErrorEvent', function() {
	     $scope.noResult = false;
		 $scope.noDocs = false;
		 loadErrorEvents();

		 $scope.selected = [];
		 docsSelectedList = [];
		 $scope.disableBtn = true;
		 selectedDocumentService.setSelectedDocIds([]);
		 $scope.gridApi.selection.clearSelectedRows();
		 
		 cleanActionMessages();
		 // initialize current page # to default value
		 $scope.gridOptions.paginationCurrentPage = 1;
		 $scope.gridApi.grid.buildColumns();
		 $scope.gridApi.grid.refresh();
	  });
	  
	  function loadErrorEvents() {
	     if (searchResultService.getSearchIPCode() != null && searchResultService.getSearchIPCode().length > 0) {
		    $scope.mixVendors = false;
			if (vendorService.isEligible(searchResultService.getSearchIPCode())) {
			   $scope.hideVendorBtn = false;
			   $scope.disableVendorBtn = false;
			} else {
			   $scope.hideVendorBtn = true;
			}
		 } else {
		    $scope.mixVendors = true;
			$scope.hideVendorBtn = false;
		 }
		 var eventData = searchResultService.getErrorEvents();
		 var events = null;
		 if (eventData != null) {
		    if (!eventData.errorData) {
			   events = eventData;
			} else {
			   events = eventData.errorData;
			}
			$scope.data = events;

			if ($scope.data.length == 0) {
			   $scope.noResult = true;
			}
			$scope.totalOfErrors = $scope.data.length;
			// scroll to top
			$(".ui-grid-viewport").scrollTop(0);
		 }
	  };

	  $('.btn-default').click(function() { $(this).blur();	});

	  $scope.blurDeleteBtn = function() { $scope.blurDeleteButton = true; };

	  $("#deleteButton").focus(function() {
	     if ($scope.blurDeleteButton == true) {
		    $("#deleteButton").blur();
			$scope.blurDeleteButton = false;
		 }
	  });

	  $scope.blurReturnToVendorBtn = function() {
	     $scope.blurReturnToVendorButton = true;
	  };

	  $("#returnToVendorButton").focus(function() {
	     if ($scope.blurReturnToVendorButton == true) {
		    $("#returnToVendorButton").blur();
			$scope.blurReturnToVendorButton = false;
		 }
	  });

	  $scope.refresh = function() {
		 doSearch();
	  };
	 

	  function doSearch() {
		// clear error message
	     $scope.noResult = false;
		 $scope.noDocs = false;
		 cleanActionMessages();
		 $scope.searchServiceFailure = false;
		 $scope.disableBtn = true;
         searchResultService.setSearchAction(true, 'Searching');
		 $scope.searchTimeout = false;
		 //wait up to 15 minutes and 5 seconds for results, then stop search and display timeout alert
		 var timerPromise = $timeout(function () {
	 	    if (searchResultService.getIsSearching() == true) {
	 		   logger.log('(ResultCtrl) after service call for search - timeout occured');
	 			                		
	 		   $scope.searchTimeout = true;
	 		   searchResultService.setSearchAction(false, 'Search');
	 			      canceler.resolve();
	 		}
	 	 }, 905000);

		 var pubIDValue = "";
		 var docIDValue = "";
		 if ($cookies.get('searchIDType') == 1) {
		    pubIDValue = $cookies.get('searchID');
		 } else if ($cookies.get('searchIDType') == 2) {
			docIDValue = $cookies.get('searchID');
		 }
		 if ($cookies.get('searchErrMsgCaseSensitivity') == null) {
		    $cookies.put('searchErrMsgCaseSensitivity', false);
		 }
		 
		 var queryData = { "IPCode" : $cookies.get('searchIPCode'),
						       "receivedDate" : $cookies.get('searchReceivedDate'),
						       "receivedEndDate" : $cookies.get('searchReceivedEndDate'),
						       "errMessage" : $cookies.get('searchErrorMessage'),
						       "errMsgCaseSensitivity" : $cookies.get('searchErrMsgCaseSensitivity').toString(),
						       "legacyPlatform" : "ALL",
						       "pubId" : pubIDValue,
						       "docId" : docIDValue,
						   	 "userName" : $cookies.get('userName')
						 };

		 logger.log('(ResultCtrl) before service call for search');

		 var getJson = $http({ method : 'POST',
							   data : queryData,
							   timeout: canceler.promise,
							   url : propertiesService.getServiceUrlBase() + "ErrorData/Search",
							   headers : { 'Content-Type' : 'application/json'}
		                    });

		 getJson.then(function (response){
		  	var data = response.data;
			logger.log('(ResultCtrl) after service call for search - success');
			searchResultService.setSearchIPCode($cookies.get('searchIPCode'));
			searchResultService.setSearchReceivedDate($cookies.get('searchReceivedDate'));
			searchResultService.setSearchReceivedEndDate($cookies.get('searchReceivedEndDate'));
			searchResultService.setSearchErrorMessage($cookies.get('searchErrorMessage'));
			searchResultService.setSearchErrMsgCaseSensitivity($cookies.get('searchErrMsgCaseSensitivity'));
			searchResultService.setSearchIDType($cookies.get('searchIDType'));
			searchResultService.setSearchID($cookies.get('searchID'));

			searchResultService.setSearchAction(false, 'Search');
			$timeout.cancel(timerPromise);

			if (!data || !data.statusCode) {
			   $scope.searchServiceFailure = true;
			} else {
			   if (data.statusCode > 0) {
			      $scope.searchServiceFailure = true;
			   } else {
				  $scope.searchServiceFailure = false;
				  searchResultService.setErrorEvents(data.errorData, true);
			   }
			}
		 },function (response){
		    $scope.searchStatus = response.status;
			$scope.searchError = response.data;
			logger.log('(ResultCtrl) after service call for search - error: ' + $scope.searchError + $scope.searchStatus);
		 });
	  };

	  function closeDocuments() {
		 // close all documents
		 selectedDocumentService.setSelectedDoc(null);
		 selectedDocumentService.setSelectedDocs([]);
		 selectedDocumentService.setSelectedDocIds([]);
		 selectedDocumentService.setCurDocIndex(0);
		 selectedDocumentService.setTotalDocs(0);
	  };

	  function cleanActionMessages() {
		 $scope.resubmitSuccess = false;
		 $scope.resubmitFailure = false;
		 $scope.rollbackSuccess = false;
		 $scope.rollbackFailure = false;
		 $scope.deleteSuccess = false;
		 $scope.deleteFailure = false;
		 $scope.returnToVendorSuccess = false;
		 $scope.returnToVendorFailure = false;
		 if (!$scope.hasCommit) {
		    $scope.commitSuccess = false;
		    replaceService.setShowCommitMessage($scope.commitSuccess);
		 }
	  };
	  
	  
	  
      $scope.$on('$cleanSearchData', function(){
    	  $scope.data = []; 
	  });
	  
	  
	  $scope.$on('$handleCleanResultMessagesEvent', function() {
	     cleanActionMessages();   
	     $scope.noDocs = false;
	     $scope.noResult = false;
	     $scope.searchTimeout = false;
	     $scope.searchServiceFailure = false;
	   });
   }
]);