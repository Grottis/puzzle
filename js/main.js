$(document).ready(function(){
		$("#startGame").click(startGame);
		$("#gameCanvas").mousedown(mouseDownOnCanvas);
		$("#gameCanvas").mouseup(mouseUpOnCanvas);
});
//Global constants
//number of pixels to use as border
var CANVASMARGIN = 10;
//number of rows and columns of the puzzlepieces
var NUM_ROWS_COLS_PIECES = 5;


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
    ctx.drawImage(img, CANVASMARGIN,CANVASMARGIN);
	addGridToImage(img.width, img.height,ctx);
}
function mouseDownOnCanvas(event){
			$("#gameCanvas").css("cursor","move");
			console.log(getMouseCoordsOnCanvas(event));
}

function mouseUpOnCanvas(event)
		{
			$("#gameCanvas").css("cursor","default");
			console.log("release"+getMouseCoordsOnCanvas(event));
		}

//Function to get mouse coordinates
function getMouseCoordsOnCanvas(event)
{
	var x = event.pageX-$("#gameCanvas").get(0).offsetLeft - CANVASMARGIN;
	var y = event.pageY-$("#gameCanvas").get(0).offsetTop - CANVASMARGIN;
	return [x, y];
}

//Functions to get index from imagedata object
function getRedValueIndex(width, x, y)
{
	return ((y - 1) * (width * 4)) + ((x - 1) * 4);
}

function getGreenValueIndex(width, x, y)
{
	return getRedValue(width,x,y) + 1;
}

function getBlueValueIndex(width, x, y)
{
	return getRedValue(width, x, y) + 2;
}

function getAlphaValueIndex(width, x, y)
{
	return getRedValue(width, x, y) + 3;
}

//Function to add grid to image
function addGridToImage(imageWidth, imageHeight, context){
	
	var puzzlePieceWidth = imageWidth/NUM_ROWS_COLS_PIECES;
	var puzzlePieceHeight = imageHeight/NUM_ROWS_COLS_PIECES;
	for(var i =0;i<imageWidth;i+=puzzlePieceWidth)
	{
		for(var j=0;j<imageHeight;j+=puzzlePieceHeight)
		{
		context.strokeRect(CANVASMARGIN+i,CANVASMARGIN+j,puzzlePieceWidth,puzzlePieceHeight);
		}
	}
}