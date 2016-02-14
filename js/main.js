$(document).ready(function(){
		$("#startGame").click(startGame);
});

//Starts the game
function startGame(){
	drawGameImage();
}

//Draws image on canvas
function drawGameImage()
{
	var canvas = document.getElementById("gameCanvas");
    var ctx = canvas.getContext("2d");
    var img = document.getElementById("first");
    ctx.drawImage(img, 10,10);
}

