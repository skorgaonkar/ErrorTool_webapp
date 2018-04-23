/*SearchResult service*/

errorToolApp.service('searchResultService', function($rootScope, $http, propertiesService, Logger) {
	this.errorEvents;
	this.IPCode;
	this.receivedDate;
	this.receivedEndDate;
	this.searchErrorMessage;
	this.searchErrMsgCaseSensitivity;
	this.searchID;
	this.IDType;
	this.tableState;
	this.gridState;   
	this.partners;
	this.isSearching;
	this.searchButtonText;
	
	var params = ["ip", "rcv", "err", "pubid", "docid"];
	var syntaxValues = {};
	var inputParams = [];
	var validSyntax = false;
	var partners = []; 
	var uppercasePartners = [];
	var logger = Logger.getInstance('SearchResultService.js');
	
	this.getErrorEvents = function() {
		return this.errorEvents;
	};
	this.setErrorEvents = function(value, broadcast ) {
		this.errorEvents = value;	
		if( broadcast ){
		   this.broadcastItem();
		}
	};
	this.broadcastItem = function() {
		$rootScope.$broadcast('$handleErrorEvent');
	};
	this.getSearchIPCode = function() {
		return this.IPCode;
	};
	this.setSearchIPCode = function(value) {
		this.IPCode = value;
	};
	this.getSearchReceivedDate = function() {
		return this.receivedDate;
	};
	this.setSearchReceivedDate = function(value) {
		this.receivedDate = value;
	};
	this.getSearchReceivedEndDate = function() {
		return this.receivedEndDate;
	};
	this.setSearchReceivedEndDate = function(value) {
		this.receivedEndDate = value;
	};
	this.getSearchErrorMessage = function() {
		return this.searchErrorMessage;
	};
	this.setSearchErrorMessage = function(value) {
		this.searchErrorMessage = value;
	};
	this.getSearchErrMsgCaseSensitivity = function() {   
		return this.searchErrMsgCaseSensitivity;
	};
	this.setSearchErrMsgCaseSensitivity = function(value) {
		this.searchErrMsgCaseSensitivity = value;
	};	
	this.getSearchID = function() {
		return this.searchID;
	};	
	this.setSearchID = function(value) {
		this.searchID = value;
	};
	this.getSearchIDType = function() {
		return this.IDType;
	};	
	this.setSearchIDType = function(value) {
		this.IDType = value;
	};	
	this.getTableState = function() {
		return this.tableState;
	};
	this.setTableState = function(value) {
		this.tableState = value;
	};
	this.getGridState = function() {
		return this.gridState;
	};
	this.setGridState = function(value) {
		this.gridState = value;
	};
	this.getPartners = function() {
		return this.partners;
	};
	this.setPartners = function(value) {
		this.partners = value;
	};
	this.getIsSearching = function() {
		return this.isSearching;
	};
	this.setIsSearching = function(value) {
		this.isSearching = value;
	};
	this.getSearchButtonText = function() {
		return this.searchButtonText;
	};
	this.setSearchButtonText = function(value) {
		this.searchButtonText = value;
	};
	this.setSearchAction = function(isSearching, buttonText){
		this.setIsSearching(isSearching);
		this.setSearchButtonText(buttonText);
		$rootScope.$broadcast('$handleSearchEvent');
	};
	
	this.checkDate = function( theDate ){
		return validateDate( theDate);
    };
    this.getParamsFromSyntax = function(){
		return syntaxValues;
	};
	this.validateSyntax = function(partnerList, value) {
		inputParams = [];
		partners = [];
		uppercasePartners = [];
		syntaxValues = {};
		validSyntax = false;
		if( value != null && value.length > 0 ) {
		    getInputParams( value );
		    for( var i = 0; i < partnerList.length; i ++ ) {
			   partners.push( partnerList[i].partner );
		       uppercasePartners.push( partnerList[i].partner.toUpperCase() );
		    } 
		    parse( value );
		}
		return validSyntax;
	};
	function validateDate( theDate ){
		var flag = false;
		var year = parseInt( theDate.substring(0,4), 10 );
        var month = parseInt( theDate.substring(4,6), 10 );
        var date = parseInt( theDate.substring(6), 10 );
        
        if(month < 1 || month > 12) {
            flag = true;
        }
        if(date < 1 || date > 31) {
        	flag = true;
        }
        if((month == 4 || month == 6 || month == 9 || month == 11) && (date >= 31)) {
        	flag = true;
        }
        if(month == 02) {
            if(year % 4 != 0){
                if(date > 28) {
                	flag = true;
               }
            }
            if(year % 4 == 0){
                if(date > 29){
                	flag = true;
               }
            }
        }
        var inputDate = new Date(year, month-1, date); //input date
        var minDate = new Date( 2012, 1, 1 ); //oldest date-Feb 1 2012
        var maxDate = new Date(); //newest date- current date
        if( inputDate < minDate || inputDate > maxDate ) {
        	flag = true;
        }
        return flag;
	}
	function getInputParams( str ) {
	    var pattern = "[a-zA-Z0-9]+(?=\\()";
		var regExp = new RegExp( pattern , "g");
		var names = str.match(regExp);
		if( names != null && names.length > 0 ) {
		    for( var i = 0; i < names.length; i++ ) {
		    	var index = params.indexOf( names[i].toLowerCase() );
		        if( index > - 1 ) {
		            inputParams.push( names[i].toLowerCase());
		        }
		    }
		}
		else {
			validSyntax = false;
		}
    }
	function parse( str ){
		var name = searchStartToken( str );
		if( name != null && name.length > 0 ) {
			var newStr = searchEndToken(name, str );
			if( newStr!= null && validSyntax == true ) {
		       parse( newStr );
			}
		}
		else{
			validSyntax = false;
		}
	}
	//search the start token and get parameter name.
	function searchStartToken( str ) {
	    var index = str.indexOf("(");
	    var name = str.substring(0, index );
	    index = params.indexOf( name.toLowerCase() );
		if( index == -1 ) {
		   validSyntaxFlag = false;
		   return;
		}
		return name;
	}
	//get next input param name
	function getNextInputParam( paramName ){
	   var index = inputParams.indexOf( paramName.toLowerCase() );
	   if( index > - 1 && index < inputParams.length ) {
	       return inputParams[ index + 1 ];
	   }
	   return;
	}
	//search the end token, get parameter value and return next search string.
	function searchEndToken( name, str ) {
	   var pattern;
	   var nextParam = getNextInputParam( name );
	   if( nextParam != null && nextParam.length > 0 ) {
	       pattern = name + "\\((.*)\\)\\s+and\\s+(" + nextParam + "\\(.*)";
	   }
	   else {
		   pattern = name + "\\((.*)\\)\\s*";
	   }
	   var regExp = new RegExp( pattern , "i");
	   if( regExp.test( str ) ) {
	      validateParam( name.toLowerCase(), str.match( regExp )[1].trim());
		  return str.match( regExp )[2];
	   }
	   else{
		   validSyntax = false;
	   }
	   return;
	}
	function validateDateFormat( theDate ){
		if( theDate!= null && theDate.length == 8 ){ 
            var pattern = "\\d{4}\\d{2}\\d{2}";
		    var regExp = new RegExp( pattern , "g");
		    return regExp.test(theDate);
		}
		else {
			return false;
		}
	}
	function validateParam( name, value ) {
		if( name == "ip"){
			var index = uppercasePartners.indexOf( value.toUpperCase() );
			if( index > -1 ){
				syntaxValues[name] = partners[index];
			    validSyntax = true;	
			}
			else{
				validSyntax = false;
			}
		}
		else if( name == "rcv") {
			var startDate = null;
			var endDate = null;
			var index = value.indexOf("-");
			if( index > - 1) {
				startDate = value.substring( 0, index ).trim();
			    endDate = value.substring(index +1 ).trim();
			}
			else{
				startDate = value.trim();
			}
			if( startDate != null && startDate.length > 0 ) {
				validSyntax = validateDateFormat( startDate );
				if( validSyntax ) {
				    validSyntax = !validateDate( startDate );
				}
				if( validSyntax && endDate != null && endDate.length > 0 ) {
					validSyntax = validateDateFormat( endDate );
					if( validSyntax ) {
					    validSyntax = !validateDate( endDate );
					}
				}
				if( validSyntax ){
				   syntaxValues[name] = value;
				}
			}
		}
		else{
			syntaxValues[name] = value;
			validSyntax = true;
		}
	}
	
	this.getProviderList = function(){
       if(this.partners == null){
	      this.partners = getPartners();
		  return this.partners;
	   }
	   else{
		  return this.partners;
	   }
	}; 
	
	function getPartners(){
	   logger.log('(searchResultService) before service call for get-partner');
       return $http.get(propertiesService.getServiceUrlBase() + "Partner/Get")
          .then(function (response){
	         this.partners = response.data;
		  	 logger.log('(searchResultService) after service call for get-partner - success');
		 	 return response.data;
	   });
	};
});