/* replaceService service */
errorToolApp.service('replaceService', function() {
	this.docs = [];
	this.totalNumDocs = 0;
    this.replaceData;
    this.replaced;
    this.commitStatus;
    this.docsModified;
    this.curDocReplaced = false;
    this.modifiedDocument;
    this.choiceFormat = 'INT';
    this.noINTFiles = false;
    
	this.getDocs = function() {
		return this.docs;
	};
	this.setDocs = function(lockedDocs) {
		this.docs = [];
		for (var i = 0; i < lockedDocs.length; i++) {
		   var entity = { "eventId": "" 
			            , "originalEventId": ""
				        , "workingDirectory": ""
				        , "rawFileName": ""
				        };
		   entity.eventId = lockedDocs[i].eventId;
		   entity.originalEventId = lockedDocs[i].originalEventId;
		   entity.workingDirectory = lockedDocs[i].workingDirectory;
		   entity.rawFileName = lockedDocs[i].rawFileName;
		   this.docs.push( entity );
		}
	};
	this.getTotalNumDocs = function() {
		return this.totalNumDocs;
	};
	this.setTotalNumDocs = function(value) {
		this.totalNumDocs = value;
	};
	this.getReplaceData = function() {
		return this.replaceData;
	};
	this.setReplaceData = function(value) {
		this.replaceData = value;
	};
	this.isReplaced = function() {
		return this.replaced;
	};
	this.setReplaced = function(value) {
		this.replaced = value;
	};
	this.getShowCommitMessage = function() {
		return this.commitStatus;
	};
	this.setShowCommitMessage = function(value) {
		this.commitStatus = value;
	};
	this.getDocsModified = function() {
		return this.docsModified;
	};
	this.setDocsModified = function(value) {
		this.docsModified = value;
	};
	this.isCurDocReplaced = function() {
		return this.curDocReplaced;
	};
	this.setCurDocReplaced = function(value) {
		this.curDocReplaced = value;
	};
	this.getModifiedDocument = function() {
		return this.modifiedDocument;
	};
	this.setModifiedDocument = function(value) {
		this.modifiedDocument = value;
	};
	this.updateSearchResult = function(errorEvents, replaceList) {
		for (var i = 0; i < errorEvents.length; i++) {
		    for( var j = 0; j < replaceList.length; j++){
			    if( errorEvents[i].eventId ==  replaceList[j].eventId ) {
			    	if( replaceList[j].fileChoice != null && replaceList[j].fileChoice.length > 0 ){
				        errorEvents[i].fileChoice = replaceList[j].fileChoice;
			    	}
			    	if( replaceList[j].selectedFileName != null && replaceList[j].selectedFileName.length > 0 ){
				        errorEvents[i].selectedFileName = replaceList[j].selectedFileName;
			    	}
				    if( replaceList[j].INTModified != null && replaceList[j].INTModified.length > 0 ){ 
				    	errorEvents[i].INTModified = replaceList[j].INTModified;
				    }
				    if( replaceList[j].RAWModified != null && replaceList[j].RAWModified.length > 0 ){
				        errorEvents[i].RAWModified = replaceList[j].RAWModified;
				    }
			    }
			}
		}
        return errorEvents;	
	};
	
	this.getChoiceFormat = function() {
		return this.choiceFormat;
	};
	this.setChoiceFormat = function(value) {
		this.choiceFormat = value;
	};
	this.isNoINTFiles = function() {
		return this.noINTFiles;
	};
	this.setNoINTFiles = function(value) {
		this.noINTFiles = value;
	};
});
