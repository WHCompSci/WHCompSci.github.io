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
let board;
console.log("runningjavcas");
window.onload = () => {
    board = Array.from({ length: 8 }, _ => Array(8).fill(0));
    board[3][3] = 2;
    board[3][4] = 1;
    board[4][3] = 1;
    board[4][4] = 2;
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
    if (!isLegal(gridX, gridY)) {
        return;
    }
    playingTurn(gridX, gridY);

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
let currentColor = 1;

let isBlack;
const dirs = [
    // TL[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]
    [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]
];
function isLegal(moveX, moveY) {
    turn++;
    currentColor = turn % 2 + 1
    let oppositeColor = currentColor==1 ? 2 : 1;
    //Mr. D code 
    // 
    //going through dirs array 
    console.log(moveX + ", " + moveY)
    console.log(currentColor, oppositeColor)
    for (const [dx, dy] of dirs) {
        //adding direction to current spot  
        let currentX = moveX + dx;
        let currentY = moveY + dy;
        console.log(currentX + ", " + currentY)
        //check if the current x and y pos is the oppisite color, if not then continue
        if (currentX > 7 || currentY > 7 || currentX < 0 || currentY < 0 || board[currentY][currentX] != oppositeColor) {
            console.log("ajacent tile is either off the board or not the oppisite color")
            console.log("This is the board state: "+board[currentY][currentX] )
            console.log(board)
            console.log("This is the oppisite color: "+oppositeColor)
            continue;
        }
        while (true) {
            currentX += dx;
            currentY += dy;
            // turn++;
            // currentColor = turn % 2 + 1;
            if (currentX > 7 || currentY > 7 || currentX < 0 || currentY < 0 || board[currentY][currentX] == 0) {
                console.log("Checked in a line and I went off the board or I hit an empty")
                break;
            }
            //check if off the board, if so break
            //check if we hit a same color peice, if so return true
            if (board[currentY][currentX] == currentColor) {
                console.log("Found my same color")
                return true;
            }

        }
    }
    turn--;
    return false;
}
function playingTurn(gridX, gridY) {

    board[gridX][gridY] = currentColor;

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