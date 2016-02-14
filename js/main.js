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
	
	var imageData = ctx.getImageData(0,0,510,510);
	ctx.putImageData( addGrid(imageData) ,0,0);

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
function addGrid(imageData)
{
	for(var i = 102; i < imageData.data.length; i += 102)
	{	
			imageData.data[getRedValueIndex(510,i,11)] = 0;
			
			for(var j = 12; j < 510; j++)
			{
				imageData.data[getRedValueIndex(510,j,i)] = 0;
			}
	}
	return imageData;
	
}
