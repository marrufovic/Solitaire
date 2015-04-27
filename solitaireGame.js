//solitaireGame.js

var gameRules = new SolitaireGameRules()
//gameRules.loadGame("rules/klondike3.json", 
gameRules.loadGame("rules/freecell.json", 
	function() {
	var model = new SolitaireModel(gameRules);
	var view = new SolitaireView(model);
	var controller = new SolitaireController(model, view);

	model.newGame(gameRules);


	console.log(model.piles)
	//pretend view received a drag & drop
	//view.onCardDropped("a", "b");
	// var card = model.piles['pile2'].peekCard();
	// var pile = model.piles['pile3'];
	// console.log(card);
	// // console.log(pile.peekCard('top'));
	// //console.log(model.canGrabCard(card));
	// var altSuit = null;
	// if(card.suit === 'clubs' || card.suit === 'spades')
	// 	altSuit = 'diamonds';
	// else
	// 	altSuit = 'clubs';
	// var nextCard = new SolitaireCard(altSuit, card.rank - 1, true);
	// model.piles['stockPlay'].putCard(nextCard);
	// console.log(nextCard);
	// console.log(model.canDropCard(nextCard, card.pile, 'top'));
	// model.moveCard(nextCard, card.pile, 'top');

	// console.log(nextCard);

	//console.log(model.canDropCard(card, pile, 'top'));
});