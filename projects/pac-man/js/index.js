//starting variables
var canvas;
var ctx;

//Create game variables 
var gameLoop;
var player;


//runs on page load
window.onload = function(){
    canvas = document.getElementById("game-canvas");
    ctx = canvas.getContext("2d");

    player = new Player(100,400);
    
    gameLoop = setInterval(step, 1000/30)

    ctx.fillStyle = "white";
    ctx.fillRect(0,0,1280,720);
}

function step(){
    console.log("step");
}