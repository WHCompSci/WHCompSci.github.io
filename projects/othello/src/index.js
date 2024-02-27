// board constants 
const sideLen = 40;
const tileR = sideLen * .4;
const offSetX = window.innerWidth / 2 - 4 * sideLen;
const offSetY = window.innerHeight / 2 - 4 * sideLen;


const minX = offSetX - sideLen * 0.5;
const minY = offSetY - sideLen * 0.5;
const maxX = 7.52 * sideLen + offSetX;
const maxY = 7.51 * sideLen + offSetY;

var canvas;
var ctx;
let board = Array.from({ length: 8 }, _ => Array(8).fill(0));
console.log("runningjavcas");
window.onload = () => {
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
    playingTurn();
    if (isTrue) {
        board[gridX][gridY] = 2;
    }
    else {
        board[gridX][gridY] = 1;
    }
    // board[gridX][gridY] = 2;
    // for(let turn = 0; turn<64;turn++)
    // {
    //     if(turn%2==0)
    //     {
    //         board[gridX][gridY] = 2;
    //     }
    //     if(turn%2!==0)
    //     {
    //         board[gridX][gridY] = 1;
    //     }

    // }




});
let turn = 0;

let isTrue;
function playingTurn() {

    if (turn % 2 == 0) {
        isTrue = false;
    }
    else {
        isTrue = true;
    }
    turn++;
    console.log(turn);
    console.log(isTrue);

}

function update() {

    drawBoard(board, ctx);

}

function drawBoard(board, context) {
    context.fillStyle = "brown";
    context.fillRect(minX - sideLen / 4, minY - sideLen / 4, sideLen * 8 + sideLen / 2, sideLen * 8 + sideLen / 2);
    //.ctx.fillRect(minX-(sideLen/4),minY-(sideLen/4),(sideLen*8),(sidelen*8))


    context.fillStyle = "green";
    context.fillRect(minX, minY, sideLen * 8, sideLen * 8);

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {

            if (board[y][x] == 0) continue;

            context.fillStyle = board[y][x] == 1 ? "cornsilk" : "black";
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