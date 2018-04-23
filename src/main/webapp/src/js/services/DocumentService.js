/* selectedDocumentService service */
errorToolApp.service('selectedDocumentService', function() {
	this.selectedDoc;
	this.selectedDocs = [];
	this.selectedDocIds = [];
	this.curDocIndex  = 0 ;
    this.totalDocs = 0;
    
	this.getSelectedDoc = function() {
		this.selectedDoc = this.selectedDocs[ this.curDocIndex - 1 ];
		return this.selectedDoc;
	};
	this.setSelectedDoc = function(value) {
		this.selectedDoc = value;
	};
	this.getSelectedDocs = function() {
		return this.selectedDocs;
	};
	this.setSelectedDocs = function(value) {
		this.selectedDocs = value;
	};
	this.getSelectedDocIds = function() {
		return this.selectedDocIds;
	};
	this.setSelectedDocIds = function(value) {
		this.selectedDocIds = value;
	};
	this.getCurDocIndex = function() {
		return this.curDocIndex;
	};
	this.setCurDocIndex = function(value) {
		this.curDocIndex = value;
	};
	this.getTotalDocs = function() {
		return this.totalDocs;
	};
	this.setTotalDocs = function(value) {
		this.totalDocs = value;
	};
});
