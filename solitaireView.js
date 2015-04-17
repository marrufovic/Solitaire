//SolitaireView.js
// James Lundgren-testing again making another change
// Victor Marrufo

(function(window) {

	//classes
	var SolitaireView = function(model)
	{
		this.model = model;
	
	       

	        // Dictionary that will hold all of our cards
	        this.textures = {};

	        // fill the dictionary with the cards 
	        for (var i = 0; i < 4; i++)
		{
		    
		    var suit = null;

		    // i corresponds to the different suits
		    if(i  === 0)
			suit = "clubs" 
                    
		    else if(i  === 1)
			suit = "hearts";
		    
		    else if(i  === 2)
 			suit = "diamonds";

		    else
			suit = "spades";
		
		    var rank = null;

		    // loop through all the cards in that suit and set the image 
		    for(var j = 1; i < 14; j++)
		    {
			rank = j; 
			this.textures{suit+rank: PIXI.Texture.fromImage("images/" + suit + "/" + rank + ".png")};
		    }   
                }   
	        


	        //initialize pixi, view variables, etc
	        var stage = new PIXI.Stage(0xF2343F, true);
	        var renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, null);

	        document.body.appendChild(renderer.view);
                renderer.view.style.position = "absolute";
                renderer.view.style.top = "0px";
                renderer.view.style.left = "0px";
	        requestAnimFrame( animate );
	        
	        
	      
	        // Pass in the image that is associated with the card
	        SolitaireView.prototype.createCard = function(x, y, texture)
	        {
		    var card = new PIXI.Sprite(texture);
		
		    card.interactive = true;
		    
		    // this button mode will mean the hand cursor appears when you rollover the card with your mouse
		    card.buttonMode = true;
		    
		    // center the cards anchor point
		    card.anchor.x = 0.5;
		    card.anchor.y = 0.5;
		    // make it a bit bigger, so its easier to touch
		    card.scale.x = card.scale.y = 0.5;
		    
		    // use the mousedown and touchstart
		    card.mousedown = card.touchstart = function(data)
		    {
			//data.originalEvent.preventDefault()
			// store a refference to the data
			// The reason for this is because of multitouch
			// we want to track the movement of this particular touch
			this.data = data;
			this.alpha = 0.9;
			this.dragging = true;
			this.sx = this.data.getLocalPosition(card).x * card.scale.x;
			this.sy = this.data.getLocalPosition(card).y * card.scale.y;};
		    
		    // set the events for when the mouse is released or a touch is released
		    card.mouseup = card.mouseupoutside = card.touchend = card.touchendoutside = function(data)
		    {
			this.alpha = 1
			this.dragging = false;
			// set the interaction data to null
			this.data = null;
		    };
		    
		    // set the callbacks for when the mouse or a touch moves
		    card.mousemove = card.touchmove = function(data)
		    {
			if(this.dragging)
			{
			    // need to get parent coords..
			    var newPosition = this.data.getLocalPosition(this.parent);
			    // this.position.x = newPosition.x;
			    // this.position.y = newPosition.y;
			    this.position.x = newPosition.x - this.sx;
			    this.position.y = newPosition.y - this.sy;
			}
		    }
		 


		    // move the sprite to its designated position
		    card.position.x = x;
		    card.position.y = y;
		    
		    // add it to the stage
		    stage.addChild(card);
		    
		}
	    
	        function animate()
	        {
		    requestAnimFrame( animate ); 
		    renderer.render(stage);
		}
	    


		
	        this.piles = {};
	        
		this.onCardMoved = null;
		this.onCardActivated = null;
	};

	SolitaireView.prototype.moveCard = function(card, pile)
	{
		console.log("view: model moved card");
	};


	//piles: associative array of pileId=>SolitairePile
	//gridSize: size of the display grid as object, e.g. {"width" : 8, "height" : 6}
	SolitaireView.prototype.onNewGame = function(piles, gridSize)
	{
		for (var pileId in piles)
		{
    		if (piles.hasOwnProperty(pileId))
    		{
        		var pile = piles[pileId];
        		var pileView = new SolitairePileView(pile);
        		this.piles[pileId] = pileView;
        		for(var i = 0; i < pile.getCount(); i++)
        		{
        			var card = pile.peekCard(i);
        			var cardView = new SolitaireCardView(card, this);
        			pileView.cards.push(cardView);
        		}
    		}
    	}
	};

	SolitaireView.prototype.onModelMovedCard = function(card, oldPile, newPile)
	{

	};

	SolitaireView.prototype.onModelUpdatedCard = function(card)
	{

	};

	SolitaireView.prototype.onGameWon = function()
	{

	};

	window.SolitaireView = SolitaireView;


	var SolitairePileView = function(pile)
	{
		this.pile = pile;
		this.cards = [];
	};

	var SolitaireCardView = function(card, solitaireView)
	{
		// 1 = ace 2= 2....king = 13
	        // clubs diamonds hearts spades
		  
		this.card.rank
		this.card.facingUp;
	        var texture = solitaireView.textures[this.card.suit + this.card.rank]; 
	        
	        // this.card.pile.getCardPosition(this.card) - returns index of what card position is of the card on the pile 
	        // 0 is bottom card, top is length -1 
	        // 
	    
	        solitaireView.createCard(this.card.pile.x, this.card.pile.y, texture);
	};

})(window);



function buildBoard(){

/*
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
  */
    var output = 
    document.getElementById('game_board').innerHTML = output;
    
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
