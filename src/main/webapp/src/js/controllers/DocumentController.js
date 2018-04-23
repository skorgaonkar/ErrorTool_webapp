errorToolApp.controller('DocCtrl', ['$scope', '$cookies', '$rootScope', '$location', '$http', 'selectedDocumentService',
                                    'propertiesService', 'ModalService', 'searchResultService', 'Logger', 'vendorService','$window',
                                    'replaceService', 'ENCODING_UTF8','ENCODING_WIN1252',
function( $scope, $cookies, $rootScope, $location, $http, selectedDocumentService, propertiesService, ModalService, searchResultService, Logger
        , vendorService,$window, replaceService, ENCODING_UTF8, ENCODING_WIN1252) {
	var logger = Logger.getInstance('DocumentController.js'); 
	logger.log('(DocCtrl) begin');
	
	$scope.encodingUTF8 = ENCODING_UTF8;
	$scope.encodingWIN1252 = ENCODING_WIN1252;
	$scope.encodingType =$scope.encodingUTF8.type;
   $scope.charSet = $scope.encodingUTF8.display;
   $scope.curSelectedDoc = 0;
	$scope.totalSelectedDoc = 0;
	$scope.disableBtn = true;
	$scope.docDataError = false;
	$scope.xmlFormat = false;
	var cachedData = {};
	$rootScope.deleteEvents = null;
	$rootScope.resubmitEvents = null;
	
	replaceService.setNoINTFiles( false );
	
	var selectedDoc = selectedDocumentService.getSelectedDoc();
	if (selectedDoc == null) {
		$scope.errorMessage = "No document selected";
	}
	else {
	   loadDocument();
	}
	
	function loadDocument() {
		$scope.curSelectedDoc = selectedDocumentService.getCurDocIndex();
		$scope.totalSelectedDoc = selectedDocumentService.getTotalDocs();
		selectedDoc = selectedDocumentService.getSelectedDoc();
		$scope.displayReturnToVendor=vendorService.isEligible(selectedDoc.partnerName);
		$scope.docDataError = false;
		$scope.disableBtn = false;
		$scope.blurDeleteButton = false;
		$scope.blurReturnToVendorButton = false;
		$scope.deleteFailure = false;
		$scope.returnToVendorFailure = false;
		$scope.resubmitFailure = false;
		$scope.saveSuccess = false;
		$scope.saveFailure = false;
		$scope.rollbackFailure = false;
		$scope.activityLogFailure = false ;
		$scope.attachmentsFailure = false;
		$scope.uploadFailure = false;
		$scope.uploadSuccess=false;
		$scope.intSaved = false;
		$scope.rawSaved = false;
		$scope.showDocError = false;
		$rootScope.docChanged = false;
		$scope.attachments = null;
		$scope.attachLinkEnable=[];
		$scope.uploadFileName = null;
		
		$scope.errorMessage = selectedDoc.errorMessage;
		$scope.rawFile = selectedDoc.rawFileName;
		$scope.orgnRawFileName = selectedDoc.rawFileName; 
		$scope.receivedDate = selectedDoc.time;
		$scope.workingDirectory = selectedDoc.workingDirectory;
	   $scope.eventId = selectedDoc.eventId;
		$scope.originalEventId = selectedDoc.originalEventId;
		$scope.partnerName = selectedDoc.partnerName;
		$scope.originalFileName = selectedDoc.origRawFileName;
		
		var recentFileChoice;
		if($scope.recentFileChoice != undefined){
			recentFileChoice = $scope.recentFileChoice;
		}

		var docData = {
			"workingDirectory" : $scope.workingDirectory,
			"rawFileName" : $scope.rawFile,
			"intFileName" : "",
			"fileChoice" : "NONE",
			"recentFileChoice" : recentFileChoice,
			"eventId" : $scope.eventId,
			"originalEventId": $scope.originalEventId,
			"encodingType": $scope.encodingType,
			"forceEncoding": "false"
		};

		logger.log('(DocCtrl) before service call for load-document');
		
		var getJson = $http({
			method : 'POST',
			data : docData,
			url : propertiesService.getServiceUrlBase() + "Doc/DocFile",
			headers : {
				'Content-Type' : 'application/json'
			}
		});

		getJson.then(function (response){
		  	var data = response.data;
			logger.log('(DocCtrl) after service call for load-document - success');
			if( data == null){
			   logger.log('doc data error - null' );
		    }
			if (angular.isUndefined(data.docContent)) {
				// This document is not currently in a Fail state OR
				// a HARD lock action is currently taking place on it
				logger.log('no doc content found');
				$scope.showDocError = true;
				$scope.document = "";
				$scope.intFile = "";
			} else {
			   logger.log('doc data status - ' + data.docDataStatus);
			   if( data.docDataStatus != null && (data.docDataStatus == "1" || data.docDataStatus == "2")){
				  $scope.docDataError = true;
                  $scope.disableBtn = true;
               }
			   $scope.document = {data: data.docContent};
			   cachedData = {data: data.docContent};
				$scope.intFile = data.intFileName;
				if ($scope.intFile.match(/_edited/) != null) {
					$scope.intSaved = true;
				}
				$scope.rawFile = data.rawFileName;
				if ($scope.rawFile.match(/_edited/) != null) {
					$scope.rawSaved = true;
				}

				if( data.fileChoice == "RAW"){
				   chooseDocEditor(data.rawFileName);
				}
				else if( data.fileChoice == "INT"){
				   chooseDocEditor(data.intFileName);
				}

				$scope.docChoice = data.fileChoice;
				$scope.recentFileChoice = data.recentFileChoice;
				$scope.encodingType =data.encodingType;
				updateCharSet();
			}
		});
		
		$scope.activityLogData = [];
		$scope.activityLogGridOpts = {				
				//enableRowSelection: true,    
				enableRowHeaderSelection: false,  
				rowHeight : 18,
				enableSorting: true,
				data : 'activityLogData',			
				columnDefs : [ {
					name : 'Date/Time Stamp',
					field : 'timestamp',
					type : 'string',
					width : '15%'			
				}, {
					name : 'Current Event ID',
					field : 'currentEventId',
					type : 'string',
					width : '10%'
				}, {
					name : 'Action',
					field : 'action',
					type : 'string',
					width : '10%'			
				}, {
					name : 'username',
					field : 'username',
					type : 'string',
					width : '10%'			
				}, {
					name : 'Error Message',
					field : 'errorMessage',
					cellTooltip: true,
					type : 'string',
					width : '30%'		
				}, {
					name : 'Action Info',
					field : 'actionInfo',
					type : 'string',
					width : '10%'			
				}, {
					name : 'File Name',
					field : 'fileName',
					type : 'string',
					width : '30%'			
				}]
			};
		   loadActivities();
			var getAttachmentFiles = $http({
			method : 'POST',
			data : $scope.workingDirectory,
			url : propertiesService.getServiceUrlBase() + "Attachment/Info",
			headers : {
				'Content-Type' : 'application/json'
			}
		});

		getAttachmentFiles.then(function (response){
		  	var data = response.data;
			logger.log('(DocCtrl) after service call for get-attachment-files - success');
			if(data.statusCode > 0) {   
				$scope.attachmentsFailure = true ;
			} else {		
				$scope.attachmentsFailure = false ;
				$scope.attachments = data.attachmentFiles;
				$scope.docAttachmentLocation = data.docAttachmentLocation;
				
				for (var i = 0; i < $scope.attachments.length; i++) {
					if( $scope.attachments[i].fileExists == 'true'){
					  $scope.attachLinkEnable.push(true);
					}
					else{
						$scope.attachLinkEnable.push(false);
					}
				}
			}
			
		});
		$scope.download=function(originalEventId,filePath,fileName){
			logger.log('(DocCtrl) before service call for download-attachment-file-generate-key');
			var fileData = {
					"userName" : $cookies.get('userName'),
					"eventId" : originalEventId,
					"fileName" : fileName,
					"fullFileName" : filePath + fileName,
				};
				$http({
					method : 'POST',
					data : fileData,
					url : propertiesService.getServiceUrlBase() + "File/Download",
					headers : {
						'Content-Type' : 'application/json'
					}
				}).then(function (response){
				  	var data = response.data;
					logger.log('(DocCtrl) after service call for download-attachment-file-generate-key -success');
			        if( data == "OK") {
			        	  logger.log('(DocCtrl) before service call for download-attachment-file');
				        $window.location.href = propertiesService.getServiceUrlBase() 
				                              + "File/Download/" + $cookies.get('userName')
				                              +"/" +originalEventId + "/"+ fileName;
				        logger.log('(DocCtrl) after service call for download-attachment-file -success');
				}
			});
		};
		
		$scope.uploadFile = function(files, fileName) {
			var attachment = null;
			for (var i = 0; i < $scope.attachments.length; i++) {
				if( $scope.attachments[i].fileName == fileName ) {
					attachment = $scope.attachments[i];
					break;
				}
			}
			var docData  ={"workingDirectory": $scope.workingDirectory,
			               "originalEventId": $scope.originalEventId,
			               "eventId": $scope.eventId,
			               "partnerName": $scope.partnerName,
			              };
	        var attachData = { "attachmentLocation": attachment.attachmentLocation
			                   , "fileName": attachment.fileName
		                      , "fileType": attachment.fileType };
	        var fileData = { "docData":docData
	                       , "attachmentFile": attachData
	                       , "userName":{"userName": $cookies.get('userName')}
	                       , "docAttachmentLocation":{"docAttachmentLocation": $scope.docAttachmentLocation}
	                       };
	
            var fd = new FormData();
            fd.append("file", files[0]);
            fd.append("fileInfo", JSON.stringify( fileData));
            logger.log('(DocCtrl) before service call for upload-file');
            $http.post(propertiesService.getServiceUrlBase() + "File/Upload", fd, 
            		   {headers: {'Content-Type': undefined },
                        transformRequest: angular.identity
            }).then(function (response){
    		  	var data = response.data;
            	logger.log('(DocCtrl) after service call for upload-file');
            	if( data != null && data != "") {
            		$scope.uploadFailure = false;
            		$scope.uploadSuccess=true;
            	    for (var i = 0; i < $scope.attachments.length; i++) {
				        if( $scope.attachments[i].fileName == data.fileName ) {
					        $scope.attachments[i].lastModifiedTime = data.lastModifiedTime;
		    		        $scope.attachments[i].attachmentLocation = data.attachmentLocation;
		    		        $scope.attachments[i].fileSize = data.fileSize;
		    		        $scope.attachments[i].fileExists = data.fileExists;
		    		        if(data.fileExists == "true"){
		    		           $scope.attachLinkEnable[i]=true;
		    		        }
		    		        else{
		    		           $scope.attachLinkEnable[i]=false;
		    		        }
		    		        break;
				        }
			        }
                }
                else{
                	$scope.uploadFailure = true;
                	$scope.uploadSuccess=false;
                	$scope.uploadFileName = files[0].name;
                }  
            	loadActivities();
           });
	    };
	};
    
	function loadActivities() {
        logger.log('(DocCtrl) before service call for get-activity-log');
		var getActivityLog = $http({
			method : 'POST',
			data : $scope.originalEventId,
			url : propertiesService.getServiceUrlBase() + "ActivityLog/List",
			headers : {
				'Content-Type' : 'application/json'
			}
		});

		getActivityLog.then(function (response){
		  	var data = response.data;
			logger.log('(DocCtrl) after service call for get-activity-log - success');
			if(data.statusCode > 0) {   
				$scope.activityLogFailure = true ;
			} else {		
				$scope.activityLogFailure = false ;
				var activityLogData = data.activityLogData;
				$scope.activityLogData = activityLogData;
			}			
		});
		logger.log('(DocCtrl) before service call for get-attachment-files');
	};
	
	$scope.getDocument = function() {
	   $scope.encodingType = $scope.encodingUTF8.type;
       $scope.charSet = $scope.encodingUTF8.display;
       if ($scope.docChoice == "RAW") {
	      $scope.docChoice = "INT";
	   } else {
		  $scope.docChoice = "RAW";
	   }
	   requestDocument("false");
	};

	$scope.checkDocChanged = function() {
	   if(!angular.isUndefined($scope.document)){
	      if( $scope.document != null && cachedData.data != null ){
		     $rootScope.docChanged = !angular.equals($scope.document.data.trim(), cachedData.data.trim());
		  }
      }
      else{
         $rootScope.docChanged = false;
      }
	};

	$scope.switchDocTab = function() {
		$scope.checkDocChanged();
		if ($rootScope.docChanged == false) {
			$scope.getDocument();
		}
	};

	$scope.checkAndGoBack = function() {
		$scope.checkDocChanged();
		if ($rootScope.docChanged == false) {
			$location.path('/search');
		} else {
			ModalService.showModal({
				templateUrl : 'templates/docChangedWarning.html',
				controller : "ModalCtrl"
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(result) {
					if (result == "Yes") {
						$location.path('/search');
						$rootScope.docChanged = false;
					}
					;
				});
			});
		}
	};

	function loadNextDocument() {
	   $scope.encodingType = $scope.encodingUTF8.type;
      $scope.charSet = $scope.encodingUTF8.display;

		var totalDocs   = selectedDocumentService.getTotalDocs();
		var curDocIndex = selectedDocumentService.getCurDocIndex();
		var lockedDocs  = selectedDocumentService.getSelectedDocs();
		if( lockedDocs != null && lockedDocs.length > 0 ){
			var theEventId = lockedDocs[ curDocIndex -1 ].eventId;
			lockedDocs.splice( curDocIndex -1, 1);
			selectedDocumentService.setSelectedDocs( lockedDocs );
			selectedDocumentService.setTotalDocs( lockedDocs.length );
			totalDocs = selectedDocumentService.getTotalDocs();
			
			//update current doc index if it is greater than the total numeber of docs.
			if( curDocIndex > totalDocs ) {
			    curDocIndex = totalDocs;
			    selectedDocumentService.setCurDocIndex( curDocIndex );
			}
			
			var ids = selectedDocumentService.getSelectedDocIds();
			var index = ids.indexOf( theEventId );
			if( index > - 1 ) {
			  ids.splice( index, 1 );
			}
			selectedDocumentService.setSelectedDocIds( ids );
			
			//remove deleted/resubmitted event from result table 
			var errorEvents = searchResultService.getErrorEvents();
			if( errorEvents != null && errorEvents.length > 0 ) {
			    for (var i = 0; i < errorEvents.length; i++) {
				    if( theEventId == errorEvents[i].eventId ){
					    errorEvents.splice(i, 1);
				    }
			    }
				searchResultService.setErrorEvents(errorEvents, false);
		    }
		}
		if( totalDocs >=1 ) {
			loadDocument();
		}
		else {
			$location.path('/search');
		}
	}

	$scope.deleteDocument = function() {
		var errorDataList = [ selectedDoc ];
		var deleteDoc = { "errorData": errorDataList
	                    , "userName": $cookies.get('userName') };
		
		logger.log('(DocCtrl) before service call for delete');
		
		var doDelete = $http({
			method : 'POST',
			data : deleteDoc,
			url : propertiesService.getServiceUrlBase() + "Doc/Delete",
			headers : {
				'Content-Type' : 'application/json'
			}
		});

		doDelete.then(function (response){
		  	var data = response.data;
			logger.log('(DocCtrl) after service call for delete');
			$("#deleteBtn").blur();
			$scope.saveSuccess = false;
			$scope.saveFailure = false;
			$scope.rollbackFailure = false;
			$scope.resubmitFailure = false;
			$scope.returnToVendorFailure = false;
			if (data == "") {
				$scope.deleteFailure = true;
			} else {
				$scope.deleteFailure = false;
				$rootScope.deleteEvents = [];
				$rootScope.deleteEvents.push(selectedDoc.eventId);
				$rootScope.docChanged = false;
				loadNextDocument();
			}
		});
	};

	$scope.returnToVendorDocument = function() {
		var errorDataList = [ selectedDoc ];
		var returnToVendorDoc = { "errorData": errorDataList
	                           , "userName": $cookies.get('userName')
	                           , "userEmailAddress": $cookies.get('userEmailAddress')};
		
		logger.log('(DocCtrl) before service call for return to vendor');
		
		var doReturnToVendor = $http({
			method : 'POST',
			data : returnToVendorDoc,
			url : propertiesService.getServiceUrlBase() + "Doc/ReturnToVendor",
			headers : {
				'Content-Type' : 'application/json'
			}
		});

		doReturnToVendor.then(function (response){
		  	var data = response.data;
			logger.log('(DocCtrl) after service call for return to vendor');
			$("#returnToVendorBtn").blur();
			$scope.saveSuccess = false;
			$scope.saveFailure = false;
			$scope.rollbackFailure = false;
			$scope.resubmitFailure = false;
			$scope.deleteFailure = false;
			if (data == "") {
				$scope.returnToVendorFailure = true;
			} else {
				$scope.returnToVendorFailure = false;
				$rootScope.returnToVendorEvents = [];
				$rootScope.returnToVendorEvents.push(selectedDoc.eventId);
				$rootScope.docChanged = false;
				loadNextDocument();
			}
		});
	};

	$scope.resubmit = function() {
		var docData;
		$scope.checkDocChanged();
      if ($rootScope.docChanged == false) {
			docData = {
				"workingDirectory" : selectedDoc.workingDirectory,
				"rawFileName" : $scope.rawFile,
				"intFileName" : $scope.intFile,
				"fileChoice" : $scope.docChoice,
				"docContent" : "NULL",
				"eventId" : selectedDoc.eventId,
				"originalEventId" : selectedDoc.originalEventId,
				"partnerName" : selectedDoc.partnerName,
				"profileId" : selectedDoc.profileId,
			};
		} else {
			docData = {
				"workingDirectory" : selectedDoc.workingDirectory,
				"rawFileName" : $scope.rawFile,
				"intFileName" : $scope.intFile,
				"fileChoice" : $scope.docChoice,
				"docContent" : $scope.document.data,
				"eventId" : selectedDoc.eventId,
				"originalEventId" : selectedDoc.originalEventId,
				"partnerName" : selectedDoc.partnerName,
				"profileId" : selectedDoc.profileId,
				"encodingType": $scope.encodingType
			};
		}
		
		var docDataList = [docData];
		var resubmitDoc = { "docData": docDataList
		                  , "userName": $cookies.get('userName') };
		
		logger.log('(DocCtrl) before service call for resubmit');
		
		var doResubmit = $http({
			method : 'POST',
			data : resubmitDoc,
			url : propertiesService.getServiceUrlBase() + "Doc/Resubmit",
			headers : {
				'Content-Type' : 'application/json'
			}
		});

		doResubmit.then(function (response){
		  	var data = response.data;
			logger.log('(DocCtrl) after service call for resubmit - success');
			$scope.deleteFailure = false;
			$scope.saveSuccess = false;
			$scope.saveFailure = false;
			$scope.rollbackFailure = false;
			$scope.returnToVendorFailure = false;
			if (data == "") {
				$scope.resubmitFailure = true;
			} else {
				$scope.resubmitFailure = false;
				$rootScope.resubmitEvents = [];
				$rootScope.resubmitEvents.push(selectedDoc.eventId);
				$rootScope.docChanged = false;
				
				loadNextDocument();				
			}
		});
	};

	$scope.saveDocument = function() {
		var docData = {
			"workingDirectory" : $scope.workingDirectory,
			"rawFileName" : $scope.rawFile,
			"intFileName" : $scope.intFile,
			"docContent" : $scope.document.data,
			"fileChoice" : $scope.docChoice,
			"eventId" : $scope.eventId,
			"originalEventId" : selectedDoc.originalEventId,
			"encodingType": $scope.encodingType,
			"userName": $cookies.get('userName')
		};

		logger.log('(DocCtrl) before service call for save');
		
		var getJson = $http({
			method : 'POST',
			data : docData,
			url : propertiesService.getServiceUrlBase() + "Doc/Save",
			headers : {
				'Content-Type' : 'application/json'
			}
		});
		getJson.then(function (response){
		  	var data = response.data;
		   logger.log('(DocCtrl) after service call for save');
			$scope.deleteFailure = false;
			$scope.resubmitFailure = false;
			$scope.rollbackFailure = false;
			$scope.returnToVendorFailure = false;
			if (data == "") {
				$scope.saveSuccess = false;
				$scope.saveFailure = true;
			} else {
				$scope.saveSuccess = true;
				$scope.saveFailure = false;
				$rootScope.docChanged = false;
				cachedData = $scope.document;
				if ($scope.docChoice == "RAW") {
					$scope.rawFile = data;
					$scope.rawSaved = true;
				} else {
					$scope.intFile = data;
					$scope.intSaved = true;
				}
            
				//update modified formats in result table				
				var errors = searchResultService.getErrorEvents();
				for (var i = 0; i < errors.length; i++) {
					if( errors[i].eventId ==  $scope.eventId ) {
						errors[i].fileChoice = $scope.docChoice;
						errors[i].selectedFileName = data;
						if ($scope.docChoice == "RAW") {
							errors[i].RAWModified = "Y";
						} else {
							errors[i].INTModified = "Y";
						}
						break;
					}
				}
				searchResultService.setErrorEvents(errors, true);
			}
		});
	};
	
	$scope.rollbackToOriginal = function() {
	   $scope.encodingType = $scope.encodingUTF8.type;
      $scope.charSet = $scope.encodingUTF8.display;

		var currentFileName = null;
		currentFileName = ($scope.docChoice == 'INT') ? $scope.intFile : $scope.rawFile ;
		
		var query = {
			"eventId" : $scope.eventId,
			"origEventId" : selectedDoc.originalEventId,
			"type" : "original",
			"fileChoice" : $scope.docChoice,
			"workingDirectory" : $scope.workingDirectory,
			"orgnRawFileName" : $scope.orgnRawFileName,
			"currentFileName" : currentFileName,
			"userName": $cookies.get('userName')
		};

		logger.log('(DocCtrl) before service call for rollback');
		
		var getJson = $http({
			method : 'POST',
			data : query,
			url : propertiesService.getServiceUrlBase() + "Doc/RollBack",
			headers : {
				'Content-Type' : 'application/json'
			}
		});
		getJson.then(function (response){
		  	var data = response.data;
			logger.log('(DocCtrl) after service call for rollback');
			$scope.deleteFailure = false;
			$scope.resubmitFailure = false;
			$scope.saveSuccess = false;
			$scope.saveFailure = false;
			$scope.returnToVendorFailure = false;
			if (data == "" || data.errorCode > 0) {
				$scope.rollbackFailure = true; 			
			} else {				
				$scope.rollbackFailure = false;
				$rootScope.docChanged = false;  
								
				if ($scope.docChoice == "RAW") {				
					$scope.rawFile = data.newFileName;				
					$scope.rawSaved = false;
				} else {				
					$scope.intFile = data.newFileName;
					$scope.intSaved = false;
				}

				$scope.document = {data: data.docContent};
            cachedData = {data: data.docContent};
				
            //update modified format in result table				
				var errors = searchResultService.getErrorEvents();
				for (var i = 0; i < errors.length; i++) {
					if( errors[i].eventId ==  $scope.eventId ) {
						errors[i].fileChoice = $scope.docChoice;
						errors[i].selectedFileName = data.newFileName;
						if ($scope.docChoice == "RAW") {
							errors[i].RAWModified = "N";
						} else {
							errors[i].INTModified = "N";
						}
						break;
					}
				}
				searchResultService.setErrorEvents(errors, true);
			}
		});
	};
	
	$scope.replaceDocument = function() {
		$scope.checkDocChanged();
		var replaceDocs = [];
		replaceDocs.push( selectedDocumentService.getSelectedDoc() );
		
		if( $scope.intFile == ''){
			replaceService.setNoINTFiles( true );
		}
		
		if ($rootScope.docChanged == false) {
			replaceService.setDocs(replaceDocs);
			replaceService.setChoiceFormat($scope.docChoice);
	        replaceService.setTotalNumDocs(1);
	        $location.path('/replace');
		} else {
			ModalService.showModal({
				templateUrl : 'templates/docChangedWarning.html',
				controller : "ModalCtrl"
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(result) {
					if (result == "Yes") {
						replaceService.setDocs(replaceDocs);
						replaceService.setChoiceFormat($scope.docChoice);
				        replaceService.setTotalNumDocs(1);
						$location.path('/replace');
						$rootScope.docChanged = false;
					}
					;
				});
			});
		}
		
	};
	
	$scope.replaceDocumentSet = function() {
		$scope.checkDocChanged();
		if ($rootScope.docChanged == false) {
			replaceService.setDocs(selectedDocumentService.getSelectedDocs());
			replaceService.setChoiceFormat("INT");
	        replaceService.setTotalNumDocs(selectedDocumentService.getTotalDocs());
	        $location.path('/replace');
		} else {
			ModalService.showModal({
				templateUrl : 'templates/docChangedWarning.html',
				controller : "ModalCtrl"
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(result) {
					if (result == "Yes") {
						replaceService.setDocs(selectedDocumentService.getSelectedDocs());
						replaceService.setChoiceFormat("INT");
				        replaceService.setTotalNumDocs(selectedDocumentService.getTotalDocs());
						$location.path('/replace');
						$rootScope.docChanged = false;
					}
					;
				});
			});
		}
		
	};
	
	$scope.goPrev = function() {
	   $scope.encodingType = $scope.encodingUTF8.type;
      $scope.charSet = $scope.encodingUTF8.display;

		var curDocIndex = selectedDocumentService.getCurDocIndex();
		$scope.checkDocChanged();
		if ($rootScope.docChanged == false) {
			if( curDocIndex >1 ) {
				curDocIndex = curDocIndex - 1;
				selectedDocumentService.setCurDocIndex( curDocIndex );
			}
			loadDocument();
		} else {
			ModalService.showModal({
				templateUrl : 'templates/docChangedWarning.html',
				controller : "ModalCtrl"
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(result) {
					if (result == "Yes") {
						if( curDocIndex >1 ) {
							curDocIndex = curDocIndex - 1;
							selectedDocumentService.setCurDocIndex( curDocIndex );
						}
						loadDocument();
					}
					;
				});
			});
		}
	};
	
	$scope.goNext = function() {
	   $scope.encodingType = $scope.encodingUTF8.type;
      $scope.charSet = $scope.encodingUTF8.display;

	   var curDocIndex = selectedDocumentService.getCurDocIndex();
		$scope.checkDocChanged();
		if ($rootScope.docChanged == false) {
			if( curDocIndex < selectedDocumentService.getTotalDocs() ) {
				curDocIndex = curDocIndex + 1;
				selectedDocumentService.setCurDocIndex( curDocIndex );
			}
			loadDocument();
		} else {
			ModalService.showModal({
				templateUrl : 'templates/docChangedWarning.html',
				controller : "ModalCtrl"
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(result) {
					if (result == "Yes") {
						if( curDocIndex < selectedDocumentService.getTotalDocs() ) {
							curDocIndex = curDocIndex + 1;
							selectedDocumentService.setCurDocIndex( curDocIndex );
						}
						loadDocument();
					}
					;
				});
			});
		}
	};
	
	$scope.loadANSIDoc = function() {
	   if( $scope.encodingType != $scope.encodingWIN1252.type){
	      $scope.checkDocChanged();
	      if ($rootScope.docChanged == false) {
	         $scope.encodingType = $scope.encodingWIN1252.type;
	         $scope.charSet = $scope.encodingWIN1252.display;
	         requestDocument("true");
         }
         else{
            ModalService.showModal({
               templateUrl : 'templates/docChangedWarning.html',
               controller : "ModalCtrl"
            }).then(function(modal) {
               modal.element.modal();
               modal.close.then(function(result) {
                  if (result == "Yes") {
                     $scope.encodingType = $scope.encodingWIN1252.type;
                     $scope.charSet = $scope.encodingWIN1252.display;
                     requestDocument("true");
                  };
               });
            });
         }
	   }
   };

   $scope.loadUTF8Doc = function() {
      if( $scope.encodingType != $scope.encodingUTF8.type){
         $scope.checkDocChanged();
         if ($rootScope.docChanged == false) {
            $scope.encodingType = $scope.encodingUTF8.type;
            $scope.charSet = $scope.encodingUTF8.display;
            requestDocument("true");
         }
         else{
            ModalService.showModal({
               templateUrl : 'templates/docChangedWarning.html',
               controller : "ModalCtrl"
            }).then(function(modal) {
               modal.element.modal();
               modal.close.then(function(result) {
                  if (result == "Yes") {
                     $scope.encodingType = $scope.encodingUTF8.type;
                     $scope.charSet = $scope.encodingUTF8.display;
                     requestDocument("true");
                  };
               });
            });
         }
      }
   };

   function requestDocument(forceEncoding) {
      var docData = {
         "workingDirectory" : $scope.workingDirectory,
         "rawFileName" : $scope.rawFile,
         "intFileName" : $scope.intFile,
         "fileChoice" : $scope.docChoice,
         "eventId" : $scope.eventId,
         "originalEventId": $scope.originalEventId,
         "encodingType": $scope.encodingType,
         "forceEncoding": forceEncoding
      };

      logger.log('(DocCtrl) before service call for load-document');

      var getJson = $http({
         method : 'POST',
         data : docData,
         url : propertiesService.getServiceUrlBase() + "Doc/DocFile",
         headers : {
            'Content-Type' : 'application/json'
         }
      });

      getJson.then(function (response){
		  	var data = response.data;
         logger.log('(DocCtrl) after service call for load-document - success');
         if (angular.isUndefined(data.docContent)) {
            // This document is not currently in a Fail state OR
            // a HARD lock action is currently taking place on it
            $scope.showDocError = true;
            $scope.document = "";
            $scope.intFile = "";
         } else {
            if( data.docDataStatus != null && (data.docDataStatus == "1" || data.docDataStatus == "2")){
               $scope.docDataError = true;
               $scope.disableBtn = true;
            }
            $scope.document = {data: data.docContent};
            cachedData = {data: data.docContent};
            $scope.intFile = data.intFileName;
            $scope.rawFile = data.rawFileName;
            if( data.fileChoice == "RAW"){
               chooseDocEditor(data.rawFileName);
            }
            else if( data.fileChoice == "INT"){
               chooseDocEditor(data.intFileName);
            }

            $scope.docChoice = data.fileChoice;
            $scope.recentFileChoice =  data.recentFileChoice;
            $scope.encodingType =data.encodingType;
            updateCharSet();
            $rootScope.docChanged = false;
         }
      });
   };

   function updateCharSet(){
      if($scope.encodingType == $scope.encodingUTF8.type){
         $scope.charSet = $scope.encodingUTF8.display;
      }
      else if($scope.encodingType == $scope.encodingWIN1252.type){
         $scope.charSet = $scope.encodingWIN1252.display;
      }
   }

   function chooseDocEditor(docName){
     if(docName.endsWith(".xml") || docName.endsWith(".XML") || cachedData.data.startsWith("<?xml")){
        $scope.xmlFormat = true;
     }
     else{
        $scope.xmlFormat = false;
     }
   }

	$('.btn-default').click(function() { $(this).blur(); });
	$scope.blurDeleteBtn = function() {
		$scope.blurDeleteButton = true;
	};
	$("#deleteBtn").focus(function() {					
		if ($scope.blurDeleteButton == true) {						
			$("#deleteBtn").blur();
			$scope.blurDeleteButton = false;
		}
	});
	
	$scope.blurReturnToVendorBtn = function() {
		$scope.blurReturnToVendorButton = true;
	};
	$("#returnToVendorBtn").focus(function() {					
		if ($scope.blurReturnToVendorButton == true) {						
			$("#returnToVendorBtn").blur();
			$scope.blurReturnToVendorButton = false;
		}
	});
	
	$scope.clearMessages = function(){
	   $scope.saveSuccess = false;
	   $scope.saveFailure = false;
	}
}]); 