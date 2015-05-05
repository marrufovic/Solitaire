/*
 * SolitaireController.js
 * Authors: TeamRat-UofU
 * Date: 4/15/2015
 * Controller for the Solitaire application. Makes calls to the Model and View 
 * when a new game is requested and when users move cards.
 *
 */



(function(window) {

	//classes
	var SolitaireController = function(model, view)
	{
		var _this = this;
		this.model = model;
		this.view = view;

		//use closure beacause if we just set onCardMoved to _cardMoved, "this" would refer to the view
		//alternatively we could use function.bind
		this.view.onNewGameStarted = function(gameType) {
			var gameRules = new SolitaireGameRules();
			gameRules.loadGame("rules/" + gameType + ".json", function() {
				_this.model.newGame(gameType); 
			});
		};
	        // Callbacks 
		this.view.onCardMoved = function(card, pile, pos) { _this.model.moveCard(card, pile, pos); };
		this.view.onPileActivated = function(pile, card) { _this.model.activatePile(pile, card); };

		this.model.onNewGameReady = function(piles, gridSize) { _this.view.onNewGame(piles, gridSize); }
		this.model.onCardMoved = function(card, oldPile, newPile) { _this.view.onModelMovedCard(card, oldPile, newPile); };
		this.model.onCardUpdated = function(card) { _this.view.onModelUpdatedCard(card); };
		this.model.onGameWon = function() { _this.view.onGameWon(); };

	}

	window.SolitaireController = SolitaireController;


})(window);

