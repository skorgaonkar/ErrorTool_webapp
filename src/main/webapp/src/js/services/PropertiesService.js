/* Properties service */
errorToolApp.service('propertiesService', function ($http, $location ) {
	this.properties = { toolsInstance: ""
		              , ETVersionNumber: ""
	                  };
	this.urlBase;
	
	/*Assuming service application on the same sever*/
	this.getServiceUrlBase = function() {
		//this.urlBase = $location.protocol() + "://" + $location.host() + ":" + $location.port() + "/OptiServices/rest/";
		return this.urlBase;
	};
	
	
	this.setServiceUrlBase = function(pipeLine) {
		if(pipeLine == "Bumblebee"){
			this.urlBase = $location.protocol() + "://" + $location.host() + ":" + $location.port() + "/errortool/";
		}
		else 
		{
			this.urlBase = $location.protocol() + "://" + $location.host() + ":" + $location.port() + "/OptiServices/rest/";	
		}
	};
		
	
	
	this.getProperties = function() {
		if( this.properties.toolsInstance == "" ) {
		  return $http.get( this.getServiceUrlBase() + "Property/Get");
		}
	};	
});
