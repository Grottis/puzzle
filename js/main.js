"use strict";
var backgroundCanvas;
var moveCanvas;
var solutionCanvas;
var victoryCanvas;
var hiddenCanvas;
var victoryScreen;

var CANVASMARGIN = 20;

var NUM_COLS_PIECES = 5;
var NUM_ROWS_PIECES = 5;

var MAX_IMAGE_WIDTH = 640;
var MAX_IMAGE_HEIGHT = 480;

var currentPositions = new Array(NUM_COLS_PIECES*NUM_ROWS_PIECES);
var grabbedPiece = null;

var puzzleImage = null;

var canvasWidth = 1024;
var canvasHeight = 768;

var imageWidth = 0;
var imageHeight = 0;

var correctCoordinates = [];
$(document).ready(function()
{
	backgroundCanvas = document.getElementById("backgroundCanvas").getContext("2d");
	moveCanvas = document.getElementById("moveCanvas").getContext("2d");
	solutionCanvas = document.getElementById("solutionCanvas").getContext("2d");
	victoryCanvas = document.getElementById("victoryCanvas").getContext("2d");
	hiddenCanvas = document.getElementById("hiddenCanvas").getContext("2d");

	$(".imageContainer").click({premadeOrUpload:"preMade"},handleImage);
	$("#uploadFile").on("change",{premadeOrUpload:"upload"},handleImage);
	$("#startGame").click(startGame);
	$("#moveCanvas").mousedown(mouseDownOnCanvas).mouseup(mouseUpOnCanvas).mouseleave(resetPiece);
	$("#help").click(showSolutionCanvas);
	$("#giveUp").click(showConfirmGiveUp);
	$("#giveUpYes").click(restart);
	$("#restart").click(restart);
	$("#giveUpNo").click(function(){$("#confirmGiveUp").hide();});
});

function startGame()
{
	$("#gameInstructions").hide();
	$("#help").show();
	$("#giveUp").show();
	randomizePieces();
	drawBackground();
	drawSolution();

}
function handleImage(event)
{
	var img = document.createElement("img");
	img.id = "puzzlePic";
	img.classList.add("hidden");

	if(event.data.premadeOrUpload === "upload")
	{
		var file = $("#uploadFile").get(0).files[0];
		$("label[for=uploadFile]").text(file.name);
		img.src = window.URL.createObjectURL(file);
	}
	else
		img.src = $(this).find("img:first").attr("src");

	$("#canvasFrame").append(img);
	$("#puzzlePic").load({image:img},createPuzzleImage);
}

function createPuzzleImage(imageParam)
{
	var img = imageParam.data.image;
	var ratio = calculateAspectRatioFit($(this).width(), $(this).height(), MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT);
	setHiddenCanvasSize($(this).width(),$(this).height());

	var hiddenCtx = $("#hiddenCanvas").get(0).getContext("2d");
	hiddenCtx.scale(ratio.width / hiddenCanvas.width, ratio.height / hiddenCanvas.height);
	hiddenCtx.drawImage(img,0,0);
	puzzleImage = hiddenCtx.getImageData(0,0,ratio.width,ratio.height);

	imageWidth = ratio.width;
	imageHeight = ratio.height;
	drawGameImage();
	drawBackground();
	$("#puzzlePic").remove();
}
//http://stackoverflow.com/questions/3971841/how-to-resize-images-proportionally-keeping-the-aspect-ratio
function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {

    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return { width: srcWidth*ratio, height: srcHeight*ratio };
}

