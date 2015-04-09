//SolitaireView.js

(function(window) {

	//classes
	var SolitaireView = function(model)
	{
		this.model = model;
		//initialize pixi, view variables, etc

		this.onCardDropped = null;
	}

	SolitaireView.prototype.moveCard = function(card, pile)
	{
		console.log("view: model moved card");
	}

	window.SolitaireView = SolitaireView;


})(window);