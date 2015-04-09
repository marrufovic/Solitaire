//SolitaireModel.js

(function(window) {

	//classes
	var SolitaireModel = function()
	{
	}

	SolitaireModel.prototype.newGame = function(gameRules)
	{
	}

	SolitaireModel.prototype.moveCard = function(card, pile)
	{
		console.log("model: move card");
		return true;
	}

	window.SolitaireModel = SolitaireModel;

})(window);