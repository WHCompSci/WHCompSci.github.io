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
window.onload = function () {
    canvas = document.getElementById("game-canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d");


    setupInputs();

    player = new Player(860, 380, canvas.width * 160/1920, canvas.height * 188/1080);
    enemy = new Enemy(0, 500, 1, 0);






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

    enemy.draw();
    player.draw();


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