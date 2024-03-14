// board constants 
const sideLen = 60;
const BOARD_SIZE = 5;
const tileR = sideLen * .4;
const offSetX = window.innerWidth / 2 - BOARD_SIZE * sideLen * 0.5;
const offSetY = window.innerHeight / 2 - BOARD_SIZE * sideLen * 0.5;


const minX = offSetX - sideLen * 0.5;
const minY = offSetY - sideLen * 0.5;
const maxX = (BOARD_SIZE - 0.5) * sideLen + offSetX;
const maxY = (BOARD_SIZE - 0.5)* sideLen + offSetY;

var canvas;
var ctx;

let board = Array.from({ length: BOARD_SIZE }, _ => Array(BOARD_SIZE).fill(0));
console.log("runningjavcas");
window.onload = () => {
    for(let i = 0; i < 10; i++) {
        const x = Math.floor(Math.random() * BOARD_SIZE)
        const y = Math.floor(Math.random() * BOARD_SIZE)
        doTurn(x,y)
    }
    console.log("runningjavcas");
    canvas = document.getElementById("game-canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d");
    console.log(ctx);
    // ctx.font = "100px Arial";
    // ctx.fillText("Othello Game", 0, 0);
    console.log(board);
    const gameLoop = setInterval(update, 1000 / 30);
};

addEventListener("click", (ev) => {
    const x = ev.clientX;
    const y = ev.clientY;
    if (x < minX || y < minY || x > maxX || y > maxY) {
        return;
    }
    console.log("inside");

    const gridY = Math.floor((x - minX) / sideLen);
    const gridX = Math.floor((y - minY) / sideLen);
    console.log(gridX);
    console.log(gridY);
    doTurn(gridX, gridY);

    
    
});

let turn = 0;
function doTurn(gridX, gridY) {
    board[gridX][gridY] = ~board[gridX][gridY];
    if(gridX > 0) board[gridX - 1][gridY] = ~board[gridX - 1][gridY];
    if(gridY > 0) board[gridX][gridY - 1] = ~board[gridX][gridY - 1];
    if(gridX < BOARD_SIZE - 1) board[gridX + 1][gridY] = ~board[gridX + 1][gridY];
    if(gridY < BOARD_SIZE - 1) board[gridX][gridY + 1] = ~board[gridX][gridY + 1];
}

function update() {
    drawBoard(board, ctx);
}

function drawBoard(board, context) {
    context.fillStyle = "cornflowerblue";
    context.fillRect(minX - sideLen / 4, minY - sideLen / 4, sideLen * BOARD_SIZE + sideLen / 2, sideLen * BOARD_SIZE + sideLen / 2);
    context.fillStyle = "cornsilk";
    context.fillRect(minX, minY, sideLen * BOARD_SIZE, sideLen * BOARD_SIZE);
    context.fillStyle = "cornflowerblue"
    context.strokeStyle = "black"
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {

            if (board[y][x] == 0) continue;

            // context.fillStyle = board[y][x] == 1 ? "cornsilk" : "black";
            drawCircle(context, x * sideLen + offSetX, y * sideLen + offSetY, tileR);

        }
    }

    for (let x = minX; x < maxX; x += sideLen) {
        drawLine(context, x, minY, x, maxY);
    }
    for (let y = minY; y < maxY; y += sideLen) {
        drawLine(context, minX, y, maxX, y);
    }
}

function drawCircle(ctx, x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.stroke();
}
function drawLine(ctx, x1, y1, x2, y2) {
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
// window.onresize = () => {
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
// };