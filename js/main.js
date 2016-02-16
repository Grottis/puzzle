"use strict";
var canvas;
var ctx;
//Global constants
//number of pixels to use as border
var CANVASMARGIN = 10;
//number of rows and columns of the puzzlepieces
var NUM_ROWS_COLS_PIECES = 5;
var correctSolution = new Array(NUM_ROWS_COLS_PIECES*NUM_ROWS_COLS_PIECES);

$(document).ready(function(){
		$("#startGame").click(startGame);
		$("#gameCanvas").mousedown(mouseDownOnCanvas);
		$("#gameCanvas").mouseup(mouseUpOnCanvas);
		canvas = document.getElementById("gameCanvas");
		ctx = canvas.getContext("2d");
});
//Starts the game
function startGame(){
	drawGameImage();
	console.log(correctSolution);
}

//Draws image on canvas
function drawGameImage()
{
    var img = document.getElementById("first");
    ctx.drawImage(img, CANVASMARGIN,CANVASMARGIN);
	createPuzzlePieces(img.width, img.height, ctx);

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

//Function to create puzzlepieces
function createPuzzlePieces(imageWidth, imageHeight, context){

	var puzzlePieceWidth = imageWidth/NUM_ROWS_COLS_PIECES;
	var puzzlePieceHeight = imageHeight/NUM_ROWS_COLS_PIECES;
	var k = 0;
	for(var i =0;i<imageWidth;i+=puzzlePieceWidth)
	{
		for(var j=0;j<imageHeight;j+=puzzlePieceHeight)
		{
			context.strokeRect(CANVASMARGIN+i,CANVASMARGIN+j,puzzlePieceWidth,puzzlePieceHeight);
			correctSolution[k] = new puzzlePiece(CANVASMARGIN + i, CANVASMARGIN + j, puzzlePieceWidth, puzzlePieceHeight, ctx.getImageData(CANVASMARGIN + i,CANVASMARGIN + j, puzzlePieceWidth, puzzlePieceHeight));
			k++;
		}
	}
}

//Puzzlepiece object
function puzzlePiece(x, y, width, height,imageData){
	this.xPos = x;
	this.yPos = y;
	this.width = width;
	this.height = height;
	this.pixels = imageData;
}
