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
	var card = model.piles['pile2'].peekCard();
	var pile = model.piles['pile3'];
	console.log(card);
	// console.log(pile.peekCard('top'));
	// console.log(model.canGrabCard(card));
	var nextCard = new SolitaireCard('clubs', card.rank - 1, true);
	console.log(nextCard);
	console.log(model.canDropCard(nextCard, card.pile, 'top'));
});