errorToolApp.filter('replaceFirstFilter', function () {
    return function (userInput, searchFor, replaceWith) {
    	return userInput.replace(searchFor, replaceWith);
      };
});