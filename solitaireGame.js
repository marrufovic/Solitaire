/*
 * solitaireGame.js
 * Authors: TeamRAT-UofU
 * Date: 4/18/2015
 * Loads a game based off of what the user selects
 */
var gameRules = new SolitaireGameRules();
gameRules.loadGame(game, 

	function() {
	var model = new SolitaireModel(gameRules);
	var view = new SolitaireView(model);
	var controller = new SolitaireController(model, view);

	model.newGame(gameRules);
});
