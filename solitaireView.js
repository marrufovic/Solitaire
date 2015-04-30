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
	

	// still need to amek the rectangles resize
	function rectangle( x, y, width, height, backgroundColor, borderColor, borderWidth ) { 
	    var box = new PIXI.Graphics();
	    box.beginFill(backgroundColor);
	    box.lineStyle(borderWidth , borderColor);
	    box.drawRect(0, 0, width - borderWidth, height - borderWidth);
	    box.endFill();
	    box.position.x = x  ;
	    box.position.y = y  ;

	    box.scale.x = box.scale.y = (window.innerWidth + window.innerHeight)/2000;
	    return box;
	};


	// create a 100x100 white rectangle with a 10px black border at position 10/10
	stage.addChild(rectangle(window.innerHeight *.7 , window.innerHeight * .03 , 90, 110 , 0xFFFFFF, 0x000000, 5));
	stage.addChild(rectangle(window.innerHeight *.9 ,window.innerHeight * .03 , 90, 110 , 0xFFFFFF, 0x000000, 5));
	stage.addChild(rectangle(window.innerHeight *1.1,window.innerHeight * .03  , 90, 110 , 0xFFFFFF, 0x000000, 5));
	stage.addChild(rectangle(window.innerHeight *1.3,window.innerHeight * .03  , 90, 110 , 0xFFFFFF, 0x000000, 5));
	
	
	var check = true;
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
		y = window.innerHeight * .1;
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
		    // The waste pile is inbetween 1/8 and 2/8 the screen width...may need to adjust if we choose to have 3 cards dealt
		    // from the stock pile
		    card.position.x = (3/16) * window.innerWidth;  
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

	    // set the events for when the mouse is released or a touch is released
	    card.mouseup = card.mouseupoutside = card.touchend = card.touchendoutside = function(data)
	    {

		// TODO: 
		// -account for the Y value of the card
		// -this potentially doesn't work with some versions of solitaire, would work for klondike (7 columns)
		// -the x value for a card isn't getting reset. It moves if it is within the bounds of the column, but if it is outside of it
		//  then it goes back to the position it was created in (its original x value, not the last x value it was at)
		// -need to account for the stockpile and if a card is dragged to the upper slots (I think we call them winpiles..)
		//  e.g. if we drag from the stockpile to the lower columns vs just clicking on the stockpile to deal new cards. 
		

		// This breaks up the board into different columns and gives each column a width in which the card will snap to the center of the column (+- .5*card.width)
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

		

		// Would be -1 if it was from stockpile or if when the card was released, it wasn't in any of the columns
		// We need to account for if the user drags from the stockpile onto one of the columns. As it is right now 
		// it just snaps it to the 
		if (col === -1)
		{
		    if (card_obj.pile.pileId === "stock1")
			card.position.x = (3/16) * window.innerWidth;
		    else 
			card.position.x = x;		
		
		}
		else
		{
		    console.log(col);
		    card.position.x = (col/8)*window.innerWidth; 
		    card.position.y = y;
		}


		this.alpha = 1
		this.dragging = false; 
		//var pileType = card.pile.pileType;
		
		// 
		if (model.canDropCard(card_obj, card_obj.pile, 1))
		{
		    //alert('here');
		}
		else
		{

		    //console.log(card_obj.pile);
		    //card.position.x = x;
		    //card.position.y = y;

		    console.log(card_obj.pile);
		    card.position.x = x;
		    card.position.y = y;
		    //returnsound=createSound("click.ogg", "click.mp3");
		    returnsound.playclip();//-Dharani testing
		}
		
		//	if(card.pile.pileId !== "stock1")
		//	{
		//	    card.position.x = x;
		//	    card.position.y = y;
		//	}
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
	    window.onresize = resize;
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



        /**
	 * resize the c4 sprite so that it takes up most of the screen
	 *
	 */
	function resize (event)
	{
	    
	    console.log("--------------------");
	    //console.log("  Window Size: " + window.innerWidth + ", " + window.innerHeight);
	    //console.log("  C4 current    x,y, w,h  " + c4.position.x + ", " + c4.position.y + ": "+ c4.width   + ", " + c4.height);
	    
	    //  boundingbox.clear();
	    //boundingbox.lineStyle(2,0xffffff);
	    //boundingbox.beginFill(0xFFFF0B, 0);
	    //boundingbox.drawRect(0,0,window.innerWidth, window.innerHeight);
	    //boundingbox.endFill();
	    
	    
	    //
	    // Resize Renderer Window
	    //
	    renderer.resize(window.innerWidth, window.innerHeight);

	    //
	    // find current c4 bounds and resize/reposition c4 board
	    //
	    //    var c4_bounds = PIXI.DisplayObjectContainer.prototype.getBounds.call(c4).clone();
	    
	    //
	    // need to compute new scale based on original size of C4 sprite, so 
	    // put back to original size
	    //
	    
	    stage.scale.x = 1;  // WARNING: must compute center based on original size, not previous scaled size
	    stage.scale.y = 1;
	    
	    var dw = (window.innerWidth-100)/stage.width; //stage_bounds
	    var dh = (window.innerHeight-100)/stage.height; // stage_bounds
	    var dm = Math.min(dw,dh);
	    
	    stage.scale.x = dm;
	    stage.scale.y = dm;
	    
	    //
	    // find current stage bounds and resize/reposition stage board
	    //
	    //    var stage_bounds = PIXI.DisplayObjectContainer.prototype.getBounds.call(stage).clone();
	    stage.position.x = (window.innerWidth/2) - (stage.width/2) +100 ;
	    stage.position.y = (window.innerHeight/2) - (stage.height/2) -15;
	    
	    
	    
	    //    renderer.render(stage);     // render the stage (required to recompute the acutal size of the sprite)
	    //    stage_bounds = PIXI.DisplayObjectContainer.prototype.getBounds.call(stage).clone();
	    
	    
	    //stage.position.x = 0;
	    //stage.position.y = 0;
	    
	    //    stage.updateTransform();
	    
	    //    renderer.render(stage);     // render the stage (required to recompute the acutal size of the sprite)
	    //    stage_bounds = PIXI.DisplayObjectContainer.prototype.getBounds.call(stage).clone();
	    
	    //    console.log("  STAGE bounds x,y, w,h  " + stage_bounds.x + ", " + stage_bounds.y + ": "+ stage_bounds.width   + ", " + stage_bounds.height);
	    //	console.log("  STAGE final  x,y, w,h  " + stage.position.x + ", " + stage.position.y + ": "+ stage.width   + ", " + stage.height);
	    
	    //	console.log("   scale: " + dw + ", " + dh);
	    
	    
	    //stage_bounds = PIXI.DisplayObjectContainer.prototype.getBounds.call(stage).clone();
	    //console.log("  STAGE final bounds x,y, w,h  " + stage_bounds.x + ", " + stage_bounds.y + ": "+ stage_bounds.width   + ", " + stage_bounds.height);
	    
	    //    boundingbox.position.x = stage.position.x;
	    //    boundingbox.position.y = stage.position.y;
	    
	    //    boundingbox.clear();
	    //    boundingbox.lineStyle(2,0xffffff);
	    //    boundingbox.beginFill(0xFFFF0B, .1);
	    //    boundingbox.drawRect(stage_bounds.x, stage_bounds.y, stage_bounds.width, stage_bounds.height);
	    //    boundingbox.endFill();
	    
	    
	    stage.updateTransform();
	    //renderer.clearBeforeRender = true;
	    //stage.dirty = true;

	};

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

