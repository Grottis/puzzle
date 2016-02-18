"use strict";
var canvas;
var ctx;
//Global constants
//number of pixels to use as border
var CANVASMARGIN = 10;
//number of rows and columns of the puzzlepieces
var NUM_ROWS_COLS_PIECES = 5;
var correctSolution = new Array(NUM_ROWS_COLS_PIECES*NUM_ROWS_COLS_PIECES);
var currentPositions = new Array(NUM_ROWS_COLS_PIECES*NUM_ROWS_COLS_PIECES);
var grabbedPiece = null;
var currentBoard;

$(document).ready(function()
{
	$("#startGame").click(startGame);
	$("#gameCanvas").mousedown(mouseDownOnCanvas).mouseup(mouseUpOnCanvas);
	canvas = document.getElementById("gameCanvas");
	ctx = canvas.getContext("2d");
});

//Starts the game
function startGame()
{
	drawGameImage();
	currentPositions = correctSolution;
}

//Draws image on canvas
function drawGameImage()
{
    var img = document.getElementById("first");
    ctx.drawImage(img, CANVASMARGIN,CANVASMARGIN);
	createPuzzlePieces(img.width, img.height, ctx);
	currentBoard = ctx.getImageData(0,0,canvas.width,canvas.height);
}

function mouseDownOnCanvas(event)
{
	grabbedPiece = getPuzzlePieceUnderCursor(getMouseCoordsOnCanvas(event));
	if(grabbedPiece != null)
	{
		$("#gameCanvas").css("cursor","move");
		$("#gameCanvas").mousemove(mouseMoveOnCanvas);
		grabPuzzlePiece(grabbedPiece);
	}
}

function mouseMoveOnCanvas(event)
{
	grabbedPiece.animate(getMouseCoordsOnCanvas(event));
	//console.log(getMouseCoordsOnCanvas(event));
}

function mouseUpOnCanvas(event)
{
	$("#gameCanvas").css("cursor","default");
	$("#gameCanvas").unbind("mousemove");
	releasePuzzlePiece(getMouseCoordsOnCanvas(event));
}

//Function to get mouse coordinates
function getMouseCoordsOnCanvas(event)
{
	var x = event.pageX - $("#gameCanvas").get(0).offsetLeft - CANVASMARGIN;
	var y = event.pageY - $("#gameCanvas").get(0).offsetTop  - CANVASMARGIN;
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
	for(var i =0;i<imageHeight;i+=puzzlePieceHeight)
	{
		for(var j=0;j<imageWidth;j+=puzzlePieceWidth)
		{
			context.strokeRect(CANVASMARGIN+i,CANVASMARGIN+j,puzzlePieceWidth,puzzlePieceHeight);
			correctSolution[k] = new puzzlePiece(k, CANVASMARGIN + j, CANVASMARGIN + i, puzzlePieceWidth, puzzlePieceHeight, ctx.getImageData(CANVASMARGIN + j,CANVASMARGIN + i, puzzlePieceWidth, puzzlePieceHeight));
			k++;
		}
	}
}

function getPuzzlePieceUnderCursor(coords)
{
	var l = currentPositions.length;
	for(var i = 0;i<l;i++)
	{
		if(coords[0] >= currentPositions[i].xPos && 
		   coords[0] <= currentPositions[i].xPos + currentPositions[i].width &&
		   coords[1] >= currentPositions[i].yPos &&
		   coords[1] <= currentPositions[i].yPos + currentPositions[i].height)
				return currentPositions[i];
	}
	return null;
}

function grabPuzzlePiece(puzzlePiece)
{
	ctx.clearRect(puzzlePiece.xPos, puzzlePiece.yPos, puzzlePiece.width, puzzlePiece.height);
	currentBoard = ctx.getImageData(0,0,canvas.width,canvas.height);
	ctx.shadowBlur=40;
	ctx.shadowColor = "black";
	ctx.shadowOffsetX = 20;
	ctx.shadowOffsetY = 20;
	ctx.fillRect(puzzlePiece.xPos-5,puzzlePiece.yPos-5,puzzlePiece.width,puzzlePiece.height);
	ctx.putImageData(puzzlePiece.pixels,puzzlePiece.xPos-5,puzzlePiece.yPos-5);
}

function releasePuzzlePiece(coords)
{
	grabbedPiece.xPos = coords[0];
	grabbedPiece.yPos = coords[1];
	ctx.putImageData(currentBoard,0,0);
	ctx.putImageData(grabbedPiece.pixels,coords[0],coords[1])
	currentBoard = ctx.getImageData(0,0,canvas.width,canvas.height);
	console.log("Release: "+coords);
}

function animateMove(piece, coords)
{
	console.log(piece,coords);
}
//Puzzlepiece object
function puzzlePiece(id, x, y, width, height,imageData){
	this.id = id;
	this.xPos = x;
	this.yPos = y;
	this.width = width;
	this.height = height;
	this.pixels = imageData;
	this.animate = function(coords) {
	//create new canvas on top of old one, render animation on new canvas.
	//z-index 0 z-index 1....
	//ctx.clearRect(puzzlePiece.xPos, puzzlePiece.yPos, puzzlePiece.width, puzzlePiece.height);
	//currentBoard = ctx.getImageData(0,0,canvas.width,canvas.height);
	moveCanvas.clearRect(0,0,800,600);
	moveCanvas.fillRect(coords[0],coords[1],width,height);
	moveCanvas.putImageData(this.pixels,coords[0],coords[1]);
	}
}

