//SolitaireController.js

// Elliot, I am still going over what you have done and trying to learn the game rules. I haven't been able to focus
// on it a lot because I have been sick for last few days. I will keep working on it over next few days. -Dharani

(function(window) {

	//classes
	var SolitaireController = function(model, view)
	{
		var _this = this;
		this.model = model;
		this.view = view;

		//use closure beacause if we just set onCardMoved to _cardMoved, "this" would refer to the view
		//alternatively we could use function.bind

		this.view.onCardMoved = function(card, pile) { _this.model.moveCard(card, pile); };
		this.view.onCardActivated = function(card) { _this.model.activateCard(card); };

		this.model.onNewGameReady = function(piles, gridSize) { _this.view.onNewGame(piles, gridSize); }
		this.model.onCardMoved = function(card, oldPile, newPile) { _this.view.onModelMovedCard(card, oldPile, newPile); };
		this.model.onCardUpdated = function(card) { _this.view.onModelUpdatedCard(card); };
		this.model.onGameWon = function() { _this.view.onGameWon(); };

	}

	window.SolitaireController = SolitaireController;


})(window);
