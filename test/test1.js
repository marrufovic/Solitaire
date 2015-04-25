//solitaireGame.js

var gameRules = new SolitaireGameRules()
gameRules.loadGame("test1.json", 
	function() {
	var model = new SolitaireModel(gameRules);

	model.onNewGameReady = function(piles, gridSize) { }
	model.onCardMoved = function(card, oldPile, newPile) { };
	model.onCardUpdated = function(card) { };
	model.onGameWon = function() { };

	model.newGame(gameRules);

	var output = "Test 1: ";
	var result = true;

	var pile1 = model.piles['pile1'];
	var pile2 = model.piles['pile2'];

	while(pile1.getCount() > 0)
	{
		var card = pile1.peekCard();
		if(!model.canGrabCard(card))
		{
			result = false;
			break;
		}

		model.moveCard(card, pile2);

		var movedCard = pile2.peekCard();
		if(movedCard !== card)
		{
			result = false;
			break;
		}

	}
	
	if(pile2.getCount() !== 52)
		result = false;



	var testOutput = document.getElementById('test-result');
	testOutput.innerHTML += "</br>" + output + result;
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

	//console.log(model.canDropCard(ca
});