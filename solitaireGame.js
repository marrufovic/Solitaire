//SolitaireGame.js

var gameRules = new SolitaireGameRules("klondike.json");
var model = new SolitaireModel();
var view = new SolitaireView(model);
var controller = new SolitaireController(model, view);

model.newGame(gameRules);

//pretend view received a drag & drop
view.onCardDropped("a", "b");