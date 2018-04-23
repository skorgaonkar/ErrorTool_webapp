/* Date Range service */
errorToolApp.service('dateRangeService', function($rootScope) {
	
	this.dateRangeLabel;
	this.startDate;
	this.endDate;
	this.dateError;
	
	this.getDateRangeLabel = function() {
		return this.dateRangeLabel;
	};
	this.setDateRangeLabel = function(val) {
		this.dateRangeLabel = val;
	};
	this.getStartDate = function() {
		return this.startDate;
	};
	this.setStartDate = function(val) {
		this.startDate = val;
	};

	this.getEndDate = function() {
		return this.endDate;
	};
	this.setEndDate = function(val) {
		this.endDate = val;
	};
	this.hasDateError = function() {
		return this.dateError;
	};
	this.setDateError = function(val) {
		this.dateError = val;
	};
	this.checkDateRange = function() {
		$rootScope.$broadcast('$handleCheckDateRangeEvent');
	};
	this.checkDate = function( theDate ){
		return validateDate( theDate);
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
});