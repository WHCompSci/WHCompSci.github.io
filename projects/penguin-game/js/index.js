//starting variables
var canvas;
var ctx;

var upKey;
var rightKey;
var downKey;
var leftKey;

var resetCount = 0;

//Create game variables 
var gameLoop;
var player;


//runs on page load
window.onload = function(){
    canvas = document.getElementById("game-canvas");
    ctx = canvas.getContext("2d");


    setupInputs();

    player = new Player(600,600);
    enemy1 = new Enemy(2000,400,-10,0);
    

    
    
    gameLoop = setInterval(step, 1000/30)

    
}

function step(){
    resetCount ++;
    enemy1.step();
    player.step();
    if(resetCount === 20){
        ctx.clearRect(0,0,1920,1080);
        resetCount = 0;

    }
    draw();
}

function draw(){
    
    ctx.fillStyle = "blue";
    ctx.fillRect(0,0,1920,1080);

    ctx.fillStyle = "white";
    ctx.fillRect(460,40,1000,1000);
    
    enemy1.draw();
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