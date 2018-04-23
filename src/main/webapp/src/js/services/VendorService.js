/* Vendor service */
errorToolApp.service('vendorService', function($cookies) {
	this.returnToVendorPartners = [];
	
	this.getReturnToVendorPartners = function(){
		var vendorPartners = $cookies.get('returnToVendorPartners');
		if( vendorPartners != null ){
	        this.returnToVendorPartners = vendorPartners.toString().split(",");
	    }
		return this.returnToVendorPartners;
	};
	
	this.isEligible = function(provider) {
		var eligible = false;
		var returnToVendorPartners = this.getReturnToVendorPartners();
		if( returnToVendorPartners != null && returnToVendorPartners.length > 0 ) {
			if( returnToVendorPartners.indexOf(provider) > -1){
			    eligible = true;
			}
		}
		return eligible;
    };
});
