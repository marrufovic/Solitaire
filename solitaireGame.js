//solitaireGame.js

var gameRules = new SolitaireGameRules()
gameRules.loadGame("rules/klondike3.json", 
	function() {
	var model = new SolitaireModel(gameRules);
	var view = new SolitaireView(model);
	var controller = new SolitaireController(model, view);

	model.newGame(gameRules);

	//pretend view received a drag & drop
	//view.onCardDropped("a", "b");
	console.log(model.piles['pile2'].peekCard());
	console.log(model.canGrabCard(model.piles['pile2'].peekCard()));
});