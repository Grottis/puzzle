"use strict";
var backgroundCanvas;
var moveCanvas;
//Global constants
//number of pixels to use as border
var CANVASMARGIN = 10;
//number of rows and columns of the puzzlepieces
var NUM_COLS_PIECES = 5;
var NUM_ROWS_PIECES = 5;
//Max size of puzzle board
var MAX_IMAGE_WIDTH = 640;
var MAX_IMAGE_HEIGHT = 480;

var correctSolution = new Array(NUM_COLS_PIECES*NUM_ROWS_PIECES);
var currentPositions = new Array(NUM_COLS_PIECES*NUM_ROWS_PIECES);
var grabbedPiece = null;
var currentBoard;

var puzzleImage = null;

var canvasWidth = 1024;
var canvasHeight = 768;


var imageWidth = 490;
var imageHeight = 490;

$(document).ready(function()
{
	$("#startGame").click(startGame);
	$("#offCanvas").mousedown(mouseDownOnCanvas).mouseup(mouseUpOnCanvas);
	backgroundCanvas = document.getElementById("gameCanvas").getContext("2d");
	moveCanvas = document.getElementById("offCanvas").getContext("2d");
	$("#uploadFile").change(handleUploadFile);
});

//Starts the game
function startGame()
{
	drawGameImage();
	currentPositions = correctSolution;
	drawBackground();
}
function handleUploadFile()
{
	var file = $("#uploadFile").get(0).files[0];
	var img = document.createElement("img");
	img.id = "puzzlePic";
	img.src = window.URL.createObjectURL(file);
	img.classList.add("hidden");
	$("#canvasFrame").append(img);
	$("#puzzlePic").load(function(){
		var ratio = calculateAspectRatioFit($(this).width(), $(this).height(), MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT);
		var hiddenCanvas = document.createElement("canvas");
		hiddenCanvas.width = $(this).width();
		hiddenCanvas.height = $(this).height();
		hiddenCanvas.id = "hiddenCanvas";
		hiddenCanvas.classList.add("hidden");
		$("body").append(hiddenCanvas);
		var hiddenCtx = $("#hiddenCanvas").get(0).getContext("2d");
		hiddenCtx.scale(ratio.width / hiddenCanvas.width, ratio.height / hiddenCanvas.height);
		hiddenCtx.drawImage(img,0,0);
		puzzleImage = hiddenCtx.getImageData(0,0,ratio.width,ratio.height);
		imageWidth = ratio.width;
		imageHeight = ratio.height;
	})

}


//http://stackoverflow.com/questions/3971841/how-to-resize-images-proportionally-keeping-the-aspect-ratio
function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {

    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

    return { width: srcWidth*ratio, height: srcHeight*ratio };
}

//Draws image on canvas
function drawGameImage()
{
	if(puzzleImage == null)
    {
		var img = document.getElementById("first");
		backgroundCanvas.drawImage(img, CANVASMARGIN,CANVASMARGIN);
		createPuzzlePieces(img.width, img.height, backgroundCanvas);
	}
	else
	{
		backgroundCanvas.putImageData(puzzleImage,CANVASMARGIN,CANVASMARGIN);
		createPuzzlePieces(imageWidth, imageHeight, backgroundCanvas);
	}
	currentBoard = backgroundCanvas.getImageData(0,0,canvasWidth,canvasHeight);
	backgroundCanvas.clearRect(0,0,canvasWidth,canvasHeight);

}

function drawBackground()
{
	backgroundCanvas.clearRect(0,0,canvasWidth,canvasHeight);
	backgroundCanvas.strokeRect(CANVASMARGIN,CANVASMARGIN,imageWidth,imageHeight);
	for(var i = 0;i<currentPositions.length;i++)
	{
		if(!currentPositions[i].grabbed)
			currentPositions[i].draw(backgroundCanvas);
	}
}

function mouseDownOnCanvas(event)
{
	grabbedPiece = getPuzzlePieceUnderCursor(getMouseCoordsOnCanvas(event));
	if(grabbedPiece != null)
	{
		$("#offCanvas").css("cursor","move");
		$("#offCanvas").mousemove(mouseMoveOnCanvas);
		grabPuzzlePiece(grabbedPiece);
	}
}

function mouseMoveOnCanvas(event)
{
	grabbedPiece.animate(getMouseCoordsOnCanvas(event));
}

function mouseUpOnCanvas(event)
{
	$("#offCanvas").css("cursor","default");
	$("#offCanvas").unbind("mousemove");
	if(grabbedPiece != null)
	releasePuzzlePiece(getMouseCoordsOnCanvas(event));
}

