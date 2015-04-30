/**
 * SolitaireView.js
 * Authors: James Lundgren, Victor Marrufo, Elliot Hatch, Dharani Adhikari
 * 
 */


(function(window) {

    
    //classes
    var SolitaireView = function(model)
    {
	this.model = model;
	
	
	// Dictionary that will hold all of our cards
	//this.textures = {};

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
	    for(var j = 1; j < 14; j++)
	    {
		rank = j;

 		var texture = PIXI.Texture.fromImage("images/" + suit + "/" + rank + ".png");
		var id = suit + rank; 
		PIXI.Texture.addTextureToCache(texture, id);
		
		//this.textures[suit+rank] = PIXI.Texture.fromImage("images/" + suit + "/" + rank + ".png");
	    }   
        }   
	

	var texture = PIXI.Texture.fromImage("images/backOfCard.png");
	var id = "facedown"; 
	PIXI.Texture.addTextureToCache(texture, id);
	
	//this.textures["facedown"] = PIXI.Texture.fromImage("images/backOfCard.png");

	//initialize pixi, view variables, etc
	stage = new PIXI.Stage(0xF2343F, true);
	renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, document.getElementById("game_board"));

	document.body.appendChild(renderer.view);
        renderer.view.style.position = "absolute";
        renderer.view.style.top = "0px";
        renderer.view.style.left = "0px";
	//	        renderer.view.style.width= "800px";	        
	//	        renderer.view.style.height= "400px";
	requestAnimFrame( animate );
	
	
	var current_pile;
	var y_offset = 1.0; 
	var x_offset = 1.0; 

	// Pass in the image that is associated with the card
	//SolitaireView.prototype.createCard = function(x, y, texture, pile_id, facing_up)
	SolitaireView.prototype.createCard = function(card_obj, texture_start, texture_alternate)
	{
	    
	    //console.log(card_obj); 
	    var facing_up = card_obj.facingUp; 
	    var pile_id = card_obj.pile.pileId;
	    
	    
	    var start_text = PIXI.Texture.fromFrame(texture_start); 
	    
	    if (texture_alternate !== null)
		var alt_text = PIXI.Texture.fromFrame(texture_alternate); 
	    
	    var card = new PIXI.Sprite(start_text);


	    var y = card_obj.pile.position.y; 
	    var x = card_obj.pile.position.x; 
	    
	    if (typeof current_pile === 'undefined')
		current_pile = pile_id;
	    else if (current_pile !== pile_id)
	    {
		current_pile = pile_id;
		y_offset = 1.0; 
		//y *= y_offset; 
	    }
	    else if (pile_id === "stock1")
	    {
		if (facing_up)
		    x_offset = 1.7;
		else 
		    x_offset = 1.0; 
		current_pile = pile_id; 
		//alert(current_pile + " and  " + pile_id); 
		y_offset = 1.0; 
	    }
	    else if (current_pile === pile_id)
	    {
		//alert("in here");
		y_offset += 0.1; 
		//y *= y_offset; 
		
	    }
	    else
	    {
		y_offset = 1.0; 
	    }
	    
	    if(y === 0)
		y = window.innerHeight * .1 
	    else 
		y = window.innerHeight * y_offset * .3;

	    
	    x = ((x+1)/8)* window.innerWidth * x_offset; 


	    card.interactive = true;
	    
	    // this button mode will mean the hand cursor appears when you rollover the card with your mouse
	    card.buttonMode = true;
	    
	    // center the cards anchor point
	    card.anchor.x = 0.5;
	    card.anchor.y = 0.5;
	    // make it a bit bigger, so its easier to touch
	    card.scale.x = card.scale.y = (window.innerWidth + window.innerHeight)/2000;
	


	    // use the mousedown and touchstart
	    card.mousedown = card.touchstart = function(data)
	    {
		//data.originalEvent.preventDefault()
		// store a refference to the data
		// The reason for this is because of multitouch
		// we want to track the movement of this particular touch
		this.data = data;
		this.alpha = 0.9;
		
		if (card_obj.pile.pileId === "stock1")
		{
		    card.position.x += 100;  
		    card.setTexture(alt_text); 
		}

		if (model.canGrabCard(card_obj))
		    this.dragging = true;
		else 
		    this.dragging = false; 
		this.sx = this.data.getLocalPosition(card).x * card.scale.x;
		this.sy = this.data.getLocalPosition(card).y * card.scale.y;
		if (model.canGrabCard(card_obj))
		{
		    this.bringToFront();
		}
	    };
	    

	    PIXI.Sprite.prototype.bringToFront = function(){
		if(this.parent){
		    var parent = this.parent;
		
		    parent.removeChild(this);
		    parent.addChild(this);
		}
		
	    };


	    var isIntersecting = function(c1, c2)
	    {
		return !(c2.x > (c1.x + c1.width) || (c2.x + c2.width) < c1.x || c2.y > (c1.y + c1.height) || (c2.y + c2.height) <c1.y); 
	    }


	    // set the events for when the mouse is released or a touch is released
	    card.mouseup = card.mouseupoutside = card.touchend = card.touchendoutside = function(data)
	    {

		var col;
		if(card.position.x > ((1/8)*window.innerWidth - (.5*card.width)) && card.position.x < ((1/8)*window.innerWidth + (.5*card.width)))
		{
		    col = 1; 
		}
		else if(card.position.x > ((2/8)*window.innerWidth - (.5*card.width)) && card.position.x < ((2/8)*window.innerWidth + (.5*card.width)))
		{
		    col = 2; 
		}
		else if(card.position.x > ((3/8)*window.innerWidth - (.5*card.width)) && card.position.x < ((3/8)*window.innerWidth + (.5*card.width)))
		{
		    col = 3; 			
		}
		else if(card.position.x > ((4/8)*window.innerWidth - (.5*card.width)) && card.position.x < ((4/8)*window.innerWidth + (.5*card.width)))
		{
		    col = 4; 
		}
		else if(card.position.x > ((5/8)*window.innerWidth - (.5*card.width)) && card.position.x < ((5/8)*window.innerWidth + (.5*card.width)))
		{
		    col = 5; 
		}
		else if(card.position.x > ((6/8)*window.innerWidth - (.5*card.width)) && card.position.x < ((6/8)*window.innerWidth + (.5*card.width)))
		{
		    col = 6; 
		}
		else if(card.position.x > ((7/8)*window.innerWidth - (.5*card.width)) && card.position.x < ((7/8)*window.innerWidth + (.5*card.width)))
		{
		    col = 7; 
		}
		else 
		{
		    col = -1;  
		}    
		
		
		this.alpha = 1
		this.dragging = false;
		
		if (col === -1)
		    card.position.x = x;
		
		else if(card_obj.pile.pileId !== "stock1")
		{
		    console.log(col);
		    card.position.x = (col/8)*window.innerWidth; 
		    card.position.y = y;
		}
		
		
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
	    

	    //------------------------------------------------------------
	    // This is only being called on the last object being created...
	    // need to fix this so the method is called on all card objects. 
	    // window.onresize = resize;
	    //------------------------------------------------------------


	    //resize();

	    
	    // move the sprite to its designated position
	    card.position.x = x;
	    card.position.y = y;
	    
	    //console.log(stage.width);
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
	this.card = card;
	//this.card.rank
	//this.card.facingUp;
	var start_texture = null;
	var alternate_texture = null;

	//console.log(this.card.pile.pileId);
	if (this.card.facingUp)
	{
	    start_texture = this.card.suit + this.card.rank; //= solitaireView.textures[this.card.suit + this.card.rank]; 
	}
	else
	{    
	    start_texture = "facedown";//solitaireView.textures["facedown"]; 
	    alternate_texture = this.card.suit + this.card.rank;  //solitaireView.textures[this.card.suit + this.card.rank]; 
	}
	// this.card.pile.getCardPosition(this.card) - returns index of what card position is of the card on the pile 
	// 0 is bottom card, top is length -1 
	solitaireView.createCard(this.card, start_texture, alternate_texture); 


	
	/**
	 * resize the card sprite 
	 *
	 */
	/*
	function resize (event, card, stage)
	{
	    
	    console.log("--------------------");
	    
	    //
	    // Resize Renderer Window
	    //
	    renderer.resize(window.innerWidth, window.innerHeight);
	    
	    // need to compute new scale based on original size of C4 sprite, so 
	    // put back to original size
	    //
	    
	    card.scale.x = 1;  // WARNING: must compute center based on original size, not previous scaled size
	    card.scale.y = 1;
	    
	    var dw = (window.innerWidth-100)/card.width; //card_bounds
	    var dh = (window.innerHeight-100)/card.height; // card_bounds
	    var dm = Math.min(dw,dh);
	    
	    card.scale.x = dm;
	    card.scale.y = dm;
	    
	    //
	    // find current card bounds and resize/reposition card board
	    //
	    //    var card_bounds = PIXI.DisplayObjectContainer.prototype.getBounds.call(card).clone();
	    card.position.x = (window.innerWidth/2) - (card.width/2) +100 ;
	    card.position.y = (window.innerHeight/2) - (card.height/2) -15;
	    
	    
	    stage.updateTransform();
	    
	};
	*/
	
        // solitaireView.createCard(this.card.pile.position.x, this.card.pile.position.y, texture, this.card.pile.pileId, this.card.facingUp); 
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

