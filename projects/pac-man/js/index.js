//starting variables
var canvas;
var ctx;

var upKey;
var rightKey;
var downKey;
var leftKey;

//Create game variables 
var gameLoop;
var player;


//runs on page load
window.onload = function(){
    canvas = document.getElementById("game-canvas");
    ctx = canvas.getContext("2d");


    setupInputs();

    player = new Player(100,400);
    
    gameLoop = setInterval(step, 1000/30)

    ctx.fillStyle = "white";
    ctx.fillRect(0,0,1280,720);
}

function step(){
    player.step();
    draw();
}

function draw(){
    ctx.fillStyle = "blue";
    ctx.fillRect(0,0,1920,1080);

    ctx.fillStyle = "white";
    ctx.fillRect(460,40,1000,1000);
    
    player.draw();

}

function setupInputs(){
    document.addEventListener("keydown", function(event){
        if (event.key === "w" || event.key === "ArrowUp"){
            upKey = true;
        } else if (event.key === "a" || event.key === "ArrowLeft"){
            leftKey = true;
        }else if (event.key === "s" || event.key === "ArrowDown"){
            downKey = true;
        }else if (event.key === "d" || event.key === "ArrowRight"){
            rightKey = true;
        }
        
    });
    document.addEventListener("keyup", function(event){
        if (event.key === "w" || event.key === "ArrowUp"){
            upKey = false;
        } else if (event.key === "a" || event.key === "ArrowLeft"){
            leftKey = false;
        }else if (event.key === "s" || event.key === "ArrowDown"){
            downKey = false;
        }else if (event.key === "d" || event.key === "ArrowRight"){
            rightKey = false;
        }
        
    });
}