function setHiddenCanvasSize(width, height)
{
	hiddenCanvas.width = width;
	hiddenCanvas.height = height;
	$("#hiddenCanvas").attr("width",hiddenCanvas.width);
	$("#hiddenCanvas").attr("height",hiddenCanvas.height);
	hiddenCanvas.clearRect(0,0,hiddenCanvas.width,hiddenCanvas.height);
}
function drawGameImage()
{
	backgroundCanvas.putImageData(puzzleImage,CANVASMARGIN,CANVASMARGIN);
	createPuzzlePieces(imageWidth, imageHeight, backgroundCanvas);
	backgroundCanvas.clearRect(0,0,canvasWidth,canvasHeight);
}
function createPuzzlePieces(imageWidth, imageHeight, context){

	var puzzlePieceWidth = imageWidth/NUM_COLS_PIECES;
	var puzzlePieceHeight = imageHeight/NUM_ROWS_PIECES;
	var id = 0;
	for(var i =0;i<imageHeight;i+=puzzlePieceHeight)
	{
		for(var j=0;j<imageWidth;j+=puzzlePieceWidth)
		{
			var puzzlePixels = context.getImageData(CANVASMARGIN + j,CANVASMARGIN + i, puzzlePieceWidth, puzzlePieceHeight);
			currentPositions[id] = new puzzlePiece(id, CANVASMARGIN + j, CANVASMARGIN + i, puzzlePieceWidth, puzzlePieceHeight, puzzlePixels);
			correctCoordinates[id] = [CANVASMARGIN+j,CANVASMARGIN+i];
			id++;
		}
	}
	createVisualPieces(currentPositions);
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
	$("#startGame").prop("disabled",false);
	$("#startGame").css("cursor","pointer");
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

function randomizePieces()
{
	for(var i =0;i<currentPositions.length;i++)
	{
		currentPositions[i].xPos = Math.floor(Math.random() * MAX_IMAGE_WIDTH-CANVASMARGIN) + CANVASMARGIN;
		currentPositions[i].yPos = Math.floor(Math.random() * MAX_IMAGE_HEIGHT-CANVASMARGIN) + CANVASMARGIN;
	}
}

function drawSolution()
{
	$("#hint").css("width", imageWidth);
	$("#hint").css("height", imageHeight);
	$("#solutionCanvas").attr("width",imageWidth);
	$("#solutionCanvas").attr("height",imageHeight);
	solutionCanvas.putImageData(puzzleImage,0,0);
}

function mouseDownOnCanvas(event)
{
	grabbedPiece = getPuzzlePieceUnderCursor(getMouseCoordsOnCanvas(event));
	if(grabbedPiece != null)
	{
		$("#moveCanvas").css("cursor","move");
		$("#moveCanvas").mousemove(mouseMoveOnCanvas);
		grabPuzzlePiece(grabbedPiece);
	}
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
	drawBackground();
	setShadowVariables(moveCanvas);

	moveCanvas.fillRect(puzzlePiece.xPos,puzzlePiece.yPos,puzzlePiece.width,puzzlePiece.height);
	moveCanvas.putImageData(puzzlePiece.pixels,puzzlePiece.xPos,puzzlePiece.yPos);

	var remove = currentPositions.splice(currentPositions.findIndex(isGrabbed),1);
	currentPositions.push(remove[0]);
}

function isGrabbed(element, index, array){
	if(element.grabbed)
		return true;
	else
		return false;
}

function setShadowVariables(canvas)
{
	canvas.shadowBlur=40;
	canvas.shadowColor = "black";
	canvas.shadowOffsetX = 20;
	canvas.shadowOffsetY = 20;
}

function mouseMoveOnCanvas(event)
{
	if(grabbedPiece != null)
		grabbedPiece.animate(getMouseCoordsOnCanvas(event));
	else
		$("#moveCanvas").css("cursor","default");
}

function mouseUpOnCanvas(event)
{
	$("#moveCanvas").css("cursor","default");
	$("#moveCanvas").unbind("mousemove");
	if(grabbedPiece != null)
	releasePuzzlePiece(getMouseCoordsOnCanvas(event));
	checkSolution();
}

function releasePuzzlePiece(coords)
{
	var distance;
	coords[0] -= grabbedPiece.width/2;
	coords[1] -= grabbedPiece.height/2;
	for(var i =0;i<correctCoordinates.length;i++)
	{
		distance = Math.hypot(coords[0]-correctCoordinates[i][0],coords[1]-correctCoordinates[i][1]);
		if(distance < 20)
		{
			coords[0] = correctCoordinates[i][0];
			coords[1] = correctCoordinates[i][1];
			break;
		}
	}
	grabbedPiece.xPos = coords[0];
	grabbedPiece.yPos = coords[1];
	grabbedPiece.grabbed = false;
	grabbedPiece = null;
	moveCanvas.clearRect(0,0,canvasWidth,canvasHeight);
	drawBackground();
}
function resetPiece(event)
{
	if(grabbedPiece != null)
	{
		releasePuzzlePiece(getMouseCoordsOnCanvas(event));
	}
}
function getMouseCoordsOnCanvas(event)
{
	var offset = $("#backgroundCanvas").offset();
	var x = event.pageX - offset.left;
	var y = event.pageY - offset.top;
	return [x, y];
}

function checkSolution()
{
	var correctPieces = 0;
	for(var i = 0;i<currentPositions.length;i++)
	{
		if(currentPositions[i].xPos == currentPositions[i].correctX &&
			currentPositions[i].yPos == currentPositions[i].correctY)
			correctPieces++;
	}
	if(correctPieces == NUM_COLS_PIECES*NUM_ROWS_PIECES)
		displayVictory();
}

function puzzlePiece(id, x, y, width, height, imageData){
	this.id = id;
	this.xPos = x;
	this.yPos = y;
	this.correctX = x;
	this.correctY = y;
	this.width = width;
	this.height = height;
	this.pixels = imageData;
	this.grabbed = false;
	this.animate = function(coords) {
		moveCanvas.clearRect(0,0,canvasWidth,canvasHeight);
		moveCanvas.fillRect(coords[0] - this.width/2 ,coords[1] - this.height/2 ,width,height);
		moveCanvas.putImageData(this.pixels, coords[0] - this.width/2, coords[1] - this.height/2);
		}
	this.draw = function(canvas){
		canvas.putImageData(this.pixels,this.xPos,this.yPos);
	}
}

function restart()
{
	location.reload()
}


function displayVictory()
{
	initVictoryScreen();
	$("#youWin").show();
	backgroundCanvas.clearRect(0,0,canvasWidth,canvasHeight);
	moveCanvas.clearRect(0,0,canvasWidth,canvasHeight);
	victoryScreen.draw();
	animateVictoryScreen();
	$("#giveUp").hide();
	$("#help").hide();
	$("#restart").show();
}

function initVictoryScreen()
{
	victoryScreen = {
	x:canvasWidth/2-puzzleImage.width/2,
	y:110,
	vx:5,
	vy:3,
	draw:function(){
		victoryCanvas.putImageData(puzzleImage,this.x,this.y);
	}
	};
}
function clearVictoryScreen()
{
	victoryCanvas.fillStyle = 'rgba(255,255,255,0.3)';
	victoryCanvas.fillRect(0,0,canvasWidth,canvasHeight);
}


function animateVictoryScreen()
{
	clearVictoryScreen();
	victoryScreen.draw();
	victoryScreen.x += victoryScreen.vx;
	victoryScreen.y += victoryScreen.vy;
	if( victoryScreen.x + victoryScreen.vx > canvasWidth-imageWidth ||
		victoryScreen.x + victoryScreen.vy < 0 )
			victoryScreen.vx = -victoryScreen.vx;

	if( victoryScreen.y + victoryScreen.vy > canvasHeight-imageHeight ||
		victoryScreen.y + victoryScreen.vy < 0)	
			victoryScreen.vy = -victoryScreen.vy;

	window.requestAnimationFrame(animateVictoryScreen);
}


function showConfirmGiveUp()
{
	$("#confirmGiveUp").show();
}

function showSolutionCanvas()
{
	if($("#hint").is(":hidden"))
		$("#hint").slideDown("slow");
	else
		$("#hint").slideUp();
}