errorToolApp.filter('replaceAllFilter', function () {
    return function (userInput, searchFor, replaceWith) {
    	var re = new RegExp(searchFor,"g");
    	return userInput.replace(re, replaceWith);
      };
});