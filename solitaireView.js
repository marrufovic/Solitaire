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
	this.gridSize = null;
	this.cardPixelSize = null;

	this.cardOffsetPercent = .2;

	this.piles = {};
	
	this.onCardMoved = null;
	this.onPileActivated = null;
	this.onNewGameStarted = null;

	this.stage = null;
	
	
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
	var pileTexture = PIXI.Texture.fromImage("images/redJoker.png");
	PIXI.Texture.addTextureToCache(pileTexture, 'pile');

	
	//this.textures["facedown"] = PIXI.Texture.fromImage("images/backOfCard.png");

	//initialize pixi, view variables, etc
	stage = new PIXI.Stage(0xF2343F, true);
	renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, document.getElementById("game_board"));

	//renderer.view.style.width = '800px';
	//renderer.view.style.height = '600px';
	document.body.appendChild(renderer.view);
        renderer.view.style.position = "absolute";
	renderer.view.style.top = "0px";
        renderer.view.style.left = "0px";
	renderer.view.style.minwidth= "800px";	  //Dharani uncommented. This should not hurt anything.      
	renderer.view.style.minheight= "400px";
	requestAnimFrame( animate );
	
	
	// still need to amek the rectangles resize
	/*	function rectangle( x, y, width, height, backgroundColor, borderColor, borderWidth ) { 
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
	*/

	// create a 100x100 white rectangle with a 10px black border at position 10/10
	// stage.addChild(rectangle(window.innerHeight *.7 , window.innerHeight * .03 , 90, 110 , 0xFFFFFF, 0x000000, 5));
	// stage.addChild(rectangle(window.innerHeight *.9 ,window.innerHeight * .03 , 90, 110 , 0xFFFFFF, 0x000000, 5));
	// stage.addChild(rectangle(window.innerHeight *1.1,window.innerHeight * .03  , 90, 110 , 0xFFFFFF, 0x000000, 5));
	// stage.addChild(rectangle(window.innerHeight *1.3,window.innerHeight * .03  , 90, 110 , 0xFFFFFF, 0x000000, 5));
	
	
	var check = true;
	var current_pile;
	var y_offset = 1.0; 
	var x_offset = 1.0; 

	SolitaireView.prototype._getCardTexture = function(cardModel)
	{
	    var textureName = 'facedown';
	    if(cardModel.facingUp)
		textureName = cardModel.suit + cardModel.rank;
	    return PIXI.Texture.fromFrame(textureName);
	};

	SolitaireView.prototype._getPilePixelPosition = function(pileModel)
	{
	    return {x: pileModel.position.x  * this.cardPixelSize.width,
		    y: pileModel.position.y * this.cardPixelSize.height};
	}

	SolitaireView.prototype._getCardPixelPosition = function(cardModel)
	{
	    var pilePosition = this._getPilePixelPosition(cardModel.pile);
	    
	    var cardPosition = cardModel.pile.getCardPosition(cardModel) % cardModel.pile.fanCount;
	    var cardOffset = this._calculateCardPixelOffset(cardModel.pile.fanDirection, cardPosition);

	    return {x: pilePosition.x + cardOffset.x, y: pilePosition.y + cardOffset.y};
	};


	SolitaireView.prototype._calculateCardPixelOffset = function(fanDirection, cardPosition)
	{
	    var cardOffset = {x: 0, y: 0 };

	    if(fanDirection === 'down')
	    {
		cardOffset.y = this.cardPixelSize.height * this.cardOffsetPercent;
	    }
	    else if(fanDirection === 'up')
	    {
		cardOffset.y = this.cardPixelSize.height * -this.cardOffsetPercent;
	    }
	    else if(fanDirection === 'left')
	    {
		cardOffset.x = this.cardPixelSize.width * -this.cardOffsetPercent;
	    }
	    else if(fanDirection === 'right')
	    {
		cardOffset.x = this.cardPixelSize.width * this.cardOffsetPercent;
	    }

	    cardOffset.x *= cardPosition;
	    cardOffset.y *= cardPosition;

	    return cardOffset;
	}

	SolitaireView.prototype.createPileSprite = function(pileModel)
	{
	    var texture = PIXI.Texture.fromFrame('pile');
	    var pile = new PIXI.Sprite(texture);

	    pile.width = this.cardPixelSize.width;
	    pile.height = this.cardPixelSize.height;

	    var pilePixelPosition = this._getPilePixelPosition(pileModel);
	    pile.position.x = pilePixelPosition.x;
	    pile.position.y = pilePixelPosition.y;

	    pile.interactive = true;    
	    pile.buttonMode = true;

	    var _this = this;

	    pile.click = pile.tap = function(interactionData)
	    {
	    	_this.onPileActivated(pileModel);
	    };

	    stage.addChild(pile);

	    return pile;
	};

	SolitaireView.prototype._getPileViewAtGridPosition = function(gridPosition)
	{
	    for(var pileId in this.piles)
	    {
		if(this.piles.hasOwnProperty(pileId))
		{
		    var pileView = this.piles[pileId];
		    if(pileView.pile.position.x === gridPosition.x && pileView.pile.position.y === gridPosition.y)
			return pileView;
		}
	    }
	    return null;
	};

	SolitaireView.prototype._getBoundingBoxOfPileView = function(pileView)
	{
	    var pilePixelPosition = this._getPilePixelPosition(pileView.pile);
	    var boundingBox = { x1: pilePixelPosition.x, y1: pilePixelPosition.y,
				x2: pilePixelPosition.x + this.cardPixelSize.width, y2: pilePixelPosition.y + this.cardPixelSize.height };

	    var topCardPosition = Math.min(pileView.pile.fanCount - 1, pileView.pile.getCount() - 1);
	    var cardOffset = this._calculateCardPixelOffset(pileView.pile.fanDirection, topCardPosition);
	    if(cardOffset.x >= 0)
	    {
		boundingBox.x2 += cardOffset.x;
	    }
	    else
	    {
		boundingBox.x1 += cardOffset.x;
	    }

	    if(cardOffset.y >= 0)
	    {
		boundingBox.y2 += cardOffset.y;
	    }
	    else
	    {
		boundingBox.y1 += cardOffset.y;
	    }

	    return boundingBox;
	};

	SolitaireView.prototype._pointInBoundingBox = function(point, boundingBox)
	{
	    return (point.x >= boundingBox.x1 && point.x <= boundingBox.x2 &&
		    point.y >= boundingBox.y1 && point.y <= boundingBox.y2);
	};

	// Pass in the image that is associated with the card
	//SolitaireView.prototype.createCard = function(x, y, texture, pile_id, facing_up)
	SolitaireView.prototype.createCardSprite = function(cardModel)
	{
	    var facing_up = cardModel.facingUp; 
	    var pile_id = cardModel.pile.pileId;
	    var texture = this._getCardTexture(cardModel);
	    var card = new PIXI.Sprite(texture);

	    card.width = this.cardPixelSize.width;
	    card.height = this.cardPixelSize.height;

	    var cardPixelPosition = this._getCardPixelPosition(cardModel);
	    card.position.x = cardPixelPosition.x;
	    card.position.y = cardPixelPosition.y;

	    card.interactive = true;
	    
	    // this button mode will mean the hand cursor appears when you rollover the card with your mouse
	    card.buttonMode = true;
	    
	    var _this = this;

	    card.click = card.tap = function(interactionData)
	    {
	    	_this.onPileActivated(cardModel.pile, cardModel);
	    };



	    // use the mousedown and touchstart
	    card.mousedown = card.touchstart = function(interactionData)
	    {
		//interactionData.originalEvent.preventDefault()
		// store a refference to the interactionData
		// The reason for this is because of multitouch
		// we want to track the movement of this particular touch
		this.interactionData = interactionData;
		this.alpha = 0.9;
		
		if (model.canGrabCard(cardModel))
		{
		    this.dragging = true;
		    _this.bringToFront(this)
		}
		else 
		    this.dragging = false; 
		this.sx = this.interactionData.getLocalPosition(card).x * card.scale.x;
		this.sy = this.interactionData.getLocalPosition(card).y * card.scale.y;
	    };


	    card.mouseover = function(interactionData)
	    {
	    };

	    // set the events for when the mouse is released or a touch is released
	    card.mouseup = card.mouseupoutside = card.touchend = card.touchendoutside = function(interactionData)
	    {

	    	if(this.dragging)
	    	{
		    var mousePosition = stage.getMousePosition();
		    //iterate through all the piles on this column and row, checking if the bounding box intersects
		    var droppedPileView = null;
		    //column
		    var col = Math.floor(mousePosition.x / _this.cardPixelSize.width);
		    for(var row = 0; row < _this.gridSize.width; row++)
		    {
			var pileView = _this._getPileViewAtGridPosition({x: col, y: row});
			if(pileView !== null)
			{
			    var pileBoundingBox = _this._getBoundingBoxOfPileView(pileView);
			    if(_this._pointInBoundingBox(mousePosition, pileBoundingBox))
			    {
				droppedPileView = pileView;
				break;
			    }
			}
		    }
		    //row
		    var row = Math.floor(mousePosition.y / _this.cardPixelSize.height);
		    for(var col = 0; col < _this.gridSize.height; col++)
		    {
			var pileView = _this._getPileViewAtGridPosition({x: col, y: row});
			if(pileView !== null)
			{
			    var pileBoundingBox = _this._getBoundingBoxOfPileView(pileView);
			    if(_this._pointInBoundingBox(mousePosition, pileBoundingBox))
			    {
				droppedPileView = pileView;
				break;
			    }
			}
		    }
		    if (droppedPileView !== null && model.canDropCard(cardModel, droppedPileView.pile, 'top'))
		    {
			_this.onCardMoved(cardModel, droppedPileView.pile, 'top');
			dropsound.playclip();

			// Added by Dharani to check if the game is completed
			var fullWinPileCount = 0;
			for (var i = 1; i < 5; i ++)
			{
			    if(model.piles['win'+i].pile.length === 13)
				fullWinPileCount ++;
    			}
		    }
		    else
		    {
			//var cardPixelPosition = _this._getCardPixelPosition(cardModel);
			//card.position.x = cardPixelPosition.x;
			//card.position.y = cardPixelPosition.y;
			_this._updatePileCardViews(_this.piles[cardModel.pile.pileId]);

			//returnsound=createSound("click.ogg", "click.mp3");
			returnsound.playclip();//-Dharani testing
		    }
		}

		this.alpha = 1;
		this.dragging = false; 
		// set the interaction interactionData to null
		this.interactionData = null;
		if(fullWinPileCount === 4)
		    _this.onGameWon();
	    };
	    
	    //    // set the callbacks for when the mouse or a touch moves
	    card.mousemove = card.touchmove = function(interactionData)
	    {
		if(this.dragging)
		{
		    // need to get parent coords..
		    var newPosition = this.interactionData.getLocalPosition(this.parent);
		    // this.position.x = newPosition.x;
		    // this.position.y = newPosition.y;
		    this.position.x = newPosition.x - this.sx;
		    this.position.y = newPosition.y - this.sy;
		}
	    }
	    //    }
	    

	    //    //------------------------------------------------------------
	    //    // This is only being called on the last object being created...
	    //    // need to fix this so the method is called on all card objects. 
	    //    window.onresize = resize;
	    //    //------------------------------------------------------------


	    //    //resize();

	    
	    // move the sprite to its designated position
	    
	    //console.log(stage.width);
	    // add it to the stage
	    stage.addChild(card);
	    return card;
	    
	}
	
	function animate()
	{
	    requestAnimFrame( animate ); 
	    renderer.render(stage);
	}
	



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
	    //    var c4_bounds = PIXI.DisplayObjectstage.prototype.getBounds.call(c4).clone();
	    
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
	    //    var stage_bounds = PIXI.DisplayObjectstage.prototype.getBounds.call(stage).clone();
	    stage.position.x = (window.innerWidth/2) - (stage.width/2) +100 ;
	    stage.position.y = (window.innerHeight/2) - (stage.height/2) -15;
	    
	    
	    
	    //    renderer.render(stage);     // render the stage (required to recompute the acutal size of the sprite)
	    //    stage_bounds = PIXI.DisplayObjectstage.prototype.getBounds.call(stage).clone();
	    
	    
	    //stage.position.x = 0;
	    //stage.position.y = 0;
	    
	    //    stage.updateTransform();
	    
	    //    renderer.render(stage);     // render the stage (required to recompute the acutal size of the sprite)
	    //    stage_bounds = PIXI.DisplayObjectstage.prototype.getBounds.call(stage).clone();
	    
	    //    console.log("  STAGE bounds x,y, w,h  " + stage_bounds.x + ", " + stage_bounds.y + ": "+ stage_bounds.width   + ", " + stage_bounds.height);
	    //	console.log("  STAGE final  x,y, w,h  " + stage.position.x + ", " + stage.position.y + ": "+ stage.width   + ", " + stage.height);
	    
	    //	console.log("   scale: " + dw + ", " + dh);
	    
	    
	    //stage_bounds = PIXI.DisplayObjectstage.prototype.getBounds.call(stage).clone();
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

    //piles: associative array of pileId=>SolitairePile
    //gridSize: size of the display grid as object, e.g. {"width" : 8, "height" : 6}
    SolitaireView.prototype.onNewGame = function(piles, gridSize)
    {
    	this.gridSize = gridSize;
	// var texture = PIXI.Texture.fromFrame('facedown');
	// var textureAspectRatio = texture.width / texture.height;
	var textureAspectRatio = 96.0 / 72.0;
	var gridPixelWidth = window.innerWidth / this.gridSize.width;
	var gridPixelHeight = gridPixelWidth * textureAspectRatio;
	if(gridPixelHeight * this.gridSize.height > window.innerHeight)
	{
	    gridPixelHeight = window.innerHeight / this.gridSize.height;
	    gridPixelWidth = gridPixelHeight / textureAspectRatio;
	}
    	this.cardPixelSize = {width: gridPixelWidth,
			      height: gridPixelHeight };	

	for (var pileId in piles)
	{
    	    if (piles.hasOwnProperty(pileId))
    	    {
		var pile = piles[pileId];
		var pileView = new SolitairePileView(pile, this);
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

    SolitaireView.prototype._updatePileCardViews = function(pileView)
    {
    	//update positions
	for(var i = 0; i < pileView.cards.length; i++)
	{
	    var currentCardView = pileView.cards[i];
	    var cardPixelPosition = this._getCardPixelPosition(currentCardView.card);
	    currentCardView.cardSprite.position.x = cardPixelPosition.x;
	    currentCardView.cardSprite.position.y = cardPixelPosition.y;
	    this.bringToFront(currentCardView.cardSprite);
	}
    }

    SolitaireView.prototype.onModelMovedCard = function(card, oldPile, newPile)
    {
    	var oldPileView = this.piles[oldPile.pileId];
    	var newPileView = this.piles[newPile.pileId];

    	//remove from old pile view
	var cardViewIndex = oldPileView.indexOfCardView(card);
	var cardView = oldPileView.cards[cardViewIndex];
	oldPileView.cards.splice(cardViewIndex, 1);

	//insert in new pile view
	var newCardIndex = newPile.getCardPosition(card);
	newPileView.cards.splice(newCardIndex, 0, cardView);

	this._updatePileCardViews(oldPileView);
	this._updatePileCardViews(newPileView);
    };

    SolitaireView.prototype.onModelUpdatedCard = function(card)
    {
    	var pileView = this.piles[card.pile.pileId];
    	var cardViewIndex = pileView.indexOfCardView(card);
    	var cardView = pileView.cards[cardViewIndex];

    	cardView.cardSprite.setTexture(this._getCardTexture(card));

    };

    SolitaireView.prototype.onGameWon = function()
    {
	winsound.playclip();
	// inactivate all piles
	//this.stage.interactive = false;
    };

    SolitaireView.prototype.bringToFront = function(sprite)
    {
    	if(sprite.parent)
    	{
    	    var parent = sprite.parent;

    	    parent.removeChild(sprite);
    	    parent.addChild(sprite);
    	}
    };

    window.SolitaireView = SolitaireView;


    var SolitairePileView = function(pile, solitaireView)
    {
	this.pile = pile;
	this.cards = [];
	this.pileSprite = solitaireView.createPileSprite(this.pile);
    };
    
    SolitairePileView.prototype.indexOfCardView = function(cardModel)
    {
     	for(var i = 0; i < this.cards.length; i++)
    	{
    	    var card = this.cards[i];
    	    if(card.card === cardModel)
    		return i;
    	}
    	return -1;
    };

    var SolitaireCardView = function(card, solitaireView)
    {
	// 1 = ace 2= 2....king = 13
	// clubs diamonds hearts spades
	this.card = card;
	//this.card.rank
	//this.card.facingUp;

	//console.log(this.card.pile.pileId);
	
	// this.card.pile.getCardPosition(this.card) - returns index of what card position is of the card on the pile 
	// 0 is bottom card, top is length -1 
	this.cardSprite = solitaireView.createCardSprite(this.card); 
        // solitaireView.createCard(this.card.pile.position.x, this.card.pile.position.y, texture, this.card.pile.pileId, this.card.facingUp); 
    };

})(window);
