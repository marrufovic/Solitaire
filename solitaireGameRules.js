/*solitaireGameRules.js
 * Authors: TeamRAT-UofU
 * Gets the json rule sheets 
 */ 
(function(window) {

	//classes
	var SolitaireGameRules = function()
	{
		this.rules = null;
	};

	SolitaireGameRules.prototype.loadGame = function(url, successCallback, errorCallback)
	{
		var _this = this;
		$.ajax({ url: url,
				dataType: "json",
				success: function(response) {
					_this.rules = response;
					if(typeof successCallback !== 'undefined')
						successCallback();
				},
				error: function( response, options, error ) {
					console.log("Error: " + error);
					if(typeof errorCallback !== 'undefined')
						errorCallback();
				}
		});
	}

	window.SolitaireGameRules = SolitaireGameRules;


})(window);
