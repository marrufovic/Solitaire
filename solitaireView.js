//SolitaireView.js
// James Lundgren-testing again making another change
// Victor Marrufo

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

function buildBoard(){
    var output = "<div id='deck'>deck</div>"
      +"<div id='waste'>waste</div>"
      +"<div id=dest>"
      +"<div id='dest1'>destination 1</div>"
      +"<div id='dest2'>destination 2</div>"
      +"<div id='dest3'>destination 3</div>"
      +"<div id='dest4'>destination 4</div>"
      +"</div>"
      +"<div id='piles'>"
      +"<div id='pile1'>pile 1</div>"
      +"<div id='pile2'>pile 2</div>"
      +"<div id='pile3'>pile 3</div>"
      +"<div id='pile4'>pile 4</div>"
      +"<div id='pile5'>pile 5</div>"
      +"<div id='pile6'>pile 6</div>"
      +"<div id='pile7'>pile 7</div>"
      +"</div>";
      
    document.getElementById('solitaireBoard').innerHTML = output;
    
    deck();
    waste();
}

function deck(){
    var cardToDisplay = "<img src='images/backOfCard.jpg' width='110' height='130' alt='deck'/>";
    document.getElementById('deck').innerHTML = cardToDisplay;
}

function waste(){
    var cardToDisplay = array[array.length - 1];
    document.getElementById('deck').innerHTML = cardToDisplay;
}
