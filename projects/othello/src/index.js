var canvas;
var ctx;
const board = Array.from({ length: 8 }, _ => Array(8).fill(1));
console.log("runningjavcas");
window.onload = () => {
    console.log("runningjavcas");
    canvas = document.getElementById("game-canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d");
    ctx.font = "100px Arial";
    ctx.fillText("Othello Game", 0, 0);
    console.log(board)
    const gameLoop = setInterval(update, 1000 / 30);
};



function update() {
    drawBoard(board, ctx);
}

function drawBoard(board, context) {
    const tileSides = 20;
    context.fillStyle = "rgba(255, 0, 0, 0.0)";

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (board[y][x] == 0) continue;

            context.fillStyle = board[y][x] == 1 ? 'white' : 'black';
            context.fillRect(x*tileSides, y*tileSides, tileSides, tileSides);

        }
    }

}


// window.onresize = () => {
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
// };