//SolitaireController.js

(function(window) {

	//classes
	var SolitaireController = function(model, view)
	{
		var _this = this;
		this.model = model;
		this.view = view;

		//use closure beacause if we just set onCardDropped to _cardDropped, "this" would refer to the view
		//alternatively we could use function.bind
		this.view.onCardDropped = function(card, pile) { _this._cardDropped(card,pile); };
	}

	SolitaireController.prototype._cardDropped = function(card, pile)
	{
		console.log("controller: view dropped card");
		if(this.model.moveCard(card,pile))
		{
			this.view.moveCard(card, pile);
		}
	}

	window.SolitaireController = SolitaireController;


})(window);