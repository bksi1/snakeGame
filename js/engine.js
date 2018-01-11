var game = {
	init: function() {
		game.initialX = 630;
		game.initialY = 530;
		game.partWidth = 10;
		game.partHeight = 10;
		game.leftMargin = 2;
		game.topMargin = 2;
		game.rightMargin = 1240;
		game.bottomMargin = 580;
		game.snakeBody = [];
		game.changeTurnQueue = [];
		game.snakeBodyPart = '<div class="snakePart"></div>';
		game.partsCount = 5;
		game.defaultDirection = 'up';
		game.currentPartToMove = 0;
		game.addParts = 2;
		game.snakeCrashed = false;
		game.apples = [];
		game.appleHtml = '<div class="apple"></div>';
		game.apple = {};
		game.crashMessage = "";
		game.appleColisions = 0;
		game.isAppleCollision = false;
		game.defaultInterval = 120;
		$("#currentSpeed").html(" скорост: " + Math.round(1/game.defaultInterval*10000) + "; ябълки: "+game.appleColisions);
	},
	showInitialSnake: function() {
		game.init();
		for (var i=0; i< game.partsCount; i++) { game.addPart2Snake(false); }
		var snakeHead = $("#"+game.snakeBody[0].id);
		game.generateApple();
	},
	addPart2Snake: function(inMotion) {
		var currentHtmlPart = $(game.snakeBodyPart);
		partId = game.snakeBody.length;
		var currentPartObj = {"id": "snakePart"+partId, "nextDirection": game.defaultDirection, "currentDirection": game.defaultDirection, "index": partId};
		currentHtmlPart.attr("id", currentPartObj.id);
		var cssPart = "";
		var currentX = game.getLastPartX(game.defaultDirection, "");
		var currentY = game.getLastPartY(game.defaultDirection, "");
		cssPart = "top: "+currentY+"px; left:"+currentX+"px;";
		if (game.snakeBody.length > 0) {
			lastPartId  = game.snakeBody[partId - 1].id;
			lastPartIndex = partId - 1;
			currentX = game.getLastPartX(game.snakeBody[lastPartIndex].currentDirection, lastPartId);
			currentY = game.getLastPartY(game.snakeBody[lastPartIndex].currentDirection, lastPartId);
			lastElementPosition = $("#"+lastPartId).position();
			if (inMotion && game.snakeBody[lastPartIndex].currentDirection == "up") { currentY -= game.partHeight; }
			if (inMotion && game.snakeBody[lastPartIndex].currentDirection == "left") { currentX -= game.partWidth; }
			if (inMotion && game.snakeBody[lastPartIndex].currentDirection == "down") { currentY += game.partHeight; }
			if (inMotion && game.snakeBody[lastPartIndex].currentDirection == "right") { currentX += game.partWidth; }
			cssPart = "top: "+currentY+"px; left:"+currentX+"px;";
			currentPartObj.curentDirection = game.snakeBody[lastPartIndex].currentDirection;
			currentPartObj.nextDirection = currentPartObj.curentDirection;
		}
		currentHtmlPart.attr("style", cssPart);
		$("#content").append(currentHtmlPart);
		game.snakeBody.push(currentPartObj);
		game.attachKeydown();
	},
	generateApple: function() {
		var appleX = parseInt(Math.random() * 90);
		appleX *= 10;
		appleX += 100;
		var appleY = parseInt(Math.random() * 45);
		appleY *= 10;
		appleY += 50;
		var apple = {};
		apple.x = appleX;
		apple.y = appleY;
		apple.shown = false;
		apple.id = "apple"+game.apples.length;
		apple.htmlNode = $(game.appleHtml);
		apple.htmlNode.attr("id", "apple"+game.apples.length);
		apple.htmlNode.attr("style", "top:"+appleY+"px; left:"+appleX+"px;");
		game.apples.push(apple);
		game.showApples();
	},
	showApples: function() {
		for(var i=0; i<game.apples.length; i++) {
			var apple = game.apples[i];
			if (! apple.shown) {
				$("#content").append(apple.htmlNode);
				game.apples[i].shown = true;
			}
		}
	},
	checkAppleColision: function() {
		var snakeHeadPosition = $("#"+game.snakeBody[0].id).position();
		for (i=0; i<game.apples.length; i++) {
			var elementApple = $("#"+game.apples[i].id);
			if (snakeHeadPosition.left <= game.apples[i].x+10 && snakeHeadPosition.top <= game.apples[i].y+10 && snakeHeadPosition.left>=game.apples[i].x && snakeHeadPosition.top>=game.apples[i].y) {
				$("#"+game.apples[i].id).remove();
				game.apples.splice(i,1);
				game.appleColisions++;
				$("#currentSpeed").html(" скорост: " + Math.round(1/game.defaultInterval*10000) + "; ябълки: "+game.appleColisions);
				if (game.defaultInterval > 60) {
					clearInterval(game.intervalHandler);
					game.defaultInterval -= 5;
					game.intervalHandler = setInterval(game.moveSnake, game.defaultInterval);
				}
				game.generateApple();
				game.isAppleCollision = true;
				return true;
			}
		}
		return false;
	},
	moveSnake: function() {
		game.makeTurn();
		for (var i =0; i<game.snakeBody.length; i++) {
			var animationObj = {};
			switch(game.snakeBody[i].currentDirection) {
				case 'up':
					animationObj.top = "-="+game.partHeight;
				break;
				case 'down':
					animationObj.top = "+="+game.partHeight;
				break;
				case 'left':
					animationObj.left = "-="+game.partWidth;
				break;
				case 'right':
					animationObj.left = "+="+game.partWidth;
				break;
			}
			game.movePart(animationObj);
		}
		if (game.checkAppleColision()) {
			
			game.addPart2Snake(true);
			for(i=0; i<game.addParts-1; i++) { game.addPart2Snake(false); }
		}
		if (game.snakeCrashed) { game.doCrach();}
	},
	checkAddToSnake: function() {
		if (game.isAppleCollision) {
			for(i=0; i<game.addParts; i++) { game.addPart2Snake(false); }
		}
		game.isAppleCollision = false;		
	},
	movePart: function(animationObj) {
		var currentHtmlPart = $("#"+game.snakeBody[game.currentPartToMove].id);
		currentHtmlPart.animate(animationObj, 1, function() { game.checkCrash($(this)); });
		game.currentPartToMove++;
		if (game.currentPartToMove >= game.snakeBody.length) { game.currentPartToMove = 0; }
	},
	checkCrash: function(ev) {
		if (game.snakeBody.length > 0) {
			var snakeHeadHtmlPosition = $("#" + game.snakeBody[0].id).position();
			if (snakeHeadHtmlPosition.left <= game.leftMargin || snakeHeadHtmlPosition.left > game.rightMargin || snakeHeadHtmlPosition.top <= game.topMargin || snakeHeadHtmlPosition.top > game.bottomMargin) {
				game.crashMessage = "Съжалявам, ти катастрофира!!!";
				game.snakeCrashed = true;
			}
			if (ev.attr("id") != game.snakeBody[0].id) {
				currentPartPosition = ev.position();
				if (snakeHeadHtmlPosition.top == currentPartPosition.top && snakeHeadHtmlPosition.left == currentPartPosition.left) { game.crashMessage = "Не са яж уе!!!"; game.snakeCrashed = true; }
			}
			/*for (i=2; i<game.snakeBody.length; i++) {
				currentPartPosition = $("#"+game.snakeBody[i].id).position();
				if (snakeHeadHtmlPosition.top == currentPartPosition.top && snakeHeadHtmlPosition.left == currentPartPosition.left) { game.crashMessage = "Не са яж уе!!!"; game.snakeCrashed = true; }
			}*/
		}
	},
	doCrach: function() {
		clearInterval(game.intervalHandler);
		//clearInterval(game.appleHandler);
		alert(game.crashMessage);
	},
	getLastPartX: function(direction, elementId) {
		var currentX = game.initialX;
		var elementX = {"left": currentX};
		if (elementId != "") { var elementX = $("#"+elementId).position(); }
		switch (direction) {
			case "up":
			case "down":
			    return elementX.left;
			break;
			case "left":
				return elementX.left + game.partWidth;
			break;
			case "right":
				return elementX.left - game.partWidth;
			break;
		}
	},
	getLastPartY: function(direction, elementId) {
		var currentY = game.initialY;
		var elementY = {"top": currentY};
		if (elementId != "") {
			var elementY = $("#"+elementId).position();
		} 
		switch (direction) {
			case "left":
			case "right":
			    return elementY.top;
			break;
			case "up":
				return elementY.top + game.partHeight;
			break;
			case "down":
				return elementY.top - game.partHeight;
			break;
		}
	},
	pushTurn: function(ev) {
		var arrs= ['left', 'up', 'right', 'down'], 
		key= window.event ? event.keyCode: ev.keyCode;
		if(key && key>36 && key<41) { 
			var nextDirection = arrs[key-37];
			if (
				(nextDirection == 'up' && game.snakeBody[0].currentDirection != 'down') ||
				(nextDirection == 'down' && game.snakeBody[0].currentDirection != 'up') ||
				(nextDirection == 'left' && game.snakeBody[0].currentDirection != 'right') ||
				(nextDirection == 'right' && game.snakeBody[0].currentDirection != 'left')
			) {
				if (game.snakeBody[0].nextDirection == game.snakeBody[0].currentDirection) {
					game.snakeBody[0].nextDirection = arrs[key-37];
				}
				
			}
		}
		if (key && key==32) {
			if (game.intervalHandler) {
				clearInterval(game.intervalHandler);
				game.intervalHandler = null;
				//clearInterval(game.appleHandler);
				//game.appleHandler = null;
			} else {
				game.intervalHandler = setInterval(game.moveSnake, game.defaultInterval);
			}
		}
		$(document).off("keydown");
	},
	makeTurn: function(ev) {
		for (var i = 0; i<game.snakeBody.length; i++) {
			if (game.snakeBody[i].currentDirection != game.snakeBody[i].nextDirection) {
				game.snakeBody[i].currentDirection = game.snakeBody[i].nextDirection;
				i++;
				if (i>=game.snakeBody.length) { break; }
				game.snakeBody[i].nextDirection = game.snakeBody[i-1].currentDirection;
			}
		}
	},
	attachKeydown: function() {
		// set timeout
		setTimeout(function() { $(document).on("keydown",game.pushTurn); }, 50);
	}
};
var eventHandler = {
	init: function() {
		$(document).on("keydown",game.pushTurn);
		$(document).on("keyup", game.attachKeydown);
	}
};
$(document).ready(function() {
	game.showInitialSnake();
	eventHandler.init();
	game.intervalHandler = setInterval(game.moveSnake, game.defaultInterval);
	//game.appleHandler = setInterval(game.generateApple, 20000);
	
});