//Function to get mouse coordinates
function getMouseCoordsOnCanvas(event)
{
	var x = event.pageX - $("#gameCanvas").get(0).offsetLeft - CANVASMARGIN;
	var y = event.pageY - $("#gameCanvas").get(0).offsetTop  - CANVASMARGIN;
	return [x, y];
}

//Function to create puzzlepieces
function createPuzzlePieces(imageWidth, imageHeight, context){

	var puzzlePieceWidth = imageWidth/NUM_COLS_PIECES;
	var puzzlePieceHeight = imageHeight/NUM_ROWS_PIECES;
	var id = 0;
	for(var i =0;i<imageHeight;i+=puzzlePieceHeight)
	{
		for(var j=0;j<imageWidth;j+=puzzlePieceWidth)
		{
			//context.strokeRect(CANVASMARGIN+i,CANVASMARGIN+j,puzzlePieceWidth,puzzlePieceHeight);
			correctSolution[id] = new puzzlePiece(id, CANVASMARGIN + j, CANVASMARGIN + i, puzzlePieceWidth, puzzlePieceHeight, 
									context.getImageData(CANVASMARGIN + j,CANVASMARGIN + i, puzzlePieceWidth, puzzlePieceHeight));
			id++;
		}
	}
	createVisualPieces(correctSolution);
}

function createVisualPieces(puzzlePieces)
{
	for(var i =0;i<puzzlePieces.length;i++)
	{
		moveCanvas.clearRect(0, 0, canvasWidth, canvasHeight);
		moveCanvas.putImageData(puzzlePieces[i].pixels, 0, 0);
		moveCanvas.strokeRect(0, 0, puzzlePieces[i].width, puzzlePieces[i].height);
		puzzlePieces[i].pixels = moveCanvas.getImageData(0, 0, puzzlePieces[i].width, puzzlePieces[i].height);
	}
	moveCanvas.clearRect(0, 0, canvasWidth, canvasHeight);
}

function getPuzzlePieceUnderCursor(coords)
{
	for(var i = currentPositions.length-1;i>=0;i--)
	{
		if(coords[0] >= currentPositions[i].xPos && 
		   coords[0] <= currentPositions[i].xPos + currentPositions[i].width &&
		   coords[1] >= currentPositions[i].yPos &&
		   coords[1] <= currentPositions[i].yPos + currentPositions[i].height)
		   {
				return currentPositions[i];
		   }
	}
	return null;
}

function grabPuzzlePiece(puzzlePiece)
{
	puzzlePiece.grabbed = true;
	backgroundCanvas.clearRect(puzzlePiece.xPos, puzzlePiece.yPos, puzzlePiece.width, puzzlePiece.height);
	drawBackground();
	currentBoard = backgroundCanvas.getImageData(0,0,canvasWidth,canvasHeight);
	moveCanvas.shadowBlur=40;
	moveCanvas.shadowColor = "black";
	moveCanvas.shadowOffsetX = 20;
	moveCanvas.shadowOffsetY = 20;
	moveCanvas.fillRect(puzzlePiece.xPos-5,puzzlePiece.yPos-5,puzzlePiece.width,puzzlePiece.height);
	moveCanvas.putImageData(puzzlePiece.pixels,puzzlePiece.xPos-5,puzzlePiece.yPos-5);
	var remove = currentPositions.splice(currentPositions.findIndex(isGrabbed),1);
	currentPositions.push(remove[0]);
}

function isGrabbed(element, index, array){
	if(element.grabbed)
		return true;
	else
		return false;
}

function releasePuzzlePiece(coords)
{
	grabbedPiece.xPos = coords[0];
	grabbedPiece.yPos = coords[1];
	grabbedPiece.grabbed = false;
	moveCanvas.clearRect(0,0,canvasWidth,canvasHeight);
	drawBackground();
	currentBoard = backgroundCanvas.getImageData(0,0,canvasWidth,canvasHeight);
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
	this.grabbed = false; //IF grabbed, do not draw at background....
	this.animate = function(coords) {
		moveCanvas.clearRect(0,0,canvasWidth,canvasHeight);
		moveCanvas.fillRect(coords[0],coords[1],width,height);
		moveCanvas.putImageData(this.pixels,coords[0],coords[1]);
		}
	this.draw = function(canvas){
		canvas.putImageData(this.pixels,this.xPos,this.yPos);
	}
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
