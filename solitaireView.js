/**
 * SolitaireView.js
 * Authors: James Lundgren, Victor Marrufo, Elliot Hatch, Dharani Adhikari
 * 
 * This class deals with the view for the Solitaire application. Each card is 
 * assigned a sprite that is loaded via a PIXI sprite sheet. Each card is placed 
 * in a specific position on the screen based off of the rules defined in the rules 
 * folder. 
 */


(function(window) {

    
    //classes
    var SolitaireView = function(model)
    {
	this.model = model;
	this.gridSize = null;
	this.cardPixelSize = null;

	// Stagger for cards
	this.cardOffsetPercent = .2;

	this.piles = {};
	
	// events
	this.onCardMoved = null;
	this.onPileActivated = null;
	this.onNewGameStarted = null;

	// Stage where the gameboard lives
	this.stage = null;
	

	// used for when onNewGame is called and sprite sheet hasn't loaded, store 
	// variables passed in from model
	this.copyPiles = null;
	this.loaded = false; 

	// Loads the spritesheet
	var assetsToLoader = ["images/cards.json"];
	loader = new PIXI.AssetLoader(assetsToLoader);

	// Set the callback for when the sprites are loaded
	loader.onComplete = onAssetsLoaded;
	loader.load();
	
	// 'this' loses scope to the PIXI object inside the callback
	// need a variable so we can call the functions and member variables
	var this_ = this; 

	// Callback method for when sprite sheet is loaded, can start the game
	function onAssetsLoaded()
	{
	    // prevents onNewGame from returning early
	    this_.loaded = true; 
	    this_.onNewGame(this_.copyPiles, this_.gridSize);
	}
	
	//initialize pixi, view variables, etc
	stage = new PIXI.Stage(0xF2343F, true);
	renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, document.getElementById("game_board"));

	
	
	document.body.appendChild(renderer.view);
        renderer.view.style.position = "absolute";
	renderer.view.style.top = "0px";
        renderer.view.style.left = "0px";
	renderer.view.style.minwidth= "800px";	  //Dharani uncommented. This should not hurt anything.      
	renderer.view.style.minheight= "400px";
	requestAnimFrame( animate );	
	
	
	// Used to position piles
	var current_pile;
	var y_offset = 1.0; 
	var x_offset = 1.0; 

	/* Helper method that gets a cards texture.
	 * The card will either be face up or face down, 
	 * default it to facedown. Set is as the name in the 
	 * cards.json file
	 */
	SolitaireView.prototype._getCardTexture = function(cardModel)
	{
	    var textureName = 'backOfCard.png';
	    if(cardModel.facingUp)
		textureName = cardModel.suit + "/" + cardModel.rank + ".png";
	    return PIXI.Texture.fromFrame(textureName);
	};

	/* Helper method used to get the pixel position of the pile as the 
	 * user drops a card. This helps when trying to evaluate what card  
	 * the user dropped on top of and for positioning the card accordingly
	 */
	SolitaireView.prototype._getPilePixelPosition = function(pileModel)
	{
	    return {x: pileModel.position.x  * this.cardPixelSize.width,
		    y: pileModel.position.y * this.cardPixelSize.height};
	}

	/* Gets pixel position of the card as the user drops it
	 * Helps with evaluating validity of a move
	 */
	SolitaireView.prototype._getCardPixelPosition = function(cardModel)
	{
	    var pilePosition = this._getPilePixelPosition(cardModel.pile);
	    
	    var cardPosition = cardModel.pile.getCardPosition(cardModel) % cardModel.pile.fanCount;
	    var cardOffset = this._calculateCardPixelOffset(cardModel.pile.fanDirection, cardPosition);

	    return {x: pilePosition.x + cardOffset.x, y: pilePosition.y + cardOffset.y};
	};

	/* Determines the offset for a card. Used when setting up game, and when user makes a valid move
	 * Accounts for different fan directions a game might have (up down left right)
	 */
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

	/* Assigns a sprite to a pile object. Each pile has the red joker as its base card. 
	 * The jokers cannot be moved, but when the stock pile is empty, the cards are restored
	 * by clicking on the joker so that the user can cycle through them again
	 */
	SolitaireView.prototype.createPileSprite = function(pileModel)
	{
	    // Retrieve the sprite from the cache
	    var texture = PIXI.Texture.fromFrame('redJoker.png');
	    var pile = new PIXI.Sprite(texture);

	    // Place the card accordingly
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
	    
	    // Need to add to stage
	    stage.addChild(pile);

	    return pile;
	};

	/* Helper method that gets the pile given a specific position. Used to evaluate
	 * the validity of a card move. 
	 */
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

	/*
	 * Returns the bounding box of a pile
	 */
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

	/* Determines if a card is overlapping another card based off of their bounding boxes. 
	 */
	SolitaireView.prototype._pointInBoundingBox = function(point, boundingBox)
	{
	    return (point.x >= boundingBox.x1 && point.x <= boundingBox.x2 &&
		    point.y >= boundingBox.y1 && point.y <= boundingBox.y2);
	};

	/* Attaches a PIXI sprite to each card object. The cards are positioned according to the 
	 * what the model has calculated its position to be. Handles mouse events that involve 
	 * the card.
	 */
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
	   
	    // Need to use 'this' inside of the event functions, set the variable
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
		
		// Only let the user grab cards that are supposed to be moved
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
		};
	    
	    // set the callbacks for when the mouse or a touch moves
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
	    };
	    
	    

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
	
	// Animation Loop
	function animate()
	{
	    requestAnimFrame( animate ); 
	    renderer.render(stage);
	}
	



        /**
	 * resize the card sprite so that it takes up most of the screen
	 *
	 */
	function resize (event)
	{
	    
	    
	    // Resize Renderer Window
	    renderer.resize(window.innerWidth, window.innerHeight);

	    // need to compute new scale based on original size of C4 sprite, so 
	    // put back to original size
	    //
	    
	    stage.scale.x = 1;  
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
	    
	    stage.updateTransform();
	};

    };
    
    /* Called by the controller when starting a new game
     * makes calls to set up the gameboard 
     */
    SolitaireView.prototype.onNewGame = function(piles, gridSize)
    {
    	this.gridSize = gridSize;

	// If the sprite sheet hasn't loaded, store variables and return, method will 
	// be called from within SolitaireView constructor once spritesheet is loaded
	if (!this.loaded)
	{
	    this.copyPiles = piles;
	    return;
	}

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

	// Cycle through each pile and initiate the cards 
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

    /* Used when the pile has changed from adding or removing cards
     */
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
    
    /* Deals with card moving from one pile to another. 
     * 
     */
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

    /* Called after the model has update the cards. Sets the texture 
     * if the card has been turned over.
     */
    SolitaireView.prototype.onModelUpdatedCard = function(card)
    {
    	var pileView = this.piles[card.pile.pileId];
    	var cardViewIndex = pileView.indexOfCardView(card);
    	var cardView = pileView.cards[cardViewIndex];

    	cardView.cardSprite.setTexture(this._getCardTexture(card));

    };

    /* Called when player wins a game. 
     * Play the win sound. Yay!
     */
    SolitaireView.prototype.onGameWon = function()
    {
	winsound.playclip();
	// inactivate all piles
	//this.stage.interactive = false;
    };

    /* Makes the most current card the top card. Otherwise 
     * cards would only be able to be placed on top of cards that 
     * were created before it. 
     */
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

    /* Constructor for the solitaire pile view so the model can access the methods
     */
    var SolitairePileView = function(pile, solitaireView)
    {
	this.pile = pile;
	this.cards = [];
	this.pileSprite = solitaireView.createPileSprite(this.pile);
    };
    
    /* Returns the index of the card in the pile array
     */
    SolitairePileView.prototype.indexOfCardView = function(cardModel)
    {
     	for(var i = 0; i < this.cards.length; i++)
    	{
    	    var card = this.cards[i];
    	    if(card.card === cardModel)
    		return i;
    	}
	// the card was not in the pile
    	return -1;
    };

    /* Constructor for the SolitaireCardView class
     * Cards: 1 = ace 2= 2....king = 13
     * Suits: clubs diamonds hearts spades
     */ 
    var SolitaireCardView = function(card, solitaireView)
    {
	this.card = card;
	this.cardSprite = solitaireView.createCardSprite(this.card); 
    };

})(window);
