//starting variables
var canvas;
var ctx;

var upKey;
var rightKey;
var downKey;
var leftKey;
var enterKey = true;

var resetCount = 0;

//Create game variables 
var gameLoop;
var player;


//runs on page load
window.onload = function () {
    canvas = document.getElementById("game-canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d");


    setupInputs();

    player = new Player((canvas.width/2)-(canvas.width * 160/1920), (canvas.height/2)-(canvas.height * 188/1080), (canvas.width * 160/1920)-20, (canvas.height * 188/1080)-10);
    enemy = new Enemy(0, 500, 10, 0);






    gameLoop = setInterval(step, 1000 / 30);


};

function step() {
    resetCount++;
    enemy.step();
    player.step();
    if (resetCount === 20) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        resetCount = 0;

    }
    draw();
}

function draw() {

    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    const sideLen = canvas.height * 0.8;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;



    ctx.fillRect(centerX - sideLen * 0.5, centerY - 0.5 * sideLen, sideLen, sideLen);

    ctx.fillStyle = "Black";
    ctx.font = "30px Arial";
    ctx.fillText("Score:",30,30);

    enemy.draw();
    player.draw();

    if(enterKey){
    ctx.fillStyle = "rgb(177, 216, 224)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "Black";
    ctx.font = "100px Arial";
    ctx.fillText("Penguin Game", (canvas.width/2)-500, canvas.height/2);
    ctx.font = "30px Arial";
    ctx.fillText("By: Nick Staada                    Press enter to start", (canvas.width/2)-500, (canvas.height/2)+100);
    }
}

function setupInputs() {
    document.addEventListener("keydown", function (event) {
        if (event.key === "w" || event.key === "ArrowUp") {
            upKey = true;
        } else if (event.key === "a" || event.key === "ArrowLeft") {
            leftKey = true;
        } else if (event.key === "s" || event.key === "ArrowDown") {
            downKey = true;
        } else if (event.key === "d" || event.key === "ArrowRight") {
            rightKey = true;
        }
        if (event.key === "Enter") {
            enterKey = false;
        }

    });

    document.addEventListener("keyup", function (event) {
        if (event.key === "w" || event.key === "ArrowUp") {
            upKey = false;
        } else if (event.key === "a" || event.key === "ArrowLeft") {
            leftKey = false;
        } else if (event.key === "s" || event.key === "ArrowDown") {
            downKey = false;
        } else if (event.key === "d" || event.key === "ArrowRight") {
            rightKey = false;
        }

    });
}