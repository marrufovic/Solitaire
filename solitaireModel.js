//solitaireModel.js

(function(window) {

	var SUITS = ["hearts", "diamonds", "clubs", "spades"];
	//enums
	var SUIT_COLOR = { hearts : { color : "red" },
				  diamonds : { color : "red"},
				  clubs : { color : "black" },
				  spades : { color : "black" }
	};

	//fisher-yates shuffle, implementation from http://stackoverflow.com/a/2450976
	var shuffle = function(array) {
		var currentIndex = array.length, temporaryValue, randomIndex ;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
  }

  return array;
}

	//classes
	var SolitaireModel = function()
	{
	}

	SolitaireModel.prototype.newGame = function(gameRules)
	{
		this.game = gameRules.rules;
		this.piles = {}; //dictionary of piles by id

		//setup layout
		//get cards that the game will use
		var deck = [];
		for(var i = 0; i < this.game.layout.cards.length; i++)
		{

			var deckStr = this.game.layout.cards[i].split(" ");
			var singleDeck = this._makeDeck(deckStr[0]);
			for(var j = 0; j < deckStr[1].length; j++)
			{
				deck = deck.concat(singleDeck);
			}
		}

		shuffle(deck);

		var deckIndex = 0;

		//create piles and deal cards
		for(var i = 0; i < this.game.layout.piles.length; i++)
		{
			var pile = this.game.layout.piles[i];
			var newPile = new SolitairePile(pile.pileType);
			for(var j = 0; j < pile.count; j++)
			{
				newPile.putCard(deck[deckIndex++]);
			}
			this.piles[pile.id] = newPile;
		}

		if(deckIndex < deck.length)
		{
			console.log("RuleDef warning: some cards undealt.");
		}
	}

	SolitaireModel.prototype._makeDeck = function(deckType)
	{
		var deck = [];
		if(deckType === "standard-deck")
		{
			for(var suitIndex = 0; suitIndex < SUITS.length; suitIndex++)
			{
				var suit = SUITS[suitIndex];
				for(var rank = 0; rank < 13; rank++)
				{
					deck.push(new SolitaireCard(suit, rank, false));
				}
			}
		}
		return deck;
	};

	SolitaireModel.prototype._getPilesByType = function(pileType)
	{
		var piles = [];
		for (var pileId in this.piles) 
		{
		    if (this.piles.hasOwnProperty(pileId)) 
		    {
		    	var pile = this.piles[pileId];
		        if(pile.pileType === pileType)
		        	piles.push(pile);
		    }
		}

		return piles;
	};

	SolitaireModel.prototype.canGrabCard = function(card)
	{
		var grabRules = this.game.rules.pileTypes[card.pile].grab.rule;
		return this._evaluateRule(grabRules, { target : card });
	};

	//recursively evaluate a "rule" entry
	//context: object that stores reference to model objects that will be needed in the rule parsing
	//		e.g. - a "grab" rule must provide a 'target', "drop" must provide 'held', 'target', and 'pile'
	//returns true/false
	SolitaireModel.prototype._evaluateRule = function(rule, context)
	{
		//base case: a string, evaluate
		if(typeof rule === 'string')
		{
			//target condition [arg1 arg2... argn]
			var ruleParts = rule.split(" ");
			var target = ruleParts[0];
			var condition = ruleParts[1];
			var arguments = [];
			if(ruleParts.length > 2)
				arguments.concat(ruleParts.slice(2));

			var targetObj = this._findTarget(target, context);
			//TODO: parse condition and arguments
		}

		//TODO: handle arrays and AND/OR objects

		//wrap single object in array
		// if(!Array.isArray(rule))
		// {
		// 	var arr = [];
		// 	arr.push(rule);
		// 	rule = arr;
		// }

		// for(var i = 0; i < rule.length; i++)
		// {
		// 	var 
		// }
	}


	//returns the Model object referred to by the target string in the given context
	//returns null if the target has the #pos selector and it went out of bounds
	//throws on errors
	SolitaireModel.prototype._findTarget = function(target, context)
	{
		var targetParts = target.split(":");
		var targetId = null;
		var targetIdType = null;
		
		if(targetParts.length === 1)
		{
			targetId = targetParts[0];
			targetIdType = 'id';
		}
		else
		{
			//identifier type
			targetIdType = targetParts[0];
			targetId = targetParts[1];
		}

		//check for a selector (all,top,bottom,above,below)
		var targetSelectorParts = targetId.split('#');
		var targetSelector = null;
		if(targetSelectorParts.length === 1)
		{
			targetSelector = 'this';
		}
		else
		{
			targetId = targetSelectorParts[0];
			targetSelector = targetSelectorParts[1];
		}

		var targetObj = null;
		if(targetIdType === 'pileType')
		{
			//find all piles of type
			targetObj = this._getPilesByType(targetId);

		}
		else if(targetIdType === 'id')
		{
			//keywords are 'special' ids
			if(targetId === 'pile')
			{
				targetObj = context.pile;
			}
			else if(targetId === 'target')
			{
				targetObj = context.target;
			}
			else if(targetId === 'held')
			{
				targetObj = context.held;
			}
			else
			{
				//target is a pile identified by id
				targetObj = this.piles[targetId];
			}
		}
		else
		{
			throw new Error("RuleDefinition: unknown target idType " + targetIdType + " on target " + targetId);
		}

		if(typeof targetObj === 'undefined')
		{
			throw new Error("RuleDefinition: target id " + targetId + " not found on target " + targetId);
		}

		//use selector to refine selection
		if(targetSelector === 'top' || targetSelector === 'bot')
		{
			if(typeof targetObj !== 'SolitairePile')
				throw new Error("RuleDefinition: selector " + targetSelector + "not allowed on target " + targetId +
									" of type " + typeof targetObj);
			targetObj = targetObj.peekCard(targetSelector)
		}
		else if(targetSelector.slice(0,3) === 'pos')
		{
			if(typeof targetObj !== 'SolitaireCard')
				throw new Error("RuleDefinition: selector " + targetSelector + "not allowed on target " + targetId +
									" of type " + typeof targetObj);
			
			var targetRelativeIndex = parseInt(targetSelector.slice(3));
			var targetPosition = targetObj.pile.getCardPosition(targetObj) + targetRelativeIndex;
			if(targetPosition > 0 && targetPosition < targetObj.pile.getCount())
			{
				targetObj = targetObj.pile.peekCard(targetPosition);
			}
			else
			{
				targetObj = null;
			}
		}
		else if(targetSelector === 'this')
		{
			//do nothing (targetObj = targetObj)
		}
		else
		{
			throw new Error("RuleDefiniton: unknown selector " + targetSelector + " on target " + targetId);
		}

		return targetObj;
	}

	SolitaireModel.prototype.moveCard = function(card, pile, pos)
	{
		card.pile.removeCard(card);
		//run grab triggers

		pile.putCard(card, pos);
		//run drop from triggers
		//run drop to triggers		
	};

	window.SolitaireModel = SolitaireModel;

	var SolitairePile = function(pileType)
	{
		this.pileType = pileType;

		this.pile = [];
	};

	SolitairePile.prototype.putCard = function(card, pos) {	
		this.pile.splice(this._indexFromPosition(pos), 0, card);

		card.pile = this;
	};

	SolitairePile.prototype.peekCard = function(pos) {
		
		return this.pile[this._indexFromPosition(pos)];
	};

	SolitairePile.prototype.removeCard = function(pos) {
		var card = this.pile.splice(this._indexFromPosition(pos), 1)[0];
		card.pile = null;
		return card;
	};

	SolitairePile.prototype.getCount = function() {
		return this.pile.length;
	};

	SolitairePile.prototype.getCardPosition = function(card) {
		return this.pile.indexOf(card);
	}

	SolitairePile.prototype._indexFromPosition = function(pos) {
		if(typeof pos === 'undefined')
		{
			return this.pile.length;
		}
		else if(typeof pos === 'string')
		{
			if(pos === 'top')
				return this.pile.length;
			else if(pos === 'bot')
				return 0;
		}
		else
			return pos;
	};

	var SolitaireCard = function(suit, rank, facingUp) {
		this.pile = null;
		this.suit = suit;
		this.rank = rank;
		this.facingUp = facingUp;
	};

})(window);